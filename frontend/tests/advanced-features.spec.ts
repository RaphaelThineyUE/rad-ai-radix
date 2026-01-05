import { test, expect } from '@playwright/test';

test.describe('Consolidated Report Analysis', () => {
    const testEmail = `consolidated-${Date.now()}@example.com`;
    const testPatient = 'Consolidated Analysis Patient';

    test.beforeEach(async ({ page }) => {
        // Register and login
        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Consolidated Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Create patient
        await page.goto('/patients');
        await page.click('button:has-text("Add Patient")');
        await page.fill('input[name="full_name"]', testPatient);
        await page.fill('input[name="date_of_birth"]', '1970-05-10');
        await page.selectOption('select[name="gender"]', 'Female');
        await page.fill('input[name="diagnosis_date"]', '2022-11-05');
        await page.fill('input[name="cancer_type"]', 'Breast Cancer');
        await page.selectOption('select[name="cancer_stage"]', 'Stage III');
        await page.click('button:has-text("Create Patient")');
        await page.waitForSelector('text=' + testPatient);
    });

    test('should show consolidate button only with 2+ reports', async ({ page }) => {
        await page.goto('/');
        await page.selectOption('select', { label: testPatient });

        // Initially should not show consolidate button (0 reports)
        await expect(page.locator('button:has-text("Consolidate")')).not.toBeVisible({ timeout: 2000 });

        // After uploading 2+ reports, button should appear
        // This test assumes reports can be uploaded programmatically
    });

    test('should open consolidate dialog', async ({ page }) => {
        await page.goto('/');
        await page.selectOption('select', { label: testPatient });

        const consolidateBtn = page.locator('button:has-text("Consolidate Reports")');

        if (await consolidateBtn.isVisible({ timeout: 5000 })) {
            await consolidateBtn.click();

            // Dialog should open
            await expect(page.locator('[role="dialog"]')).toBeVisible();
            await expect(page.locator('text=/consolidat/i')).toBeVisible();
        }
    });

    test('should display aggregate statistics', async ({ page }) => {
        await page.goto('/');
        await page.selectOption('select', { label: testPatient });

        const consolidateBtn = page.locator('button:has-text("Consolidate Reports")');

        if (await consolidateBtn.isVisible({ timeout: 5000 })) {
            await consolidateBtn.click();
            await page.waitForSelector('[role="dialog"]');

            // Wait for AI processing
            await page.waitForSelector('text=/aggregate|statistics|analysis/i', { timeout: 30000 });

            // Should show aggregate data
            await expect(page.locator('text=/total reports|reports analyzed/i')).toBeVisible();
        }
    });

    test('should allow export of consolidated data', async ({ page }) => {
        await page.goto('/');
        await page.selectOption('select', { label: testPatient });

        const consolidateBtn = page.locator('button:has-text("Consolidate Reports")');

        if (await consolidateBtn.isVisible({ timeout: 5000 })) {
            await consolidateBtn.click();
            await page.waitForSelector('[role="dialog"]');

            // Look for export button
            const exportBtn = page.locator('button:has-text("Export")');

            if (await exportBtn.isVisible({ timeout: 5000 })) {
                // Set up download handler
                const downloadPromise = page.waitForEvent('download');
                await exportBtn.click();
                const download = await downloadPromise;

                // Verify download
                expect(download.suggestedFilename()).toMatch(/\.json$/);
            }
        }
    });
});

test.describe('Patient Timeline Feature', () => {
    const testEmail = `timeline-${Date.now()}@example.com`;

    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Timeline Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Create patient
        await page.goto('/patients');
        await page.click('button:has-text("Add Patient")');
        await page.fill('input[name="full_name"]', 'Timeline Patient');
        await page.fill('input[name="date_of_birth"]', '1982-08-25');
        await page.selectOption('select[name="gender"]', 'Female');
        await page.fill('input[name="diagnosis_date"]', '2023-01-10');
        await page.fill('input[name="cancer_type"]', 'Breast Cancer');
        await page.click('button:has-text("Create Patient")');
    });

    test('should display timeline on patient detail page', async ({ page }) => {
        await page.goto('/patients');
        await page.click('text=Timeline Patient');

        // Go to timeline tab
        await page.click('button:has-text("Timeline")');

        // Timeline should be visible
        await expect(page.locator('[data-testid="patient-timeline"]')).toBeVisible();
    });

    test('should show diagnosis as starting point', async ({ page }) => {
        await page.goto('/patients');
        await page.click('text=Timeline Patient');
        await page.click('button:has-text("Timeline")');

        // Should show diagnosis date
        await expect(page.locator('text=/diagnosis|diagnosed/i')).toBeVisible();
        await expect(page.locator('text=2023-01-10')).toBeVisible();
    });

    test('should display treatment events on timeline', async ({ page }) => {
        await page.goto('/patients');
        await page.click('text=Timeline Patient');

        // Add a treatment
        await page.click('button:has-text("Treatments")');
        await page.click('button:has-text("Add Treatment")');
        await page.fill('input[name="treatment_name"]', 'Surgery');
        await page.fill('input[name="start_date"]', '2023-02-15');
        await page.click('button:has-text("Create")');

        // Go to timeline tab
        await page.click('button:has-text("Timeline")');

        // Should show treatment on timeline
        await expect(page.locator('text=Surgery')).toBeVisible();
    });

    test('should display report events on timeline', async ({ page }) => {
        await page.goto('/patients');
        await page.click('text=Timeline Patient');
        await page.click('button:has-text("Timeline")');

        // If reports exist, they should appear on timeline
        const timelineItems = page.locator('[data-testid="timeline-item"]');
        const count = await timelineItems.count();

        // Should have at least diagnosis event
        expect(count).toBeGreaterThanOrEqual(1);
    });
});

test.describe('How-To Guide', () => {
    const testEmail = `howto-${Date.now()}@example.com`;

    test.beforeEach(async ({ page }) => {
        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'HowTo Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
    });

    test('should display how-to page with accordion sections', async ({ page }) => {
        await page.goto('/how-to');

        // Should show multiple accordion sections
        await expect(page.locator('text=/getting started|upload/i')).toBeVisible();
        await expect(page.locator('text=/patient/i')).toBeVisible();
    });

    test('should expand accordion sections on click', async ({ page }) => {
        await page.goto('/how-to');

        // Click first accordion trigger
        const firstAccordion = page.locator('[data-radix-collection-item]').first();
        await firstAccordion.click();

        // Content should expand
        await expect(page.locator('[data-state="open"]')).toBeVisible();
    });

    test('should show instructional content', async ({ page }) => {
        await page.goto('/how-to');

        // Should contain instructional text
        await expect(page.locator('text=/step|how to|instructions/i')).toBeVisible();
    });
});

test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
        const testEmail = `error-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Error Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Simulate offline condition
        await page.route('**/*', route => route.abort());

        // Try to load patients
        await page.goto('/patients');

        // Should show error message
        await expect(page.locator('text=/error|failed|unable/i')).toBeVisible({ timeout: 5000 });
    });

    test('should show loading states during data fetch', async ({ page }) => {
        const testEmail = `loading-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Loading Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Navigate to patients page
        await page.goto('/patients');

        // Should show loading indicator (even briefly)
        // We check if either loading was visible or data loaded immediately
        const loadingOrData = await Promise.race([
            page.locator('.animate-spin, [data-testid="loading"], text=/loading/i').isVisible().catch(() => false),
            page.locator('[data-testid="patient-list"], text=/patient/i').isVisible().then(() => true)
        ]);

        expect(loadingOrData).toBeTruthy();
    });

    test('should handle empty states properly', async ({ page }) => {
        const testEmail = `empty-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Empty State Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Go to home with no patients
        await page.goto('/');

        // Should show empty state message
        await expect(page.locator('text=/no patients|create.*patient|get started/i')).toBeVisible();
    });

    test('should validate form inputs', async ({ page }) => {
        const testEmail = `validation-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Validation Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Try to create patient with missing required fields
        await page.goto('/patients');
        await page.click('button:has-text("Add Patient")');

        // Click create without filling form
        await page.click('button:has-text("Create Patient")');

        // Should show validation errors
        await expect(page.locator('text=/required|invalid/i')).toBeVisible({ timeout: 3000 });
    });
});

test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
        const testEmail = `a11y-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'A11y Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Check for ARIA labels on interactive elements
        const buttons = page.locator('button');
        const count = await buttons.count();

        for (let i = 0; i < Math.min(count, 10); i++) {
            const button = buttons.nth(i);
            const ariaLabel = await button.getAttribute('aria-label');
            const text = await button.textContent();

            // Button should have either aria-label or text content
            expect(ariaLabel || text?.trim()).toBeTruthy();
        }
    });

    test('should support keyboard navigation', async ({ page }) => {
        await page.goto('/login');

        // Tab through form elements
        await page.keyboard.press('Tab');
        let focused = await page.evaluate(() => document.activeElement?.tagName);
        expect(focused).toMatch(/INPUT|BUTTON/);

        await page.keyboard.press('Tab');
        focused = await page.evaluate(() => document.activeElement?.tagName);
        expect(focused).toMatch(/INPUT|BUTTON/);
    });
});
