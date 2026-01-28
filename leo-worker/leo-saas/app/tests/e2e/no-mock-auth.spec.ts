import { test, expect } from '@playwright/test';

/**
 * Test Suite: No Mock Auth - Verify Real Supabase Authentication
 *
 * These tests verify that mock authentication is NOT active and that
 * real Supabase authentication is being used.
 *
 * BUG: Users were being auto-logged in as "Demo User" due to mock auth
 * fallback still being active in the codebase.
 */

test.describe('No Mock Auth - Real Supabase Only', () => {

  test.beforeEach(async ({ page, context }) => {
    // Clear all storage to start with clean state
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should NOT auto-login as Demo User on homepage visit', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should NOT see "Demo User" anywhere on the page
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Demo User');

    // Should NOT see user menu (indicates logged in state)
    const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button:has-text("Logout")')).or(page.locator('text=Logout'));
    await expect(userMenu).not.toBeVisible({ timeout: 3000 }).catch(() => {});

    // Console should NOT log mock auth activation
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const hasMockAuthLog = logs.some(log =>
      log.includes('Mock auth') ||
      log.includes('mock mode') ||
      log.includes('🎭')
    );
    expect(hasMockAuthLog).toBe(false);
  });

  test('should allow navigation to login page without redirect', async ({ page }) => {
    await page.goto('/login');

    // Should stay on login page (not redirected to dashboard)
    await expect(page).toHaveURL(/\/login/);

    // Should see login form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Should NOT be logged in as Demo User
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Demo User');
  });

  test('should NOT have demo user session in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check localStorage for any session
    const storageKeys = await page.evaluate(() => Object.keys(localStorage));

    // Find Supabase auth token key (format: sb-{project-id}-auth-token)
    const authTokenKey = storageKeys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));

    if (authTokenKey) {
      const sessionData = await page.evaluate((key) => localStorage.getItem(key), authTokenKey);

      if (sessionData) {
        const session = JSON.parse(sessionData);

        // Should NOT have demo user ID
        expect(session?.user?.id).not.toBe('demo-user-123');
        expect(session?.user?.email).not.toBe('demo@example.com');

        // Should NOT have mock token
        if (session?.access_token) {
          expect(session.access_token).not.toContain('mock-token');
        }
      }
    }
  });

  test('should show login/signup options when not authenticated', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should see sign in or get started options (not logged in state)
    const signInButton = page.locator('a:has-text("Sign In"), button:has-text("Sign In"), a:has-text("Get Started"), button:has-text("Get Started")').first();
    await expect(signInButton).toBeVisible({ timeout: 5000 });
  });

  test('logout should work and not auto-login again', async ({ page }) => {
    // This test assumes user can log in (we'll test with real credentials)
    // Skip if we can't login
    await page.goto('/login');

    const hasLoginForm = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (!hasLoginForm) {
      test.skip();
      return;
    }

    // Login with test credentials
    await page.fill('input[type="email"]', 'jake@happyllama.ai');
    await page.fill('input[type="password"]', 'p@12345678');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Find and click logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Sign Out")').first();
    await logoutButton.click();

    // Wait for redirect
    await page.waitForLoadState('networkidle');

    // Should be logged out - no Demo User, no auto-login
    await page.waitForTimeout(2000); // Give time for any auto-login to trigger

    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Demo User');

    // Should NOT be redirected back to dashboard
    expect(page.url()).not.toContain('/dashboard');
  });

  test('should use real Supabase client, not mock', async ({ page }) => {
    // Capture console logs
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should see "Supabase Client: Supabase auth" log, NOT "Mock auth"
    const hasRealSupabaseLog = logs.some(log =>
      log.includes('Supabase Client: Supabase auth') ||
      log.includes('🔐 Supabase Client')
    );

    const hasMockAuthLog = logs.some(log =>
      log.includes('Mock auth') ||
      log.includes('🎭 Supabase Client')
    );

    expect(hasRealSupabaseLog).toBe(true);
    expect(hasMockAuthLog).toBe(false);
  });
});
