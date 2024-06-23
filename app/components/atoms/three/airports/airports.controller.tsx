'use client'
import * as THREE from 'three'
import { useEffect } from 'react'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import layers from '../../../../data/Airports.json'
import { AIRPORT_SCALE, ZOOM_THRESHOLD } from '@/app/constants/numbers'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { AIRPORT_MATERIAL } from '@/app/constants/materials'
import { useAirports } from '@/app/components/atoms/three/airports/airports.model'

export function Airports(): null {
   const { displayedSceneData } = useScenes()
   const { displayedAirportsGroup } = useAirports()

   /**
    * Create group of airports.
    */
   const addAirports = (): void => {
      // Clear previous planes.
      displayedAirportsGroup.clear()

      if (
         !displayedAirportsGroup ||
         displayedSceneData?.camera == null ||
         !displayedSceneData?.controls == null
      )
         return

      if (displayedSceneData.controls.getDistance() <= ZOOM_THRESHOLD) {
         // @ts-ignore
         // Filter airports within the defined coordinates area.
         const filteredAirports = layers.layers[0].featureSet.features.filter(
            (airportData: any): boolean => {
               const lat = airportData.attributes.latitude_deg
               const lon = airportData.attributes.longitude_deg

               if (lat == null || lon == null) return false
               if (Math.random() < 0.9) return false // TODO DELETE CONDITION

               return true /* TODO Use distance to camera like used for vessels. (
                  lat <= sphereVisibleZone.topLatLon.lat &&
                  lat >= sphereVisibleZone.bottomLatLon.lat &&
                  lon <= sphereVisibleZone.rightLatLon.lon &&
                  lon >= sphereVisibleZone.leftLatLon.lon
               )*/
            },
         )

         filteredAirports.forEach((airportData: any): void => {
            const lon = airportData.attributes.latitude_deg
            const lat = airportData.attributes.longitude_deg

            if (lat == null || lon == null) return

            const position: THREE.Vector3 = latLongToVector3(
               lon as number,
               lat as number,
            )
            addAirport(position, airportData)
         })
      }
   }

   /**
    *
    * @param position
    * @param airportData
    */
   const addAirport = (position: THREE.Vector3, airportData: any) => {
      if (
         !displayedAirportsGroup ||
         !displayedSceneData?.scene ||
         !displayedSceneData?.camera
      )
         return

      // TODO Replace with model.
      // Create airport.
      const airport = new THREE.Mesh(
         new THREE.SphereGeometry(1, 16, 16),
         AIRPORT_MATERIAL,
      )

      airport.position.copy(position)
      airport.scale.set(AIRPORT_SCALE, AIRPORT_SCALE, AIRPORT_SCALE)
      if (airportData && airportData.attributes)
         airport.userData = { data: airportData.attributes }
      displayedAirportsGroup.add(airport)
   }

   /**
    *
    */
   const handleCameraMove = (): void => {
      addAirports()

      displayedSceneData?.scene?.add(displayedAirportsGroup)
   }

   /**
    *
    */
   const cleanup = (): void => {
      displayedSceneData?.controls?.removeEventListener(
         'change',
         handleCameraMove,
      )
   }

   useEffect(() => {
      displayedSceneData?.controls?.addEventListener('change', handleCameraMove)

      // Clean up the event listener.
      return cleanup
   }, [displayedSceneData])

   return null
}
