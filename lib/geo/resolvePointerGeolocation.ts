import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { Geolocation, ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { EARTH_RADIUS } from '@/app/constants/numbers'

// TODO : refactor in dedicated file.
const EARTH_SPHERE = new THREE.Sphere(new THREE.Vector3(0, 0, 0), EARTH_RADIUS)
const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

/**
 * Resolves a geolocation from a raycaster by intersecting either the Earth sphere
 * (in spherical mode) or the horizontal ground plane (in plane mode).
 *
 * Uses mathematical primitives instead of mesh intersection, so it does not
 * depend on any specific scene object such as the planet mesh or the plane map.
 *
 * @param raycaster - A `THREE.Raycaster` already configured with the current camera and pointer.
 * @param sceneType - The active scene type (spherical or plane).
 * @returns The resolved geolocation, or `null` if the ray misses the target surface.
 */
export function resolveRaycastGeolocation(
   raycaster: THREE.Raycaster,
   sceneType: SceneType,
): Geolocation | null {
   if (sceneType === SceneType.SPHERICAL) {
      const target = new THREE.Vector3()
      const hit = raycaster.ray.intersectSphere(EARTH_SPHERE, target)
      return hit == null ? null : ThreeGeoUnitsUtils.vectorToDatums(target)
   }

   if (sceneType === SceneType.PLANE) {
      const target = new THREE.Vector3()
      const hit = raycaster.ray.intersectPlane(GROUND_PLANE, target)
      return hit == null ? null : ThreeGeoUnitsUtils.sphericalToDatums(target.x, -target.z)
   }

   return null
}
