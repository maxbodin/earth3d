'use client'
import { useEffect, useRef } from 'react'
import { useData } from '@/app/context/dataContext'
import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import { useScenes } from '@/app/context/scenesContext'
import { SceneType } from '@/app/components/enums/sceneType'
// @ts-ignore
import { UnitsUtils } from 'geo-three'
import {
   GLOBE_SCENE_VESSEL_SCALE,
   MAX_DISPLAYED_VESSELS,
   PLANE_SCENE_VESSEL_SCALE,
} from '@/app/constants/numbers'
import { VESSEL_RENDER_ORDER } from '@/app/constants/renderOrder'
import { VESSEL_GLB_MODEL } from '@/app/constants/paths'
import { clamp } from '@/app/helpers/numberHelper'
import { useVisibleZone } from '@/app/components/atoms/three/visibleZone/model'
import { ObjectType } from '@/app/components/enums/objectType'
import { VESSEL_MATERIAL } from '@/app/constants/materials'

export function Vessels(): null {
   const { vesselsData } = useData()
   const { displayedSceneData } = useScenes()
   const { sphereVisibleZone } = useVisibleZone()
   const { setSelectedObjectType, setSelectedObjectData } = useData()

   const displayedVesselsGroup = useRef<THREE.Group>(new THREE.Group())
   const vesselModel = useRef<any | null>(null)
   const selectedVessel = useRef<THREE.Object3D<THREE.Object3DEventMap> | null>(
      null
   )
   const loader: GLTFLoader = new GLTFLoader()

   // Keep track of previously added vessels and their coordinates.
   const previousVesselCoordinates: { [key: string]: [number, number] } = {}

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
         }
      )
   }

   /**
    * Remove updated vessel.
    * @param mmsi
    * @param lat
    * @param lon
    */
   const removeUpdatedVessel = (
      mmsi: string,
      lat: number,
      lon: number
   ): void => {
      if (
         previousVesselCoordinates[mmsi] &&
         (previousVesselCoordinates[mmsi][0] !== lat ||
            previousVesselCoordinates[mmsi][1] !== lon)
      ) {
         // Remove the vessel from the scene.
         const previousVessel = displayedVesselsGroup.current.getObjectByName(
            `Vessel: ${mmsi}`
         )
         if (previousVessel) {
            displayedVesselsGroup.current.remove(previousVessel)
            //console.log(`Previously added vessel ${mmsi} is removed!`)
         }
      }
   }

   const displayVessels = (vessels: any[]): void => {
      // Clear previous vessels.
      displayedVesselsGroup.current.clear()

      vessels.forEach((vesselData: any): void => {
         const mmsi = vesselData.message.mmsi
         const coordinates = vesselData.message.location.coordinates
         const lat = coordinates[0]
         const lon = coordinates[1]

         removeUpdatedVessel(mmsi, lat, lon)

         const vessel = vesselModel.current.clone()

         vessel.name = `Vessel: ${mmsi}`

         if (displayedSceneData.type == SceneType.SPHERICAL) {
            const worldPos: THREE.Vector3 = latLongToVector3(
               lon as number,
               lat as number
            )
            const normal: THREE.Vector3 = worldPos.clone().normalize()
            const adjustedPosition: THREE.Vector3 = worldPos.add(normal)

            vessel.position.copy(adjustedPosition)
            vessel.scale.set(
               GLOBE_SCENE_VESSEL_SCALE,
               GLOBE_SCENE_VESSEL_SCALE,
               GLOBE_SCENE_VESSEL_SCALE
            )
         } else if (displayedSceneData.type == SceneType.PLANE) {
            const worldPos: THREE.Vector3 = UnitsUtils.datumsToSpherical(
               lon as number,
               lat as number
            )
            vessel.position.set(worldPos.x, 0, -worldPos.y)

            const hdg = vesselData.message.hdg
            if (hdg !== null) {
               vessel.rotateY(hdg)
            }

            vessel.scale.set(
               PLANE_SCENE_VESSEL_SCALE,
               PLANE_SCENE_VESSEL_SCALE,
               PLANE_SCENE_VESSEL_SCALE
            )
         }

         vessel.renderOrder = VESSEL_RENDER_ORDER
         vessel.userData = { data: vesselData }
         displayedVesselsGroup.current.add(vessel)

         // Update previous coordinates for this vessel.
         previousVesselCoordinates[mmsi] = [lat, lon]
      })

      if (displayedVesselsGroup.current && displayedSceneData.scene) {
         displayedSceneData.scene.add(displayedVesselsGroup.current)
      }
   }

   const totalVesselsData = useRef<any[]>([])

   /**
    * Process vessels data to display on the current scene.
    */
   const processVessels = (): void => {
      if (
         vesselModel.current == null ||
         Math.random() < 0.5 ||
         displayedSceneData == null ||
         !vesselsData
      ) {
         return
      }

      // Clear first half of vessels if more than threshold children.
      if (totalVesselsData.current.length > MAX_DISPLAYED_VESSELS) {
         const halfLength: number = Math.ceil(
            totalVesselsData.current.length / 2
         )
         totalVesselsData.current.splice(0, halfLength)
      }

      totalVesselsData.current.push(...vesselsData)

      // Remove vessels that are out of visible zone.
      const filteredVessels: any[] = totalVesselsData.current.filter(
         (vesselData: any): boolean => {
            const coordinates = vesselData.message.location.coordinates
            const lon = coordinates[0]
            const lat = coordinates[1]

            if (lat == null || lon == null) {
               return false
            }

            if (displayedSceneData.type === SceneType.SPHERICAL) {
               return true /* TODO: Sphere visible zone is degrading performance too much.

               (
                  lat <= sphereVisibleZone.topLatLon.lat &&
                  lat >= sphereVisibleZone.bottomLatLon.lat &&
                  lon <= sphereVisibleZone.rightLatLon.lon &&
                  lon >= sphereVisibleZone.leftLatLon.lon
               )*/
            } else if (displayedSceneData.type === SceneType.PLANE) {
               /* TODO: Frustrum limitation is not working on plane.

             const frustum: THREE.Frustum = new THREE.Frustum()

             frustum.setFromProjectionMatrix(
             new THREE.Matrix4().multiplyMatrices(
             displayedSceneData.camera.projectionMatrix,
             displayedSceneData.camera.matrixWorldInverse
             )
             )
*/
               return true // frustum.containsPoint(latLongToVector3(lon, lat))
            } else {
               return false
            }
         }
      )

      displayVessels(filteredVessels)
   }

   /**
    * Cleanup : remove events listeners.
    */
   const cleanup = (): void => {
      window.removeEventListener('click', onMouseClick)
      displayedSceneData?.controls?.removeEventListener(
         'change',
         onControlsChange
      )
   }

   const raycaster: THREE.Raycaster = new THREE.Raycaster()
   const mouse: THREE.Vector2 = new THREE.Vector2()

   /**
    * Function to handle click events.
    * @param event
    */
   const onMouseClick = (event: { clientX: number; clientY: number }): void => {
      if (
         displayedSceneData == null ||
         displayedSceneData.camera == null ||
         !displayedVesselsGroup.current
      )
         return

      // Use mouse position to create a raycast.
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, displayedSceneData.camera)

      const intersects = raycaster.intersectObjects(
         displayedVesselsGroup.current!.children
      )

      if (intersects.length > 0) {
         selectedVessel.current = intersects[0].object.parent!
         setSelectedObjectType(ObjectType.VESSEL)
         setSelectedObjectData(intersects[0].object.parent!.userData.data)
         // TODO console.log(intersects[0].object.parent!.userData.data)
      }
   }

   const onControlsChange = (): void => {
      if (
         displayedVesselsGroup.current == null ||
         displayedSceneData == null ||
         displayedSceneData.type == SceneType.SPHERICAL
      ) {
         return
      }

      const adjustedScale: number = clamp(
         displayedSceneData.controls.getDistance() / 1e3,
         8,
         400
      )

      displayedVesselsGroup.current.children.forEach((vessel): void => {
         vessel.scale.set(adjustedScale, adjustedScale, adjustedScale)
      })
   }

   useEffect(() => {
      if (vesselModel.current == null) {
         loadVesselModel()
      }

      // Add event listener to detect clicks on the window.
      window.addEventListener('click', onMouseClick)

      displayedSceneData?.controls?.addEventListener('change', onControlsChange)

      processVessels()

      return cleanup
   }, [vesselsData, sphereVisibleZone])

   return null
}
