import { test, expect } from '@playwright/test';

test.describe('StadiumIQ Landing Page', () => {
  test('should load the landing page and verify brand elements', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Verify brand link/logo specifically in the header
    await expect(page.getByRole('banner').getByRole('link', { name: 'StadiumIQ', exact: true })).toBeVisible();

    // Verify Hero CTA buttons exist
    // Using .first() or specific naming to avoid strict mode violations with footer links
    await expect(page.getByRole('link', { name: 'Open dashboard' }).first()).toBeVisible();
    
    // Specifically check for the 'Create account' link in the header/banner
    await expect(page.getByRole('banner').getByRole('link', { name: 'Create account' })).toBeVisible();
    
    console.log('Landing page smoke test passed.');
  });
});
