import { expect, test } from '@playwright/test'

test.describe('Airport search', () => {
   test('finds an airport by ICAO and focuses it', async ({ page }) => {
      await page.goto('/')

      const subjectButton = page.getByRole('button', { name: /Country/i })
      await expect(subjectButton).toBeVisible()

      await subjectButton.click()
      await page.getByRole('menuitemradio', { name: /Airport/i }).click()

      const airportInput = page.getByTestId('search-input')
      await expect(airportInput).toBeVisible()

      await airportInput.fill('00CA')
      await page.keyboard.press('Enter')

      await expect(page.getByText(/IDENT:\s*00CA/i)).toBeVisible({ timeout: 15000 })
      await expect(page).toHaveURL(/[?&]lat=/)
      await expect(page).toHaveURL(/[?&]lon=/)
   })
})
