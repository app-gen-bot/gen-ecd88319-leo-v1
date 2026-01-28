import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};

const SIMPLE_APP_PROMPT = 'Create a simple counter app with increment and decrement buttons. Use React with inline styles. Keep it minimal.';

test.describe('App Generation and Deployment E2E', () => {
  test('complete workflow: generate app and deploy to Fly.io', async ({ page }) => {
    console.log('\n🚀 Starting generation and deployment test...');

    // Step 1: Login
    console.log('\n📝 Step 1: Logging in...');
    await page.goto('/login');
    await page.screenshot({ path: 'test-results/deploy-01-login.png' });

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    const loginButton = page.getByRole('button', { name: /sign in/i });
    await loginButton.click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    console.log('   ✅ Login successful');
    await page.screenshot({ path: 'test-results/deploy-02-dashboard.png' });

    // Step 2: Submit generation request
    console.log('\n📝 Step 2: Submitting generation request...');
    const textarea = page.getByRole('textbox').first();
    await textarea.fill(SIMPLE_APP_PROMPT);

    const generateButton = page.getByRole('button', { name: /generate/i }).first();
    await generateButton.click();

    console.log(`   Prompt: "${SIMPLE_APP_PROMPT}"`);
    console.log('   ✅ Request submitted');
    await page.screenshot({ path: 'test-results/deploy-03-submitted.png' });

    // Step 3: Wait for completion
    console.log('\n📝 Step 3: Waiting for generation to complete...');
    console.log('   Polling status every 10 seconds...');

    let currentStatus = 'queued';
    let iterations = 0;
    const maxIterations = 60; // 10 minutes max

    while (currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED' && iterations < maxIterations) {
      await page.waitForTimeout(10000); // Wait 10 seconds
      iterations++;

      // Get the first status badge
      const firstStatus = page.locator('[data-testid="request-status"]').first();
      const statusText = await firstStatus.textContent();

      if (statusText && statusText !== currentStatus) {
        currentStatus = statusText;
        console.log(`   Status: ${currentStatus} (${iterations * 10}s elapsed)`);
        await page.screenshot({
          path: `test-results/deploy-04-status-${currentStatus.toLowerCase()}-${iterations}.png`
        });
      }
    }

    if (currentStatus === 'FAILED') {
      throw new Error('Generation failed');
    }

    if (iterations >= maxIterations) {
      throw new Error('Generation timeout - took longer than 10 minutes');
    }

    console.log(`\n✅ Generation completed after ${iterations * 10}s`);

    // Step 4: Verify Deploy button is visible
    console.log('\n📝 Step 4: Finding Deploy button...');
    const deployButton = page.getByRole('button', { name: /deploy/i }).first();
    await expect(deployButton).toBeVisible({ timeout: 5000 });
    console.log('   ✅ Deploy button found');
    await page.screenshot({ path: 'test-results/deploy-05-ready-to-deploy.png' });

    // Step 5: Click Deploy button to open modal
    console.log('\n📝 Step 5: Opening deployment modal...');
    await deployButton.click();
    await page.waitForTimeout(1000);

    // Verify modal is open
    const modalTitle = page.getByText('Deploy to Fly.io');
    await expect(modalTitle).toBeVisible();
    console.log('   ✅ Deployment modal opened');
    await page.screenshot({ path: 'test-results/deploy-06-modal-opened.png' });

    // Step 6: Click "Deploy to Fly.io Now" button
    console.log('\n📝 Step 6: Triggering automated deployment...');
    const deployNowButton = page.getByRole('button', { name: /deploy to fly\.io now/i });
    await expect(deployNowButton).toBeVisible();
    await deployNowButton.click();

    console.log('   ✅ Deployment triggered');
    console.log('   ⏳ Waiting for deployment to complete (this can take 5-10 minutes)...');
    await page.screenshot({ path: 'test-results/deploy-07-deploying.png' });

    // Step 7: Wait for deployment to complete
    let deploymentComplete = false;
    let deploymentIterations = 0;
    const maxDeploymentIterations = 120; // 20 minutes max for deployment

    while (!deploymentComplete && deploymentIterations < maxDeploymentIterations) {
      await page.waitForTimeout(10000); // Check every 10 seconds
      deploymentIterations++;

      // Check for success message
      const successMessage = page.getByText(/your app is live/i);
      const isVisible = await successMessage.isVisible().catch(() => false);

      if (isVisible) {
        deploymentComplete = true;
        console.log(`   ✅ Deployment completed after ${deploymentIterations * 10}s!`);
      } else {
        // Check for error
        const errorMessage = page.getByText(/deployment failed/i);
        const hasError = await errorMessage.isVisible().catch(() => false);

        if (hasError) {
          await page.screenshot({ path: 'test-results/deploy-08-error.png' });
          throw new Error('Deployment failed - check screenshot');
        }

        if (deploymentIterations % 6 === 0) { // Log every minute
          console.log(`   Still deploying... ${deploymentIterations * 10}s elapsed`);
          await page.screenshot({
            path: `test-results/deploy-progress-${deploymentIterations}.png`
          });
        }
      }
    }

    if (!deploymentComplete) {
      throw new Error('Deployment timeout - took longer than 20 minutes');
    }

    // Step 8: Verify deployment URL
    console.log('\n📝 Step 8: Verifying deployment URL...');
    await page.screenshot({ path: 'test-results/deploy-09-success.png' });

    // Look for the deployment URL link
    const deploymentLink = page.locator('a[href*="fly.dev"]').first();
    await expect(deploymentLink).toBeVisible();

    const deploymentUrl = await deploymentLink.getAttribute('href');
    console.log(`   ✅ Deployment URL: ${deploymentUrl}`);

    // Optional: Verify the deployed app is accessible
    console.log('\n📝 Step 9: Checking if deployed app is accessible...');
    if (deploymentUrl) {
      const response = await page.request.get(deploymentUrl);
      console.log(`   Response status: ${response.status()}`);

      if (response.status() === 200) {
        console.log('   ✅ Deployed app is accessible!');
      } else {
        console.log(`   ⚠️  App returned status ${response.status()} - might still be starting up`);
      }
    }

    console.log('\n🎉 Complete workflow test passed!\n');
  });
});
