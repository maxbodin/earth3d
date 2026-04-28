import * as THREE from 'three'
import { disposeNode } from '@/lib/three/disposeObject'

/**
 * Clear a group and dispose of all children recursively.
 *
 * @param group - The group to clear
 */
export function clearGroup(group: THREE.Group | null | undefined): void {
   if (!group) return

   while (group.children.length > 0) {
      const child = group.children[0]
      disposeNode(child)
      group.remove(child)
   }
}