import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('home page loads and has expected content', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(page.locator('h1')).toContainText('🔮 Scrylytics');

    // Check feature cards
    await expect(page.locator('text=🧙‍♂️ Decklytics')).toBeVisible();
    await expect(page.locator('text=⚔️ Playlytics')).toBeVisible();
    await expect(page.locator('text=📊 Metalyzer')).toBeVisible();

    // Check version footer
    await expect(page.locator('text=Scrylytics v')).toBeVisible();
  });

  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');

    // Should load without error (basic smoke test)
    await expect(page.locator('body')).toBeVisible();
  });

  test('analyzer page loads', async ({ page }) => {
    await page.goto('/analyzer');

    // Should load without error (basic smoke test)
    await expect(page.locator('body')).toBeVisible();
  });
});
