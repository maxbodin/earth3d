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

   test('country details card renders condensed API countries and worldometer info', async ({ page }) => {
      await page.route('**/api/country-profile/FR**', async route => {
         await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
               summary: {
                  name: 'France',
                  nativeName: 'France',
                  alpha2: 'FR',
                  alpha3: 'FRA',
                  numericCode: '250',
                  demonym: 'French',
                  independent: true,
                  cioc: 'FRA',
                  flagPngUrl: 'https://flagcdn.com/w320/fr.png',
                  flagSvgUrl: 'https://flagcdn.com/fr.svg',
               },
               geography: {
                  capital: 'Paris',
                  region: 'Europe',
                  subregion: 'Western Europe',
                  latitude: 46,
                  longitude: 2,
                  areaKm2: 640679,
                  timezones: ['UTC+01:00', 'UTC+02:00'],
                  borders: ['AND', 'BEL', 'DEU', 'ITA', 'ESP'],
                  topLevelDomains: ['.fr'],
               },
               demographics: {
                  population: 67391582,
                  gini: 32.4,
                  callingCodes: ['33'],
                  altSpellings: ['FR', 'French Republic'],
               },
               economy: {
                  currencies: [
                     {
                        code: 'EUR',
                        name: 'Euro',
                        symbol: '€',
                     },
                  ],
               },
               culture: {
                  languages: [
                     {
                        iso639_1: 'fr',
                        iso639_2: 'fra',
                        name: 'French',
                        nativeName: 'français',
                     },
                  ],
                  translations: {
                     en: 'France',
                     de: 'Frankreich',
                     es: 'Francia',
                  },
                  regionalBlocs: [
                     {
                        acronym: 'EU',
                        name: 'European Union',
                     },
                  ],
               },
               worldometer: {
                  source: 'worldometers-via-disease-sh',
                  updatedAt: 1713379200000,
                  continent: 'Europe',
                  population: 67391582,
                  cases: 1234567,
                  todayCases: 123,
                  deaths: 12345,
                  todayDeaths: 3,
                  recovered: 1200000,
                  todayRecovered: 50,
                  active: 22222,
                  critical: 15,
                  tests: 12300000,
                  casesPerOneMillion: 18318,
                  deathsPerOneMillion: 183,
                  testsPerOneMillion: 182512,
               },
               meta: {
                  hasApiCountries: true,
                  hasWorldometer: true,
                  fetchedAtIso: '2026-04-17T00:00:00.000Z',
               },
            }),
         })
      })

      await page.goto('/?country=France')

      await expect(page.getByText(/Country:\s*France/i)).toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(/Capital:\s*Paris/i)).toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(/Region:\s*Europe/i)).toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(/Population:\s*67,391,582/i)).toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(/Currencies:\s*Euro \(EUR, €/i)).toBeVisible({ timeout: 15_000 })
      await expect(page.getByRole('heading', { name: 'Worldometer (COVID-19)' })).toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(/Cases:\s*1,234,567/i)).toBeVisible({ timeout: 15_000 })
      await expect(page.getByText(/Deaths:\s*12,345/i)).toBeVisible({ timeout: 15_000 })
   })
})
