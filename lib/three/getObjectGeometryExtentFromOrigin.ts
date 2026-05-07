import * as THREE from 'three'
import { EARTH_RADIUS } from '@/app/constants/numbers'

export const EARTH_SCENE_TEXT_BASE_SIZE = EARTH_RADIUS / 1e2
export const EARTH_SCENE_TEXT_BASE_DEPTH = EARTH_RADIUS / 2e5

export function getObjectGeometryExtentFromOrigin(object: THREE.Object3D): number {
   object.updateWorldMatrix(true, true)

   const inverseRootMatrix = object.matrixWorld.clone().invert()
   let maxExtent = 0

   object.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return

      const geometry = child.geometry as THREE.BufferGeometry | undefined
      if (geometry == null) return

      if (geometry.boundingSphere == null) {
         geometry.computeBoundingSphere()
      }

      const boundingSphere = geometry.boundingSphere
      if (boundingSphere == null) return

      const childToRootMatrix = inverseRootMatrix.clone().multiply(child.matrixWorld)
      const sphereCenterInRootSpace = boundingSphere.center.clone().applyMatrix4(childToRootMatrix)
      const scale = new THREE.Vector3().setFromMatrixScale(childToRootMatrix)
      const maxScale = Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z))
      const scaledRadius = boundingSphere.radius * maxScale

      maxExtent = Math.max(maxExtent, sphereCenterInRootSpace.length() + scaledRadius)
   })

   return maxExtent
}
