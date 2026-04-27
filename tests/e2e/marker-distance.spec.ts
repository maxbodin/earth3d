import { expect, test } from '@playwright/test'

test.describe('Marker distance measurement', () => {
   test('measure distance button is disabled when fewer than 2 markers are selected', async ({ page }) => {
      await page.goto('/')

      const openMarkersButton = page.getByRole('button', { name: 'Open Markers' })
      await expect(openMarkersButton).toBeVisible()
      await openMarkersButton.click()

      const markersHeading = page.getByRole('heading', { name: /Manage and create markers/i })
      await expect(markersHeading).toBeVisible()

      const measureButton = page.getByRole('button', { name: 'Measure distance' })
      await expect(measureButton).toBeVisible()
      await expect(measureButton).toBeDisabled()
   })

   test('measure distance button is enabled when exactly 2 markers are selected', async ({ page }) => {
      await page.goto('/')

      // Create two markers via Random Place.
      const randomPlaceButton = page.getByRole('button', { name: 'Random Place' })
      await expect(randomPlaceButton).toBeVisible()

      await randomPlaceButton.click()
      await expect(randomPlaceButton).toBeEnabled({ timeout: 15_000 })

      await randomPlaceButton.click()
      await expect(randomPlaceButton).toBeEnabled({ timeout: 15_000 })

      // Open markers dashboard.
      const openMarkersButton = page.getByRole('button', { name: 'Open Markers' })
      await openMarkersButton.click()

      const markersHeading = page.getByRole('heading', { name: /Manage and create markers/i })
      await expect(markersHeading).toBeVisible()

      // Wait for 2 markers to appear.
      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(2, { timeout: 15_000 })

      // Select both markers via checkboxes.
      const checkboxes = page.getByRole('checkbox')
      const markerCheckboxes = checkboxes.filter({ hasNot: page.getByTestId('global-marker-titles-toggle') })

      for (let i = 0; i < 2; i++) {
         await markerCheckboxes.nth(i).check()
      }

      // Measure distance button should now be enabled.
      const measureButton = page.getByRole('button', { name: 'Measure distance' })
      await expect(measureButton).toBeEnabled()
   })

   test('clicking measure distance shows toast with distance', async ({ page }) => {
      await page.goto('/')

      // Create two markers.
      const randomPlaceButton = page.getByRole('button', { name: 'Random Place' })
      await expect(randomPlaceButton).toBeVisible()

      await randomPlaceButton.click()
      await expect(randomPlaceButton).toBeEnabled({ timeout: 15_000 })

      await randomPlaceButton.click()
      await expect(randomPlaceButton).toBeEnabled({ timeout: 15_000 })

      // Open markers dashboard.
      const openMarkersButton = page.getByRole('button', { name: 'Open Markers' })
      await openMarkersButton.click()

      const markersHeading = page.getByRole('heading', { name: /Manage and create markers/i })
      await expect(markersHeading).toBeVisible()

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(2, { timeout: 15_000 })

      // Select both markers.
      const checkboxes = page.getByRole('checkbox')
      const markerCheckboxes = checkboxes.filter({ hasNot: page.getByTestId('global-marker-titles-toggle') })

      for (let i = 0; i < 2; i++) {
         await markerCheckboxes.nth(i).check()
      }

      // Click measure distance.
      const measureButton = page.getByRole('button', { name: 'Measure distance' })
      await measureButton.click()

      // Toast should appear with "Distance:" and "km".
      const toast = page.getByRole('status')
      await expect(toast).toBeVisible()
      await expect(toast).toContainText(/Distance:.*km/i)
   })
})
