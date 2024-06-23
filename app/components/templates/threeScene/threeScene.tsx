'use client'
import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import { PlanetProvider } from '@/app/context_todo_improve/planetContext'
import { Planet } from '@/app/components/atoms/three/planet/planet'
import { Atmosphere } from '@/app/components/atoms/three/atmosphere/atmosphere'
import { SceneType } from '@/app/enums/sceneType'
import { useMap } from '@/app/context_todo_improve/mapContext'
import { OuterSpace } from '@/app/components/atoms/three/outerSpace/outerSpace'
import { GLOBE_SCENE_NAME, PLANE_SCENE_NAME } from '@/app/constants/strings'
import { VesselsController } from '@/app/components/atoms/three/vessels/vessels.controller'
import { CountriesProvider } from '@/app/components/atoms/three/countries/countries.model'
import { CountriesController } from '@/app/components/atoms/three/countries/countries.controller'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { EARTH_RADIUS } from '@/app/constants/numbers'
import { Geolocation, ThreeGeoUnitsUtils } from '@/app/utils/micUnitsUtils'
import { getMapboxToken } from '@/app/server/actions/getMapboxToken'
import { CustomMapBoxProvider } from '@/app/lib/customMapBoxProvider'
import { PlaneSky } from '@/app/components/atoms/three/planeSky/planeSky'
import { ClickHandler } from '@/app/components/atoms/clickHandler/clickHandler'

export function ThreeScene() {
   const mountRef = useRef<HTMLDivElement>(null)
   const renderer = useRef<THREE.WebGLRenderer | null>(null)
   const scenes = useRef<any[]>([])
   const globeCamera = useRef<THREE.PerspectiveCamera | null>(null)
   const globeControls = useRef<OrbitControls | null>(null)
   const planeCamera = useRef<THREE.PerspectiveCamera | null>(null)
   const planeControls = useRef<OrbitControls | null>(null)

   const { globeScene, planeScene, setDisplayedSceneData, displayedSceneData } =
      useScenes()

   const { map, setMap, setMapProvider } = useMap()

   /**
    * Function to set up renderer, scene, and camera.
    */
   const setupRenderer = (): void => {
      if (!mountRef.current) return

      // Set renderer settings.
      renderer.current = new THREE.WebGLRenderer({
         alpha: true,
         antialias: true,
         stencil: true,
         logarithmicDepthBuffer: true,
         depth: true,
         premultipliedAlpha: true,
         precision: 'highp', //highp", "mediump" or "lowp"
         powerPreference: 'default', //"high-performance", "low-power" or "default"
      })
      renderer.current.setSize(window.innerWidth, window.innerHeight)
      renderer.current.setPixelRatio(window.devicePixelRatio)
      renderer.current.toneMapping = THREE.ACESFilmicToneMapping
      renderer.current.shadowMap.enabled = true
      renderer.current.shadowMap.type = THREE.PCFSoftShadowMap

      // Append renderer to dom.
      mountRef.current.appendChild(renderer.current.domElement)

      // List of scenes.
      scenes.current = [createGlobeScene(), createPlaneScene()]
   }

   /**
    * Create scene for spherical earth.
    */
   function createGlobeScene(): any {
      // Initialize scene.
      globeScene.name = GLOBE_SCENE_NAME
      // Initialize camera.
      globeCamera.current = new THREE.PerspectiveCamera(
         75,
         window.innerWidth / window.innerHeight,
         0.001,
         1e18,
      )

      // Set controls settings.
      globeControls.current = new MapControls(
         globeCamera.current,
         renderer.current!.domElement,
      )
      globeControls.current!.enableDamping = true
      globeControls.current!.dampingFactor = 0.1
      globeControls.current!.rotateSpeed = 0.1
      globeControls.current!.zoomSpeed = 1
      globeControls.current!.enablePan = false
      globeControls.current!.autoRotate = false
      globeControls.current!.minDistance = EARTH_RADIUS + 3e4
      globeControls.current!.maxDistance = EARTH_RADIUS + 2e7
      globeControls.current!.mouseButtons = {
         LEFT: THREE.MOUSE.ROTATE,
         MIDDLE: THREE.MOUSE.DOLLY,
         RIGHT: THREE.MOUSE.PAN,
      }
      globeControls.current!.minPolarAngle = 0
      globeControls.current!.maxPolarAngle = Math.PI
      globeControls.current!.update()

      // Set initial camera position
      globeCamera.current.position.set(10e9, 8e9, EARTH_RADIUS + 1e9)

      return {
         type: SceneType.SPHERICAL,
         camera: globeCamera.current,
         controls: globeControls.current,
         scene: globeScene,
      }
   }

   /**
    * Create scene for planar map.
    */
   function createPlaneScene(): any {
      // Initialize scene.
      planeScene.name = PLANE_SCENE_NAME

      // Initialize camera.
      planeCamera.current = new THREE.PerspectiveCamera(
         75,
         window.innerWidth / window.innerHeight,
         0.001,
         1e12,
      )

      planeScene.add(new THREE.AmbientLight(0x777777, 1.2))

      planeControls.current = new MapControls(
         planeCamera.current,
         renderer.current!.domElement,
      )
      planeControls.current!.minDistance = 1.0
      planeControls.current!.zoomSpeed = 1
      planeControls.current!.enableDamping = true
      planeControls.current!.dampingFactor = 0.05
      planeControls.current!.enablePan = true
      planeControls.current!.rotateSpeed = 0.3
      planeControls.current!.autoRotate = false
      planeControls.current!.update()

      return {
         type: SceneType.PLANE,
         camera: planeCamera.current,
         controls: planeControls.current,
         scene: planeScene,
      }
   }

   const raycaster = new THREE.Raycaster()
   const handleLOD = (currentScene: any) => {
      const toggleDistance: number = 1e6

      if (activeSceneType.current === SceneType.SPHERICAL) {
         // Get distance to the surface of earth.
         const distance: number =
            currentScene.controls.getDistance() - EARTH_RADIUS

         if (distance < toggleDistance) {
            // Set raycaster to the camera center.
            const pointer: THREE.Vector2 = new THREE.Vector2(0.0, 0.0)
            raycaster.setFromCamera(pointer, currentScene.camera)

            // Raycast from center of the camera to the sphere surface
            const intersects = raycaster.intersectObjects(
               currentScene.scene.children,
            )

            if (intersects.length > 0) {
               const point: THREE.Vector3 = intersects[0].point

               // Get coordinates from sphere surface
               const planetPos: Geolocation =
                  ThreeGeoUnitsUtils.vectorToDatums(point)

               const planeScene = scenes.current[SceneType.PLANE]
               planeScene.scene.visible = true
               scenes.current[SceneType.SPHERICAL].scene.visible = false

               // Calculate plane coordinates.
               const worldCoords: THREE.Vector2 =
                  ThreeGeoUnitsUtils.datumsToSpherical(
                     planetPos.latitude,
                     planetPos.longitude,
                  )

               /* TODO DELETE, THIS IS TEST TO PLACE MODEL AT LAT LON ON PLANE.
               const test = new THREE.Mesh(
                  new THREE.SphereGeometry(1e4, 16, 16),
                  new THREE.MeshBasicMaterial({ color: '#ff0000' })
               )

               test.position.set(worldCoords.x, 0, -worldCoords.y)
               planeScene.scene?.add(test)*/

               planeScene.controls.target.set(worldCoords.x, 0, -worldCoords.y)
               planeScene.camera.position.set(
                  worldCoords.x,
                  distance,
                  -worldCoords.y,
               )

               console.log(
                  'Geo-Three: Switched scene from sphere to plane.',
                  point,
                  planetPos,
                  worldCoords,
               )

               // Change scene to "plane" earth
               activeSceneType.current = SceneType.PLANE
            }
         }
      } else if (activeSceneType.current === SceneType.PLANE) {
         const distance = currentScene.controls.getDistance()

         currentScene.controls.minPolarAngle = 0
         currentScene.controls.maxPolarAngle = Math.PI / 3

         currentScene.controls.minAzimuthAngle = -Math.PI
         currentScene.controls.maxAzimuthAngle = Math.PI

         const ratio = 0.8
         if (distance > toggleDistance * ratio) {
            // Transition progress (0 to 1)
            const progress: number =
               (toggleDistance - distance) / (toggleDistance * (1 - ratio))

            // Limit polar angle
            currentScene.controls.maxPolarAngle = (progress * Math.PI) / 2

            // Limit range of azimuth rotation
            currentScene.controls.minAzimuthAngle = progress * -Math.PI
            currentScene.controls.maxAzimuthAngle = progress * Math.PI
         }

         if (distance > toggleDistance) {
            // Datum coordinates
            const target = currentScene.controls.target
            const coords: Geolocation = ThreeGeoUnitsUtils.sphericalToDatums(
               target.x,
               -target.z,
            )

            // Get sphere surface point from coordinates
            const dir: THREE.Vector3 = ThreeGeoUnitsUtils.datumsToVector(
               coords.latitude,
               coords.longitude,
            )

            const sphereScene = scenes.current[SceneType.SPHERICAL]
            sphereScene.scene.visible = true
            scenes.current[SceneType.PLANE].scene.visible = false

            // Set camera position
            dir.multiplyScalar(EARTH_RADIUS + distance)
            sphereScene.camera.position.copy(dir)

            console.log(
               'Geo-Three: Switched scene from plane to sphere.',
               currentScene.controls,
               coords,
               dir,
            )

            // Change to spherical earth model
            activeSceneType.current = SceneType.SPHERICAL

            /* TODO DELETE, THIS IS TEST TO PLACE MODEL AT LAT LON POS ON SPHERE.
            const testCoords = UnitsUtils.datumsToVector(48.866667, 2.333333)
            console.log(testCoords)
            const test = new THREE.Mesh(
               new THREE.SphereGeometry(1e5, 16, 16),
               new THREE.MeshBasicMaterial({ color: '#0000ff' })
            )
            test.position
               .set(testCoords.x, testCoords.y, testCoords.z)
               .multiplyScalar(EARTH_RADIUS)
            sphereScene.scene?.add(test)
            */
         }
      }
   }

   const activeSceneType = useRef<SceneType>(SceneType.SPHERICAL)

   const animate: () => void = (): void => {
      if (renderer.current == null || scenes.current == null) return

      requestAnimationFrame(animate)

      const currentScene = scenes.current[activeSceneType.current]
      if (currentScene == null) return
      setDisplayedSceneData(currentScene)
      currentScene.controls.update()

      renderer.current.clear()
      renderer.current.render(currentScene.scene!, currentScene.camera!)

      handleLOD(currentScene)
   }

   /**
    * Called on resize window.
    */
   const handleResize = (): void => {
      if (renderer.current) {
         const width: number = window.innerWidth
         const height: number = window.innerHeight

         renderer.current.setSize(width, height)

         for (let i: number = 0; i < scenes.current.length; i++) {
            const s = scenes.current[i]
            s.camera.aspect = width / height
            s.camera.updateProjectionMatrix()
            s.camera.updateMatrixWorld()
         }
      }
   }

   /**
    * Function to clean up on component unmount.
    */
   const cleanup: () => void = (): void => {
      window.removeEventListener('resize', handleResize)
      if (renderer.current && renderer.current.domElement.parentNode) {
         renderer.current.domElement.parentNode.removeChild(
            renderer.current.domElement,
         )
      }
   }

   // Async function to dynamically import CustomMapBoxProvider class
   const importCustomMapBoxProvider = async () => {
      // Dynamically import the CustomMapBoxProvider class.
      const { CustomMapBoxProvider } = await import(
         '../../../lib/customMapBoxProvider'
         )

      const mapBoxProvider: CustomMapBoxProvider = new CustomMapBoxProvider()

      if (mapBoxProvider.publicToken == '') {
         mapBoxProvider.publicToken = await getMapboxToken()
         if (mapBoxProvider.publicToken == null) {
            console.error('MISSING MAPBOX PUBLIC TOKEN.')
         }
      }

      setMapProvider(mapBoxProvider)

      return mapBoxProvider
   }

   useEffect(() => {
      window.addEventListener('resize', handleResize)

      // Set up renderer, scene, and camera.
      setupRenderer()

      if (typeof window !== 'undefined' && map == null) {
         // Import the CustomMapBoxProvider and initialize the map view.
         importCustomMapBoxProvider()
            .then((mapBoxProvider: CustomMapBoxProvider): void => {
               // Import MapView dynamically.
               // @ts-ignore
               import('geo-three').then(({ MapView }): void => {
                  const map = new MapView(MapView.PLANAR, mapBoxProvider)
                  planeScene.add(map)
                  map.updateMatrixWorld(true)
                  setMap(map)
               })
            })
            .catch((error): void => {
               console.error(
                  'Error importing or initializing map components:',
                  error,
               )
            })
      }

      if (!mountRef.current) return

      animate()


      return cleanup
   }, [])

   return (
      <>
         <div className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
               <div
                  ref={mountRef}
                  style={{
                     position: 'fixed',
                     top: '50%',
                     left: '50%',
                     transform: 'translate(-50%, -50%)',
                     overflow: 'hidden',
                  }}
               />
               <PlanetProvider>
                  <Planet />
                  <ClickHandler />
                  <VesselsController />
               </PlanetProvider>

               <OuterSpace />
               <Atmosphere />
               <PlaneSky />

               <CountriesProvider>
                  <CountriesController />
               </CountriesProvider>

               {/*
                     <Airports /> // TODO AIRPORT ONLY POUR LA PLANE SCENE ET UTILISER LA VISIBLE ZONE DE LA PLANE SCENE

// TODO FIX PLANES BEFORE UNCOMMENTING THIS
               <PlanesController
                  scene={globeScene.current}
                  camera={globeCamera.current}
               />

               <Polyline /> // TODO POUR TRACER DES LIGNES DE DEPLACEMENTS PAR EXEMPLE
            */}
            </div>
         </div>
      </>
   )
}
