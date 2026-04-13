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
import { HYPTIC_TEXTURE_PNG } from '@/app/constants/paths'
import { HYPTIC_NAME } from '@/app/constants/strings'
import {
   useOuterSpaceTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/outerSpaceTab/model'
import { useOuterSpace } from '@/app/components/atoms/three/outerSpace/outerSpace.model'
import { removeObject3D } from '@/app/helpers/threeHelper'

const hypticTexture: THREE.Texture = new THREE.TextureLoader().load(HYPTIC_TEXTURE_PNG)

export function Hyptic(): null {
   const { hyptic, setHyptic } = useOuterSpace()
   const { displayedSceneData } = useScenes()
   const { hypticActivated } = useOuterSpaceTab()

   /**
    * Function to create the hyptic mesh.
    */
   const createHyptic = (): void => {
      // Return early if hyptic is not activated, scene data is missing, or the scene is of type PLANE.
      if (
         !hypticActivated ||
         !displayedSceneData?.scene ||
         displayedSceneData.type == SceneType.PLANE
      ) {
         return
      }

      // If the hyptic already exists and is part of the scene, return early to prevent duplication.
      if (hyptic && displayedSceneData.scene.children.includes(hyptic)) {
         return
      }

      // Create and add the hyptic mesh if it doesn't already exist in the scene.
      const newHyptic = new THREE.Mesh(
         new THREE.SphereGeometry(
            OUTER_SPACE_RADIUS,
            SPHERE_WIDTH_SEGMENTS,
            SPHERE_HEIGHT_SEGMENTS,
         ),
         new THREE.MeshBasicMaterial({
            map: hypticTexture,
            side: THREE.BackSide,
            transparent: true,
            depthWrite: true,
            depthTest: true,
            lightMap: hypticTexture,
            lightMapIntensity: 100,
            reflectivity: 100,
            opacity: 0.4,
         }),
      )

      // Set rotation, name, and render order for the hyptic.
      newHyptic.rotation.x = THREE.MathUtils.degToRad(EARTH_ANGLE)
      newHyptic.name = HYPTIC_NAME
      newHyptic.renderOrder = OUTER_SPACE_RENDER_ORDER

      // Add the hyptic to the scene.
      displayedSceneData.scene.add(newHyptic)

      // Save the created hyptic in state, so it's not recreated again.
      setHyptic(newHyptic)
   }

   useEffect(() => {
      createHyptic()

      // Clean up the hyptic when the component unmounts or when the scene changes.
      return (): void => {
         if (hyptic && displayedSceneData?.scene) {
            removeObject3D(hyptic, displayedSceneData.scene)
         }
      }
   }, [displayedSceneData, hypticActivated])

   return null
}
