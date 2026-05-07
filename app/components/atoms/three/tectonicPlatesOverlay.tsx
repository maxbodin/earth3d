'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useMapTab } from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/mapTab/mapTab.model'
import { SceneType } from '@/app/enums/sceneType'
import { TectonicPlatesProvider } from '@/app/lib/tectonicPlatesProvider'
import {
   applyOpacityToMapView,
   configureTectonicMapView,
   createTectonicMaterialFactory,
   disposeTectonicMapView,
} from '@/app/lib/tectonicPlatesOverlayLayer'

/**
 * LODRadial thresholds for the spherical tectonic overlay. TODO : Refactor in constants.
 */
const SPHERE_LOD_SUBDIVIDE_DISTANCE = 200000
const SPHERE_LOD_SIMPLIFY_DISTANCE = SPHERE_LOD_SUBDIVIDE_DISTANCE * 8

export function TectonicPlatesOverlay(): null {
   const mapViewRef = useRef<any>(null)
   const creationTokenRef = useRef<number>(0)
   const { displayedSceneData } = useScenes()
   const { tectonicPlatesEnabled, tectonicPlatesOpacity } = useMapTab()
   const displayedSceneType = displayedSceneData?.type ?? null
   const displayedScene = displayedSceneData?.scene ?? null
   const opacityRef = useRef(tectonicPlatesOpacity / 100)
   opacityRef.current = tectonicPlatesOpacity / 100

   const removeMapView = useCallback((): void => {
      const mapView = mapViewRef.current
      if (mapView == null) return

      disposeTectonicMapView(mapView)
      mapView.parent?.remove(mapView)
      mapViewRef.current = null
   }, [])

   // TODO : Refactor en prenant en param le provider pour avoir une seule fonction générique utilisé par les overlay.
   const createMapView = useCallback(async (sceneType: SceneType): Promise<any> => {
      const { MapView, LODRadial } = await import('geo-three')

      const provider = new TectonicPlatesProvider()
      const isSpherical = sceneType === SceneType.SPHERICAL
      const mode = isSpherical ? MapView.SPHERICAL : MapView.PLANAR
      const lod = isSpherical
         ? new LODRadial(SPHERE_LOD_SUBDIVIDE_DISTANCE, SPHERE_LOD_SIMPLIFY_DISTANCE)
         : undefined

      const mapView = new MapView(
         mode,
         provider,
         undefined,
         lod,
         createTectonicMaterialFactory(sceneType, opacityRef),
      )

      configureTectonicMapView(mapView, sceneType)

      return mapView
   }, [])

   useEffect(() => {
      if (mapViewRef.current == null) return
      applyOpacityToMapView(mapViewRef.current, tectonicPlatesOpacity / 100)
   }, [tectonicPlatesOpacity])

   useEffect(() => {
      const sceneType = displayedSceneType
      const scene = displayedScene

      if (!tectonicPlatesEnabled || scene == null || sceneType == null || sceneType === SceneType.SOLAR_SYSTEM) {
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
            console.error('Error creating tectonic plates overlay:', error)
         }
      })

      return () => {
         isCancelled = true
         if (creationTokenRef.current === creationToken) {
            creationTokenRef.current += 1
         }
         removeMapView()
      }
   }, [displayedSceneType, displayedScene, tectonicPlatesEnabled, removeMapView, createMapView])

   return null
}
