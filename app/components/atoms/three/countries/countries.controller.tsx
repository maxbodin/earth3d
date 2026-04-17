import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useEffect, useRef } from 'react'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import {
   EARTH_RADIUS,
   GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   GLOBE_SCENE_COUNTRY_FRONTIERS_WIDTH,
   PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   PLANE_SCENE_COUNTRY_FRONTIERS_MAX_THRESHOLD_BEFORE_REMOVED,
} from '@/app/constants/numbers'
import countryCode from '../../../../data/countryCode.json'
import countriesCoords from '../../../../data/country-codes-lat-long-alpha3.json'
import { useCountries } from '@/app/components/atoms/three/countries/countries.model'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TEXT_FONT } from '@/app/constants/paths'
import { SceneType } from '@/app/enums/sceneType'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import { publishThreeSceneDebug } from '@/app/lib/threeSceneDebug'
import {
   createCenteredTextGeometry,
   computeSceneTextScale,
   EARTH_SCENE_COUNTRY_TEXT_LOD_CONFIG,
   EARTH_SCENE_TEXT_BASE_SIZE,
   getObjectGeometryExtentFromOrigin,
} from '@/app/lib/threeText3d'
import {
   useCountriesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/countriesTab/countriesTab.model'

const geoJson = require('world-geojson')

const LOD_SCALE_THRESHOLD = 0.05
const GLOBE_COUNTRY_NAME_SURFACE_LIFT_BASE = EARTH_RADIUS / 260
const GLOBE_COUNTRY_NAME_SURFACE_LIFT_SCALE_FACTOR = EARTH_RADIUS / 1800
const GLOBE_COUNTRY_NAME_GEOMETRY_CLEARANCE_MULTIPLIER = 0.18

// Shared materials for country names, created once.
const textMaterialFront = new THREE.MeshBasicMaterial({ color: '#ffffff' })
const textMaterialSide = new THREE.MeshBasicMaterial({ color: '#444444' })
const textMaterials = [textMaterialFront, textMaterialSide]

// Shared frontier materials with dynamic resolution.
const globeFrontierMaterial = new MeshLineMaterial({
   resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
   color: '#DC0073',
})

const planeFrontierMaterial = new MeshLineMaterial({
   resolution: new THREE.Vector2(1e6, 1e6),
   color: '#DC0073',
})

type CountryCoordinates = {
   country: string
   latitude: number
   longitude: number
}

export function CountriesController(): null {
   const { displayedSceneData } = useScenes()
   const { selectedCountry } = useCountries()
   const { frontiersActivated, namesActivated } = useCountriesTab()

   const namesGroup = useRef<THREE.Group>(new THREE.Group())
   const frontiersGroup = useRef<THREE.Group>(new THREE.Group())
   const font = useRef<Font>()
   const fontLoaded = useRef<boolean>(false)
   const textGeometryCacheRef = useRef<Map<string, TextGeometry>>(new Map())
   const animationFrameRef = useRef<number | null>(null)

   /**
    * Load font asynchronously and cache it.
    */
   const loadFont = async (): Promise<void> => {
      if (fontLoaded.current) return
      try {
         const loader = new FontLoader()
         font.current = await new Promise<Font>((resolve, reject) => {
            loader.load(TEXT_FONT, resolve, undefined, reject)
         })
         fontLoaded.current = true
      } catch (error) {
         console.error('Error loading font:', error)
      }
   }

   const publishCountryNamesDebugSnapshot = (): void => {
      const countryNamesCount = namesGroup.current.children.length
      const isSphericalScene = displayedSceneData?.type === SceneType.SPHERICAL

      let countryNamesMinDistanceFromCenter: number | null = null
      let countryNamesMinVisualSize: number | null = null

      if (isSphericalScene && countryNamesCount > 0) {
         countryNamesMinDistanceFromCenter = Math.min(
            ...namesGroup.current.children.map(countryName => countryName.position.length()),
         )
      }

      if (countryNamesCount > 0) {
         countryNamesMinVisualSize = Math.min(
            ...namesGroup.current.children.map(countryName => {
               return countryName.scale.x * EARTH_SCENE_TEXT_BASE_SIZE
            }),
         )
      }

      publishThreeSceneDebug({
         countryNamesCount,
         countryNamesMinDistanceFromCenter,
         countryNamesMinVisualSize,
      })
   }

   const updateCountryNameTransform = (
      nameMesh: THREE.Object3D,
      scale: number,
      sceneType: SceneType,
   ): void => {
      const countryData = nameMesh.userData as CountryCoordinates | undefined

      if (countryData == null) return

      if (sceneType === SceneType.SPHERICAL) {
         const basePosition = latLongToVector3(countryData.latitude, countryData.longitude)
         const normal = basePosition.clone().normalize()
         const geometryClearance = getObjectGeometryExtentFromOrigin(nameMesh)
         const surfaceLift = GLOBE_COUNTRY_NAME_SURFACE_LIFT_BASE
            + scale * GLOBE_COUNTRY_NAME_SURFACE_LIFT_SCALE_FACTOR
            + geometryClearance * scale * GLOBE_COUNTRY_NAME_GEOMETRY_CLEARANCE_MULTIPLIER

         nameMesh.position.copy(basePosition.add(normal.multiplyScalar(surfaceLift)))
      } else {
         const worldPosition = ThreeGeoUnitsUtils.datumsToSpherical(
            countryData.latitude,
            countryData.longitude,
         )

         nameMesh.position.set(worldPosition.x, 0, -worldPosition.y)
      }

      nameMesh.scale.setScalar(scale)
   }

   /**
    *
    */
   const addCountriesNames = async (): Promise<void> => {
      if (!displayedSceneData || !fontLoaded.current) {
         await loadFont()
      }

      if (!font.current || !displayedSceneData) return

      namesGroup.current.clear()

      const isSpherical = displayedSceneData.type === SceneType.SPHERICAL
      const nameSize = EARTH_SCENE_TEXT_BASE_SIZE
      const currentScale = isSpherical
         ? globeAdjustedScale.current
         : planeAdjustedScale.current

      for (const country of countriesCoords.ref_country_codes) {
         // Cache text geometry by country name.
         const cacheKey = `country_${country.country}_${nameSize}`
         let textGeo = textGeometryCacheRef.current.get(cacheKey)

         if (!textGeo) {
            textGeo = createCenteredTextGeometry({
               text: country.country,
               font: font.current,
               size: nameSize,
               depth: 50,
               curveSegments: 4,
               bevelEnabled: true,
               bevelThickness: EARTH_RADIUS / 1e3,
               bevelSize: EARTH_RADIUS / 1e4,
               bevelOffset: 0,
               bevelSegments: 4,
            })
            textGeometryCacheRef.current.set(cacheKey, textGeo)
         }

         const lat = country.latitude as number
         const lon = country.longitude as number

         const textMesh = new THREE.Mesh(textGeo, textMaterials)
         textMesh.name = `${country.country} Label`
         textMesh.userData = {
            country: country.country,
            latitude: lat,
            longitude: lon,
         } satisfies CountryCoordinates

         updateCountryNameTransform(textMesh, currentScale, displayedSceneData.type)

         namesGroup.current.add(textMesh)
      }

      displayedSceneData.scene.add(namesGroup.current)
      publishCountryNamesDebugSnapshot()
   }

   type GeoJsonFeature = {
      type: string
      properties: { [key: string]: any }
      geometry: {
         type: string
         coordinates: any[]
      }
   }

   const GEOJSON_BASE: { type: string; features: GeoJsonFeature[] } = {
      type: 'FeatureCollection',
      features: [],
   }

   const forAllCountries = (): { type: string; features: GeoJsonFeature[] } => {
      const combinedGeoJson = { ...GEOJSON_BASE }
      for (const [key, value] of Object.entries(countryCode)) {
         if (value === selectedCountry) continue

         const data = geoJson.forCountry(value)
         if (data?.features) {
            combinedGeoJson.features.push(...data.features)
         }
      }
      return combinedGeoJson
   }

   /**
    * Add country frontiers with optimized line caching.
    */
   const addFrontiers = (): void => {
      if (!displayedSceneData) return

      frontiersGroup.current.clear()

      const isSpherical = displayedSceneData.type === SceneType.SPHERICAL
      const material = isSpherical ? globeFrontierMaterial : planeFrontierMaterial

      // Update resolution for spherical scene.
      if (isSpherical) {
         material.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)
      }

      const features = forAllCountries().features

      for (const feature of features) {
         const coords = feature.geometry.coordinates[0]
         const points: THREE.Vector3[] = new Array(coords.length)

         for (let i = 0; i < coords.length; i++) {
            const [lon, lat] = coords[i]
            const worldPosition = ThreeGeoUnitsUtils.datumsToSpherical(lat, lon)
            points[i] = isSpherical
               ? latLongToVector3(lat, lon)
               : new THREE.Vector3(
                   worldPosition.x,
                   0,
                   -worldPosition.y
                 )
         }

         const line = new MeshLineGeometry()
         line.setPoints(points, () => GLOBE_SCENE_COUNTRY_FRONTIERS_WIDTH)

         const mesh = new THREE.Mesh(line, material)
         frontiersGroup.current.add(mesh)
      }

      displayedSceneData.scene.add(frontiersGroup.current)
   }

   const cameraDistanceToPlanetCenter = useRef<number>(0)
   const planeAdjustedScale = useRef<number>(PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE)
   const globeAdjustedScale = useRef<number>(GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE)

   /**
    * Animation loop for billboard effect on country names.
    */
   const animate = (): void => {
      animationFrameRef.current = requestAnimationFrame(animate)

      if (!namesGroup.current || !displayedSceneData?.camera) return

      for (const name of namesGroup.current.children) {
         name.lookAt(displayedSceneData.camera.position)
      }
   }

   /**
    * Handle frontiers LOD with threshold-based triggering.
    */
   const handleFrontiersLOD = (): void => {
      if (!frontiersGroup.current || !displayedSceneData) return

      if (displayedSceneData.type === SceneType.PLANE) {
         const isTooClose = cameraDistanceToPlanetCenter.current <
            PLANE_SCENE_COUNTRY_FRONTIERS_MAX_THRESHOLD_BEFORE_REMOVED

         if (isTooClose && frontiersGroup.current.children.length > 0) {
            frontiersGroup.current.clear()
         } else if (!isTooClose && frontiersGroup.current.children.length === 0) {
            addFrontiers()
         }
      }
   }

   /**
    * Handle names LOD with threshold-based scale updates.
    */
   const handleNamesLOD = (force = false): void => {
      if (!namesGroup.current || !displayedSceneData) return

            const isSpherical = displayedSceneData.type === SceneType.SPHERICAL
            const newScale = computeSceneTextScale(
          displayedSceneData.type,
          cameraDistanceToPlanetCenter.current,
          EARTH_SCENE_COUNTRY_TEXT_LOD_CONFIG,
            )

      const currentScaleRef = isSpherical ? globeAdjustedScale : planeAdjustedScale
      const scaleChange = Math.abs(newScale - currentScaleRef.current)

      // Only update if scale changed significantly.
      if (!force && scaleChange < LOD_SCALE_THRESHOLD) return

      currentScaleRef.current = newScale

      for (const name of namesGroup.current.children) {
         updateCountryNameTransform(name, newScale, displayedSceneData.type)
      }

      publishCountryNamesDebugSnapshot()
   }

   /**
    * Called on controls change with threshold-based LOD triggering.
    */
   const onControlsChange = (): void => {
      if (!displayedSceneData?.controls) return

      const newDistance = displayedSceneData.controls.getDistance()
      const distanceChange = Math.abs(newDistance - cameraDistanceToPlanetCenter.current)

      cameraDistanceToPlanetCenter.current = newDistance

      // Only process LOD changes if distance changed significantly.
      if (distanceChange < 1000) {
         handleNamesLOD()
         return
      }

      if (frontiersActivated) {
         handleFrontiersLOD()
      } else {
         frontiersGroup.current.clear()
      }

      if (namesActivated) {
         handleNamesLOD()
      } else {
         namesGroup.current.clear()
         publishCountryNamesDebugSnapshot()
      }
   }

   const raycaster: THREE.Raycaster = new THREE.Raycaster()
   const mouse: THREE.Vector2 = new THREE.Vector2()

   /**
    * Function to handle click events.
    * @param event
    */
   const onMouseClick = (event: { clientX: number; clientY: number }): void => {
      if (
         displayedSceneData == null ||
         displayedSceneData.camera == null ||
         !namesGroup.current
      )
         return

      // Use mouse position to create a raycast.
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, displayedSceneData.camera)

      const intersects = raycaster.intersectObjects(
         namesGroup.current!.children,
      )

      if (intersects.length > 0) {
         const selectedCountryObject: any = intersects[0].object
         const selectedCountryData: any = selectedCountryObject.userData
         // TODO console.log(selectedCountryData)
      }
   }

   useEffect(() => {
      if (!fontLoaded.current) {
         loadFont()
      }

      if (frontiersActivated) {
         addFrontiers()
      } else {
         frontiersGroup.current.clear()
      }

      if (namesActivated) {
         void addCountriesNames().then(() => {
            handleNamesLOD(true)
         })
      } else {
         namesGroup.current.clear()
         publishCountryNamesDebugSnapshot()
      }

      animate()
      window.addEventListener('click', onMouseClick)
      displayedSceneData?.controls?.addEventListener('change', onControlsChange)
      onControlsChange()

      return () => {
         window.removeEventListener('click', onMouseClick)
         displayedSceneData?.controls?.removeEventListener('change', onControlsChange)

         if (animationFrameRef.current != null) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
         }

         // Cleanup cached geometries.
         textGeometryCacheRef.current.forEach((geometry): void => {
            geometry.dispose()
         })
         textGeometryCacheRef.current.clear()

         publishThreeSceneDebug({
            countryNamesCount: 0,
            countryNamesMinDistanceFromCenter: null,
            countryNamesMinVisualSize: null,
         })
      }
   }, [
      displayedSceneData,
      displayedSceneData?.type,
      frontiersActivated,
      namesActivated,
   ])

   return null
}
