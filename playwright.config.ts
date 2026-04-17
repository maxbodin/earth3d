import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3000)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`
const configuredWorkers = Number(process.env.PLAYWRIGHT_WORKERS ?? 1)
const workerCount = Number.isFinite(configuredWorkers) && configuredWorkers > 0
	? configuredWorkers
	: 1

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: workerCount,
	reporter: process.env.CI
		? [['github'], ['html', { open: 'never' }]]
		: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: baseURL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		viewport: { width: 1440, height: 900 },
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: process.env.PLAYWRIGHT_BASE_URL
		? undefined
		: {
			command: `npm run dev -- --port ${PORT} --hostname 127.0.0.1`,
			url: baseURL,
			reuseExistingServer: !process.env.CI,
			timeout: 120 * 1000,
		},
})