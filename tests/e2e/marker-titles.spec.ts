import { expect, Page, test } from '@playwright/test'

type ThreeSceneDebugSnapshot = {
   markerTitleTexts?: string[]
   markerTitleMinVisualSize?: number | null
}

const getMarkerTitlesDebug = async (page: Page): Promise<ThreeSceneDebugSnapshot> => {
   return page.evaluate(() => {
      return (window as Window & {
         __THREE_SCENE_DEBUG__?: ThreeSceneDebugSnapshot
      }).__THREE_SCENE_DEBUG__ ?? {}
   })
}

const getMarkerTitleTexts = async (page: Page): Promise<string[]> => {
   const debug = await getMarkerTitlesDebug(page)
   return debug.markerTitleTexts ?? []
}

test.describe('Marker titles', () => {
   test('allows setting marker title visibility on the map and reflects it in 3D', async ({ page }) => {
      await page.goto('/')

      await page.getByRole('button', { name: 'Open Markers' }).click()
      await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()

      await page.getByRole('button', { name: /Create new marker/i }).first().click()

      const markerTitleInput = page.getByRole('textbox', { name: 'Enter marker title' }).last()
      await markerTitleInput.fill('Observation Point')

      const globalTitlesToggle = page
         .getByTestId('global-marker-titles-toggle')
         .locator('input[type="checkbox"]')
         .first()

      await expect(page.getByText('Marker titles are visible on map.')).toHaveCount(0)
      await expect(globalTitlesToggle).toBeChecked()

      const markerTitleToggleAction = page.getByRole('button', { name: 'Toggle marker title on map' }).last()
      await expect(markerTitleToggleAction).toHaveAttribute('data-title-visible', 'true')
      await expect.poll(async () => {
         const titles = await getMarkerTitleTexts(page)
         return titles.includes('Observation Point')
      }).toBe(true)
      await expect.poll(async () => {
         const debug = await getMarkerTitlesDebug(page)
         return debug.markerTitleMinVisualSize ?? 0
      }).toBeGreaterThan(1000)

      await markerTitleToggleAction.click({ force: true })
      await expect(markerTitleToggleAction).toHaveAttribute('data-title-visible', 'false')
      await expect.poll(async () => {
         const titles = await getMarkerTitleTexts(page)
         return titles.includes('Observation Point')
      }).toBe(false)

      await markerTitleToggleAction.click({ force: true })
      await expect(markerTitleToggleAction).toHaveAttribute('data-title-visible', 'true')
      await expect.poll(async () => {
         const titles = await getMarkerTitleTexts(page)
         return titles.includes('Observation Point')
      }).toBe(true)

      await globalTitlesToggle.click({ force: true })
      await expect(globalTitlesToggle).not.toBeChecked()
      await expect(markerTitleToggleAction).toHaveAttribute('data-title-visible', 'true')
      await expect.poll(async () => {
         const titles = await getMarkerTitleTexts(page)
         return titles.includes('Observation Point')
      }).toBe(false)

      await globalTitlesToggle.click({ force: true })
      await expect(globalTitlesToggle).toBeChecked()
      await expect.poll(async () => {
         const titles = await getMarkerTitleTexts(page)
         return titles.includes('Observation Point')
      }).toBe(true)
   })

   test('allows toggling user position marker title and reflects it in 3D', async ({ page }) => {
      await page.context().grantPermissions(['geolocation'])
      await page.context().setGeolocation({ latitude: 48.8566, longitude: 2.3522 })

      await page.goto('/')

      await page.getByRole('button', { name: 'Open Markers' }).click()
      await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()

      const puckTitleInput = page
         .locator('input[aria-label="Enter marker title"][value="Your position"]')
         .first()
      await expect(puckTitleInput).toBeVisible({ timeout: 15000 })

      const puckRow = page.locator('tr', { has: puckTitleInput }).first()
      const puckTitleToggleAction = puckRow.getByRole('button', { name: 'Toggle marker title on map' })

      await expect(puckTitleToggleAction).toHaveAttribute('data-title-visible', 'true')
      await expect.poll(async () => {
         const titles = await getMarkerTitleTexts(page)
         return titles.includes('Your position')
      }).toBe(true)
      await expect.poll(async () => {
         const debug = await getMarkerTitlesDebug(page)
         return debug.markerTitleMinVisualSize ?? 0
      }).toBeGreaterThan(1000)

      await puckTitleToggleAction.click({ force: true })
      await expect(puckTitleToggleAction).toHaveAttribute('data-title-visible', 'false')
      await expect.poll(async () => {
         const titles = await getMarkerTitleTexts(page)
         return titles.includes('Your position')
      }).toBe(false)

      await puckTitleToggleAction.click({ force: true })
      await expect(puckTitleToggleAction).toHaveAttribute('data-title-visible', 'true')
      await expect.poll(async () => {
         const titles = await getMarkerTitleTexts(page)
         return titles.includes('Your position')
      }).toBe(true)
   })
})
