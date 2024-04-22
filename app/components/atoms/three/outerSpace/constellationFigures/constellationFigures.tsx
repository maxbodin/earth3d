'use client'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import {
   EARTH_ANGLE,
   OUTER_SPACE_RADIUS,
   SPHERE_HEIGHT_SEGMENTS,
   SPHERE_WIDTH_SEGMENTS,
} from '@/app/constants/numbers'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/components/enums/sceneType'
import { OUTER_SPACE_RENDER_ORDER } from '@/app/constants/renderOrder'
import { useOuterSpaceTab } from '@/app/components/organisms/dashboardTabs/outerSpaceTab/model'
import { CONSTELLATION_FIGURES_TEXTURE_PNG } from '@/app/constants/paths'
import { CONSTELLATION_FIGURES_NAME } from '@/app/constants/strings'
import { removeObject3D } from '@/app/helpers/threeHelper'

export function ConstellationFigures(): null {
   const constellationFigures = useRef<THREE.Mesh | null>(null)
   const constellationFiguresTexture: THREE.Texture =
      new THREE.TextureLoader().load(CONSTELLATION_FIGURES_TEXTURE_PNG)
   const { displayedSceneData } = useScenes()
   const { constellationFiguresActivated } = useOuterSpaceTab()

   /**
    * Function to create the constellation figures mesh.
    */
   const createConstellationFigures = (): void => {
      if (
         displayedSceneData == null ||
         displayedSceneData.scene == null ||
         displayedSceneData.type == SceneType.PLANE
      )
         return

      if (constellationFigures.current != null)
         removeObject3D(constellationFigures.current, displayedSceneData.scene)

      if (!constellationFiguresActivated) return

      constellationFigures.current = new THREE.Mesh(
         new THREE.SphereGeometry(
            OUTER_SPACE_RADIUS,
            SPHERE_WIDTH_SEGMENTS,
            SPHERE_HEIGHT_SEGMENTS
         ),
         new THREE.MeshBasicMaterial({
            map: constellationFiguresTexture,
            side: THREE.BackSide,
            opacity: 1,
            transparent: true,
         })
      )

      constellationFigures.current.rotation.x =
         THREE.MathUtils.degToRad(EARTH_ANGLE)

      constellationFigures.current.name = CONSTELLATION_FIGURES_NAME
      constellationFigures.current.renderOrder = OUTER_SPACE_RENDER_ORDER
      displayedSceneData.scene.add(constellationFigures.current)
   }

   useEffect((): void => {
      createConstellationFigures()
   }, [displayedSceneData, constellationFiguresActivated])

   return null
}
