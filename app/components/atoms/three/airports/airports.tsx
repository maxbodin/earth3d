'use client'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import layers from '../../../../data/Airports.json'
import { AIRPORT_SCALE, ZOOM_THRESHOLD } from '@/app/constants/numbers'
import { ObjectType } from '@/app/components/enums/objectType'
import { useData } from '@/app/context/dataContext'
import { useVisibleZone } from '@/app/components/atoms/three/visibleZone/model'
import { useScenes } from '@/app/context/scenesContext'
import { AIRPORT_MATERIAL } from '@/app/constants/materials'

export function Airports(): null {
   const { displayedSceneData } = useScenes()
   const { sphereVisibleZone } = useVisibleZone()
   const airportsGroup = useRef<THREE.Group>(new THREE.Group())

   // Create group of airports.
   const addAirports = (): void => {
      // Clear previous planes.
      airportsGroup.current.clear()

      if (
         !airportsGroup.current ||
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

               return (
                  lat <= sphereVisibleZone.topLatLon.lat &&
                  lat >= sphereVisibleZone.bottomLatLon.lat &&
                  lon <= sphereVisibleZone.rightLatLon.lon &&
                  lon >= sphereVisibleZone.leftLatLon.lon
               )
            }
         )

         filteredAirports.forEach((airportData: any): void => {
            const lon = airportData.attributes.latitude_deg
            const lat = airportData.attributes.longitude_deg

            if (lat == null || lon == null) return

            const position: THREE.Vector3 = latLongToVector3(
               lon as number,
               lat as number
            )
            addAirport(position, airportData)
         })
      }
   }

   const addAirport = (position: THREE.Vector3, airportData: any) => {
      if (
         !airportsGroup.current ||
         !displayedSceneData?.scene ||
         !displayedSceneData?.camera
      )
         return

      // TODO Replace with model.
      // Create airport.
      const airport = new THREE.Mesh(
         new THREE.SphereGeometry(1, 16, 16),
         AIRPORT_MATERIAL
      )

      airport.position.copy(position)
      airport.scale.set(AIRPORT_SCALE, AIRPORT_SCALE, AIRPORT_SCALE)
      if (airportData && airportData.attributes)
         airport.userData = { data: airportData.attributes }
      airportsGroup.current!.add(airport)
   }

   // Function to handle click events.
   const selectedAirport =
      useRef<THREE.Object3D<THREE.Object3DEventMap> | null>(null)

   const { setSelectedObjectType, setSelectedObjectData } = useData()

   const onMouseClick = (event: { clientX: number; clientY: number }): void => {
      if (displayedSceneData?.camera == null || !airportsGroup.current) return

      const raycaster: THREE.Raycaster = new THREE.Raycaster()
      const mouse: THREE.Vector2 = new THREE.Vector2()

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, displayedSceneData.camera)

      const intersects = raycaster.intersectObjects(
         airportsGroup.current!.children
      )

      if (intersects.length > 0) {
         selectedAirport.current = intersects[0].object

         setSelectedObjectData(intersects[0].object.userData)
         setSelectedObjectType(ObjectType.AIRPORT)
      }
   }

   const handleCameraMove = (): void => {
      addAirports()
      displayedSceneData?.scene?.add(airportsGroup.current)
   }

   const cleanup = (): void => {
      window.removeEventListener('click', onMouseClick)
      displayedSceneData?.controls?.removeEventListener(
         'change',
         handleCameraMove
      )
   }

   useEffect(() => {
      // Add event listener to detect clicks on the window.
      window.addEventListener('click', onMouseClick)
      displayedSceneData?.controls?.addEventListener('change', handleCameraMove)

      // Clean up the event listener.
      return cleanup
   }, [displayedSceneData, sphereVisibleZone])

   return null
}
