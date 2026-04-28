'use client'
import * as THREE from 'three'
import { useCallback, useEffect, useRef } from 'react'
import { useEarthquakes, } from '@/app/components/atoms/three/earthquakes/earthquakes.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import {
   EARTHQUAKE_HEATMAP_RADIUS,
   HEATMAP_CANVAS_HEIGHT,
   HEATMAP_CANVAS_WIDTH,
   HEATMAP_DOT_RADIUS,
   ONE_HOUR_IN_MS,
   SPHERE_HEIGHT_SEGMENTS,
   SPHERE_WIDTH_SEGMENTS,
} from '@/app/constants/numbers'
import { EARTHQUAKE_HEATMAP_RENDER_ORDER } from '@/app/constants/renderOrder'
import {
   useEarthquakesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/earthquakesTab/earthquakesTab.model'
import { EARTHQUAKE_HEATMAP_NAME } from '@/app/constants/strings'
import { UsgsEarthquakeFeature } from '@/app/types/earthquake/usgsEarthquakeFeature'

function drawHeatmapGradient(
   ctx: CanvasRenderingContext2D,
   cx: number,
   cy: number,
   size: number,
   color: string,
   transparentColor: string,
): void {
   const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size)
   gradient.addColorStop(0, color)
   gradient.addColorStop(1, transparentColor)

   ctx.fillStyle = gradient
   ctx.beginPath()
   ctx.arc(cx, cy, size, 0, 2 * Math.PI)
   ctx.fill()
}

function drawHeatmapPoint(
   ctx: CanvasRenderingContext2D,
   feature: UsgsEarthquakeFeature,
   canvasWidth: number,
   canvasHeight: number,
   maxMag: number,
): void {
   const [lon, lat] = feature.geometry.coordinates
   const mag = feature.properties.mag ?? 0

   const u = (lon + 180) / 360
   const v = (90 - lat) / 180

   const size = HEATMAP_DOT_RADIUS + mag * 4
   const intensity = Math.min(mag / maxMag, 1)
   const hue = (1 - intensity) * 120
   const alpha = Math.min(intensity * 0.6, 0.5)
   const color = `hsla(${hue}, 100%, 50%, ${alpha})`
   const transparentColor = `hsla(${hue}, 100%, 50%, 0)`

   const cx = u * canvasWidth
   const cy = v * canvasHeight

   drawHeatmapGradient(ctx, cx, cy, size, color, transparentColor)

   // Draw wrapped copies at the horizontal seam so dots near 180 degress longitude wrap seamlessly.
   const edgeThreshold = size / canvasWidth
   if (u < edgeThreshold) {
      drawHeatmapGradient(ctx, cx + canvasWidth, cy, size, color, transparentColor)
   } else if (u > 1 - edgeThreshold) {
      drawHeatmapGradient(ctx, cx - canvasWidth, cy, size, color, transparentColor)
   }
}

export function EarthquakeHeatmap(): null {
   const heatmapMeshRef = useRef<THREE.Mesh | null>(null)
   const textureRef = useRef<THREE.CanvasTexture | null>(null)
   const canvasRef = useRef<HTMLCanvasElement | null>(null)
   const { earthquakeData, playbackTime } = useEarthquakes()
   const { displayedSceneData } = useScenes()
   const { earthquakesActivated, earthquakeHeatmapEnabled } = useEarthquakesTab()

   const getVisibleData = useCallback((): UsgsEarthquakeFeature[] => {
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

      if (!earthquakesActivated || !earthquakeHeatmapEnabled || sceneData == null || sceneData.type !== SceneType.SPHERICAL) {
         removeHeatmap()
         return
      }

      const visibleData = getVisibleData()
      if (visibleData.length === 0) {
         removeHeatmap()
         return
      }

      // Create or reuse canvas.
      if (!canvasRef.current) {
         canvasRef.current = document.createElement('canvas')
         canvasRef.current.width = HEATMAP_CANVAS_WIDTH
         canvasRef.current.height = HEATMAP_CANVAS_HEIGHT
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const maxMag = Math.max(
         ...visibleData.map(f => f.properties.mag ?? 0),
         1,
      )

      for (const feature of visibleData) {
         drawHeatmapPoint(ctx, feature, canvas.width, canvas.height, maxMag)
      }

      // Create or update texture.
      if (!textureRef.current) {
         textureRef.current = new THREE.CanvasTexture(canvas)
         textureRef.current.wrapS = THREE.RepeatWrapping
      } else {
         textureRef.current.image = canvas
         textureRef.current.needsUpdate = true
      }

      // Create or update mesh.
      if (!heatmapMeshRef.current) {
         const shaderMaterial = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest: true,
            side: THREE.FrontSide,
            vertexShader: `
               #include <common>
               #include <logdepthbuf_pars_vertex>
               varying vec2 vertexUV;
               void main() {
                  vertexUV = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  #include <logdepthbuf_vertex>
               }`,
            fragmentShader: `
               #include <common>
               #include <logdepthbuf_pars_fragment>
               uniform sampler2D heatMapTexture;
               varying vec2 vertexUV;
               void main() {
                  vec4 texColor = texture2D(heatMapTexture, vertexUV);
                  if (texColor.a < 0.01) discard;
                  gl_FragColor = texColor;
                  #include <logdepthbuf_fragment>
               }`,
            uniforms: {
               heatMapTexture: { value: textureRef.current },
            },
         })

         const geometry = new THREE.SphereGeometry(
            EARTHQUAKE_HEATMAP_RADIUS,
            SPHERE_WIDTH_SEGMENTS,
            SPHERE_HEIGHT_SEGMENTS,
         )

         heatmapMeshRef.current = new THREE.Mesh(geometry, shaderMaterial)
         heatmapMeshRef.current.renderOrder = EARTHQUAKE_HEATMAP_RENDER_ORDER
         heatmapMeshRef.current.name = EARTHQUAKE_HEATMAP_NAME
         heatmapMeshRef.current.position.set(0, 0, 0)
      } else {
         const material = heatmapMeshRef.current.material as THREE.ShaderMaterial
         material.uniforms.heatMapTexture.value = textureRef.current
      }

      if (heatmapMeshRef.current.parent !== sceneData.scene) {
         sceneData.scene.add(heatmapMeshRef.current)
      }
   }, [
      displayedSceneData,
      earthquakesActivated,
      earthquakeHeatmapEnabled,
      getVisibleData,
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
