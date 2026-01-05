import { test, expect } from '@playwright/test';

test.describe('Report Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Set up a mock token to bypass authentication
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-test-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User'
      }));
    });

    // Mock the /auth/me endpoint to return a valid user
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User'
          }
        })
      });
    });

    await page.goto('/');
    // Wait for the page to be ready
    await expect(page.locator('h2:has-text("Welcome to RadReport AI")')).toBeVisible();
  });

  test.describe('Input Validation', () => {
    test('should disable button when report ID is empty', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Initially, button should be disabled with empty input
      await expect(input).toHaveValue('');
      await expect(button).toBeDisabled();
    });

    test('should disable button with only whitespace in report ID', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Type whitespace
      await input.fill('   ');
      await expect(button).toBeDisabled();
    });

    test('should enable button when valid report ID is entered', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Type a valid report ID
      await input.fill('report-123');
      await expect(button).toBeEnabled();
    });
  });

  test.describe('Button Disabled States', () => {
    test('should disable input and button during processing', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock a delayed API response - use a longer delay to ensure we can check the disabled state
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });
      
      await page.route('**/api/reports/process', async (route) => {
        // Wait for our signal before responding
        await requestPromise;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { success: true } })
        });
      });

      // Enter report ID and click process
      await input.fill('report-123');
      await button.click();

      // Verify input and button are disabled during processing
      await expect(input).toBeDisabled();
      await expect(page.locator('button:has-text("Processing...")')).toBeVisible();
      
      // Verify processing message is shown
      await expect(page.locator('text=Processing is running. Actions are disabled until it finishes.')).toBeVisible();
      
      // Now let the request complete
      resolveRequest!();
    });

    test('should re-enable controls after processing completes', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock successful API response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { success: true } })
        });
      });

      // Enter report ID and process
      await input.fill('report-123');
      await button.click();

      // Wait for success message
      await expect(page.locator('text=Processing complete')).toBeVisible();

      // Verify controls are re-enabled
      await expect(input).toBeEnabled();
      await expect(button).toBeEnabled();
    });
  });

  test.describe('Success Message Display', () => {
    test('should show success message after successful processing', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock successful API response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { success: true } })
        });
      });

      // Process report
      await input.fill('test-report-456');
      await button.click();

      // Verify success message appears
      const successMessage = page.locator('.bg-green-50');
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText('Processing complete');
      await expect(successMessage).toContainText('test-report-456');
    });

    test('should display the processed report ID in success message', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock successful API response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { success: true } })
        });
      });

      // Process with specific ID
      const reportId = 'specific-report-789';
      await input.fill(reportId);
      await button.click();

      // Verify the specific report ID is in the success message
      await expect(page.locator(`text=for report ${reportId}`)).toBeVisible();
    });

    test('should hide processing message when success is shown', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock successful API response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { success: true } })
        });
      });

      // Process report
      await input.fill('report-123');
      await button.click();

      // Wait for success message
      await expect(page.locator('.bg-green-50')).toBeVisible();

      // Verify processing message is not visible
      await expect(page.locator('text=Processing is running')).not.toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should show error message on API failure', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock API error response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      // Process report
      await input.fill('report-123');
      await button.click();

      // Verify error message is displayed with red styling
      const errorMessage = page.locator('.bg-red-50');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Server error');
    });

    test('should display custom error message from API', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      const customError = 'Report not found in database';
      
      // Mock API with custom error
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: customError })
        });
      });

      // Process report
      await input.fill('invalid-report');
      await button.click();

      // Verify custom error message
      await expect(page.locator('.bg-red-50')).toContainText(customError);
    });

    test('should show default error message when API error has no message', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock API error without message - this will cause the API client to throw "Request failed"
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({})
        });
      });

      // Process report
      await input.fill('report-123');
      await button.click();

      // Verify error message - API client returns "Request failed" when there's no error field
      await expect(page.locator('.bg-red-50')).toContainText('Request failed');
    });

    test('should re-enable controls after error', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock API error
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Test error' })
        });
      });

      // Trigger error
      await input.fill('report-123');
      await button.click();

      // Wait for error message
      await expect(page.locator('.bg-red-50')).toBeVisible();

      // Verify controls are re-enabled
      await expect(input).toBeEnabled();
      await expect(button).toBeEnabled();
    });

    test('should allow retry after error', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      let callCount = 0;
      
      // Mock API to fail first time, succeed second time
      await page.route('**/api/reports/process', async (route) => {
        callCount++;
        if (callCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'First attempt failed' })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ analysis: { success: true } })
          });
        }
      });

      // First attempt - should fail
      await input.fill('report-123');
      await button.click();
      await expect(page.locator('.bg-red-50')).toBeVisible();

      // Second attempt - should succeed
      await input.clear();
      await input.fill('report-456');
      await button.click();
      await expect(page.locator('.bg-green-50')).toBeVisible();
    });
  });

  test.describe('Processing Status Messages', () => {
    test('should show processing message with disabled actions notice', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock delayed API response
      await page.route('**/api/reports/process', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { success: true } })
        });
      });

      // Start processing
      await input.fill('report-123');
      await button.click();

      // Verify processing message with pink/info styling
      const processingMessage = page.locator('.bg-pink-50');
      await expect(processingMessage).toBeVisible();
      await expect(processingMessage).toContainText('Processing is running. Actions are disabled until it finishes.');
    });

    test('should clear previous messages when starting new processing', async ({ page }) => {
      const button = page.locator('button:has-text("Run AI Processing")');
      const input = page.locator('input[placeholder*="64f1c2"]');
      
      // Mock successful API response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { success: true } })
        });
      });

      // First processing
      await input.fill('report-123');
      await button.click();
      await expect(page.locator('.bg-green-50')).toBeVisible();

      // Start new processing
      await input.clear();
      await input.fill('report-456');
      
      // Mock delayed response for second processing
      await page.route('**/api/reports/process', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { success: true } })
        });
      });
      
      await button.click();

      // Verify old success message is cleared and only processing message is shown
      await expect(page.locator('.bg-pink-50')).toBeVisible();
      await expect(page.locator('.bg-green-50')).not.toBeVisible();
    });
  });
});
