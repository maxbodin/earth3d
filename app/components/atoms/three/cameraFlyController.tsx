import countriesCoords from '@/app/data/country-codes-lat-long-alpha3.json'
import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { EARTH_RADIUS } from '@/app/constants/numbers'
import { gsap } from 'gsap'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'

export function CameraFlyController() {
   const { displayedSceneData } = useScenes()

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
    */
   const flyToCoordinates = (latitude: number, longitude: number): void => {
      let targetPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

      if (displayedSceneData.type == SceneType.SPHERICAL) {
         targetPosition = latLongToVector3(
            latitude as number,
            longitude as number,
         )
      } else if (displayedSceneData.type == SceneType.PLANE) {
         const worldPos: THREE.Vector2 = ThreeGeoUnitsUtils.datumsToSpherical(
            latitude as number,
            longitude as number,
         )
         targetPosition = new THREE.Vector3(worldPos.x, 0, -worldPos.y)
      }

      // Get current spherical coordinates of the camera relative to the target.
      const target: THREE.Vector3 = displayedSceneData.controls.target
      const currentPosition: THREE.Vector3 = new THREE.Vector3()
      currentPosition.copy(displayedSceneData.camera.position).sub(target)

      const sphericalCurrent: THREE.Spherical = new THREE.Spherical().setFromVector3(
         currentPosition,
      )
      const sphericalTarget: THREE.Spherical = new THREE.Spherical().setFromVector3(
         targetPosition.clone().sub(target),
      )

      // Set a target zoom.
      const targetZoom: number = EARTH_RADIUS * 1.2

      // Use GSAP to animate the spherical coordinates.
      gsap.to(sphericalCurrent, {
         duration: 2,
         theta: sphericalTarget.theta,
         phi: sphericalTarget.phi,
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
         ease: 'power2.inOut',
      })
   }


   return {
      flyToCoordinates,
      flyToCountryPos,
   }
}
