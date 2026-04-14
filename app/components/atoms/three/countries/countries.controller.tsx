import { latLongToVector3 } from '@/app/helpers/latLongHelper'
import * as THREE from 'three'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import { useEffect, useRef } from 'react'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import {
   EARTH_RADIUS,
   GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
   GLOBE_SCENE_COUNTRY_FRONTIERS_WIDTH,
   PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
   PLANE_SCENE_COUNTRY_FRONTIERS_MAX_THRESHOLD_BEFORE_REMOVED,
} from '@/app/constants/numbers'
import countryCode from '../../../../data/countryCode.json'
import countriesCoords from '../../../../data/country-codes-lat-long-alpha3.json'
import { useCountries } from '@/app/components/atoms/three/countries/countries.model'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TEXT_FONT } from '@/app/constants/paths'
import { clamp } from '@/app/helpers/numberHelper'
import { SceneType } from '@/app/enums/sceneType'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'
import {
   useCountriesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/countriesTab/countriesTab.model'

const geoJson = require('world-geojson')

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

// Cache for frontier lines to avoid recreation.
const frontierCache: Map<string, MeshLineGeometry> = new Map()

export function CountriesController(): null {
   const { displayedSceneData } = useScenes()
   const { selectedCountry } = useCountries()

   const namesGroup = useRef<THREE.Group>(new THREE.Group())
   const frontiersGroup = useRef<THREE.Group>(new THREE.Group())
   const font = useRef<Font>()
   const fontLoaded = useRef<boolean>(false)

   // LOD threshold tracking.
   const lastScaleRef = useRef<number>(0)
   const LOD_SCALE_THRESHOLD = 0.05 // Minimum scale change to trigger update.

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

   const textGeometryCache: Map<string, TextGeometry> = new Map()

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
      const nameSize = EARTH_RADIUS / 1e2

      for (const country of countriesCoords.ref_country_codes) {
         // Cache text geometry by country name.
         const cacheKey = `country_${country.country}_${nameSize}`
         let textGeo = textGeometryCache.get(cacheKey)

         if (!textGeo) {
            textGeo = new TextGeometry(country.country, {
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
            textGeo.computeBoundingBox()
            textGeometryCache.set(cacheKey, textGeo)
         }

         const lat = country.latitude as number
         const lon = country.longitude as number
         const position = isSpherical
            ? latLongToVector3(lon, lat)
            : new THREE.Vector3(
                ThreeGeoUnitsUtils.datumsToSpherical(lon, lat).x,
                0,
                -ThreeGeoUnitsUtils.datumsToSpherical(lon, lat).y
              )

         const textMesh = new THREE.Mesh(textGeo, textMaterials)
         textMesh.position.copy(position)
         textMesh.name = `${country.country} Label`
         textMesh.userData = country

         namesGroup.current.add(textMesh)
      }

      displayedSceneData.scene.add(namesGroup.current)
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
            points[i] = isSpherical
               ? latLongToVector3(lon, lat)
               : new THREE.Vector3(
                   ThreeGeoUnitsUtils.datumsToSpherical(lon, lat).x,
                   0,
                   -ThreeGeoUnitsUtils.datumsToSpherical(lon, lat).y
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
      requestAnimationFrame(animate)

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
   const handleNamesLOD = (): void => {
      if (!namesGroup.current || !displayedSceneData) return

      const isSpherical = displayedSceneData.type === SceneType.SPHERICAL
      const newScale = isSpherical
         ? clamp(cameraDistanceToPlanetCenter.current / 1e7 - 0.3,
                 GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
                 GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE)
         : clamp(cameraDistanceToPlanetCenter.current / 1e5,
                 PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
                 PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE)

      const currentScaleRef = isSpherical ? globeAdjustedScale : planeAdjustedScale
      const scaleChange = Math.abs(newScale - currentScaleRef.current)

      // Only update if scale changed significantly.
      if (scaleChange < LOD_SCALE_THRESHOLD) return

      currentScaleRef.current = newScale

      for (const name of namesGroup.current.children) {
         name.scale.setScalar(newScale)
      }
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

   const { frontiersActivated, namesActivated } = useCountriesTab()

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
         addCountriesNames()
      } else {
         namesGroup.current.clear()
      }

      animate()
      window.addEventListener('click', onMouseClick)
      displayedSceneData?.controls?.addEventListener('change', onControlsChange)

      return () => {
         window.removeEventListener('click', onMouseClick)
         displayedSceneData?.controls?.removeEventListener('change', onControlsChange)

         // Cleanup cached geometries.
         textGeometryCache.forEach((geometry): void => {
            geometry.dispose()
         })
         textGeometryCache.clear()
      }
   }, [
      displayedSceneData,
      displayedSceneData?.type,
      frontiersActivated,
      namesActivated,
   ])

   return null
}
