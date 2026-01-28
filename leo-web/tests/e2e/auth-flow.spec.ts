import { test, expect } from '@playwright/test';

// Test user credentials - DO NOT CHANGE
// This user will be created in Supabase and reused across test runs
const TEST_USER = {
  email: 'playwright-test@happyllama.ai',
  password: 'TestPassword123!',
  name: 'Playwright Test User'
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage to ensure clean state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  // This test is skipped because user already exists
  // Once all tests pass, user registration will be turned off in Supabase
  test.skip('should sign up a new user', async ({ page }) => {
    await page.goto('/login');

    // Wait for login page to load
    await expect(page).toHaveURL(/\/login/);

    // Click "Create one now" link at bottom of form
    const createAccountLink = page.getByText(/create one now/i);
    await createAccountLink.click();

    // Wait for signup form to appear (URL might change or just form updates)
    await page.waitForTimeout(500);

    // Fill in sign up form
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Check if there's a name field (some forms have it)
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    if (await nameInput.count() > 0) {
      await nameInput.fill(TEST_USER.name);
    }

    // Click sign up submit button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for successful signup (auto-login to dashboard)
    await page.waitForURL(/\/dashboard|\/(?!login)/, { timeout: 10000 });

    // Verify we're authenticated (check for logout button in header)
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible({ timeout: 5000 });

    console.log('✅ Sign up successful - auto-logged in');
  });

  test('should login with existing user', async ({ page }) => {
    await page.goto('/login');

    // If we see "Already have an account" link, click it to show login form
    const alreadyHaveAccountLink = page.getByText(/already have an account|sign in/i);
    if (await alreadyHaveAccountLink.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await alreadyHaveAccountLink.first().click();
      await page.waitForTimeout(500);
    }

    // Fill in login credentials
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Click login submit button
    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i });
    await loginButton.click();

    // Wait for redirect to dashboard or home
    await page.waitForURL(/\/dashboard|\/(?!login)/, { timeout: 10000 });

    // Verify we're logged in (check for Logout button in header)
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible({ timeout: 5000 });

    console.log('✅ Login successful');
  });

  test('should logout successfully', async ({ page }) => {
    // First, login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i });
    await loginButton.click();
    await page.waitForURL(/\/dashboard|\/(?!login)/, { timeout: 10000 });

    // Click the Logout button directly (visible in header)
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await logoutButton.click();

    // Should redirect to home or login page
    await page.waitForURL(/\/login|\/(?!dashboard)/, { timeout: 10000 });

    // Verify we're logged out - should NOT be on dashboard
    await expect(page).not.toHaveURL(/\/dashboard/);

    console.log('✅ Logout successful');
  });

  test('should login again after logout', async ({ page }) => {
    // This verifies that logout properly cleared session
    // and we can log back in

    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Login
    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i });
    await loginButton.click();

    // Verify successful login
    await page.waitForURL(/\/dashboard|\/(?!login)/, { timeout: 10000 });
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible({ timeout: 5000 });

    console.log('✅ Re-login successful');
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Try to login with wrong password
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', 'WrongPassword123!');

    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i });
    await loginButton.click();

    // Should see error message
    const errorMessage = page.getByText(/invalid|incorrect|wrong|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Should NOT be redirected to dashboard
    await expect(page).toHaveURL(/\/login/);

    console.log('✅ Invalid credentials rejected as expected');
  });

  test('should not show Demo User anywhere', async ({ page }) => {
    await page.goto('/');

    // Check entire page for "Demo User"
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Demo User');

    // Check console logs
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.reload();
    await page.waitForLoadState('networkidle');

    const hasMockAuthLog = logs.some(log =>
      log.includes('Mock auth') ||
      log.includes('Demo User') ||
      log.includes('mock mode')
    );
    expect(hasMockAuthLog).toBe(false);

    console.log('✅ No Demo User found');
  });
});
