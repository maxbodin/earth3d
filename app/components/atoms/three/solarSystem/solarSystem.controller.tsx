'use client'
import { clearGroup, disposeMaterial } from '@/app/helpers/threeHelper'
import { useEffect, useRef } from 'react'
import { useScenes } from '@/app/components/templates/scenes/scenes.model'
import * as THREE from 'three'
import { SceneType } from '@/app/enums/sceneType'
import { astres } from '@/app/data/astres'
import { Body } from 'astronomy-engine'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import {
   SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MAX_SCALE,
   SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MIN_SCALE,
   SUN_RADIUS,
} from '@/app/constants/numbers'
import { TEXT_FONT } from '@/app/constants/paths'
import { useSolarSystem } from '@/app/components/atoms/three/solarSystem/solarSystem.model'
import { Astre } from '@/app/types/astre'
import { clamp } from '@/lib/clamp'
import { useAstresList } from '@/app/components/organisms/astresList/astresList.model'
import { SolarSystemHelper } from '@/app/components/atoms/three/solarSystem/solarSystem.helper'
import { SOLAR_SYSTEM_FRAGMENT_SHADER, SOLAR_SYSTEM_VERTEX_SHADER } from '@/app/lib/shaders'
import { AssetManager } from '@/app/lib/assetManager'
import { buildTrajectoryPoints } from '@/app/components/atoms/three/solarSystem/solarSystemTrajectories.helper'

// Shared materials for text labels.
const textMaterialFront = new THREE.MeshBasicMaterial({ color: '#ffffff' })
const textMaterialSide = new THREE.MeshBasicMaterial({ color: '#444444' })
const textMaterials = [textMaterialFront, textMaterialSide]

// Shared shader material cache for celestial bodies.
const solarSystemMaterials: Map<string, THREE.ShaderMaterial> = new Map()

export function SolarSystemController(): null {
   const { displayedSceneData, solarSystemScene } = useScenes()
   const { selectedAstre, selectedDate } = useAstresList()
   const { getPlanetPosition, dateValueToDate } = SolarSystemHelper()

   const namesGroup = useRef<THREE.Group>(new THREE.Group())
   const astresMeshesGroup = useRef<THREE.Group>(new THREE.Group())
   const trajectoriesGroup = useRef<THREE.Group>(new THREE.Group())

   const font = useRef<Font>()
   const fontLoaded = useRef<boolean>(false)

   const { trueSize, showTrajectories, trajectoryLineWidth } = useSolarSystem()

   /**
    * Load font once and cache it.
    */
   const loadFont = async (): Promise<void> => {
      if (fontLoaded.current) return
      try {
         font.current = await AssetManager.loadFont(TEXT_FONT)
         fontLoaded.current = true
      } catch (error) {
         console.error('Error loading font:', error)
      }
   }

   /**
    * Get or create a cached shader material for a celestial body.
    */
   const getCelestialMaterial = (astre: Astre): THREE.ShaderMaterial => {
      const cacheKey = `solar_${astre.name}`
      let material = solarSystemMaterials.get(cacheKey)

      if (!material) {
         material = new THREE.ShaderMaterial({
            depthWrite: true,
            depthTest: true,
            transparent: false,
            blending: THREE.AdditiveBlending,
            vertexShader: SOLAR_SYSTEM_VERTEX_SHADER,
            fragmentShader: SOLAR_SYSTEM_FRAGMENT_SHADER,
            uniforms: {
               globeTexture: { value: astre.texture },
               atmosphereColor: { value: new THREE.Color(astre.color) },
            },
         })
         solarSystemMaterials.set(cacheKey, material)
      } else {
         // Update uniforms if needed.
         material.uniforms.globeTexture.value = astre.texture
         material.uniforms.atmosphereColor.value = new THREE.Color(astre.color)
      }

      return material
   }

   /**
    * Create or reuse sphere geometry based on radius.
    */
   const geometryCache: Map<number, THREE.SphereGeometry> = useRef(new Map()).current

   const getCelestialGeometry = (radius: number, segments: number = 32): THREE.SphereGeometry => {
      // Use radius and segments as cache key
      const cacheKey = radius * 1000 + segments
      let geometry = geometryCache.get(cacheKey)

      if (!geometry) {
         geometry = new THREE.SphereGeometry(radius, segments, segments)
         geometryCache.set(cacheKey, geometry)
      }

      return geometry
   }

   /**
    * Create solar system meshes with geometry and material reuse.
    */
   const createSolarSystemMeshes = (): void => {
      if (
         displayedSceneData?.scene == null ||
         displayedSceneData.type !== SceneType.SOLAR_SYSTEM
      ) {
         return
      }

      clearGroup(astresMeshesGroup.current)

      for (const astre of astres) {
         // Hide Moon if not in true size.
         if (!trueSize && astre.body === Body.Moon) continue

         const astreRadius = trueSize ? astre.radius : SUN_RADIUS

         const geometry = getCelestialGeometry(astreRadius)
         const material = getCelestialMaterial(astre)

         const astreMesh = new THREE.Mesh(geometry, material)
         astreMesh.name = astre.name
         astre.astreMesh = astreMesh

         astresMeshesGroup.current.add(astreMesh)
      }

      displayedSceneData.scene.add(astresMeshesGroup.current)
   }

   /**
    * Function to animate trajectories between two dates.
    * @param startDate
    * @param endDate
    * @param duration
    */
      // TODO : Use and maybe fix so that it gets positions for each day between the two dates.
   const animatePlanetTrajectories = (startDate: Date, endDate: Date, duration: number): void => {
         // Clear any ongoing animations.
         gsap.killTweensOf(astres)

         // Loop through each planet and animate its trajectory
         astres.forEach((astre: Astre): void => {
            const startPosition = getPlanetPosition(astre.body, startDate)
            const endPosition = getPlanetPosition(astre.body, endDate)

            if (astre.astreMesh) {
               // Use GSAP to animate the position from start to end
               gsap.to(astre.astreMesh.position, {
                  x: endPosition.x,
                  y: endPosition.y,
                  z: endPosition.z,
                  duration: duration,
                  ease: 'power1.inOut',
                  onUpdate: (): void => {
                     // Optionally: Update any labels, names, or other 3D elements
                  },
               })
            }
         })
      }

   /**
    *
    */
   const createSolarSystemTrajectories = (): void => {
      clearGroup(trajectoriesGroup.current)

      const referenceDate = dateValueToDate(selectedDate)

      for (const astre of astres) {
         // Keep trajectory rendering focused on orbiting bodies.
         // No trajectory for sun.
         if (astre.body === Body.Sun) continue

         const points = buildTrajectoryPoints({
            body: astre.body,
            centerDate: referenceDate,
            getPlanetPosition,
            anchorBody: astre.body === Body.Moon ? Body.Earth : undefined,
         })

         if (points.length < 3) continue

         const linePositions: number[] = []
         points.forEach((point: THREE.Vector3): void => {
            linePositions.push(point.x, point.y, point.z)
         })

         // Close the trajectory loop.
         linePositions.push(points[0].x, points[0].y, points[0].z)

         const geometry = new LineGeometry()
         geometry.setPositions(linePositions)

         const material = new LineMaterial({
            color: astre.color,
            transparent: true,
            opacity: 0.35,
            linewidth: trajectoryLineWidth,
            worldUnits: false,
            depthWrite: false,
            depthTest: true,
         })

         if (typeof window !== 'undefined') {
            material.resolution.set(window.innerWidth, window.innerHeight)
         }

         const trajectory = new Line2(geometry, material)
         trajectory.computeLineDistances()
         trajectory.name = `${astre.name} Trajectory`

         trajectoriesGroup.current.add(trajectory)
      }
   }

   /**
    *
    */
   const setSolarSystemPositions = (): void => {
      astres.forEach((astre: Astre): void => {
         const position: THREE.Vector3 = getPlanetPosition(astre.body, dateValueToDate(selectedDate))
         if (astre.astreMesh) {
            astre.astreMesh.position.set(
               position.x,
               position.y,
               position.z,
            )
         }
      })
   }

   /**
    * Create celestial body name labels with optimized geometry caching.
    */
   const textGeometryCache: Map<string, TextGeometry> = useRef(new Map()).current

   const createSolarSystemNames = async (): Promise<void> => {
      if (!fontLoaded.current) {
         await loadFont()
      }

      if (!font.current || !displayedSceneData) return

      clearGroup(namesGroup.current)

      for (const astre of astres) {
         if (!astre.astreMesh) continue
         if (!trueSize && astre.body === Body.Moon) continue

         // Cache text geometry by name and size.
         const cacheKey = `${astre.name}_${SUN_RADIUS}`
         let textGeo = textGeometryCache.get(cacheKey)

         if (!textGeo) {
            textGeo = new TextGeometry(astre.name, {
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
            textGeometryCache.set(cacheKey, textGeo)
         }

         const astreRadius: number = trueSize ? astre.radius : SUN_RADIUS
         const position: THREE.Vector3 = astre.astreMesh.position
         const textMesh = new THREE.Mesh(textGeo, textMaterials)
         textMesh.position.set(position.x, position.y + astreRadius * 2, position.z)
         textMesh.name = `${astre.name} Label`

         namesGroup.current.add(textMesh)
      }

      displayedSceneData.scene.add(namesGroup.current)
   }

   /**
    * Cleanup function to dispose of cached resources.
    */
   const cleanup = (): void => {
      displayedSceneData?.controls?.removeEventListener('change', handleNamesLOD)

      // Dispose cached geometries.
      geometryCache.forEach((geometry): void => {
         geometry.dispose()
      })
      geometryCache.clear()

      // Dispose cached text geometries.
      textGeometryCache.forEach((geometry): void => {
         geometry.dispose()
      })
      textGeometryCache.clear()

      // Dispose materials.
      disposeMaterial(textMaterialFront)
      disposeMaterial(textMaterialSide)
      solarSystemMaterials.forEach((material): void => {
         material.dispose()
      })
      solarSystemMaterials.clear()
   }

   useEffect(() => {
      createSolarSystemMeshes()
      setSolarSystemPositions()
      createSolarSystemNames()
      handleNamesLOD()
      animate()

      displayedSceneData?.controls?.addEventListener('change', handleNamesLOD)

      return cleanup
   }, [displayedSceneData, trueSize, selectedDate])


   const astresNamesAdjustedScale = useRef<number>(SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MAX_SCALE)

   /**
    * Function to handle resizing names accordingly with zoom.
    */
   const handleNamesLOD = (): void => {
      if (namesGroup.current == null || displayedSceneData == null) {
         return
      }

      astresNamesAdjustedScale.current = clamp(
         displayedSceneData.controls.getDistance() / 1e10,
         SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MIN_SCALE,
         SOLAR_SYSTEM_SCENE_ASTRES_NAMES_MAX_SCALE,
      )

      namesGroup.current.children.forEach((name): void => {
         name.scale.set(
            astresNamesAdjustedScale.current,
            astresNamesAdjustedScale.current,
            astresNamesAdjustedScale.current,
         )
      })
   }


   /**
    * Update min distance from selected astre using selected astre radius.
    */
   useEffect((): void => {
      if (displayedSceneData?.controls && displayedSceneData.type === SceneType.SOLAR_SYSTEM) {
         displayedSceneData.controls.minDistance = (trueSize ? selectedAstre.radius : SUN_RADIUS) * 2
      }
   }, [displayedSceneData, selectedAstre, trueSize])


   useEffect((): void => {
      if (trajectoriesGroup.current.parent !== solarSystemScene) {
         solarSystemScene.add(trajectoriesGroup.current)
      }
   }, [solarSystemScene])


   useEffect((): void => {
      if (displayedSceneData?.type !== SceneType.SOLAR_SYSTEM) {
         return
      }

      if (!showTrajectories) {
         trajectoriesGroup.current.visible = false
         return
      }

      createSolarSystemTrajectories()
      trajectoriesGroup.current.visible = true
   }, [displayedSceneData, showTrajectories, selectedDate])


   useEffect((): void => {
      trajectoriesGroup.current.children.forEach((trajectory): void => {
         const material = (trajectory as Line2).material as LineMaterial
         material.linewidth = trajectoryLineWidth
         material.needsUpdate = true
      })
   }, [trajectoryLineWidth])


   useEffect((): (() => void) | void => {
      if (typeof window === 'undefined') {
         return
      }

      const updateTrajectoryResolution = (): void => {
         trajectoriesGroup.current.children.forEach((trajectory): void => {
            const material = (trajectory as Line2).material as LineMaterial
            material.resolution.set(window.innerWidth, window.innerHeight)
         })
      }

      updateTrajectoryResolution()
      window.addEventListener('resize', updateTrajectoryResolution)

      return () => {
         window.removeEventListener('resize', updateTrajectoryResolution)
      }
   }, [])


   useEffect(() => {
      return () => {
         clearGroup(trajectoriesGroup.current)
         trajectoriesGroup.current.removeFromParent()
      }
   }, [])


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
   }

   return null
}