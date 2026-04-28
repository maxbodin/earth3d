import * as THREE from 'three'
import { disposeMaterial } from '@/app/helpers/threeHelper'

/**
 * Recursively dispose of an Object3D and all its resources.
 *
 * @param node - The node to dispose
 */
export function disposeNode(node: THREE.Object3D): void {
   const mesh = node as THREE.Mesh
   if (mesh.geometry) {
      mesh.geometry.dispose()
      mesh.geometry = null as any
   }

   // Dispose materials and their textures.
   if (mesh.material) {
      disposeMaterial(mesh.material)
      mesh.material = null as any
   }

   // Recursively dispose children.
   if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
         disposeNode(node.children[i])
      }
   }

   // Clear userData to prevent memory leaks from references.
   if (node.userData) {
      node.userData = {}
   }
}