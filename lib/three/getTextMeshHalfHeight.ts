import * as THREE from 'three'

/**
 * Returns half the bounding-box height of a text mesh (useful for vertical centering).
 * @param textMesh
 */
export function getTextMeshHalfHeight(textMesh: THREE.Mesh): number {
   const geometry = textMesh.geometry as THREE.BufferGeometry

   if (geometry.boundingBox == null) {
      geometry.computeBoundingBox()
   }

   const boundingBox = geometry.boundingBox
   if (boundingBox == null) return 0

   return (boundingBox.max.y - boundingBox.min.y) / 2
}