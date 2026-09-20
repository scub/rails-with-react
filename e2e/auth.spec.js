import { expect, test } from '@playwright/test';

function uniqueEmail(label) {
  return `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;
}

async function signUp(page, email, password) {
  await page.goto('/');
  await page.getByRole('button', { name: '☰' }).click();
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'Need an account? Sign up' }).click();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Sign up' }).click();

  await page.waitForLoadState('networkidle');
}

async function logOut(page) {
  await page.getByRole('button', { name: '☰' }).click();
  await page.getByRole('button', { name: 'Log out' }).click();

  await page.waitForLoadState('networkidle');
}

test.describe('authentication flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('signing up logs the user in', async ({ page }) => {
    await signUp(page, uniqueEmail('signup'), 'password12345');

    await expect(page.getByLabel('New note')).toBeVisible();
    await page.getByRole('button', { name: '☰' }).click();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('logging in with valid credentials authenticates user', async ({ page }) => {
    const email = uniqueEmail('login');
    const password = 'password12345';

    await signUp(page, email, password); // creates account, which auto logs in
    await logOut(page);

    await page.getByRole('button', { name: '☰' }).click();
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByLabel('New note')).toBeVisible();
    await page.getByRole('button', { name: '☰' }).click();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('using an incorrect password throws an error and does not authenticate', async ({ page }) => {
    const email = uniqueEmail('badpwd');

    await signUp(page, email, 'password12345');
    await logOut(page);

    await page.getByRole('button', { name: '☰' }).click();
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('the-wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Try another email address or password.')).toBeVisible();
    await expect(page.getByLabel('New note')).not.toBeVisible();
  });

  test('logging out removes ability to create notes', async ({ page }) => {
    await signUp(page, uniqueEmail('no-new-note'), 'password12345');
    await expect(page.getByLabel('New note')).toBeVisible();

    await logOut(page);
  
    await expect(page.getByLabel('New note')).not.toBeVisible();
    await page.getByRole('button', { name: '☰' }).click();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });
});
