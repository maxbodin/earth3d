import { expect, test } from '@playwright/test'

test.describe('Scene mode URL search params', () => {
   test('defaults to sphere mode without mode param', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveURL(/.*/)
      // The URL should eventually contain mode=sphere once the scene initialises.
      await expect(page).toHaveURL(/mode=sphere/)
   })

   test('navigates directly to planisphere mode via URL', async ({ page }) => {
      await page.goto('/?mode=planisphere')
      await expect(page).toHaveURL(/mode=planisphere/)
   })

   test('navigates directly to sphere mode via URL', async ({ page }) => {
      await page.goto('/?mode=sphere')
      await expect(page).toHaveURL(/mode=sphere/)
   })

   test('navigates directly to solar_system mode via URL', async ({ page }) => {
      await page.goto('/?mode=solar_system')
      await expect(page).toHaveURL(/mode=solar_system/)

      // Solar system mode should show the "Get back to Earth" button.
      const backToEarthButton = page.getByRole('button', { name: 'Get back to Earth.' })
      await expect(backToEarthButton).toBeVisible()
   })

   test('solar_system mode persists after LOD frames', async ({ page }) => {
      await page.goto('/?mode=solar_system')

      // Wait for a few animation frames to ensure LOD doesn't bounce back.
      await page.waitForTimeout(500)

      // URL should still reflect solar_system mode.
      await expect(page).toHaveURL(/mode=solar_system/)

      // Earth button should still be visible (solar system UI).
      const backToEarthButton = page.getByRole('button', { name: 'Get back to Earth.' })
      await expect(backToEarthButton).toBeVisible()
   })

   test('preserves existing search params when mode is set', async ({ page }) => {
      await page.goto('/?lat=48.8566&lon=2.3522')
      // mode param should be appended alongside existing params.
      await expect(page).toHaveURL(/lat=48\.8566/)
      await expect(page).toHaveURL(/lon=2\.3522/)
      await expect(page).toHaveURL(/mode=sphere/)
   })

   test('ignores invalid mode param and defaults to sphere', async ({ page }) => {
      await page.goto('/?mode=invalid_mode')
      // Should fall back to sphere mode.
      await expect(page).toHaveURL(/mode=sphere/)
   })
})

test.describe('Back to Earth button in solar system mode', () => {
   test('back to earth button is visible in solar system mode', async ({ page }) => {
      await page.goto('/?mode=solar_system')

      const backToEarthButton = page.getByRole('button', { name: 'Get back to Earth.' })
      await expect(backToEarthButton).toBeVisible()
   })

   test('back to earth button is not visible in sphere mode', async ({ page }) => {
      await page.goto('/?mode=sphere')

      const backToEarthButton = page.getByRole('button', { name: 'Get back to Earth.' })
      await expect(backToEarthButton).not.toBeVisible()
   })

   test('clicking back to earth button triggers camera transition', async ({ page }) => {
      await page.goto('/?mode=solar_system')

      const backToEarthButton = page.getByRole('button', { name: 'Get back to Earth.' })
      await expect(backToEarthButton).toBeVisible()

      // Clicking should not throw and the button should remain accessible.
      await backToEarthButton.click()

      // Button should still be visible after clicking (we stay in solar system mode).
      await expect(backToEarthButton).toBeVisible()
   })
})
