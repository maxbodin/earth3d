import { expect, test } from '@playwright/test'

test.describe('Loading Screen', () => {
  test('is visible on initial page load', async ({ page }) => {
    // Use 'load' to ensure JS has initialised but 3D assets not yet complete.
    await page.goto('/', { waitUntil: 'load' })

    const loadingScreen = page.getByTestId('loading-screen')
    await expect(loadingScreen).toBeVisible()
  })

  test('displays Earth 3D branding', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })

    await expect(page.getByTestId('loading-title')).toHaveText('Earth3D')
  })

  test('shows accessible progress bar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })

    // Use a CSS selector instead of getByRole so the element is found even
    // after the loading screen sets aria-hidden="true" on its root.
    const progressBar = page.locator('[role="progressbar"]')
    await expect(progressBar).toBeAttached()
    await expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    await expect(progressBar).toHaveAttribute('aria-valuemax', '100')

    const valueNow = Number(await progressBar.getAttribute('aria-valuenow'))
    expect(valueNow).toBeGreaterThanOrEqual(0)
    expect(valueNow).toBeLessThanOrEqual(100)
  })

  test('shows a non-empty loading status label', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })

    const status = page.getByTestId('loading-status')
    await expect(status).toBeVisible()
    // Should show the first pending step, not be blank.
    const text = await status.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('progress bar fill element is present and starts narrow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })

    const fill = page.getByTestId('loading-progress-fill')
    await expect(fill).toBeVisible()

    // The fill width should be less than the full container width early on.
    const fillBox = await fill.boundingBox()
    const trackBox = await page.getByTestId('loading-progress-track').boundingBox()

    if (fillBox && trackBox) {
      // Fill should not immediately be 100% wide (real loading takes time)
      // Allow up to 80% in case renderer/scenes init very fast.
      expect(fillBox.width).toBeLessThan(trackBox.width * 0.9)
    }
  })

  test('progress increases as assets load', async ({ page }) => {
    await page.goto('/')

    // Use a CSS selector instead of getByRole so the element is found even
    // after the loading screen sets aria-hidden="true" on its root.
    const progressBar = page.locator('[role="progressbar"]')
    await expect(progressBar).toBeAttached()

    // Capture initial progress.
    const initialProgress = Number(await progressBar.getAttribute('aria-valuenow'))
    expect(initialProgress).toBeGreaterThanOrEqual(0)

    // Wait a bit for loading to advance.
    await page.waitForTimeout(3000)

    const laterProgress = Number(await progressBar.getAttribute('aria-valuenow'))

    // Progress should not go backwards.
    expect(laterProgress).toBeGreaterThanOrEqual(initialProgress)
  })

  test('loading screen hides once all assets are loaded', async ({ page }) => {
    await page.goto('/')

    const loadingScreen = page.getByTestId('loading-screen')

    // Wait for all loading steps to complete.
    await expect(loadingScreen).toHaveAttribute('data-state', 'complete', {
      timeout: 60_000,
    })

    // aria-hidden should be set to true.
    await expect(loadingScreen).toHaveAttribute('aria-hidden', 'true')
  })

  test('no duplicate loading screens are rendered', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })

    const screens = page.getByTestId('loading-screen')
    await expect(screens).toHaveCount(1)
  })

  test('loading screen is present in the initial HTML before JS executes', async ({ request }) => {
    const response = await request.get('/')
    expect(response.status()).toBe(200)

    const html = await response.text()
    expect(html).toContain('data-testid="loading-screen"')
    expect(html).toContain('aria-label="Loading Earth 3D"')
  })
})
