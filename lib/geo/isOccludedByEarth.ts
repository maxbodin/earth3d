import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { EARTH_RADIUS } from '@/app/constants/numbers'

// TODO : refactor in dedicated file.
const EARTH_SPHERE = new THREE.Sphere(new THREE.Vector3(0, 0, 0), EARTH_RADIUS)

/**
 * Returns `true` when the given intersection point lies behind the Earth sphere
 * from the camera's perspective.
 *
 * Allows to discard clicks on objects that are on the far side of the globe
 * and not visible to the user.
 *
 * Always returns `false` for non-spherical scenes (plane mode has no occlusion).
 *
 * @param intersectionPoint - The 3D world-space position of the hit object.
 * @param raycaster - A `THREE.Raycaster` already configured with the current camera and pointer.
 * @param sceneType - The active scene type.
 * @returns `true` when the point is occluded by the Earth.
 */
export function isOccludedByEarth(
   intersectionPoint: THREE.Vector3,
   raycaster: THREE.Raycaster,
   sceneType: SceneType,
): boolean {
   if (sceneType !== SceneType.SPHERICAL) return false

   const nearSurface = new THREE.Vector3()
   const hit = raycaster.ray.intersectSphere(EARTH_SPHERE, nearSurface)

   if (hit == null) return false

   const distanceToSurface = raycaster.ray.origin.distanceTo(nearSurface)
   const distanceToObject = raycaster.ray.origin.distanceTo(intersectionPoint)

   return distanceToObject > distanceToSurface
}