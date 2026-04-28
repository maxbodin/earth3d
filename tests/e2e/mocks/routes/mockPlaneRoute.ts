import { Page } from '@playwright/test'
import { createMockPlaneResponse } from '@/tests/e2e/mocks/responses/createMockPlaneResponse'

export async function mockPlaneRoute(
   page: Page,
   options: { count?: number; onRequest?: () => void } = {},
): Promise<void> {
   await page.route('**/api/planes/states**', async (route) => {
      options.onRequest?.()

      await route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify(createMockPlaneResponse()),
      })
   })
}