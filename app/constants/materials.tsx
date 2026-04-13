import * as THREE from 'three'

/**
 * Shared materials pool.
 *
 * All materials are created once at module initialization and reused
 * across the application to reduce memory allocations and GPU state changes.
 */

// Airport material.
export const AIRPORT_MATERIAL: THREE.MeshBasicMaterial =
   new THREE.MeshBasicMaterial({
      color: 0x00bfff,
      depthWrite: true,
      depthTest: true,
   })

// Plane material.
export const PLANE_MATERIAL: THREE.MeshBasicMaterial =
   new THREE.MeshBasicMaterial({
      color: 0xffbf00,
      depthWrite: true,
      depthTest: true,
   })

// Selected plane material.
export const SELECTED_PLANE_MATERIAL: THREE.MeshBasicMaterial =
   new THREE.MeshBasicMaterial({
      color: 0x00bfff,
      depthWrite: true,
      depthTest: true,
   })

// Vessel material.
export const VESSEL_MATERIAL: THREE.MeshBasicMaterial =
   new THREE.MeshBasicMaterial({
      color: 0x36393B,
      depthWrite: true,
      depthTest: true,
   })

// Country frontier material.
export const FRONTIER_MATERIAL: THREE.LineBasicMaterial =
   new THREE.LineBasicMaterial({
      color: 0xDC0073,
      linewidth: 1,
      depthWrite: true,
      depthTest: true,
   })

// Sun emissive material for glow effect.
export const SUN_MATERIAL: THREE.MeshBasicMaterial =
   new THREE.MeshBasicMaterial({
      color: 0xffff00,
      fog: false,
   })

// Generic label material.
export const LABEL_MATERIAL_FRONT: THREE.MeshBasicMaterial =
   new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.FrontSide,
      depthWrite: true,
      depthTest: true,
   })

// Generic label material.
export const LABEL_MATERIAL_SIDE: THREE.MeshBasicMaterial =
   new THREE.MeshBasicMaterial({
      color: 0x444444,
      side: THREE.FrontSide,
      depthWrite: true,
      depthTest: true,
   })

/**
 * Material pool for quick access.
 */
export const MaterialPool = {
   airport: AIRPORT_MATERIAL,
   plane: PLANE_MATERIAL,
   selectedPlane: SELECTED_PLANE_MATERIAL,
   vessel: VESSEL_MATERIAL,
   frontier: FRONTIER_MATERIAL,
   sun: SUN_MATERIAL,
   labelFront: LABEL_MATERIAL_FRONT,
   labelSide: LABEL_MATERIAL_SIDE,
}

/**
 * Dispose of all shared materials.
 */
export const disposeAllMaterials = (): void => {
   for (const material of Object.values(MaterialPool)) {
      material.dispose()
   }
}