import { defineConfig, devices } from '@playwright/test';

// BASE_URL lets this point at the `web` service by container name (e2e runs
// against `docker compose up`'s already-running stack — see the e2e service
// in docker-compose.yml) instead of assuming localhost.
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: 'e2e',
  globalSetup: './e2e/global-setup.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['./reporters/playwright/markdown-reporter'], ['github']]: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    storageState: 'e2e/.auth/user.json',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
