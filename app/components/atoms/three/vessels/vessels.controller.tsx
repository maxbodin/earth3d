'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import {
   GLOBE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA,
   MAX_DISPLAYED_VESSELS,
   PLANE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA,
} from '@/app/constants/numbers'
import { VESSEL_GLB_MODEL } from '@/app/constants/paths'
import { computeSceneLodScale, VESSEL_LOD_CONFIG } from '@/app/lib/sceneLod'
import { clamp } from '@/lib/math/clamp'
import { VESSEL_MATERIAL } from '@/app/constants/materials'
import { useVessels } from '@/app/components/atoms/three/vessels/vessels.model'
import { debounce } from 'lodash'
import { VESSEL_RENDER_ORDER } from '@/app/constants/renderOrder'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { gsap } from 'gsap'
import { AssetManager } from '@/app/lib/assetManager'

type VesselCoordinate = [number, number]
type VesselCoordinatesHistory = VesselCoordinate[]

export function VesselsController(): null {
   const { displayedSceneData } = useScenes()
   const { vesselsRawData, displayedVesselsGroup } = useVessels()

   const vesselModel = useRef<THREE.Group<THREE.Object3DEventMap> | null>(null)
   const vesselModelLoaded = useRef<boolean>(false)

   const VESSEL_PREFIX: string = 'vessel:'
   const VESSEL_PREFIX_LEN: number = VESSEL_PREFIX.length

   // TODO const vesselsCommunicationsFrequencies: Map<string, any> = new Map()
   const registeredVesselsData = useRef<Map<string, any>>(new Map())
   const vesselsModels = useRef<
      Map<string, THREE.Group<THREE.Object3DEventMap>>
   >(new Map())

   /**
    * Load vessel model once and cache it.
    */
   const loadVesselModel = async (): Promise<void> => {
      if (vesselModelLoaded.current) return

      try {
         const vesselTemplate = await AssetManager.loadModel(VESSEL_GLB_MODEL)

         // Apply material to all meshes in the vessel model.
         vesselTemplate.traverse((child): void => {
            if (child instanceof THREE.Mesh) {
               child.material = VESSEL_MATERIAL
            }
         })

         vesselModel.current = vesselTemplate
         vesselModelLoaded.current = true
      } catch (error) {
         console.error('Error loading vessel model:', error)
      }
   }

   /**
    * Update vessel coordinates in the registered data map.
    *
    * @param vesselData
    */
   const updateVesselCoordinates = (vesselData: any): void => {
      const vesselDataMessage = vesselData.message
      const mmsi = vesselDataMessage?.mmsi

      if (!vesselDataMessage || mmsi == null) return

      const coords = vesselDataMessage.location?.coordinates
      if (!coords) return

      // Check if the vessel exists in the map.
      if (registeredVesselsData.current.has(mmsi)) {
         const previousData = registeredVesselsData.current.get(mmsi)
         // Append new coordinates for animation.
         previousData.message.location.coordinates = [...previousData.message.location.coordinates, coords]
      } else {
         vesselDataMessage.location.coordinates = [coords]
         registeredVesselsData.current.set(mmsi, vesselData)
      }
   }

   const visibleVessels = useRef<any[]>([])
   const lastProcessedVesselCount = useRef<number>(0)

   /**
    * Process vessels data to display on the current scene.
    * Optimized to minimize allocations and reuse data structures.
    */
   const processVessels = (): void => {
      if (!vesselModel.current ||
         !displayedSceneData ||
         !displayedVesselsGroup ||
         displayedSceneData.camera == null
      ) {
         return
      }

      const isPlaneScene = displayedSceneData.type === SceneType.PLANE
      const planeMaxDistForVesselVisible: number = isPlaneScene
         ? clamp(PLANE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA * (cameraDistanceToPlanetCenter.current / 2e5), 1e3, 1e6)
         : 0

      // Update vessel coordinates
      for (const vesselData of vesselsRawData) {
         updateVesselCoordinates(vesselData)
      }

      // Filter visible vessels with early exits
      const allVessels = Array.from(registeredVesselsData.current.values())
      visibleVessels.current = allVessels.filter((vesselData: any): boolean => {
         const coordinates = vesselData.message.location
            .coordinates as VesselCoordinatesHistory
         if (!Array.isArray(coordinates?.[0])) return false

         const [longitude, latitude] = coordinates[0]
         if (latitude == null || longitude == null) return false

         if (displayedSceneData.type === SceneType.SPHERICAL) {
            vesselData.globePosition = latLongToVector3(longitude, latitude)
            return displayedSceneData.camera.position.distanceTo(vesselData.globePosition) <= GLOBE_MIN_ALLOWED_VESSEL_DISTANCE_TO_CAMERA
         } else if (isPlaneScene) {
            const worldPos = ThreeGeoUnitsUtils.datumsToSpherical(longitude, latitude)
            vesselData.planePosition = new THREE.Vector3(worldPos.x, 0, -worldPos.y)
            return displayedSceneData.camera.position.distanceTo(vesselData.planePosition) <= planeMaxDistForVesselVisible
         }
         return false
      })

      // Limit displayed vessels.
      if (visibleVessels.current.length > MAX_DISPLAYED_VESSELS) {
         visibleVessels.current.length = MAX_DISPLAYED_VESSELS
      }

      // Skip if no change.
      if (visibleVessels.current.length === lastProcessedVesselCount.current) {
         updateVesselPositions()
         return
      }

      lastProcessedVesselCount.current = visibleVessels.current.length
      displayVessels(visibleVessels.current)
   }

   /**
    * Display vessels with optimized material and geometry reuse.
    */
   const displayVessels = (vessels: any[]): void => {
      if (!displayedSceneData?.scene) return

      // Clear previous vessels efficiently.
      displayedVesselsGroup.forEach((vessel): void => {
         displayedSceneData.scene.remove(vessel)
      })
      displayedVesselsGroup.clear()
      vesselsModels.current.clear()

      const isSpherical = displayedSceneData.type === SceneType.SPHERICAL
      const scale = isSpherical ? globeAdjustedScale.current : planeAdjustedScale.current

      for (const vesselData of vessels) {
         if (!vesselModel.current) continue

         const vessel = vesselModel.current.clone()
         const mmsi = vesselData.message.mmsi
         vessel.name = `${VESSEL_PREFIX}${mmsi}`

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

         if (isSpherical) {
            vessel.position.copy(vesselData.globePosition)
         } else {
            const hdg = vesselData.message.hdg
            if (hdg !== null) vessel.rotation.y = hdg
            vessel.position.copy(vesselData.planePosition)
         }

         vessel.scale.setScalar(scale)
         vessel.renderOrder = VESSEL_RENDER_ORDER
         vessel.userData = { data: vesselData }

         // Also used for handling click on vessel.
         displayedVesselsGroup.add(vessel)
         displayedSceneData.scene.add(vessel)
      }
   }

   /**
    * Update positions of existing vessels without recreating them.
    */
   const updateVesselPositions = (): void => {
      if (!vesselModel.current || !displayedSceneData) return

      const isSpherical = displayedSceneData.type === SceneType.SPHERICAL
      const scale = isSpherical ? globeAdjustedScale.current : planeAdjustedScale.current

      displayedVesselsGroup.forEach((vessel): void => {
         const mmsi = vessel.userData?.data?.message?.mmsi
         if (!mmsi) return

         const vesselData = registeredVesselsData.current.get(mmsi)
         if (!vesselData) return

         if (isSpherical) {
            vessel.position.copy(vesselData.globePosition)
         } else {
            vessel.position.copy(vesselData.planePosition)
         }
         vessel.scale.setScalar(scale)
      })
   }


   const vesselTimelines = new Map<string, gsap.core.Timeline>()

   // TODO Fix animation, currently not working.
   const animate = (): void => {
      if (!displayedSceneData?.scene) return

      // Use cached vessel references instead of traversing scene.
      vesselsModels.current.forEach((vessel, mmsi): void => {
         const vesselData = registeredVesselsData.current.get(mmsi)
         if (!vesselData) return

         const coordinates = vesselData.message.location
            .coordinates as VesselCoordinatesHistory
         // Need at least two coordinates to animate.
         if (coordinates.length <= 1) return

         let timeline = vesselTimelines.get(mmsi)

         if (!timeline || !timeline.isActive()) {
            timeline = gsap.timeline({ repeat: -1 })
            vesselTimelines.set(mmsi, timeline)

            for (let i = 0; i < coordinates.length; i++) {
               const [longitude, latitude] = coordinates[i]
               if (displayedSceneData.type === SceneType.PLANE) {
                  const worldPos = ThreeGeoUnitsUtils.datumsToSpherical(longitude, latitude)
                  timeline.to(vessel.position, {
                     x: worldPos.x,
                     y: 0,
                     z: -worldPos.y,
                     duration: 10,
                     ease: 'linear',
                  }, i * 10)
               }
            }
         }
      })
   }

   useEffect(() => {
      if (displayedSceneData?.camera == null) return

      if (!vesselModelLoaded.current) {
         loadVesselModel()
      }

      processVessels()
      animate()

      return () => {
         // Cleanup timelines.
         vesselTimelines.forEach((timeline): void => {
            timeline.kill()
         })
         vesselTimelines.clear()
      }
   }, [vesselsRawData, displayedSceneData])


   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const planeAdjustedScale = useRef<number>(VESSEL_LOD_CONFIG.plane.maxScale)
   const globeAdjustedScale = useRef<number>(VESSEL_LOD_CONFIG.spherical.maxScale)

   /**
    * Called each times controls change (Zoom, camera move, ...)
    */
   const onControlsChange = (): void => {
      if (displayedVesselsGroup == null || displayedSceneData == null) {
         return
      }

      cameraDistanceToPlanetCenter.current =
         displayedSceneData.controls.getDistance()

      const vesselScale = computeSceneLodScale(
         displayedSceneData.type,
         cameraDistanceToPlanetCenter.current,
         VESSEL_LOD_CONFIG,
      )

      if (displayedSceneData.type === SceneType.SPHERICAL) {
         globeAdjustedScale.current = vesselScale
      } else if (displayedSceneData.type === SceneType.PLANE) {
         planeAdjustedScale.current = vesselScale
      }

      displayedVesselsGroup.forEach((vessel): void => {
         vessel.scale.setScalar(vesselScale)
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