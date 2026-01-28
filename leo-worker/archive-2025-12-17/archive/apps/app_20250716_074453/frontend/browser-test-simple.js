const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPawsFlow() {
  console.log('🚀 Starting PawsFlow browser testing...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--window-size=1280,800']
  });

  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  const testResults = {
    passed: [],
    failed: [],
    screenshots: []
  };

  try {
    // Test 1: Homepage
    console.log('📄 Testing Homepage...');
    await page.goto('http://localhost:3007', { waitUntil: 'networkidle2' });
    await sleep(2000);
    const homepageScreenshot = path.join(screenshotsDir, '01-homepage.png');
    await page.screenshot({ path: homepageScreenshot, fullPage: true });
    testResults.passed.push('Homepage loaded successfully');
    testResults.screenshots.push(homepageScreenshot);
    console.log('✅ Homepage tested\n');

    // Test 2: Navigation - Features
    console.log('🔗 Testing Features page...');
    try {
      await page.click('a[href="/features"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await sleep(1000);
      const featuresScreenshot = path.join(screenshotsDir, '02-features.png');
      await page.screenshot({ path: featuresScreenshot, fullPage: true });
      testResults.passed.push('Features page navigation works');
      testResults.screenshots.push(featuresScreenshot);
      console.log('✅ Features page tested\n');
    } catch (e) {
      testResults.failed.push('Features page navigation failed: ' + e.message);
      console.log('❌ Features page navigation failed\n');
    }

    // Test 3: Navigation - Pricing
    console.log('💰 Testing Pricing page...');
    try {
      await page.click('a[href="/pricing"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await sleep(1000);
      const pricingScreenshot = path.join(screenshotsDir, '03-pricing.png');
      await page.screenshot({ path: pricingScreenshot, fullPage: true });
      testResults.passed.push('Pricing page navigation works');
      testResults.screenshots.push(pricingScreenshot);
      console.log('✅ Pricing page tested\n');
    } catch (e) {
      testResults.failed.push('Pricing page navigation failed: ' + e.message);
      console.log('❌ Pricing page navigation failed\n');
    }

    // Test 4: Login page
    console.log('🔐 Testing Login page...');
    try {
      await page.click('a[href="/login"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await sleep(1000);
      const loginScreenshot = path.join(screenshotsDir, '04-login.png');
      await page.screenshot({ path: loginScreenshot, fullPage: true });
      testResults.passed.push('Login page navigation works');
      testResults.screenshots.push(loginScreenshot);
      console.log('✅ Login page tested\n');
    } catch (e) {
      testResults.failed.push('Login page navigation failed: ' + e.message);
      console.log('❌ Login page navigation failed\n');
    }

    // Test 5: Demo Login
    console.log('🔑 Testing demo login...');
    try {
      // Fill in demo credentials
      await page.type('input[type="email"]', 'demo@example.com');
      await page.type('input[type="password"]', 'demo123');
      await sleep(500);
      
      // Take screenshot of filled form
      const loginFilledScreenshot = path.join(screenshotsDir, '05-login-filled.png');
      await page.screenshot({ path: loginFilledScreenshot });
      testResults.screenshots.push(loginFilledScreenshot);
      
      // Submit form
      await page.click('button[type="submit"]');
      await sleep(3000); // Wait for login processing
      
      // Check if we're on dashboard
      const currentUrl = page.url();
      const dashboardScreenshot = path.join(screenshotsDir, '06-dashboard.png');
      await page.screenshot({ path: dashboardScreenshot, fullPage: true });
      testResults.screenshots.push(dashboardScreenshot);
      
      if (currentUrl.includes('dashboard')) {
        testResults.passed.push('Demo login successful - redirected to dashboard');
        console.log('✅ Demo login successful\n');
      } else {
        testResults.failed.push('Demo login failed - still on: ' + currentUrl);
        console.log('❌ Demo login failed\n');
      }
    } catch (e) {
      testResults.failed.push('Demo login test failed: ' + e.message);
      console.log('❌ Demo login test failed\n');
    }

    // Test 6: Responsive Design
    console.log('📱 Testing Responsive Design...');
    
    // Go back to homepage
    await page.goto('http://localhost:3007', { waitUntil: 'networkidle2' });
    
    // Mobile view
    await page.setViewport({ width: 375, height: 667 });
    await sleep(1000);
    const mobileScreenshot = path.join(screenshotsDir, '07-mobile-view.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    testResults.screenshots.push(mobileScreenshot);
    console.log('✅ Mobile view (375x667) tested');
    
    // Tablet view
    await page.setViewport({ width: 768, height: 1024 });
    await sleep(1000);
    const tabletScreenshot = path.join(screenshotsDir, '08-tablet-view.png');
    await page.screenshot({ path: tabletScreenshot, fullPage: true });
    testResults.screenshots.push(tabletScreenshot);
    console.log('✅ Tablet view (768x1024) tested');
    
    // Desktop view
    await page.setViewport({ width: 1920, height: 1080 });
    await sleep(1000);
    const desktopScreenshot = path.join(screenshotsDir, '09-desktop-view.png');
    await page.screenshot({ path: desktopScreenshot, fullPage: true });
    testResults.screenshots.push(desktopScreenshot);
    console.log('✅ Desktop view (1920x1080) tested\n');
    
    testResults.passed.push('Responsive design tested at 3 viewports');

    // Test 7: Check for broken elements
    console.log('🔍 Checking for broken elements...');
    
    // Check images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => ({ src: img.src, alt: img.alt }));
    });
    
    if (brokenImages.length > 0) {
      testResults.failed.push(`Found ${brokenImages.length} broken images`);
      console.log(`❌ Found ${brokenImages.length} broken images:`);
      brokenImages.forEach(img => console.log(`   - ${img.src}`));
    } else {
      testResults.passed.push('All images loaded successfully');
      console.log('✅ All images loaded successfully');
    }
    
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await sleep(2000);
    
    if (consoleErrors.length > 0) {
      testResults.failed.push(`Found ${consoleErrors.length} console errors`);
      console.log(`\n❌ Found ${consoleErrors.length} console errors`);
    } else {
      testResults.passed.push('No console errors detected');
      console.log('✅ No console errors detected');
    }

    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testResults.passed.length} tests`);
    console.log(`❌ Failed: ${testResults.failed.length} tests`);
    console.log(`📸 Screenshots: ${testResults.screenshots.length} captured`);
    console.log('\nScreenshots saved to:', screenshotsDir);
    
    // Save test results
    const resultsPath = path.join(screenshotsDir, 'test-results.json');
    await fs.writeFile(resultsPath, JSON.stringify(testResults, null, 2));
    console.log('📄 Test results saved to:', resultsPath);

  } catch (error) {
    console.error('\n❌ Critical error during testing:', error);
    testResults.failed.push('Critical error: ' + error.message);
  }

  console.log('\n👀 Browser will remain open for manual inspection.');
  console.log('Press Ctrl+C to close and exit.');
  
  // Keep the browser open
  await new Promise(() => {});
}

// Run the test
testPawsFlow().catch(console.error);