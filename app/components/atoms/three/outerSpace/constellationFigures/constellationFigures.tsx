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
import { CONSTELLATION_FIGURES_TEXTURE_PNG } from '@/app/constants/paths'
import { CONSTELLATION_FIGURES_NAME } from '@/app/constants/strings'
import {
   useOuterSpaceTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/outerSpaceTab/outerSpaceTab.model'
import { useOuterSpace } from '@/app/components/atoms/three/outerSpace/outerSpace.model'
import { removeObject3D } from '@/app/helpers/threeHelper'

const constellationFiguresTexture: THREE.Texture =
   new THREE.TextureLoader().load(CONSTELLATION_FIGURES_TEXTURE_PNG)

export function ConstellationFigures(): null {
   const { constellationFigures, setConstellationFigures } = useOuterSpace()
   const { displayedSceneData } = useScenes()
   const { constellationFiguresActivated } = useOuterSpaceTab()

   /**
    * Function to create the constellation figures mesh.
    */
   const createConstellationFigures = (): void => {
      // Return early if scene data is missing, or the scene is of type PLANE.
      if (
         !constellationFiguresActivated ||
         !displayedSceneData?.scene ||
         displayedSceneData.type == SceneType.PLANE
      ) {
         return
      }

      // If the constellationFigures already exists and is part of the scene, return early to prevent duplication.
      if (constellationFigures && displayedSceneData.scene.children.includes(constellationFigures)) {
         return
      }

      // Create and add the constellationFigures mesh if it doesn't already exist in the scene.
      const newConstellationFigures = new THREE.Mesh(
         new THREE.SphereGeometry(
            OUTER_SPACE_RADIUS,
            SPHERE_WIDTH_SEGMENTS,
            SPHERE_HEIGHT_SEGMENTS,
         ),
         new THREE.MeshBasicMaterial({
            map: constellationFiguresTexture,
            side: THREE.BackSide,
            opacity: 1,
            transparent: true,
         }),
      )

      // Set rotation, name, and render order for the constellationFigures.
      newConstellationFigures.rotation.x =
         THREE.MathUtils.degToRad(EARTH_ANGLE)
      newConstellationFigures.name = CONSTELLATION_FIGURES_NAME
      newConstellationFigures.renderOrder = OUTER_SPACE_RENDER_ORDER

      // Add the constellationFigures to the scene.
      displayedSceneData.scene.add(newConstellationFigures)

      // Save the created constellationFigures in state, so it's not recreated again.
      setConstellationFigures(newConstellationFigures)
   }

   useEffect(() => {
      if (!constellationFiguresActivated) {
         if (constellationFigures && displayedSceneData?.scene) {
            removeObject3D(constellationFigures, displayedSceneData.scene)
            setConstellationFigures(null)
         }
         return
      }

      createConstellationFigures()

      return (): void => {
         if (constellationFigures && displayedSceneData?.scene) {
            removeObject3D(constellationFigures, displayedSceneData.scene)
         }
      }
   }, [displayedSceneData, constellationFiguresActivated])

   return null
}
