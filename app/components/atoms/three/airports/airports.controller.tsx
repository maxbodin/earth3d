'use client'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import layers from '../../../../data/Airports.json'
import {
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
import { clamp } from '@/lib/clamp'

// Shared geometry for all airports, avoids creating thousands of geometries.
const sharedAirportGeometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4)

export function AirportsController(): null {
   const { displayedSceneData } = useScenes()
   const { displayedAirportsGroup } = useAirports()

   const visibleAirports = useRef<any[]>([])
   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const globeAirportAdjustedScale = useRef<number>(PLANE_SCENE_AIRPORT_MAX_SCALE)

   // Threshold tracking to avoid unnecessary re-renders.
   const lastVisibleAirportCount = useRef<number>(0)
   const lastAirportScale = useRef<number>(PLANE_SCENE_AIRPORT_MAX_SCALE)
   const LOD_THRESHOLD_CHANGE = 0.1 // Minimum scale change to trigger re-render.

   /**
    * Display airports with geometry and material reuse.
    */
   const displayAirports = (airports: any[]): void => {
      if (!displayedSceneData?.scene) return

      // Limit displayed airports for performance.
      const limitedAirports = airports.length > 300 ? airports.slice(0, 300) : airports

      // Clear previous airports efficiently.
      displayedAirportsGroup.forEach((airportMesh): void => {
         displayedSceneData.scene.remove(airportMesh)
      })
      displayedAirportsGroup.clear()

      const scale = globeAirportAdjustedScale.current

      for (const airportData of limitedAirports) {
         // Reuse shared geometry and material.
         const airportMesh = new THREE.Mesh(sharedAirportGeometry, AIRPORT_MATERIAL)
         airportMesh.scale.set(scale, scale * 4, scale)
         airportMesh.position.copy(airportData.planePosition)
         airportMesh.renderOrder = AIRPORT_RENDER_ORDER
         airportMesh.userData = { data: airportData }

         displayedAirportsGroup.add(airportMesh)
         displayedSceneData.scene.add(airportMesh)
      }

      lastVisibleAirportCount.current = limitedAirports.length
      lastAirportScale.current = scale
   }

   /**
    * Process airports to display only visible airports.
    * Optimized with early exits and minimal allocations.
    */
   const processAirports = (): void => {
      if (
         !displayedAirportsGroup ||
         !displayedSceneData?.camera ||
         displayedSceneData.type !== SceneType.PLANE
      ) {
         return
      }

      const maxDistForAirportVisible = clamp(
         PLANE_MIN_ALLOWED_AIRPORT_DISTANCE_TO_CAMERA * (cameraDistanceToPlanetCenter.current / 20),
         1e3,
         3e5
      )

      // Filter visible airports.
      visibleAirports.current = layers.layers[0].featureSet.features.filter((airportData: any): boolean => {
         const { latitude_deg: lat, longitude_deg: lon } = airportData.attributes
         if (lat == null || lon == null) return false

         const worldPos = ThreeGeoUnitsUtils.datumsToSpherical(lat, lon)
         airportData.planePosition = new THREE.Vector3(worldPos.x, 0, -worldPos.y)

         return displayedSceneData.camera!.position.distanceTo(airportData.planePosition) <= maxDistForAirportVisible
      })

      // Skip re-render if count hasn't changed significantly.
      const countChange = Math.abs(visibleAirports.current.length - lastVisibleAirportCount.current)
      const scaleChange = Math.abs(globeAirportAdjustedScale.current - lastAirportScale.current)

      if (countChange < 10 && scaleChange < LOD_THRESHOLD_CHANGE) {
         updateAirportScales()
         return
      }

      displayAirports(visibleAirports.current)
   }

   /**
    * Update scales of existing airports without recreating them.
    */
   const updateAirportScales = (): void => {
      const scale = globeAirportAdjustedScale.current
      displayedAirportsGroup.forEach((airport): void => {
         airport.scale.set(scale, scale * 4, scale)
      })
      lastAirportScale.current = scale
   }

   /**
    * Update airports when camera moves - with threshold-based triggering.
    */
   const onControlsChange = (): void => {
      if (!displayedSceneData?.controls) return

      const newDistance = displayedSceneData.controls.getDistance()
      const distanceChange = Math.abs(newDistance - cameraDistanceToPlanetCenter.current)

      // Only process if distance changed significantly. (threshold-based LOD)
      if (distanceChange < 500) {
         // Just update scale for smooth transitions.
         const oldScale = globeAirportAdjustedScale.current
         cameraDistanceToPlanetCenter.current = newDistance
         globeAirportAdjustedScale.current = clamp(
            newDistance / 10,
            PLANE_SCENE_AIRPORT_MIN_SCALE,
            PLANE_SCENE_AIRPORT_MAX_SCALE
         )

         if (Math.abs(globeAirportAdjustedScale.current - oldScale) >= LOD_THRESHOLD_CHANGE) {
            updateAirportScales()
         }
         return
      }

      cameraDistanceToPlanetCenter.current = newDistance
      globeAirportAdjustedScale.current = clamp(
         newDistance / 10,
         PLANE_SCENE_AIRPORT_MIN_SCALE,
         PLANE_SCENE_AIRPORT_MAX_SCALE
      )

      processAirports()
   }

   useEffect(() => {
      displayedSceneData?.controls?.addEventListener('change', onControlsChange)

      return () => {
         displayedSceneData?.controls?.removeEventListener('change', onControlsChange)
      }
   }, [displayedSceneData])

   return null
}
