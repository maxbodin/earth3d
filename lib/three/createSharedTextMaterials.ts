import * as THREE from 'three'

interface CreateSharedTextMaterialsOptions {
   frontColor: string
   sideColor: string
   depthTest?: boolean
   depthWrite?: boolean
   transparent?: boolean
}

/**
 * Creates a pair of `MeshBasicMaterial`s for the front face and side of 3D text.
 *
 * @param options - Colors and depth/transparency settings.
 * @returns A two-element array of materials `[front, side]`.
 */
export function createSharedTextMaterials({
                                                 frontColor,
                                                 sideColor,
                                                 depthTest = true,
                                                 depthWrite = true,
                                                 transparent = false,
                                              }: CreateSharedTextMaterialsOptions): THREE.MeshBasicMaterial[] {
   return [frontColor, sideColor].map(color => {
      return new THREE.MeshBasicMaterial({
         color,
         toneMapped: false,
         side: THREE.DoubleSide,
         depthTest,
         depthWrite,
         transparent,
      })
   })
}