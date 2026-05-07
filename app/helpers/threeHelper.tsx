import * as THREE from 'three'
import { disposeNode } from '@/lib/three/disposeObject'

// TODO : Merge with asset manager.
/**
 * Fully dispose of an Object3D and all its resources.
 *
 * @param object3D - The object to dispose of
 * @param scene - The scene to remove from
 */
export function removeObject3D(
   object3D: THREE.Object3D | null | undefined,
   scene: THREE.Scene | null | undefined,
): void {
   if (!object3D) return

   disposeNode(object3D)
   object3D.removeFromParent()

   if (scene && object3D.parent === scene) {
      scene.remove(object3D)
   }
}

/**
 * Batch dispose of multiple objects efficiently.
 *
 * @param objects - Array of objects to dispose
 * @param scene - The scene to remove from (optional)
 */
export function batchRemoveObjects(
   objects: (THREE.Object3D | null | undefined)[],
   scene: THREE.Scene | null | undefined
): void {
   for (const obj of objects) {
      removeObject3D(obj, scene)
   }
}