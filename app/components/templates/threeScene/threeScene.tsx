'use client'
import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js' // @ts-ignore
import { MapView, UnitsUtils } from 'geo-three' // @ts-ignore
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { CustomMapBoxProvider } from '@/app/lib/customMapBoxProvider'
import { useScenes } from '@/app/context/scenesContext'
import { PlanetProvider } from '@/app/context/planetContext'
import { Planet } from '@/app/components/atoms/three/planet/planet'
import { Atmosphere } from '@/app/components/atoms/three/atmosphere/atmosphere'
import { SceneType } from '@/app/components/enums/sceneType'
import { useMap } from '@/app/context/mapContext'
import { OuterSpace } from '@/app/components/atoms/three/outerSpace/outerSpace'
import {
   GLOBE_SCENE_NAME,
   PLANE_SCENE_NAME,
   RESIZE_LISTENER_STRING,
} from '@/app/constants/strings'
import { VisibleZoneProvider } from '@/app/components/atoms/three/visibleZone/model'
import { Vessels } from '@/app/components/atoms/three/vessels/vessels'
import { VisibleZone } from '@/app/components/atoms/three/visibleZone/controller'

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

   /**
    * Function to set up renderer, scene, and camera.
    */
   const setupRenderer = (): void => {
      if (!mountRef.current) return

      // Set renderer settings.
      renderer.current = new THREE.WebGLRenderer({
         alpha: true,
         antialias: true,
         logarithmicDepthBuffer: true,
         depth: true,
         premultipliedAlpha: true,
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
         1e18
      )

      // Set controls settings.
      globeControls.current = new MapControls(
         globeCamera.current,
         renderer.current!.domElement
      )
      globeControls.current!.enableDamping = true
      globeControls.current!.dampingFactor = 0.05
      globeControls.current!.rotateSpeed = 0.1
      globeControls.current!.zoomSpeed = 1
      globeControls.current!.enablePan = false
      globeControls.current!.autoRotate = false
      globeControls.current!.minDistance = UnitsUtils.EARTH_RADIUS + 3e4
      globeControls.current!.maxDistance = UnitsUtils.EARTH_RADIUS + 2e7
      globeControls.current!.mouseButtons = {
         LEFT: THREE.MOUSE.ROTATE,
         MIDDLE: THREE.MOUSE.DOLLY,
         RIGHT: THREE.MOUSE.PAN,
      }
      globeControls.current!.minPolarAngle = 0
      globeControls.current!.maxPolarAngle = Math.PI
      globeControls.current!.update()

      // Set initial camera position
      globeCamera.current.position.set(10e9, 8e9, UnitsUtils.EARTH_RADIUS + 1e9)

      return {
         type: SceneType.SPHERICAL,
         camera: globeCamera.current,
         controls: globeControls.current,
         scene: globeScene,
      }
   }

   const { setMap, setMapProvider } = useMap()

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
         1e12
      )

      const mapBoxProvider: CustomMapBoxProvider = new CustomMapBoxProvider(
         false
      )
      setMapProvider(mapBoxProvider)
      const map = new MapView(MapView.PLANAR, mapBoxProvider)
      map.cacheTiles = false
      planeScene.add(map)
      map.updateMatrixWorld(true)
      setMap(map)

      planeScene.add(new THREE.AmbientLight(0x777777, 1.2))

      planeControls.current = new MapControls(
         planeCamera.current,
         renderer.current!.domElement
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
      const toggleDistance = 1e6

      if (activeSceneType.current === SceneType.SPHERICAL) {
         // Get distance to the surface of earth.
         const distance =
            currentScene.controls.getDistance() - UnitsUtils.EARTH_RADIUS

         if (distance < toggleDistance) {
            // Set raycaster to the camera center.
            const pointer = new THREE.Vector2(0.0, 0.0)
            raycaster.setFromCamera(pointer, currentScene.camera)

            // Raycast from center of the camera to the sphere surface
            const intersects = raycaster.intersectObjects(
               currentScene.scene.children
            )

            if (intersects.length > 0) {
               const point = intersects[0].point

               // Get coordinates from sphere surface
               const planetPos = UnitsUtils.vectorToDatums(point)

               const planeScene = scenes.current[SceneType.PLANE]
               planeScene.scene.visible = true
               scenes.current[SceneType.SPHERICAL].scene.visible = false

               // Calculate plane coordinates.
               const worldCoords = UnitsUtils.datumsToSpherical(
                  planetPos.latitude,
                  planetPos.longitude
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
                  -worldCoords.y
               )

               console.log(
                  'Geo-Three: Switched scene from sphere to plane.',
                  point,
                  planetPos,
                  worldCoords
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
            const progress =
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
            const coords = UnitsUtils.sphericalToDatums(target.x, -target.z)

            // Get sphere surface point from coordinates
            const dir = UnitsUtils.datumsToVector(
               coords.latitude,
               coords.longitude
            )

            const sphereScene = scenes.current[SceneType.SPHERICAL]
            sphereScene.scene.visible = true
            scenes.current[SceneType.PLANE].scene.visible = false

            // Set camera position
            dir.multiplyScalar(UnitsUtils.EARTH_RADIUS + distance)
            sphereScene.camera.position.copy(dir)

            console.log(
               'Geo-Three: Switched scene from plane to sphere.',
               currentScene.controls,
               coords,
               dir
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
      renderer.current?.render(currentScene.scene!, currentScene.camera!)

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
      window.removeEventListener(RESIZE_LISTENER_STRING, handleResize)
      if (renderer.current && renderer.current.domElement.parentNode) {
         renderer.current.domElement.parentNode.removeChild(
            renderer.current.domElement
         )
      }
   }

   useEffect(() => {
      window.addEventListener(RESIZE_LISTENER_STRING, handleResize)

      // Set up renderer, scene, and camera.
      setupRenderer()
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

                  <VisibleZoneProvider>
                     <VisibleZone />
                     <Vessels />
                  </VisibleZoneProvider>
               </PlanetProvider>

               <OuterSpace />
               <Atmosphere />

               {/*
                     <Airports /> // TODO AIRPORT ONLY POUR LA PLANE SCENE ET UTILISER LA VISIBLE ZONE DE LA PLANE SCENE

// TODO FIX PLANES BEFORE UNCOMMENTING THIS
               <Planes
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

export function removeObject3D(
   object3D: THREE.Mesh,
   scene: THREE.Scene | null
): void {
   if (object3D.geometry) object3D.geometry.dispose()

   if (object3D.material) {
      if (object3D.material instanceof Array) {
         object3D.material.forEach((material: THREE.Material) =>
            material.dispose()
         )
      } else {
         object3D.material.dispose()
      }
   }
   object3D.removeFromParent()
   scene?.remove(object3D)
}
