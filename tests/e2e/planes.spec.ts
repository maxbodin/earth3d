import { expect, Page, test } from '@playwright/test'
import { PLANE_SCENE_TYPE, SPHERICAL_SCENE_TYPE } from '@/app/constants/numbers'
import { readSceneDebug } from '@/tests/e2e/utils/readSceneDebug'
import { moveCameraToPlaneScene } from '@/tests/e2e/utils/moveCameraToPlaneScene'

type MockStatesRouteOptions = {
   onRequest?: () => void
   remainingTokens?: number
   state?: {
      icao24?: string
      callsign?: string
      baroAltitude?: number
      velocity?: number
      trueTrack?: number
      verticalRate?: number
      geoAltitude?: number
      category?: number | null
   }
}

async function mockStatesRoute(
   page: Page,
   options: MockStatesRouteOptions = {},
): Promise<void> {
   await page.route('**/api/planes/states**', async (route) => {
      options.onRequest?.()

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

      const state = options.state ?? {}
      const remainingTokens = options.remainingTokens ?? 392

      await route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify({
            time: Math.floor(Date.now() / 1000),
            states: [
               [
                  state.icao24 ?? 'abcd01',
                  state.callsign ?? 'TEST001',
                  'France',
                  Math.floor(Date.now() / 1000),
                  Math.floor(Date.now() / 1000),
                  centerLongitude,
                  centerLatitude,
                  state.baroAltitude ?? 10_000,
                  false,
                  state.velocity ?? 230,
                  state.trueTrack ?? 90,
                  state.verticalRate ?? 1,
                  null,
                  state.geoAltitude ?? 10_200,
                  null,
                  false,
                  0,
                  state.category ?? 3,
               ],
            ],
            meta: {
               source: 'live',
               fetchedAt: Date.now(),
               ttlMs: 30000,
               retryAfterSeconds: null,
               authenticated: false,
               remainingTokens,
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
}

test.describe('Planes rendering', () => {
   test('requests planes data and renders planes on spherical scene by default', async ({ page }) => {
      test.setTimeout(90_000)

      let statesRequestCount = 0

      await mockStatesRoute(page, {
         onRequest: () => {
            statesRequestCount += 1
         },
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

      await mockStatesRoute(page, {
         state: {
            icao24: 'abcd02',
            callsign: 'TEST002',
            baroAltitude: 9500,
            velocity: 220,
            trueTrack: 120,
            verticalRate: 0,
            geoAltitude: 9800,
         },
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

   test('hides and re-shows planes when toggling planes tab setting', async ({ page }) => {
      test.setTimeout(120_000)

      await mockStatesRoute(page, {
         state: {
            icao24: 'abcd03',
            callsign: 'TEST003',
            baroAltitude: 9800,
            velocity: 240,
            trueTrack: 75,
            verticalRate: 2,
            geoAltitude: 10_050,
         },
      })

      await page.goto('/')

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.displayedPlanesCount ?? 0
      }, {
         timeout: 20_000,
      }).toBeGreaterThan(0)

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible({ timeout: 60_000 })
      await openSettingsButton.click({ force: true })
      await expect(page.getByRole('heading', { name: '⚙️ Settings' })).toBeVisible()

      await page.getByRole('button', { name: 'Planes' }).click()

      const planesToggle = page
         .locator('.switch-holder', { hasText: 'Activate planes on Map' })
         .locator('input[type="checkbox"]')
         .first()

      await expect(planesToggle).toBeVisible()

      if (await planesToggle.isChecked()) {
         await planesToggle.click({ force: true })
      }

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.displayedPlanesCount ?? 0
      }).toBe(0)

      await planesToggle.click({ force: true })

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.displayedPlanesCount ?? 0
      }, {
         timeout: 20_000,
      }).toBeGreaterThan(0)
   })

   test('shows OpenSky remaining tokens in the planes settings tab', async ({ page }) => {
      test.setTimeout(90_000)

      await mockStatesRoute(page, {
         state: {
            icao24: 'abcd04',
            callsign: 'TEST004',
            baroAltitude: 9200,
            velocity: 210,
            trueTrack: 33,
            verticalRate: 0,
            geoAltitude: 9500,
         },
      })

      await page.goto('/')

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible({ timeout: 60_000 })
      await openSettingsButton.click({ force: true })
      await page.getByRole('button', { name: 'Planes' }).click()

      await expect(page.getByText(/OpenSky remaining tokens:\s*392/i)).toBeVisible({ timeout: 15_000 })
   })

   test('keeps planes lifted above planisphere ground when altitude is present', async ({ page }) => {
      test.setTimeout(120_000)

      await mockStatesRoute(page, {
         state: {
            icao24: 'abcd05',
            callsign: 'TEST005',
            baroAltitude: 12_345,
            velocity: 240,
            trueTrack: 88,
            verticalRate: 0,
            geoAltitude: 12_500,
         },
      })

      await page.goto('/')
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

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.displayedPlanesMinAltitudeMeters ?? 0
      }, {
         timeout: 20_000,
      }).toBeGreaterThan(0)
   })
})
