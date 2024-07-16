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
import { SceneType } from '@/app/enums/sceneType'
import { OUTER_SPACE_RENDER_ORDER } from '@/app/constants/renderOrder'
import { useOuterSpaceTab } from '@/app/components/organisms/dashboardTabs/outerSpaceTab/model'
import { CONSTELLATION_BOUNDS_PNG } from '@/app/constants/paths'
import { CONSTELLATION_BOUNDS_NAME } from '@/app/constants/strings'
import { removeObject3D } from '@/app/helpers/threeHelper'

export function ConstellationBounds(): null {
   const constellationBounds = useRef<THREE.Mesh | null>(null)
   const constellationBoundsTexture: THREE.Texture =
      new THREE.TextureLoader().load(CONSTELLATION_BOUNDS_PNG)
   const { displayedSceneData } = useScenes()
   const { constellationBoundsActivated } = useOuterSpaceTab()

   /**
    * Function to create the constellation bounds mesh.
    */
   const createConstellationBounds = (): void => {
      if (
         displayedSceneData == null ||
         displayedSceneData.scene == null ||
         displayedSceneData.type == SceneType.PLANE
      )
         return

      if (constellationBounds.current != null)
         removeObject3D(constellationBounds.current, displayedSceneData.scene)

      if (!constellationBoundsActivated) return

      constellationBounds.current = new THREE.Mesh(
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

      constellationBounds.current.rotation.x =
         THREE.MathUtils.degToRad(EARTH_ANGLE)

      constellationBounds.current.name = CONSTELLATION_BOUNDS_NAME
      constellationBounds.current.renderOrder = OUTER_SPACE_RENDER_ORDER
      displayedSceneData.scene.add(constellationBounds.current)
   }

   useEffect((): void => {
      createConstellationBounds()
   }, [displayedSceneData, constellationBoundsActivated])

   return null
}
