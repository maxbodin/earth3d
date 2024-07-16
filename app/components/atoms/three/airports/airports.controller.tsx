'use client'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import layers from '../../../../data/Airports.json'
import {
   AIRPORT_SCALE,
   PLANE_MIN_ALLOWED_AIRPORT_DISTANCE_TO_CAMERA,
   PLANE_SCENE_AIRPORT_MAX_SCALE,
   PLANE_SCENE_AIRPORT_MIN_SCALE,
} from '@/app/constants/numbers'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { AIRPORT_MATERIAL } from '@/app/constants/materials'
import { useAirports } from '@/app/components/atoms/three/airports/airports.model'
import { SceneType } from '@/app/enums/sceneType'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { AIRPORT_RENDER_ORDER } from '@/app/constants/renderOrder'
import { removeObject3D } from '@/app/helpers/threeHelper'
import { clamp } from '@/app/helpers/numberHelper'
import { debounce } from 'lodash'

export function AirportsController(): null {
   const { displayedSceneData } = useScenes()
   const { displayedAirportsGroup, setDisplayedAirportsGroup } = useAirports()

   const visibleAirports = useRef<any[]>([])

   /**
    * Process airports to display only visible airports.
    */
   const processAirports = (): void => {
      // Clear previous planes.
      displayedAirportsGroup.forEach((airportMesh: THREE.Mesh): void => {
         removeObject3D(airportMesh, displayedSceneData.scene)
      })
      displayedAirportsGroup.clear()

      if (
         !displayedAirportsGroup ||
         displayedSceneData?.camera == null ||
         !displayedSceneData?.controls == null
      )
         return

      const maxDistForAirportVisible: number = clamp(PLANE_MIN_ALLOWED_AIRPORT_DISTANCE_TO_CAMERA * (cameraDistanceToPlanetCenter.current / 20), 1e3, 3e5)

      // @ts-ignore
      // Remove airports that are out of visible zone.
      visibleAirports.current = layers.layers[0].featureSet.features.filter((airportData: any): boolean => {
         const lat = airportData.attributes.latitude_deg
         const lon = airportData.attributes.longitude_deg

         if (lat == null || lon == null) {
            return false
         }

         if (displayedSceneData.type == SceneType.PLANE) {
            const worldPos: THREE.Vector2 =
               ThreeGeoUnitsUtils.datumsToSpherical(
                  lat as number,
                  lon as number,
               )
            airportData.planePosition = new THREE.Vector3(
               worldPos.x,
               0,
               -worldPos.y,
            )

            const distanceToCamera: number =
               displayedSceneData.camera.position.distanceTo(
                  airportData.planePosition,
               )

            return (
               distanceToCamera <= maxDistForAirportVisible
            )
         } else {
            return false
         }
      })

      displayAirports(visibleAirports.current)
   }


   /**
    * Display airports.
    *
    * @param airports
    */
   const displayAirports = (airports: any[]): void => {
      if (airports.length > 300) {
         airports.splice(0, airports.length - 300)
      }

      airports.forEach((airportData: any): void => {
         // TODO Replace with airport model. / Use GPU Instancing.
         const airportMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1, 4, 4, 4),
            AIRPORT_MATERIAL,
         )

         airportMesh.scale.set(AIRPORT_SCALE, AIRPORT_SCALE, AIRPORT_SCALE)

         if (airportData && airportData.attributes) {
            airportMesh.userData = { data: airportData.attributes }
         }

         if (displayedSceneData.type == SceneType.PLANE) {
            airportMesh.position.copy(airportData.planePosition)
            airportMesh.scale.set(
               globeAirportAdjustedScale.current,
               globeAirportAdjustedScale.current * 4,
               globeAirportAdjustedScale.current,
            )
         }

         airportMesh.renderOrder = AIRPORT_RENDER_ORDER
         airportMesh.userData = { data: airportData }

         displayedAirportsGroup.add(airportMesh)

         if (displayedSceneData.scene) {
            displayedSceneData.scene.add(airportMesh)
         }
      })
   }

   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const globeAirportAdjustedScale = useRef<number>(PLANE_SCENE_AIRPORT_MAX_SCALE)

   /**
    * Update airports when camera move.
    */
   const handleCameraMove = (): void => {
      cameraDistanceToPlanetCenter.current =
         displayedSceneData.controls.getDistance()

      globeAirportAdjustedScale.current = clamp(
         cameraDistanceToPlanetCenter.current / 10,
         PLANE_SCENE_AIRPORT_MIN_SCALE,
         PLANE_SCENE_AIRPORT_MAX_SCALE,
      )

      processAirports()
   }

   /**
    * Debounce the handleCameraMove function to limit how often it can be called.
    */
   const debouncedHandleCameraMove = debounce(handleCameraMove, 2)

   /**
    * Remove event listener.
    */
   const cleanup = (): void => {
      displayedSceneData?.controls?.removeEventListener('change', debouncedHandleCameraMove)
   }

   useEffect(() => {
      displayedSceneData?.controls?.addEventListener('change', debouncedHandleCameraMove)

      // Clean up the event listener.
      return cleanup
   }, [displayedSceneData])

   return null
}
