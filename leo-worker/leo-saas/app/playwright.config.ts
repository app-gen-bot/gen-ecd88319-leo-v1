import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Launch Platform E2E Tests
 *
 * Tests the auth template integration and core features.
 * Uses real Supabase for authentication testing.
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Run tests sequentially to avoid auth state conflicts
  fullyParallel: false,

  // Fail build on .only in CI
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Single worker to avoid auth conflicts between tests
  workers: 1,

  // Test timeout
  timeout: 60000,

  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation (production server with built frontend)
    baseURL: 'http://localhost:5013',

    // Capture trace on first retry
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',

    // Videos on failure
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Test projects (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Server is manually managed (running on port 5013)
  // No webServer config needed - we start it ourselves
});
