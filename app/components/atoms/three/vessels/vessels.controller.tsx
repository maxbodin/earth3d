'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import {
   GLOBE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA,
   GLOBE_SCENE_VESSEL_MAX_SCALE,
   GLOBE_SCENE_VESSEL_MIN_SCALE,
   MAX_DISPLAYED_VESSELS,
   PLANE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA,
   PLANE_SCENE_VESSEL_MAX_SCALE,
   PLANE_SCENE_VESSEL_MIN_SCALE,
} from '@/app/constants/numbers'
import { VESSEL_GLB_MODEL } from '@/app/constants/paths'
import { clamp } from '@/app/helpers/numberHelper'
import { VESSEL_MATERIAL } from '@/app/constants/materials'
import { useVessels } from '@/app/components/atoms/three/vessels/vessels.model'
import { debounce } from 'lodash'
import { removeObject3D } from '@/app/helpers/threeHelper'
import { VESSEL_RENDER_ORDER } from '@/app/constants/renderOrder'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { gsap } from 'gsap'
import { Coordinates } from '@/app/types/coordinates'

export function VesselsController(): null {
   const { displayedSceneData } = useScenes()
   const { vesselsRawData, displayedVesselsGroup } = useVessels()

   const vesselModel = useRef<THREE.Group<THREE.Object3DEventMap> | null>(null)

   const loader: GLTFLoader = new GLTFLoader()
   const VESSEL_PREFIX: string = 'Vessel: '

   // TODO const vesselsCommunicationsFrequencies: Map<string, any> = new Map()
   const registeredVesselsData = useRef<Map<string, any>>(new Map())
   const vesselsModels = useRef<
      Map<string, THREE.Group<THREE.Object3DEventMap>>
   >(new Map())

   /**
    * Load vessel model to load it only once.
    */
   const loadVesselModel = (): void => {
      // Load vessel model.
      loader.load(
         VESSEL_GLB_MODEL,
         (gltf: GLTF): void => {
            const vesselTemplate = gltf.scene

            // Apply material to all meshes in the vessel model.
            vesselTemplate.traverse((child: any): void => {
               if (child instanceof THREE.Mesh) {
                  child.material = VESSEL_MATERIAL
               }
            })

            // Clone vessel model.
            vesselModel.current = vesselTemplate.clone()
         },
         (xhr): void => {
            //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
         },
         (error: any): void => {
            console.error('Error loading vessel model:', error)
         },
      )
   }

   /**
    *
    * @param vesselData
    */
   const updateVesselCoordinates = (vesselData: any): void => {
      const vesselDataMessage = vesselData.message
      const mmsi = vesselDataMessage?.mmsi

      if (vesselDataMessage == undefined || mmsi == undefined) return

      // Check if the vessel exists in the map.
      if (registeredVesselsData.current.has(mmsi)) {
         const previousData = registeredVesselsData.current.get(mmsi)
         const newCoordinates = vesselDataMessage.location.coordinates

         // Update the coordinates and save the previous coordinates as oldCoordinates.
         previousData.message.location.coordinates = [...previousData.message.location.coordinates, newCoordinates]
      } else {
         // If the vessel doesn't exist in the map, add it.
         vesselDataMessage.location.coordinates = [vesselDataMessage.location.coordinates]
         registeredVesselsData.current.set(mmsi, vesselData)
      }
   }


   const visibleVessels = useRef<any[]>([])

   /**
    * Process vessels data to display on the current scene.
    */
   const processVessels = (): void => {
      if (!vesselModel.current ||
         !displayedSceneData ||
         !displayedVesselsGroup ||
         displayedSceneData?.camera == null ||
         !displayedSceneData?.controls == null
      ) {
         return
      }

      const planeMaxDistForVesselVisible: number = clamp(PLANE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA * (cameraDistanceToPlanetCenter.current / 2e5), 1e3, 1e6)

      // Update vessels coordinates if already displayed.
      // Else add vessels to registered vessels.
      vesselsRawData.forEach((vesselData: any): void => {
         updateVesselCoordinates(vesselData)
      })

      // Remove vessels that are out of visible zone.
      visibleVessels.current = Array.from(
         registeredVesselsData.current.values(),
      ).filter((vesselData: any): boolean => {
         let coordinates: Coordinates = vesselData.message.location.coordinates as Coordinates

         const lat: number = coordinates[0][0]
         const lon: number = coordinates[0][1]

         if (lat == null || lon == null) {
            return false
         }

         if (displayedSceneData.type == SceneType.SPHERICAL) {
            vesselData.globePosition = latLongToVector3(
               lon as number,
               lat as number,
            )

            const distanceToCamera: number =
               displayedSceneData.camera.position.distanceTo(
                  vesselData.globePosition,
               )

            return (
               distanceToCamera <= GLOBE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA
            )
         } else if (displayedSceneData.type == SceneType.PLANE) {
            const worldPos: THREE.Vector2 =
               ThreeGeoUnitsUtils.datumsToSpherical(
                  lon as number,
                  lat as number,
               )
            vesselData.planePosition = new THREE.Vector3(
               worldPos.x,
               0,
               -worldPos.y,
            )

            const distanceToCamera: number =
               displayedSceneData.camera.position.distanceTo(
                  vesselData.planePosition,
               )

            return (
               distanceToCamera <= planeMaxDistForVesselVisible
            )
         } else {
            return false
         }
      })

      if (visibleVessels.current.length > MAX_DISPLAYED_VESSELS) {
         visibleVessels.current.splice(0, visibleVessels.current.length - MAX_DISPLAYED_VESSELS)
      }

      displayVessels(visibleVessels.current)
   }

   /**
    *
    * @param vessels
    */
   const displayVessels = (vessels: any[]): void => {
      // Clear previous vessels.
      displayedVesselsGroup.forEach((vesselMeshGroup: THREE.Group): void => {
         removeObject3D(vesselMeshGroup, displayedSceneData.scene)
      })
      displayedVesselsGroup.clear()

      vessels.forEach((vesselData: any): void => {
         if (vesselModel.current == null) return

         const vessel: THREE.Group<THREE.Object3DEventMap> =
            vesselModel.current.clone()

         const mmsi = vesselData.message.mmsi
         vessel.name = `${VESSEL_PREFIX} ${mmsi}`

         // Save vessel model in map to allow lerping model position in animation.
         vesselsModels.current.set(mmsi, vessel)

         // TODO updateVesselCommunicationFrequency(mmsi)

         // Apply material to all meshes in the vessel model.
         /*  TODO       vessel.traverse((child: any): void => {
                     if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshBasicMaterial({
                           color: interpolateColor(
                              vesselsCommunicationsFrequencies.get(mmsi) ?? 0,
                           ),
                        })
                     }
                  })*/

         if (displayedSceneData.type == SceneType.SPHERICAL) {
            vessel.position.copy(vesselData.globePosition)
            vessel.scale.set(
               globeAdjustedScale.current,
               globeAdjustedScale.current,
               globeAdjustedScale.current,
            )
         } else if (displayedSceneData.type == SceneType.PLANE) {
            const hdg = vesselData.message.hdg
            if (hdg !== null) {
               vessel.rotateY(hdg)
            }
            vessel.position.copy(vesselData.planePosition)
            vessel.scale.set(
               planeAdjustedScale.current,
               planeAdjustedScale.current,
               planeAdjustedScale.current,
            )
         }

         vessel.renderOrder = VESSEL_RENDER_ORDER
         vessel.userData = { data: vesselData }

         // Also used for handling click on vessel.
         displayedVesselsGroup.add(vessel)

         if (displayedVesselsGroup && displayedSceneData.scene) {
            displayedSceneData.scene.add(vessel)
         }
      })
   }


   /**
    * Retrieve all objects in the scene whose names start with a specified prefix.
    * @param scene - The Three.js scene to search within.
    * @param prefix - The prefix to match object names against.
    * @returns An array of objects whose names start with the specified prefix.
    */
   const getObjectsByNamePrefix = (scene: THREE.Scene, prefix: string): THREE.Object3D[] => {
      const matchingObjects: THREE.Object3D[] = []

      scene.traverse((object) => {
         if (object.name.startsWith(prefix)) {
            matchingObjects.push(object)
         }
      })

      return matchingObjects
   }

   const vesselTimelines = new Map<string, gsap.core.Timeline>()

   // TODO Fix animation, currently not working.
   const animate: () => void = (): void => {
      if (!displayedSceneData?.scene) return

      getObjectsByNamePrefix(displayedSceneData.scene, VESSEL_PREFIX).forEach((vessel, index: number): void => {
         // if (vessel.userData.data.message.mmsi != '205278390') return

         const coordinates: Coordinates = vessel.userData.data.message.location.coordinates as Coordinates
         const mmsi: string = vessel.userData.data.mmsi

         // Need two coordinates to animate between them.
         if (coordinates.length <= 1 || mmsi == undefined) return

         let timeline = vesselTimelines.get(mmsi)

         if (timeline == undefined || !timeline || !timeline.isActive()) {
            timeline = gsap.timeline({ repeat: 100 })
            vesselTimelines.set(mmsi, timeline)

            coordinates.forEach((coordinate: [number, number], coordIndex: number): void => {
               const [lat, lon] = coordinate

               if (displayedSceneData.type == SceneType.PLANE) {
                  const worldPos: THREE.Vector2 = ThreeGeoUnitsUtils.datumsToSpherical(
                     lon as number,
                     lat as number,
                  )
                  const { x, y, z } = new THREE.Vector3(
                     worldPos.x,
                     0,
                     -worldPos.y,
                  )

                  // Animate position
                  timeline!.add(gsap.to(vessel.position, {
                     x,
                     y,
                     z,
                     duration: 10,
                     onComplete: (): void => {
                        console.log(`Completed animation for vessel ${mmsi}, ${coordIndex}`)
                     },
                  }), '>')
               }
            })
         }
      })
   }

   useEffect((): void => {
      if (displayedSceneData?.camera == null) return

      if (vesselModel.current == null) {
         loadVesselModel()
      }

      // Call vessels in useEffect instead of controls change,
      // as useEffect is call when vessels raw data is updated.
      processVessels()

      animate()
   }, [vesselsRawData, displayedSceneData])


   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const planeAdjustedScale = useRef<number>(PLANE_SCENE_VESSEL_MAX_SCALE)
   const globeAdjustedScale = useRef<number>(GLOBE_SCENE_VESSEL_MAX_SCALE)

   /**
    * Called each times controls change (Zoom, camera move, ...)
    */
   const onControlsChange = (): void => {
      if (displayedVesselsGroup == null || displayedSceneData == null) {
         return
      }

      cameraDistanceToPlanetCenter.current =
         displayedSceneData.controls.getDistance()

      planeAdjustedScale.current = clamp(
         cameraDistanceToPlanetCenter.current / 1e3,
         PLANE_SCENE_VESSEL_MIN_SCALE,
         PLANE_SCENE_VESSEL_MAX_SCALE,
      )

      globeAdjustedScale.current = clamp(
         cameraDistanceToPlanetCenter.current / 1e4,
         GLOBE_SCENE_VESSEL_MIN_SCALE,
         GLOBE_SCENE_VESSEL_MAX_SCALE,
      )

      displayedVesselsGroup.forEach((vessel): void => {
         if (displayedSceneData.type == SceneType.SPHERICAL) {
            vessel.scale.set(
               globeAdjustedScale.current,
               globeAdjustedScale.current,
               globeAdjustedScale.current,
            )
         } else if (displayedSceneData.type == SceneType.PLANE) {
            vessel.scale.set(
               planeAdjustedScale.current,
               planeAdjustedScale.current,
               planeAdjustedScale.current,
            )
         }
      })
   }

   /**
    * Debounce the onControlsChange function to limit how often it can be called.
    */
   const debouncedOnControlsChange = debounce(onControlsChange, 2)

   /**
    * Cleanup : remove events listeners.
    */
   const cleanup = (): void => {
      displayedSceneData?.controls?.removeEventListener(
         'change',
         debouncedOnControlsChange,
      )
   }

   useEffect(() => {
      displayedSceneData?.controls?.addEventListener('change', debouncedOnControlsChange)

      // Clean up the event listener.
      return cleanup
   }, [displayedSceneData])

   return null
}


/* TODO
  function interpolateColor(value: number): string {
      const hue: number = (1 - value) * 250
      const saturation: number = 50
      const lightness: number = 50
      // Convert HSL values to a CSS color string
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
   }*/

/** TODO
 * Update vessel communication frequency ratio.
 * The vessel communication frequency ratio is used for vessel's material color.
 * @param mmsi
 function updateVesselCommunicationFrequency(mmsi: string): void {
 const vesselCommunicationFrequency =
 vesselsCommunicationsFrequencies.get(mmsi)
 if (
 vesselCommunicationFrequency !== undefined &&
 vesselCommunicationFrequency <= 0.8
 ) {
 vesselsCommunicationsFrequencies.set(
 mmsi,
 vesselCommunicationFrequency + 0.05,
 )
 } else {
 vesselsCommunicationsFrequencies.set(mmsi, 0)
 }
 }
 */

// TODO Couleur en fonction du nombre du temps depuis la dernière communication.
// TODO GSAP animation entre première coordonnées et la dernières, au lieu de stocker la old et new, on stocke un array des coordonnées reçues.