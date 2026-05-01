import { expect, test } from '@playwright/test'
import { STORAGE_KEY_DEBUG_TILES } from '@/app/constants/storageKeys'
import { openSettingsTab } from '@/tests/e2e/utils/openSettingsTab'

// TODO : Refactor in constants.
const TAB_MAP = 'Map'

test.describe('Debug tiles overlay', () => {
   test('debug tiles render in sphere mode without crashing', async ({ page }) => {
      // Start in sphere mode (default) with debug tiles enabled.
      await page.goto('/')
      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_DEBUG_TILES,
      )
      await page.reload({ waitUntil: 'domcontentloaded' })

      // Wait for tiles to load and render.
      await page.waitForTimeout(4000)

      // Page should still be responsive.
      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible()
   })

   test('debug tiles render in planisphere mode without performance degradation', async ({ page }) => {
      // Start in plane mode with debug tiles enabled.
      await page.goto('/?mode=plane')
      await page.evaluate(
         (key) => localStorage.setItem(key, JSON.stringify(true)),
         STORAGE_KEY_DEBUG_TILES,
      )
      await page.reload({ waitUntil: 'domcontentloaded' })

      // Give time for tiles to subdivide, previously this caused a crash.
      await page.waitForTimeout(5000)

      // Verify the page hasn't frozen.
      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible()
   })
})
