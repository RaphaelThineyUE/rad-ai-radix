import { test, expect, Page } from '@playwright/test';

// Helper function to register and login
async function registerAndLogin(page: Page, email: string, password: string = 'TestPassword123!') {
  // Register
  await page.goto('/register');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="full_name"]', 'Test User');
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect after successful registration
  await page.waitForURL('/', { timeout: 10000 });
}

// Helper function to create a test patient
async function createPatient(page: Page, patientName: string = 'Test Patient') {
  await page.goto('/patients');
  await page.click('button:has-text("Add Patient")');

  await page.fill('input[name="full_name"]', patientName);
  await page.fill('input[name="date_of_birth"]', '1980-01-01');
  await page.selectOption('select[name="gender"]', 'Female');
  await page.fill('input[name="diagnosis_date"]', '2023-01-15');
  await page.fill('input[name="cancer_type"]', 'Breast Cancer');
  await page.selectOption('select[name="cancer_stage"]', 'Stage II');

  await page.click('button:has-text("Create Patient")');
  await page.waitForSelector('text=' + patientName, { timeout: 5000 });
}

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;

  test('should show login page with all elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('RadReport AI');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Sign up');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('RadReport AI');
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="full_name"]', 'E2E Test User');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should redirect to home after successful registration
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('should login with existing credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should stay on login page and show error
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=/error|invalid|incorrect/i')).toBeVisible({ timeout: 3000 });
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Click logout button
    await page.click('button:has-text("Logout")');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Patient Management', () => {
  const testEmail = `patient-mgmt-${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, testEmail);
  });

  test('should create a new patient', async ({ page }) => {
    await createPatient(page, 'John Doe Patient');

    // Verify patient appears in list
    await expect(page.locator('text=John Doe Patient')).toBeVisible();
  });

  test('should display patient list', async ({ page }) => {
    await createPatient(page, 'List Test Patient');

    await page.goto('/patients');
    await expect(page.locator('text=List Test Patient')).toBeVisible();
  });

  test('should filter patients by search', async ({ page }) => {
    await createPatient(page, 'Searchable Patient');
    await createPatient(page, 'Another Patient');

    await page.goto('/patients');
    await page.fill('input[placeholder*="Search"]', 'Searchable');

    await expect(page.locator('text=Searchable Patient')).toBeVisible();
    await expect(page.locator('text=Another Patient')).not.toBeVisible();
  });

  test('should navigate to patient detail page', async ({ page }) => {
    await createPatient(page, 'Detail Test Patient');

    await page.goto('/patients');
    await page.click('text=Detail Test Patient');

    // Should be on patient detail page
    await expect(page).toHaveURL(/\/patients\/.+/);
    await expect(page.locator('text=Detail Test Patient')).toBeVisible();
  });

  test('should update patient information', async ({ page }) => {
    await createPatient(page, 'Update Test Patient');

    await page.goto('/patients');
    await page.click('text=Update Test Patient');

    // Click edit button
    await page.click('button:has-text("Edit")');

    // Update stage
    await page.selectOption('select[name="cancer_stage"]', 'Stage III');
    await page.click('button:has-text("Save")');

    // Verify update
    await expect(page.locator('text=Stage III')).toBeVisible();
  });
});

test.describe('Report Upload and Management', () => {
  const testEmail = `reports-${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, testEmail);
    await createPatient(page, 'Report Test Patient');
  });

  test('should show file dropzone on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=/upload|drop/i')).toBeVisible();
  });

  test('should require patient selection before upload', async ({ page }) => {
    await page.goto('/');

    // Try to trigger upload without selecting patient
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'test.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('PDF content')
      });

      // Should show error about selecting patient
      await expect(page.locator('text=/select.*patient/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display uploaded reports', async ({ page }) => {
    await page.goto('/');

    // Select patient
    await page.selectOption('select', { label: 'Report Test Patient' });

    // If reports exist, they should be visible
    const reportCards = page.locator('[data-testid="report-card"]');
    const count = await reportCards.count();

    // Should either show reports or empty state
    if (count === 0) {
      await expect(page.locator('text=/no reports|upload/i')).toBeVisible();
    }
  });

  test('should open report detail when clicking report card', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('select', { label: 'Report Test Patient' });

    const reportCard = page.locator('[data-testid="report-card"]').first();
    if (await reportCard.isVisible()) {
      await reportCard.click();

      // Should open detail panel
      await expect(page.locator('[data-testid="report-detail"]')).toBeVisible();
    }
  });
});

test.describe('Treatment Management', () => {
  const testEmail = `treatments-${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, testEmail);
    await createPatient(page, 'Treatment Test Patient');
  });

  test('should add a treatment record', async ({ page }) => {
    await page.goto('/patients');
    await page.click('text=Treatment Test Patient');

    // Go to treatments tab
    await page.click('button:has-text("Treatments")');

    // Add treatment
    await page.click('button:has-text("Add Treatment")');
    await page.fill('input[name="treatment_name"]', 'Chemotherapy AC-T');
    await page.selectOption('select[name="treatment_type"]', 'Chemotherapy');
    await page.fill('input[name="start_date"]', '2023-02-01');
    await page.fill('textarea[name="notes"]', 'Starting adjuvant chemotherapy');

    await page.click('button:has-text("Create")');

    // Verify treatment appears
    await expect(page.locator('text=Chemotherapy AC-T')).toBeVisible();
  });

  test('should show treatment comparison dialog', async ({ page }) => {
    await page.goto('/patients');
    await page.click('text=Treatment Test Patient');

    await page.click('button:has-text("Treatments")');
    await page.click('button:has-text("Compare Treatments")');

    // Dialog should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=/compare/i')).toBeVisible();
  });
});

test.describe('Analytics Dashboard', () => {
  const testEmail = `analytics-${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, testEmail);
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('h1')).toContainText('Analytics');
  });

  test('should show statistics cards', async ({ page }) => {
    await page.goto('/analytics');

    // Should show stat cards
    await expect(page.locator('text=/total patients|patients/i')).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    await createPatient(page, 'Analytics Patient 1');
    await createPatient(page, 'Analytics Patient 2');

    await page.goto('/analytics');

    // Charts should be present
    const charts = page.locator('svg');
    await expect(charts.first()).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    const protectedRoutes = ['/', '/patients', '/analytics', '/how-to'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL('/login');
    }
  });
});

test.describe('Responsive Design', () => {
  const testEmail = `responsive-${Date.now()}@example.com`;

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await registerAndLogin(page, testEmail);
    await page.goto('/');

    // Should still show main content
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await registerAndLogin(page, testEmail);
    await page.goto('/');

    await expect(page.locator('h1, h2')).toBeVisible();
  });
});
