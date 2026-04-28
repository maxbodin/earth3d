import { expect, Page, test } from '@playwright/test'
import {
   STORAGE_KEY_EARTHQUAKES_ACTIVATED,
   STORAGE_KEY_EARTHQUAKES_MIN_MAGNITUDE,
   STORAGE_KEY_EARTHQUAKES_TIME_RANGE,
} from '@/app/constants/storageKeys'
import { openSettingsTab } from '@/tests/e2e/utils/openSettingsTab'
import { ONE_HOUR_IN_MS } from '@/app/constants/numbers'

const TAB_EARTHQUAKES = 'Earthquakes'

function createMockEarthquakeResponse(count: number = 3) {
   const features = Array.from({ length: count }, (_, i) => ({
      type: 'Feature',
      properties: {
         mag: 3.5 + i,
         place: `${50 + i}km NW of TestCity ${i}`,
         time: Date.now() - i * ONE_HOUR_IN_MS,
         updated: Date.now(),
         tz: null,
         url: `https://earthquake.usgs.gov/earthquakes/eventpage/test${i}`,
         detail: '',
         felt: i > 0 ? 10 + i : null,
         cdi: null,
         mmi: null,
         alert: null,
         status: 'reviewed',
         tsunami: 0,
         sig: 200 + i * 50,
         net: 'us',
         code: `test${i}`,
         ids: `,ustest${i},`,
         sources: ',us,',
         types: ',origin,',
         nst: null,
         dmin: null,
         rms: null,
         gap: null,
         magType: 'mb',
         type: 'earthquake',
         title: `M ${3.5 + i} - ${50 + i}km NW of TestCity ${i}`,
      },
      geometry: {
         type: 'Point',
         coordinates: [-120 + i * 10, 35 + i * 5, 10 + i * 20],
      },
      id: `test${i}`,
   }))

   return {
      type: 'FeatureCollection',
      metadata: {
         generated: Date.now(),
         url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
         title: 'USGS Earthquakes',
         status: 200,
         api: '1.14.1',
         count,
      },
      features,
   }
}

async function mockEarthquakeRoute(
   page: Page,
   options: { count?: number; onRequest?: () => void } = {},
): Promise<void> {
   await page.route('**/api/earthquakes**', async (route) => {
      options.onRequest?.()

      await route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify(createMockEarthquakeResponse(options.count ?? 3)),
      })
   })
}

test.describe('Earthquakes settings tab', () => {
   test('earthquakes tab is visible in settings', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_EARTHQUAKES)

      const activateSwitch = page.locator('input[type="checkbox"]').first()
      await expect(activateSwitch).toBeVisible()
   })

   test('toggling earthquakes on writes true to localStorage', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_EARTHQUAKES)

      const earthquakeSwitch = page.locator('input[type="checkbox"]').first()
      await expect(earthquakeSwitch).toBeVisible()

      // Default is off.
      await expect(earthquakeSwitch).not.toBeChecked()
      await earthquakeSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_EARTHQUAKES_ACTIVATED,
      )
      expect(storedValue).toBe('true')
   })

   test('earthquake setting persists as enabled on reload', async ({ page }) => {
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_EARTHQUAKES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_EARTHQUAKES)

      const earthquakeSwitch = page.locator('input[type="checkbox"]').first()
      await expect(earthquakeSwitch).toBeVisible()
      await expect(earthquakeSwitch).toBeChecked()
   })

   test('filter options are visible when earthquakes activated', async ({ page }) => {
      await mockEarthquakeRoute(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_EARTHQUAKES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_EARTHQUAKES)

      // Time range dropdown
      const timeRangeSelect = page.locator('#eq-time-range')
      await expect(timeRangeSelect).toBeVisible()

      // Min magnitude dropdown
      const minMagSelect = page.locator('#eq-min-mag')
      await expect(minMagSelect).toBeVisible()

      // Earthquakes loaded count
      await expect(page.getByText('Earthquakes loaded:')).toBeVisible()
   })

   test('time range filter persists to localStorage', async ({ page }) => {
      await mockEarthquakeRoute(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_EARTHQUAKES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_EARTHQUAKES)

      const timeRangeSelect = page.locator('#eq-time-range')
      await timeRangeSelect.click()
      await page.getByRole('option', { name: 'Last Week' }).click()

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_EARTHQUAKES_TIME_RANGE,
      )
      expect(storedValue).toBe('"week"')
   })

   test('min magnitude filter persists to localStorage', async ({ page }) => {
      await mockEarthquakeRoute(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_EARTHQUAKES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_EARTHQUAKES)

      const minMagSelect = page.locator('#eq-min-mag')
      await minMagSelect.click()
      await page.getByRole('option', { name: '5.0+' }).click()

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_EARTHQUAKES_MIN_MAGNITUDE,
      )
      expect(storedValue).toBe('5')
   })
})

test.describe('Earthquakes API route', () => {
   test('earthquake data is fetched when activated', async ({ page }) => {
      let apiCalled = false

      await mockEarthquakeRoute(page, {
         onRequest: () => { apiCalled = true },
      })

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_EARTHQUAKES_ACTIVATED,
      )

      await page.goto('/')

      // Wait for the earthquake fetch to happen
      await page.waitForTimeout(2000)
      expect(apiCalled).toBe(true)
   })

   test('earthquake data is not fetched when deactivated', async ({ page }) => {
      let apiCalled = false

      await mockEarthquakeRoute(page, {
         onRequest: () => { apiCalled = true },
      })

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(false)),
         STORAGE_KEY_EARTHQUAKES_ACTIVATED,
      )

      await page.goto('/')
      await page.waitForTimeout(2000)
      expect(apiCalled).toBe(false)
   })
})

test.describe('Earthquakes time-lapse controls', () => {
   test('time-lapse controls appear when data is loaded', async ({ page }) => {
      await mockEarthquakeRoute(page, { count: 5 })

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_EARTHQUAKES_ACTIVATED,
      )

      await page.goto('/')
      await page.waitForTimeout(2000)
      await openSettingsTab(page, TAB_EARTHQUAKES)

      const playButton = page.getByText('▶ Play')
      await expect(playButton).toBeVisible()

      const resetButton = page.getByText('↺ Reset')
      await expect(resetButton).toBeVisible()

      const slider = page.locator('input[type="range"]')
      await expect(slider).toBeVisible()
   })
})
