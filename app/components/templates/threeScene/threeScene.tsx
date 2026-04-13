'use client'
import * as THREE from 'three'
import React, { useCallback, useEffect, useRef } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import { PlanetController } from '@/app/components/atoms/three/planet/planet.controller'
import { Atmosphere } from '@/app/components/atoms/three/atmosphere/atmosphere'
import { SceneType } from '@/app/enums/sceneType'
import { usePlaneMap } from '@/app/components/atoms/three/planeMapContext'
import { OuterSpaceController } from '@/app/components/atoms/three/outerSpace/outerSpace.controller'
import { GLOBE_SCENE_NAME, PLANE_SCENE_NAME, PLANET_NAME, SOLAR_SYSTEM_SCENE_NAME } from '@/app/constants/strings'
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

// TODO : we want lat and lon in search params.
// TODO : we want planar, sphere, and solar system.
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
   const displayedSceneTypeRef = useRef<SceneType | null>(null)
   const animationFrameIdRef = useRef<number | null>(null)

   const { globeScene, planeScene, solarSystemScene, setDisplayedSceneData } =
      useScenes()

   // Ref to track last scene type to avoid unnecessary React state updates.
   const lastSetSceneTypeRef = useRef<SceneType | null>(null)

   const { planeMap, setPlaneMap, setMapProvider } = usePlaneMap()

   const raycaster: THREE.Raycaster = new THREE.Raycaster()

   const activeSceneType = useRef<SceneType>(SceneType.SPHERICAL)

   const distanceToPlaneSurface = useRef<number | null>(null)
   const distanceToSphereSurface = useRef<number>(0)
   const isBootstrapFrameRef = useRef<boolean>(true)

   const { selectedAstre, selectedDate } = useAstresList()
   const { getPlanetPosition, dateValueToDate } = SolarSystemHelper()
   const { trueSize } = useSolarSystem()

   const sphereDistanceRef = useRef<number>(MIN_EARTH_DISTANCE_GLOBE_SCENE)
   const planeDistanceRef = useRef<number>(0)
   const solarDistanceRef = useRef<number>(0)
   const lastGlobeAltitudeRef = useRef<number>(MIN_EARTH_DISTANCE_GLOBE_SCENE - EARTH_RADIUS)
   const lastEarthGeoRef = useRef<Geolocation | null>(null)
   const transitionCooldownUntilRef = useRef<number>(0)
   const FRANCE_DEFAULT_GEO = useRef<Geolocation>(new Geolocation(46.2276, 2.2137))
   const debugLogTimeRef = useRef<number>(0)

   const PLANE_TO_SPHERE_EXIT_DISTANCE = SPHERE_TO_PLANE_TOGGLE_DISTANCE * 1.2
   const SCENE_SWITCH_COOLDOWN_MS = 220
   const MIN_REACHABLE_GLOBE_ALTITUDE = Math.max(
      MIN_EARTH_DISTANCE_GLOBE_SCENE - EARTH_RADIUS,
      0,
   )
   const PLANE_ENTER_DISTANCE_THRESHOLD = Math.max(
      SPHERE_TO_PLANE_TOGGLE_DISTANCE,
      MIN_REACHABLE_GLOBE_ALTITUDE + 100000,
   )
   const PLANE_EXIT_DISTANCE_THRESHOLD = Math.max(
      PLANE_TO_SPHERE_EXIT_DISTANCE,
      PLANE_ENTER_DISTANCE_THRESHOLD * 1.15,
   )
   const GLOBE_STARTUP_ALTITUDE = MIN_REACHABLE_GLOBE_ALTITUDE + 300000
   const GLOBE_STARTUP_DISTANCE_FROM_CENTER = EARTH_RADIUS + GLOBE_STARTUP_ALTITUDE

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
      renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.current.toneMapping = THREE.ACESFilmicToneMapping
      renderer.current.shadowMap.enabled = true
      renderer.current.shadowMap.type = THREE.PCFSoftShadowMap

      // Append renderer to dom.
      mountRef.current.appendChild(renderer.current.domElement)

      // List of scenes.
      scenes.current = [createGlobeScene(), createPlaneScene(), createSolarSystemScene()]

      // Start explicitly on spherical scene to avoid bootstrap LOD oscillations.
      activeSceneType.current = SceneType.SPHERICAL
      isBootstrapFrameRef.current = true
      sphereDistanceRef.current = GLOBE_STARTUP_ALTITUDE
      distanceToSphereSurface.current = GLOBE_STARTUP_DISTANCE_FROM_CENTER
      distanceToPlaneSurface.current = GLOBE_STARTUP_ALTITUDE
      lastGlobeAltitudeRef.current = GLOBE_STARTUP_ALTITUDE
      solarDistanceRef.current = Number.POSITIVE_INFINITY

      scenes.current[SceneType.SPHERICAL].scene.visible = true
      scenes.current[SceneType.PLANE].scene.visible = false
      scenes.current[SceneType.SOLAR_SYSTEM].scene.visible = false

      // Initialize shared scene data once to avoid null consumers at startup.
      syncDisplayedSceneData(SceneType.SPHERICAL)
   }

   /**
    * Sync displayed scene data only when active scene changes.
    * Uses ref tracking to avoid unnecessary React state updates.
    */
   const syncDisplayedSceneData = (sceneType: SceneType): void => {
      if (displayedSceneTypeRef.current === sceneType && lastSetSceneTypeRef.current === sceneType) return

      const sceneData = scenes.current[sceneType]
      if (sceneData == null) return

      displayedSceneTypeRef.current = sceneType
      lastSetSceneTypeRef.current = sceneType
      setDisplayedSceneData(sceneData)
   }

   /**
    * Returns the viewed surface point on the globe from current camera/target.
    * Falls back to camera radial direction if no exact intersection is found.
    */
   const getGlobeSurfacePointFromView = (currentScene: SceneData): THREE.Vector3 | null => {
      const origin = currentScene.camera.position.clone()
      const target = currentScene.controls.target.clone()
      const direction = target.sub(origin).normalize()

      const a = direction.dot(direction)
      const b = 2 * origin.dot(direction)
      const c = origin.dot(origin) - EARTH_RADIUS * EARTH_RADIUS
      const discriminant = b * b - 4 * a * c

      if (discriminant >= 0) {
         const sqrtDiscriminant = Math.sqrt(discriminant)
         const t1 = (-b - sqrtDiscriminant) / (2 * a)
         const t2 = (-b + sqrtDiscriminant) / (2 * a)
         const t = t1 > 0 ? t1 : t2 > 0 ? t2 : null

         if (t != null) {
            return origin.add(direction.multiplyScalar(t))
         }
      }

      if (origin.lengthSq() > 0) {
         return origin.normalize().multiplyScalar(EARTH_RADIUS)
      }

      return null
   }

   /**
    * Returns viewed Earth surface point while in solar scene (Earth-centered intersection).
    */
   const getSolarEarthSurfacePointFromView = (currentScene: SceneData): THREE.Vector3 | null => {
      const earthPosition = getPlanetPosition(Body.Earth, dateValueToDate(selectedDate))
      const origin = currentScene.camera.position.clone()
      const target = currentScene.controls.target.clone()
      const direction = target.sub(origin).normalize()
      const localOrigin = origin.sub(earthPosition)

      const a = direction.dot(direction)
      const b = 2 * localOrigin.dot(direction)
      const c = localOrigin.dot(localOrigin) - EARTH_RADIUS * EARTH_RADIUS
      const discriminant = b * b - 4 * a * c

      if (discriminant < 0) return null

      const sqrtDiscriminant = Math.sqrt(discriminant)
      const t1 = (-b - sqrtDiscriminant) / (2 * a)
      const t2 = (-b + sqrtDiscriminant) / (2 * a)
      const t = t1 > 0 ? t1 : t2 > 0 ? t2 : null

      if (t == null) return null

      return origin.add(direction.multiplyScalar(t))
   }

   const canSwitchScene = (): boolean => performance.now() >= transitionCooldownUntilRef.current

   const markSceneSwitch = (): void => {
      transitionCooldownUntilRef.current = performance.now() + SCENE_SWITCH_COOLDOWN_MS
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

      // Set initial camera position in a stable spherical range.
      globeCamera.current.position.set(0, 0, GLOBE_STARTUP_DISTANCE_FROM_CENTER)
      globeControls.current.target.set(0, 0, 0)
      globeControls.current!.update()

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
   const handleLOD = useCallback((currentScene: SceneData): void => {
      if (isBootstrapFrameRef.current) return
      if (!canSwitchScene()) return

      if (activeSceneType.current === SceneType.SPHERICAL) {
         if (distanceToPlaneSurface.current != null
            && distanceToPlaneSurface.current <= PLANE_ENTER_DISTANCE_THRESHOLD) {
            switchToPlaneMap(currentScene)
            return
         }

         if (distanceToSphereSurface.current > SOLAR_SYSTEM_TOGGLE_DISTANCE) {
            switchToSolarSystem(currentScene)
         }
         return
      }

      if (activeSceneType.current === SceneType.PLANE) {
         if (planeDistanceRef.current > PLANE_EXIT_DISTANCE_THRESHOLD) {
            switchToSpherical(currentScene)
         }
         return
      }

      if (activeSceneType.current === SceneType.SOLAR_SYSTEM
         && selectedAstre.body === Body.Earth
         && solarDistanceRef.current < SOLAR_SYSTEM_TO_GLOBE_TOGGLE_DISTANCE) {
         switchToSpherical(currentScene)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedAstre])

   /**
    * Switch to spherical Earth scene with proper lifecycle management.
    * - Disables plane/solar controls and objects.
    * - Restores globe camera position from stored state.
    * - Updates scene visibility and active type.
    */
   const switchToSpherical = (currentScene: SceneData): void => {
      let coords: Geolocation

      // Plane scene uses mercator coordinates in controls.target.
      if (currentScene.type === SceneType.PLANE) {
         const target = currentScene.controls.target
         coords = ThreeGeoUnitsUtils.sphericalToDatums(target.x, -target.z)
      } else {
         // Prefer captured Earth geolocation from solar view for exact continuity.
         if (lastEarthGeoRef.current != null) {
            coords = lastEarthGeoRef.current
         } else {
            const solarPoint = getSolarEarthSurfacePointFromView(currentScene)
            const earthPosition = getPlanetPosition(Body.Earth, dateValueToDate(selectedDate))
            coords = solarPoint != null
               ? ThreeGeoUnitsUtils.vectorToDatums(
                  solarPoint.clone().sub(earthPosition),
               )
               : FRANCE_DEFAULT_GEO.current
         }
      }

      const sphereScene = scenes.current[SceneType.SPHERICAL]

      // Disable other scenes.
      scenes.current[SceneType.PLANE].scene.visible = false
      scenes.current[SceneType.SOLAR_SYSTEM].scene.visible = false

      // Enable spherical scene.
      sphereScene.scene.visible = true

      // Keep a stable globe altitude when returning from plane/solar.
      const minGlobeAltitude = MIN_EARTH_DISTANCE_GLOBE_SCENE - EARTH_RADIUS
      const maxGlobeAltitude = MAX_EARTH_DISTANCE_GLOBE_SCENE - EARTH_RADIUS
      const restoredAltitude = THREE.MathUtils.clamp(
         currentScene.type === SceneType.SOLAR_SYSTEM
            ? lastGlobeAltitudeRef.current
            : planeDistanceRef.current,
         minGlobeAltitude,
         maxGlobeAltitude,
      )
      sphereDistanceRef.current = restoredAltitude

      // Set camera position from geolocation + restored altitude.
      const dir = ThreeGeoUnitsUtils.datumsToVector(coords.latitude, coords.longitude)
      dir.multiplyScalar(EARTH_RADIUS + restoredAltitude)
      sphereScene.camera.position.copy(dir)
      sphereScene.controls.target.set(0, 0, 0)
      sphereScene.controls.update()

      // Update active scene type.
      activeSceneType.current = SceneType.SPHERICAL
      syncDisplayedSceneData(SceneType.SPHERICAL)
      markSceneSwitch()

      // TODO : move in dedicated function.
      console.log(
         'Geo-Three: Switched scene to spherical.',
         coords.latitude.toFixed(4),
         coords.longitude.toFixed(4),
         `altitude: ${restoredAltitude.toFixed(0)}m`,
      )
   }

   /**
    * Switch to plane map scene with proper lifecycle management.
    * - Captures current view context for seamless transition.
    * - Disables spherical/solar scenes.
    * - Sets up plane camera and controls for 2D navigation.
    */
   const switchToPlaneMap = (currentScene: SceneData): void => {
      // Set raycaster to the camera center.
      const pointer = new THREE.Vector2(0.0, 0.0)
      raycaster.setFromCamera(pointer, currentScene.camera)

      // Raycast recursively to find closest intersection with any object
      const intersects = raycaster.intersectObjects(currentScene.scene.children, true)

      // Prefer planet hit, fallback to first intersection.
      let hitPoint: THREE.Vector3 | null = null

      if (intersects.length > 0) {
         // First try to find planet by name.
         const planetHit = intersects.find((intersection): boolean => {
            let node: THREE.Object3D | null = intersection.object
            while (node != null) {
               if (node.name === PLANET_NAME) return true
               node = node.parent
            }
            return false
         })

         // Use planet hit if found, otherwise use first intersection
         hitPoint = planetHit?.point ?? intersects[0].point
      }

      if (hitPoint == null) {
         // Geometry fallback when raycast misses (e.g. mesh not ready or naming mismatch).
         hitPoint = getGlobeSurfacePointFromView(currentScene)
      }

      if (hitPoint != null) {
         // Get coordinates from sphere surface
         const planetPos: Geolocation = ThreeGeoUnitsUtils.vectorToDatums(hitPoint)

         const planeScene = scenes.current[SceneType.PLANE]

         // Disable other scenes
         scenes.current[SceneType.SPHERICAL].scene.visible = false
         scenes.current[SceneType.SOLAR_SYSTEM].scene.visible = false

         // Enable plane scene.
         planeScene.scene.visible = true

         // Calculate plane coordinates.
         const worldCoords: THREE.Vector2 = ThreeGeoUnitsUtils.datumsToSpherical(
            planetPos.latitude,
            planetPos.longitude,
         )

         planeScene.controls.target.set(worldCoords.x, 0, -worldCoords.y)
         planeScene.camera.position.set(
            worldCoords.x,
            Math.max(distanceToPlaneSurface.current ?? 1, 1),
            -worldCoords.y,
         )
         planeScene.controls.update()

         // Update active scene type.
         activeSceneType.current = SceneType.PLANE
         syncDisplayedSceneData(SceneType.PLANE)
         markSceneSwitch()

         // TODO : move in dedicated function.
         console.log(
            'Geo-Three: Switched scene to plane.',
            `lat: ${planetPos.latitude.toFixed(4)}`,
            `lon: ${planetPos.longitude.toFixed(4)}`,
         )
      } else {
         console.warn('Geo-Three: No raycast intersection found for plane transition')
      }
   }

   /**
    * Switch to solar system scene with proper lifecycle management.
    * - Captures current Earth view context for return transition
    * - Disables globe/plane scenes
    * - Sets up orbital camera around selected celestial body
    * - Applies safe distance to prevent immediate scene bounce
    */
   const switchToSolarSystem = (currentScene: SceneData): void => {
      const solarSystemScene = scenes.current[SceneType.SOLAR_SYSTEM]

      // Disable other scenes
      scenes.current[SceneType.SPHERICAL].scene.visible = false
      scenes.current[SceneType.PLANE].scene.visible = false

      // Enable solar system scene
      solarSystemScene.scene.visible = true

      const earthPosition = getPlanetPosition(Body.Earth, dateValueToDate(selectedDate))

      // Capture globe view context before leaving globe scene.
      const globePoint = getGlobeSurfacePointFromView(currentScene)
      if (globePoint != null) {
         lastEarthGeoRef.current = ThreeGeoUnitsUtils.vectorToDatums(globePoint)
      }
      lastGlobeAltitudeRef.current = sphereDistanceRef.current

      // Keep a safe orbital distance to avoid immediate solar->sphere bounce.
      const relativeDirection = currentScene.camera.position.clone().normalize()
      if (relativeDirection.lengthSq() === 0) {
         relativeDirection.set(0, 1, 0)
      }
      const safeSolarDistance = Math.max(
         currentScene.camera.position.length(),
         SOLAR_SYSTEM_TO_GLOBE_TOGGLE_DISTANCE * 1.05,
      )
      solarDistanceRef.current = safeSolarDistance

      solarSystemScene.camera.position.copy(
         earthPosition.clone().add(relativeDirection.multiplyScalar(safeSolarDistance)),
      )
      solarSystemScene.controls.target.copy(earthPosition)
      solarSystemScene.controls.update()

      // Update active scene type
      activeSceneType.current = SceneType.SOLAR_SYSTEM
      syncDisplayedSceneData(SceneType.SOLAR_SYSTEM)
      markSceneSwitch()

      console.log(
         'Geo-Three: Switched scene to solar system.',
         `distance: ${safeSolarDistance.toFixed(0)}m`,
      )
   }


   /**
    *
    */
   const animate = (): void => {
      if (renderer.current == null || scenes.current == null) return

      animationFrameIdRef.current = requestAnimationFrame(animate)

      const sceneBeforeLOD = scenes.current[activeSceneType.current]
      if (sceneBeforeLOD == null) return

      sceneBeforeLOD.controls.update()

      const controlsDistance = sceneBeforeLOD.controls.getDistance()

      if (activeSceneType.current === SceneType.SPHERICAL) {
         // Keep both absolute distance and altitude to avoid threshold unit mismatch.
         const cameraDistanceFromEarthCenter = sceneBeforeLOD.camera.position.length()
         
         // In MapControls, panning changes the target, so 'controlsDistance' represents
         // the physical scroll/zoom radius from the user's looking point, which feels
         // much more natural for triggering LOD transitions.
         const globeAltitudeFromControls = Math.max(
            controlsDistance - EARTH_RADIUS,
            0,
         )

         sphereDistanceRef.current = globeAltitudeFromControls
         distanceToSphereSurface.current = cameraDistanceFromEarthCenter
         distanceToPlaneSurface.current = globeAltitudeFromControls
         lastGlobeAltitudeRef.current = globeAltitudeFromControls
      } else if (activeSceneType.current === SceneType.PLANE) {
         planeDistanceRef.current = controlsDistance
         distanceToPlaneSurface.current = controlsDistance
      } else if (activeSceneType.current === SceneType.SOLAR_SYSTEM) {
         const earthPosition = getPlanetPosition(Body.Earth, dateValueToDate(selectedDate))
         solarDistanceRef.current = sceneBeforeLOD.camera.position.distanceTo(earthPosition)
      }

      handleLOD(sceneBeforeLOD)

      // Debug logging to track distances and thresholds.
      const now = performance.now()
      if (now - debugLogTimeRef.current > 500) {
         if (activeSceneType.current === SceneType.SPHERICAL) {
            console.debug(
               `[ThreeScene|LOD|SPHERICAL] distanceToPlaneSurface: ${distanceToPlaneSurface.current?.toFixed(0)}, ` +
               `ENTER_PLANE_THRESHOLD: ${PLANE_ENTER_DISTANCE_THRESHOLD.toFixed(0)} | ` +
               `distanceToSphereSurface: ${distanceToSphereSurface.current.toFixed(0)}, ` +
               `ENTER_SOLAR_THRESHOLD: ${SOLAR_SYSTEM_TOGGLE_DISTANCE.toFixed(0)}`
            )
         } else if (activeSceneType.current === SceneType.PLANE) {
            console.debug(
               `[ThreeScene|LOD|PLANE] planeDistance: ${planeDistanceRef.current.toFixed(0)}, ` +
               `EXIT_PLANE_THRESHOLD: ${PLANE_EXIT_DISTANCE_THRESHOLD.toFixed(0)}`
            )
         } else if (activeSceneType.current === SceneType.SOLAR_SYSTEM) {
            console.debug(
               `[ThreeScene|LOD|SOLAR] solarDistance: ${solarDistanceRef.current.toFixed(0)}, ` +
               `EXIT_SOLAR_THRESHOLD: ${SOLAR_SYSTEM_TO_GLOBE_TOGGLE_DISTANCE.toFixed(0)}`
            )
         }
         debugLogTimeRef.current = now
      }

      const sceneToRender = scenes.current[activeSceneType.current] ?? sceneBeforeLOD
      renderer.current.clear()
      renderer.current.render(sceneToRender.scene!, sceneToRender.camera!)

      if (isBootstrapFrameRef.current) {
         isBootstrapFrameRef.current = false
         return
      }
   }

   useEffect((): void => {
      // Get the current scene based on the active scene type.
      const currentScene = scenes.current[activeSceneType.current]

      // Ensure that the scene and controls are valid before calling handleLOD.
      if (currentScene == null || currentScene.controls == null) return

      // Call handleLOD with the updated currentScene.
      handleLOD(currentScene)
   }, [selectedAstre, handleLOD])

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
   const cleanup = (): void => {
         window.removeEventListener('resize', handleResize)
         if (animationFrameIdRef.current != null) {
            cancelAnimationFrame(animationFrameIdRef.current)
            animationFrameIdRef.current = null
         }

         globeControls.current?.dispose()
         planeControls.current?.dispose()
         solarSystemControls.current?.dispose()

         if (renderer.current) {
            renderer.current.dispose()
            renderer.current.forceContextLoss()
         }

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
            <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex">
               <div
                  ref={mountRef}
                  style={{
                     position: 'fixed',
                     inset: 0,
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
