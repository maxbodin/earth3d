import { SceneType } from '@/app/enums/sceneType'
import {
   GLOBE_PLANE_MAX_SCALE,
   GLOBE_PLANE_MIN_SCALE,
   GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
   GLOBE_SCENE_PUCK_MAX_SCALE,
   GLOBE_SCENE_PUCK_MIN_SCALE,
   GLOBE_SCENE_VESSEL_MAX_SCALE,
   GLOBE_SCENE_VESSEL_MIN_SCALE,
   PLANE_SCENE_AIRPORT_MAX_SCALE,
   PLANE_SCENE_AIRPORT_MIN_SCALE,
   PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
   PLANE_SCENE_PLANE_MAX_SCALE,
   PLANE_SCENE_PLANE_MIN_SCALE,
   PLANE_SCENE_PUCK_MAX_SCALE,
   PLANE_SCENE_PUCK_MIN_SCALE,
   PLANE_SCENE_VESSEL_MAX_SCALE,
   PLANE_SCENE_VESSEL_MIN_SCALE,
} from '@/app/constants/numbers'
import { clamp } from '@/lib/math/clamp'
import { interpolate } from '@/lib/math/interpolate'

type SceneLodSettings = {
   distanceDivisor: number
   distanceOffset: number
   minScale: number
   maxScale: number
}

export type SceneLodConfig = {
   spherical: SceneLodSettings
   plane: SceneLodSettings
}

export const COUNTRY_TEXT_LOD_CONFIG: SceneLodConfig = {
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

export const MARKER_PUCK_LOD_CONFIG: SceneLodConfig = {
   spherical: {
      distanceDivisor: 1e3,
      distanceOffset: 0,
      minScale: GLOBE_SCENE_PUCK_MIN_SCALE,
      maxScale: GLOBE_SCENE_PUCK_MAX_SCALE,
   },
   plane: {
      distanceDivisor: 1e2,
      distanceOffset: 0,
      minScale: PLANE_SCENE_PUCK_MIN_SCALE,
      maxScale: PLANE_SCENE_PUCK_MAX_SCALE,
   },
}

export const AIRCRAFT_LOD_CONFIG: SceneLodConfig = {
   spherical: {
      distanceDivisor: 8500,
      distanceOffset: 0,
      minScale: GLOBE_PLANE_MIN_SCALE,
      maxScale: GLOBE_PLANE_MAX_SCALE,
   },
   plane: {
      distanceDivisor: 1e2,
      distanceOffset: 0,
      minScale: PLANE_SCENE_PLANE_MIN_SCALE,
      maxScale: PLANE_SCENE_PLANE_MAX_SCALE,
   },
}

export const AIRPORT_LOD_CONFIG: SceneLodConfig = {
   spherical: {
      distanceDivisor: 10,
      distanceOffset: 0,
      minScale: PLANE_SCENE_AIRPORT_MIN_SCALE,
      maxScale: PLANE_SCENE_AIRPORT_MAX_SCALE,
   },
   plane: {
      distanceDivisor: 10,
      distanceOffset: 0,
      minScale: PLANE_SCENE_AIRPORT_MIN_SCALE,
      maxScale: PLANE_SCENE_AIRPORT_MAX_SCALE,
   },
}

export const VESSEL_LOD_CONFIG: SceneLodConfig = {
   spherical: {
      distanceDivisor: 1e4,
      distanceOffset: 0,
      minScale: GLOBE_SCENE_VESSEL_MIN_SCALE,
      maxScale: GLOBE_SCENE_VESSEL_MAX_SCALE,
   },
   plane: {
      distanceDivisor: 1e3,
      distanceOffset: 0,
      minScale: PLANE_SCENE_VESSEL_MIN_SCALE,
      maxScale: PLANE_SCENE_VESSEL_MAX_SCALE,
   },
}

export const DISTANCE_LINE_LOD_CONFIG: SceneLodConfig = {
   spherical: {
      distanceDivisor: 1e7,
      distanceOffset: 0,
      minScale: 0.4,
      maxScale: 2,
   },
   plane: {
      distanceDivisor: 1e6,
      distanceOffset: 0,
      minScale: 0.001,
      maxScale: 0.2,
   },
}

export function computeSceneLodScale(
   sceneType: SceneType,
   cameraDistance: number,
   config: SceneLodConfig,
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

const NEAR_CAMERA_DAMPING_SCALE_MULTIPLIER = 5e2
const GLOBE_NEAR_CAMERA_MIN_DAMPING = 1.5
const PLANE_NEAR_CAMERA_MIN_DAMPING = 0.01

export function computeScaleDamping(
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

export function computeDampedScale(
   sceneType: SceneType,
   cameraDistance: number,
   config: SceneLodConfig,
): number {
   const lodScale = computeSceneLodScale(sceneType, cameraDistance, config)
   const damping = computeScaleDamping(sceneType, cameraDistance)

   return lodScale * damping
}
