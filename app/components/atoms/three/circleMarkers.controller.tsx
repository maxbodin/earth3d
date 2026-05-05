'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { CircleMarker } from '@/app/types/circleMarker'
import { Geolocation, ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { resolveRaycastGeolocation } from '@/lib/geo/resolvePointerGeolocation'
import { lightenColor } from '@/lib/color/lightenColor'
import { darkenColor } from '@/lib/color/darkenColor'
import { CIRCLE_GEOMETRY_SEGMENTS, EARTH_RADIUS } from '@/app/constants/numbers'
import {
   CIRCLE_MARKER_HANDLE_RENDER_ORDER,
   CIRCLE_MARKER_LABEL_RENDER_ORDER,
   CIRCLE_MARKER_LINE_RENDER_ORDER,
} from '@/app/constants/renderOrder'
import {
   computeDampedScale,
   computeSceneLodScale,
   COUNTRY_TEXT_LOD_CONFIG,
   DISTANCE_LINE_LOD_CONFIG,
   MARKER_PUCK_LOD_CONFIG
} from '@/app/lib/sceneLod'
import { latLongToVector3 } from '@/lib/geo/latLongToVector3'
import { haversineDistance } from '@/lib/geo/haversineDistance'
import { formatDistanceLabel } from '@/lib/format/formatDistanceLabel'
import { normalizeCircleRadiusKm } from '@/lib/normalize/normalizeCircleRadiusKm'
import { buildCircleCoordinates } from '@/lib/geo/buildCircleCoordinates'
import { destinationPoint } from '@/lib/geo/destinationPoint'
import { loadSharedTextFont } from '@/lib/three/loadSharedTextFont'
import { EARTH_SCENE_TEXT_BASE_DEPTH, EARTH_SCENE_TEXT_BASE_SIZE } from '@/lib/three/getObjectGeometryExtentFromOrigin'
import { disposeObjectMaterial } from '@/lib/three/disposeObjectMaterial'
import { publishThreeSceneDebug } from '@/lib/threeSceneDebug'
import { createTextGeometry } from '@/lib/three/createTextGeometry'
import { createSharedTextMaterials } from '@/lib/three/createSharedTextMaterials'
import { isValidLatitude } from '@/lib/isValid/isValidLatitude'
import { isValidLongitude } from '@/lib/isValid/isValidLongitude'
import { clampMercatorLatitude } from '@/lib/geo/clampMercatorLatitude'
import { isEarthScene } from '@/lib/is/isEarthScene'

// TODO : Refactor in constants file.
const CIRCLE_SURFACE_LIFT = EARTH_RADIUS * 0.002
const PLANE_CIRCLE_LIFT = 70
const LINE_BASE_WIDTH = EARTH_RADIUS / 2e2
export const WEB_MERCATOR_MAX_LATITUDE = 85.05112878
const SPHERICAL_HANDLE_SCALE_MULTIPLIER = 3
const PLANE_HANDLE_SCALE_MULTIPLIER = 2

/** Three.js scene objects that make up a single rendered circle marker. */
interface CircleSceneObjects {
   lineMesh: THREE.Mesh
   lineMaterial: MeshLineMaterial
   labelMesh: THREE.Mesh | null
   handleMesh: THREE.Mesh
   labelText: string | null
   color: string
   sceneType: SceneType
   linePointCount: number
}

/** Returns `true` when the circle marker has valid finite coordinates and a positive radius. */
function hasRenderableCircle(circleMarker: CircleMarker): boolean {
   return isValidLatitude(circleMarker.latitude)
      && isValidLongitude(circleMarker.longitude)
      && Number.isFinite(circleMarker.radiusKm)
      && circleMarker.radiusKm > 0
}

/** Extracts the center coordinates from a circle marker. */
function getCircleCenter(circleMarker: CircleMarker) {
   return {
      latitude: circleMarker.latitude,
      longitude: circleMarker.longitude,
   }
}

/** Projects a lat/long pair to a Mercator 2D position, clamping latitude to valid bounds. */
function projectPlanePoint(latitude: number, longitude: number): THREE.Vector2 {
   return ThreeGeoUnitsUtils.datumsToSpherical(
      clampMercatorLatitude(latitude),
      longitude,
   )
}

/** Computes the 3D polyline points for a circle ring on the earth surface or flat map. */
function buildCircleLinePoints(
   circleMarker: CircleMarker,
   sceneType: SceneType,
): THREE.Vector3[] {
   const circleCoordinates = buildCircleCoordinates(
      getCircleCenter(circleMarker),
      normalizeCircleRadiusKm(circleMarker.radiusKm),
      CIRCLE_GEOMETRY_SEGMENTS,
   )

   if (sceneType === SceneType.SPHERICAL) {
      return circleCoordinates.map(coordinate => {
         const surfacePosition = latLongToVector3(coordinate.latitude, coordinate.longitude)
         return surfacePosition.normalize().multiplyScalar(EARTH_RADIUS + CIRCLE_SURFACE_LIFT)
      })
   }

   return circleCoordinates.map(coordinate => {
      const projected = projectPlanePoint(coordinate.latitude, coordinate.longitude)
      return new THREE.Vector3(projected.x, PLANE_CIRCLE_LIFT, -projected.y)
   })
}

/** Returns the 3D position of the circle center, offset above the surface for label placement. */
function getCircleCenterPosition(
   circleMarker: CircleMarker,
   sceneType: SceneType,
   labelScale: number,
): THREE.Vector3 {
   if (sceneType === SceneType.SPHERICAL) {
      const surfacePosition = latLongToVector3(circleMarker.latitude, circleMarker.longitude)
      return surfacePosition
         .normalize()
         .multiplyScalar(EARTH_RADIUS + CIRCLE_SURFACE_LIFT + labelScale * EARTH_SCENE_TEXT_BASE_SIZE * 0.5)
   }

   const projected = projectPlanePoint(circleMarker.latitude, circleMarker.longitude)
   return new THREE.Vector3(
      projected.x,
      PLANE_CIRCLE_LIFT + labelScale * EARTH_SCENE_TEXT_BASE_SIZE * 0.5,
      -projected.y,
   )
}

/** Returns the 3D position of the drag handle at the east edge of the circle. */
function getCircleHandlePosition(
   circleMarker: CircleMarker,
   sceneType: SceneType,
): THREE.Vector3 {
   const handleCoordinates = destinationPoint(
      getCircleCenter(circleMarker),
      90,
      normalizeCircleRadiusKm(circleMarker.radiusKm),
   )

   if (sceneType === SceneType.SPHERICAL) {
      const surfacePosition = latLongToVector3(handleCoordinates.latitude, handleCoordinates.longitude)
      return surfacePosition.normalize().multiplyScalar(EARTH_RADIUS + CIRCLE_SURFACE_LIFT * 1.7)
   }

   const projected = projectPlanePoint(handleCoordinates.latitude, handleCoordinates.longitude)
   return new THREE.Vector3(projected.x, PLANE_CIRCLE_LIFT * 1.7, -projected.y)
}

/** Creates a `MeshLineMaterial` for the circle ring with LOD-scaled line width. */
function createCircleLineMaterial(
   color: string,
   sceneType: SceneType,
   cameraDistance: number,
): MeshLineMaterial {
   const lineMaterial = new MeshLineMaterial({
      resolution: sceneType === SceneType.SPHERICAL
         ? new THREE.Vector2(window.innerWidth, window.innerHeight)
         : new THREE.Vector2(1e6, 1e6),
      color,
      lineWidth: computeSceneLodScale(sceneType, cameraDistance, DISTANCE_LINE_LOD_CONFIG),
   })

   lineMaterial.depthTest = false
   lineMaterial.depthWrite = false
   lineMaterial.transparent = true

   return lineMaterial
}

/** Creates the line mesh, material, and point count for a circle ring. */
function createCircleLineMesh(
   circleMarker: CircleMarker,
   sceneType: SceneType,
   cameraDistance: number,
): { lineMesh: THREE.Mesh, lineMaterial: MeshLineMaterial, linePointCount: number } {
   const linePoints = buildCircleLinePoints(circleMarker, sceneType)
   const lineGeometry = new MeshLineGeometry()
   lineGeometry.setPoints(linePoints, () => LINE_BASE_WIDTH)

   const lineMaterial = createCircleLineMaterial(circleMarker.color, sceneType, cameraDistance)
   const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial)
   lineMesh.renderOrder = CIRCLE_MARKER_LINE_RENDER_ORDER
   lineMesh.frustumCulled = false
   lineMesh.name = `circle-marker:${circleMarker.id}`

   return { lineMesh, lineMaterial, linePointCount: linePoints.length }
}

/** Rebuilds the line geometry for an existing circle when its position or radius changes. */
function updateCircleLineGeometry(
   sceneObjects: CircleSceneObjects,
   circleMarker: CircleMarker,
   sceneType: SceneType,
): void {
   const linePoints = buildCircleLinePoints(circleMarker, sceneType)
   const lineGeometry = new MeshLineGeometry()
   lineGeometry.setPoints(linePoints, () => LINE_BASE_WIDTH)

   sceneObjects.lineMesh.geometry.dispose()
   sceneObjects.lineMesh.geometry = lineGeometry
   sceneObjects.linePointCount = linePoints.length
}

/** Creates a sphere mesh used as the draggable radius handle for a circle. */
function createCircleHandleMesh(circleMarker: CircleMarker): THREE.Mesh {
   const handleGeometry = new THREE.SphereGeometry(1, 16, 16)
   const handleMaterial = new THREE.MeshBasicMaterial({
      color: lightenColor(circleMarker.color, 0.2),
      toneMapped: false,
      depthTest: true,
      depthWrite: true,
   })
   const handleMesh = new THREE.Mesh(handleGeometry, handleMaterial)
   handleMesh.name = `circle-radius-handle:${circleMarker.id}`
   handleMesh.renderOrder = CIRCLE_MARKER_HANDLE_RENDER_ORDER
   handleMesh.frustumCulled = false

   return handleMesh
}

/** Updates the handle mesh color to match the circle marker's current color. */
function updateCircleHandleMaterial(handleMesh: THREE.Mesh, circleMarker: CircleMarker): void {
   const material = handleMesh.material
   if (Array.isArray(material)) return

   if (material instanceof THREE.MeshBasicMaterial) {
      material.color.set(lightenColor(circleMarker.color, 0.2))
   }
}

/** Computes the LOD-based uniform scale for a circle handle mesh. */
function getHandleScale(sceneType: SceneType, cameraDistance: number): number {
   const baseScale = computeSceneLodScale(sceneType, cameraDistance, MARKER_PUCK_LOD_CONFIG)

   return sceneType === SceneType.SPHERICAL
      ? baseScale * SPHERICAL_HANDLE_SCALE_MULTIPLIER
      : baseScale * PLANE_HANDLE_SCALE_MULTIPLIER
}

/** Formats the human-readable diameter label string for a circle marker. */
function getCircleDiameterLabel(circleMarker: CircleMarker): string {
   return `Diameter: ${formatDistanceLabel(normalizeCircleRadiusKm(circleMarker.radiusKm) * 2)}`
}

/** Removes and disposes all Three.js resources for a circle's scene objects. */
function disposeCircleSceneObjects(sceneObjects: CircleSceneObjects): void {
   sceneObjects.lineMesh.removeFromParent()
   sceneObjects.lineMesh.geometry.dispose()
   sceneObjects.lineMaterial.dispose()

   sceneObjects.labelMesh?.removeFromParent()
   sceneObjects.labelMesh?.geometry.dispose()
   if (sceneObjects.labelMesh != null) {
      disposeObjectMaterial(sceneObjects.labelMesh.material)
   }

   sceneObjects.handleMesh.removeFromParent()
   sceneObjects.handleMesh.geometry.dispose()
   disposeObjectMaterial(sceneObjects.handleMesh.material)
}

/**
 * Controller that manages the lifecycle of circle marker 3D objects in the scene.
 * @constructor
 */
export function CircleMarkersController(): null {
   const { displayedSceneData } = useScenes()
   const { circleMarkers, setCircleMarkers } = useMarkersDashboard()

   const circleObjectsRef = useRef<Map<string, CircleSceneObjects>>(new Map())
   const attachedSceneRef = useRef<THREE.Scene | null>(null)
   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const billboardAnimationFrameRef = useRef<number | null>(null)
   const draggingCircleIdRef = useRef<string | null>(null)
   const circleMarkersRef = useRef<CircleMarker[]>(circleMarkers)
   const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
   const pointerRef = useRef<THREE.Vector2>(new THREE.Vector2())

   circleMarkersRef.current = circleMarkers

   const publishEmptyDebugSnapshot = (): void => {
      publishThreeSceneDebug({
         circleMarkersCount: 0,
         circleDiameterLabelTexts: [],
         circleMarkerSceneType: displayedSceneData?.type ?? null,
         circleMarkerMinRadiusKm: null,
         circleMarkerLinePointCounts: [],
      })
   }

   const cleanupAll = (): void => {
      circleObjectsRef.current.forEach(disposeCircleSceneObjects)
      circleObjectsRef.current.clear()
      attachedSceneRef.current = null
   }

   const updateLineMaterial = (
      sceneObjects: CircleSceneObjects,
      circleMarker: CircleMarker,
      sceneType: SceneType,
   ): void => {
      const cameraDistance = cameraDistanceToPlanetCenter.current

      if (sceneObjects.color !== circleMarker.color || sceneObjects.sceneType !== sceneType) {
         sceneObjects.lineMaterial.dispose()
         sceneObjects.lineMaterial = createCircleLineMaterial(circleMarker.color, sceneType, cameraDistance)
         sceneObjects.lineMesh.material = sceneObjects.lineMaterial
         sceneObjects.color = circleMarker.color
         sceneObjects.sceneType = sceneType
         return
      }

      sceneObjects.lineMaterial.uniforms.lineWidth.value = computeSceneLodScale(
         sceneType,
         cameraDistance,
         DISTANCE_LINE_LOD_CONFIG,
      )
   }

   const updateLabelTransform = (
      labelMesh: THREE.Mesh,
      circleMarker: CircleMarker,
      sceneType: SceneType,
   ): void => {
      const labelScale = computeDampedScale(
         sceneType,
         cameraDistanceToPlanetCenter.current,
         COUNTRY_TEXT_LOD_CONFIG,
      )

      labelMesh.position.copy(getCircleCenterPosition(circleMarker, sceneType, labelScale))
      labelMesh.scale.setScalar(labelScale)

      if (displayedSceneData?.camera != null) {
         labelMesh.lookAt(displayedSceneData.camera.position)
      }
   }

   const updateHandleTransform = (
      handleMesh: THREE.Mesh,
      circleMarker: CircleMarker,
      sceneType: SceneType,
   ): void => {
      handleMesh.position.copy(getCircleHandlePosition(circleMarker, sceneType))
      handleMesh.scale.setScalar(getHandleScale(sceneType, cameraDistanceToPlanetCenter.current))
   }

   const syncLabel = async (
      sceneObjects: CircleSceneObjects,
      circleMarker: CircleMarker,
      sceneType: SceneType,
   ): Promise<void> => {
      const labelText = getCircleDiameterLabel(circleMarker)

      if (sceneObjects.labelMesh == null || sceneObjects.labelText !== labelText || sceneObjects.color !== circleMarker.color) {
         sceneObjects.labelMesh?.removeFromParent()
         sceneObjects.labelMesh?.geometry.dispose()
         if (sceneObjects.labelMesh != null) {
            disposeObjectMaterial(sceneObjects.labelMesh.material)
         }

         const font = await loadSharedTextFont()
         const labelColor = lightenColor(circleMarker.color, 0.35)
         const labelSideColor = darkenColor(labelColor, 0.45)
         const labelMesh = new THREE.Mesh(
            createTextGeometry(
               {
                  text: labelText,
                  font: font,
                  size: EARTH_SCENE_TEXT_BASE_SIZE,
                  depth: EARTH_SCENE_TEXT_BASE_DEPTH,
               }
            ),
            createSharedTextMaterials({
               frontColor: labelColor,
               sideColor: labelSideColor,
               depthTest: false,
               depthWrite: false,
               transparent: true,
            }),
         )
         labelMesh.name = `circle-diameter-label:${circleMarker.id}`
         labelMesh.renderOrder = CIRCLE_MARKER_LABEL_RENDER_ORDER
         labelMesh.frustumCulled = false
         sceneObjects.labelMesh = labelMesh
         sceneObjects.labelText = labelText
      }

      updateLabelTransform(sceneObjects.labelMesh, circleMarker, sceneType)
   }

   const syncCircleObjects = async (): Promise<void> => {
      if (displayedSceneData == null || !isEarthScene(displayedSceneData.type)) {
         cleanupAll()
         publishEmptyDebugSnapshot()
         return
      }

      const currentScene = displayedSceneData.scene
      cameraDistanceToPlanetCenter.current = displayedSceneData.controls.getDistance()

      if (attachedSceneRef.current !== currentScene) {
         cleanupAll()
         attachedSceneRef.current = currentScene
      }

      const visibleCircleIds = new Set<string>()
      const diameterLabelTexts: string[] = []
      const linePointCounts: number[] = []
      let minRadiusKm: number | null = null

      for (const circleMarker of circleMarkers) {
         if (!hasRenderableCircle(circleMarker)) continue

         let sceneObjects = circleObjectsRef.current.get(circleMarker.id)

         if (sceneObjects == null) {
            const { lineMesh, lineMaterial, linePointCount } = createCircleLineMesh(
               circleMarker,
               displayedSceneData.type,
               cameraDistanceToPlanetCenter.current,
            )
            const handleMesh = createCircleHandleMesh(circleMarker)

            sceneObjects = {
               lineMesh,
               lineMaterial,
               labelMesh: null,
               handleMesh,
               labelText: null,
               color: circleMarker.color,
               sceneType: displayedSceneData.type,
               linePointCount,
            }
            circleObjectsRef.current.set(circleMarker.id, sceneObjects)
         }

         updateCircleLineGeometry(sceneObjects, circleMarker, displayedSceneData.type)
         updateCircleHandleMaterial(sceneObjects.handleMesh, circleMarker)
         updateHandleTransform(sceneObjects.handleMesh, circleMarker, displayedSceneData.type)

         sceneObjects.lineMesh.userData = { data: circleMarker }
         sceneObjects.handleMesh.userData = { data: circleMarker }

         await syncLabel(sceneObjects, circleMarker, displayedSceneData.type)
         updateLineMaterial(sceneObjects, circleMarker, displayedSceneData.type)
         if (sceneObjects.labelMesh != null) {
            sceneObjects.labelMesh.userData = { data: circleMarker, textKey: sceneObjects.labelText }
         }

         if (sceneObjects.lineMesh.parent !== currentScene) {
            currentScene.add(sceneObjects.lineMesh)
         }

         if (sceneObjects.handleMesh.parent !== currentScene) {
            currentScene.add(sceneObjects.handleMesh)
         }

         if (sceneObjects.labelMesh != null && sceneObjects.labelMesh.parent !== currentScene) {
            currentScene.add(sceneObjects.labelMesh)
         }

         visibleCircleIds.add(circleMarker.id)
         diameterLabelTexts.push(getCircleDiameterLabel(circleMarker))
         linePointCounts.push(sceneObjects.linePointCount)
         minRadiusKm = minRadiusKm == null
            ? circleMarker.radiusKm
            : Math.min(minRadiusKm, circleMarker.radiusKm)
      }

      for (const [circleMarkerId, sceneObjects] of circleObjectsRef.current.entries()) {
         if (visibleCircleIds.has(circleMarkerId)) continue

         disposeCircleSceneObjects(sceneObjects)
         circleObjectsRef.current.delete(circleMarkerId)
      }

      publishThreeSceneDebug({
         circleMarkersCount: visibleCircleIds.size,
         circleDiameterLabelTexts: diameterLabelTexts,
         circleMarkerSceneType: displayedSceneData.type,
         circleMarkerMinRadiusKm: minRadiusKm,
         circleMarkerLinePointCounts: linePointCounts,
      })
   }

   const applyScaleToCircleObjects = (): void => {
      if (displayedSceneData == null || !isEarthScene(displayedSceneData.type)) return

      cameraDistanceToPlanetCenter.current = displayedSceneData.controls.getDistance()

      circleObjectsRef.current.forEach(sceneObjects => {
         const circleMarker = sceneObjects.lineMesh.userData?.data as CircleMarker | undefined
         if (circleMarker == null) return

         updateLineMaterial(sceneObjects, circleMarker, displayedSceneData.type)
         updateHandleTransform(sceneObjects.handleMesh, circleMarker, displayedSceneData.type)

         if (sceneObjects.labelMesh != null) {
            updateLabelTransform(sceneObjects.labelMesh, circleMarker, displayedSceneData.type)
         }
      })
   }

   const animateBillboardLabels = (): void => {
      billboardAnimationFrameRef.current = requestAnimationFrame(animateBillboardLabels)

      if (displayedSceneData?.camera == null) return

      circleObjectsRef.current.forEach(sceneObjects => {
         sceneObjects.labelMesh?.lookAt(displayedSceneData.camera.position)
      })
   }

   const resolvePointerGeolocation = (event: PointerEvent): Geolocation | null => {
      if (displayedSceneData == null || displayedSceneData.camera == null) return null

      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycasterRef.current.setFromCamera(pointerRef.current, displayedSceneData.camera)

      return resolveRaycastGeolocation(raycasterRef.current, displayedSceneData.type)
   }

   const resolveHandleCircleId = (event: PointerEvent): string | null => {
      if (displayedSceneData == null || displayedSceneData.camera == null) return null

      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointerRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycasterRef.current.setFromCamera(pointerRef.current, displayedSceneData.camera)

      const handleMeshes = Array.from(circleObjectsRef.current.values()).map(sceneObjects => sceneObjects.handleMesh)
      const intersections = raycasterRef.current.intersectObjects(handleMeshes, false)

      if (intersections[0] == null) return null

      const circleMarker = intersections[0].object.userData?.data as CircleMarker | undefined

      return circleMarker?.id ?? null
   }

   const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as HTMLElement | null
      const isUiPointer = target?.closest(
         '[data-map-pick-ignore="true"],button,a,input,textarea,select,[role="button"],[role="dialog"],[role="listbox"],[role="option"]',
      ) != null

      if (isUiPointer) return

      const circleMarkerId = resolveHandleCircleId(event)
      if (circleMarkerId == null) return

      draggingCircleIdRef.current = circleMarkerId
      if (displayedSceneData?.controls != null) {
         displayedSceneData.controls.enabled = false
      }
      event.preventDefault()
   }

   const onPointerMove = (event: PointerEvent): void => {
      const circleMarkerId = draggingCircleIdRef.current
      if (circleMarkerId == null) return

      const geolocation = resolvePointerGeolocation(event)
      if (geolocation == null) return

      const circleMarker = circleMarkersRef.current.find(currentCircleMarker => currentCircleMarker.id === circleMarkerId)
      if (circleMarker == null) return

      const nextRadiusKm = normalizeCircleRadiusKm(haversineDistance(
         getCircleCenter(circleMarker),
         geolocation,
      ))

      if (Math.abs(nextRadiusKm - circleMarker.radiusKm) < 0.1) return

      setCircleMarkers(prevCircleMarkers => {
         return prevCircleMarkers.map(currentCircleMarker => {
            if (currentCircleMarker.id !== circleMarkerId) return currentCircleMarker

            return {
               ...currentCircleMarker,
               radiusKm: nextRadiusKm,
            }
         })
      })
   }

   const stopDragging = (): void => {
      if (draggingCircleIdRef.current == null) return

      draggingCircleIdRef.current = null
      if (displayedSceneData?.controls != null) {
         displayedSceneData.controls.enabled = true
      }
   }

   useEffect(() => {
      void syncCircleObjects()
   }, [circleMarkers, displayedSceneData])

   useEffect(() => {
      if (displayedSceneData?.controls == null) return

      displayedSceneData.controls.addEventListener('change', applyScaleToCircleObjects)
      applyScaleToCircleObjects()

      return (): void => {
         displayedSceneData.controls.removeEventListener('change', applyScaleToCircleObjects)
      }
   }, [displayedSceneData])

   useEffect(() => {
      if (billboardAnimationFrameRef.current != null) {
         cancelAnimationFrame(billboardAnimationFrameRef.current)
      }

      animateBillboardLabels()

      return (): void => {
         if (billboardAnimationFrameRef.current != null) {
            cancelAnimationFrame(billboardAnimationFrameRef.current)
            billboardAnimationFrameRef.current = null
         }
      }
   }, [displayedSceneData])

   useEffect(() => {
      window.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', stopDragging)
      window.addEventListener('pointercancel', stopDragging)

      return (): void => {
         window.removeEventListener('pointerdown', onPointerDown)
         window.removeEventListener('pointermove', onPointerMove)
         window.removeEventListener('pointerup', stopDragging)
         window.removeEventListener('pointercancel', stopDragging)
      }
   }, [displayedSceneData])

   useEffect(() => {
      return (): void => {
         cleanupAll()
         if (billboardAnimationFrameRef.current != null) {
            cancelAnimationFrame(billboardAnimationFrameRef.current)
            billboardAnimationFrameRef.current = null
         }
         publishEmptyDebugSnapshot()
      }
   }, [])

   return null
}