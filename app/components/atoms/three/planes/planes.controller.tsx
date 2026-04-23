'use client'
import * as THREE from 'three'
import { useCallback, useEffect, useRef } from 'react'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { PLANE_MATERIAL } from '@/app/constants/materials'
import { PLANE_GLB_MODEL } from '@/app/constants/paths'
import { usePlanes } from '@/app/components/atoms/three/planes/planes.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { AssetManager } from '@/app/lib/assetManager'
import { SceneType } from '@/app/enums/sceneType'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { clamp } from '@/app/helpers/numberHelper'
import {
   GLOBE_ALTITUDE_OFFSET_METERS,
   GLOBE_PLANE_MAX_SCALE,
   GLOBE_PLANE_MIN_SCALE,
   MAX_DISPLAYED_PLANES,
   PLANE_FALLBACK_CONE_HEIGHT,
   PLANE_FALLBACK_CONE_RADIAL_SEGMENTS,
   PLANE_FALLBACK_CONE_RADIUS,
   PLANE_FALLBACK_CONE_ROTATION_X,
   PLANE_SCENE_PLANE_MAX_SCALE,
   PLANE_SCENE_PLANE_MIN_SCALE,
} from '@/app/constants/numbers'
import { publishThreeSceneDebug } from '@/app/lib/threeSceneDebug'
import { OpenSkyStateVector } from '@/app/types/openSky/openSkyStateVector'
import { RenderablePlane } from '@/app/types/plane/renderablePlane'
import {
   usePlanesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/planesTab/planesTab.model'

let sharedPlaneTemplate: THREE.Group | null = null
let sharedPlaneLoadPromise: Promise<THREE.Group> | null = null

function createFallbackPlaneTemplate(): THREE.Group {
   const group = new THREE.Group()
   const geometry = new THREE.ConeGeometry(
      PLANE_FALLBACK_CONE_RADIUS,
      PLANE_FALLBACK_CONE_HEIGHT,
      PLANE_FALLBACK_CONE_RADIAL_SEGMENTS,
   )
   const mesh = new THREE.Mesh(geometry, PLANE_MATERIAL)
   mesh.rotation.x = PLANE_FALLBACK_CONE_ROTATION_X
   group.add(mesh)
   return group
}

function clearDisplayedPlanes(displayedPlanesGroup: THREE.Group): void {
   while (displayedPlanesGroup.children.length > 0) {
      displayedPlanesGroup.remove(displayedPlanesGroup.children[0])
   }
}

function extractPlaneCoordinates(
   state: OpenSkyStateVector,
): { latitude: number; longitude: number } | null {
   const latitude = state[6]
   const longitude = state[5]

   if (latitude == null || longitude == null) {
      return null
   }

   return {
      latitude,
      longitude,
   }
}

function extractPlaneAltitudeMeters(state: OpenSkyStateVector): number {
   return Math.max(state[13] ?? state[7] ?? 0, 0)
}

function getHeadingRadians(state: OpenSkyStateVector): number | null {
   const trueTrack = state[10]
   if (trueTrack == null) return null

   return THREE.MathUtils.degToRad(trueTrack)
}

function getPlaneScale(sceneType: SceneType, cameraDistance: number): number {
   if (sceneType === SceneType.PLANE) {
      return clamp(
         cameraDistance / 1500,
         PLANE_SCENE_PLANE_MIN_SCALE,
         PLANE_SCENE_PLANE_MAX_SCALE,
      )
   }

   return clamp(
      cameraDistance / 8500,
      GLOBE_PLANE_MIN_SCALE,
      GLOBE_PLANE_MAX_SCALE,
   )
}

export function PlanesController(): null {
   const { planesData } = usePlanes()
   const { displayedSceneData } = useScenes()
   const { displayedPlanesGroup } = usePlanes()
   const { planesActivated } = usePlanesTab()
   const animationFrameIdRef = useRef<number | null>(null)
   const isUnmountedRef = useRef<boolean>(false)

   const loadPlaneModel = useCallback(async (): Promise<THREE.Group> => {
      if (sharedPlaneTemplate) return sharedPlaneTemplate
      if (sharedPlaneLoadPromise) return sharedPlaneLoadPromise

      sharedPlaneLoadPromise = AssetManager.loadModel(PLANE_GLB_MODEL)
         .then((template) => {
            template.traverse((child) => {
               if (child instanceof THREE.Mesh) {
                  child.material = PLANE_MATERIAL
               }
            })

            sharedPlaneTemplate = template
            return template
         })
         .catch((error) => {
            console.error('Error loading plane model, fallback mesh will be used:', error)
            const fallbackTemplate = createFallbackPlaneTemplate()
            sharedPlaneTemplate = fallbackTemplate
            return fallbackTemplate
         })

      return sharedPlaneLoadPromise
   }, [])

   const getPlaneInstance = useCallback((template: THREE.Group): THREE.Group => {
      return template.clone()
   }, [])

   const buildRenderablePlane = useCallback((
      state: OpenSkyStateVector,
      sceneType: SceneType,
   ): RenderablePlane | null => {
      const coordinates = extractPlaneCoordinates(state)
      if (coordinates == null) return null

      const altitudeMeters = extractPlaneAltitudeMeters(state)

      if (sceneType === SceneType.PLANE) {
         const worldPosition = ThreeGeoUnitsUtils.datumsToSpherical(
            coordinates.latitude,
            coordinates.longitude,
         )

         return {
            state,
            position: new THREE.Vector3(worldPosition.x, altitudeMeters, -worldPosition.y),
            headingRad: getHeadingRadians(state),
         }
      }

      const position = latLongToVector3(coordinates.latitude, coordinates.longitude)
      const normal = position.clone().normalize()

      position.add(normal.multiplyScalar(altitudeMeters + GLOBE_ALTITUDE_OFFSET_METERS))

      return {
         state,
         position,
         headingRad: getHeadingRadians(state),
      }
   }, [])

   const applyPlaneTransform = useCallback((
      plane: THREE.Group,
      renderablePlane: RenderablePlane,
      sceneType: SceneType,
      scale: number,
   ): void => {
      plane.position.copy(renderablePlane.position)

      if (sceneType === SceneType.PLANE) {
         const headingRad = renderablePlane.headingRad ?? 0
         plane.rotation.set(0, headingRad, 0)
      } else {
         const up = renderablePlane.position.clone().normalize()
         plane.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            up,
         )

         if (renderablePlane.headingRad != null) {
            const headingRotation = new THREE.Quaternion().setFromAxisAngle(
               up,
               renderablePlane.headingRad,
            )
            plane.quaternion.multiply(headingRotation)
         }
      }

      plane.scale.setScalar(scale)
      plane.userData = { data: renderablePlane.state }
   }, [])

   const renderPlanes = useCallback(async (): Promise<void> => {
      const sceneData = displayedSceneData

      if (!planesActivated || sceneData == null || sceneData.type === SceneType.SOLAR_SYSTEM) {
         clearDisplayedPlanes(displayedPlanesGroup)
         displayedPlanesGroup.parent?.remove(displayedPlanesGroup)

         publishThreeSceneDebug({
            displayedPlanesCount: 0,
            planesSceneType: sceneData?.type ?? null,
            displayedPlanesMinAltitudeMeters: null,
         })
         return
      }

      if (displayedPlanesGroup.parent !== sceneData.scene) {
         sceneData.scene.add(displayedPlanesGroup)
      }

      clearDisplayedPlanes(displayedPlanesGroup)

      if (planesData.length === 0) {
         publishThreeSceneDebug({
            displayedPlanesCount: 0,
            planesSceneType: sceneData.type,
            displayedPlanesMinAltitudeMeters: null,
         })
         return
      }

      const planeTemplate = await loadPlaneModel()
      if (isUnmountedRef.current) return

      const cameraDistance = sceneData.controls.getDistance()
      const scale = getPlaneScale(sceneData.type, cameraDistance)

      const renderablePlanes: RenderablePlane[] = []

      for (const state of planesData) {
         const renderablePlane = buildRenderablePlane(state, sceneData.type)
         if (renderablePlane == null) continue

         renderablePlanes.push(renderablePlane)

         if (renderablePlanes.length >= MAX_DISPLAYED_PLANES) {
            break
         }
      }

      for (const renderablePlane of renderablePlanes) {
         const plane = getPlaneInstance(planeTemplate)
         applyPlaneTransform(plane, renderablePlane, sceneData.type, scale)
         displayedPlanesGroup.add(plane)
      }

      const displayedPlanesMinAltitudeMeters = sceneData.type === SceneType.PLANE
         ? Math.min(...renderablePlanes.map(renderablePlane => renderablePlane.position.y))
         : null

      publishThreeSceneDebug({
         displayedPlanesCount: displayedPlanesGroup.children.length,
         planesSceneType: sceneData.type,
         displayedPlanesMinAltitudeMeters,
      })
   }, [
      applyPlaneTransform,
      buildRenderablePlane,
      displayedPlanesGroup,
      displayedSceneData,
      getPlaneInstance,
      loadPlaneModel,
      planesActivated,
      planesData,
   ])

   const scheduleRender = useCallback((): void => {
      if (animationFrameIdRef.current != null) return

      animationFrameIdRef.current = window.requestAnimationFrame(() => {
         animationFrameIdRef.current = null
         void renderPlanes()
      })
   }, [renderPlanes])

   useEffect(() => {
      isUnmountedRef.current = false
      void renderPlanes()

      return () => {
         isUnmountedRef.current = true

         if (animationFrameIdRef.current != null) {
            window.cancelAnimationFrame(animationFrameIdRef.current)
            animationFrameIdRef.current = null
         }

         clearDisplayedPlanes(displayedPlanesGroup)
         displayedPlanesGroup.parent?.remove(displayedPlanesGroup)
      }
   }, [displayedPlanesGroup, renderPlanes])

   useEffect(() => {
      const controls = displayedSceneData?.controls
      if (controls == null || !planesActivated) return

      controls.addEventListener('change', scheduleRender)

      return () => {
         controls.removeEventListener('change', scheduleRender)
      }
   }, [displayedSceneData, planesActivated, scheduleRender])

   return null
}
