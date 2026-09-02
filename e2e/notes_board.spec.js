import { expect, test } from '@playwright/test';

function uniqueNote(label) {
  return `${label} ${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

test('loads the board with the compose form', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Sticky notes' })).toBeVisible();
  await expect(page.getByLabel('New note')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add note' })).toBeVisible();
});

test('adding a note shows it as its own card', async ({ page }) => {
  const content = uniqueNote('Buy milk');

  await page.goto('/');
  await page.getByLabel('New note').fill(content);
  await page.getByRole('button', { name: 'Add note' }).click();

  await expect(page.getByText(content)).toBeVisible();
  await expect(page.getByLabel('New note')).toHaveValue('');
});

test('does not submit a blank note', async ({ page }) => {
  await page.goto('/');

  const cardsBefore = await page.locator('.card-text').count();
  await page.getByRole('button', { name: 'Add note' }).click();

  await expect(page.locator('.card-text')).toHaveCount(cardsBefore);
});

test('a note added in one tab appears in another over ActionCable', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  try {
    await pageA.goto('/');
    await pageB.goto('/');

    const content = uniqueNote('Water the plants');
    await pageA.getByLabel('New note').fill(content);
    await pageA.getByRole('button', { name: 'Add note' }).click();

    // pageB should never reload, and only pass if the broadcast updates it.
    await expect(pageB.getByText(content)).toBeVisible();
  } finally {
    await contextA.close();
    await contextB.close();
  }
});
