import { expect, test } from '@playwright/test'
import { PLANE_SCENE_TYPE, SPHERICAL_SCENE_TYPE } from '@/app/constants/numbers'
import { readSceneDebug } from '@/tests/e2e/utils/readSceneDebug'
import { moveCameraToPlaneScene } from '@/tests/e2e/utils/moveCameraToPlaneScene'

test.describe('Planes rendering', () => {
   test('requests planes data and renders planes on spherical scene by default', async ({ page }) => {
      test.setTimeout(90_000)

      let statesRequestCount = 0

      await page.route('**/api/planes/states**', async (route) => {
         statesRequestCount += 1

         const url = new URL(route.request().url())
         const lamin = Number(url.searchParams.get('lamin') ?? '47')
         const lamax = Number(url.searchParams.get('lamax') ?? '49')
         const lomin = Number(url.searchParams.get('lomin') ?? '1')
         const lomax = Number(url.searchParams.get('lomax') ?? '3')

         const centerLatitude = Number.isFinite(lamin) && Number.isFinite(lamax)
            ? (lamin + lamax) / 2
            : 48
         const centerLongitude = Number.isFinite(lomin) && Number.isFinite(lomax)
            ? (lomin + lomax) / 2
            : 2

         await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
               time: Math.floor(Date.now() / 1000),
               states: [
                  [
                     'abcd01',
                     'TEST001',
                     'France',
                     Math.floor(Date.now() / 1000),
                     Math.floor(Date.now() / 1000),
                     centerLongitude,
                     centerLatitude,
                     10000,
                     false,
                     230,
                     90,
                     1,
                     null,
                     10200,
                     null,
                     false,
                     0,
                     3,
                  ],
               ],
               meta: {
                  source: 'live',
                  fetchedAt: Date.now(),
                  ttlMs: 30000,
                  retryAfterSeconds: null,
                  authenticated: false,
                  requestCost: 1,
                  normalizedBBox: {
                     lamin: centerLatitude - 1,
                     lomin: centerLongitude - 1,
                     lamax: centerLatitude + 1,
                     lomax: centerLongitude + 1,
                  },
               },
            }),
         })
      })

      await page.goto('/')

      await expect.poll(() => statesRequestCount).toBeGreaterThan(0)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.planesSceneType ?? Number.NaN
      }).toBe(SPHERICAL_SCENE_TYPE)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.displayedPlanesCount ?? 0
      }, {
         timeout: 20_000,
      }).toBeGreaterThan(0)
   })

   test('keeps planes rendering active after switching to planisphere scene', async ({ page }) => {
      test.setTimeout(120_000)

      await page.route('**/api/planes/states**', async (route) => {
         const url = new URL(route.request().url())
         const lamin = Number(url.searchParams.get('lamin') ?? '47')
         const lamax = Number(url.searchParams.get('lamax') ?? '49')
         const lomin = Number(url.searchParams.get('lomin') ?? '1')
         const lomax = Number(url.searchParams.get('lomax') ?? '3')

         const centerLatitude = Number.isFinite(lamin) && Number.isFinite(lamax)
            ? (lamin + lamax) / 2
            : 48
         const centerLongitude = Number.isFinite(lomin) && Number.isFinite(lomax)
            ? (lomin + lomax) / 2
            : 2

         await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
               time: Math.floor(Date.now() / 1000),
               states: [
                  [
                     'abcd02',
                     'TEST002',
                     'France',
                     Math.floor(Date.now() / 1000),
                     Math.floor(Date.now() / 1000),
                     centerLongitude,
                     centerLatitude,
                     9500,
                     false,
                     220,
                     120,
                     0,
                     null,
                     9800,
                     null,
                     false,
                     0,
                     3,
                  ],
               ],
               meta: {
                  source: 'live',
                  fetchedAt: Date.now(),
                  ttlMs: 30000,
                  retryAfterSeconds: null,
                  authenticated: false,
                  requestCost: 1,
                  normalizedBBox: {
                     lamin: centerLatitude - 1,
                     lomin: centerLongitude - 1,
                     lamax: centerLatitude + 1,
                     lomax: centerLongitude + 1,
                  },
               },
            }),
         })
      })

      await page.goto('/')

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.displayedPlanesCount ?? 0
      }, {
         timeout: 20_000,
      }).toBeGreaterThan(0)

      await moveCameraToPlaneScene(page)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.planesSceneType ?? Number.NaN
      }).toBe(PLANE_SCENE_TYPE)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.displayedPlanesCount ?? 0
      }, {
         timeout: 20_000,
      }).toBeGreaterThan(0)
   })
})
