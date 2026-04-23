import { expect, Page, test } from '@playwright/test'
import { readSceneDebug } from '@/tests/e2e/utils/readSceneDebug'
import { moveCameraToPlaneScene } from '@/tests/e2e/utils/moveCameraToPlaneScene'

// TODO : put in constants/numbers
const EARTH_RADIUS = 6_371_008
const SPHERICAL_SCENE_TYPE = 0
const PLANE_SCENE_TYPE = 1
const MIN_COUNTRY_NAME_CLEARANCE = 20_000
const MIN_TEXT_SIZE_RATIO = 0.5
const MAX_TEXT_SIZE_RATIO = 1
const GLOBE_MIN_MARKER_TITLE_SCALE_DAMPING = 0.35
const PLANE_MIN_MARKER_TITLE_SCALE_DAMPING = 0.2
const MAX_MARKER_TITLE_SCALE_DAMPING = 1
const MAX_MARKER_TITLE_GAP = 2_000

const findLowestPlaneMarkerTitleScaleDamping = async (page: Page): Promise<number> => {
   let lowestPlaneDamping = Number.POSITIVE_INFINITY

   const sampleCurrentDamping = async (): Promise<void> => {
      const debug = await readSceneDebug(page)

      if (debug.markerTitleSceneType !== PLANE_SCENE_TYPE) {
         return
      }

      if (typeof debug.markerTitleScaleDamping !== 'number') {
         return
      }

      lowestPlaneDamping = Math.min(
         lowestPlaneDamping,
         debug.markerTitleScaleDamping,
      )
   }

   await sampleCurrentDamping()

   for (const wheelDeltaY of [-1600, 1600]) {
      for (let attempt = 0; attempt < 80; attempt++) {
         await page.mouse.wheel(0, wheelDeltaY)
         await page.waitForTimeout(30)
         await sampleCurrentDamping()

         if (lowestPlaneDamping <= PLANE_MIN_MARKER_TITLE_SCALE_DAMPING + 0.03) {
            return lowestPlaneDamping
         }
      }
   }

   return lowestPlaneDamping
}

test.describe('3D scene objects', () => {
   test('renders countries names and keeps them lifted above planet surface', async ({ page }) => {
   test.setTimeout(60_000)

      await page.goto('/')

   const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
   await expect(openSettingsButton).toBeVisible({ timeout: 60_000 })
   await openSettingsButton.click({ force: true })
      await expect(page.getByRole('heading', { name: '⚙️ Settings' })).toBeVisible()

      await page.getByRole('button', { name: 'Countries' }).click()

      const countriesNamesToggle = page
         .locator('.switch-holder', { hasText: 'Activate countries names on Map' })
         .locator('input[type="checkbox"]')
         .first()

      await expect(countriesNamesToggle).toBeVisible()

      if (!(await countriesNamesToggle.isChecked())) {
         await countriesNamesToggle.click({ force: true })
      }

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.countryNamesCount ?? 0
      }).toBeGreaterThan(0)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.countryNamesMinDistanceFromCenter ?? 0
      }).toBeGreaterThan(EARTH_RADIUS + MIN_COUNTRY_NAME_CLEARANCE)
   })

   test('renders marker titles with country-sized LOD and keeps them above marker geometry', async ({ page }) => {
      test.setTimeout(90_000)

      await page.context().grantPermissions(['geolocation'])
      await page.context().setGeolocation({ latitude: 48.8566, longitude: 2.3522 })

      await page.goto('/')

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible({ timeout: 60_000 })
      await openSettingsButton.click({ force: true })
      await expect(page.getByRole('heading', { name: '⚙️ Settings' })).toBeVisible()

      await page.getByRole('button', { name: 'Countries' }).click()

      const countriesNamesToggle = page
         .locator('.switch-holder', { hasText: 'Activate countries names on Map' })
         .locator('input[type="checkbox"]')
         .first()

      await expect(countriesNamesToggle).toBeVisible()

      if (!(await countriesNamesToggle.isChecked())) {
         await countriesNamesToggle.click({ force: true })
      }

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.countryNamesCount ?? 0
      }).toBeGreaterThan(0)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.countryNamesMinVisualSize ?? 0
      }).toBeGreaterThan(0)

      await page.getByRole('button', { name: 'Close' }).first().click()

      await page.getByRole('button', { name: 'Open Markers' }).click()
      await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()

      const puckTitleInput = page
         .locator('input[aria-label="Enter marker title"][value="Your position"]')
         .first()
      await expect(puckTitleInput).toBeVisible({ timeout: 15000 })

      const puckMarkerRow = page.locator('tr', { has: puckTitleInput }).first()
      const markerTitleToggleAction = puckMarkerRow.getByRole('button', { name: 'Toggle marker title on map' })
      await expect(markerTitleToggleAction).toHaveAttribute('data-title-visible', 'true')

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.markerTitlesCount ?? 0
      }).toBeGreaterThan(0)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         const markerVisualSize = debug.markerTitleMinVisualSize ?? 0
         const countryVisualSize = debug.countryNamesMinVisualSize ?? 0

         if (countryVisualSize <= 0) {
            return 0
         }

         return markerVisualSize / countryVisualSize
      }).toBeGreaterThan(MIN_TEXT_SIZE_RATIO)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         const markerVisualSize = debug.markerTitleMinVisualSize ?? 0
         const countryVisualSize = debug.countryNamesMinVisualSize ?? 0

         if (countryVisualSize <= 0) {
            return Number.POSITIVE_INFINITY
         }

         return markerVisualSize / countryVisualSize
      }).toBeLessThanOrEqual(MAX_TEXT_SIZE_RATIO)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.markerTitleMinClearanceFromMarkerTop ?? 0
      }).toBeGreaterThan(0)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.markerTitleMinClearanceFromMarkerTop ?? Number.POSITIVE_INFINITY
      }).toBeLessThan(MAX_MARKER_TITLE_GAP)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         const markerTitleScaleDamping = debug.markerTitleScaleDamping ?? 0
         const expectedMinScaleDamping = debug.markerTitleSceneType === PLANE_SCENE_TYPE
            ? PLANE_MIN_MARKER_TITLE_SCALE_DAMPING
            : GLOBE_MIN_MARKER_TITLE_SCALE_DAMPING

         return markerTitleScaleDamping - expectedMinScaleDamping
      }).toBeGreaterThanOrEqual(0)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.markerTitleScaleDamping ?? Number.POSITIVE_INFINITY
      }).toBeLessThanOrEqual(MAX_MARKER_TITLE_SCALE_DAMPING)
   })

   test('uses a smaller marker title min scale when camera is close in plane scene', async ({ page }) => {
      test.setTimeout(120_000)

      await page.context().grantPermissions(['geolocation'])
      await page.context().setGeolocation({ latitude: 48.8566, longitude: 2.3522 })

      await page.goto('/')

      await page.getByRole('button', { name: 'Open Markers' }).click()
      await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()

      const puckTitleInput = page
         .locator('input[aria-label="Enter marker title"][value="Your position"]')
         .first()
      await expect(puckTitleInput).toBeVisible({ timeout: 15000 })

      const puckMarkerRow = page.locator('tr', { has: puckTitleInput }).first()
      const markerTitleToggleAction = puckMarkerRow.getByRole('button', { name: 'Toggle marker title on map' })
      await expect(markerTitleToggleAction).toHaveAttribute('data-title-visible', 'true')

      await page.getByRole('button', { name: 'Close' }).first().click()

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.markerTitlesCount ?? 0
      }).toBeGreaterThan(0)

      await moveCameraToPlaneScene(page)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.markerTitleSceneType ?? Number.NaN
      }).toBe(PLANE_SCENE_TYPE)

      const lowestPlaneDamping = await findLowestPlaneMarkerTitleScaleDamping(page)

      expect(lowestPlaneDamping).toBeLessThanOrEqual(PLANE_MIN_MARKER_TITLE_SCALE_DAMPING + 0.03)
      expect(lowestPlaneDamping).toBeLessThan(GLOBE_MIN_MARKER_TITLE_SCALE_DAMPING)
   })
})
