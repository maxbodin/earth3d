import { useCallback, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { removeObject3D } from '@/app/helpers/threeHelper'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { EARTH_RADIUS } from '@/app/constants/numbers'
import { PLANE_SCENE_SKY_NAME } from '@/app/constants/strings'
import { DisplayedSceneData } from '@/app/types/displayedSceneData'

/**
 * PlaneSky component responsible for creating and managing the sky in the plane scene.
 */
export function PlaneSky(): null {
   const [planeSky, setPlaneSky] = useState<Sky | null>(null)

   const { displayedSceneData } = useScenes()

   /**
    * Updates the uniforms of the sky object with given effect parameters.
    * @param sky - The Sky object whose uniforms are to be updated.
    * @param params - The effect parameters.
    */
   const updateSkyUniforms = (sky: Sky, params: Record<string, number>): void => {
      const { turbidity, rayleigh, mieCoefficient, mieDirectionalG, elevation, azimuth } = params
      const uniforms = sky.material.uniforms

      uniforms['turbidity'].value = turbidity
      uniforms['rayleigh'].value = rayleigh
      uniforms['mieCoefficient'].value = mieCoefficient
      uniforms['mieDirectionalG'].value = mieDirectionalG

      const phi: number = THREE.MathUtils.degToRad(90 - elevation)
      const theta: number = THREE.MathUtils.degToRad(azimuth)
      const sun: THREE.Vector3 = new THREE.Vector3().setFromSphericalCoords(1, phi, theta)

      uniforms['sunPosition'].value.copy(sun)
   }


   /**
    * Initializes the sky object for the plane scene.
    * @param sceneData - The scene data containing the scene and type.
    */
   const initializeSky = (sceneData: DisplayedSceneData): void => {
      if (!sceneData?.scene || sceneData.type !== SceneType.PLANE) return

      if (planeSky) {
         removeObject3D(planeSky, sceneData.scene)
      }

      const newSky: Sky = new Sky()
      newSky.name = PLANE_SCENE_SKY_NAME
      newSky.scale.setScalar(EARTH_RADIUS * 1e4)

      const effectParams = {
         turbidity: 0,
         rayleigh: 0.1,
         mieCoefficient: 0,
         mieDirectionalG: 0,
         elevation: 8.9,
         azimuth: -180,
      }

      updateSkyUniforms(newSky, effectParams)

      sceneData.scene.add(newSky)
      setPlaneSky(newSky)
   }

   /**
    * Creates the sky object in the plane scene.
    */
   const createSky = useCallback((): void => {
      if (displayedSceneData) {
         initializeSky(displayedSceneData)
      }
   }, [displayedSceneData])

   useEffect(() => {
      createSky()

      return (): void => {
         if (planeSky && displayedSceneData?.scene) {
            removeObject3D(planeSky, displayedSceneData.scene)
         }
      }
   }, [createSky, displayedSceneData])

   return null
}
