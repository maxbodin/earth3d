'use client'
import { useEffect, useRef } from 'react'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'

import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { astres } from '@/app/data/astres'
import * as Astronomy from 'astronomy-engine'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { SUN_RADIUS } from '@/app/constants/numbers'
import { TEXT_FONT } from '@/app/constants/paths'
import { useSolarSystem } from '@/app/components/atoms/three/solarSystem/solarSystem.model'
import { Astre } from '@/app/types/astre'

export function SolarSystemController(): null {
   const { displayedSceneData } = useScenes()

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
         displayedSceneData == null ||
         displayedSceneData.scene == null ||
         displayedSceneData.type == SceneType.PLANE
         || displayedSceneData.type == SceneType.SPHERICAL
      )
         return

      astresMeshesGroup.current.clear()

      astres.forEach((astre): void => {
         const astreRadius: number = trueSize ? SUN_RADIUS : astre.radius
         const astreMesh = new THREE.Mesh(new THREE.SphereGeometry(astreRadius, 32, 32), new THREE.MeshBasicMaterial({ color: astre.color }))
         astreMesh.name = astre.name
         astre.astreMesh = astreMesh

         astresMeshesGroup.current.add(astreMesh)
      })

      displayedSceneData.scene?.add(astresMeshesGroup.current)
   }

   /**
    * Helper function to get planet position in 3D (heliocentric coordinates).
    * @param planetBody
    * @param date
    */
   const getPlanetPosition = (planetBody: Astronomy.Body, date: Date) => {
      const time = new Astronomy.AstroTime(date)
      const vector = Astronomy.HelioVector(planetBody, time)
      return new THREE.Vector3(vector.x, vector.y, vector.z)
   }


   /**
    *
    */
   const setSolarSystemPositions = (): void => {
      // Get current date for real-time positioning.
      const currentDate: Date = new Date()

      astres.forEach((astre: Astre): void => {
         const position = getPlanetPosition(astre.body, currentDate).multiplyScalar(1e10)
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

      astres.forEach((astre): void => {

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

         const astreRadius: number = trueSize ? SUN_RADIUS : astre.radius
         const position = astre.astreMesh.position
         const textMesh = new THREE.Mesh(textGeo, materials)
         textMesh.position.set(position.x, position.y + astreRadius * 2, position.z)
         textMesh.name = `${astre.name} Mesh`

         namesGroup.current.add(textMesh)
      })

      displayedSceneData.scene.add(namesGroup.current)
   }

   useEffect((): void => {

      createSolarSystemMeshes()
      setSolarSystemPositions()
      createSolarSystemNames()
      animate()

   }, [displayedSceneData, font.current, trueSize])


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


// TODO : When in solar system mode :
//// Add a planet list selection, user can select a planet.
////////// When a planet is selected :
////////////// GSAP fly to planet
////////////// Open modal with data on planet.
////////////// Display texture on planet instead of color.
//// Allow user to select a date to display solar system position.
//// Allow user to timelapse planets position.
//// Allow user to select if view is centered on earth or sun.
//////// If centered on earth, when zooming => get back to earth view.
//////// In nav bar : button to get back to earth view.
//////// Allow user to display ellipses of astres trajectories.
//////// Refactor font loading and usage in dedicated provider.
//////// Fix moon visualization.
// https://ui.shadcn.com/docs/components/calendar https://ui.shadcn.com/docs/components/date-picker
/// LOD for astres names