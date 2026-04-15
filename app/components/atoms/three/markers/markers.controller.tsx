'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { SceneType } from '@/app/enums/sceneType'
import { AssetManager } from '@/app/lib/assetManager'
import { MARKER_GLB_MODEL } from '@/app/constants/paths'
import { Marker } from '@/app/types/marker'
import { PUCK_COLOR } from '@/app/constants/colors'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import {
   GLOBE_SCENE_PUCK_MAX_SCALE,
   GLOBE_SCENE_PUCK_MIN_SCALE,
   PLANE_SCENE_PUCK_MAX_SCALE,
   PLANE_SCENE_PUCK_MIN_SCALE,
} from '@/app/constants/numbers'
import { clamp } from '@/app/helpers/numberHelper'
import { MARKER_RENDER_ORDER } from '@/app/constants/renderOrder'

let sharedMarkerTemplate: THREE.Group | null = null
let markerModelLoadPromise: Promise<THREE.Group> | null = null

const UP_AXIS = new THREE.Vector3(0, 1, 0)
const GLOBE_MARKER_SCALE_MULTIPLIER = 8
const PLANE_MARKER_SCALE_MULTIPLIER = 10
const GLOBE_MARKER_SURFACE_LIFT_MULTIPLIER = 0.45
const PLANE_MARKER_SURFACE_LIFT_MULTIPLIER = 0.1

const hasColorChannel = (material: THREE.Material): material is THREE.Material & { color: THREE.Color } => {
   return 'color' in material
}

const normalizeMarkerColor = (color: string): THREE.ColorRepresentation => {
   if (color.startsWith('0x')) {
      const parsedColor = Number.parseInt(color, 16)
      if (!Number.isNaN(parsedColor)) {
         return parsedColor
      }
   }

   return color
}

const toUnlitMarkerMaterial = (
   sourceMaterial: THREE.Material | null | undefined,
): THREE.MeshBasicMaterial => {
   const source = sourceMaterial as unknown as {
      transparent?: boolean
      opacity?: number
      alphaTest?: number
      side?: THREE.Side
      alphaMap?: THREE.Texture | null
   } | null | undefined

   return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: source?.transparent ?? false,
      opacity: source?.opacity ?? 1,
      alphaTest: source?.alphaTest ?? 0,
      side: source?.side ?? THREE.FrontSide,
      alphaMap: source?.alphaMap ?? null,
      depthWrite: true,
      depthTest: true,
      toneMapped: false,
   })
}

const disposeMarkerMaterials = (markerObject: THREE.Object3D): void => {
   markerObject.traverse((child): void => {
      if (!(child instanceof THREE.Mesh)) return

      if (Array.isArray(child.material)) {
         child.material.forEach(material => {
            material.dispose()
         })
         return
      }

      child.material?.dispose()
   })
}

const applyMarkerColor = (markerObject: THREE.Object3D, color: string): void => {
   const parsedColor = normalizeMarkerColor(color)

   markerObject.traverse((child): void => {
      if (!(child instanceof THREE.Mesh)) return

      const materials = Array.isArray(child.material)
         ? child.material
         : [child.material]

      materials.forEach(material => {
         if (material != null && hasColorChannel(material)) {
            material.color.set(parsedColor)
         }
      })
   })
}

const cloneMarkerInstance = (template: THREE.Group): THREE.Group => {
   const markerObject = template.clone(true)

   // Replace with unlit materials so marker colors stay visible even without scene lights.
   markerObject.traverse((child): void => {
      if (!(child instanceof THREE.Mesh)) return

      if (Array.isArray(child.material)) {
         child.material = child.material.map(material => {
            return toUnlitMarkerMaterial(material)
         })
      } else if (child.material != null) {
         child.material = toUnlitMarkerMaterial(child.material)
      }
   })

   return markerObject
}

const hasRenderableCoordinates = (marker: Marker): boolean => {
   const hasFiniteCoords = Number.isFinite(marker.latitude)
      && Number.isFinite(marker.longitude)

   if (!hasFiniteCoords) return false
   if (marker.isPuck) return true

   // Skip untouched default markers created at (0, 0).
   return !(marker.latitude === 0 && marker.longitude === 0)
}

async function loadSharedMarkerTemplate(): Promise<THREE.Group> {
   if (sharedMarkerTemplate != null) return sharedMarkerTemplate
   if (markerModelLoadPromise != null) return markerModelLoadPromise

   markerModelLoadPromise = AssetManager.loadModel(MARKER_GLB_MODEL)
      .then((template): THREE.Group => {
         sharedMarkerTemplate = template
         return template
      })

   return markerModelLoadPromise
}

export function MarkersController(): null {
   const { displayedSceneData } = useScenes()
   const { markers } = useMarkersDashboard()

   const markerObjectsRef = useRef<Map<string, THREE.Group>>(new Map())
   const attachedSceneRef = useRef<THREE.Scene | null>(null)

   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const planeMarkerAdjustedScale = useRef<number>(PLANE_SCENE_PUCK_MAX_SCALE)
   const globeMarkerAdjustedScale = useRef<number>(GLOBE_SCENE_PUCK_MAX_SCALE)

   const getCurrentScale = (sceneType: SceneType): number => {
      if (sceneType === SceneType.SPHERICAL) {
         return globeMarkerAdjustedScale.current * GLOBE_MARKER_SCALE_MULTIPLIER
      }

      if (sceneType === SceneType.PLANE) {
         return planeMarkerAdjustedScale.current * PLANE_MARKER_SCALE_MULTIPLIER
      }

      return 1
   }

   const updateMarkerTransform = (
      markerObject: THREE.Group,
      marker: Marker,
      sceneType: SceneType,
      markerScale: number,
   ): void => {
      const markerLiftMultiplier = sceneType === SceneType.SPHERICAL
         ? GLOBE_MARKER_SURFACE_LIFT_MULTIPLIER
         : PLANE_MARKER_SURFACE_LIFT_MULTIPLIER
      const markerLift = markerScale * markerLiftMultiplier

      if (sceneType === SceneType.SPHERICAL) {
         const markerPosition = latLongToVector3(marker.latitude, marker.longitude)
         const normal = markerPosition.clone().normalize()

         markerObject.position.copy(
            markerPosition.add(normal.clone().multiplyScalar(markerLift)),
         )
         markerObject.quaternion.setFromUnitVectors(UP_AXIS, normal)

         return
      }

      if (sceneType === SceneType.PLANE) {
         const worldPosition = ThreeGeoUnitsUtils.datumsToSpherical(
            marker.latitude,
            marker.longitude,
         )

         markerObject.position.set(worldPosition.x, markerLift, -worldPosition.y)
         markerObject.rotation.set(0, 0, 0)
      }
   }

   const applyScaleToAllMarkers = (): void => {
      if (displayedSceneData == null) return

      const markerScale = getCurrentScale(displayedSceneData.type)

      markerObjectsRef.current.forEach(markerObject => {
         const markerData = markerObject.userData?.data as Marker | undefined

         markerObject.scale.setScalar(markerScale)

         if (markerData != null) {
            updateMarkerTransform(
               markerObject,
               markerData,
               displayedSceneData.type,
               markerScale,
            )
         }
      })
   }

   const onControlsChange = (): void => {
      if (displayedSceneData == null) {
         return
      }

      cameraDistanceToPlanetCenter.current = displayedSceneData.controls.getDistance()

      if (displayedSceneData.type === SceneType.SPHERICAL) {
         globeMarkerAdjustedScale.current = clamp(
            cameraDistanceToPlanetCenter.current / 1e3,
            GLOBE_SCENE_PUCK_MIN_SCALE,
            GLOBE_SCENE_PUCK_MAX_SCALE,
         )
      } else if (displayedSceneData.type === SceneType.PLANE) {
         planeMarkerAdjustedScale.current = clamp(
            cameraDistanceToPlanetCenter.current / 1e2,
            PLANE_SCENE_PUCK_MIN_SCALE,
            PLANE_SCENE_PUCK_MAX_SCALE,
         )
      }

      applyScaleToAllMarkers()
   }

   const syncMarkerObjects = async (): Promise<void> => {
      if (displayedSceneData == null) {
         return
      }

      const isEarthScene = displayedSceneData.type === SceneType.SPHERICAL
         || displayedSceneData.type === SceneType.PLANE

      const currentScene = displayedSceneData.scene

      if (attachedSceneRef.current !== currentScene) {
         markerObjectsRef.current.forEach(markerObject => {
            markerObject.removeFromParent()
         })
         attachedSceneRef.current = currentScene
      }

      if (!isEarthScene) {
         markerObjectsRef.current.forEach(markerObject => {
            markerObject.removeFromParent()
         })
         return
      }

      let markerTemplate: THREE.Group
      try {
         markerTemplate = await loadSharedMarkerTemplate()
      } catch (error) {
         console.error('Error loading marker model:', error)
         return
      }

      const visibleMarkerIds = new Set<string>()

      for (const marker of markers) {
         if (!hasRenderableCoordinates(marker)) continue

         const markerColor = marker.isPuck ? PUCK_COLOR : marker.color
         let markerObject = markerObjectsRef.current.get(marker.id)

         if (markerObject == null) {
            markerObject = cloneMarkerInstance(markerTemplate)
            markerObject.name = `marker:${marker.id}`
            markerObject.renderOrder = MARKER_RENDER_ORDER
            markerObjectsRef.current.set(marker.id, markerObject)
         }

         applyMarkerColor(markerObject, markerColor)
         const markerScale = getCurrentScale(displayedSceneData.type)

         markerObject.scale.setScalar(markerScale)
         updateMarkerTransform(
            markerObject,
            marker,
            displayedSceneData.type,
            markerScale,
         )
         markerObject.userData = { data: marker }

         if (markerObject.parent !== currentScene) {
            currentScene.add(markerObject)
         }

         visibleMarkerIds.add(marker.id)
      }

      for (const [markerId, markerObject] of markerObjectsRef.current.entries()) {
         if (visibleMarkerIds.has(markerId)) continue

         markerObject.removeFromParent()
         disposeMarkerMaterials(markerObject)
         markerObjectsRef.current.delete(markerId)
      }
   }

   useEffect(() => {
      void syncMarkerObjects()
   }, [markers, displayedSceneData])

   useEffect(() => {
      if (displayedSceneData?.controls == null) return

      displayedSceneData.controls.addEventListener('change', onControlsChange)
      onControlsChange()

      return (): void => {
         displayedSceneData.controls.removeEventListener('change', onControlsChange)
      }
   }, [displayedSceneData])

   useEffect(() => {
      return (): void => {
         markerObjectsRef.current.forEach(markerObject => {
            markerObject.removeFromParent()
            disposeMarkerMaterials(markerObject)
         })

         markerObjectsRef.current.clear()
         attachedSceneRef.current = null
      }
   }, [])

   return null
}
