'use client'
import { useEffect } from 'react'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useVessels } from '@/app/components/atoms/three/vessels/vessels.model'
import { useAirports } from '@/app/components/atoms/three/airports/airports.model'
import { ObjectType } from '@/app/enums/objectType'
import { usePlanes } from '@/app/components/atoms/three/planes/planes.model'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'

export function ClickHandler(): null {

   const raycaster: THREE.Raycaster = new THREE.Raycaster()
   const mouse: THREE.Vector2 = new THREE.Vector2()

   const { displayedSceneData } = useScenes()
   const { setSelectedObjectType, setSelectedObjectData } = useSelection()
   const { displayedVesselsGroup } = useVessels()
   const { displayedAirportsGroup } = useAirports()
   const { displayedPlanesGroup } = usePlanes()

   /**
    * Handle click on vessel.
    */
   const clickOnVessel = (): void => {
      if (!displayedVesselsGroup) return

      const intersectsVessels = raycaster.intersectObjects(
         displayedVesselsGroup!.children,
      )

      if (intersectsVessels.length > 0) {
         const selectedVesselObject: any = intersectsVessels[0].object.parent
         const selectedVesselData: any = selectedVesselObject.userData.data

         if (selectedVesselData === null || selectedVesselData === undefined)
            return

         setSelectedObjectType(ObjectType.VESSEL)
         setSelectedObjectData(selectedVesselData)
      }
   }

   /**
    * Handle click on airport.
    */
   const clickOnAirport = (): void => {
      if (!displayedAirportsGroup) return

      const intersects = raycaster.intersectObjects(
         Array.from(displayedAirportsGroup),
      )

      if (intersects.length > 0) {
         setSelectedObjectData(intersects[0].object.userData)
         setSelectedObjectType(ObjectType.AIRPORT)
      }
   }

   /**
    * Handle click on plane.
    */
   const clickOnPlanes = (): void => {
      if (!displayedPlanesGroup) return

      const intersects = raycaster.intersectObjects(
         displayedPlanesGroup!.children,
      )

      if (intersects.length > 0) {
         setSelectedObjectData(intersects[0].object.userData)
         setSelectedObjectType(ObjectType.PLANE)


         /*
         // TODO WORK IN PROGRESS PROCESS CLICK ON PLANE

            // Function to handle click events.
            const selectedPlane = useRef<THREE.Object3D<THREE.Object3DEventMap> | null>(
               null,
            )

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

                  onPlaneSelected(intersects[0].object.parent!.userData)*/
      }
   }

   /**
    * Function to handle click events.
    * @param event
    */
   const onMouseClick = (event: { clientX: number; clientY: number }): void => {
      if (displayedSceneData == null || displayedSceneData.camera == null)
         return

      // Use mouse position to create a raycast.
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, displayedSceneData.camera)

      clickOnVessel()
      clickOnAirport()
      clickOnPlanes()
   }

   const cleanup = (): void => {
      window.removeEventListener('click', onMouseClick)
   }

   useEffect(() => {
      window.addEventListener('click', onMouseClick)

      // Clean up the event listener.
      return cleanup
   }, [displayedSceneData])

   return null
}
