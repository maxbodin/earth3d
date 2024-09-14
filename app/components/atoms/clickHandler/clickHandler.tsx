'use client'
import { useEffect } from 'react'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useVessels } from '@/app/components/atoms/three/vessels/vessels.model'
import { useAirports } from '@/app/components/atoms/three/airports/airports.model'
import { ObjectType } from '@/app/enums/objectType'
import { usePlanes } from '@/app/components/atoms/three/planes/planes.model'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { usePlanet } from '@/app/components/atoms/three/planet/planet.model'
import { Geolocation, ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { GeocodeResponse } from '@/app/types/orsTypes'
import { reverse } from '@/app/server/services/openRouteService'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { CursorModeType } from '@/app/enums/modeType'
import { usePlaneMap } from '@/app/components/atoms/three/planeMapContext'
import { SceneType } from '@/app/enums/sceneType'

export function ClickHandler(): null {

   const raycaster: THREE.Raycaster = new THREE.Raycaster()
   const mouse: THREE.Vector2 = new THREE.Vector2()

   const { displayedSceneData } = useScenes()
   const { setSelectedObjectType, setSelectedObjectData, cursorMode } = useSelection()
   const { displayedVesselsGroup } = useVessels()
   const { displayedAirportsGroup } = useAirports()
   const { displayedPlanesGroup } = usePlanes()
   const { planet } = usePlanet()
   const { flyToCoordinates } = CameraFlyController()
   const { planeMap } = usePlaneMap()

   /**
    * Handle click on planet.
    */
   const clickOnPlanet = async (): Promise<void> => {
      if (!planet || cursorMode == CursorModeType.HAND) return

      let geolocation: Geolocation | null = null

      if (displayedSceneData.type == SceneType.SPHERICAL) {
         const intersectPlanet = raycaster.intersectObject(
            planet,
         )

         if (intersectPlanet.length > 0) {
            const selectedPlanet: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> = intersectPlanet[0]
            geolocation = ThreeGeoUnitsUtils.vectorToDatums(selectedPlanet.point)

         }
      } else if (displayedSceneData.type == SceneType.PLANE) {
         const intersectPlaneMap = raycaster.intersectObject(
            planeMap,
         )

         const selectedPlaneMap: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> = intersectPlaneMap[0]
         geolocation = ThreeGeoUnitsUtils.sphericalToDatums(selectedPlaneMap.point.x, -selectedPlaneMap.point.z)
      }

      if (!geolocation) return

      try {
         // Call server-side function.
         const data: GeocodeResponse = await reverse(geolocation.longitude, geolocation.latitude)

         // Display place data.
         setSelectedObjectData(data.features[0])
         setSelectedObjectType(ObjectType.PLACE)

         flyToCoordinates(
            geolocation.latitude,
            geolocation.longitude,
         )

      } catch (err) {
         // TODO : Signaler l'erreur.
      }
   }

   /**
    * Handle click on vessel.
    */
   const clickOnVessel = (): void => {
      if (!displayedVesselsGroup) return

      const intersectsVessels = raycaster.intersectObjects(
         Array.from(displayedVesselsGroup),
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

      clickOnPlanet()
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
   }, [displayedSceneData, cursorMode, planet, displayedVesselsGroup, displayedAirportsGroup, displayedPlanesGroup])

   return null
}
