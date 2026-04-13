/**
 * Asset Manager for Three.js resources.
 *
 * Centralizes loading and caching of textures, models, and geometries
 * to avoid duplicate loading and reduce memory pressure.
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

interface AssetCache {
  textures: Map<string, THREE.Texture>
  models: Map<string, THREE.Group>
  fonts: Map<string, Font>
  geometries: Map<string, THREE.BufferGeometry>
  materials: Map<string, THREE.Material>
}

class AssetManagerClass {
  private cache: AssetCache
  private readonly textureLoader: THREE.TextureLoader
  private readonly modelLoader: GLTFLoader
  private fontLoader: FontLoader

  constructor() {
    this.cache = {
      textures: new Map(),
      models: new Map(),
      fonts: new Map(),
      geometries: new Map(),
      materials: new Map(),
    }
    this.textureLoader = new THREE.TextureLoader()
    this.modelLoader = new GLTFLoader()
    this.fontLoader = new FontLoader()
  }

  /**
   * Load and cache a texture.
   */
  async loadTexture(url: string): Promise<THREE.Texture> {
    const cached = this.cache.textures.get(url)
    if (cached) return cached

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.cache.textures.set(url, texture)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  /**
   * Load and cache a model.
   */
  async loadModel(url: string): Promise<THREE.Group> {
    const cached = this.cache.models.get(url)
    if (cached) return cached

    return new Promise((resolve, reject) => {
      this.modelLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene.clone()
          this.cache.models.set(url, model)
          resolve(model)
        },
        undefined,
        reject
      )
    })
  }

  /**
   * Load and cache a font.
   */
  async loadFont(url: string): Promise<Font> {
    const cached = this.cache.fonts.get(url)
    if (cached) return cached

    return new Promise((resolve, reject) => {
      this.fontLoader.load(
        url,
        (font) => {
          this.cache.fonts.set(url, font)
          resolve(font)
        },
        undefined,
        reject
      )
    })
  }

  /**
   * Get or create a shared geometry.
   */
  getGeometry(key: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    const cached = this.cache.geometries.get(key)
    if (cached) return cached

    const geometry = factory()
    this.cache.geometries.set(key, geometry)
    return geometry
  }

  /**
   * Get or create a shared material.
   */
  getMaterial(key: string, factory: () => THREE.Material): THREE.Material {
    const cached = this.cache.materials.get(key)
    if (cached) return cached

    const material = factory()
    this.cache.materials.set(key, material)
    return material
  }

  /**
   * Get the shared texture loader.
   */
  getTextureLoader(): THREE.TextureLoader {
    return this.textureLoader
  }

  /**
   * Get the shared model loader.
   */
  getModelLoader(): GLTFLoader {
    return this.modelLoader
  }

  /**
   * Dispose of a specific asset.
   */
  disposeAsset(key: string, type: 'texture' | 'model' | 'font' | 'geometry' | 'material'): void {
    const asset = this.cache[`${type}s` as keyof AssetCache].get(key)
    if (asset) {
      if (asset instanceof THREE.Texture) {
        asset.dispose()
      } else if (asset instanceof THREE.BufferGeometry) {
        asset.dispose()
      } else if (asset instanceof THREE.Material) {
        asset.dispose()
      }
      this.cache[`${type}s` as keyof AssetCache].delete(key)
    }
  }

  /**
   * Clear all cached assets and dispose of them.
   */
  clear(): void {
    this.cache.textures.forEach((texture) => texture.dispose())
    this.cache.geometries.forEach((geometry) => geometry.dispose())
    this.cache.materials.forEach((material) => material.dispose())
    // Models are clones, don't dispose the template.
    this.cache.textures.clear()
    this.cache.geometries.clear()
    this.cache.materials.clear()
    this.cache.models.clear()
    this.cache.fonts.clear()
  }
}

// Singleton instance.
export const AssetManager = new AssetManagerClass()