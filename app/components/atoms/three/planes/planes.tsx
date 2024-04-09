import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { usePlanet } from '@/app/context/planetContext'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { useData } from '@/app/context/dataContext'
import { onPlaneSelected } from '@/app/components/atoms/dataFetch/planeDataFetch/planeDataFetch'
import {
   PLANE_MATERIAL,
   SELECTED_PLANE_MATERIAL,
} from '@/app/constants/materials'
import { PLANE_GLB_MODEL } from '@/app/constants/paths'
import { PLANE_SCALE } from '@/app/constants/numbers'

export function Planes({
   scene,
   camera,
}: {
   scene: THREE.Scene | null
   camera: THREE.PerspectiveCamera | null
}): null {
   const { planet } = usePlanet()
   const { planesData } = useData()
   const planesGroup = useRef<THREE.Group | null>(new THREE.Group())

   // Create group of planes.
   const addPlanes = (): void => {
      if (!planesGroup.current || !planesData.current) return

      // Clear previous planes.
      planesGroup.current.clear()

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
                  lat as number
               )

               // Adjust position based on altitude
               const adjustedAltitude: number = altitude / 100000
               const normal: THREE.Vector3 = position.clone().normalize() // Normal vector from the center of the planet to the point
               const adjustedPosition: THREE.Vector3 = position.add(
                  normal.multiplyScalar(adjustedAltitude)
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
               planesGroup.current!.add(plane)
            })
         },
         (xhr): void => {
            //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
         },
         (error): void => {
            console.error('Error loading plane model:', error)
         }
      )

      if (planet && planesGroup.current) {
         planet.add(planesGroup.current)
         scene?.add(planet)
      }
   }

   useEffect(() => {
      // Add event listener to detect clicks on the window.
      window.addEventListener('click', onMouseClick)
      addPlanes()
      return cleanup
   }, [planesData.current])

   const cleanup = (): void => {
      window.removeEventListener('click', onMouseClick)
   }

   // Function to handle click events.
   const selectedPlane = useRef<THREE.Object3D<THREE.Object3DEventMap> | null>(
      null
   )

   // TODO MAKE A CUSTOM COMPONENT OR HELPER TO GET INTERSECTING OBJECTS
   // TODO, AS THIS CODE IS USED MULTIPLE TIMES
   const onMouseClick = (event: { clientX: number; clientY: number }): void => {
      if (camera == null || !planesGroup.current) return

      const raycaster: THREE.Raycaster = new THREE.Raycaster()
      const mouse: THREE.Vector2 = new THREE.Vector2()

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const intersects = raycaster.intersectObjects(
         planesGroup.current!.children
      )

      if (intersects.length > 0) {
         if (selectedPlane.current) {
            // Reset mesh material to yellow.
            selectedPlane.current.traverse((child) => {
               if (child instanceof THREE.Mesh) {
                  child.material = PLANE_MATERIAL
               }
            })
         }

         selectedPlane.current = intersects[0].object.parent!

         // Apply blue material to all meshes in the plane model, this is the selected plane.
         intersects[0].object.parent!.traverse((child): void => {
            if (child instanceof THREE.Mesh) {
               child.material = SELECTED_PLANE_MATERIAL
            }
         })

         onPlaneSelected(intersects[0].object.parent!.userData)
      }
   }

   return null
}
