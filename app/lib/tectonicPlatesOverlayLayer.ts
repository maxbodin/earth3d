import * as THREE from 'three'
import { EARTH_RADIUS, TECTONIC_PLATES_PLANE_Y_OFFSET, TECTONIC_PLATES_RADIUS } from '@/app/constants/numbers'
import { TECTONIC_PLATES_RENDER_ORDER } from '@/app/constants/renderOrder'
import { TECTONIC_PLATES_NAME } from '@/app/constants/strings'
import { SceneType } from '@/app/enums/sceneType'

// TODO : refactor in separate file.
export type MaterialFactory = (
   node: unknown,
   material: THREE.Material | THREE.Material[],
) => THREE.Material | THREE.Material[]

type TectonicMapView = THREE.Object3D & {
   cacheTiles?: boolean
   frustumCulled: boolean
}

export interface OpacityRef {
   current: number
}

// TODO : refactor in constants.
const SPHERE_SCALE_FACTOR = TECTONIC_PLATES_RADIUS / EARTH_RADIUS
const PLANISPHERE_POLYGON_OFFSET_FACTOR = -4
const PLANISPHERE_POLYGON_OFFSET_UNITS = -4

// TODO : refactor in constants.
const SPHERE_COLOR_SAMPLE = 'vec4 color = texture2D(uTexture, vec2(x, y));\n\t\t\tgl_FragColor = color;'
const SPHERE_COLOR_SAMPLE_WITH_OPACITY =
   'vec4 color = texture2D(uTexture, vec2(x, y));\n\t\t\tif (color.a < 0.01) discard;\n\t\t\tgl_FragColor = vec4(color.rgb, color.a * uOpacity);'

// TODO : refactor in separate file.


// TODO : refactor in separate file as generic.
export function applyTectonicRenderOrder(object: THREE.Object3D): void {
   object.traverse((child) => {
      child.renderOrder = TECTONIC_PLATES_RENDER_ORDER
   })
}

/**
 * Properly disposes a tectonic MapView by aborting all pending tile requests
 * and marking every node as disposed.  This prevents late async tile loads from
 * calling nodeReady() on already-removed nodes.
 */

// TODO : refactor in separate file as generic.
export function disposeTectonicMapView(mapView: THREE.Object3D): void {
   const visited = new Set<THREE.Object3D>()
   disposeMapNode(mapView, visited)
}

// TODO : refactor in separate file as generic.
function disposeMapNode(node: THREE.Object3D, visited: Set<THREE.Object3D>): void {
   if (visited.has(node)) return
   visited.add(node)

   const mapNode = node as THREE.Object3D & {
      tileRequestController?: AbortController | null
      disposed?: boolean
      childrenCache?: THREE.Object3D[] | null
   }

   if (mapNode.tileRequestController != null) {
      mapNode.tileRequestController.abort()
      mapNode.tileRequestController = null
   }
   mapNode.disposed = true

   for (const child of node.children) {
      disposeMapNode(child, visited)
   }

   if (mapNode.childrenCache != null) {
      for (const cachedChild of mapNode.childrenCache) {
         disposeMapNode(cachedChild, visited)
      }
   }
}

// TODO : refactor in separate file as generic.
export function configureTectonicMapView(mapView: TectonicMapView, sceneType: SceneType): void {
   mapView.name = TECTONIC_PLATES_NAME
   mapView.renderOrder = TECTONIC_PLATES_RENDER_ORDER
   applyTectonicRenderOrder(mapView)

   if (sceneType === SceneType.SPHERICAL) {
      mapView.frustumCulled = false
   }
   mapView.cacheTiles = sceneType === SceneType.SPHERICAL

   if (sceneType === SceneType.SPHERICAL) {
      mapView.scale.setScalar(SPHERE_SCALE_FACTOR)
      return
   }

   mapView.position.set(0, TECTONIC_PLATES_PLANE_Y_OFFSET, 0)
}

// TODO : refactor in separate file as generic.
export function configureTectonicMaterial(
   material: THREE.Material | THREE.Material[],
   sceneType: SceneType,
   opacity: number,
): THREE.Material | THREE.Material[] {
   if (Array.isArray(material)) {
      material.forEach((singleMaterial) => configureTectonicSingleMaterial(singleMaterial, sceneType, opacity))
      return material
   }

   configureTectonicSingleMaterial(material, sceneType, opacity)
   return material
}

function configureTectonicSingleMaterial(material: THREE.Material, sceneType: SceneType, opacity: number): void {
   if (material.userData?._tectonicConfiguredFor === sceneType) {
      applyMaterialOpacity(material, opacity)
      return
   }

   if (material instanceof THREE.ShaderMaterial) {
      material.uniforms.uOpacity = { value: opacity }
      material.fragmentShader = material.fragmentShader.replace(
         'uniform sampler2D uTexture;',
         'uniform sampler2D uTexture;\n\t\tuniform float uOpacity;',
      )
      material.fragmentShader = material.fragmentShader.replace(
         SPHERE_COLOR_SAMPLE,
         SPHERE_COLOR_SAMPLE_WITH_OPACITY,
      )
   }

   if (material instanceof THREE.MeshBasicMaterial) {
      material.alphaTest = 0.01
   }

   if (sceneType === SceneType.PLANE) {
      material.userData._planisphereOverlayMaterial = true
      material.transparent = false
      material.depthWrite = true
      material.depthTest = true
      material.blending = THREE.CustomBlending
      material.blendSrc = THREE.SrcAlphaFactor
      material.blendDst = THREE.OneMinusSrcAlphaFactor
      material.blendSrcAlpha = THREE.OneFactor
      material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor
      material.blendEquation = THREE.AddEquation
      material.polygonOffset = true
      material.polygonOffsetFactor = PLANISPHERE_POLYGON_OFFSET_FACTOR
      material.polygonOffsetUnits = PLANISPHERE_POLYGON_OFFSET_UNITS
   } else {
      material.transparent = true
      material.depthWrite = false
   }

   applyMaterialOpacity(material, opacity)
   material.needsUpdate = true
   material.userData._tectonicConfiguredFor = sceneType
}

/**
 * Creates a material factory that applies tectonic plate styling and render order
 * to each tile node and its material.
 */
export function createTectonicMaterialFactory(sceneType: SceneType, opacityRef: OpacityRef): MaterialFactory {
   return (node, material) => {
      if (node && typeof node === 'object' && 'frustumCulled' in node) {
         const object = node as THREE.Object3D
         object.renderOrder = TECTONIC_PLATES_RENDER_ORDER
         if (sceneType === SceneType.SPHERICAL) {
            object.frustumCulled = false
         }
      }
      return configureTectonicMaterial(material, sceneType, opacityRef.current)
   }
}

// TODO : refactor in separate file as generic.
/**
 * Applies an opacity value (0–1) to all materials in a MapView tree.
 * Handles both MeshBasicMaterial (.opacity) and ShaderMaterial (uOpacity uniform).
 */
export function applyOpacityToMapView(mapView: THREE.Object3D, opacity: number): void {
   mapView.traverse((node) => {
      const mesh = node as THREE.Mesh
      if (mesh.material == null) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of materials) {
         applyMaterialOpacity(mat, opacity)
      }
   })
}

// TODO : refactor in separate file as generic.
function applyMaterialOpacity(mat: THREE.Material, opacity: number): void {
   if (mat instanceof THREE.ShaderMaterial && mat.uniforms?.uOpacity != null) {
      mat.uniforms.uOpacity.value = opacity
   } else {
      mat.opacity = opacity
   }
}