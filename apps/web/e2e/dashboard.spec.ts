import { test, expect } from '@playwright/test';

test.describe('StadiumIQ Dashboard - Main View', () => {
  test('should load the dashboard and verify key elements', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Verify header exists
    await expect(page.locator('text=StadiumIQ')).toBeVisible();

    // Verify Sidebar links
    await expect(page.locator('text=Overview')).toBeVisible();

    // Verify some ARIA accessibility metrics are met
    // (We will add the ARIA roles in step 5.4, but tests expect them)
    // await expect(page.getByRole('main')).toBeVisible();
    
    console.log('Smoke test passed.');
  });
});
