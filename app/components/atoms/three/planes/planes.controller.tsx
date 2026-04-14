import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { useData } from '@/app/context_todo_improve/dataContext'
import { PLANE_MATERIAL } from '@/app/constants/materials'
import { PLANE_GLB_MODEL } from '@/app/constants/paths'
import { PLANE_SCALE } from '@/app/constants/numbers'
import { usePlanes } from '@/app/components/atoms/three/planes/planes.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { clearGroup } from '@/app/helpers/threeHelper'
import { AssetManager } from '@/app/lib/assetManager'

let sharedPlaneTemplate: THREE.Group | null = null
const planeLoadPromise = useRef<Promise<THREE.Group> | null>(null)

export function PlanesController(): null {
   const { planesData } = useData()
   const { displayedSceneData } = useScenes()
   const { displayedPlanesGroup } = usePlanes()
   const planesCache = useRef<Map<string, THREE.Group>>(new Map())

   /**
    * Load plane model once and cache it.
    */
   const loadPlaneModel = async (): Promise<THREE.Group> => {
      if (sharedPlaneTemplate) return sharedPlaneTemplate
      if (planeLoadPromise.current) return planeLoadPromise.current

      planeLoadPromise.current = AssetManager.loadModel(PLANE_GLB_MODEL)
         .then((template) => {
            // Apply material to all meshes
            template.traverse((child) => {
               if (child instanceof THREE.Mesh) {
                  child.material = PLANE_MATERIAL
               }
            })
            sharedPlaneTemplate = template
            return template
         })
         .catch((error) => {
            console.error('Error loading plane model:', error)
            throw error
         })

      return planeLoadPromise.current
   }

   /**
    * Create or reuse a plane instance.
    */
   const getPlaneInstance = (template: THREE.Group): THREE.Group => {
      return template.clone()
   }

   /**
    * Add planes to the scene with optimized instance creation.
    */
   const addPlanes = async (): Promise<void> => {
      if (!displayedPlanesGroup || !planesData.current || !displayedSceneData?.scene) {
         return
      }

      // Clear previous planes efficiently.
      clearGroup(displayedPlanesGroup)
      planesCache.current.clear()

      try {
         const template = await loadPlaneModel()

         for (const state of planesData.current) {
            const lat = state[5]
            const lon = state[6]
            const altitude = state[7]
            const trueTrack = state[10]

            if (lat == null || lon == null) continue

            const position = latLongToVector3(lon, lat)

            // Adjust position based on altitude.
            const adjustedAltitude = altitude / 100000
            const normal = position.clone().normalize()
            position.add(normal.multiplyScalar(adjustedAltitude))

            // Clone plane model.
            const plane = getPlaneInstance(template)
            plane.position.copy(position)

            // Apply rotation based on true track.
            if (trueTrack !== null) {
               plane.rotation.y = trueTrack
            }

            plane.scale.setScalar(PLANE_SCALE)
            plane.userData = { data: state }

            displayedPlanesGroup.add(plane)
         }

         displayedSceneData.scene.add(displayedPlanesGroup)
      } catch (error) {
         console.error('Error adding planes:', error)
      }
   }

   useEffect(() => {
      addPlanes()

      return () => {
         clearGroup(displayedPlanesGroup)
      }
   }, [planesData.current])

   return null
}
