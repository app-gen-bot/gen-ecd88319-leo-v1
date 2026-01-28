import { test, expect } from '@playwright/test';

/**
 * Full End-to-End App Generation Test
 *
 * This test submits a real generation request and waits for it to complete,
 * verifying the entire workflow from submission to generated output.
 */

// Test user credentials
const TEST_USER = {
  email: 'playwright-test@happyllama.ai',
  password: 'TestPassword123!',
};

// Simple app prompt that should generate quickly
const SIMPLE_APP_PROMPT = 'Create a minimal to-do list app. Include: 1) A text input to add tasks, 2) A list showing all tasks, 3) Delete button for each task. Use React and keep it very simple with inline styles.';

test.describe('Full App Generation Workflow', () => {
  // Increase timeout for generation tests (10 minutes)
  test.setTimeout(600000);

  test('should complete full app generation from submission to output', async ({ page }) => {
    console.log('\n🚀 Starting full app generation test...');

    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i });
    await loginButton.click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    console.log('✅ Login successful');

    // Step 2: Submit generation request
    console.log('\n📝 Step 2: Submitting generation request...');
    const textarea = page.locator('textarea#prompt');
    const generateButton = page.getByRole('button', { name: /generate app/i });

    await textarea.fill(SIMPLE_APP_PROMPT);
    await generateButton.click();

    // Wait for textarea to clear
    await expect(textarea).toHaveValue('', { timeout: 5000 });
    console.log('✅ Generation request submitted');

    // Step 3: Wait for request to appear in list
    console.log('\n📝 Step 3: Waiting for request to appear...');
    await page.waitForTimeout(4000); // Wait for polling interval

    // Find the most recent generation request (should be first in list)
    const firstRequest = page.locator('[data-testid="generation-request"]').first();
    await expect(firstRequest).toBeVisible({ timeout: 10000 });
    console.log('✅ Request appeared in list');

    // Step 4: Monitor status until completion
    console.log('\n📝 Step 4: Monitoring generation progress...');
    let currentStatus = 'QUEUED';
    let iterations = 0;
    const maxIterations = 120; // 10 minutes max (5 second checks)

    while (currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED' && iterations < maxIterations) {
      await page.waitForTimeout(5000);
      iterations++;

      // Get status from the first request
      const statusBadge = firstRequest.locator('[data-testid="request-status"]');
      const statusText = await statusBadge.textContent().catch(() => '');

      if (statusText && statusText !== currentStatus) {
        currentStatus = statusText;
        console.log(`   Status: ${currentStatus} (${iterations * 5}s elapsed)`);
      }

      // Check for View Logs button and click it to see logs
      const viewLogsButton = firstRequest.getByRole('button', { name: /view logs/i });
      if (await viewLogsButton.isVisible().catch(() => false)) {
        if (iterations === 1) {
          await viewLogsButton.click();
          console.log('   📄 Opened log viewer');
        }
      }
    }

    // Verify completion
    if (iterations >= maxIterations) {
      throw new Error('Generation timed out after 10 minutes');
    }

    console.log(`\n✅ Generation ${currentStatus.toLowerCase()} after ${iterations * 5}s`);

    // Step 5: Verify generation output
    if (currentStatus === 'COMPLETED') {
      console.log('\n📝 Step 5: Verifying generation output...');

      // Check for Download button
      const downloadButton = firstRequest.getByRole('button', { name: /download/i });
      await expect(downloadButton).toBeVisible({ timeout: 5000 });
      console.log('✅ Download button available');

      // Check for GitHub link (if GitHub integration is enabled)
      const githubLink = firstRequest.getByRole('link', { name: /view on github/i });
      if (await githubLink.isVisible().catch(() => false)) {
        console.log('✅ GitHub repository link available');
      } else {
        console.log('ℹ️  GitHub integration not enabled (expected in local mode)');
      }

      // Verify logs are visible
      const logViewer = page.locator('[data-testid="log-viewer"]');
      if (await logViewer.isVisible().catch(() => false)) {
        const logContent = await logViewer.textContent();
        expect(logContent).toBeTruthy();
        expect(logContent!.length).toBeGreaterThan(0);
        console.log(`✅ Logs captured (${logContent!.length} characters)`);
      }

      console.log('\n🎉 Full generation workflow completed successfully!');
    } else {
      // Generation failed - capture error logs
      console.log('\n❌ Generation failed');

      const logViewer = page.locator('[data-testid="log-viewer"]');
      if (await logViewer.isVisible().catch(() => false)) {
        const errorLogs = await logViewer.textContent();
        console.log('Error logs:', errorLogs);
      }

      throw new Error('Generation failed - check logs above');
    }
  });

  test('should handle multiple generation requests', async ({ page }) => {
    console.log('\n🚀 Testing multiple generation requests...');

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i });
    await loginButton.click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Submit first request
    const textarea = page.locator('textarea#prompt');
    const generateButton = page.getByRole('button', { name: /generate app/i });

    await textarea.fill('Create a simple counter app with increment and decrement buttons.');
    await generateButton.click();
    await expect(textarea).toHaveValue('', { timeout: 5000 });
    console.log('✅ First request submitted');

    // Wait for first to appear
    await page.waitForTimeout(4000);

    // Submit second request
    await textarea.fill('Create a simple color picker that shows the hex code.');
    await generateButton.click();
    await expect(textarea).toHaveValue('', { timeout: 5000 });
    console.log('✅ Second request submitted');

    // Wait and verify both appear
    await page.waitForTimeout(4000);

    const requests = page.locator('[data-testid="generation-request"]');
    const count = await requests.count();
    expect(count).toBeGreaterThanOrEqual(2);
    console.log(`✅ Multiple requests visible (${count} total)`);

    // Verify both have status badges
    const firstStatus = requests.first().locator('[data-testid="request-status"]');
    const secondStatus = requests.nth(1).locator('[data-testid="request-status"]');

    await expect(firstStatus).toBeVisible();
    await expect(secondStatus).toBeVisible();
    console.log('✅ All requests have status indicators');
  });
});
