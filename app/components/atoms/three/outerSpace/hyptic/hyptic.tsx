'use client'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import {
   EARTH_ANGLE,
   OUTER_SPACE_RADIUS,
   SPHERE_HEIGHT_SEGMENTS,
   SPHERE_WIDTH_SEGMENTS,
} from '@/app/constants/numbers'
import { removeObject3D } from '@/app/components/templates/threeScene/threeScene'
import { useScenes } from '@/app/context/scenesContext'
import { SceneType } from '@/app/components/enums/sceneType'
import { useOuterSpaceTab } from '@/app/components/organisms/dashboardTabs/outerSpaceTab/model'
import { OUTER_SPACE_RENDER_ORDER } from '@/app/constants/renderOrder'
import { HYPTIC_TEXTURE_PNG } from '@/app/constants/paths'
import { HYPTIC_NAME } from '@/app/constants/strings'

export function Hyptic(): null {
   const hyptic = useRef<THREE.Mesh | null>(null)
   const hypticTexture: THREE.Texture = new THREE.TextureLoader().load(
      HYPTIC_TEXTURE_PNG
   )
   const { displayedSceneData } = useScenes()
   const { hypticActivated } = useOuterSpaceTab()

   /**
    * Function to create the hyptic mesh.
    */
   const createHyptic = (): void => {
      if (
         displayedSceneData == null ||
         displayedSceneData.scene == null ||
         displayedSceneData.type == SceneType.PLANE
      )
         return

      if (hyptic.current != null)
         removeObject3D(hyptic.current, displayedSceneData.scene)

      if (!hypticActivated) return

      hyptic.current = new THREE.Mesh(
         new THREE.SphereGeometry(
            OUTER_SPACE_RADIUS,
            SPHERE_WIDTH_SEGMENTS,
            SPHERE_HEIGHT_SEGMENTS
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
         })
      )

      hyptic.current.rotation.x = THREE.MathUtils.degToRad(EARTH_ANGLE)
      hyptic.current.name = HYPTIC_NAME
      hyptic.current.renderOrder = OUTER_SPACE_RENDER_ORDER
      displayedSceneData.scene.add(hyptic.current)
   }

   useEffect((): void => {
      createHyptic()
   }, [displayedSceneData, hypticActivated])

   return null
}
