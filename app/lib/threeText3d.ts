import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { SceneType } from '@/app/enums/sceneType'
import { clamp } from '@/app/helpers/numberHelper'
import {
   EARTH_RADIUS,
   GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
   PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
} from '@/app/constants/numbers'

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
