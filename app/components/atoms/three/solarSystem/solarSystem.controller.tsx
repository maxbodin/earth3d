'use client'
import { useEffect, useRef } from 'react'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'

import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { astres } from '@/app/data/astres'
import { Body } from 'astronomy-engine'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import {
   SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MAX_SCALE,
   SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MIN_SCALE,
   SUN_RADIUS,
} from '@/app/constants/numbers'
import { TEXT_FONT } from '@/app/constants/paths'
import { useSolarSystem } from '@/app/components/atoms/three/solarSystem/solarSystem.model'
import { Astre } from '@/app/types/astre'
import { clamp } from '@/app/helpers/numberHelper'
import { useAstresList } from '@/app/components/organisms/astresList/astresList.model'
import { SolarSystemHelper } from '@/app/components/atoms/three/solarSystem/solarSystem.helper'
import { SOLAR_SYSTEM_FRAGMENT_SHADER, SOLAR_SYSTEM_VERTEX_SHADER } from '@/app/lib/shaders'

export function SolarSystemController(): null {
   const { displayedSceneData } = useScenes()
   const { selectedAstre, selectedDate } = useAstresList()
   const { getPlanetPosition, dateValueToDate } = SolarSystemHelper()

   const namesGroup = useRef<THREE.Group>(new THREE.Group())
   const astresMeshesGroup = useRef<THREE.Group>(new THREE.Group())

   const font = useRef<Font>()
   const materials = [
      new THREE.MeshBasicMaterial({ color: '#ffffff' }), // Front.
      new THREE.MeshBasicMaterial({ color: '#444444' }), // Side.
   ]

   const { trueSize } = useSolarSystem()

   /**
    *
    */
   const createSolarSystemMeshes = (): void => {
      if (
         displayedSceneData?.scene == null ||
         displayedSceneData.type == SceneType.PLANE
         || displayedSceneData.type == SceneType.SPHERICAL
      )
         return

      astresMeshesGroup.current.clear()

      astres.forEach((astre: Astre): void => {

         // Hide Moon if not in true size.
         if (!trueSize && astre.body == Body.Moon) {
            return
         }

         const astreRadius: number = trueSize ? astre.radius : SUN_RADIUS

         // TODO : Need to be fixed as atmospheres are not currently displayed.
         const astreMesh: THREE.Mesh = new THREE.Mesh(
            new THREE.SphereGeometry(
               astreRadius,
               32,
               32,
            ),
            new THREE.ShaderMaterial({
               // side: THREE.FrontSide,
               depthWrite: true,
               depthTest: true,
               transparent: false,
               blending: THREE.AdditiveBlending,
               vertexShader: SOLAR_SYSTEM_VERTEX_SHADER,
               fragmentShader: SOLAR_SYSTEM_FRAGMENT_SHADER,
               uniforms: {
                  globeTexture: {
                     value: astre.texture,
                  },
                  atmosphereColor: {
                     value: new THREE.Color(astre.color), // Ensure it's a THREE.Color
                  },
               },
            }),
         )


         astreMesh.name = astre.name
         astre.astreMesh = astreMesh

         astresMeshesGroup.current.add(astreMesh)
      })

      displayedSceneData.scene?.add(astresMeshesGroup.current)
   }

   /**
    * Function to animate trajectories between two dates.
    * @param startDate
    * @param endDate
    * @param duration
    */
      // TODO : Use and maybe fix so that it gets positions for each day between the two dates.
   const animatePlanetTrajectories = (startDate: Date, endDate: Date, duration: number): void => {
         // Clear any ongoing animations.
         gsap.killTweensOf(astres)

         // Loop through each planet and animate its trajectory
         astres.forEach((astre: Astre): void => {
            const startPosition = getPlanetPosition(astre.body, startDate)
            const endPosition = getPlanetPosition(astre.body, endDate)

            if (astre.astreMesh) {
               // Use GSAP to animate the position from start to end
               gsap.to(astre.astreMesh.position, {
                  x: endPosition.x,
                  y: endPosition.y,
                  z: endPosition.z,
                  duration: duration,
                  ease: 'power1.inOut',
                  onUpdate: (): void => {
                     // Optionally: Update any labels, names, or other 3D elements
                  },
               })
            }
         })
      }

   /**
    *
    */
   const setSolarSystemPositions = (): void => {
      astres.forEach((astre: Astre): void => {
         const position: THREE.Vector3 = getPlanetPosition(astre.body, dateValueToDate(selectedDate))
         if (astre.astreMesh) {
            astre.astreMesh.position.set(
               position.x,
               position.y,
               position.z,
            )
         }
      })
   }

   /**
    *
    */
   function loadFont(): void {
      const loader: FontLoader = new FontLoader()
      loader.load(TEXT_FONT, function(response: Font): void {
         font.current = response
      })
   }

   /**
    *
    */
   const createSolarSystemNames = (): void => {
      if (font.current == null) {
         loadFont()
      }

      if (font.current == null || displayedSceneData == null) return

      namesGroup.current.clear()

      astres.forEach((astre: Astre): void => {
         if (!astre.astreMesh) return

         // Hide Moon Name if not in true size.
         if (!trueSize && astre.body == Body.Moon) {
            return
         }

         const textGeo: TextGeometry = new TextGeometry(astre.name, {
            font: font.current!,
            size: SUN_RADIUS,
            depth: 50,
            curveSegments: 4,
            bevelEnabled: true,
            bevelThickness: SUN_RADIUS / 1e3,
            bevelSize: SUN_RADIUS / 1e4,
            bevelOffset: 0,
            bevelSegments: 4,
         })

         textGeo.computeBoundingBox()
         textGeo.name = `${astre.name} Geometry`

         const astreRadius: number = trueSize ? astre.radius : SUN_RADIUS
         const position: THREE.Vector3 = astre.astreMesh.position
          const textMesh: THREE.Mesh<
             TextGeometry,
             THREE.MeshBasicMaterial[],
             THREE.Object3DEventMap
          > = new THREE.Mesh(textGeo, materials)
         textMesh.position.set(position.x, position.y + astreRadius * 2, position.z)
         textMesh.name = `${astre.name} Mesh`

         namesGroup.current.add(textMesh)
      })

      displayedSceneData.scene.add(namesGroup.current)
   }

   /**
    * Cleanup : remove events listeners.
    */
   const cleanup = (): void => {
      displayedSceneData?.controls?.removeEventListener(
         'change',
         handleNamesLOD,
      )
   }

   useEffect(() => {

      createSolarSystemMeshes()
      setSolarSystemPositions()
      createSolarSystemNames()

      // Initialize Names Sizes.
      handleNamesLOD()

      animate()

      displayedSceneData?.controls?.addEventListener('change', handleNamesLOD)

      return cleanup
   }, [displayedSceneData, trueSize, selectedDate])


   const astresNamesAdjustedScale = useRef<number>(SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MAX_SCALE)

   /**
    * Function to handle resizing names accordingly with zoom.
    */
   const handleNamesLOD = (): void => {
      if (namesGroup.current == null || displayedSceneData == null) {
         return
      }

      astresNamesAdjustedScale.current = clamp(
         displayedSceneData.controls.getDistance() / 1e10,
         SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MIN_SCALE,
         SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MAX_SCALE,
      )

      namesGroup.current.children.forEach((name): void => {
         name.scale.set(
            astresNamesAdjustedScale.current,
            astresNamesAdjustedScale.current,
            astresNamesAdjustedScale.current,
         )
      })
   }


   /**
    * Update min distance from selected astre using selected astre radius.
    */
   useEffect((): void => {
      if (displayedSceneData?.controls)
         displayedSceneData.controls.minDistance = (trueSize ? selectedAstre.radius : SUN_RADIUS) * 2
   }, [displayedSceneData?.controls, selectedAstre, trueSize])


   /**
    * Animation loop to update planet positions based on real-time heliocentric data.
    */
   const animate = (): void => {
      requestAnimationFrame(animate)

      if (displayedSceneData?.camera == null)
         return

      namesGroup.current.children.forEach(
         (
            value: THREE.Object3D<THREE.Object3DEventMap>,
         ): void => {
            value.lookAt(displayedSceneData.camera.position)
         },
      )
   }

   return null
}