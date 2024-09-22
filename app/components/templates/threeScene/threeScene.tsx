'use client'
import * as THREE from 'three'
import React, { useEffect, useRef, useState } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import { PlanetController } from '@/app/components/atoms/three/planet/planet.controller'
import { Atmosphere } from '@/app/components/atoms/three/atmosphere/atmosphere'
import { SceneType } from '@/app/enums/sceneType'
import { usePlaneMap } from '@/app/components/atoms/three/planeMapContext'
import { OuterSpaceController } from '@/app/components/atoms/three/outerSpace/outerSpace.controller'
import { GLOBE_SCENE_NAME, PLANE_SCENE_NAME, SOLAR_SYSTEM_SCENE_NAME } from '@/app/constants/strings'
import { VesselsController } from '@/app/components/atoms/three/vessels/vessels.controller'
import { CountriesProvider } from '@/app/components/atoms/three/countries/countries.model'
import { CountriesController } from '@/app/components/atoms/three/countries/countries.controller'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import {
   EARTH_RADIUS,
   MAX_EARTH_DISTANCE_GLOBE_SCENE,
   MAX_SOLAR_SYSTEM_DISTANCE,
   MIN_EARTH_DISTANCE_GLOBE_SCENE,
   SOLAR_SYSTEM_TO_GLOBE_TOGGLE_DISTANCE,
   SOLAR_SYSTEM_TOGGLE_DISTANCE,
   SPHERE_TO_PLANE_TOGGLE_DISTANCE,
   SUN_RADIUS,
} from '@/app/constants/numbers'
import { Geolocation, ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { getMapboxToken } from '@/app/server/actions/getMapboxToken'
import { CustomMapBoxProvider } from '@/app/lib/customMapBoxProvider'
import { PlaneSky } from '@/app/components/atoms/three/planeSky/planeSky'
import { ClickHandler } from '@/app/components/atoms/clickHandler/clickHandler'
import { AirportsController } from '@/app/components/atoms/three/airports/airports.controller'
import { PlanetProvider } from '@/app/components/atoms/three/planet/planet.model'
import { SolarSystemController } from '@/app/components/atoms/three/solarSystem/solarSystem.controller'
import { useAstresList } from '@/app/components/organisms/astresList/astresList.model'
import { Body } from 'astronomy-engine'
import { SolarSystemHelper } from '@/app/components/atoms/three/solarSystem/solarSystem.helper'
import { useSolarSystem } from '@/app/components/atoms/three/solarSystem/solarSystem.model'
import { SceneData } from '@/app/types/sceneData'
import { OuterSpaceProvider } from '@/app/components/atoms/three/outerSpace/outerSpace.model'

export function ThreeScene() {
   const mountRef = useRef<HTMLDivElement>(null)
   const renderer = useRef<THREE.WebGLRenderer | null>(null)
   const scenes = useRef<SceneData[]>([])

   const globeCamera = useRef<THREE.PerspectiveCamera | null>(null)
   const globeControls = useRef<OrbitControls | null>(null)

   const planeCamera = useRef<THREE.PerspectiveCamera | null>(null)
   const planeControls = useRef<OrbitControls | null>(null)


   const solarSystemCamera = useRef<THREE.PerspectiveCamera | null>(null)
   const solarSystemControls = useRef<OrbitControls | null>(null)

   const { globeScene, planeScene, solarSystemScene, setDisplayedSceneData } =
      useScenes()

   const { planeMap, setPlaneMap, setMapProvider } = usePlaneMap()

   const raycaster: THREE.Raycaster = new THREE.Raycaster()

   const activeSceneType = useRef<SceneType>(SceneType.SPHERICAL)

   const distanceToPlaneSurface = useRef<number | null>(null)
   const [distanceToSphereSurface, setDistanceToSphereSurface] = useState<number>(0)

   const { selectedAstre, selectedDate } = useAstresList()
   const { getPlanetPosition, dateValueToDate } = SolarSystemHelper()
   const { trueSize } = useSolarSystem()


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
         precision: 'highp', // "highp", "mediump" or "lowp"
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
      scenes.current = [createGlobeScene(), createPlaneScene(), createSolarSystemScene()]
   }

   /**
    * Create scene for spherical earth.
    */
   function createGlobeScene(): SceneData {
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
      globeControls.current!.minDistance = MIN_EARTH_DISTANCE_GLOBE_SCENE
      globeControls.current!.maxDistance = MAX_EARTH_DISTANCE_GLOBE_SCENE
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
   function createPlaneScene(): SceneData {
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


   /**
    * Create solar system scene.
    */
   function createSolarSystemScene(): SceneData {
      // Initialize scene.
      solarSystemScene.name = SOLAR_SYSTEM_SCENE_NAME

      // Initialize camera.
      solarSystemCamera.current = new THREE.PerspectiveCamera(
         75,
         window.innerWidth / window.innerHeight,
         0.001,
         1e18,
      )

      solarSystemControls.current = new MapControls(
         solarSystemCamera.current,
         renderer.current!.domElement,
      )
      solarSystemControls.current!.enableDamping = true
      solarSystemControls.current!.dampingFactor = 0.05
      solarSystemControls.current!.zoomSpeed = 1
      solarSystemControls.current!.rotateSpeed = .1
      solarSystemControls.current!.enablePan = false
      solarSystemControls.current!.autoRotate = false
      solarSystemControls.current!.minDistance = (trueSize ? EARTH_RADIUS : SUN_RADIUS) * 2
      solarSystemControls.current!.maxDistance = MAX_SOLAR_SYSTEM_DISTANCE
      solarSystemControls.current!.mouseButtons = {
         LEFT: THREE.MOUSE.ROTATE,
         MIDDLE: THREE.MOUSE.DOLLY,
         RIGHT: THREE.MOUSE.PAN,
      }
      solarSystemControls.current!.minPolarAngle = 0
      solarSystemControls.current!.maxPolarAngle = Math.PI

      const earthPosition: THREE.Vector3 = getPlanetPosition(Body.Earth, dateValueToDate(selectedDate))

      // Set the camera's position, so it's looking at the Earth from the side.
      solarSystemCamera.current.position.set(earthPosition.x + 1000, earthPosition.y + 1000, earthPosition.z)
      solarSystemControls.current.target.copy(earthPosition)

      solarSystemControls.current!.update()

      return {
         type: SceneType.SOLAR_SYSTEM,
         camera: solarSystemCamera.current,
         controls: solarSystemControls.current,
         scene: solarSystemScene,
      }
   }


   /**
    *
    * @param currentScene
    */
   const handleLOD = (currentScene: SceneData): void => {
      // Get distance to the surface of earth.
      distanceToPlaneSurface.current =
         distanceToSphereSurface - EARTH_RADIUS

      // Switch to plane map when close enough to Earth's surface.
      if (activeSceneType.current === SceneType.SPHERICAL
         && distanceToPlaneSurface.current < SPHERE_TO_PLANE_TOGGLE_DISTANCE) {
         switchToPlaneMap(currentScene)

         // Switch back to spherical Earth view when moving away from the plane.
      } else if (activeSceneType.current === SceneType.PLANE
         && distanceToSphereSurface > SPHERE_TO_PLANE_TOGGLE_DISTANCE) {
         switchToSpherical(currentScene)

         // Switch to solar system view when far enough from the sphere (Earth).
      } else if (activeSceneType.current === SceneType.SPHERICAL
         && distanceToSphereSurface > SOLAR_SYSTEM_TOGGLE_DISTANCE) {

         switchToSolarSystem(currentScene)

         // Switch back to spherical earth view when near enough from the sphere (Earth).
      } else if (activeSceneType.current === SceneType.SOLAR_SYSTEM
         && selectedAstre.body == Body.Earth
         && distanceToSphereSurface < SOLAR_SYSTEM_TO_GLOBE_TOGGLE_DISTANCE) {

         switchToSpherical(currentScene)
      }

      // TODO: Used to display children in current scene and try to fix double instantiating.
      // console.log(currentScene.scene.children)
   }

   /**
    *
    * @param currentScene
    */
   const switchToSpherical = (currentScene: SceneData): void => {

      /*
           TODO : Check if necessary.
           currentScene.controls.minPolarAngle = 0
            currentScene.controls.maxPolarAngle = Math.PI / 3

            currentScene.controls.minAzimuthAngle = -Math.PI
            currentScene.controls.maxAzimuthAngle = Math.PI

            if (distance > SPHERE_TO_PLANE_TRANSITION_TOGGLE_DISTANCE) {
               // Transition progress (0 to 1)
               const progress: number =
                  (SPHERE_TO_PLANE_TOGGLE_DISTANCE - distance) / (SPHERE_TO_PLANE_TOGGLE_DISTANCE * 0.2)

               // Limit polar angle
               currentScene.controls.maxPolarAngle = (progress * Math.PI) / 2

               // Limit range of azimuth rotation
               currentScene.controls.minAzimuthAngle = progress * -Math.PI
               currentScene.controls.maxAzimuthAngle = progress * Math.PI
            }*/

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
      scenes.current[SceneType.SOLAR_SYSTEM].scene.visible = false

      // Set camera position
      dir.multiplyScalar(EARTH_RADIUS + (distanceToSphereSurface ?? 0))
      sphereScene.camera.position.copy(dir)

      console.log(
         'Geo-Three: Switched scene from plane to sphere.',
         currentScene.controls,
         coords,
         dir,
      )

      // Change to spherical earth model
      activeSceneType.current = SceneType.SPHERICAL
   }

   /**
    *
    * @param currentScene
    */
   const switchToPlaneMap = (currentScene: SceneData): void => {
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
         scenes.current[SceneType.SOLAR_SYSTEM].scene.visible = false

         // Calculate plane coordinates.
         const worldCoords: THREE.Vector2 =
            ThreeGeoUnitsUtils.datumsToSpherical(
               planetPos.latitude,
               planetPos.longitude,
            )

         planeScene.controls.target.set(worldCoords.x, 0, -worldCoords.y)
         planeScene.camera.position.set(
            worldCoords.x,
            distanceToPlaneSurface.current!,
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

   /**
    *
    * @param currentScene
    */
   const switchToSolarSystem = (currentScene: SceneData): void => {
      const solarSystemScene = scenes.current[SceneType.SOLAR_SYSTEM]
      solarSystemScene.scene.visible = true
      scenes.current[SceneType.SPHERICAL].scene.visible = false
      scenes.current[SceneType.PLANE].scene.visible = false

      const earthPosition: THREE.Vector3 = getPlanetPosition(Body.Earth, dateValueToDate(selectedDate))

      // Set the camera's position, so it's looking at the Earth from the side.
      solarSystemScene.camera.position.set(earthPosition.x + 1000, earthPosition.y + 1000, earthPosition.z)
      solarSystemScene.controls.target.copy(earthPosition)

      console.log(
         'Geo-Three: Switched scene from sphere to solar system.',
         currentScene.controls,
         solarSystemScene.camera.position,
         solarSystemScene.controls.target,
      )

      // Change to spherical earth model
      activeSceneType.current = SceneType.SOLAR_SYSTEM
   }


   /**
    *
    */
   const animate = (): void => {
      if (renderer.current == null || scenes.current == null) return

      requestAnimationFrame(animate)

      const currentScene = scenes.current[activeSceneType.current]
      if (currentScene == null) return
      setDisplayedSceneData(currentScene)
      currentScene.controls.update()

      setDistanceToSphereSurface(currentScene.controls.getDistance())

      renderer.current.clear()
      renderer.current.render(currentScene.scene!, currentScene.camera!)
   }

   useEffect((): void => {
      // Get the current scene based on the active scene type.
      const currentScene = scenes.current[activeSceneType.current]

      // Ensure that the scene and controls are valid before calling handleLOD.
      if (currentScene == null || currentScene.controls == null) return

      // Call handleLOD with the updated currentScene.
      handleLOD(currentScene)
   }, [scenes, selectedAstre, activeSceneType, distanceToSphereSurface])

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
      // TODO : Refactor in threeRoot that will handle renderer.
   const cleanup = (): void => {
         window.removeEventListener('resize', handleResize)
         if (renderer.current && renderer.current.domElement.parentNode) {
            renderer.current.domElement.parentNode.removeChild(
               renderer.current.domElement,
            )
         }
      }

   /**
    * Async function to dynamically import CustomMapBoxProvider class
    */
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

      if (typeof window !== 'undefined' && planeMap == null) {
         // Import the CustomMapBoxProvider and initialize the map view.
         importCustomMapBoxProvider()
            .then((mapBoxProvider: CustomMapBoxProvider): void => {
               // Import MapView dynamically.
               // @ts-ignore
               import('geo-three').then(({ MapView }): void => {
                  const map = new MapView(MapView.PLANAR, mapBoxProvider)
                  planeScene.add(map)
                  map.updateMatrixWorld(true)
                  setPlaneMap(map)
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
               {/*<Heatmap />*/}
               <PlanetProvider>
                  <SolarSystemController />
                  <PlanetController />
                  <ClickHandler />
                  <VesselsController />
                  <AirportsController />
               </PlanetProvider>

               <OuterSpaceProvider>
                  <OuterSpaceController />
               </OuterSpaceProvider>

               <Atmosphere />
               <PlaneSky />

               <CountriesProvider>
                  <CountriesController />
               </CountriesProvider>

               {/*
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
