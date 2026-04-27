import { expect, test } from '@playwright/test'
import {
   STORAGE_KEY_MAP_STYLE,
   STORAGE_KEY_PLANES_ACTIVATED,
} from '@/app/constants/storageKeys'

test.describe('Settings localStorage persistence', () => {
   test('persists planes setting to localStorage after toggle', async ({ page }) => {
      await page.goto('/')

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible()
      await openSettingsButton.click()

      const settingsTitle = page.getByRole('heading', { name: '⚙️ Settings' })
      await expect(settingsTitle).toBeVisible()

      const planesSwitch = page.locator('input[type="checkbox"]').first()
      await expect(planesSwitch).toBeVisible()

      const wasChecked = await planesSwitch.isChecked()
      await planesSwitch.click({ force: true })

      const storedValue = await page.evaluate(
         (key) => localStorage.getItem(key),
         STORAGE_KEY_PLANES_ACTIVATED,
      )

      expect(storedValue).toBe(JSON.stringify(!wasChecked))
   })

   test('restores settings from localStorage on page reload', async ({ page }) => {
      await page.goto('/')

      await page.evaluate(
         ({ key }) => localStorage.setItem(key, JSON.stringify(false)),
         { key: STORAGE_KEY_PLANES_ACTIVATED },
      )

      await page.reload()

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible()
      await openSettingsButton.click()

      const settingsTitle = page.getByRole('heading', { name: '⚙️ Settings' })
      await expect(settingsTitle).toBeVisible()

      const planesSwitch = page.locator('input[type="checkbox"]').first()
      await expect(planesSwitch).toBeVisible()
      await expect(planesSwitch).not.toBeChecked()
   })

   test('localStorage keys are written with correct namespace', async ({ page }) => {
      await page.goto('/')

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible()
      await openSettingsButton.click()

      const settingsTitle = page.getByRole('heading', { name: '⚙️ Settings' })
      await expect(settingsTitle).toBeVisible()

      const planesSwitch = page.locator('input[type="checkbox"]').first()
      await expect(planesSwitch).toBeVisible()
      await planesSwitch.click({ force: true })

      const allKeys = await page.evaluate(() => Object.keys(localStorage))
      const settingsKeys = allKeys.filter((k) => k.startsWith('settings.'))
      expect(settingsKeys.length).toBeGreaterThan(0)
   })

   test('restores map style from localStorage on page reload', async ({ page }) => {
      const nonDefaultStyle = 'mapbox://styles/mapbox/dark-v11'

      await page.goto('/')

      await page.evaluate(
         ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
         { key: STORAGE_KEY_MAP_STYLE, value: nonDefaultStyle },
      )

      await page.reload()

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible()
      await openSettingsButton.click()

      const settingsTitle = page.getByRole('heading', { name: '⚙️ Settings' })
      await expect(settingsTitle).toBeVisible()

      const mapTab = page.getByText('Map', { exact: true })
      await expect(mapTab).toBeVisible()
      await mapTab.click()

      const selectedCard = page.locator('[aria-pressed="true"]')
      await expect(selectedCard).toBeVisible()
      await expect(selectedCard).toContainText('Dark v11')
   })
})
