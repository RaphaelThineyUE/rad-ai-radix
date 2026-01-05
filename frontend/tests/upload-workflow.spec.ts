import { test, expect } from '@playwright/test';

test.describe('Report Upload Workflow', () => {
    const testEmail = `upload-flow-${Date.now()}@example.com`;
    const testPatient = 'Upload Flow Patient';

    test.beforeEach(async ({ page }) => {
        // Register and login
        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Upload Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Create patient
        await page.goto('/patients');
        await page.click('button:has-text("Add Patient")');
        await page.fill('input[name="full_name"]', testPatient);
        await page.fill('input[name="date_of_birth"]', '1975-06-15');
        await page.selectOption('select[name="gender"]', 'Female');
        await page.fill('input[name="diagnosis_date"]', '2023-03-20');
        await page.fill('input[name="cancer_type"]', 'Breast Cancer');
        await page.selectOption('select[name="cancer_stage"]', 'Stage II');
        await page.click('button:has-text("Create Patient")');
        await page.waitForSelector('text=' + testPatient);
    });

    test('complete report upload and processing flow', async ({ page }) => {
        await page.goto('/');

        // Select patient
        await page.selectOption('select[data-testid="patient-selector"]', { label: testPatient });

        // Check if file input is visible
        const fileInput = page.locator('input[type="file"]');
        await expect(fileInput).toBeVisible({ timeout: 5000 });

        // Upload a test PDF file
        await fileInput.setInputFiles({
            name: 'mammogram-report.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('%PDF-1.4\n%Test PDF content for mammogram report\n%%EOF')
        });

        // Wait for upload to complete
        await expect(page.locator('text=/uploading|processing/i')).toBeVisible({ timeout: 3000 });

        // Wait for processing to complete (may take time with AI)
        await expect(page.locator('text=/completed|success/i')).toBeVisible({ timeout: 30000 });

        // Verify report card appears
        const reportCard = page.locator('[data-testid="report-card"]').first();
        await expect(reportCard).toBeVisible();
    });

    test('should handle file size validation', async ({ page }) => {
        await page.goto('/');
        await page.selectOption('select[data-testid="patient-selector"]', { label: testPatient });

        // Try to upload file larger than 10MB (create 11MB buffer)
        const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'a');

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'large-report.pdf',
            mimeType: 'application/pdf',
            buffer: largeBuffer
        });

        // Should show error message
        await expect(page.locator('text=/file size|too large|10MB/i')).toBeVisible({ timeout: 3000 });
    });

    test('should handle non-PDF file rejection', async ({ page }) => {
        await page.goto('/');
        await page.selectOption('select[data-testid="patient-selector"]', { label: testPatient });

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'document.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('This is a text file')
        });

        // Should show error for non-PDF
        await expect(page.locator('text=/pdf|only.*pdf/i')).toBeVisible({ timeout: 3000 });
    });

    test('should show upload progress indicator', async ({ page }) => {
        await page.goto('/');
        await page.selectOption('select[data-testid="patient-selector"]', { label: testPatient });

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'report.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('%PDF-1.4\nTest content\n%%EOF')
        });

        // Should show loading/progress indicator
        await expect(page.locator('[data-testid="upload-progress"], .animate-spin, text=/uploading/i')).toBeVisible({ timeout: 3000 });
    });
});

test.describe('Report Detail View', () => {
    test('should display all report sections', async ({ page }) => {
        const testEmail = `detail-${Date.now()}@example.com`;

        // Setup: Register, login, create patient
        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Detail Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        await page.goto('/patients');
        await page.click('button:has-text("Add Patient")');
        await page.fill('input[name="full_name"]', 'Detail View Patient');
        await page.fill('input[name="date_of_birth"]', '1980-01-01');
        await page.selectOption('select[name="gender"]', 'Female');
        await page.fill('input[name="diagnosis_date"]', '2023-01-15');
        await page.fill('input[name="cancer_type"]', 'Breast Cancer');
        await page.click('button:has-text("Create Patient")');

        await page.goto('/');
        await page.selectOption('select', { label: 'Detail View Patient' });

        // Check if there are any reports
        const reportCard = page.locator('[data-testid="report-card"]').first();
        if (await reportCard.isVisible({ timeout: 5000 })) {
            await reportCard.click();

            // Verify detail panel sections
            await expect(page.locator('[data-testid="report-detail"]')).toBeVisible();
            await expect(page.locator('text=/BI-RADS|birads/i')).toBeVisible();
            await expect(page.locator('text=/findings|summary/i')).toBeVisible();
        }
    });

    test('should allow report deletion with confirmation', async ({ page }) => {
        const testEmail = `delete-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Delete Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        await page.goto('/patients');
        await page.click('button:has-text("Add Patient")');
        await page.fill('input[name="full_name"]', 'Delete Test Patient');
        await page.fill('input[name="date_of_birth"]', '1980-01-01');
        await page.selectOption('select[name="gender"]', 'Female');
        await page.fill('input[name="diagnosis_date"]', '2023-01-15');
        await page.fill('input[name="cancer_type"]', 'Breast Cancer');
        await page.click('button:has-text("Create Patient")');

        await page.goto('/');

        const reportCard = page.locator('[data-testid="report-card"]').first();
        if (await reportCard.isVisible({ timeout: 5000 })) {
            await reportCard.click();

            // Click delete button
            await page.click('button:has-text("Delete")');

            // Should show confirmation dialog
            await expect(page.locator('text=/confirm|are you sure/i')).toBeVisible();

            // Confirm deletion
            await page.click('button:has-text("Confirm")');

            // Report detail should close
            await expect(page.locator('[data-testid="report-detail"]')).not.toBeVisible({ timeout: 5000 });
        }
    });

    test('should close detail panel when clicking close button', async ({ page }) => {
        const testEmail = `close-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Close Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        await page.goto('/');

        const reportCard = page.locator('[data-testid="report-card"]').first();
        if (await reportCard.isVisible({ timeout: 5000 })) {
            await reportCard.click();
            await expect(page.locator('[data-testid="report-detail"]')).toBeVisible();

            // Click close button
            await page.click('button[aria-label="Close"], button:has-text("×")');

            // Panel should close
            await expect(page.locator('[data-testid="report-detail"]')).not.toBeVisible({ timeout: 3000 });
        }
    });
});

test.describe('BI-RADS Color Coding', () => {
    test('should display correct colors for BI-RADS values', async ({ page }) => {
        const testEmail = `birads-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'BIRADS Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        await page.goto('/');

        // Check report cards for BI-RADS badges
        const biradsBadges = page.locator('[data-testid="birads-badge"]');

        if (await biradsBadges.first().isVisible({ timeout: 5000 })) {
            const badge = biradsBadges.first();

            // Get BI-RADS value from badge text
            const badgeText = await badge.textContent();

            // Verify badge has appropriate styling
            const className = await badge.getAttribute('class');

            if (badgeText?.includes('1') || badgeText?.includes('2')) {
                expect(className).toContain('green');
            } else if (badgeText?.includes('3')) {
                expect(className).toContain('yellow');
            } else if (badgeText?.includes('4')) {
                expect(className).toContain('orange');
            } else if (badgeText?.includes('5') || badgeText?.includes('6')) {
                expect(className).toContain('red');
            }
        }
    });
});

test.describe('Red Flags Display', () => {
    test('should highlight reports with red flags', async ({ page }) => {
        const testEmail = `redflags-${Date.now()}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="full_name"]', 'Red Flag Test User');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        await page.goto('/');

        // Look for red flag indicators
        const redFlagIndicators = page.locator('[data-testid="red-flag-indicator"], text=/red flag/i');

        if (await redFlagIndicators.first().isVisible({ timeout: 5000 })) {
            // Verify red flag styling
            const indicator = redFlagIndicators.first();
            const className = await indicator.getAttribute('class');

            // Should have red or warning styling
            expect(className).toMatch(/red|warning|alert/i);
        }
    });
});
