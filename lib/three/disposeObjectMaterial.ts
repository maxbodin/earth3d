import * as THREE from 'three'
import { disposeTexture } from '@/lib/three/disposeTexture'

/**
 * Dispose of a material and all its associated textures.
 *
 * @param material - The material to dispose (can be single or array)
 */
export function disposeObjectMaterial(
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
            disposeTexture(texture)
            materialTextureProps[prop] = null
         }
      }

      // Dispose the material itself.
      mat.dispose()
   }
}