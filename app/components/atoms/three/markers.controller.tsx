'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { SceneType } from '@/app/enums/sceneType'
import { AssetManager } from '@/app/lib/assetManager'
import { MARKER_GLB_MODEL } from '@/app/constants/paths'
import { Marker } from '@/app/types/marker'
import { PUCK_COLOR } from '@/lib/constants/colors'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { EARTH_RADIUS } from '@/app/constants/numbers'
import { MARKER_RENDER_ORDER, MARKER_TITLE_RENDER_ORDER } from '@/app/constants/renderOrder'
import {
   computeDampedScale,
   computeScaleDamping,
   computeSceneLodScale,
   COUNTRY_TEXT_LOD_CONFIG,
   MARKER_PUCK_LOD_CONFIG,
} from '@/app/lib/sceneLod'
import { latLongToVector3 } from '@/lib/geo/latLongToVector3'
import { loadSharedTextFont } from '@/lib/three/loadSharedTextFont'
import { createTextGeometry } from '@/lib/three/createTextGeometry'
import { createSharedTextMaterials } from '@/lib/three/createSharedTextMaterials'
import {
   EARTH_SCENE_TEXT_BASE_DEPTH,
   EARTH_SCENE_TEXT_BASE_SIZE,
   getObjectGeometryExtentFromOrigin
} from '@/lib/three/getObjectGeometryExtentFromOrigin'
import { getTextMeshHalfHeight } from '@/lib/three/getTextMeshHalfHeight'
import { publishThreeSceneDebug } from '@/lib/threeSceneDebug'

let sharedMarkerTemplate: THREE.Group | null = null
let markerModelLoadPromise: Promise<THREE.Group> | null = null

// TODO : Refactor in constants.
const UP_AXIS = new THREE.Vector3(0, 1, 0)
const GLOBE_MARKER_SCALE_MULTIPLIER = 8
const PLANE_MARKER_SCALE_MULTIPLIER = 10
const GLOBE_MARKER_SURFACE_LIFT_MULTIPLIER = 0.45
const PLANE_MARKER_SURFACE_LIFT_MULTIPLIER = 0.1
const GLOBE_MARKER_TITLE_GAP_BASE = EARTH_RADIUS / 1e5
const GLOBE_MARKER_TITLE_GAP_SCALE_MULTIPLIER = 0.003
const PLANE_MARKER_TITLE_GAP_BASE = EARTH_RADIUS / 8e9
const PLANE_MARKER_TITLE_GAP_SCALE_MULTIPLIER = 0.002

const getMarkerLiftMultiplier = (sceneType: SceneType): number => {
   return sceneType === SceneType.SPHERICAL
      ? GLOBE_MARKER_SURFACE_LIFT_MULTIPLIER
      : PLANE_MARKER_SURFACE_LIFT_MULTIPLIER
}

const getMarkerTitleGapScaleMultiplier = (sceneType: SceneType): number => {
   return sceneType === SceneType.SPHERICAL
   ? GLOBE_MARKER_TITLE_GAP_SCALE_MULTIPLIER
   : PLANE_MARKER_TITLE_GAP_SCALE_MULTIPLIER
}

const getMarkerTitleGapBase = (sceneType: SceneType): number => {
   return sceneType === SceneType.SPHERICAL
   ? GLOBE_MARKER_TITLE_GAP_BASE
   : PLANE_MARKER_TITLE_GAP_BASE
}

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

   const isUntouchedDefaultMarker = marker.latitude === 0
      && marker.longitude === 0
      && marker.name.trim() === ''
      && marker.address.trim() === ''

   // Keep clean startup behavior while allowing titled/default markers to render.
   return !isUntouchedDefaultMarker
}

const shouldRenderMarkerTitle = (
   marker: Marker,
   areMarkerTitlesVisible: boolean,
): boolean => {
   return areMarkerTitlesVisible
      && marker.showTitleOnMap
      && marker.name.trim().length > 0
      && hasRenderableCoordinates(marker)
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
   const { markers, areMarkerTitlesVisible } = useMarkersDashboard()

   const markerObjectsRef = useRef<Map<string, THREE.Group>>(new Map())
   const markerTitleObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map())
   const markerTitleGeometryCacheRef = useRef<Map<string, TextGeometry>>(new Map())
   const markerTitleMaterialsRef = useRef<THREE.Material[] | null>(null)
   const markerTitleFontRef = useRef<Font | null>(null)
   const attachedSceneRef = useRef<THREE.Scene | null>(null)

   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const planeMarkerAdjustedScale = useRef<number>(MARKER_PUCK_LOD_CONFIG.plane.maxScale)
   const globeMarkerAdjustedScale = useRef<number>(MARKER_PUCK_LOD_CONFIG.spherical.maxScale)
   const titleBillboardAnimationFrameRef = useRef<number | null>(null)

   const getCurrentScale = (sceneType: SceneType): number => {
      if (sceneType === SceneType.SPHERICAL) {
         return globeMarkerAdjustedScale.current * GLOBE_MARKER_SCALE_MULTIPLIER
      }

      if (sceneType === SceneType.PLANE) {
         return planeMarkerAdjustedScale.current * PLANE_MARKER_SCALE_MULTIPLIER
      }

      return 1
   }

   const publishMarkerDebugSnapshotFromCurrentObjects = (): void => {
      const markerTitleMeshes = Array.from(markerTitleObjectsRef.current.values())
      const markerTitleTexts = markerTitleMeshes
         .map(titleMesh => String(titleMesh.userData?.textKey ?? '').trim())
         .filter((titleText): titleText is string => titleText.length > 0)

      let markerTitleMinVisualSize: number | null = null
      let markerTitleMinClearanceFromMarkerTop: number | null = null

      markerTitleMeshes.forEach(titleMesh => {
         const titleVisualSize = titleMesh.scale.x * EARTH_SCENE_TEXT_BASE_SIZE
         markerTitleMinVisualSize = markerTitleMinVisualSize == null
            ? titleVisualSize
            : Math.min(markerTitleMinVisualSize, titleVisualSize)

         const bottomClearanceFromMarkerTop = Number(
            titleMesh.userData?.bottomClearanceFromMarkerTop,
         )

         if (Number.isFinite(bottomClearanceFromMarkerTop)) {
            markerTitleMinClearanceFromMarkerTop = markerTitleMinClearanceFromMarkerTop == null
               ? bottomClearanceFromMarkerTop
               : Math.min(
                  markerTitleMinClearanceFromMarkerTop,
                  bottomClearanceFromMarkerTop,
               )
         }
      })

      publishThreeSceneDebug({
         markerObjectsCount: markerObjectsRef.current.size,
         markerTitlesCount: markerTitleMeshes.length,
         markerTitleTexts,
         markerTitleMinVisualSize,
         markerTitleMinClearanceFromMarkerTop,
         markerTitleSceneType: displayedSceneData?.type ?? null,
         markerTitleScaleDamping: displayedSceneData == null
            ? null
            : computeScaleDamping(displayedSceneData.type, cameraDistanceToPlanetCenter.current)
      })
   }

   const updateMarkerTransform = (
      markerObject: THREE.Group,
      marker: Marker,
      sceneType: SceneType,
      markerScale: number,
   ): void => {
      const markerLiftMultiplier = getMarkerLiftMultiplier(sceneType)
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

   const ensureMarkerTitleMaterials = (): THREE.Material[] => {
      if (markerTitleMaterialsRef.current != null) {
         return markerTitleMaterialsRef.current
      }

      markerTitleMaterialsRef.current = createSharedTextMaterials({
         frontColor: '#f8fafc',
         sideColor: '#475569',
      })

      return markerTitleMaterialsRef.current
   }

   const getOrCreateMarkerTitleGeometry = (title: string): TextGeometry | null => {
      const normalizedTitle = title.trim()
      if (normalizedTitle.length === 0) return null

      const cachedGeometry = markerTitleGeometryCacheRef.current.get(normalizedTitle)
      if (cachedGeometry != null) {
         return cachedGeometry
      }

      const titleFont = markerTitleFontRef.current
      if (titleFont == null) {
         return null
      }

      const newGeometry = createTextGeometry({
         text: normalizedTitle,
         font: titleFont,
         size: EARTH_SCENE_TEXT_BASE_SIZE,
         depth: EARTH_SCENE_TEXT_BASE_DEPTH,
      })
      markerTitleGeometryCacheRef.current.set(normalizedTitle, newGeometry)

      return newGeometry
   }

   const createMarkerTitleMesh = (title: string): THREE.Mesh | undefined => {
      const titleGeometry = getOrCreateMarkerTitleGeometry(title)
      if (titleGeometry == null) return undefined

      const titleMesh = new THREE.Mesh(
         titleGeometry,
         ensureMarkerTitleMaterials(),
      )

      titleMesh.renderOrder = MARKER_TITLE_RENDER_ORDER
      titleMesh.userData = {
         textKey: title.trim(),
      }

      return titleMesh
   }

   const updateMarkerTitleTransform = (
      titleMesh: THREE.Mesh,
      marker: Marker,
      sceneType: SceneType,
      markerScale: number,
      markerGeometryExtent: number,
   ): number => {
      const markerLift = markerScale * getMarkerLiftMultiplier(sceneType)
      const markerTopLift = markerLift + markerGeometryExtent * markerScale
      const titleScale = computeDampedScale(
         sceneType,
         cameraDistanceToPlanetCenter.current,
         COUNTRY_TEXT_LOD_CONFIG,
      )
      const titleHalfHeight = getTextMeshHalfHeight(titleMesh)
      const titleGapFromMarkerTop = getMarkerTitleGapBase(sceneType)
         + markerScale * getMarkerTitleGapScaleMultiplier(sceneType)
      const titleLift = markerTopLift + titleGapFromMarkerTop + titleHalfHeight * titleScale

      if (sceneType === SceneType.SPHERICAL) {
         const markerPosition = latLongToVector3(marker.latitude, marker.longitude)
         const normal = markerPosition.clone().normalize()

         titleMesh.position.copy(
            markerPosition.add(normal.multiplyScalar(titleLift)),
         )
      } else if (sceneType === SceneType.PLANE) {
         const worldPosition = ThreeGeoUnitsUtils.datumsToSpherical(
            marker.latitude,
            marker.longitude,
         )

         titleMesh.position.set(worldPosition.x, titleLift, -worldPosition.y)
      }

      titleMesh.scale.setScalar(titleScale)

      if (displayedSceneData?.camera != null) {
         titleMesh.lookAt(displayedSceneData.camera.position)
      }

      titleMesh.userData = {
         ...titleMesh.userData,
         bottomClearanceFromMarkerTop: titleGapFromMarkerTop,
      }

      return titleGapFromMarkerTop
   }

   const animateMarkerTitlesBillboard = (): void => {
      titleBillboardAnimationFrameRef.current = requestAnimationFrame(animateMarkerTitlesBillboard)

      if (displayedSceneData?.camera == null) {
         return
      }

      markerTitleObjectsRef.current.forEach(titleMesh => {
         titleMesh.lookAt(displayedSceneData.camera.position)
      })
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

      markerTitleObjectsRef.current.forEach(titleMesh => {
         const markerData = titleMesh.userData?.data as Marker | undefined
         const markerObject = markerData == null
            ? undefined
            : markerObjectsRef.current.get(markerData.id)
         const markerGeometryExtent = Number(markerObject?.userData?.geometryExtent ?? 0)

         if (markerData != null) {
            updateMarkerTitleTransform(
               titleMesh,
               markerData,
               displayedSceneData.type,
               markerScale,
               markerGeometryExtent,
            )
         }
      })

      publishMarkerDebugSnapshotFromCurrentObjects()
   }

   const onControlsChange = (): void => {
      if (displayedSceneData == null) {
         return
      }

      cameraDistanceToPlanetCenter.current = displayedSceneData.controls.getDistance()

      const puckLodScale = computeSceneLodScale(
         displayedSceneData.type,
         cameraDistanceToPlanetCenter.current,
         MARKER_PUCK_LOD_CONFIG,
      )

      if (displayedSceneData.type === SceneType.SPHERICAL) {
         globeMarkerAdjustedScale.current = puckLodScale
      } else if (displayedSceneData.type === SceneType.PLANE) {
         planeMarkerAdjustedScale.current = puckLodScale
      }

      applyScaleToAllMarkers()
   }

   const syncMarkerObjects = async (): Promise<void> => {
      if (displayedSceneData == null) {
         publishThreeSceneDebug({
            markerObjectsCount: 0,
            markerTitlesCount: 0,
            markerTitleTexts: [],
            markerTitleMinVisualSize: null,
            markerTitleMinClearanceFromMarkerTop: null,
            markerTitleSceneType: null,
            markerTitleScaleDamping: null,
         })
         return
      }

      const isEarthScene = displayedSceneData.type === SceneType.SPHERICAL
         || displayedSceneData.type === SceneType.PLANE

      const currentScene = displayedSceneData.scene

      if (attachedSceneRef.current !== currentScene) {
         markerObjectsRef.current.forEach(markerObject => {
            markerObject.removeFromParent()
         })

         markerTitleObjectsRef.current.forEach(markerTitle => {
            markerTitle.removeFromParent()
         })

         attachedSceneRef.current = currentScene
      }

      if (!isEarthScene) {
         markerObjectsRef.current.forEach(markerObject => {
            markerObject.removeFromParent()
         })

         markerTitleObjectsRef.current.forEach(markerTitle => {
            markerTitle.removeFromParent()
         })

         publishThreeSceneDebug({
            markerObjectsCount: 0,
            markerTitlesCount: 0,
            markerTitleTexts: [],
            markerTitleMinVisualSize: null,
            markerTitleMinClearanceFromMarkerTop: null,
            markerTitleSceneType: null,
            markerTitleScaleDamping: null,
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

      if (markerTitleFontRef.current == null) {
         try {
            markerTitleFontRef.current = await loadSharedTextFont()
         } catch (error) {
            console.error('Error loading marker title font:', error)
         }
      }

      const visibleMarkerIds = new Set<string>()
      const visibleMarkerTitleIds = new Set<string>()
      const visibleMarkerTitleTexts: string[] = []
      let markerTitleMinVisualSize: number | null = null
      let markerTitleMinClearanceFromMarkerTop: number | null = null
      const markerScale = getCurrentScale(displayedSceneData.type)
      const markerTitleScaleDamping = computeScaleDamping(displayedSceneData.type, cameraDistanceToPlanetCenter.current)

      for (const marker of markers) {
         if (!hasRenderableCoordinates(marker)) continue

         const markerColor = marker.isPuck ? PUCK_COLOR : marker.color
         let markerObject = markerObjectsRef.current.get(marker.id)

         if (markerObject == null) {
            markerObject = cloneMarkerInstance(markerTemplate)
            markerObject.name = `marker:${marker.id}`
            markerObject.renderOrder = MARKER_RENDER_ORDER
            markerObject.userData = {
               geometryExtent: getObjectGeometryExtentFromOrigin(markerObject),
            }
            markerObjectsRef.current.set(marker.id, markerObject)
         }

         const markerGeometryExtent = Number(markerObject.userData?.geometryExtent ?? 0)

         applyMarkerColor(markerObject, markerColor)

         markerObject.scale.setScalar(markerScale)
         updateMarkerTransform(
            markerObject,
            marker,
            displayedSceneData.type,
            markerScale,
         )
         markerObject.userData = {
            ...markerObject.userData,
            data: marker,
         }

         if (markerObject.parent !== currentScene) {
            currentScene.add(markerObject)
         }

         visibleMarkerIds.add(marker.id)

         if (shouldRenderMarkerTitle(marker, areMarkerTitlesVisible)) {
            const titleText = marker.name.trim()
            let titleObject = markerTitleObjectsRef.current.get(marker.id)

            if (titleObject == null || titleObject.userData?.textKey !== titleText) {
               if (titleObject != null) {
                  titleObject.removeFromParent()
               }

               titleObject = createMarkerTitleMesh(titleText)
               if (titleObject == null) {
                  continue
               }

               titleObject.name = `marker-title:${marker.id}`
               markerTitleObjectsRef.current.set(marker.id, titleObject)
            }

            titleObject.userData = {
               ...titleObject.userData,
               data: marker,
               textKey: titleText,
            }

            const titleBottomClearanceFromMarkerTop = updateMarkerTitleTransform(
               titleObject,
               marker,
               displayedSceneData.type,
               markerScale,
               markerGeometryExtent,
            )

            if (titleObject.parent !== currentScene) {
               currentScene.add(titleObject)
            }

            visibleMarkerTitleIds.add(marker.id)
            visibleMarkerTitleTexts.push(titleText)

            const titleVisualSize = titleObject.scale.x * EARTH_SCENE_TEXT_BASE_SIZE
            markerTitleMinVisualSize = markerTitleMinVisualSize == null
               ? titleVisualSize
               : Math.min(markerTitleMinVisualSize, titleVisualSize)

            markerTitleMinClearanceFromMarkerTop = markerTitleMinClearanceFromMarkerTop == null
               ? titleBottomClearanceFromMarkerTop
               : Math.min(markerTitleMinClearanceFromMarkerTop, titleBottomClearanceFromMarkerTop)
         }
      }

      for (const [markerId, markerObject] of markerObjectsRef.current.entries()) {
         if (visibleMarkerIds.has(markerId)) continue

         markerObject.removeFromParent()
         disposeMarkerMaterials(markerObject)
         markerObjectsRef.current.delete(markerId)
      }

      for (const [markerId, markerTitleObject] of markerTitleObjectsRef.current.entries()) {
         if (visibleMarkerTitleIds.has(markerId)) continue

         markerTitleObject.removeFromParent()
         markerTitleObjectsRef.current.delete(markerId)
      }

      publishThreeSceneDebug({
         markerObjectsCount: visibleMarkerIds.size,
         markerTitlesCount: visibleMarkerTitleIds.size,
         markerTitleTexts: visibleMarkerTitleTexts,
         markerTitleMinVisualSize,
         markerTitleMinClearanceFromMarkerTop,
         markerTitleSceneType: displayedSceneData.type,
         markerTitleScaleDamping,
      })
   }

   useEffect(() => {
      void syncMarkerObjects()
   }, [markers, displayedSceneData, areMarkerTitlesVisible])

   useEffect(() => {
      if (displayedSceneData?.controls == null) return

      displayedSceneData.controls.addEventListener('change', onControlsChange)
      onControlsChange()

      return (): void => {
         displayedSceneData.controls.removeEventListener('change', onControlsChange)
      }
   }, [displayedSceneData])

   useEffect(() => {
      if (titleBillboardAnimationFrameRef.current != null) {
         cancelAnimationFrame(titleBillboardAnimationFrameRef.current)
      }

      animateMarkerTitlesBillboard()

      return (): void => {
         if (titleBillboardAnimationFrameRef.current != null) {
            cancelAnimationFrame(titleBillboardAnimationFrameRef.current)
            titleBillboardAnimationFrameRef.current = null
         }
      }
   }, [displayedSceneData])

   useEffect(() => {
      return (): void => {
         markerObjectsRef.current.forEach(markerObject => {
            markerObject.removeFromParent()
            disposeMarkerMaterials(markerObject)
         })

         markerTitleObjectsRef.current.forEach(markerTitleObject => {
            markerTitleObject.removeFromParent()
         })

         markerTitleGeometryCacheRef.current.forEach(geometry => {
            geometry.dispose()
         })

         markerTitleMaterialsRef.current?.forEach(material => {
            material.dispose()
         })

         markerObjectsRef.current.clear()
         markerTitleObjectsRef.current.clear()
         markerTitleGeometryCacheRef.current.clear()
         markerTitleMaterialsRef.current = null
         publishThreeSceneDebug({
            markerObjectsCount: 0,
            markerTitlesCount: 0,
            markerTitleTexts: [],
            markerTitleMinVisualSize: null,
            markerTitleMinClearanceFromMarkerTop: null,
            markerTitleSceneType: null,
            markerTitleScaleDamping: null,
         })
         if (titleBillboardAnimationFrameRef.current != null) {
            cancelAnimationFrame(titleBillboardAnimationFrameRef.current)
            titleBillboardAnimationFrameRef.current = null
         }
         attachedSceneRef.current = null
      }
   }, [])

   return null
}
