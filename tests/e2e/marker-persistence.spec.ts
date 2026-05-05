import { expect, test } from '@playwright/test'
import { STORAGE_KEY_MARKERS } from '@/app/constants/storageKeys'
import { Marker } from '@/app/types/marker'

const stubMarker: Marker = {
   id: 'test-marker-1',
   name: 'Eiffel Tower',
   showTitleOnMap: true,
   address: 'Paris, France',
   latitude: 48.8584,
   longitude: 2.2945,
   color: '#ff0000',
   isPuck: false,
}

test.describe('Marker localStorage persistence', () => {
   test('persists markers to localStorage after creation', async ({ page }) => {
      await page.goto('/')

      const randomPlaceButton = page.getByRole('button', { name: 'Random Place' })
      await expect(randomPlaceButton).toBeVisible()
      await randomPlaceButton.click()
      await expect(randomPlaceButton).toBeEnabled({ timeout: 15_000 })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_MARKERS,
      )

      expect(storedValue).not.toBeNull()
      const markers: Marker[] = JSON.parse(storedValue!)
      expect(markers.length).toBe(1)
      expect(markers[0].latitude).toBeDefined()
      expect(markers[0].longitude).toBeDefined()
   })

   test('restores markers from localStorage on page reload', async ({ page }) => {
      await page.goto('/')

      await page.evaluate(
         ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
         { key: STORAGE_KEY_MARKERS, value: [stubMarker] },
      )

      await page.reload()

      const openMarkersButton = page.getByRole('button', { name: 'Open Markers' })
      await expect(openMarkersButton).toBeVisible()
      await openMarkersButton.click()

      const markersHeading = page.getByRole('heading', { name: /Manage and create markers/i })
      await expect(markersHeading).toBeVisible()

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(1, { timeout: 10_000 })

      await expect(markerTitles.first()).toHaveValue(stubMarker.name)
   })

   test('persists multiple markers and restores all on reload', async ({ page }) => {
      const secondMarker: Marker = {
         ...stubMarker,
         id: 'test-marker-2',
         name: 'Big Ben',
         address: 'London, UK',
         latitude: 51.5007,
         longitude: -0.1246,
         color: '#00ff00',
      }

      await page.goto('/')

      await page.evaluate(
         ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
         { key: STORAGE_KEY_MARKERS, value: [stubMarker, secondMarker] },
      )

      await page.reload()

      const openMarkersButton = page.getByRole('button', { name: 'Open Markers' })
      await expect(openMarkersButton).toBeVisible()
      await openMarkersButton.click()

      const markersHeading = page.getByRole('heading', { name: /Manage and create markers/i })
      await expect(markersHeading).toBeVisible()

      const markerTitles = page.getByRole('textbox', { name: 'Enter marker title' })
      await expect(markerTitles).toHaveCount(2, { timeout: 10_000 })
   })
})
