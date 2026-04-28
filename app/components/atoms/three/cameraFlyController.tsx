import countriesCoords from '@/app/data/country-codes-lat-long-alpha3.json'
import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { EARTH_RADIUS, SUN_RADIUS } from '@/app/constants/numbers'
import { gsap } from 'gsap'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { Astre } from '@/app/types/astre'
import { useSolarSystem } from '@/app/components/atoms/three/solarSystem/solarSystem.model'
import { latLongToVector3 } from '@/lib/geo/latLongToVector3'

let activeSphericalFlyTween: gsap.core.Tween | null = null
let activePlaneTargetTween: gsap.core.Tween | null = null
let activePlaneCameraTween: gsap.core.Tween | null = null

const MIN_SPHERICAL_PHI = 1e-4
const MAX_SPHERICAL_PHI = Math.PI - 1e-4
const MIN_ZOOM_MULTIPLIER = 0.05
const MAX_ZOOM_MULTIPLIER = 2

interface FlyToCoordinatesOptions {
   zoomMultiplier?: number
}

function getShortestThetaTarget(currentTheta: number, targetTheta: number): number {
   const delta = Math.atan2(
      Math.sin(targetTheta - currentTheta),
      Math.cos(targetTheta - currentTheta),
   )

   return currentTheta + delta
}

function killActiveFlyTweens(): void {
   if (activeSphericalFlyTween != null) {
      activeSphericalFlyTween.kill()
      activeSphericalFlyTween = null
   }

   if (activePlaneTargetTween != null) {
      activePlaneTargetTween.kill()
      activePlaneTargetTween = null
   }

   if (activePlaneCameraTween != null) {
      activePlaneCameraTween.kill()
      activePlaneCameraTween = null
   }
}

export function CameraFlyController() {
   const { displayedSceneData } = useScenes()
   const { trueSize } = useSolarSystem()

   /**
    * Used to fly the camera to a given country position.
    * Return false if the country has not been found.
    * @param countryName
    */
   const flyToCountryPos = (countryName: string): boolean => {
      if (!countryName) return false

      for (const country of countriesCoords.ref_country_codes) {
         if (country.country.toUpperCase() === countryName.toUpperCase()) {
            flyToCoordinates(country.latitude, country.longitude)
            return true
         }
      }

      return false
   }

   /**
    *
    * @param latitude
    * @param longitude
    * @param options
    */
   const flyToCoordinates = (
      latitude: number,
      longitude: number,
      options?: FlyToCoordinatesOptions,
   ): void => {
      if (displayedSceneData == null) return

      killActiveFlyTweens()

      const zoomMultiplier = THREE.MathUtils.clamp(
         options?.zoomMultiplier ?? 1,
         MIN_ZOOM_MULTIPLIER,
         MAX_ZOOM_MULTIPLIER,
      )

      let targetPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

      // Get current spherical coordinates of the camera relative to the target.
      const target: THREE.Vector3 = displayedSceneData.controls.target
      const currentPosition: THREE.Vector3 = new THREE.Vector3()
      currentPosition.copy(displayedSceneData.camera.position).sub(target)

      if (displayedSceneData.type == SceneType.SPHERICAL) {
         targetPosition = latLongToVector3(
            latitude as number,
            longitude as number,
         )

         const sphericalCurrent: THREE.Spherical = new THREE.Spherical().setFromVector3(
            currentPosition,
         )

         const sphericalTarget: THREE.Spherical = new THREE.Spherical().setFromVector3(
            targetPosition.clone().sub(target),
         )

         const targetTheta = getShortestThetaTarget(
            sphericalCurrent.theta,
            sphericalTarget.theta,
         )

         const targetPhi = THREE.MathUtils.clamp(
            sphericalTarget.phi,
            MIN_SPHERICAL_PHI,
            MAX_SPHERICAL_PHI,
         )

         // Set a target zoom.
         const targetZoom: number = EARTH_RADIUS * 1.2 * zoomMultiplier

         // Use GSAP to animate the spherical coordinates.
         activeSphericalFlyTween = gsap.to(sphericalCurrent, {
            duration: 2,
            theta: targetTheta,
            phi: targetPhi,
            radius: targetZoom,
            onUpdate: (): void => {
               // Update camera position based on new spherical coordinates.
               const newPosition: THREE.Vector3 = new THREE.Vector3()
                  .setFromSpherical(sphericalCurrent)
                  .add(target)
               displayedSceneData.camera.position.copy(newPosition)
               displayedSceneData.camera.lookAt(target)
               displayedSceneData.controls.update()
            },
            onComplete: (): void => {
               activeSphericalFlyTween = null
            },
            ease: 'power2.inOut',
         })

      } else if (displayedSceneData.type == SceneType.PLANE) {
         const worldPos: THREE.Vector2 = ThreeGeoUnitsUtils.datumsToSpherical(
            latitude as number,
            longitude as number,
         )

         const nextTargetPosition = new THREE.Vector3(
            worldPos.x,
            0,
            -worldPos.y,
         )

         const currentCameraOffset = displayedSceneData.camera.position
            .clone()
            .sub(displayedSceneData.controls.target)

         if (currentCameraOffset.lengthSq() === 0) {
            currentCameraOffset.set(
               0,
               displayedSceneData.controls.getDistance() * 0.2 * zoomMultiplier,
               0,
            )
         }

         currentCameraOffset.multiplyScalar(zoomMultiplier)

         const nextCameraPosition = nextTargetPosition
            .clone()
            .add(currentCameraOffset)

         // GSAP animation to zoom the camera.
         activePlaneTargetTween = gsap.to(displayedSceneData.controls.target, {
            duration: 2,
            x: nextTargetPosition.x,
            y: nextTargetPosition.y,
            z: nextTargetPosition.z,
            ease: 'power2.inOut',
            onComplete: (): void => {
               activePlaneTargetTween = null
               displayedSceneData.controls.update()
            },
         })

         // GSAP animation to move the camera.
         activePlaneCameraTween = gsap.to(displayedSceneData.camera.position, {
            duration: 2,
            x: nextCameraPosition.x,
            y: nextCameraPosition.y,
            z: nextCameraPosition.z,
            ease: 'power2.inOut',
            onComplete: (): void => {
               activePlaneCameraTween = null
               displayedSceneData.controls.update()
            },
         })
      }
   }

   /**
    *
    * @param astre
    */
   const flyToAstre = (astre: Astre): void => {
      if (!displayedSceneData || displayedSceneData.type != SceneType.SOLAR_SYSTEM) return

      if (astre) {
         const astreMesh = astre.astreMesh
         if (astreMesh) {

            // GSAP animation to zoom the camera.
            gsap.to(displayedSceneData.controls.target, {
               duration: 2,
               x: astreMesh.position.x,
               y: astreMesh.position.y,
               z: astreMesh.position.z,
               ease: 'power2.inOut',
               onComplete: (): void => {
                  displayedSceneData.controls.update()
               },
            })

            const distance: number = (trueSize ? astre.radius : SUN_RADIUS) * 4

            // GSAP animation to move the camera.
            gsap.to(displayedSceneData.camera.position, {
               duration: 2,
               x: astreMesh.position.x - distance,
               y: astreMesh.position.y - distance,
               z: astreMesh.position.z - distance,
               ease: 'power2.inOut',
               onComplete: (): void => {
                  displayedSceneData.controls.update()
               },
            })
         }
      }
   }

   const flyToOppositeCoordinates = (lat: number, lon: number): void => {
      const { latitude, longitude } = findAntipode(lat, lon)
      flyToCoordinates(latitude, longitude)
   }

   function findAntipode(lat: number, lon: number): { latitude: number, longitude: number } {
      const antipodeLat: number = -lat

      // Shift the longitude by 180° and normalize to -180 to 180 range.
      let antipodeLon: number = lon + 180
      if (antipodeLon > 180) {
         antipodeLon -= 360
      }

      return { latitude: antipodeLat, longitude: antipodeLon }
   }

   return {
      flyToCoordinates,
      flyToCountryPos,
      flyToAstre,
      flyToOppositeCoordinates,
   }
}
