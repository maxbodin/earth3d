import { expect } from '@playwright/test'

export async function openSettingsTab(page: import('@playwright/test').Page, tabName: string) {
   const openSettingsButton = page.getByRole('button', { name: 'Open Settings' })
   await expect(openSettingsButton).toBeVisible()
   await openSettingsButton.click()

   const settingsTitle = page.getByRole('heading', { name: '⚙️ Settings' })
   await expect(settingsTitle).toBeVisible()

   const tab = page.getByText(tabName, { exact: true })
   await expect(tab).toBeVisible()
   await tab.click()
}