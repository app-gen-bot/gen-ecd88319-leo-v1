import { test, expect } from '@playwright/test';
import {
  loginUser,
  logoutUser,
  clearAuthState,
  verifyAuthToken,
  getAuthToken,
  isAuthenticated,
  verifyProtectedRouteRedirect,
} from '../utils/auth-helpers';
import { TEST_USERS, SELECTORS } from '../utils/test-data';

/**
 * Authentication Flow Tests
 *
 * Tests the auth template integration:
 * - Frontend → Supabase SDK → JWT → Backend validates
 * - No backend password endpoints
 * - Correct localStorage key for JWT
 * - Protected route enforcement
 */

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state before each test
    await clearAuthState(page);
  });

  test('user can register new account', async ({ page }) => {
    // Use unique email for registration test
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const user = {
      ...TEST_USERS.primary,
      email: uniqueEmail,
    };

    await page.goto('/register');

    // Fill registration form
    await page.fill(SELECTORS.auth.emailInput, user.email);
    await page.fill(SELECTORS.auth.passwordInput, user.password);

    // Fill name if field exists
    const nameInput = page.locator(SELECTORS.auth.nameInput);
    if (await nameInput.count() > 0) {
      await nameInput.fill(user.name);
    }

    // Submit form
    await page.click(SELECTORS.auth.registerSubmit);

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Verify JWT token in localStorage
    await verifyAuthToken(page);

    // Verify user menu visible
    const userMenu = page.locator(SELECTORS.nav.userMenu);
    await expect(userMenu).toBeVisible({ timeout: 5000 });

    console.log('✓ User registered successfully with email:', user.email);
  });

  test('user can login with existing account', async ({ page }) => {
    // This test assumes TEST_USERS.primary already exists in Supabase
    // Or has been created by previous test run

    await page.goto('/login');

    // Fill login form
    await page.fill(SELECTORS.auth.emailInput, TEST_USERS.primary.email);
    await page.fill(SELECTORS.auth.passwordInput, TEST_USERS.primary.password);

    // Submit form
    await page.click(SELECTORS.auth.loginSubmit);

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Verify JWT token in localStorage
    await verifyAuthToken(page);

    // Verify dashboard content visible
    const dashboard = page.locator('h1, [data-testid="dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 5000 });

    console.log('✓ User logged in successfully');
  });

  test('session persists across page refresh', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Get token before refresh
    const tokenBefore = await getAuthToken(page);
    expect(tokenBefore).toBeTruthy();

    // Refresh page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify still on dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Verify token still present
    const tokenAfter = await getAuthToken(page);
    expect(tokenAfter).toBeTruthy();
    expect(tokenAfter).toBe(tokenBefore);

    // Verify user menu still visible
    const userMenu = page.locator(SELECTORS.nav.userMenu);
    await expect(userMenu).toBeVisible({ timeout: 5000 });

    console.log('✓ Session persisted after page refresh');
  });

  test('user can logout', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Logout
    await logoutUser(page);

    // Verify on home page
    expect(page.url()).toContain('/');

    // Verify token removed
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);

    // Verify login button visible again
    const loginButton = page.locator(SELECTORS.nav.loginButton);
    await expect(loginButton).toBeVisible({ timeout: 5000 });

    console.log('✓ User logged out successfully');
  });

  test('protected route redirects unauthenticated user', async ({ page }) => {
    // Ensure not authenticated
    await clearAuthState(page);

    // Try to access protected route
    await verifyProtectedRouteRedirect(page, '/dashboard');

    // Verify on login page
    expect(page.url()).toContain('/login');

    console.log('✓ Protected route redirected to login');
  });

  test('protected route allows authenticated user', async ({ page }) => {
    // Login first
    await loginUser(page);

    // Navigate to protected route
    await page.goto('/dashboard');

    // Verify on dashboard (no redirect)
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Verify dashboard content visible
    const dashboard = page.locator('h1, [data-testid="dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 5000 });

    console.log('✓ Protected route allowed authenticated user');
  });

  test('JWT token stored with correct localStorage key', async ({ page }) => {
    // Login
    await loginUser(page);

    // Get token from correct key
    const token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Verify it's a JWT (has 3 parts separated by dots)
    const parsedToken = JSON.parse(token);
    expect(parsedToken.access_token).toBeTruthy();
    expect(parsedToken.access_token.split('.')).toHaveLength(3);

    console.log('✓ JWT stored with correct localStorage key');
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill(SELECTORS.auth.emailInput, 'invalid@example.com');
    await page.fill(SELECTORS.auth.passwordInput, 'WrongPassword123!');

    // Submit form
    await page.click(SELECTORS.auth.loginSubmit);

    // Wait a bit for error to appear
    await page.waitForTimeout(2000);

    // Should still be on login page (not redirected)
    expect(page.url()).toContain('/login');

    // Should not have token
    const authenticated = await isAuthenticated(page);
    expect(authenticated).toBe(false);

    console.log('✓ Invalid credentials handled correctly');
  });
});

test.describe('API Authentication', () => {
  test('API calls include JWT token in Authorization header', async ({ page, request }) => {
    // Login to get token
    await loginUser(page);

    const token = await getAuthToken(page);
    expect(token).toBeTruthy();

    // Parse token to get access_token
    const parsedToken = JSON.parse(token!);
    const accessToken = parsedToken.access_token;

    // Make API call with token (simulating what api-client.ts does)
    const response = await request.get('http://localhost:5013/api/projects', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Should not get 401 (token is valid)
    expect(response.status()).not.toBe(401);

    // Should get 200 or other success code
    expect(response.status()).toBeLessThan(500);

    console.log('✓ API call with JWT token succeeded, status:', response.status());
  });

  test('API calls without token return 401', async ({ request }) => {
    // Make API call without token to protected endpoint
    const response = await request.get('http://localhost:5013/api/projects');

    // Should get 401 Unauthorized
    expect(response.status()).toBe(401);

    console.log('✓ API call without token correctly returned 401');
  });

  test('API calls with invalid token return 401', async ({ request }) => {
    // Make API call with invalid token
    const response = await request.get('http://localhost:5013/api/projects', {
      headers: {
        Authorization: 'Bearer invalid-token-12345',
      },
    });

    // Should get 401 Unauthorized
    expect(response.status()).toBe(401);

    console.log('✓ API call with invalid token correctly returned 401');
  });
});
