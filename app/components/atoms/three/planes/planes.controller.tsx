import * as THREE from 'three'
import { useEffect } from 'react'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { useData } from '@/app/context_todo_improve/dataContext'
import { PLANE_MATERIAL } from '@/app/constants/materials'
import { PLANE_GLB_MODEL } from '@/app/constants/paths'
import { PLANE_SCALE } from '@/app/constants/numbers'
import { usePlanes } from '@/app/components/atoms/three/planes/planes.model'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'

export function PlanesController(): null {
   const { planesData } = useData()
   const { displayedSceneData } = useScenes()
   const { displayedPlanesGroup } = usePlanes()

   // Create group of planes.
   const addPlanes = (): void => {
      if (!displayedPlanesGroup || !planesData.current) return

      // Clear previous planes.
      displayedPlanesGroup.clear()

      // Load plane model.
      const loader: GLTFLoader = new GLTFLoader()
      loader.load(
         PLANE_GLB_MODEL,
         (gltf: GLTF): void => {
            const planeTemplate = gltf.scene

            // Apply yellow material to all meshes in the plane model
            planeTemplate.traverse((child) => {
               if (child instanceof THREE.Mesh) {
                  child.material = PLANE_MATERIAL
               }
            })

            planesData.current.forEach((state: any): void => {
               const lat = state[5]
               const lon = state[6]
               const altitude = state[7] // Altitude represents the distance between the planet and the plane.
               const trueTrack = state[10] // True track in decimal degrees clockwise from north.
               const position: THREE.Vector3 = latLongToVector3(
                  lon as number,
                  lat as number,
               )

               // Adjust position based on altitude
               const adjustedAltitude: number = altitude / 100000
               const normal: THREE.Vector3 = position.clone().normalize() // Normal vector from the center of the planet to the point
               const adjustedPosition: THREE.Vector3 = position.add(
                  normal.multiplyScalar(adjustedAltitude),
               )

               // Clone plane model
               const plane = planeTemplate.clone()
               plane.position.copy(adjustedPosition)

               // Calculate Y rotation based on true_track.
               if (trueTrack !== null) {
                  plane.rotateY(trueTrack)
               }

               plane.scale.set(PLANE_SCALE, PLANE_SCALE, PLANE_SCALE)
               plane.userData = { data: state }
               displayedPlanesGroup.add(plane)
            })
         },
         (xhr): void => {
            //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
         },
         (error): void => {
            console.error('Error loading plane model:', error)
         },
      )

      if (displayedPlanesGroup && displayedSceneData.scene) {
         displayedSceneData.scene.add(displayedPlanesGroup)
      }
   }

   useEffect(() => {
      addPlanes()
   }, [planesData.current])


   return null
}
