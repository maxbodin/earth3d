import { expect, Page, test } from '@playwright/test'
import { STORAGE_KEY_CIRCLE_MARKERS } from '@/app/constants/storageKeys'
import { SceneType } from '@/app/enums/sceneType'
import { CircleMarker } from '@/app/types/circleMarker'
import { CIRCLE_GEOMETRY_SEGMENTS } from '@/app/constants/numbers'
import { readSceneDebug } from '@/tests/e2e/utils/readSceneDebug'

const seededCircleMarker: CircleMarker = {
   id: 'test-circle-marker',
   name: 'Coverage zone',
   latitude: 48.8566,
   longitude: 2.3522,
   radiusKm: 640,
   color: '#4ade80',
   showTitleOnMap: false,
   address: '',
   isPuck: false,
}

const seedCircleMarkers = async (page: Page, circleMarkers: CircleMarker[]): Promise<void> => {
   await page.addInitScript(({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value))
   }, { key: STORAGE_KEY_CIRCLE_MARKERS, value: circleMarkers })
}

const expectCircleDebug = async (
   page: Page,
   sceneType: SceneType,
   expectedRadiusKm: number,
): Promise<void> => {
   await expect.poll(async () => {
      const debug = await readSceneDebug(page)
      return debug.circleMarkersCount
   }, { timeout: 15_000 }).toBe(1)

   await expect.poll(async () => {
      const debug = await readSceneDebug(page)
      return debug.circleMarkerSceneType
   }, { timeout: 15_000 }).toBe(sceneType)

   await expect.poll(async () => {
      const debug = await readSceneDebug(page)
      return debug.circleMarkerMinRadiusKm
   }, { timeout: 15_000 }).toBe(expectedRadiusKm)

   await expect.poll(async () => {
      const debug = await readSceneDebug(page)
      return debug.circleMarkerLinePointCounts?.[0]
   }, { timeout: 15_000 }).toBe(CIRCLE_GEOMETRY_SEGMENTS + 1)
}

test.describe('Circle markers', () => {
   test('creates a circle marker from the dashboard and updates radius in real time', async ({ page }) => {
      await page.goto('/?mode=sphere')

      await page.getByRole('button', { name: 'Open Markers' }).click()
      await expect(page.getByRole('heading', { name: /Manage and create markers/i })).toBeVisible()

      const circleMarkersTable = page.getByTestId('circle-markers-table')
      const markerTable = page.getByRole('table', { name: 'Table of your markers' })
      await expect(markerTable).toBeVisible()
      await expect(circleMarkersTable).toBeVisible()

      await page.getByRole('button', { name: 'Create new circle marker' }).last().click()

      await expect(page.getByLabel('Enter circle title')).toBeVisible()
      await expect(page.getByLabel('Enter circle center latitude')).toHaveValue('0')
      await expect(page.getByLabel('Enter circle center longitude')).toHaveValue('0')

      const radiusInput = page.getByLabel('Enter circle radius in kilometers')
      await expect(radiusInput).toHaveValue('500')

      await radiusInput.fill('750')

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.circleMarkerMinRadiusKm
      }, { timeout: 15_000 }).toBe(750)

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.circleDiameterLabelTexts?.includes('Diameter: 1500.0 km')
      }, { timeout: 15_000 }).toBe(true)

      const radiusSlider = page.getByLabel('Drag circle radius')
      await radiusSlider.evaluate((slider, value) => {
         const input = slider as HTMLInputElement
         input.value = value
         input.dispatchEvent(new Event('input', { bubbles: true }))
         input.dispatchEvent(new Event('change', { bubbles: true }))
      }, '1200')

      await expect.poll(async () => {
         const debug = await readSceneDebug(page)
         return debug.circleMarkerMinRadiusKm
      }, { timeout: 15_000 }).toBe(1200)
   })

   test('renders stable circle geometry in sphere mode', async ({ page }) => {
      await seedCircleMarkers(page, [seededCircleMarker])
      await page.goto('/?mode=sphere')

      await expectCircleDebug(page, SceneType.SPHERICAL, seededCircleMarker.radiusKm)
   })

   test('renders stable circle geometry in planisphere mode', async ({ page }) => {
      await seedCircleMarkers(page, [seededCircleMarker])
      await page.goto('/?mode=planisphere')

      await expectCircleDebug(page, SceneType.PLANE, seededCircleMarker.radiusKm)
   })
})