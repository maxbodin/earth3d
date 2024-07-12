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
import { useCountriesTab } from '@/app/components/organisms/dashboardTabs/countriesTab/countriesTab.model'
import { ThreeGeoUnitsUtils } from '@/app/lib/micUnitsUtils'

const geoJson = require('world-geojson')

export function CountriesController(): null {
   const { displayedSceneData } = useScenes()
   const { selectedCountry } = useCountries()

   const namesGroup = useRef<THREE.Group>(new THREE.Group())

   const font = useRef<Font>()

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

   const addCountriesNames = (): void => {
      if (displayedSceneData == null || font.current == null) return

      namesGroup.current.clear()

      countriesCoords.ref_country_codes.forEach(
         (country: {
            country: string
            alpha2: string
            alpha3: string
            numeric: number
            latitude: number
            longitude: number
         }): void => {
            if (font.current == null) return

            const textGeo: TextGeometry = new TextGeometry(country.country, {
               font: font.current,
               size: EARTH_RADIUS / 1e2,
               depth: 50,
               curveSegments: 4,
               bevelEnabled: true,
               bevelThickness: EARTH_RADIUS / 1e3,
               bevelSize: EARTH_RADIUS / 1e4,
               bevelOffset: 0,
               bevelSegments: 4,
            })

            textGeo.computeBoundingBox()
            textGeo.name = `${country.country} Geometry`
            textGeo.userData = country

            const textMesh = new THREE.Mesh(textGeo, materials)

            let position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

            if (displayedSceneData.type == SceneType.SPHERICAL) {
               position = latLongToVector3(
                  country.latitude as number,
                  country.longitude as number,
               )
            } else if (displayedSceneData.type == SceneType.PLANE) {
               const worldPos: THREE.Vector2 =
                  ThreeGeoUnitsUtils.datumsToSpherical(
                     country.latitude as number,
                     country.longitude as number,
                  )
               position = new THREE.Vector3(worldPos.x, 0, -worldPos.y)
            }

            textMesh.position.copy(position)
            textMesh.name = `${country.country} Mesh`
            textMesh.userData = country

            namesGroup.current.add(textMesh)
         },
      )

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

   function forAllCountries() {
      const combinedGeoJson = { ...GEOJSON_BASE }
      for (const [key, value] of Object.entries(countryCode)) {
         if (value == selectedCountry) continue

         const data = geoJson.forCountry(value)
         if (data && data.features) {
            combinedGeoJson.features.push(...data.features)
         }
      }

      return combinedGeoJson
   }

   const frontiersGroup = useRef<THREE.Group>(new THREE.Group())
   const addFrontiers = (): void => {
      if (displayedSceneData == null) return

      frontiersGroup.current.clear()

      forAllCountries().features.forEach(
         (
            value: {
               type: string
               properties: {}
               geometry: { coordinates: number[][][]; type: string }
            },
            index: number,
            array: {
               type: string
               properties: {}
               geometry: { coordinates: number[][][]; type: string }
            }[],
         ): void => {
            const points: THREE.Vector3[] = []

            value.geometry.coordinates[0].forEach(
               (value: number[], index: number, array: number[][]): void => {
                  let position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)

                  if (displayedSceneData.type == SceneType.SPHERICAL) {
                     position = latLongToVector3(
                        value[1] as number,
                        value[0] as number,
                     )
                  } else if (displayedSceneData.type == SceneType.PLANE) {
                     const worldPos: THREE.Vector2 =
                        ThreeGeoUnitsUtils.datumsToSpherical(
                           value[1] as number,
                           value[0] as number,
                        )
                     position = new THREE.Vector3(worldPos.x, 0, -worldPos.y)
                  }

                  points.push(position)
               },
            )

            let resolution: THREE.Vector2 =
               displayedSceneData.type == SceneType.SPHERICAL
                  ? new THREE.Vector2(window.innerWidth, window.innerHeight)
                  : new THREE.Vector2(1e6, 1e6)

            const line: MeshLineGeometry = new MeshLineGeometry()
            line.setPoints(
               points,
               (p: number): number => GLOBE_SCENE_COUNTRY_FRONTIERS_WIDTH,
            )
            const material: MeshLineMaterial = new MeshLineMaterial({
               resolution: resolution,
               color: '#DC0073',
            })
            const mesh: THREE.Mesh<
               MeshLineGeometry,
               MeshLineMaterial,
               THREE.Object3DEventMap
            > = new THREE.Mesh(line, material)

            frontiersGroup.current.add(mesh)
         },
      )

      displayedSceneData.scene.add(frontiersGroup.current)
   }

   const animate: () => void = (): void => {
      requestAnimationFrame(animate)
      if (namesGroup.current == null || displayedSceneData?.camera == null)
         return

      namesGroup.current.children.forEach(
         (
            value: THREE.Object3D<THREE.Object3DEventMap>,
            index: number,
            array: THREE.Object3D<THREE.Object3DEventMap>[],
         ): void => {
            value.lookAt(displayedSceneData.camera.position)
         },
      )
   }

   /**
    * Cleanup : remove events listeners.
    */
   const cleanup = (): void => {
      window.removeEventListener('click', onMouseClick)
      displayedSceneData?.controls?.removeEventListener(
         'change',
         onControlsChange,
      )
   }

   const cameraDistanceToPlanetCenter = useRef<number>(0)

   /**
    * Called each times controls change (Zoom, camera move, ...)
    */
   const onControlsChange = (): void => {
      if (displayedSceneData?.controls == null) return

      cameraDistanceToPlanetCenter.current =
         displayedSceneData.controls.getDistance()

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

   /**
    * For plane scene, remove frontiers if close from ground.
    */
   const handleFrontiersLOD = (): void => {
      if (frontiersGroup.current == null || displayedSceneData == null) {
         return
      }

      if (displayedSceneData.type == SceneType.PLANE) {
         if (
            cameraDistanceToPlanetCenter.current <
            PLANE_SCENE_COUNTRY_FRONTIERS_MAX_THRESHOLD_BEFORE_REMOVED
         ) {
            frontiersGroup.current.clear()
         } else if (frontiersGroup.current.children.length <= 0) {
            addFrontiers()
         }
      }
   }

   const planeAdjustedScale = useRef<number>(
      PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   )
   const globeAdjustedScale = useRef<number>(
      GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
   )

   /**
    * Function to handle resizing names accordingly with zoom.
    */
   const handleNamesLOD = (): void => {
      if (namesGroup.current == null || displayedSceneData == null) {
         return
      }

      if (displayedSceneData.type == SceneType.SPHERICAL) {
         globeAdjustedScale.current = clamp(
            cameraDistanceToPlanetCenter.current / 1e7 - 0.3,
            GLOBE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
            GLOBE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
         )
      } else if (displayedSceneData.type == SceneType.PLANE) {
         planeAdjustedScale.current = clamp(
            cameraDistanceToPlanetCenter.current / 1e5,
            PLANE_SCENE_COUNTRIES_NAMES_MIN_SCALE,
            PLANE_SCENE_COUNTRIES_NAMES_MAX_SCALE,
         )
      }

      namesGroup.current.children.forEach((name): void => {
         if (displayedSceneData.type == SceneType.SPHERICAL) {
            name.scale.set(
               globeAdjustedScale.current,
               globeAdjustedScale.current,
               globeAdjustedScale.current,
            )
         } else if (displayedSceneData.type == SceneType.PLANE) {
            name.scale.set(
               planeAdjustedScale.current,
               planeAdjustedScale.current,
               planeAdjustedScale.current,
            )
         }
      })
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
         console.log(selectedCountryData)
      }
   }

   const { frontiersActivated, namesActivated } = useCountriesTab()

   useEffect(() => {
      if (font.current == null) {
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

      // Add event listener to detect clicks on the window.
      window.addEventListener('click', onMouseClick)

      displayedSceneData?.controls?.addEventListener('change', onControlsChange)

      return cleanup
   }, [
      displayedSceneData,
      displayedSceneData?.type,
      font.current,
      frontiersActivated,
      namesActivated,
   ])

   return null
}
