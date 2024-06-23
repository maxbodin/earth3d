'use client'
import { useEffect, useRef } from 'react'
import { useData } from '@/app/context_todo_improve/dataContext'
import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import {
   GLOBE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA,
   GLOBE_SCENE_VESSEL_MAX_SCALE,
   GLOBE_SCENE_VESSEL_MIN_SCALE,
   PLANE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA,
   PLANE_SCENE_VESSEL_MAX_SCALE,
   PLANE_SCENE_VESSEL_MIN_SCALE,
} from '@/app/constants/numbers'
import { VESSEL_RENDER_ORDER } from '@/app/constants/renderOrder'
import { VESSEL_GLB_MODEL } from '@/app/constants/paths'
import { clamp } from '@/app/helpers/numberHelper'
import { VESSEL_MATERIAL } from '@/app/constants/materials'
import { ThreeGeoUnitsUtils } from '@/app/utils/micUnitsUtils'
import { useVessels } from '@/app/components/atoms/three/vessels/vessels.model'

export function VesselsController(): null {
   const { vesselsData } = useData()
   const { displayedSceneData } = useScenes()
   const { displayedVesselsGroup } = useVessels()

   const vesselModel = useRef<THREE.Group<THREE.Object3DEventMap> | null>(null)

   const loader: GLTFLoader = new GLTFLoader()

   const vesselsCommunicationsFrequencies: Map<string, any> = new Map()
   const totalVesselsData = useRef<Map<string, any>>(new Map())
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

   function interpolateColor(value: number): string {
      const hue: number = (1 - value) * 250
      const saturation: number = 50
      const lightness: number = 50
      // Convert HSL values to a CSS color string
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
   }

   /**
    * Update vessel communication frequency ratio.
    * The vessel communication frequency ratio is used for vessel's material color.
    * @param mmsi
    */
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

   const displayVessels = (vessels: any[]): void => {
      // Clear previous vessels.
      displayedVesselsGroup.clear()

      vessels.forEach((vesselData: any): void => {
         if (vesselModel.current == null) return
         const vessel: THREE.Group<THREE.Object3DEventMap> =
            vesselModel.current.clone()

         const mmsi = vesselData.message.mmsi
         vessel.name = `Vessel: ${mmsi}`

         // Save vessel model in map to allow lerping model position in animation.
         vesselsModels.current.set(mmsi, vessel)

         updateVesselCommunicationFrequency(mmsi)

         // Apply material to all meshes in the vessel model.
         vessel.traverse((child: any): void => {
            if (child instanceof THREE.Mesh) {
               child.material = new THREE.MeshBasicMaterial({
                  color: interpolateColor(
                     vesselsCommunicationsFrequencies.get(mmsi) ?? 0,
                  ),
               })
            }
         })

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

         displayedVesselsGroup.add(vessel)
      })

      if (displayedVesselsGroup && displayedSceneData.scene) {
         displayedSceneData.scene.add(displayedVesselsGroup)
      }
   }

   function updateVesselCoordinates(vesselData: any): void {
      const vesselDataMessage = vesselData.message
      if (vesselDataMessage == undefined) return
      const mmsi = vesselDataMessage.mmsi
      if (mmsi == undefined) return

      // Check if the vessel exists in the map.
      if (totalVesselsData.current.has(mmsi)) {
         const previousData = totalVesselsData.current.get(mmsi)
         const newCoordinates = vesselDataMessage.location.coordinates
         delete vesselDataMessage.location.coordinates

         // Update the coordinates and save the previous coordinates as oldCoordinates.
         previousData.message.location.oldCoordinates =
            previousData.message.location.newCoordinates

         if (displayedSceneData.type == SceneType.PLANE) {
            const test = new THREE.Mesh(
               new THREE.SphereGeometry(1e4, 16, 16),
               new THREE.MeshBasicMaterial({ color: '#ff0000' }),
            )

            const worldPos: THREE.Vector2 =
               ThreeGeoUnitsUtils.datumsToSpherical(
                  previousData.message.location.newCoordinates[0] as number,
                  previousData.message.location.newCoordinates[1] as number,
               )
            test.position.set(worldPos.x, 0, -worldPos.y)
            displayedSceneData.scene?.add(test)
         }

         previousData.message.location.newCoordinates = newCoordinates
      } else {
         // If the vessel doesn't exist in the map, add it.
         vesselDataMessage.location.newCoordinates =
            vesselDataMessage.location.coordinates
         delete vesselDataMessage.location.coordinates
         totalVesselsData.current.set(mmsi, vesselData)
      }
   }

   const visibleVessels = useRef<any[]>([])

   /**
    * Process vessels data to display on the current scene.
    */
   const processVessels = (): void => {
      if (!vesselsData) {
         // Clear previous vessels.
         displayedVesselsGroup.clear()
         return
      }

      if (vesselModel.current == null || displayedSceneData == null) {
         return
      }

      // Clear first half of vessels if more than threshold children.
      /*TODO if (totalVesselsData.current.length > MAX_DISPLAYED_VESSELS) {
         const halfLength: number = Math.ceil(
            totalVesselsData.current.length / 2
         )
         totalVesselsData.current.splice(0, halfLength)
      }*/

      vesselsData.forEach((vesselData: any): void => {
         updateVesselCoordinates(vesselData)
      })

      // Remove vessels that are out of visible zone.
      visibleVessels.current = Array.from(
         totalVesselsData.current.values(),
      ).filter((vesselData: any): boolean => {
         let coordinates = vesselData.message.location.newCoordinates

         // Set coordinates as old to allow lerping from old to new in animate.
         const oldCoordinates = vesselData.message.location.oldCoordinates
         // TODO if (oldCoordinates != undefined) coordinates = oldCoordinates

         const lat = coordinates[0]
         const lon = coordinates[1]

         if (lat == null || lon == null) {
            return false
         }

         if (displayedSceneData.type == SceneType.SPHERICAL) {
            const worldPos: THREE.Vector3 = latLongToVector3(
               lon as number,
               lat as number,
            )

            // TODO FIX ROTATION AND AXIS
            const normal: THREE.Vector3 = worldPos.clone().normalize()
            vesselData.globePosition = worldPos.add(normal)

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
               distanceToCamera <= PLANE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA
            )
         } else {
            return false
         }
      })

      displayVessels(visibleVessels.current)
   }

   /**
    * Cleanup : remove events listeners.
    */
   const cleanup = (): void => {
      displayedSceneData?.controls?.removeEventListener(
         'change',
         onControlsChange,
      )
   }

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

      displayedVesselsGroup.children.forEach((vessel): void => {
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

   const lerpAlpha = useRef<number>(0.0002)

   const animate: () => void = (): void => {
      requestAnimationFrame(animate)

      visibleVessels.current.forEach((visibleVesselData: any): void => {
         const mmsi: string = visibleVesselData.message.mmsi
         if (
            visibleVesselData.message.location.oldCoordinates &&
            visibleVesselData.message.location.newCoordinates &&
            vesselsModels.current.has(mmsi)
         ) {
            const vesselModel = vesselsModels.current.get(mmsi)

            const newCoordinates =
               visibleVesselData.message.location.newCoordinates
            const lat = newCoordinates[0]
            const lon = newCoordinates[1]

            if (lat == null || lon == null) {
               return
            }

            if (displayedSceneData.type == SceneType.SPHERICAL) {
               const worldPos: THREE.Vector3 = latLongToVector3(
                  lon as number,
                  lat as number,
               )

               // TODO FIX ROTATION AND AXIS
               const normal: THREE.Vector3 = worldPos.clone().normalize()
               vesselModel?.position.lerp(worldPos.add(normal), 0.0001)
            } else if (displayedSceneData.type == SceneType.PLANE) {
               const worldPos: THREE.Vector2 =
                  ThreeGeoUnitsUtils.datumsToSpherical(
                     lon as number,
                     lat as number,
                  )

               vesselModel?.position.setY(0)
               vesselModel?.position.lerp(
                  new THREE.Vector3(
                     worldPos.x,
                     vesselModel?.position.y,
                     -worldPos.y,
                  ),
                  lerpAlpha.current,
               )
            }
         }
      })
   }

   useEffect(() => {
      if (displayedSceneData?.camera == null) return

      if (vesselModel.current == null) {
         loadVesselModel()
      }

      displayedSceneData?.controls?.addEventListener('change', onControlsChange)

      processVessels()

      // TODO LERP ANIMATION NOT WORKING CURRENTLY animate()

      return cleanup
   }, [vesselsData])

   return null
}
