import { Page } from '@playwright/test'
import { createMockEarthquakeResponse } from '@/tests/e2e/mocks/responses/createMockEarthquakeResponse'

export async function mockEarthquakeRoute(
   page: Page,
   options: { count?: number; onRequest?: () => void } = {},
): Promise<void> {
   await page.route('**/api/earthquakes**', async (route) => {
      options.onRequest?.()

      await route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify(createMockEarthquakeResponse(options.count ?? 3)),
      })
   })
}