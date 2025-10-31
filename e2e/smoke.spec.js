import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

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

  test('home page accessibility', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);

    // Run accessibility check
    const results = await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: {
        outputFormat: 'text'
      }
    });

    // Log any violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations found:', results.violations.length);
      results.violations.forEach((violation, i) => {
        console.log(`${i + 1}. ${violation.help}: ${violation.description}`);
      });
    }

    // For now, just ensure we don't have critical violations
    expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
  });
});
