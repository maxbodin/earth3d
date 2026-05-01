'use client'
import * as THREE from 'three'
import { useCallback, useEffect, useRef } from 'react'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useMapTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.model'
import { SceneType } from '@/app/enums/sceneType'
import { applyOpacityToMapView, } from '@/app/lib/tectonicPlatesOverlayLayer'
import { DEBUG_TILES_PLANE_Y_OFFSET } from '@/app/constants/numbers'

// TODO : Refactor in constants.
const DEBUG_TILES_NAME = 'debug-tiles-overlay'
const DEBUG_RENDER_ORDER = 15
const DEBUG_PLANISPHERE_POLYGON_OFFSET_FACTOR = -8
const DEBUG_PLANISPHERE_POLYGON_OFFSET_UNITS = -8

/**
 * Limit debug tile depth to prevent exponential node creation.
 */
const DEBUG_MAX_ZOOM = 9

/**
 * LODRadial thresholds for the spherical debug overlay.
 */
const SPHERE_LOD_SUBDIVIDE_DISTANCE = 250000
const SPHERE_LOD_SIMPLIFY_DISTANCE = SPHERE_LOD_SUBDIVIDE_DISTANCE * 8

export function DebugTilesOverlay(): null {
   const mapViewRef = useRef<any>(null)
   const creationTokenRef = useRef<number>(0)
   const { displayedSceneData } = useScenes()
   const { debugTilesEnabled, debugTilesOpacity } = useMapTab()
   const displayedSceneType = displayedSceneData?.type ?? null
   const displayedScene = displayedSceneData?.scene ?? null
   const opacityRef = useRef(debugTilesOpacity / 100)
   opacityRef.current = debugTilesOpacity / 100

   const removeMapView = useCallback((): void => {
      const mapView = mapViewRef.current
      if (mapView == null) return

      // disposeTectonicMapView(mapView) TODO : remove replace with dispose debug tiles ?
      mapView.parent?.remove(mapView)
      mapViewRef.current = null
   }, [])

   const createMapView = useCallback(async (sceneType: SceneType): Promise<any> => {
      const { MapView, LODRadial, DebugProvider } = await import('geo-three')

      const provider = new DebugProvider()
      provider.minZoom = 0
      provider.maxZoom = DEBUG_MAX_ZOOM

      const isSpherical = sceneType === SceneType.SPHERICAL
      const mode = isSpherical ? MapView.SPHERICAL : MapView.PLANAR
      const lod = isSpherical
         ? new LODRadial(SPHERE_LOD_SUBDIVIDE_DISTANCE, SPHERE_LOD_SIMPLIFY_DISTANCE)
         : undefined

      const mapView = new MapView(mode, provider, undefined, lod, (node: any, material: any) => {
         if (isSpherical && node && 'frustumCulled' in node) {
            node.frustumCulled = false
         }
         if (node && 'renderOrder' in node) {
            node.renderOrder = DEBUG_RENDER_ORDER
         }

         const mat = Array.isArray(material) ? material[0] : material

         // Setting opacity parameter.
         if (mat instanceof THREE.ShaderMaterial) {
            mat.uniforms.uOpacity = { value: opacityRef.current }
            mat.fragmentShader = mat.fragmentShader.replace(
               'uniform sampler2D uTexture;',
               'uniform sampler2D uTexture;\n\t\tuniform float uOpacity;',
            )
            mat.fragmentShader = mat.fragmentShader.replace(
               'gl_FragColor = color;',
               'gl_FragColor = vec4(color.rgb, color.a * uOpacity);',
            )
         } else {
            mat.opacity = opacityRef.current
         }

         mat.depthTest = true

         if (sceneType === SceneType.PLANE) {
            mat.userData._planisphereOverlayMaterial = true
            mat.transparent = false
            mat.depthWrite = true
            mat.blending = THREE.CustomBlending
            mat.blendSrc = THREE.SrcAlphaFactor
            mat.blendDst = THREE.OneMinusSrcAlphaFactor
            mat.blendSrcAlpha = THREE.OneFactor
            mat.blendDstAlpha = THREE.OneMinusSrcAlphaFactor
            mat.blendEquation = THREE.AddEquation
            mat.polygonOffset = true
            mat.polygonOffsetFactor = DEBUG_PLANISPHERE_POLYGON_OFFSET_FACTOR
            mat.polygonOffsetUnits = DEBUG_PLANISPHERE_POLYGON_OFFSET_UNITS
         } else {
            mat.transparent = true
            mat.depthWrite = false
         }

         mat.needsUpdate = true
         return material
      })

      mapView.name = DEBUG_TILES_NAME
      mapView.renderOrder = DEBUG_RENDER_ORDER
      mapView.frustumCulled = isSpherical ? false : mapView.frustumCulled
      mapView.cacheTiles = isSpherical

      if (isSpherical) {
         mapView.scale.setScalar(1.008)
      } else {
         mapView.position.set(0, DEBUG_TILES_PLANE_Y_OFFSET, 0)
      }

      return mapView
   }, [])

   // TODO : Refactor because full duplicate with tectonicPlatesOverlay.
   useEffect(() => {
      if (mapViewRef.current == null) return
      applyOpacityToMapView(mapViewRef.current, debugTilesOpacity / 100)
   }, [debugTilesOpacity])

   // TODO : Refactor because full duplicate with tectonicPlatesOverlay.
   useEffect(() => {
      const sceneType = displayedSceneType
      const scene = displayedScene

      if (!debugTilesEnabled || scene == null || sceneType == null || sceneType === SceneType.SOLAR_SYSTEM) {
         creationTokenRef.current += 1
         removeMapView()
         return
      }

      const creationToken = creationTokenRef.current + 1
      creationTokenRef.current = creationToken
      removeMapView()

      let isCancelled = false

      void createMapView(sceneType).then((mapView) => {
         if (isCancelled || creationTokenRef.current !== creationToken) return

         applyOpacityToMapView(mapView, opacityRef.current)
         scene.add(mapView)
         mapView.updateMatrixWorld(true)
         mapViewRef.current = mapView
      }).catch((error) => {
         if (!isCancelled) {
            console.error('Error creating debug tiles overlay:', error)
         }
      })

      return () => {
         isCancelled = true
         if (creationTokenRef.current === creationToken) {
            creationTokenRef.current += 1
         }
         removeMapView()
      }
   }, [displayedSceneType, displayedScene, debugTilesEnabled, removeMapView, createMapView])

   return null
}
