import { expect, test } from '@playwright/test'
import { haversineDistance } from '@/lib/geo/haversineDistance'
import { midpoint } from '@/lib/geo/midpoint'

test.describe('Haversine distance computation', () => {
   test('haversineDistance returns correct distance between Paris and London', () => {
      const paris = { latitude: 48.8566, longitude: 2.3522 }
      const london = { latitude: 51.5074, longitude: -0.1278 }

      const distance = haversineDistance(paris, london)
      expect(distance).toBeGreaterThan(340)
      expect(distance).toBeLessThan(350)
   })

   test('haversineDistance returns 0 for same point', () => {
      const point = { latitude: 40.7128, longitude: -74.006 }
      const distance = haversineDistance(point, point)
      expect(distance).toBeCloseTo(0, 5)
   })

   test('haversineDistance returns correct antipodal distance', () => {
      const northPole = { latitude: 90, longitude: 0 }
      const southPole = { latitude: -90, longitude: 0 }

      const distance = haversineDistance(northPole, southPole)
      expect(distance).toBeGreaterThan(20000)
      expect(distance).toBeLessThan(20100)
   })

   test('midpoint returns correct midpoint', () => {
      const a = { latitude: 0, longitude: 0 }
      const b = { latitude: 0, longitude: 10 }

      const mid = midpoint(a, b)
      expect(mid.latitude).toBeCloseTo(0, 2)
      expect(mid.longitude).toBeCloseTo(5, 2)
   })

   test('midpoint of same point returns that point', () => {
      const point = { latitude: 48.8566, longitude: 2.3522 }
      const mid = midpoint(point, point)
      expect(mid.latitude).toBeCloseTo(point.latitude, 4)
      expect(mid.longitude).toBeCloseTo(point.longitude, 4)
   })
})
