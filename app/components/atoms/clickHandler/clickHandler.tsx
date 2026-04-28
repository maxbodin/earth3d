'use client'
import { useEffect } from 'react'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useVessels } from '@/app/components/atoms/three/vessels/vessels.model'
import { useAirports } from '@/app/components/atoms/three/airports/airports.model'
import { ObjectType } from '@/app/enums/objectType'
import { usePlanes } from '@/app/components/atoms/three/planes/planes.model'
import { useEarthquakes } from '@/app/components/atoms/three/earthquakes/earthquakes.model'
import { useSelection } from '@/app/components/atoms/clickHandler/selectionContext'
import { usePlanet } from '@/app/components/atoms/three/planet/planet.model'
import { Geolocation, ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { GeocodeResponse } from '@/app/types/orsTypes'
import { reverseORS } from '@/app/server/services/openRouteService'
import { CameraFlyController } from '@/app/components/atoms/three/cameraFlyController'
import { CursorModeType } from '@/app/enums/modeType'
import { usePlaneMap } from '@/app/components/atoms/three/planeMapContext'
import { SceneType } from '@/app/enums/sceneType'
import { useMarkersDashboard } from '@/app/components/organisms/markersDashboard/markersDashboard.model'
import { parseSelectedPlaneStateVector } from '@/lib/parse/parseSelectedPlaneStateVector'
import { createMarkerFromPlaceFeature } from '@/app/lib/markerFactory'

export function ClickHandler(): null {

   const raycaster: THREE.Raycaster = new THREE.Raycaster()
   const mouse: THREE.Vector2 = new THREE.Vector2()

   const { displayedSceneData } = useScenes()
   const { setSelectedObjectType, setSelectedObjectData, cursorMode, setCursorMode } = useSelection()
   const { displayedVesselsGroup } = useVessels()
   const { displayedAirportsGroup } = useAirports()
   const { displayedPlanesGroup } = usePlanes()
   const { displayedEarthquakesGroup, setSelectedEarthquake } = useEarthquakes()
   const { planet } = usePlanet()
   const { flyToCoordinates } = CameraFlyController()
   const { planeMap } = usePlaneMap()
   const {
      markers,
      setMarkers,
      coordinateSelectionMarkerId,
      setCoordinateSelectionMarkerId,
      setIsMarkersDashboardOpen,
   } = useMarkersDashboard()

   const applyPickedCoordinatesToMarker = async (
      latitude: number,
      longitude: number,
   ): Promise<void> => {
      if (coordinateSelectionMarkerId == null) {
         return
      }

      const selectedMarker = markers.find(marker => marker.id === coordinateSelectionMarkerId)
      if (selectedMarker == null) {
         setCoordinateSelectionMarkerId(null)
         return
      }

      setMarkers(prevMarkers => {
         return prevMarkers.map(marker => {
            if (marker.id !== coordinateSelectionMarkerId) {
               return marker
            }

            return {
               ...marker,
               latitude,
               longitude,
            }
         })
      })

      try {
         const data: GeocodeResponse = await reverseORS(longitude, latitude)
         const selectedSuggestion = data.features?.[0]

         if (selectedSuggestion != null) {
            setMarkers(prevMarkers => {
               return prevMarkers.map(marker => {
                  if (marker.id !== coordinateSelectionMarkerId) {
                     return marker
                  }

                  return {
                     ...marker,
                     name: marker.name == ''
                        ? selectedSuggestion.properties.name
                        : marker.name,
                     showTitleOnMap: marker.showTitleOnMap,
                     address: selectedSuggestion.properties.label,
                     latitude: selectedSuggestion.geometry.coordinates[1],
                     longitude: selectedSuggestion.geometry.coordinates[0],
                  }
               })
            })
         }
      } catch (err) {
         // Keep selected coordinates even if reverse geocoding fails.
      } finally {
         setCoordinateSelectionMarkerId(null)
         setIsMarkersDashboardOpen(true)
         setCursorMode(CursorModeType.HAND)
      }
   }

   /**
    * Handle click on planet.
    */
   const clickOnPlanet = async (): Promise<void> => {
      if (!planet) return
      if (coordinateSelectionMarkerId == null && cursorMode == CursorModeType.HAND) return

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

         if (intersectPlaneMap.length === 0) {
            return
         }

         const selectedPlaneMap: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> = intersectPlaneMap[0]
         geolocation = ThreeGeoUnitsUtils.sphericalToDatums(selectedPlaneMap.point.x, -selectedPlaneMap.point.z)
      }

      if (!geolocation) return

      if (coordinateSelectionMarkerId != null) {
         await applyPickedCoordinatesToMarker(
            geolocation.latitude,
            geolocation.longitude,
         )
         return
      }

      try {
         // Call server-side function.
         const data: GeocodeResponse = await reverseORS(geolocation.longitude, geolocation.latitude)
         const feature = data.features[0]

         // Display place data.
         setSelectedObjectData(feature)
         setSelectedObjectType(ObjectType.PLACE)

         if (cursorMode === CursorModeType.POINTER && feature != null) {
            const marker = createMarkerFromPlaceFeature(feature)
            if (marker != null) {
               setMarkers(prevMarkers => [...prevMarkers, marker])
            }
         }

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


   const resolvePlaneSelectionData = (
      intersectedObject: THREE.Object3D<THREE.Object3DEventMap>,
   ): Record<string, unknown> | null => {
      let currentObject: THREE.Object3D<THREE.Object3DEventMap> | null = intersectedObject

      while (currentObject != null) {
         const candidateUserData = currentObject.userData as Record<string, unknown>
         if (parseSelectedPlaneStateVector(candidateUserData) != null) {
            return candidateUserData
         }

         currentObject = currentObject.parent
      }

      return null
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
         const selectedPlaneData = resolvePlaneSelectionData(intersects[0].object)
         if (selectedPlaneData == null) {
            return
         }

         setSelectedObjectData(selectedPlaneData)
         setSelectedObjectType(ObjectType.PLANE)
      }
   }

   /**
    * Handle click on earthquake.
    */
   const clickOnEarthquakes = (): void => {
      if (!displayedEarthquakesGroup || displayedEarthquakesGroup.children.length === 0) return

      const intersects = raycaster.intersectObjects(
         displayedEarthquakesGroup.children,
      )

      if (intersects.length > 0) {
         const earthquakeFeature = intersects[0].object.userData?.earthquakeFeature

         if (!earthquakeFeature) return 

         setSelectedEarthquake(earthquakeFeature)
         setSelectedObjectData(earthquakeFeature)
         setSelectedObjectType(ObjectType.EARTHQUAKE)
      }
   }

   /**
    * Function to handle click events.
    * @param event
    */
   const onMouseClick = (event: MouseEvent): void => {
      if (displayedSceneData == null || displayedSceneData.camera == null)
         return

      const target = event.target as HTMLElement | null
      const isInteractiveUiClick = target?.closest(
         '[data-map-pick-ignore="true"],button,a,input,textarea,select,[role="button"],[role="dialog"]',
      ) != null

      if (coordinateSelectionMarkerId != null && isInteractiveUiClick) {
         return
      }

      if (target?.closest('[data-map-pick-ignore="true"]') != null) {
         return
      }

      // Use mouse position to create a raycast.
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, displayedSceneData.camera)

      if (coordinateSelectionMarkerId != null) {
         void clickOnPlanet()
         return
      }

      clickOnPlanet()
      clickOnVessel()
      clickOnAirport()
      clickOnPlanes()
      clickOnEarthquakes()
   }

   const cleanup = (): void => {
      window.removeEventListener('click', onMouseClick)
   }

   useEffect(() => {
      window.addEventListener('click', onMouseClick)

      // Clean up the event listener.
      return cleanup
   }, [
      displayedSceneData,
      cursorMode,
      coordinateSelectionMarkerId,
      planet,
      planeMap,
      markers,
      displayedVesselsGroup,
      displayedAirportsGroup,
      displayedPlanesGroup,
   ])

   return null
}
