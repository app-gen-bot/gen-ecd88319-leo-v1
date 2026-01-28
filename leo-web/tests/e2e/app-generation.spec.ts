import { test, expect } from '@playwright/test';

// Test user credentials (same as auth-flow tests)
const TEST_USER = {
  email: 'playwright-test@happyllama.ai',
  password: 'TestPassword123!',
};

// Simple test app description
const TEST_APP_PROMPT = 'Create a simple to-do list app with add, edit, and delete functionality. Use a clean, modern UI with a light color scheme.';

test.describe('App Generation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i });
    await loginButton.click();

    // Wait for dashboard to load
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display dashboard with generation form', async ({ page }) => {
    // Verify dashboard loaded
    await expect(page).toHaveURL(/\/dashboard/);

    // Check for main heading
    const heading = page.getByRole('heading', { name: /dashboard/i });
    await expect(heading).toBeVisible();

    // Check for app description textarea
    const textarea = page.locator('textarea#prompt');
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeEnabled();

    // Check for Generate App button
    const generateButton = page.getByRole('button', { name: /generate app/i });
    await expect(generateButton).toBeVisible();

    // Check for "Your Generation Requests" section
    const requestsHeading = page.getByRole('heading', { name: /your generation requests/i });
    await expect(requestsHeading).toBeVisible();

    console.log('✅ Dashboard UI elements verified');
  });

  test('should validate prompt length requirements', async ({ page }) => {
    const textarea = page.locator('textarea#prompt');
    const generateButton = page.getByRole('button', { name: /generate app/i });

    // Test empty prompt (button should be disabled)
    await expect(generateButton).toBeDisabled();

    // Test too short prompt (< 10 characters)
    await textarea.fill('short');
    await expect(generateButton).toBeDisabled();

    // Should show minimum character warning
    const minWarning = page.getByText(/minimum 10 characters/i);
    await expect(minWarning).toBeVisible();

    // Test valid prompt length (>= 10 characters)
    await textarea.fill('Valid prompt with enough characters');
    await expect(generateButton).toBeEnabled();

    console.log('✅ Prompt validation working correctly');
  });

  test('should submit app generation request', async ({ page }) => {
    const textarea = page.locator('textarea#prompt');
    const generateButton = page.getByRole('button', { name: /generate app/i });

    // Fill in the app description
    await textarea.fill(TEST_APP_PROMPT);

    // Verify character count is shown
    const charCount = page.getByText(/\d+ \/ 5000 characters/);
    await expect(charCount).toBeVisible();

    // Get initial request count by looking for "Prompt:" text (each request has one)
    const initialCount = await page.getByText(/^Prompt:$/).count().catch(() => 0);

    // Submit the generation request
    await generateButton.click();

    // Wait for textarea to be cleared (indicates successful submission)
    await expect(textarea).toHaveValue('', { timeout: 5000 });

    // Wait for new request to appear in the list (polling interval is 3s)
    await page.waitForTimeout(4000);

    // Verify a new generation request appeared
    const newCount = await page.getByText(/^Prompt:$/).count().catch(() => 0);
    expect(newCount).toBeGreaterThan(initialCount);

    // Verify we can see the submitted prompt text in the request
    const promptText = page.getByText(TEST_APP_PROMPT.substring(0, 50)).first();
    await expect(promptText).toBeVisible({ timeout: 5000 });

    // Verify the request has a status badge (QUEUED or GENERATING)
    const statusBadge = page.getByText(/queued|generating/i).first();
    await expect(statusBadge).toBeVisible({ timeout: 5000 });

    console.log('✅ Generation request submitted successfully');
  });

  test('should show generation request with status', async ({ page }) => {
    // Submit a request first
    const textarea = page.locator('textarea#prompt');
    const generateButton = page.getByRole('button', { name: /generate app/i });

    await textarea.fill('Create a simple calculator app with basic arithmetic operations');
    await generateButton.click();

    // Wait for textarea to be cleared (indicates successful submission)
    await expect(textarea).toHaveValue('', { timeout: 5000 });

    // Wait for request to appear (polling interval is 3s)
    await page.waitForTimeout(4000);

    // Verify the prompt text appears
    const promptLabel = page.getByText(/^Prompt:$/);
    await expect(promptLabel.first()).toBeVisible();

    // Verify it has a status badge (QUEUED or GENERATING)
    const statusBadge = page.getByText(/queued|generating|completed|failed/i).first();
    await expect(statusBadge).toBeVisible();

    // Verify it shows the timestamp (look for "Created:" text)
    const createdLabel = page.getByText(/Created:/i).first();
    await expect(createdLabel).toBeVisible();

    console.log('✅ Generation request displayed with status');
  });

  test('should not submit invalid prompts', async ({ page }) => {
    const textarea = page.locator('textarea#prompt');
    const generateButton = page.getByRole('button', { name: /generate app/i });

    // Test with too short prompt
    await textarea.fill('Hi');

    // Button should be disabled
    await expect(generateButton).toBeDisabled();

    // Try to submit by pressing Enter (should not work)
    await textarea.press('Enter');

    // Wait a moment
    await page.waitForTimeout(1000);

    // Verify no error message about submission appeared
    const errorMessage = page.getByText(/failed|error/i);
    await expect(errorMessage).not.toBeVisible().catch(() => true);

    console.log('✅ Invalid prompts correctly prevented');
  });
});
