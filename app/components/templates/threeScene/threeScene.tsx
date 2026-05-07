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
import { DEFAULT_MAP_STYLE_ID } from '@/app/constants/mapStyles'
import { PlanesController } from '@/app/components/atoms/three/planes/planes.controller'
import { PlaneDataFetch } from '@/app/components/atoms/dataFetch/planeDataFetch/planeDataFetch'
import { EarthquakesController } from '@/app/components/atoms/three/earthquakes/earthquakes.controller'
import { EarthquakeDataFetch } from '@/app/components/atoms/dataFetch/earthquakeDataFetch/earthquakeDataFetch'
import { EarthquakeHeatmap } from '@/app/components/atoms/three/earthquakes/earthquakeHeatmap'
import { LOADING_STEPS, LoadingTracker } from '@/app/lib/loadingTracker'
import { readModeFromCurrentUrl, updateModeInCurrentUrl } from '@/app/lib/modeSearchParams'
import { DebugTilesOverlay } from '@/app/components/atoms/three/debugTilesOverlay'
import { TectonicPlatesOverlay } from '@/app/components/atoms/three/tectonicPlatesOverlay'

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

   // Tracks the previous map style so we only rebuild Geo-Three map roots on
   // real style changes, not on the initial mount.
   const prevMapStyleRef = useRef<string | null>(null)

   const { planeMap, setPlaneMap, setMapProvider, mapProvider, mapStyle } =
      usePlaneMap()
   const planeMapRef = useRef<any>(null)

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
   const RANDOM_DEFAULT_GEO = useRef<Geolocation>(new Geolocation(
      Math.random() * 180 - 90,
      Math.random() * 360 - 180,
   ))
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
   const GLOBE_STARTUP_ALTITUDE = Math.max(
      MIN_REACHABLE_GLOBE_ALTITUDE + 300000,
      PLANE_ENTER_DISTANCE_THRESHOLD * 10,
   )
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

      // Determine initial scene from URL search params, default to spherical.
      const urlMode = readModeFromCurrentUrl()
      const initialScene = urlMode ?? SceneType.SPHERICAL

      activeSceneType.current = initialScene
      isBootstrapFrameRef.current = true
      solarDistanceRef.current = Number.POSITIVE_INFINITY

      scenes.current[SceneType.SPHERICAL].scene.visible = initialScene === SceneType.SPHERICAL
      scenes.current[SceneType.PLANE].scene.visible = initialScene === SceneType.PLANE
      scenes.current[SceneType.SOLAR_SYSTEM].scene.visible = initialScene === SceneType.SOLAR_SYSTEM

      if (initialScene === SceneType.SPHERICAL) {
         sphereDistanceRef.current = GLOBE_STARTUP_ALTITUDE
         distanceToSphereSurface.current = GLOBE_STARTUP_DISTANCE_FROM_CENTER
         distanceToPlaneSurface.current = GLOBE_STARTUP_ALTITUDE
         lastGlobeAltitudeRef.current = GLOBE_STARTUP_ALTITUDE
      } else if (initialScene === SceneType.PLANE) {
         // TODO : Refactor in constants.
         const planeStartAltitude = 1e6
         planeDistanceRef.current = planeStartAltitude
         distanceToPlaneSurface.current = planeStartAltitude
         const planeSceneData = scenes.current[SceneType.PLANE]
         const worldCoords = ThreeGeoUnitsUtils.datumsToSpherical(
            RANDOM_DEFAULT_GEO.current.latitude,
            RANDOM_DEFAULT_GEO.current.longitude,
         )
         planeSceneData.controls.target.set(worldCoords.x, 0, -worldCoords.y)
         planeSceneData.camera.position.set(worldCoords.x, planeStartAltitude, -worldCoords.y)
         planeSceneData.controls.update()
      } else if (initialScene === SceneType.SOLAR_SYSTEM) {
         sphereDistanceRef.current = GLOBE_STARTUP_ALTITUDE
         lastGlobeAltitudeRef.current = GLOBE_STARTUP_ALTITUDE

         // TODO : Refactor in constants.
         const safeSolarDistance = SOLAR_SYSTEM_TO_GLOBE_TOGGLE_DISTANCE * 3e3
         solarDistanceRef.current = safeSolarDistance
         const solarSceneData = scenes.current[SceneType.SOLAR_SYSTEM]
         const earthPos = getPlanetPosition(Body.Earth, dateValueToDate(selectedDate))
         const direction = new THREE.Vector3(1, 1, 0).normalize()
         solarSceneData.camera.position.copy(
             earthPos.clone().add(direction.multiplyScalar(safeSolarDistance)),
         )
         solarSceneData.controls.target.copy(earthPos)
         solarSceneData.controls.update()
      }

      // Initialize shared scene data once to avoid null consumers at startup.
      syncDisplayedSceneData(initialScene)
      LoadingTracker.completeStep(LOADING_STEPS.RENDERER_SETUP.id)

      // PlanetController only builds the globe mesh when the active scene is
      // SPHERICAL, so its loading steps (textures + mesh) would never complete
      // when starting directly in another mode. Mark them done immediately so
      // the loading overlay can finish.
      if (initialScene !== SceneType.SPHERICAL) {
         LoadingTracker.completeStep(LOADING_STEPS.EARTH_TEXTURE.id)
         LoadingTracker.completeStep(LOADING_STEPS.DISPLACEMENT_MAP.id)
         LoadingTracker.completeStep(LOADING_STEPS.PLANET_MESH.id)
      }
   }

   /**
    * Sync displayed scene data only when active scene changes.
    * Uses ref tracking to avoid unnecessary React state updates.
    * Also updates the URL search param to reflect the current mode.
    */
   const syncDisplayedSceneData = (sceneType: SceneType): void => {
      if (displayedSceneTypeRef.current === sceneType && lastSetSceneTypeRef.current === sceneType) return

      const sceneData = scenes.current[sceneType]
      if (sceneData == null) return

      displayedSceneTypeRef.current = sceneType
      lastSetSceneTypeRef.current = sceneType
      setDisplayedSceneData(sceneData)
      updateModeInCurrentUrl(sceneType)
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
      const direction = currentScene.controls.target.clone().sub(origin).normalize()
      const localOrigin = origin.clone().sub(earthPosition)

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

      LoadingTracker.completeStep(LOADING_STEPS.GLOBE_SCENE.id)
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

      LoadingTracker.completeStep(LOADING_STEPS.PLANE_SCENE.id)
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

      LoadingTracker.completeStep(LOADING_STEPS.SOLAR_SCENE.id)
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
         // Use the current camera-to-Earth direction in solar view for exact continuity.
         const earthPosition = getPlanetPosition(Body.Earth, dateValueToDate(selectedDate))
         const solarPoint = getSolarEarthSurfacePointFromView(currentScene)

         if (solarPoint != null) {
            coords = ThreeGeoUnitsUtils.vectorToDatums(
               solarPoint.clone().sub(earthPosition),
            )
         } else {
            // Fallback: derive direction from Earth center toward camera.
            const earthToCamera = currentScene.camera.position.clone().sub(earthPosition).normalize()
            coords = earthToCamera.lengthSq() > 0
               ? ThreeGeoUnitsUtils.vectorToDatums(earthToCamera)
               : RANDOM_DEFAULT_GEO.current
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
      mapBoxProvider.mapStyle = mapStyle ?? DEFAULT_MAP_STYLE_ID


      setMapProvider(mapBoxProvider)

      return mapBoxProvider
   }

   /**
    * Rebuilds the planar root when style changes to avoid Geo-Three's
    * child-load counter overflow that can happen with clear() on populated trees.
    */
   const refreshPlaneMapForStyle = (mapView: any): void => {
      if (typeof mapView?.setRoot !== 'function') return

      const planarRootMode = mapView.constructor?.PLANAR ?? 200
      mapView.setRoot(planarRootMode)

      if (typeof mapView.preSubdivide === 'function') {
         mapView.preSubdivide()
      }

      mapView.updateMatrixWorld(true)
   }

   useEffect(() => {
      planeMapRef.current = planeMap
   }, [planeMap])

   useEffect(() => {
      if (mapProvider == null || mapStyle == null) return

      const isStyleChange =
         prevMapStyleRef.current !== null && prevMapStyleRef.current !== mapStyle

      mapProvider.mapStyle = mapStyle
      prevMapStyleRef.current = mapStyle

      if (!isStyleChange || planeMap == null) return

      refreshPlaneMapForStyle(planeMap)
   }, [mapProvider, mapStyle, planeMap])

   useEffect(() => {
      let isDisposed = false

      window.addEventListener('resize', handleResize)

      // Set up renderer, scene, and camera.
      setupRenderer()

      const initializePlaneMap = async (): Promise<void> => {
         if (typeof window === 'undefined' || planeMapRef.current != null) return

         try {
            const mapBoxProvider = await importCustomMapBoxProvider()
            if (isDisposed || planeMapRef.current != null) return

            // Import MapView dynamically.
            // @ts-ignore
            const { MapView } = await import('geo-three')
            if (isDisposed || planeMapRef.current != null) return

            const map = new MapView(MapView.PLANAR, mapBoxProvider)
            planeScene.add(map)
            map.updateMatrixWorld(true)

            planeMapRef.current = map
            setPlaneMap(map)
            LoadingTracker.completeStep(LOADING_STEPS.PLANE_MAP.id)
         } catch (error) {
            if (isDisposed) return

            console.error(
               'Error importing or initializing map components:',
               error,
            )
         }
      }

      initializePlaneMap()

      if (!mountRef.current) return

      animate()

      return (): void => {
         isDisposed = true

         const mapToRemove = planeMapRef.current
         if (mapToRemove != null) {
            planeScene.remove(mapToRemove)
            planeMapRef.current = null
            setPlaneMap((current: any) => (current === mapToRemove ? null : current))
         }

         cleanup()
      }
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
                  <PlanesController />
                  <EarthquakesController />
                  <EarthquakeHeatmap />
                  <TectonicPlatesOverlay />
                  <DebugTilesOverlay />
               </PlanetProvider>

               <OuterSpaceProvider>
                  <OuterSpaceController />
               </OuterSpaceProvider>

               <PlaneDataFetch />
               <EarthquakeDataFetch />

               <Atmosphere />
               <PlaneSky />

               <CountriesController />
            </div>
         </div>
      </>
   )
}
