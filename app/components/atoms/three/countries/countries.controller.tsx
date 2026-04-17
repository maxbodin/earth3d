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
   computeSceneTextScale,
   createCenteredTextGeometry,
   EARTH_SCENE_COUNTRY_TEXT_LOD_CONFIG,
   EARTH_SCENE_TEXT_BASE_SIZE,
   getObjectGeometryExtentFromOrigin,
} from '@/app/lib/threeText3d'
import {
   useCountriesTab,
} from '@/app/components/organisms/settingsDashboard/settingsDashboardTabs/countriesTab/countriesTab.model'
import { normalizeCountryName, } from '@/app/lib/countrySearch'

const geoJson = require('world-geojson')

const LOD_SCALE_THRESHOLD = 0.05
const GLOBE_COUNTRY_NAME_SURFACE_LIFT_BASE = EARTH_RADIUS / 260
const GLOBE_COUNTRY_NAME_SURFACE_LIFT_SCALE_FACTOR = EARTH_RADIUS / 1800
const GLOBE_COUNTRY_NAME_GEOMETRY_CLEARANCE_MULTIPLIER = 0.18
const COUNTRY_FRONTIER_API_BASE_PATH = '/api/country-frontier'

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

const countryCodeMap = countryCode as Record<string, string>

type CountryCoordinates = {
   country: string
   latitude: number
   longitude: number
}

type GeoJsonGeometry = {
   type: string
   coordinates?: any
   geometries?: GeoJsonGeometry[]
}

type GeoJsonFeature = {
   type: string
   properties: { [key: string]: any }
   geometry: GeoJsonGeometry
}

type GeoJsonCollection = {
   type: string
   features: GeoJsonFeature[]
}

export function CountriesController(): null {
   const { displayedSceneData } = useScenes()
   const { selectedCountry } = useCountries()
   const { frontiersActivated, namesActivated } = useCountriesTab()

   const namesGroup = useRef<THREE.Group>(new THREE.Group())
   const frontiersGroup = useRef<THREE.Group>(new THREE.Group())
   const selectedFrontiersGroup = useRef<THREE.Group>(new THREE.Group())
   const countryFrontiersCountRef = useRef<number>(0)
   const selectedCountryFrontiersCountRef = useRef<number>(0)
   const selectedCountryFrontierRequestRef = useRef<number>(0)
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

   const publishCountryFrontiersDebugSnapshot = (): void => {
      publishThreeSceneDebug({
         countryFrontiersCount: countryFrontiersCountRef.current,
         selectedCountryFrontiersCount: selectedCountryFrontiersCountRef.current,
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
      const selectedCountryNormalized = normalizeCountryName(selectedCountry)
      const shouldRenderOnlySelectedCountry =
         !namesActivated && selectedCountryNormalized.length > 0

      for (const country of countriesCoords.ref_country_codes) {
         if (
            shouldRenderOnlySelectedCountry
            && normalizeCountryName(country.country) !== selectedCountryNormalized
         ) {
            continue
         }

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

   const createGeoJsonCollection = (): GeoJsonCollection => {
      return {
         type: 'FeatureCollection',
         features: [],
      }
   }

   const forAllCountries = (): GeoJsonCollection => {
      const combinedGeoJson = createGeoJsonCollection()

      for (const [, value] of Object.entries(countryCodeMap)) {
         const data = geoJson.forCountry(value)
         if (data?.features) {
            combinedGeoJson.features.push(...data.features)
         }
      }

      return combinedGeoJson
   }

   const fetchSelectedCountryGeoJson = async (
      countryName: string,
   ): Promise<GeoJsonCollection> => {
      const normalizedCountryName = countryName.trim()
      if (normalizedCountryName.length === 0) {
         return createGeoJsonCollection()
      }

      try {
         const response = await fetch(
            `${COUNTRY_FRONTIER_API_BASE_PATH}/${encodeURIComponent(normalizedCountryName)}`,
            {
               method: 'GET',
               cache: 'no-store',
            },
         )

         if (!response.ok) {
            return createGeoJsonCollection()
         }

         const geoJsonCollection = (await response.json()) as GeoJsonCollection
         if (!Array.isArray(geoJsonCollection.features)) {
            return createGeoJsonCollection()
         }

         return {
            type: 'FeatureCollection',
            features: geoJsonCollection.features,
         }
      } catch {
         return createGeoJsonCollection()
      }
   }

   const collectCoordinateLines = (geometry: GeoJsonGeometry): number[][][] => {
      if (geometry.type === 'Polygon') {
         return (geometry.coordinates as number[][][]) ?? []
      }

      if (geometry.type === 'MultiPolygon') {
         return ((geometry.coordinates as number[][][][]) ?? []).flatMap(
            (polygon: number[][][]): number[][][] => polygon,
         )
      }

      if (geometry.type === 'LineString') {
         return [((geometry.coordinates as number[][]) ?? [])]
      }

      if (geometry.type === 'MultiLineString') {
         return (geometry.coordinates as number[][][]) ?? []
      }

      if (geometry.type === 'GeometryCollection') {
         return (geometry.geometries ?? []).flatMap((nestedGeometry: GeoJsonGeometry): number[][][] => {
            return collectCoordinateLines(nestedGeometry)
         })
      }

      return []
   }

   const appendFrontierMeshes = (
      features: GeoJsonFeature[],
      targetGroup: THREE.Group,
      material: MeshLineMaterial,
      isSpherical: boolean,
   ): number => {
      let createdMeshesCount = 0

      for (const feature of features) {
         const coordinateRings = collectCoordinateLines(feature.geometry)

         for (const ring of coordinateRings) {
            if (!Array.isArray(ring) || ring.length < 2) {
               continue
            }

            const points: THREE.Vector3[] = new Array(ring.length)

            for (let i = 0; i < ring.length; i++) {
               const [lon, lat] = ring[i]
               const worldPosition = ThreeGeoUnitsUtils.datumsToSpherical(lat, lon)
               points[i] = isSpherical
                  ? latLongToVector3(lat, lon)
                  : new THREE.Vector3(
                      worldPosition.x,
                      0,
                      -worldPosition.y,
                    )
            }

            const line = new MeshLineGeometry()
            line.setPoints(points, () => GLOBE_SCENE_COUNTRY_FRONTIERS_WIDTH)

            targetGroup.add(new THREE.Mesh(line, material))
            createdMeshesCount += 1
         }
      }

      return createdMeshesCount
   }

   const resolveFrontierMaterial = (
      isSpherical: boolean,
   ): MeshLineMaterial => {
      const material = isSpherical ? globeFrontierMaterial : planeFrontierMaterial

      if (isSpherical) {
         material.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)
      }

      return material
   }

   /**
    * Add all countries frontiers with optimized line caching.
    */
   const addFrontiers = (): void => {
      if (!displayedSceneData) return

      frontiersGroup.current.clear()

      const isSpherical = displayedSceneData.type === SceneType.SPHERICAL
      const material = resolveFrontierMaterial(isSpherical)

      const createdMeshesCount = appendFrontierMeshes(
         forAllCountries().features,
         frontiersGroup.current,
         material,
         isSpherical,
      )

      countryFrontiersCountRef.current = createdMeshesCount

      displayedSceneData.scene.add(frontiersGroup.current)
      publishCountryFrontiersDebugSnapshot()
   }

   /**
    * Add selected country frontiers as dedicated polyline overlays.
    */
   const addSelectedCountryFrontiers = async (): Promise<void> => {
      if (!displayedSceneData) return

      selectedFrontiersGroup.current.clear()

      const selectedCountryNormalized = normalizeCountryName(selectedCountry)
      if (selectedCountryNormalized.length === 0) {
         selectedCountryFrontiersCountRef.current = 0
         publishCountryFrontiersDebugSnapshot()
         return
      }

      const requestId = selectedCountryFrontierRequestRef.current + 1
      selectedCountryFrontierRequestRef.current = requestId

      const selectedCountryGeoJson = await fetchSelectedCountryGeoJson(
         selectedCountry,
      )

      if (
         selectedCountryFrontierRequestRef.current !== requestId
         || normalizeCountryName(selectedCountry) !== selectedCountryNormalized
         || displayedSceneData == null
      ) {
         return
      }

      selectedFrontiersGroup.current.clear()

      const isSpherical = displayedSceneData.type === SceneType.SPHERICAL
      const material = resolveFrontierMaterial(isSpherical)

      const createdMeshesCount = appendFrontierMeshes(
         selectedCountryGeoJson.features,
         selectedFrontiersGroup.current,
         material,
         isSpherical,
      )

      selectedCountryFrontiersCountRef.current = createdMeshesCount

      displayedSceneData.scene.add(selectedFrontiersGroup.current)
      publishCountryFrontiersDebugSnapshot()
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
            countryFrontiersCountRef.current = 0
            publishCountryFrontiersDebugSnapshot()
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

      const shouldDisplayFrontiers = frontiersActivated

      if (shouldDisplayFrontiers) {
         handleFrontiersLOD()
      } else {
         frontiersGroup.current.clear()
         countryFrontiersCountRef.current = 0
         publishCountryFrontiersDebugSnapshot()
      }

      const shouldDisplaySelectedCountryFrontiers =
         normalizeCountryName(selectedCountry).length > 0

      if (
         !shouldDisplaySelectedCountryFrontiers
         && selectedFrontiersGroup.current.children.length > 0
      ) {
         selectedFrontiersGroup.current.clear()
         selectedCountryFrontiersCountRef.current = 0
         publishCountryFrontiersDebugSnapshot()
      }

      const shouldDisplayNames =
         namesActivated || normalizeCountryName(selectedCountry).length > 0

      if (shouldDisplayNames) {
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
         countryFrontiersCountRef.current = 0
         publishCountryFrontiersDebugSnapshot()
      }

      const shouldDisplaySelectedCountryFrontiers =
         normalizeCountryName(selectedCountry).length > 0

      if (shouldDisplaySelectedCountryFrontiers) {
         void addSelectedCountryFrontiers()
      } else {
         selectedFrontiersGroup.current.clear()
         selectedCountryFrontiersCountRef.current = 0
         publishCountryFrontiersDebugSnapshot()
      }

      const shouldDisplayNames =
         namesActivated || normalizeCountryName(selectedCountry).length > 0

      if (shouldDisplayNames) {
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
            countryFrontiersCount: 0,
            selectedCountryFrontiersCount: 0,
         })

         countryFrontiersCountRef.current = 0
         selectedCountryFrontiersCountRef.current = 0
      }
   }, [
      displayedSceneData,
      displayedSceneData?.type,
      selectedCountry,
      frontiersActivated,
      namesActivated,
   ])

   return null
}
