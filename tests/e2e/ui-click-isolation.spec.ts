import { expect, test } from '@playwright/test'
import { mockPlaneRoute } from '@/tests/e2e/mocks/routes/mockPlaneRoute'

test.describe('UI click isolation from 3D scene', () => {
   test('clicking a navigation bar button does not trigger 3D raycast', async ({ page }) => {
      await mockPlaneRoute(page);

      await page.goto('/')
      await page.waitForTimeout(3000)

      // Click the settings button — should NOT trigger a geocode call on the planet.
      const settingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(settingsButton).toBeVisible()

      let geocodeCalled = false
      await page.route('**/ors/**', async (route) => {
         geocodeCalled = true
         await route.abort()
      })

      await settingsButton.click()
      await page.waitForTimeout(500)

      expect(geocodeCalled).toBe(false)
   })

   test('GlassCard has data-map-pick-ignore attribute', async ({ page }) => {
      await mockPlaneRoute(page);

      await page.goto('/')
      await page.waitForTimeout(3000)

      // Verify the UI overlay div has the ignore attribute
      const uiOverlay = page.locator('[data-map-pick-ignore="true"]').first()
      await expect(uiOverlay).toBeAttached()
   })

   test('main UI overlay has data-map-pick-ignore attribute', async ({ page }) => {
      await page.goto('/')
      await page.waitForTimeout(2000)

      const overlays = page.locator('[data-map-pick-ignore="true"]')
      const count = await overlays.count()
      expect(count).toBeGreaterThan(0)
   })
})
