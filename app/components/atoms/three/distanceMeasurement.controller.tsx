'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useMarkersDashboard, } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { haversineDistance } from '@/lib/geo/haversineDistance'
import { SceneType } from '@/app/enums/sceneType'
import { AssetManager } from '@/app/lib/assetManager'
import { TEXT_FONT } from '@/app/constants/paths'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { EARTH_RADIUS } from '@/app/constants/numbers'
import { DISTANCE_LABEL_RENDER_ORDER, DISTANCE_LINE_RENDER_ORDER } from '@/app/constants/renderOrder'
import {
   computeDampedTextScale,
   createCenteredTextGeometry,
   EARTH_SCENE_COUNTRY_TEXT_LOD_CONFIG,
   EARTH_SCENE_TEXT_BASE_DEPTH,
   EARTH_SCENE_TEXT_BASE_SIZE,
} from '@/app/lib/threeText3d'
import { DistanceMeasurement } from '@/app/types/distanceMeasurement'
import { midpoint } from '@/lib/geo/midpoint'
import { formatDistanceLabel } from '@/lib/format/formatDistanceLabel'

const ARC_SEGMENTS = 64
const ARC_ALTITUDE_FACTOR = 0.03
const ARC_BASE_OFFSET = EARTH_RADIUS * 0.001
const PLANE_SEGMENT_LIFT = 50
const GLOBE_LINE_WIDTH = EARTH_RADIUS / 2e2
const PLANE_LINE_WIDTH = EARTH_RADIUS / 2e2

let sharedFontPromise: Promise<Font> | null = null
let sharedFont: Font | null = null

async function loadFont(): Promise<Font> {
   if (sharedFont != null) return sharedFont
   if (sharedFontPromise != null) return sharedFontPromise

   sharedFontPromise = AssetManager.loadFont(TEXT_FONT).then((f): Font => {
      sharedFont = f
      return f
   })

   return sharedFontPromise
}

function buildGreatCircleArcPoints(
   latA: number,
   lonA: number,
   latB: number,
   lonB: number,
   segments: number,
): THREE.Vector3[] {
   const startVec = latLongToVector3(latA, lonA)
   const endVec = latLongToVector3(latB, lonB)

   const startDir = startVec.clone().normalize()
   const endDir = endVec.clone().normalize()

   const angle = Math.acos(THREE.MathUtils.clamp(startDir.dot(endDir), -1, 1))
   const sinAngle = Math.sin(angle)

   const points: THREE.Vector3[] = []

   for (let i = 0; i <= segments; i++) {
      const t = i / segments

      let dir: THREE.Vector3

      if (sinAngle < 1e-6) {
         dir = startDir.clone().lerp(endDir, t).normalize()
      } else {
         const a = Math.sin((1 - t) * angle) / sinAngle
         const b = Math.sin(t * angle) / sinAngle
         dir = startDir.clone().multiplyScalar(a).add(endDir.clone().multiplyScalar(b)).normalize()
      }

      const parabolicLift = 4 * t * (1 - t)
      const altitude = EARTH_RADIUS + ARC_BASE_OFFSET + parabolicLift * angle * EARTH_RADIUS * ARC_ALTITUDE_FACTOR

      points.push(dir.multiplyScalar(altitude))
   }

   return points
}

function buildPlaneSegmentPoints(
   latA: number,
   lonA: number,
   latB: number,
   lonB: number,
   segments: number,
): THREE.Vector3[] {
   const posA = ThreeGeoUnitsUtils.datumsToSpherical(latA, lonA)
   const posB = ThreeGeoUnitsUtils.datumsToSpherical(latB, lonB)

   const points: THREE.Vector3[] = []

   for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const x = posA.x + (posB.x - posA.x) * t
      const z = -(posA.y + (posB.y - posA.y) * t)
      points.push(new THREE.Vector3(x, PLANE_SEGMENT_LIFT, z))
   }

   return points
}

function lightenColor(hex: string, factor: number): string {
   const color = new THREE.Color(hex)
   color.lerp(new THREE.Color(0xffffff), factor)
   return `#${color.getHexString()}`
}

function darkenColor(hex: string, factor: number): string {
   const color = new THREE.Color(hex)
   color.multiplyScalar(factor)
   return `#${color.getHexString()}`
}

export function DistanceMeasurementController(): null {
   const { displayedSceneData } = useScenes()
   const { markers, distanceMeasurement, setDistanceMeasurement } = useMarkersDashboard()

   const lineMeshRef = useRef<THREE.Mesh | null>(null)
   const lineMaterialRef = useRef<MeshLineMaterial | null>(null)
   const labelRef = useRef<THREE.Mesh | null>(null)
   const attachedSceneRef = useRef<THREE.Scene | null>(null)
   const animFrameRef = useRef<number | null>(null)

   const cleanup = (): void => {
      if (lineMeshRef.current != null) {
         lineMeshRef.current.removeFromParent()
         lineMeshRef.current.geometry.dispose()
         lineMeshRef.current = null
      }

      if (lineMaterialRef.current != null) {
         lineMaterialRef.current.dispose()
         lineMaterialRef.current = null
      }

      if (labelRef.current != null) {
         labelRef.current.removeFromParent()
         labelRef.current.geometry.dispose()
         const materials = Array.isArray(labelRef.current.material)
            ? labelRef.current.material
            : [labelRef.current.material]
         materials.forEach(m => m.dispose())
         labelRef.current = null
      }

      if (animFrameRef.current != null) {
         cancelAnimationFrame(animFrameRef.current)
         animFrameRef.current = null
      }

      attachedSceneRef.current = null
   }

   const sync = async (
      measurement: DistanceMeasurement | null,
      sceneData: typeof displayedSceneData,
   ): Promise<void> => {
      cleanup()

      if (measurement == null || sceneData == null) return

      const isEarthScene =
         sceneData.type === SceneType.SPHERICAL || sceneData.type === SceneType.PLANE

      if (!isEarthScene) return

      const { markerA, markerB, midpoint: mid, distanceKm, color } = measurement
      const scene = sceneData.scene
      const isSpherical = sceneData.type === SceneType.SPHERICAL

      const points = isSpherical
         ? buildGreatCircleArcPoints(
            markerA.latitude, markerA.longitude,
            markerB.latitude, markerB.longitude,
            ARC_SEGMENTS,
         )
         : buildPlaneSegmentPoints(
            markerA.latitude, markerA.longitude,
            markerB.latitude, markerB.longitude,
            ARC_SEGMENTS,
         )

      const lineGeometry = new MeshLineGeometry()
      const lineWidth = isSpherical ? GLOBE_LINE_WIDTH : PLANE_LINE_WIDTH
      lineGeometry.setPoints(points, () => lineWidth)

      const resolution = isSpherical
         ? new THREE.Vector2(window.innerWidth, window.innerHeight)
         : new THREE.Vector2(1e6, 1e6)

      const lineMaterial = new MeshLineMaterial({
         resolution,
         color,
      })
      lineMaterial.depthTest = false
      lineMaterial.depthWrite = false
      lineMaterial.transparent = true

      const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial)
      lineMesh.renderOrder = DISTANCE_LINE_RENDER_ORDER
      lineMesh.frustumCulled = false
      lineMesh.name = 'distance-measurement-line'
      scene.add(lineMesh)
      lineMeshRef.current = lineMesh
      lineMaterialRef.current = lineMaterial

      let font: Font
      try {
         font = await loadFont()
      } catch {
         return
      }

      const textGeometry = createCenteredTextGeometry({
         text: formatDistanceLabel(distanceKm),
         font,
         size: EARTH_SCENE_TEXT_BASE_SIZE,
         depth: EARTH_SCENE_TEXT_BASE_DEPTH,
         curveSegments: 4,
         bevelEnabled: false,
      })

      const labelColor = lightenColor(color, 0.3)
      const labelSideColor = darkenColor(labelColor, 0.4)

      const labelMaterials = [
         new THREE.MeshBasicMaterial({
            color: labelColor,
            toneMapped: false,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
            transparent: true,
         }),
         new THREE.MeshBasicMaterial({
            color: labelSideColor,
            toneMapped: false,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
            transparent: true,
         }),
      ]

      const label = new THREE.Mesh(textGeometry, labelMaterials)
      label.renderOrder = DISTANCE_LABEL_RENDER_ORDER
      label.frustumCulled = false
      label.name = 'distance-measurement-label'

      const initialScale = computeDampedTextScale(
         sceneData.type,
         sceneData.controls.getDistance(),
         EARTH_SCENE_COUNTRY_TEXT_LOD_CONFIG,
      )

      if (isSpherical) {
         const midPos = latLongToVector3(mid.latitude, mid.longitude)
         const normal = midPos.clone().normalize()
         const midArcIndex = Math.floor(ARC_SEGMENTS / 2)
         const arcMidAlt = points[midArcIndex].length()
         const labelLift = arcMidAlt + EARTH_RADIUS * 0.005
         label.position.copy(normal.multiplyScalar(labelLift))
      } else {
         const worldMid = ThreeGeoUnitsUtils.datumsToSpherical(mid.latitude, mid.longitude)
         const labelLift = PLANE_SEGMENT_LIFT + initialScale * EARTH_SCENE_TEXT_BASE_SIZE * 0.5
         label.position.set(worldMid.x, labelLift, -worldMid.y)
      }

      label.scale.setScalar(initialScale)

      if (sceneData.camera != null) {
         label.lookAt(sceneData.camera.position)
      }

      scene.add(label)
      labelRef.current = label
      attachedSceneRef.current = scene

      const updateLabelTransform = (): void => {
         if (labelRef.current == null || sceneData.camera == null) return

         labelRef.current.lookAt(sceneData.camera.position)

         const cameraDistance = sceneData.controls.getDistance()

         const scale = computeDampedTextScale(
            sceneData.type,
            cameraDistance,
            EARTH_SCENE_COUNTRY_TEXT_LOD_CONFIG,
         )
         labelRef.current.scale.setScalar(scale)

         if (!isSpherical) {
            const worldMid = ThreeGeoUnitsUtils.datumsToSpherical(mid.latitude, mid.longitude)
            const labelLift = PLANE_SEGMENT_LIFT + scale * EARTH_SCENE_TEXT_BASE_SIZE * 0.5
            labelRef.current.position.set(worldMid.x, labelLift, -worldMid.y)
         }
      }

      sceneData.controls.addEventListener('change', updateLabelTransform)

      const animateBillboard = (): void => {
         if (labelRef.current == null || sceneData.camera == null) return

         labelRef.current.lookAt(sceneData.camera.position)
         animFrameRef.current = requestAnimationFrame(animateBillboard)
      }

      animFrameRef.current = requestAnimationFrame(animateBillboard)

      label.userData = { updateLabelTransform }
   }

   useEffect(() => {
      if (distanceMeasurement == null) return

      const { markerA, markerB } = distanceMeasurement
      const freshA = markers.find(m => m.id === markerA.id)
      const freshB = markers.find(m => m.id === markerB.id)

      if (freshA == null || freshB == null) {
         setDistanceMeasurement(null)
         return
      }

      const positionChanged =
         freshA.latitude !== markerA.latitude ||
         freshA.longitude !== markerA.longitude ||
         freshB.latitude !== markerB.latitude ||
         freshB.longitude !== markerB.longitude

      if (positionChanged) {
         setDistanceMeasurement({
            ...distanceMeasurement,
            markerA: freshA,
            markerB: freshB,
            distanceKm: haversineDistance(freshA, freshB),
            midpoint: midpoint(freshA, freshB),
         })
      }
   }, [markers])

   useEffect(() => {
      void sync(distanceMeasurement, displayedSceneData)

      return (): void => {
         if (labelRef.current?.userData?.updateLabelTransform != null && displayedSceneData?.controls != null) {
            displayedSceneData.controls.removeEventListener('change', labelRef.current.userData.updateLabelTransform)
         }
         cleanup()
      }
   }, [distanceMeasurement, displayedSceneData])

   return null
}
