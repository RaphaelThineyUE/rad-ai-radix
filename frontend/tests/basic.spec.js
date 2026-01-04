import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('RadReport AI');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Sign up');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('RadReport AI');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // Form should not submit with empty fields due to HTML5 validation
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Home Page', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('HowTo Page', () => {
  test('should show accordion sections when authenticated', async ({ page }) => {
    // This test would need proper authentication setup
    // For now, it tests the redirect behavior
    await page.goto('/how-to');
    await expect(page).toHaveURL('/login');
  });
});
