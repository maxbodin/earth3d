'use client'
import * as THREE from 'three'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useVolcanoes } from '@/app/components/atoms/three/volcanoes/volcanoes.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { HEATMAP_CANVAS_HEIGHT, HEATMAP_CANVAS_WIDTH, VOLCANO_HEATMAP_RADIUS, } from '@/app/constants/numbers'
import { VOLCANO_HEATMAP_RENDER_ORDER } from '@/app/constants/renderOrder'
import {
   useVolcanoesTab
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/volcanoesTab/volcanoesTab.model'
import { VOLCANO_HEATMAP_NAME } from '@/app/constants/strings'
import { Eruption } from '@/app/types/volcano/eruption'
import { drawHeatmapPointFromCoords } from '@/lib/three/heatmap/drawHeatmapPointFromCoords'
import { createHeatmapCanvas } from '@/lib/three/heatmap/createHeatmapCanvas'
import { createHeatmapMesh } from '@/lib/three/heatmap/createHeatmapMesh'

export function VolcanoHeatmap(): null {
   const heatmapMeshRef = useRef<THREE.Mesh | null>(null)
   const textureRef = useRef<THREE.CanvasTexture | null>(null)
   const canvasRef = useRef<HTMLCanvasElement | null>(null)
   const { eruptionData } = useVolcanoes()
   const { displayedSceneData } = useScenes()
   const { volcanoesActivated, volcanoHeatmapEnabled, eruptionYearMin, eruptionYearMax } = useVolcanoesTab()

   const filteredEruptions = useMemo((): Eruption[] => {
      if (eruptionData.length === 0) return []
      return eruptionData.filter(e => {
         if (e.year == null) return false
         return e.year >= eruptionYearMin && e.year <= eruptionYearMax
      })
   }, [eruptionData, eruptionYearMin, eruptionYearMax])

   const removeHeatmap = useCallback((): void => {
      if (heatmapMeshRef.current) {
         heatmapMeshRef.current.parent?.remove(heatmapMeshRef.current)
         if (heatmapMeshRef.current.material instanceof THREE.ShaderMaterial) {
            heatmapMeshRef.current.material.dispose()
         }
         heatmapMeshRef.current.geometry.dispose()
         heatmapMeshRef.current = null
      }
      if (textureRef.current) {
         textureRef.current.dispose()
         textureRef.current = null
      }
   }, [])

   const renderHeatmap = useCallback((): void => {
      const sceneData = displayedSceneData

      if (!volcanoesActivated || !volcanoHeatmapEnabled || sceneData == null || sceneData.type !== SceneType.SPHERICAL) {
         removeHeatmap()
         return
      }

      if (filteredEruptions.length === 0) {
         removeHeatmap()
         return
      }

      if (!canvasRef.current) {
         canvasRef.current = createHeatmapCanvas()
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const maxVei = Math.max(
         ...filteredEruptions.map(e => e.vei ?? 0),
         1,
      )

      for (const eruption of filteredEruptions) {
         const intensity = (eruption.vei ?? 0) / maxVei
         drawHeatmapPointFromCoords(
            ctx,
            eruption.latitude,
            eruption.longitude,
            intensity,
            HEATMAP_CANVAS_WIDTH,
            HEATMAP_CANVAS_HEIGHT,
         )
      }

      if (!textureRef.current) {
         textureRef.current = new THREE.CanvasTexture(canvas)
         textureRef.current.wrapS = THREE.RepeatWrapping
      } else {
         textureRef.current.image = canvas
         textureRef.current.needsUpdate = true
      }

      if (!heatmapMeshRef.current) {
         heatmapMeshRef.current = createHeatmapMesh(
            textureRef.current,
            VOLCANO_HEATMAP_RADIUS,
            VOLCANO_HEATMAP_RENDER_ORDER,
            VOLCANO_HEATMAP_NAME,
         )
      } else {
         const material = heatmapMeshRef.current.material as THREE.ShaderMaterial
         material.uniforms.heatMapTexture.value = textureRef.current
      }

      if (heatmapMeshRef.current.parent !== sceneData.scene) {
         sceneData.scene.add(heatmapMeshRef.current)
      }
   }, [
      displayedSceneData,
      volcanoesActivated,
      volcanoHeatmapEnabled,
      filteredEruptions,
      removeHeatmap,
   ])

   useEffect(() => {
      renderHeatmap()

      return () => {
         removeHeatmap()
      }
   }, [renderHeatmap, removeHeatmap])

   return null
}
