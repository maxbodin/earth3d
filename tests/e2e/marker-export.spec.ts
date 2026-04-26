import { expect, test } from '@playwright/test'
import path from 'path'
import fs from 'fs/promises'


test.describe('Marker export', () => {
   test('export button is disabled when no markers are selected', async ({ page }) => {
      await page.goto('/')

      await page.getByRole('button', { name: 'Open Markers' }).click()
      await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()

      await page.getByRole('button', { name: /Create new marker/i }).first().click()

      const exportButton = page.getByRole('button', { name: 'Export selected markers' })
      await expect(exportButton).toBeVisible()
      await expect(exportButton).toBeDisabled()
   })

   test('exports selected markers to a JSON file with correct data', async ({ page }) => {
      await page.goto('/')

      await page.getByRole('button', { name: 'Open Markers' }).click()
      await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()

      // Create first marker.
      await page.getByRole('button', { name: /Create new marker/i }).first().click()
      const firstTitle = page.getByRole('textbox', { name: 'Enter marker title' }).last()
      await firstTitle.fill('Paris')

      // Create second marker.
      await page.getByRole('button', { name: /Create new marker/i }).first().click()
      const secondTitle = page.getByRole('textbox', { name: 'Enter marker title' }).last()
      await secondTitle.fill('London')

      // Select both markers via their checkboxes.
      const checkboxes = page.locator('table').getByRole('checkbox')
      const checkboxCount = await checkboxes.count()
      for (let i = 0; i < checkboxCount; i++) {
         await checkboxes.nth(i).click()
      }

      const exportButton = page.getByRole('button', { name: 'Export selected markers' })
      await expect(exportButton).toBeEnabled()

      // Intercept the download triggered by the export.
      const [download] = await Promise.all([
         page.waitForEvent('download'),
         exportButton.click(),
      ])

      expect(download.suggestedFilename()).toBe('markers.json')

      const downloadPath = path.join(test.info().outputDir, download.suggestedFilename())
      await download.saveAs(downloadPath)

      const fileContent = await fs.readFile(downloadPath, 'utf-8')
      const markers = JSON.parse(fileContent)

      expect(Array.isArray(markers)).toBe(true)
      expect(markers.length).toBe(2)

      for (const marker of markers) {
         expect(marker).toHaveProperty('name')
         expect(marker).toHaveProperty('address')
         expect(marker).toHaveProperty('latitude')
         expect(marker).toHaveProperty('longitude')
         expect(marker).toHaveProperty('color')
         // Internal fields must not be exported.
         expect(marker).not.toHaveProperty('id')
         expect(marker).not.toHaveProperty('isPuck')
         expect(marker).not.toHaveProperty('selection')
         expect(marker).not.toHaveProperty('actions')
         expect(marker).not.toHaveProperty('showTitleOnMap')
      }

      const names = markers.map((m: { name: string }) => m.name)
      expect(names).toContain('Paris')
      expect(names).toContain('London')
   })

   test('exports only selected markers, not all markers', async ({ page }) => {
      await page.goto('/')

      await page.getByRole('button', { name: 'Open Markers' }).click()
      await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()

      // Create two markers.
      await page.getByRole('button', { name: /Create new marker/i }).first().click()
      const firstTitle = page.getByRole('textbox', { name: 'Enter marker title' }).last()
      await firstTitle.fill('Berlin')

      await page.getByRole('button', { name: /Create new marker/i }).first().click()
      const secondTitle = page.getByRole('textbox', { name: 'Enter marker title' }).last()
      await secondTitle.fill('Rome')

      // Select only the first marker.
      const checkboxes = page.locator('table').getByRole('checkbox')
      await checkboxes.first().click()

      const exportButton = page.getByRole('button', { name: 'Export selected markers' })
      await expect(exportButton).toBeEnabled()

      const [download] = await Promise.all([
         page.waitForEvent('download'),
         exportButton.click(),
      ])

      const downloadPath = path.join(test.info().outputDir, download.suggestedFilename())
      await download.saveAs(downloadPath)

      const fileContent = await fs.readFile(downloadPath, 'utf-8')
      const markers = JSON.parse(fileContent)

      expect(markers.length).toBe(1)
      expect(markers[0].name).toBe('Berlin')
   })
})
