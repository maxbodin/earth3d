import * as THREE from 'three'
import { Group, Object3D, Object3DEventMap, Scene, Vector3 } from 'three'
import React, { useEffect, useRef } from 'react'
import { usePlanet } from '@/app/context/planetContext'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { latLongToVector3, vector3ToLatLong } from '@/app/helpers/latLongHelper'

import layers from '../../../data/Airports.json'
import { planetRadius } from '@/app/constants'
import { ObjectType } from '@/app/components/atoms/objectType'
import { useData } from '@/app/context/dataContext'

export function Airports({
   scene,
   camera,
   controls,
}: {
   scene: Scene | null
   camera: THREE.PerspectiveCamera | null
   controls: OrbitControls | null
}) {
   const { planet } = usePlanet()
   const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x00bfff })
   const airportScale = 0.003
   const airportsGroup = useRef<Group | null>(new THREE.Group())

   const zoomThreshold: number = 6.7

   // Create group of airports.
   const addAirports = async () => {
      if (!airportsGroup.current || !scene || !planet || !camera) return

      // Clear previous planes.
      airportsGroup.current.clear()

      if (controls && controls.getDistance() <= zoomThreshold) {
         // Get the corners of the window in screen coordinates.
         const topLeftScreen = new THREE.Vector3(-1, 1, 0) // Top-left corner
         const topRightScreen = new THREE.Vector3(1, 1, 0) // Top-right corner
         const bottomLeftScreen = new THREE.Vector3(-1, -1, 0) // Bottom-left corner
         const bottomRightScreen = new THREE.Vector3(1, -1, 0) // Bottom-right corner

         // Convert screen coordinates to world coordinates.
         const topLeftWorld = new THREE.Vector3()
         const topRightWorld = new THREE.Vector3()
         const bottomLeftWorld = new THREE.Vector3()
         const bottomRightWorld = new THREE.Vector3()

         camera.updateMatrixWorld()
         topLeftWorld.copy(topLeftScreen).unproject(camera)
         topRightWorld.copy(topRightScreen).unproject(camera)
         bottomLeftWorld.copy(bottomLeftScreen).unproject(camera)
         bottomRightWorld.copy(bottomRightScreen).unproject(camera)

         // Normalize world coordinates to get direction vectors from the center of the sphere.
         topLeftWorld.normalize()
         topRightWorld.normalize()
         bottomLeftWorld.normalize()
         bottomRightWorld.normalize()

         // Scale direction vectors by the radius of the sphere to get coordinates on the sphere's surface.
         const topLeftSphere = topLeftWorld.multiplyScalar(planetRadius)
         const topRightSphere = topRightWorld.multiplyScalar(planetRadius)
         const bottomLeftSphere = bottomLeftWorld.multiplyScalar(planetRadius)
         const bottomRightSphere = bottomRightWorld.multiplyScalar(planetRadius)

         const topLeftLatLon = vector3ToLatLong(topLeftSphere)
         const topRightLatLon = vector3ToLatLong(topRightSphere)
         const bottomLeftLatLon = vector3ToLatLong(bottomLeftSphere)
         const bottomRightLatLon = vector3ToLatLong(bottomRightSphere)

         const hZoneFactor: number =
            window.innerHeight / (1 + controls.getDistance()) / 100
         const wZoneFactor: number =
            window.innerWidth / (1 + controls.getDistance()) / 100

         if (hZoneFactor == null || wZoneFactor == null) return

         // @ts-ignore
         // Filter airports within the defined coordinates area.
         const filteredAirports = layers.layers[0].featureSet.features.filter(
            (airportData: any) => {
               const lat = airportData.attributes.latitude_deg
               const lon = airportData.attributes.longitude_deg

               if (lat == null || lon == null) return false

               return (
                  lat - hZoneFactor <= topLeftLatLon.lat &&
                  lat + hZoneFactor >= bottomLeftLatLon.lat &&
                  lon - wZoneFactor <= topRightLatLon.lon &&
                  lon + wZoneFactor >= bottomRightLatLon.lon
               )
            }
         )

         filteredAirports.forEach((airportData: any): void => {
            const lon = airportData.attributes.latitude_deg
            const lat = airportData.attributes.longitude_deg

            if (lat == null || lon == null) return

            const position: Vector3 = latLongToVector3(
               lon as number,
               lat as number
            )
            addAirport(position, airportData)
         })
      }
   }

   const addAirport = (position: Vector3, airportData: any) => {
      if (!airportsGroup.current || !scene || !planet || !camera) return

      // Create airport.
      const airport = new THREE.Mesh(
         new THREE.SphereGeometry(1, 16, 16),
         blueMaterial
      )
      airport.position.copy(position)
      airport.scale.set(airportScale, airportScale, airportScale)
      if (airportData && airportData.attributes)
         airport.userData = { data: airportData.attributes }
      airportsGroup.current!.add(airport)
   }

   // Function to handle click events.
   const selectedAirport = useRef<Object3D<Object3DEventMap> | null>(null)

   const { setSelectedObjectType, setSelectedObjectData } = useData()

   const onMouseClick = (event: { clientX: number; clientY: number }): void => {
      if (camera == null || !airportsGroup.current) return

      // Create a raycaster.
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects(
         airportsGroup.current!.children
      )

      if (intersects.length > 0) {
         selectedAirport.current = intersects[0].object

         setSelectedObjectData(intersects[0].object.userData)
         setSelectedObjectType(ObjectType.AIRPORT)
      }
   }

   const handleCameraMove = () => {
      addAirports()

      planet.add(airportsGroup.current)
      scene?.add(planet)
   }

   const cleanup = (): void => {
      window.removeEventListener('click', onMouseClick)
      controls?.removeEventListener('change', handleCameraMove)
   }

   useEffect(() => {
      // Add event listener to detect clicks on the window.
      window.addEventListener('click', onMouseClick)
      controls?.addEventListener('change', handleCameraMove)

      // Clean up the event listener.
      return cleanup
   }, [camera])

   return <></>
}
