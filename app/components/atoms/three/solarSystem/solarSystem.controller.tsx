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

export function SolarSystemController(): null {
   const { displayedSceneData } = useScenes()

   const namesGroup = useRef<THREE.Group>(new THREE.Group())

   const font = useRef<Font>()

   /**
    *
    */
   const createSolarSystem = (): void => {
      if (
         displayedSceneData == null ||
         displayedSceneData.scene == null ||
         displayedSceneData.type == SceneType.PLANE
         || displayedSceneData.type == SceneType.SPHERICAL
      )
         return

      astres.forEach((astre): void => {
         const planetMesh = new THREE.Mesh(new THREE.SphereGeometry(astre.radius, 32, 32), new THREE.MeshBasicMaterial({ color: astre.color }))
         astre.planetMesh = planetMesh
         planetMesh.name = astre.name
         displayedSceneData.scene?.add(planetMesh)
      })
   }

   useEffect((): void => {
      if (font.current == null) {
         loadFont()
      }

      createSolarSystem()


      // Get current date for real-time positioning.
      const currentDate: Date = new Date()

      namesGroup.current.clear()

      if (
         displayedSceneData == null) return

      astres.forEach((astre): void => {
         const position = getPlanetPosition(astre.body, currentDate).multiplyScalar(1e10)
         if (astre.planetMesh) {
            // Convert from AU to kilometers, then set the 3D position
            astre.planetMesh.position.set(
               position.x,
               position.y,
               position.z,
            )

            if (font.current == null) return

            const textGeo: TextGeometry = new TextGeometry(astre.name, {
               font: font.current,
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

            const textMesh = new THREE.Mesh(textGeo, materials)
            textMesh.position.set(position.x, position.y + astre.radius * 2, position.z)
            textMesh.name = `${astre.name} Mesh`

            namesGroup.current.add(textMesh)
         }
      })

      displayedSceneData.scene.add(namesGroup.current)


      animate()

   }, [displayedSceneData, font.current])


   const materials = [
      new THREE.MeshBasicMaterial({ color: '#ffffff' }), // front
      new THREE.MeshBasicMaterial({ color: '#444444' }), // side
   ]

   function loadFont(): void {
      const loader: FontLoader = new FontLoader()
      loader.load(TEXT_FONT, function(response: Font): void {
         font.current = response
      })
   }

   // Helper function to get planet position in 3D (heliocentric coordinates)
   const getPlanetPosition = (planetBody: Astronomy.Body, date: Date) => {
      const time = new Astronomy.AstroTime(date)
      const vector = Astronomy.HelioVector(planetBody, time)
      return new THREE.Vector3(vector.x, vector.y, vector.z)
   }


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

      // TODO
   }

   return null
}


// TODO : When in solar system mode :
//// Remove search bar
//// Remove unusable items in nav bar.
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
