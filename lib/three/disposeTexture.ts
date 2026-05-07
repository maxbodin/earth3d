import * as THREE from 'three'

/**
 * Dispose of a texture and clean up references.
 *
 * @param texture - The texture to dispose
 */
export function disposeTexture(texture: THREE.Texture | null | undefined): void {
   if (!texture) return
   texture.dispose()
}