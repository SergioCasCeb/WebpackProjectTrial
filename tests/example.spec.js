// @ts-check
const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  // await page.goto('https://playwright.dev/');
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("TD Playground");
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});


// await page.goto("http://localhost:3000");
// await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"@type": "Thing",' }).nth(4).click();
// await page.locator('#file-type-yaml').check();
// await page.getByRole('button', { name: 'Confirm' }).click();
// await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '\'@type\': Thing' }).nth(4).click();
// await page.locator('#file-type-yaml').check();
// await page.locator('#file-type-json').check();
// await page.locator('#editor1').getByRole('code').locator('div').filter({ hasText: '"@type": "Thing",' }).nth(4).click();