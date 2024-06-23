'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { SceneType } from '@/app/enums/sceneType'
import { removeObject3D } from '@/app/helpers/threeHelper'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { EARTH_RADIUS } from '@/app/constants/numbers'
import { PLANE_SCENE_SKY_NAME } from '@/app/constants/strings'

export function PlaneSky(): null {
   const planeSky = useRef<Sky>(new Sky())

   const { displayedSceneData } = useScenes()

   /**
    * Function to create the sky.
    */
   const createSky = (): void => {
      if (displayedSceneData == null || displayedSceneData.scene == null) return

      if (displayedSceneData.type == SceneType.PLANE) {
         if (planeSky.current != null)
            removeObject3D(planeSky.current, displayedSceneData.scene)

         planeSky.current = new Sky()
         planeSky.current.name = PLANE_SCENE_SKY_NAME
         planeSky.current.scale.setScalar(EARTH_RADIUS * 1e4)

         const effectController = {
            turbidity: 0,
            rayleigh: 0.1,
            mieCoefficient: 0,
            mieDirectionalG: 0,
            elevation: 8.9,
            azimuth: -180,
         }

         const uniforms = planeSky.current.material.uniforms
         uniforms['turbidity'].value = effectController.turbidity
         uniforms['rayleigh'].value = effectController.rayleigh
         uniforms['mieCoefficient'].value = effectController.mieCoefficient
         uniforms['mieDirectionalG'].value = effectController.mieDirectionalG

         const phi: number = THREE.MathUtils.degToRad(
            90 - effectController.elevation,
         )
         const theta: number = THREE.MathUtils.degToRad(
            effectController.azimuth,
         )

         const sun: THREE.Vector3 = new THREE.Vector3()
         sun.setFromSphericalCoords(1, phi, theta)
         uniforms['sunPosition'].value.copy(sun)

         displayedSceneData.scene?.add(planeSky.current)
      }
   }

   const handleCameraMove = (): void => {
      // TODO WORK IN PROGRESS
      // if (Math.random() < 0.9) return
      //
      // displayedSceneData?.camera?.position
      //
      // var SunCalc = require('suncalc')
      // // get today's sunlight times for London
      // const times = SunCalc.getTimes(new Date(), 51.5, -0.1)
      //
      // console.log(times)
      // // format sunrise time from the Date object
      // const sunriseStr: string = `${times.sunrise.getHours()}:${times.sunrise.getMinutes()}`
      //
      // // get position of the sun (azimuth and altitude) at today's sunrise
      // const sunrisePos = SunCalc.getPosition(times.sunrise, 51.5, -0.1)
      //
      // // get sunrise azimuth in degrees
      // const sunriseAzimuth: number = (sunrisePos.azimuth * 180) / Math.PI
   }


   useEffect((): void => {
      createSky()
   }, [])

   return null
}
