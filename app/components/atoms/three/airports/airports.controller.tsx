'use client'
import * as THREE from 'three'
import { useCallback, useEffect, useRef } from 'react'
import layers from '../../../../data/Airports.json'
import { PLANE_MIN_ALLOWED_AIRPORT_DISTANCE_TO_CAMERA, } from '@/app/constants/numbers'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { AIRPORT_MATERIAL } from '@/app/constants/materials'
import { useAirports } from '@/app/components/atoms/three/airports/airports.model'
import {
   useAirportsTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/airportsTab/airportsTab.model'
import { SceneType } from '@/app/enums/sceneType'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { AIRPORT_RENDER_ORDER } from '@/app/constants/renderOrder'
import { AIRPORT_LOD_CONFIG } from '@/app/lib/sceneLod'
import { clamp } from '@/lib/math/clamp'
import { useSceneLodScaler } from '@/app/hooks/useSceneLodScaler'

// Shared geometry for all airports, avoids creating thousands of geometries.
const sharedAirportGeometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4)

const LOD_DISTANCE_THRESHOLD = 500
const LOD_SCALE_THRESHOLD = 0.1

export function AirportsController(): null {
   const { displayedSceneData } = useScenes()
   const { displayedAirportsGroup } = useAirports()
   const { airportsActivated } = useAirportsTab()

   const visibleAirports = useRef<any[]>([])
   const cameraDistanceToPlanetCenter = useRef<number>(0)

   // Threshold tracking to avoid unnecessary re-renders.
   const lastVisibleAirportCount = useRef<number>(0)

   const applyAirportScale = useCallback((scale: number): void => {
      displayedAirportsGroup.forEach((airport): void => {
         airport.scale.set(scale, scale * 4, scale)
      })
   }, [displayedAirportsGroup])

   const lodScaler = useSceneLodScaler({
      config: AIRPORT_LOD_CONFIG,
      scaleThreshold: LOD_SCALE_THRESHOLD,
      onScaleChange: applyAirportScale,
   })

   /**
    * Clear all airport meshes from the scene.
    */
   const clearAirports = (): void => {
      if (!displayedSceneData?.scene) return
      displayedAirportsGroup.forEach((airportMesh): void => {
         displayedSceneData.scene.remove(airportMesh)
      })
      displayedAirportsGroup.clear()
      lastVisibleAirportCount.current = 0
   }

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

      const scale = lodScaler.currentScale

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
   }

   /**
    * Process airports to display only visible airports.
    * Optimized with early exits and minimal allocations.
    */
   const processAirports = (): void => {
      if (
         !airportsActivated ||
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

      if (countChange < 10) return

      displayAirports(visibleAirports.current)
   }

   /**
    * Update airports when camera moves - with threshold-based triggering.
    */
   const onControlsChange = (): void => {
      if (!displayedSceneData?.controls) return

      const newDistance = displayedSceneData.controls.getDistance()
      const distanceChange = Math.abs(newDistance - cameraDistanceToPlanetCenter.current)
      cameraDistanceToPlanetCenter.current = newDistance

      if (distanceChange >= LOD_DISTANCE_THRESHOLD) {
         processAirports()
      }
   }

   useEffect(() => {
      if (!airportsActivated) {
         clearAirports()
         return
      }

      if (displayedSceneData?.controls == null) return

      lodScaler.attach(displayedSceneData.controls, displayedSceneData.type)
      displayedSceneData.controls.addEventListener('change', onControlsChange)

      return () => {
         lodScaler.detach()
         displayedSceneData?.controls?.removeEventListener('change', onControlsChange)
      }
   }, [displayedSceneData, airportsActivated, lodScaler])

   return null
}
