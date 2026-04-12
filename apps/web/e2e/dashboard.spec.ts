import { test, expect } from '@playwright/test';

test.describe('StadiumIQ Landing Page', () => {
  test('should load the landing page and verify brand elements', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Verify brand link/logo specifically (using role to avoid strict mode violation with footer/paragraphs)
    await expect(page.getByRole('link', { name: 'StadiumIQ', exact: true })).toBeVisible();

    // Verify CTA buttons exist (using getByRole for better accessibility testing and specificity)
    await expect(page.getByRole('link', { name: 'Open dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
    
    console.log('Landing page smoke test passed.');
  });
});
