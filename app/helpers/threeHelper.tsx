import * as THREE from 'three'

/**
 * Fully dispoe of an object3D.
 *
 * @param object3D
 * @param scene
 */
export function removeObject3D(
   object3D: any,
   scene: THREE.Scene | null,
): void {
   if (object3D.geometry) object3D.geometry.dispose()

   if (object3D.material) {
      if (object3D.material instanceof Array) {
         object3D.material.forEach((material: THREE.Material) =>
            material.dispose(),
         )
      } else {
         object3D.material.dispose()
      }
   }

   // disposeNode(object3D)

   // object3D.removeFromParent()
   scene?.remove(object3D)
}


function disposeNode(parentObject: any): void {
   parentObject.traverse(function(node: any): void {
      if (node instanceof THREE.Mesh) {
         if (node.geometry) {
            node.geometry.dispose()
         }

         if (node.material.map) node.material.map.dispose()
         if (node.material.lightMap) node.material.lightMap.dispose()
         if (node.material.bumpMap) node.material.bumpMap.dispose()
         if (node.material.normalMap) node.material.normalMap.dispose()
         if (node.material.specularMap) node.material.specularMap.dispose()
         if (node.material.envMap) node.material.envMap.dispose()

         node.material.dispose()
      }
   })
}