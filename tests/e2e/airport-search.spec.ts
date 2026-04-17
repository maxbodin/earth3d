import { expect, test } from '@playwright/test'

test.describe('Airport search', () => {
   test('finds an airport by ICAO and focuses it', async ({ page }) => {
      await page.goto('/')

      const subjectButton = page.getByRole('button', { name: /Country/i })
      await expect(subjectButton).toBeVisible()

      await subjectButton.click()
      await page.getByRole('menuitemradio', { name: /Airport/i }).click()

      const airportInput = page.locator('#search-input')
      await expect(airportInput).toBeVisible()

      await airportInput.fill('00CA')
      await page.keyboard.press('Enter')

      await expect(page.getByText(/IDENT:\s*00CA/i)).toBeVisible({ timeout: 15000 })

      const focusAirportButton = page.locator('button', { hasText: /Focus on airport/i }).first()
      await expect(focusAirportButton).toBeVisible()

      await page.evaluate((): void => {
         window.history.replaceState({}, '', '/')
      })
      await expect(page).not.toHaveURL(/[?&]lat=/)

      await focusAirportButton.click({ force: true })
      await expect(page).toHaveURL(/[?&]lat=/)
      await expect(page).toHaveURL(/[?&]lon=/)
   })
})
