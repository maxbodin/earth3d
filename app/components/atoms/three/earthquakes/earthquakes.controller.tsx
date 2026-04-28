'use client'
import * as THREE from 'three'
import { useCallback, useEffect } from 'react'
import { useEarthquakes } from '@/app/components/atoms/three/earthquakes/earthquakes.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { EARTHQUAKE_BASE_RADIUS, MAX_DISPLAYED_EARTHQUAKES, ONE_HOUR_IN_MS, } from '@/app/constants/numbers'
import { EARTHQUAKE_DEPTH_LINE_RENDER_ORDER, EARTHQUAKE_RENDER_ORDER, } from '@/app/constants/renderOrder'
import { EARTHQUAKE_DEPTH_LINE_MATERIAL } from '@/app/constants/materials'
import {
   useEarthquakesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/earthquakesTab/earthquakesTab.model'
import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'
import { clearGroup } from '@/lib/three/clearGroup'
import { latLongToVector3 } from '@/lib/geo/latLongToVector3'

const SHARED_SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 12, 8)

function magnitudeToColor(mag: number): THREE.Color {
   // Green(low) -> Yellow(mid) -> Red(high)
   const t = Math.min(Math.max((mag - 1) / 7, 0), 1)
   if (t < 0.5) {
      const s = t * 2
      return new THREE.Color(s, 1, 0)
   }
   const s = (t - 0.5) * 2
   return new THREE.Color(1, 1 - s, 0)
}

function magnitudeToRadius(mag: number): number {
   return Math.max(Math.pow(2, mag) * 0.3, 0.5)
}

interface RenderableEarthquake {
   feature: UsgsEarthquakeFeature
   surfacePosition: THREE.Vector3
   depthKm: number
   magnitude: number
}

function buildRenderableEarthquake(
   feature: UsgsEarthquakeFeature,
   sceneType: SceneType,
): RenderableEarthquake | null {
   const [longitude, latitude, depth] = feature.geometry.coordinates
   const magnitude = feature.properties.mag

   if (latitude == null || longitude == null || magnitude == null) return null

   let surfacePosition: THREE.Vector3

   if (sceneType === SceneType.PLANE) {
      const worldPos = ThreeGeoUnitsUtils.datumsToSpherical(latitude, longitude)
      surfacePosition = new THREE.Vector3(worldPos.x, 0, -worldPos.y)
   } else {
      surfacePosition = latLongToVector3(latitude, longitude)
   }

   return {
      feature,
      surfacePosition,
      depthKm: Math.max(depth ?? 0, 0),
      magnitude,
   }
}

function createEarthquakeMarkerMesh(
   renderable: RenderableEarthquake,
): THREE.Mesh {
   const radius = magnitudeToRadius(renderable.magnitude) * EARTHQUAKE_BASE_RADIUS
   const color = magnitudeToColor(renderable.magnitude)

   const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      depthTest: true,
   })

   const mesh = new THREE.Mesh(SHARED_SPHERE_GEOMETRY, material)
   mesh.position.copy(renderable.surfacePosition)
   mesh.scale.setScalar(radius)
   mesh.renderOrder = EARTHQUAKE_RENDER_ORDER
   mesh.userData = { earthquakeFeature: renderable.feature }

   return mesh
}

function createDepthLine(
   renderable: RenderableEarthquake,
   sceneType: SceneType,
): THREE.Line | null {
   if (renderable.depthKm <= 0) return null

   const surfacePos = renderable.surfacePosition.clone()
   const depthMeters = renderable.depthKm * 1000
   let depthPos: THREE.Vector3

   if (sceneType === SceneType.PLANE) {
      depthPos = surfacePos.clone()
      depthPos.y = -depthMeters
   } else {
      const normal = surfacePos.clone().normalize()
      depthPos = surfacePos.clone().sub(normal.multiplyScalar(depthMeters))
   }

   const geometry = new THREE.BufferGeometry().setFromPoints([surfacePos, depthPos])
   const line = new THREE.Line(geometry, EARTHQUAKE_DEPTH_LINE_MATERIAL)
   line.renderOrder = EARTHQUAKE_DEPTH_LINE_RENDER_ORDER
   line.userData = { earthquakeFeature: renderable.feature }

   return line
}

export function EarthquakesController(): null {
   const { earthquakeData, displayedEarthquakesGroup, playbackTime } = useEarthquakes()
   const { displayedSceneData } = useScenes()
   const { earthquakesActivated, earthquakeDepthLinesEnabled } = useEarthquakesTab()

   // TODO : Refactor duplicatde code with earthquakeHeatmap.
   const getVisibleEarthquakes = useCallback((): UsgsEarthquakeFeature[] => {
      if (playbackTime == null) return earthquakeData
      if (earthquakeData.length === 0) return []

      const times = earthquakeData.map(f => f.properties.time)
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)
      const totalRange = maxTime - minTime
      const windowSize = Math.max(totalRange * 0.1, ONE_HOUR_IN_MS)

      return earthquakeData.filter(f => {
         const t = f.properties.time
         return t <= playbackTime && t >= playbackTime - windowSize
      })
   }, [earthquakeData, playbackTime])

   const renderEarthquakes = useCallback((): void => {
      const sceneData = displayedSceneData

      if (!earthquakesActivated || sceneData == null || sceneData.type === SceneType.SOLAR_SYSTEM) {
         clearGroup(displayedEarthquakesGroup)
         displayedEarthquakesGroup.parent?.remove(displayedEarthquakesGroup)
         return
      }

      if (displayedEarthquakesGroup.parent !== sceneData.scene) {
         sceneData.scene.add(displayedEarthquakesGroup)
      }

      clearGroup(displayedEarthquakesGroup)

      const visibleFeatures = getVisibleEarthquakes()
      if (visibleFeatures.length === 0) return

      let count = 0
      for (const feature of visibleFeatures) {
         if (count >= MAX_DISPLAYED_EARTHQUAKES) break

         const renderable = buildRenderableEarthquake(feature, sceneData.type)
         if (renderable == null) continue

         const mesh = createEarthquakeMarkerMesh(renderable)
         displayedEarthquakesGroup.add(mesh)

         if (earthquakeDepthLinesEnabled) {
            const depthLine = createDepthLine(renderable, sceneData.type)
            if (depthLine) {
               displayedEarthquakesGroup.add(depthLine)
            }
         }

         count++
      }
   }, [
      displayedEarthquakesGroup,
      displayedSceneData,
      earthquakesActivated,
      earthquakeDepthLinesEnabled,
      getVisibleEarthquakes,
   ])

   useEffect(() => {
      renderEarthquakes()

      return () => {
         clearGroup(displayedEarthquakesGroup)
         displayedEarthquakesGroup.parent?.remove(displayedEarthquakesGroup)
      }
   }, [displayedEarthquakesGroup, renderEarthquakes])

   return null
}
