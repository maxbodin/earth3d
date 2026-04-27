import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { SceneType } from '@/app/enums/sceneType'
import {
   EARTH_RADIUS,
   GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
   GLOBE_SCENE_PUCK_MAX_SCALE, // TODO : Rename correctly.
   GLOBE_SCENE_PUCK_MIN_SCALE,
   PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
   PLANE_SCENE_PUCK_MAX_SCALE,
   PLANE_SCENE_PUCK_MIN_SCALE,
} from '@/app/constants/numbers'
import { clamp } from '@/lib/math/clamp'
import { interpolate } from '@/lib/math/interpolate'

export const EARTH_SCENE_TEXT_BASE_SIZE = EARTH_RADIUS / 1e2
export const EARTH_SCENE_TEXT_BASE_DEPTH = EARTH_RADIUS / 2e5
export const DEFAULT_TEXT_CURVE_SEGMENTS = 4

type SceneLodSettings = {
   distanceDivisor: number
   distanceOffset: number
   minScale: number
   maxScale: number
}

export type SceneTextLodConfig = {
   spherical: SceneLodSettings
   plane: SceneLodSettings
}

export const EARTH_SCENE_COUNTRY_TEXT_LOD_CONFIG: SceneTextLodConfig = {
   spherical: {
      distanceDivisor: 1e7,
      distanceOffset: -0.3,
      minScale: GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
      maxScale: GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   },
   plane: {
      distanceDivisor: 1e5,
      distanceOffset: 0,
      minScale: PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
      maxScale: PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   },
}

type CenteredTextGeometryOptions = {
   text: string
   font: Font
   size: number
   depth: number
   curveSegments?: number
   bevelEnabled?: boolean
   bevelThickness?: number
   bevelSize?: number
   bevelOffset?: number
   bevelSegments?: number
}

export function createCenteredTextGeometry(
   options: CenteredTextGeometryOptions,
): TextGeometry {
   const geometry = new TextGeometry(options.text, {
      font: options.font,
      size: options.size,
      depth: options.depth,
      curveSegments: options.curveSegments ?? DEFAULT_TEXT_CURVE_SEGMENTS,
      bevelEnabled: options.bevelEnabled ?? false,
      bevelThickness: options.bevelThickness,
      bevelSize: options.bevelSize,
      bevelOffset: options.bevelOffset,
      bevelSegments: options.bevelSegments,
   })

   geometry.computeBoundingSphere()
   geometry.computeBoundingBox()
   geometry.center()

   return geometry
}

export function computeSceneTextScale(
   sceneType: SceneType,
   cameraDistance: number,
   config: SceneTextLodConfig,
): number {
   if (sceneType === SceneType.SPHERICAL) {
      return clamp(
         cameraDistance / config.spherical.distanceDivisor + config.spherical.distanceOffset,
         config.spherical.minScale,
         config.spherical.maxScale,
      )
   }

   if (sceneType === SceneType.PLANE) {
      return clamp(
         cameraDistance / config.plane.distanceDivisor + config.plane.distanceOffset,
         config.plane.minScale,
         config.plane.maxScale,
      )
   }

   return config.plane.minScale
}

const NEAR_CAMERA_DAMPING_SCALE_MULTIPLIER = 3e2
const GLOBE_NEAR_CAMERA_MIN_DAMPING = 1.5
const PLANE_NEAR_CAMERA_MIN_DAMPING = 0.1

export function computeTextScaleDamping(
   sceneType: SceneType,
   cameraDistance: number,
): number {
   const isSpherical = sceneType === SceneType.SPHERICAL

   const puckMinScale = isSpherical ? GLOBE_SCENE_PUCK_MIN_SCALE : PLANE_SCENE_PUCK_MIN_SCALE
   const puckMaxScale = isSpherical ? GLOBE_SCENE_PUCK_MAX_SCALE : PLANE_SCENE_PUCK_MAX_SCALE
   const puckDivisor = isSpherical ? 1e3 : 1e2
   const nearCameraMinDamping = isSpherical ? GLOBE_NEAR_CAMERA_MIN_DAMPING : PLANE_NEAR_CAMERA_MIN_DAMPING

   const adjustedPuckScale = clamp(cameraDistance / puckDivisor, puckMinScale, puckMaxScale)
   const nearCameraDampingThreshold = puckMinScale * NEAR_CAMERA_DAMPING_SCALE_MULTIPLIER

   if (adjustedPuckScale >= nearCameraDampingThreshold) return 1

   const dampingRange = Math.max(nearCameraDampingThreshold - puckMinScale, Number.EPSILON)
   const normalized = clamp((adjustedPuckScale - puckMinScale) / dampingRange, 0, 1)

   return interpolate(nearCameraMinDamping, 1, normalized)
}

export function computeDampedTextScale(
   sceneType: SceneType,
   cameraDistance: number,
   config: SceneTextLodConfig,
): number {
   const lodScale = computeSceneTextScale(sceneType, cameraDistance, config)
   const damping = computeTextScaleDamping(sceneType, cameraDistance)

   return lodScale * damping
}

export function getObjectGeometryExtentFromOrigin(object: THREE.Object3D): number {
   object.updateWorldMatrix(true, true)

   const inverseRootMatrix = object.matrixWorld.clone().invert()
   let maxExtent = 0

   object.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return

      const geometry = child.geometry as THREE.BufferGeometry | undefined
      if (geometry == null) return

      if (geometry.boundingSphere == null) {
         geometry.computeBoundingSphere()
      }

      const boundingSphere = geometry.boundingSphere
      if (boundingSphere == null) return

      const childToRootMatrix = inverseRootMatrix.clone().multiply(child.matrixWorld)
      const sphereCenterInRootSpace = boundingSphere.center.clone().applyMatrix4(childToRootMatrix)
      const scale = new THREE.Vector3().setFromMatrixScale(childToRootMatrix)
      const maxScale = Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z))
      const scaledRadius = boundingSphere.radius * maxScale

      maxExtent = Math.max(maxExtent, sphereCenterInRootSpace.length() + scaledRadius)
   })

   return maxExtent
}
