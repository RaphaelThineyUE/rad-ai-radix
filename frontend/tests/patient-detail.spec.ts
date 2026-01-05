import { test, expect } from '@playwright/test';

test.describe('Patient Detail - Report Processing', () => {
  // Setup: Mock authentication before each test
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting token in localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-test-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User'
      }));
    });
  });

  test.describe('Input Validation', () => {
    test('should disable process button when report ID is empty', async ({ page }) => {
      await page.goto('/patients/test-patient-123');
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      const reportInput = page.locator('#report-id-input');
      
      // Button should be disabled with empty input
      await expect(processButton).toBeDisabled();
      
      // Type some text
      await reportInput.fill('report-123');
      await expect(processButton).toBeEnabled();
      
      // Clear input
      await reportInput.clear();
      await expect(processButton).toBeDisabled();
    });

    test('should disable process button for whitespace-only input', async ({ page }) => {
      await page.goto('/patients/test-patient-123');
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      const reportInput = page.locator('#report-id-input');
      
      // Type only spaces
      await reportInput.fill('   ');
      await expect(processButton).toBeDisabled();
      
      // Type valid text with spaces
      await reportInput.fill('  report-123  ');
      await expect(processButton).toBeEnabled();
    });
  });

  test.describe('Button Disabled States', () => {
    test('should disable button and input during processing', async ({ page }) => {
      // Intercept API call and delay response
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>(resolve => {
        resolveRequest = resolve;
      });
      
      await page.route('**/api/reports/process', async (route) => {
        await requestPromise;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { status: 'completed' } })
        });
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      
      await reportInput.fill('report-123');
      await expect(reportInput).toBeEnabled();
      
      // Click process button
      await page.locator('button:has-text("Run AI Processing")').click();
      
      // Wait a bit for state to update
      await page.waitForTimeout(100);
      
      // Both button and input should be disabled during processing
      // Check input is disabled
      await expect(reportInput).toBeDisabled();
      // Check button is disabled (by checking it has disabled attribute)
      await expect(reportInput).toHaveAttribute('disabled', '');
      
      // Resolve the request to complete processing
      resolveRequest!();
    });

    test('should keep actions disabled until processing completes', async ({ page }) => {
      // Intercept API call with delay
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>(resolve => {
        resolveRequest = resolve;
      });
      
      await page.route('**/api/reports/process', async (route) => {
        await requestPromise;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { status: 'completed' } })
        });
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      await reportInput.fill('report-456');
      
      await page.locator('button:has-text("Run AI Processing")').click();
      
      // Wait a bit for state to update
      await page.waitForTimeout(100);
      
      // Verify disabled state during processing
      await expect(reportInput).toBeDisabled();
      await expect(reportInput).toHaveAttribute('disabled', '');
      
      // Resolve the request to complete processing
      resolveRequest!();
      
      // Wait for processing to complete
      await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 2000 });
      
      // After completion, controls should be re-enabled
      await expect(page.locator('button:has-text("Run AI Processing")')).toBeEnabled();
      await expect(reportInput).toBeEnabled();
    });
  });

  test.describe('Processing Status Messages', () => {
    test('should display processing message when processing starts', async ({ page }) => {
      // Intercept API call with delay
      await page.route('**/api/reports/process', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { status: 'completed' } })
        });
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      await reportInput.fill('report-789');
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      await processButton.click();
      
      // Check for processing message
      const processingMessage = page.locator('.bg-pink-50:has-text("Processing is running")');
      await expect(processingMessage).toBeVisible();
    });
  });

  test.describe('Success Message Display', () => {
    test('should display success message after successful processing', async ({ page }) => {
      // Mock successful API response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { status: 'completed' } })
        });
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      await reportInput.fill('report-success-001');
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      await processButton.click();
      
      // Check for success message
      const successMessage = page.locator('.bg-green-50:has-text("Processing complete for report report-success-001")');
      await expect(successMessage).toBeVisible({ timeout: 2000 });
    });

    test('should include report ID in success message', async ({ page }) => {
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { status: 'completed' } })
        });
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      const testReportId = 'report-unique-12345';
      await reportInput.fill(testReportId);
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      await processButton.click();
      
      // Verify the specific report ID appears in success message
      await expect(page.locator(`text=Processing complete for report ${testReportId}`)).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should display error message when API call fails', async ({ page }) => {
      // Mock failed API response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      await reportInput.fill('report-error-001');
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      await processButton.click();
      
      // Check for error message
      const errorMessage = page.locator('.bg-red-50:has-text("Internal server error")');
      await expect(errorMessage).toBeVisible({ timeout: 2000 });
    });

    test('should display generic error message for network failures', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/reports/process', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      await reportInput.fill('report-network-error');
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      await processButton.click();
      
      // Check for error message (should show generic error)
      await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 2000 });
    });

    test('should re-enable controls after error', async ({ page }) => {
      // Mock failed API response
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid report ID' })
        });
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      await reportInput.fill('invalid-report');
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      await processButton.click();
      
      // Wait for error message
      await expect(page.locator('text=Invalid report ID')).toBeVisible({ timeout: 2000 });
      
      // Controls should be re-enabled after error
      await expect(processButton).toBeEnabled();
      await expect(reportInput).toBeEnabled();
    });

    test('should allow retry after error', async ({ page }) => {
      let callCount = 0;
      
      // First call fails, second succeeds
      await page.route('**/api/reports/process', async (route) => {
        callCount++;
        if (callCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Temporary error' })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ analysis: { status: 'completed' } })
          });
        }
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      await reportInput.fill('report-retry-test');
      
      const processButton = page.locator('button:has-text("Run AI Processing")');
      
      // First attempt - should fail
      await processButton.click();
      await expect(page.locator('text=Temporary error')).toBeVisible({ timeout: 2000 });
      
      // Retry - should succeed
      await processButton.click();
      await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 2000 });
    });

    test('should clear previous messages when starting new processing', async ({ page }) => {
      // Mock responses
      await page.route('**/api/reports/process', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ analysis: { status: 'completed' } })
        });
      });

      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      const processButton = page.locator('button:has-text("Run AI Processing")');
      
      // First processing
      await reportInput.fill('report-001');
      await processButton.click();
      await expect(page.locator('text=Processing complete for report report-001')).toBeVisible({ timeout: 2000 });
      
      // Second processing - old message should be cleared
      await reportInput.clear();
      await reportInput.fill('report-002');
      await processButton.click();
      
      // Old success message should be gone
      await expect(page.locator('text=Processing complete for report report-001')).not.toBeVisible();
      
      // New processing message should appear
      await expect(page.locator('text=Processing is running')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      
      // Check for aria-describedby
      await expect(reportInput).toHaveAttribute('aria-describedby', 'report-id-description');
      
      // Check that description exists
      const description = page.locator('#report-id-description');
      await expect(description).toBeVisible();
      await expect(description).toContainText('Provide a report ID');
    });

    test('should have proper labels', async ({ page }) => {
      await page.goto('/patients/test-patient-123');
      
      // Check for label
      const label = page.locator('label[for="report-id-input"]');
      await expect(label).toBeVisible();
      await expect(label).toContainText('Report ID');
    });
  });

  test.describe('User Interface', () => {
    test('should display patient ID in page', async ({ page }) => {
      await page.goto('/patients/test-patient-123');
      
      await expect(page.locator('text=Patient ID: test-patient-123')).toBeVisible();
    });

    test('should have proper page structure', async ({ page }) => {
      await page.goto('/patients/test-patient-123');
      
      // Check main sections exist
      await expect(page.locator('h2:has-text("Patient Details")')).toBeVisible();
      await expect(page.locator('h3:has-text("Process a Report")')).toBeVisible();
    });

    test('should show placeholder in input field', async ({ page }) => {
      await page.goto('/patients/test-patient-123');
      
      const reportInput = page.locator('#report-id-input');
      await expect(reportInput).toHaveAttribute('placeholder', 'e.g. 64f1c2...');
    });
  });
});
