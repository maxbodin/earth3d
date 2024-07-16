'use client'
import { useEffect, useRef, useState } from 'react'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import * as THREE from 'three'

import { clamp } from '@/app/helpers/numberHelper'
import {
   GLOBE_SCENE_PUCK_MAX_SCALE,
   GLOBE_SCENE_PUCK_MIN_SCALE,
   PLANE_SCENE_PUCK_MAX_SCALE,
   PLANE_SCENE_PUCK_MIN_SCALE,
} from '@/app/constants/numbers'
import { MarkersDashboardController } from '@/app/components/organisms/markersDashboard/markersDashboard.controller'
import { PUCK_COLOR } from '@/app/constants/colors'

export const Geolocation = (): null => {
   const [location, setLocation] = useState<GeolocationPosition>()
   const [error, setError] = useState<string>()
   const { displayedSceneData } = useScenes()

   const {
      updatePuckMarker,
   } = MarkersDashboardController()

   /**
    *
    * @param position
    */
   const successCallback = (position: GeolocationPosition): void => {
      setLocation(position)
   }

   /**
    *
    * @param error
    */
   const errorCallback = (error: any): void => {
      switch (error.code) {
         case error.PERMISSION_DENIED:
            setError('User denied the request for Geolocation.')
            break
         case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
         case error.TIMEOUT:
            setError('The request to get user location timed out.')
            break
         default:
            setError('An unknown error occurred.')
            break
      }
   }

   useEffect(() => {
      if (!navigator.geolocation) {
         setError('Geolocation is not supported by your browser.')
         return
      }

      navigator.geolocation.getCurrentPosition(successCallback, errorCallback)

      const watchId: number = navigator.geolocation.watchPosition(
         successCallback,
         errorCallback,
         {
            enableHighAccuracy: true, // Use high accuracy if available.
            maximumAge: 10000, // Reuse position if last fetched within this time (ms)
            timeout: 5000, // Time out after this time (ms)
         },
      )

      // Clean up the watcher on component unmount.
      return (): void => {
         navigator.geolocation.clearWatch(watchId)
      }
   }, [])

   useEffect(() => {
      if (location) {
         const { latitude, longitude } = location.coords
         updatePuckPosition(latitude, longitude)
      }

      // Event listener on controls change.
      displayedSceneData?.controls?.addEventListener('change', onControlsChange)

      return cleanup
   }, [location, displayedSceneData])

   const puckMesh = useRef<THREE.Mesh>(new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 5, 4),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(parseInt(PUCK_COLOR.replace('#', '0x'), 16)) }),
   ))

   /**
    *
    * @param latitude
    * @param longitude
    */
   const updatePuckPosition = (latitude: number, longitude: number): void => {
      if (displayedSceneData.type == SceneType.SPHERICAL) {
         // Get the position on the planet.
         const puckPosition: THREE.Vector3 = latLongToVector3(latitude, longitude)

         // Calculate the normal at the puck's position (normalized position vector).
         const normal: THREE.Vector3 = puckPosition.clone().normalize()

         // Move the puck so its base is on the surface of the sphere.
         puckMesh.current.position.copy(
            puckPosition.add(normal.clone().multiplyScalar(1 / 2)),
         )

         // Align the puck's axis with the normal.
         puckMesh.current.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            normal,
         )
      } else if (displayedSceneData.type == SceneType.PLANE) {
         const worldPos: THREE.Vector2 = ThreeGeoUnitsUtils.datumsToSpherical(
            latitude,
            longitude,
         )
         puckMesh.current.position.set(worldPos.x, 1 / 2, -worldPos.y)
         // Reset rotation for plane alignment.
         puckMesh.current.rotation.set(0, 0, 0)
      }

      if (!displayedSceneData.scene.children.includes(puckMesh.current)) {
         displayedSceneData.scene.add(puckMesh.current)
      }

      // Update puck marker in the markersDashboard.
      // Allow to compute track with user position.
      updatePuckMarker(latitude, longitude)
   }

   /**
    * Cleanup : remove events listeners.
    */
   const cleanup = (): void => {
      displayedSceneData?.controls?.removeEventListener(
         'change',
         onControlsChange,
      )
   }

   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const planePuckAdjustedScale = useRef<number>(PLANE_SCENE_PUCK_MAX_SCALE)
   const globePuckAdjustedScale = useRef<number>(GLOBE_SCENE_PUCK_MAX_SCALE)

   /**
    * On controls change, we update the scale of the puck.
    */
   const onControlsChange = (): void => {
      if (puckMesh == null || displayedSceneData == null) {
         return
      }

      cameraDistanceToPlanetCenter.current =
         displayedSceneData.controls.getDistance()

      if (displayedSceneData.type == SceneType.SPHERICAL) {
         globePuckAdjustedScale.current = clamp(
            cameraDistanceToPlanetCenter.current / 1e3,
            GLOBE_SCENE_PUCK_MIN_SCALE,
            GLOBE_SCENE_PUCK_MAX_SCALE,
         )

         puckMesh.current.scale.set(
            globePuckAdjustedScale.current,
            globePuckAdjustedScale.current * 2,
            globePuckAdjustedScale.current,
         )
      } else if (displayedSceneData.type == SceneType.PLANE) {
         planePuckAdjustedScale.current = clamp(
            cameraDistanceToPlanetCenter.current / 1e2,
            PLANE_SCENE_PUCK_MIN_SCALE,
            PLANE_SCENE_PUCK_MAX_SCALE,
         )

         // Y is multiplied by 10 in order to have a better visibility of the puck.
         puckMesh.current.scale.set(
            planePuckAdjustedScale.current,
            planePuckAdjustedScale.current * 10,
            planePuckAdjustedScale.current,
         )
      }
   }

   return null
}

