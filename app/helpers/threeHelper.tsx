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
   if (!object3D) return;
   
   disposeNode(object3D);

   object3D.removeFromParent();
   scene?.remove(object3D);
}

export function clearGroup(group: THREE.Group): void {
   if (!group) return;
   for (let i = group.children.length - 1; i >= 0; i--) {
      removeObject3D(group.children[i], null);
   }
}

function disposeNode(node: any): void {
   if (node.geometry) {
      node.geometry.dispose()
   }

   if (node.material) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      for (const material of materials) {
         if (material.map) material.map.dispose()
         if (material.lightMap) material.lightMap.dispose()
         if (material.bumpMap) material.bumpMap.dispose()
         if (material.normalMap) material.normalMap.dispose()
         if (material.specularMap) material.specularMap.dispose()
         if (material.envMap) material.envMap.dispose()
         if (material.alphaMap) material.alphaMap.dispose()
         if (material.aoMap) material.aoMap.dispose()
         if (material.displacementMap) material.displacementMap.dispose()
         if (material.emissiveMap) material.emissiveMap.dispose()
         if (material.metalnessMap) material.metalnessMap.dispose()
         if (material.roughnessMap) material.roughnessMap.dispose()
         material.dispose()
      }
   }

   if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
         disposeNode(node.children[i]);
         node.remove(node.children[i]);
      }
   }
}