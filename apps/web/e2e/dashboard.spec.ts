import { test, expect } from '@playwright/test';

test.describe('StadiumIQ Landing Page', () => {
  test('should load the landing page and verify brand elements', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Verify brand text exists
    await expect(page.locator('text=StadiumIQ')).toBeVisible();

    // Verify CTA buttons exist
    await expect(page.locator('text=Open dashboard')).toBeVisible();
    await expect(page.locator('text=Create account')).toBeVisible();
    
    console.log('Landing page smoke test passed.');
  });
});
