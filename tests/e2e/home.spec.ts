import { expect, test } from '@playwright/test'

test.describe('Home page', () => {
   test('opens and closes the settings dashboard', async ({ page }) => {
      await page.goto('/')

      await expect(page).toHaveTitle(/Earth 3D/i)

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible()

      await openSettingsButton.click()

      const settingsTitle = page.getByRole('heading', { name: '⚙️ Settings' })
      await expect(settingsTitle).toBeVisible()

      await page.getByRole('button', { name: 'Close' }).click()

      await expect(settingsTitle).not.toBeVisible()
      await expect(openSettingsButton).toBeVisible()
   })
})
