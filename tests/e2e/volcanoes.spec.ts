import { expect, test } from '@playwright/test'
import {
   STORAGE_KEY_VOLCANOES_ACTIVATED,
   STORAGE_KEY_VOLCANOES_HEATMAP,
} from '@/app/constants/storageKeys'
import { openSettingsTab } from '@/tests/e2e/utils/openSettingsTab'
import { mockVolcanoRoute } from '@/tests/e2e/mocks/routes/mockVolcanoRoute'

// TODO : Refactor in constants.
const TAB_VOLCANOES = 'Volcanoes'

test.describe('Volcanoes settings tab', () => {
   test('volcanoes tab is visible in settings', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_VOLCANOES)

      const activateSwitch = page.locator('input[type="checkbox"]').first()
      await expect(activateSwitch).toBeVisible()
   })

   test('toggling volcanoes on writes true to localStorage', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_VOLCANOES)

      const volcanoSwitch = page.locator('input[type="checkbox"]').first()
      await expect(volcanoSwitch).toBeVisible()

      await expect(volcanoSwitch).not.toBeChecked()
      await volcanoSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )
      expect(storedValue).toBe('true')
   })

   test('volcano setting persists as enabled on reload', async ({ page }) => {
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_VOLCANOES)

      const volcanoSwitch = page.locator('input[type="checkbox"]').first()
      await expect(volcanoSwitch).toBeVisible()
      await expect(volcanoSwitch).toBeChecked()
   })

   test('stats and year range slider are visible when volcanoes activated', async ({ page }) => {
      await mockVolcanoRoute(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_VOLCANOES)

      await expect(page.getByText('Volcanoes loaded:')).toBeVisible()
      await expect(page.getByText('Eruption Year Range')).toBeVisible()
   })

   test('volcano table renders when data is loaded', async ({ page }) => {
      await mockVolcanoRoute(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_VOLCANOES)

      const volcanoTable = page.locator('table[aria-label="Table of loaded volcanoes"]')
      await expect(volcanoTable).toBeVisible()

      await expect(volcanoTable.getByText('Name')).toBeVisible()
      await expect(volcanoTable.getByText('Country')).toBeVisible()
      await expect(volcanoTable.getByText('Elev. (m)')).toBeVisible()
      await expect(volcanoTable.getByText('Last Eruption')).toBeVisible()
   })

   test('eruption table renders when data is loaded', async ({ page }) => {
      await mockVolcanoRoute(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_VOLCANOES)

      const eruptionTable = page.locator('table[aria-label="Table of volcanic eruptions"]')
      await expect(eruptionTable).toBeVisible()

      await expect(eruptionTable.getByText('Volcano')).toBeVisible()
      await expect(eruptionTable.getByText('Year')).toBeVisible()
      await expect(eruptionTable.getByText('VEI')).toBeVisible()
      await expect(eruptionTable.getByText('Deaths')).toBeVisible()
   })

   test('volcano table search filters results', async ({ page }) => {
      await mockVolcanoRoute(page, { volcanoCount: 5 })
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_VOLCANOES)

      const searchInput = page.locator('input[placeholder="Search by name, type, or country..."]')
      await expect(searchInput).toBeVisible()

      await searchInput.fill('Japan')

      const volcanoTable = page.locator('table[aria-label="Table of loaded volcanoes"]')
      const rows = volcanoTable.locator('tbody tr').filter({ hasText: 'TestVolcano' })
      const rowCount = await rows.count()
      expect(rowCount).toBeGreaterThan(0)
      expect(rowCount).toBeLessThan(5)
   })

   test('heatmap toggle writes to localStorage', async ({ page }) => {
      await mockVolcanoRoute(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_VOLCANOES)

      const heatmapSwitch = page.getByText('Show Eruptions Heatmap').locator('..').locator('input[type="checkbox"]')
      await expect(heatmapSwitch).toBeVisible()
      await heatmapSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_VOLCANOES_HEATMAP,
      )
      expect(storedValue).toBe('true')
   })

   test('volcano table has focus button for each row', async ({ page }) => {
      await mockVolcanoRoute(page)
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_VOLCANOES)

      const volcanoTable = page.locator('table[aria-label="Table of loaded volcanoes"]')
      const focusButtons = volcanoTable.getByRole('button', { name: /Focus on/ })
      const count = await focusButtons.count()
      expect(count).toBeGreaterThan(0)
   })
})

test.describe('Volcanoes API route', () => {
   test('volcano data is fetched when activated', async ({ page }) => {
      let apiCalled = false

      await mockVolcanoRoute(page, {
         onRequest: () => { apiCalled = true },
      })

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_VOLCANOES_ACTIVATED,
      )

      await page.goto('/')
      await page.waitForTimeout(2000)

      expect(apiCalled).toBe(true)
   })
})
