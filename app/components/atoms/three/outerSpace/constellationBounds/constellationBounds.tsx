'use client'
import * as THREE from 'three'
import { useEffect } from 'react'
import {
   EARTH_ANGLE,
   OUTER_SPACE_RADIUS,
   SPHERE_HEIGHT_SEGMENTS,
   SPHERE_WIDTH_SEGMENTS,
} from '@/app/constants/numbers'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { OUTER_SPACE_RENDER_ORDER } from '@/app/constants/renderOrder'
import { CONSTELLATION_BOUNDS_PNG } from '@/app/constants/paths'
import { CONSTELLATION_BOUNDS_NAME } from '@/app/constants/strings'
import {
   useOuterSpaceTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/outerSpaceTab/model'
import { useOuterSpace } from '@/app/components/atoms/three/outerSpace/outerSpace.model'
import { removeObject3D } from '@/app/helpers/threeHelper'

export function ConstellationBounds(): null {
   const { constellationBounds, setConstellationBounds } = useOuterSpace()
   const { displayedSceneData } = useScenes()
   const { constellationBoundsActivated } = useOuterSpaceTab()

   const constellationBoundsTexture: THREE.Texture =
      new THREE.TextureLoader().load(CONSTELLATION_BOUNDS_PNG)
   /**
    * Function to create the constellation bounds mesh.
    */
   const createConstellationBounds = (): void => {
      // Return early if scene data is missing, or the scene is of type PLANE.
      if (
         !constellationBoundsActivated ||
         !displayedSceneData?.scene ||
         displayedSceneData.type == SceneType.PLANE
      )
         return

      // If the constellationBounds already exists and is part of the scene, return early to prevent duplication.
      if (constellationBounds && displayedSceneData.scene.children.includes(constellationBounds)) {
         return
      }

      // Create and add the constellationBounds mesh if it doesn't already exist in the scene.
      const newConstellationBounds = new THREE.Mesh(
         new THREE.SphereGeometry(
            OUTER_SPACE_RADIUS,
            SPHERE_WIDTH_SEGMENTS,
            SPHERE_HEIGHT_SEGMENTS,
         ),
         new THREE.MeshBasicMaterial({
            map: constellationBoundsTexture,
            side: THREE.BackSide,
            opacity: 0.5,
            transparent: true,
         }),
      )

      // Set rotation, name, and render order for the constellationBounds.
      newConstellationBounds.rotation.x =
         THREE.MathUtils.degToRad(EARTH_ANGLE)
      newConstellationBounds.name = CONSTELLATION_BOUNDS_NAME
      newConstellationBounds.renderOrder = OUTER_SPACE_RENDER_ORDER

      // Add the constellationBounds to the scene.
      displayedSceneData.scene.add(newConstellationBounds)

      // Save the created constellationBounds in state, so it's not recreated again.
      setConstellationBounds(newConstellationBounds)
   }

   useEffect(() => {
      createConstellationBounds()

      // Clean up the constellationBounds when the component unmounts or when the scene changes.
      return (): void => {
         if (constellationBounds && displayedSceneData?.scene) {
            removeObject3D(constellationBounds, displayedSceneData.scene)
         }
      }
   }, [displayedSceneData, constellationBoundsActivated])

   return null
}
