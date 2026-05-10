import { Page } from '@playwright/test'
import { createMockVolcanoResponse } from '@/tests/e2e/mocks/responses/createMockVolcanoResponse'

export async function mockVolcanoRoute(
   page: Page,
   options: { volcanoCount?: number; eruptionsPerVolcano?: number; onRequest?: () => void } = {},
): Promise<void> {
   await page.route('**/api/volcanoes**', async (route) => {
      options.onRequest?.()

      await route.fulfill({
         status: 200,
         contentType: 'application/json',
         body: JSON.stringify(
            createMockVolcanoResponse(
               options.volcanoCount ?? 3,
               options.eruptionsPerVolcano ?? 2,
            ),
         ),
      })
   })
}
