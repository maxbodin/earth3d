import { expect, test } from '@playwright/test'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'


const writeFixture = async (data: unknown, filename: string): Promise<string> => {
   const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'marker-import-'))
   const filePath = path.join(dir, filename)
   await fs.writeFile(filePath, typeof data === 'string' ? data : JSON.stringify(data, null, 2))
   return filePath
}

const VALID_MARKERS = [
   { name: 'Paris', address: '75001 Paris, France', latitude: 48.8566, longitude: 2.3522, color: '#FF0000' },
   { name: 'London', address: 'London, UK', latitude: 51.5074, longitude: -0.1278, color: '#00FF00' },
]

const openMarkersDashboard = async (page: import('@playwright/test').Page): Promise<void> => {
   await page.goto('/')
   await page.getByRole('button', { name: 'Open Markers' }).click()
   await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()
}

test.describe('Marker import', () => {
   test('imports markers via file picker button', async ({ page }) => {
      const fixturePath = await writeFixture(VALID_MARKERS, 'markers.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('Markers imported successfully.')

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(2)

      await expect(markerTitles.first()).toHaveValue('Paris')
      await expect(markerTitles.last()).toHaveValue('London')
   })

   test('imports markers via drag and drop', async ({ page }) => {
      const fixturePath = await writeFixture(VALID_MARKERS, 'markers.json')

      await openMarkersDashboard(page)

      const dropZone = page.getByTestId('marker-drop-zone')

      const dataTransfer = await page.evaluateHandle(
         (content: string) => {
            const dt = new DataTransfer()
            const file = new File([content], 'markers.json', { type: 'application/json' })
            dt.items.add(file)
            return dt
         },
         JSON.stringify(VALID_MARKERS),
      )

      await dropZone.dispatchEvent('drop', { dataTransfer })

      await expect(page.getByRole('status')).toContainText('Markers imported successfully.')

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(2)
   })

   test('shows error for invalid JSON content', async ({ page }) => {
      const fixturePath = await writeFixture('not valid json {{{', 'bad.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('File content is not valid JSON.')
   })

   test('shows error for non-array JSON', async ({ page }) => {
      const fixturePath = await writeFixture({ name: 'not an array' }, 'object.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('JSON must be an array of markers.')
   })

   test('shows error for empty array', async ({ page }) => {
      const fixturePath = await writeFixture([], 'empty.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('JSON array is empty.')
   })

   test('shows error for marker with invalid latitude', async ({ page }) => {
      const invalid = [{ name: 'Bad', latitude: 999, longitude: 0 }]
      const fixturePath = await writeFixture(invalid, 'invalid-lat.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('"latitude" must be a number between -90 and 90')
   })

   test('shows error for marker with missing name', async ({ page }) => {
      const invalid = [{ latitude: 48.8, longitude: 2.3 }]
      const fixturePath = await writeFixture(invalid, 'no-name.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('"name" must be a string')
   })

   test('shows error for marker with invalid color format', async ({ page }) => {
      const invalid = [{ name: 'Test', latitude: 48.8, longitude: 2.3, color: 'not-a-color' }]
      const fixturePath = await writeFixture(invalid, 'bad-color.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('"color" must be a hex color')
   })

   test('appends imported markers to existing markers', async ({ page }) => {
      await openMarkersDashboard(page)

      // Create an existing marker first.
      await page.getByRole('button', { name: /Create new marker/i }).first().click()
      const existingTitle = page.getByRole('textbox', { name: 'Enter marker title' }).last()
      await existingTitle.fill('Existing')

      const fixturePath = await writeFixture(
         [{ name: 'Imported', address: '', latitude: 40.7128, longitude: -74.006, color: '#AABBCC' }],
         'single.json',
      )

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('Markers imported successfully.')

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(2)

      await expect(markerTitles.first()).toHaveValue('Existing')
      await expect(markerTitles.last()).toHaveValue('Imported')
   })

   test('ignores extra unknown fields in imported markers', async ({ page }) => {
      const markersWithExtra = [{
         name: 'Secure',
         address: 'Somewhere',
         latitude: 10,
         longitude: 20,
         color: '#112233',
         __proto__: { admin: true },
         constructor: 'evil',
         dangerousField: '<script>alert(1)</script>',
      }]
      const fixturePath = await writeFixture(markersWithExtra, 'extra-fields.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('Markers imported successfully.')

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(1)
      await expect(markerTitles.first()).toHaveValue('Secure')
   })

   test('imports markers with 0x color format and normalizes to # format', async ({ page }) => {
      const markersWithMixedColors = [
         { name: 'HexHash', address: '', latitude: 10, longitude: 20, color: '#aabbcc' },
         { name: 'Hex0x', address: '', latitude: 30, longitude: 40, color: '0xff0000' },
      ]
      const fixturePath = await writeFixture(markersWithMixedColors, 'mixed-colors.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('Markers imported successfully.')

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(2)
   })

   test('imports the full exported marker set with mixed color formats', async ({ page }) => {
      const exportedMarkers = [
         { name: 'Your position', address: 'Bâtiment Q, Nantes, France', latitude: 47.278771244622504, longitude: -1.5182311193522726, color: '0xff0000' },
         { name: '', address: '', latitude: 0, longitude: 0, color: '#c8dde0' },
         { name: 'scqc', address: 'Goundam, TT, Mali', latitude: 18.608571, longitude: -5.005895, color: '#c0e3cc' },
         { name: 'qscqscqs', address: 'Askinskiy, BK, Russia', latitude: 56.119731, longitude: 56.768858, color: '#e6cfb9' },
         { name: 'scqsc', address: '', latitude: 0, longitude: 0, color: '#cbcfc2' },
         { name: '', address: '', latitude: 0, longitude: 0, color: '#c8dde0' },
         { name: 'scqc', address: 'Goundam, TT, Mali', latitude: 18.608571, longitude: -5.005895, color: '#c0e3cc' },
         { name: 'qscqscqs', address: 'Askinskiy, BK, Russia', latitude: 56.119731, longitude: 56.768858, color: '#e6cfb9' },
         { name: 'scqsc', address: '', latitude: 0, longitude: 0, color: '#cbcfc2' },
      ]
      const fixturePath = await writeFixture(exportedMarkers, 'full-export.json')

      await openMarkersDashboard(page)

      const fileInput = page.locator('input[type="file"][accept=".json,application/json"]')
      await fileInput.setInputFiles(fixturePath)

      await expect(page.getByRole('status')).toContainText('Markers imported successfully.')

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(9)
   })
})
