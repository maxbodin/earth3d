'use client'
import * as THREE from 'three'
import { useCallback, useEffect } from 'react'
import {
   EARTH_ANGLE,
   EARTH_RADIUS,
   OUTER_SPACE_RADIUS,
   PLANET_DISPLACEMENT_SCALE,
   SPHERE_HEIGHT_SEGMENTS,
   SPHERE_WIDTH_SEGMENTS,
} from '@/app/constants/numbers'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { OUTER_SPACE_RENDER_ORDER } from '@/app/constants/renderOrder'
import { MILKY_WAY_NAME } from '@/app/constants/strings'
import { MILKY_WAY_PNG } from '@/app/constants/paths'
import { useOuterSpace } from '@/app/components/atoms/three/outerSpace/outerSpace.model'
import { removeObject3D } from '@/app/helpers/threeHelper'
import { MILKY_WAY_FRAGMENT_SHADER, MILKY_WAY_VERTEX_SHADER } from '@/app/lib/shaders'

export function MilkyWay(): null {
   const { milkyWay, setMilkyWay } = useOuterSpace()
   const { displayedSceneData } = useScenes()

   const milkyWayTexture: THREE.Texture = new THREE.TextureLoader().load(
      MILKY_WAY_PNG,
   )

   /**
    * Function to create the milky way mesh.
    */
   const createMilkyWay = useCallback((): void => {
      // Return early if scene data is missing, or the scene is of type PLANE.
      if (
         !displayedSceneData?.scene ||
         displayedSceneData.type == SceneType.PLANE
      ) {
         return
      }

      // If the milkyWay already exists and is part of the scene, return early to prevent duplication.
      if (milkyWay && displayedSceneData.scene.children.includes(milkyWay)) {
         return
      }

      // Create and add the milkyWay mesh if it doesn't already exist in the scene.
      const newMilkyWay = new THREE.Mesh(
         new THREE.SphereGeometry(
            OUTER_SPACE_RADIUS,
            SPHERE_WIDTH_SEGMENTS,
            SPHERE_HEIGHT_SEGMENTS,
         ),
         new THREE.ShaderMaterial({
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: true,
            transparent: true,
            vertexShader: MILKY_WAY_VERTEX_SHADER,
            fragmentShader: MILKY_WAY_FRAGMENT_SHADER,
            uniforms: {
               globeTexture: {
                  value: milkyWayTexture,
               },
               scale: {
                  value: EARTH_RADIUS * PLANET_DISPLACEMENT_SCALE,
               },
            },
         }),
      )

      // Set rotation, name, and render order for the milkyWay.
      newMilkyWay.rotation.x = THREE.MathUtils.degToRad(EARTH_ANGLE)
      newMilkyWay.name = MILKY_WAY_NAME
      newMilkyWay.renderOrder = OUTER_SPACE_RENDER_ORDER

      // Add the milkyWay to the scene.
      displayedSceneData.scene.add(newMilkyWay)

      // Save the created milkyWay in state, so it's not recreated again.
      setMilkyWay(newMilkyWay)
   }, [displayedSceneData, milkyWay, setMilkyWay])

   useEffect(() => {
      createMilkyWay()

      // Clean up the milkyWay when the component unmounts or when the scene changes.
      return (): void => {
         if (milkyWay && displayedSceneData?.scene) {
            removeObject3D(milkyWay, displayedSceneData.scene)
         }
      }
   }, [createMilkyWay, displayedSceneData?.scene, milkyWay])

   return null
}
