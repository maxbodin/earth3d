import { expect, test } from '@playwright/test'

test.describe('Credit panel', () => {
   test('shows NASA credit for outer-space textures', async ({ page }) => {
      await page.goto('/')

      const openCreditButton = page.getByRole('button', { name: 'Open Credit' })
      await expect(openCreditButton).toBeVisible()

      await openCreditButton.click()

      await expect(page.getByRole('heading', { name: '✨ Credit' })).toBeVisible()

      const nasaLink = page.getByRole('link', {
         name: /NASA Scientific Visualization Studio/i,
      })

      await expect(nasaLink).toBeVisible()
      await expect(nasaLink).toHaveAttribute(
         'href',
         /https:\/\/svs\.gsfc\.nasa\.gov\/4851/,
      )
   })
})
