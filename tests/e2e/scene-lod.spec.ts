import { expect, test } from '@playwright/test'
import {
   AIRCRAFT_LOD_CONFIG,
   AIRPORT_LOD_CONFIG,
   computeDampedScale,
   computeScaleDamping,
   computeSceneLodScale,
   COUNTRY_TEXT_LOD_CONFIG,
   DISTANCE_LINE_LOD_CONFIG,
   MARKER_PUCK_LOD_CONFIG,
   type SceneLodConfig,
   VESSEL_LOD_CONFIG,
} from '@/app/lib/sceneLod'
import { SceneType } from '@/app/enums/sceneType'

test.describe('computeSceneLodScale', () => {
   test('clamps to minScale when camera is very close', () => {
      const scale = computeSceneLodScale(SceneType.SPHERICAL, 0, AIRCRAFT_LOD_CONFIG)
      expect(scale).toBe(AIRCRAFT_LOD_CONFIG.spherical.minScale)
   })

   test('clamps to maxScale when camera is very far', () => {
      const scale = computeSceneLodScale(SceneType.SPHERICAL, 1e12, AIRCRAFT_LOD_CONFIG)
      expect(scale).toBe(AIRCRAFT_LOD_CONFIG.spherical.maxScale)
   })

   test('returns intermediate value for mid-range distance', () => {
      const config = AIRCRAFT_LOD_CONFIG
      const midDistance = config.spherical.distanceDivisor * (config.spherical.minScale + config.spherical.maxScale) / 2
      const scale = computeSceneLodScale(SceneType.SPHERICAL, midDistance, config)
      expect(scale).toBeGreaterThan(config.spherical.minScale)
      expect(scale).toBeLessThan(config.spherical.maxScale)
   })

   test('uses plane config for SceneType.PLANE', () => {
      const scale = computeSceneLodScale(SceneType.PLANE, 0, AIRCRAFT_LOD_CONFIG)
      expect(scale).toBe(AIRCRAFT_LOD_CONFIG.plane.minScale)
   })

   test('falls back to plane minScale for unknown scene type', () => {
      const scale = computeSceneLodScale(SceneType.SOLAR_SYSTEM, 5000, AIRCRAFT_LOD_CONFIG)
      expect(scale).toBe(AIRCRAFT_LOD_CONFIG.plane.minScale)
   })

   test('applies distanceOffset correctly', () => {
      const config: SceneLodConfig = {
         spherical: { distanceDivisor: 100, distanceOffset: -5, minScale: 0, maxScale: 100 },
         plane: { distanceDivisor: 100, distanceOffset: 0, minScale: 0, maxScale: 100 },
      }
      const scale = computeSceneLodScale(SceneType.SPHERICAL, 1000, config)
      expect(scale).toBe(5)
   })

   test('scale increases with camera distance', () => {
      const near = computeSceneLodScale(SceneType.SPHERICAL, 1e6, VESSEL_LOD_CONFIG)
      const far = computeSceneLodScale(SceneType.SPHERICAL, 1e8, VESSEL_LOD_CONFIG)
      expect(far).toBeGreaterThanOrEqual(near)
   })
})

test.describe('computeScaleDamping', () => {
   test('returns 1 for plane scene when camera is far', () => {
      const damping = computeScaleDamping(SceneType.PLANE, 1e10)
      expect(damping).toBe(1)
   })

   test('returns min damping for plane scene when camera is very close', () => {
      const damping = computeScaleDamping(SceneType.PLANE, 1)
      expect(damping).toBeCloseTo(0.1, 1)
   })

   test('returns positive value for spherical scene', () => {
      const damping = computeScaleDamping(SceneType.SPHERICAL, 1e3)
      expect(damping).toBeGreaterThan(0)
   })

   test('damping increases as camera moves away for plane scene', () => {
      const close = computeScaleDamping(SceneType.PLANE, 1)
      const far = computeScaleDamping(SceneType.PLANE, 1e7)
      expect(far).toBeGreaterThanOrEqual(close)
   })
})

test.describe('computeDampedScale', () => {
   test('equals LOD scale times damping factor', () => {
      const distance = 1e10
      const lodScale = computeSceneLodScale(SceneType.PLANE, distance, COUNTRY_TEXT_LOD_CONFIG)
      const damping = computeScaleDamping(SceneType.PLANE, distance)
      const dampedScale = computeDampedScale(SceneType.PLANE, distance, COUNTRY_TEXT_LOD_CONFIG)
      expect(dampedScale).toBeCloseTo(lodScale * damping, 10)
   })

   test('matches LOD scale when plane damping is 1 (far camera)', () => {
      const lodScale = computeSceneLodScale(SceneType.PLANE, 1e10, COUNTRY_TEXT_LOD_CONFIG)
      const dampedScale = computeDampedScale(SceneType.PLANE, 1e10, COUNTRY_TEXT_LOD_CONFIG)
      expect(dampedScale).toBe(lodScale)
   })

   test('is always non-negative', () => {
      const distances = [0, 1, 100, 1e4, 1e6, 1e10]
      for (const d of distances) {
         expect(computeDampedScale(SceneType.SPHERICAL, d, MARKER_PUCK_LOD_CONFIG)).toBeGreaterThanOrEqual(0)
         expect(computeDampedScale(SceneType.PLANE, d, MARKER_PUCK_LOD_CONFIG)).toBeGreaterThanOrEqual(0)
      }
   })
})

test.describe('LOD configs consistency', () => {
   const configs = [
      { name: 'COUNTRY_TEXT', config: COUNTRY_TEXT_LOD_CONFIG },
      { name: 'MARKER_PUCK', config: MARKER_PUCK_LOD_CONFIG },
      { name: 'AIRCRAFT', config: AIRCRAFT_LOD_CONFIG },
      { name: 'AIRPORT', config: AIRPORT_LOD_CONFIG },
      { name: 'VESSEL', config: VESSEL_LOD_CONFIG },
      { name: 'DISTANCE_LINE', config: DISTANCE_LINE_LOD_CONFIG },
   ]

   for (const { name, config } of configs) {
      test(`${name} config has valid spherical settings`, () => {
         expect(config.spherical.distanceDivisor).toBeGreaterThan(0)
         expect(config.spherical.minScale).toBeLessThanOrEqual(config.spherical.maxScale)
      })

      test(`${name} config has valid plane settings`, () => {
         expect(config.plane.distanceDivisor).toBeGreaterThan(0)
         expect(config.plane.minScale).toBeLessThanOrEqual(config.plane.maxScale)
      })
   }
})

test.describe('DISTANCE_LINE_LOD_CONFIG line width factor', () => {
   test('produces sub-1 factor when camera is close (globe)', () => {
      const factor = computeSceneLodScale(SceneType.SPHERICAL, 5e6, DISTANCE_LINE_LOD_CONFIG)
      expect(factor).toBeLessThan(1)
      expect(factor).toBeGreaterThanOrEqual(DISTANCE_LINE_LOD_CONFIG.spherical.minScale)
   })

   test('produces above-1 factor when camera is far (globe)', () => {
      const factor = computeSceneLodScale(SceneType.SPHERICAL, 2e7, DISTANCE_LINE_LOD_CONFIG)
      expect(factor).toBeGreaterThan(1)
   })

   test('produces sub-1 factor when camera is close (plane)', () => {
      const factor = computeSceneLodScale(SceneType.PLANE, 5e4, DISTANCE_LINE_LOD_CONFIG)
      expect(factor).toBeLessThan(1)
      expect(factor).toBeGreaterThanOrEqual(DISTANCE_LINE_LOD_CONFIG.plane.minScale)
   })

   test('clamps to max at very far distance', () => {
      const factor = computeSceneLodScale(SceneType.SPHERICAL, 1e12, DISTANCE_LINE_LOD_CONFIG)
      expect(factor).toBe(DISTANCE_LINE_LOD_CONFIG.spherical.maxScale)
   })
})
