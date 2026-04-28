import { expect, test } from '@playwright/test'
import {
   STORAGE_KEY_AIRPORTS_ACTIVATED,
   STORAGE_KEY_OUTER_SPACE_CONSTELLATION_BOUNDS,
   STORAGE_KEY_OUTER_SPACE_CONSTELLATION_FIGURES,
   STORAGE_KEY_OUTER_SPACE_HYPTIC,
} from '@/app/constants/storageKeys'
import { openSettingsTab } from '@/tests/e2e/utils/openSettingsTab'

const TAB_AIRPORTS = 'Airports'
const TAB_OUTER_SPACE = 'Outer Space'

test.describe('Airports settings toggle', () => {
   test('toggling airports off writes false to localStorage', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_AIRPORTS)

      const airportsSwitch = page.locator('input[type="checkbox"]').first()
      await expect(airportsSwitch).toBeVisible()
      await expect(airportsSwitch).toBeChecked()

      await airportsSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_AIRPORTS_ACTIVATED,
      )
      expect(storedValue).toBe('false')
   })

   test('airports setting persists as disabled on reload', async ({ page }) => {
      await page.goto('/')

      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(false)),
         STORAGE_KEY_AIRPORTS_ACTIVATED,
      )

      await page.reload()
      await openSettingsTab(page, TAB_AIRPORTS)

      const airportsSwitch = page.locator('input[type="checkbox"]').first()
      await expect(airportsSwitch).toBeVisible()
      await expect(airportsSwitch).not.toBeChecked()
   })
})

test.describe('Outer Space constellation settings toggle', () => {
   test('toggling constellation bounds on writes true to localStorage', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_OUTER_SPACE)

      const switches = page.locator('input[type="checkbox"]')
      const boundsSwitch = switches.nth(0)
      await expect(boundsSwitch).toBeVisible()
      await expect(boundsSwitch).not.toBeChecked()

      await boundsSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_OUTER_SPACE_CONSTELLATION_BOUNDS,
      )
      expect(storedValue).toBe('true')
   })

   test('toggling constellation figures on writes true to localStorage', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_OUTER_SPACE)

      const figuresSwitch = page.locator('input[type="checkbox"]').nth(1)
      await expect(figuresSwitch).toBeVisible()
      await expect(figuresSwitch).not.toBeChecked()

      await figuresSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_OUTER_SPACE_CONSTELLATION_FIGURES,
      )
      expect(storedValue).toBe('true')
   })

   test('toggling hyptic off writes false to localStorage', async ({ page }) => {
      await page.goto('/')
      await openSettingsTab(page, TAB_OUTER_SPACE)

      const hypticSwitch = page.locator('input[type="checkbox"]').nth(2)
      await expect(hypticSwitch).toBeVisible()
      await expect(hypticSwitch).toBeChecked()

      await hypticSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_OUTER_SPACE_HYPTIC,
      )
      expect(storedValue).toBe('false')
   })

   test('outer space settings persist on reload', async ({ page }) => {
      await page.goto('/')

      await page.evaluate(
         ({ bounds, figures, hyptic }) => {
            localStorage.setItem(bounds, JSON.stringify(true))
            localStorage.setItem(figures, JSON.stringify(true))
            localStorage.setItem(hyptic, JSON.stringify(false))
         },
         {
            bounds: STORAGE_KEY_OUTER_SPACE_CONSTELLATION_BOUNDS,
            figures: STORAGE_KEY_OUTER_SPACE_CONSTELLATION_FIGURES,
            hyptic: STORAGE_KEY_OUTER_SPACE_HYPTIC,
         },
      )

      await page.reload()
      await openSettingsTab(page, TAB_OUTER_SPACE)

      const switches = page.locator('input[type="checkbox"]')
      await expect(switches.nth(0)).toBeChecked()
      await expect(switches.nth(1)).toBeChecked()
      await expect(switches.nth(2)).not.toBeChecked()
   })
})
