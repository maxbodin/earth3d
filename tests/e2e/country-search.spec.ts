import { expect, test } from '@playwright/test'

type ThreeSceneDebugSnapshot = {
   countryNamesCount?: number
   countryFrontiersCount?: number
   selectedCountryFrontiersCount?: number
}

test.describe('Country search', () => {
   test('selecting a country sets URL param and forces country label/frontier visibility', async ({ page }) => {
      await page.goto('/')

      const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
      await expect(openSettingsButton).toBeVisible({ timeout: 60_000 })
      await openSettingsButton.click({ force: true })

      await page.getByRole('button', { name: 'Countries' }).click()

      const countriesFrontiersToggle = page
         .locator('.switch-holder', { hasText: 'Activate countries frontiers on Map' })
         .locator('input[type="checkbox"]')
         .first()

      const countriesNamesToggle = page
         .locator('.switch-holder', { hasText: 'Activate countries names on Map' })
         .locator('input[type="checkbox"]')
         .first()

      await expect(countriesFrontiersToggle).toBeVisible()
      await expect(countriesNamesToggle).toBeVisible()

      if (await countriesFrontiersToggle.isChecked()) {
         await countriesFrontiersToggle.click({ force: true })
      }

      if (await countriesNamesToggle.isChecked()) {
         await countriesNamesToggle.click({ force: true })
      }

      await page.getByRole('button', { name: 'Close' }).first().click()

      const subjectButton = page.getByRole('button', { name: /Country/i })
      await expect(subjectButton).toBeVisible()

      const countryInput = page.locator('#search-input')
      await expect(countryInput).toBeVisible()

      await countryInput.fill('France')
      await page.keyboard.press('Enter')

      await expect(page.getByText(/Country:\s*France/i)).toBeVisible({ timeout: 15_000 })
      await expect(
         page.locator('button[aria-label="Focus view on country"]'),
      ).toBeVisible({ timeout: 15_000 })
      await expect(page).toHaveURL(/[?&]country=France(?:&|$)/)

      await expect.poll(async (): Promise<number> => {
         const debug = await page.evaluate((): ThreeSceneDebugSnapshot => {
            return (window as Window & {
               __THREE_SCENE_DEBUG__?: ThreeSceneDebugSnapshot
            }).__THREE_SCENE_DEBUG__ ?? {}
         })

         return debug.countryNamesCount ?? 0
      }).toBe(1)

      await expect.poll(async (): Promise<number> => {
         const debug = await page.evaluate((): ThreeSceneDebugSnapshot => {
            return (window as Window & {
               __THREE_SCENE_DEBUG__?: ThreeSceneDebugSnapshot
            }).__THREE_SCENE_DEBUG__ ?? {}
         })

         return debug.selectedCountryFrontiersCount ?? 0
      }).toBeGreaterThan(0)

      await expect.poll(async (): Promise<number> => {
         const debug = await page.evaluate((): ThreeSceneDebugSnapshot => {
            return (window as Window & {
               __THREE_SCENE_DEBUG__?: ThreeSceneDebugSnapshot
            }).__THREE_SCENE_DEBUG__ ?? {}
         })

         return debug.countryFrontiersCount ?? 0
      }).toBe(0)

      await page.locator('button[aria-label="Close"]').first().click({ force: true })

      await expect(page.getByText(/Country:\s*France/i)).not.toBeVisible()
      await expect(page).not.toHaveURL(/[?&]country=/)
   })

   test('opening page with country search param replays country selection workflow', async ({ page }) => {
      await page.goto('/?country=France')

      await expect(page.getByText(/Country:\s*France/i)).toBeVisible({ timeout: 15_000 })
      await expect(
         page.locator('button[aria-label="Focus view on country"]'),
      ).toBeVisible({ timeout: 15_000 })
      await expect(page).toHaveURL(/[?&]country=France(?:&|$)/)

      await expect.poll(async (): Promise<number> => {
         const debug = await page.evaluate((): ThreeSceneDebugSnapshot => {
            return (window as Window & {
               __THREE_SCENE_DEBUG__?: ThreeSceneDebugSnapshot
            }).__THREE_SCENE_DEBUG__ ?? {}
         })

         return debug.countryNamesCount ?? 0
      }).toBe(1)

      await expect.poll(async (): Promise<number> => {
         const debug = await page.evaluate((): ThreeSceneDebugSnapshot => {
            return (window as Window & {
               __THREE_SCENE_DEBUG__?: ThreeSceneDebugSnapshot
            }).__THREE_SCENE_DEBUG__ ?? {}
         })

         return debug.selectedCountryFrontiersCount ?? 0
      }).toBeGreaterThan(0)
   })
})
