import { expect, test } from '@playwright/test'

test.describe('Marker creation', () => {
   test('random place button creates a marker', async ({ page }) => {
      await page.goto('/')

      const randomPlaceButton = page.getByRole('button', { name: 'Random Place' })
      await expect(randomPlaceButton).toBeVisible()

      await randomPlaceButton.click()

      // Wait for the random place API call to resolve and marker to be created.
      // Open markers dashboard to verify a marker was added.
      const openMarkersButton = page.getByRole('button', { name: 'Open Markers' })
      await expect(openMarkersButton).toBeVisible()
      await openMarkersButton.click()

      const markersHeading = page.getByRole('heading', { name: /Manage and create markers/i })
      await expect(markersHeading).toBeVisible()

      // The random place should have created a marker with a title input.
      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(1, { timeout: 15_000 })
   })

   test('multiple random place clicks create multiple markers', async ({ page }) => {
      await page.goto('/')

      const randomPlaceButton = page.getByRole('button', { name: 'Random Place' })
      await expect(randomPlaceButton).toBeVisible()

      await randomPlaceButton.click()
      // Wait for loading to finish before clicking again.
      await expect(randomPlaceButton).toBeEnabled({ timeout: 15_000 })

      await randomPlaceButton.click()
      await expect(randomPlaceButton).toBeEnabled({ timeout: 15_000 })

      const openMarkersButton = page.getByRole('button', { name: 'Open Markers' })
      await openMarkersButton.click()

      const markersHeading = page.getByRole('heading', { name: /Manage and create markers/i })
      await expect(markersHeading).toBeVisible()

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(2, { timeout: 15_000 })
   })
})
