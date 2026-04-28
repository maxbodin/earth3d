import { expect, test } from '@playwright/test'
import {
   STORAGE_KEY_EARTHQUAKES_ACTIVATED,
   STORAGE_KEY_EARTHQUAKES_MIN_MAGNITUDE,
   STORAGE_KEY_EARTHQUAKES_TIME_RANGE,
} from '@/app/constants/storageKeys'
import { openSettingsTab } from '@/tests/e2e/utils/openSettingsTab'
import { mockEarthquakeRoute } from '@/tests/e2e/mocks/routes/mockEarthquakeRoute'

const TAB_EARTHQUAKES = 'Earthquakes'

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
