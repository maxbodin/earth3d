import * as THREE from 'three'

export function removeObject3D(
   object3D: THREE.Mesh,
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
   object3D.removeFromParent()
   scene?.remove(object3D)
}
