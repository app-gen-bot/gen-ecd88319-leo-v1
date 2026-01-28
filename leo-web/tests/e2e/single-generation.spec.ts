import { test, expect } from '@playwright/test';

/**
 * Single App Generation End-to-End Test
 *
 * Tests ONE complete workflow: Login → Submit → Monitor → Download/Deploy
 */

const TEST_USER = {
  email: 'playwright-test@happyllama.ai',
  password: 'TestPassword123!',
};

const TEST_APP_PROMPT = 'Create a simple counter app with increment and decrement buttons. Use React with inline styles. Keep it minimal.';

test.describe('Single App Generation E2E', () => {
  test.setTimeout(600000); // 10 minutes for full generation

  test('complete app generation workflow', async ({ page }) => {
    console.log('\n🚀 Starting single app generation test...\n');

    // Step 1: Navigate to login
    console.log('📝 Step 1: Navigating to login page...');
    await page.goto('/login');
    await page.screenshot({ path: 'test-results/01-login-page.png', fullPage: true });
    console.log('   Screenshot saved: 01-login-page.png');

    // Step 2: Login
    console.log('\n📝 Step 2: Logging in...');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.screenshot({ path: 'test-results/02-credentials-filled.png', fullPage: true });

    const loginButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i });
    await loginButton.click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await page.screenshot({ path: 'test-results/03-dashboard-loaded.png', fullPage: true });
    console.log('   ✅ Login successful');
    console.log('   Screenshot saved: 03-dashboard-loaded.png');

    // Step 3: Submit generation request
    console.log('\n📝 Step 3: Submitting generation request...');
    const textarea = page.locator('textarea#prompt');
    const generateButton = page.getByRole('button', { name: /generate app/i });

    await textarea.fill(TEST_APP_PROMPT);
    await page.screenshot({ path: 'test-results/04-prompt-filled.png', fullPage: true });
    console.log(`   Prompt: "${TEST_APP_PROMPT}"`);

    await generateButton.click();

    // Wait for submission
    await expect(textarea).toHaveValue('', { timeout: 5000 });
    await page.screenshot({ path: 'test-results/05-request-submitted.png', fullPage: true });
    console.log('   ✅ Request submitted');
    console.log('   Screenshot saved: 05-request-submitted.png');

    // Step 4: Wait for request to appear
    console.log('\n📝 Step 4: Waiting for request to appear in list...');
    await page.waitForTimeout(4000); // Wait for polling

    // Look for the status badge (QUEUED, GENERATING, etc.)
    const statusBadge = page.getByText(/QUEUED|GENERATING|COMPLETED|FAILED/).first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/06-request-visible.png', fullPage: true });
    console.log('   ✅ Request visible in list');

    // Step 5: Monitor generation progress
    console.log('\n📝 Step 5: Monitoring generation (checking every 10s)...');
    let currentStatus = 'QUEUED';
    let iterations = 0;
    const maxIterations = 60; // 10 minutes max

    while (currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED' && iterations < maxIterations) {
      await page.waitForTimeout(10000); // Check every 10 seconds
      iterations++;

      // Find the first status badge on the page (should be our new request)
      const firstStatus = page.getByText(/QUEUED|GENERATING|COMPLETED|FAILED/).first();
      const statusText = await firstStatus.textContent().catch(() => '');

      if (statusText && statusText !== currentStatus) {
        currentStatus = statusText;
        console.log(`   Status: ${currentStatus} (${iterations * 10}s elapsed)`);
        await page.screenshot({
          path: `test-results/07-status-${currentStatus.toLowerCase()}-${iterations}.png`,
          fullPage: true
        });
      }

      // Every 30 seconds, take a screenshot
      if (iterations % 3 === 0) {
        await page.screenshot({
          path: `test-results/progress-${iterations * 10}s.png`,
          fullPage: true
        });
        console.log(`   📸 Progress screenshot at ${iterations * 10}s`);
      }
    }

    // Check final status
    if (iterations >= maxIterations) {
      await page.screenshot({ path: 'test-results/99-timeout.png', fullPage: true });
      throw new Error('Generation timed out after 10 minutes');
    }

    console.log(`\n✅ Generation ${currentStatus.toLowerCase()} after ${iterations * 10}s\n`);
    await page.screenshot({ path: 'test-results/08-final-status.png', fullPage: true });

    // Step 6: Verify completion and actions
    if (currentStatus === 'COMPLETED') {
      console.log('📝 Step 6: Verifying completion...');

      // Check for download button (look for any download button)
      const downloadButton = page.getByRole('button', { name: /download/i }).first();
      const hasDownload = await downloadButton.isVisible().catch(() => false);

      if (hasDownload) {
        console.log('   ✅ Download button available');
        await downloadButton.scrollIntoViewIfNeeded();
        await page.screenshot({ path: 'test-results/09-download-available.png' });
      } else {
        console.log('   ⚠️  No download button found');
      }

      // Check for GitHub/Deploy button
      const deployButton = page.getByRole('button', { name: /deploy/i }).first();
      const hasDeploy = await deployButton.isVisible().catch(() => false);

      if (hasDeploy) {
        console.log('   ✅ Deploy button available');
        await deployButton.scrollIntoViewIfNeeded();
        await page.screenshot({ path: 'test-results/10-deploy-available.png' });
      } else {
        console.log('   ℹ️  No deploy button (expected in local mode without GitHub integration)');
      }

      // Check for logs (look for "Generation Logs" heading)
      const logViewer = page.getByRole('heading', { name: /generation logs/i });
      const hasLogs = await logViewer.isVisible().catch(() => false);

      if (hasLogs) {
        console.log(`   ✅ Logs viewer visible`);
      }

      await page.screenshot({ path: 'test-results/11-final-complete.png', fullPage: true });
      console.log('\n🎉 App generation completed successfully!\n');

    } else if (currentStatus === 'FAILED') {
      console.log('❌ Generation failed');

      await page.screenshot({ path: 'test-results/99-failed.png', fullPage: true });
      throw new Error('Generation failed - check screenshots and logs');
    }
  });
});
