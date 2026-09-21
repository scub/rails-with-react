import { chromium } from '@playwright/test';

async function globalSetup(config) {
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  /* Create a user for tests */
  const email    = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
  const password = `${Date.now()}-${Math.floor(Math.random() * 1e6)}-e2e`;

  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'Need an account? Sign up' }).click();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: 'Sign up' }).click(),
  ]);
  await page.waitForLoadState('networkidle'); // post-signup window.reload()

  await page.context().storageState({ path: storageState });
  await browser.close();
}

export default globalSetup;