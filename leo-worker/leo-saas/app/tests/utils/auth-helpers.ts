import { Page, expect } from '@playwright/test';
import { TEST_USERS, SELECTORS, LOCAL_STORAGE_KEYS } from './test-data';

/**
 * Auth Helper Functions
 *
 * Reusable utilities for authentication in Playwright tests
 */

/**
 * Register a new user via the registration page
 */
export async function registerUser(
  page: Page,
  user = TEST_USERS.primary
): Promise<void> {
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
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Verify auth token in localStorage
  await verifyAuthToken(page);
}

/**
 * Login an existing user via the login page
 */
export async function loginUser(
  page: Page,
  user = TEST_USERS.primary
): Promise<void> {
  await page.goto('/login');

  // Fill login form
  await page.fill(SELECTORS.auth.emailInput, user.email);
  await page.fill(SELECTORS.auth.passwordInput, user.password);

  // Submit form
  await page.click(SELECTORS.auth.loginSubmit);

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Verify auth token in localStorage
  await verifyAuthToken(page);
}

/**
 * Logout the current user
 */
export async function logoutUser(page: Page): Promise<void> {
  // Click user menu if not already open
  const userMenu = page.locator(SELECTORS.nav.userMenu);
  if (await userMenu.count() > 0) {
    await userMenu.click();
  }

  // Click logout button
  await page.click(SELECTORS.nav.logoutButton);

  // Wait for redirect to home page
  await page.waitForURL('/', { timeout: 5000 });

  // Verify auth token removed from localStorage
  const token = await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, LOCAL_STORAGE_KEYS.authToken);

  expect(token).toBeNull();
}

/**
 * Verify that auth token exists in localStorage
 */
export async function verifyAuthToken(page: Page): Promise<void> {
  const token = await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, LOCAL_STORAGE_KEYS.authToken);

  expect(token).toBeTruthy();
  // Token is a JSON object containing access_token (which is base64 encoded)
  // or could be a plain JWT string - both are valid
  expect(token!.length).toBeGreaterThan(10);
}

/**
 * Get auth token from localStorage
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate((key) => {
    return localStorage.getItem(key);
  }, LOCAL_STORAGE_KEYS.authToken);
}

/**
 * Set auth token in localStorage (for test setup)
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: LOCAL_STORAGE_KEYS.authToken, value: token }
  );
}

/**
 * Clear all auth state
 * Navigates to home page first if needed to establish origin for localStorage access
 */
export async function clearAuthState(page: Page): Promise<void> {
  // Navigate to home page if not already on a page (establishes origin for localStorage)
  const currentUrl = page.url();
  if (!currentUrl || currentUrl === 'about:blank') {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  }

  // Now safe to access localStorage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const token = await getAuthToken(page);
  return token !== null && token.length > 0;
}

/**
 * Wait for auth state to change
 */
export async function waitForAuthChange(
  page: Page,
  expectedState: boolean,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const authenticated = await isAuthenticated(page);
    if (authenticated === expectedState) {
      return;
    }
    await page.waitForTimeout(100);
  }

  throw new Error(
    `Timeout waiting for auth state to change to ${expectedState}`
  );
}

/**
 * Setup authenticated session (fast path for tests that don't test auth)
 */
export async function setupAuthenticatedSession(
  page: Page,
  user = TEST_USERS.primary
): Promise<void> {
  // Try to login (will register if needed)
  try {
    await loginUser(page, user);
  } catch (error) {
    // If login fails, try registration
    console.log('Login failed, attempting registration...');
    await registerUser(page, user);
  }
}

/**
 * Verify protected route redirects to login
 */
export async function verifyProtectedRouteRedirect(
  page: Page,
  protectedPath: string
): Promise<void> {
  await page.goto(protectedPath);
  await page.waitForURL('**/login', { timeout: 5000 });
}
