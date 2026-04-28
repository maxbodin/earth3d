import { expect, Page, test } from '@playwright/test'
import { STORAGE_KEY_EARTHQUAKES_ACTIVATED, STORAGE_KEY_PLANES_ACTIVATED, } from '@/app/constants/storageKeys'
import { mockEarthquakeRoute } from '@/tests/e2e/mocks/routes/mockEarthquakeRoute'
import { mockPlaneRoute } from '@/tests/e2e/mocks/routes/mockPlaneRoute'

async function mockApiRoutes(page: Page): Promise<void> {
   await mockPlaneRoute(page);
   await mockEarthquakeRoute(page);
}

test.describe('Loading screen data steps', () => {
   test('loading completes when planes are deactivated', async ({ page }) => {
      await mockApiRoutes(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(false)),
         STORAGE_KEY_PLANES_ACTIVATED,
      )

      await page.reload()

      const loadingScreen = page.getByTestId('loading-screen')
      await expect(loadingScreen).toBeAttached()

      // Loading should eventually complete (fade out).
      await expect(loadingScreen).toHaveAttribute('data-state', 'complete', { timeout: 30_000 })
   })

   test('loading completes when both planes and earthquakes are activated', async ({ page }) => {
      test.setTimeout(60_000)
      await mockApiRoutes(page)

      await page.evaluate(
         ([planesKey, eqKey]) => {
            localStorage.setItem(planesKey, JSON.stringify(true))
            localStorage.setItem(eqKey, JSON.stringify(true))
         },
         [STORAGE_KEY_PLANES_ACTIVATED, STORAGE_KEY_EARTHQUAKES_ACTIVATED] as const,
      )

      await page.goto('/')

      const loadingScreen = page.getByTestId('loading-screen')
      await expect(loadingScreen).toHaveAttribute('data-state', 'complete', { timeout: 45_000 })
   })

   test('loading completes when earthquakes deactivated and planes activated', async ({ page }) => {
      test.setTimeout(60_000)
      await mockApiRoutes(page)

      await page.evaluate(
         ([planesKey, eqKey]) => {
            localStorage.setItem(planesKey, JSON.stringify(true))
            localStorage.setItem(eqKey, JSON.stringify(false))
         },
         [STORAGE_KEY_PLANES_ACTIVATED, STORAGE_KEY_EARTHQUAKES_ACTIVATED] as const,
      )

      await page.goto('/')

      const loadingScreen = page.getByTestId('loading-screen')
      await expect(loadingScreen).toHaveAttribute('data-state', 'complete', { timeout: 45_000 })
   })
})
