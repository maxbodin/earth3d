import * as THREE from 'three'

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
 * Clear a group and dispose of all children recursively.
 *
 * @param group - The group to clear
 */
export function clearGroup(group: THREE.Group | null | undefined): void {
   if (!group) return

   for (let i = group.children.length - 1; i >= 0; i--) {
      const child = group.children[i]
      disposeNode(child)
      group.remove(child)
   }
}

/**
 * Recursively dispose of an Object3D and all its resources.
 *
 * @param node - The node to dispose
 */
function disposeNode(node: THREE.Object3D): void {
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

/**
 * Dispose of a material and all its associated textures.
 *
 * @param material - The material to dispose (can be single or array)
 */
export function disposeMaterial(
   material: THREE.Material | THREE.Material[] | null | undefined
): void {
   if (!material) return

   const materials = Array.isArray(material) ? material : [material]

   for (const mat of materials) {
      if (!mat) continue

      // Dispose all texture maps.
      const materialProps = [
         'map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap',
         'envMap', 'alphaMap', 'aoMap', 'displacementMap',
         'emissiveMap', 'metalnessMap', 'roughnessMap',
         'gradientMap', 'transmissionMap', 'iridescenceMap',
         'thicknessMap', 'clearcoatMap', 'clearcoatNormalMap',
         'clearcoatRoughnessMap', 'sheenColorMap', 'sheenRoughnessMap',
         'specularIntensityMap', 'specularColorMap'
      ] as const

      const materialTextureProps = mat as unknown as Record<string, THREE.Texture | null | undefined>

      for (const prop of materialProps) {
         const texture = materialTextureProps[prop]
         if (texture) {
            texture.dispose()
            materialTextureProps[prop] = null
         }
      }

      // Dispose the material itself.
      mat.dispose()
   }
}

/**
 * Dispose of a texture and clean up references.
 *
 * @param texture - The texture to dispose
 */
export function disposeTexture(texture: THREE.Texture | null | undefined): void {
   if (!texture) return
   texture.dispose()
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