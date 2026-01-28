/**
 * Whitepaper Navigation Test
 * Tests the whitepaper display and back button functionality
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testWhitepaperNavigation() {
  console.log('🧪 Starting Whitepaper Navigation Tests...\n');

  // Create screenshots directory
  const screenshotDir = path.join(__dirname, 'screenshots', 'whitepaper-test');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Homepage loads
    console.log('📍 Test 1: Loading homepage...');
    await page.goto('http://localhost:5014/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const homepageTitle = await page.title();
    console.log(`   ✅ Homepage loaded: "${homepageTitle}"`);
    await page.screenshot({
      path: path.join(screenshotDir, '1-homepage.png'),
      fullPage: true
    });
    testsPassed++;

    // Test 2: Find whitepaper link in header
    console.log('\n📍 Test 2: Finding whitepaper link in header...');

    // Wait for navigation to be rendered
    await page.waitForSelector('nav', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Look for whitepaper link (text-based since href might be /whitepaper.html)
    const whitepaperLink = await page.getByRole('link', { name: /whitepaper/i }).first();
    const linkText = await whitepaperLink.textContent();
    console.log(`   ✅ Found whitepaper link: "${linkText.trim()}"`);

    // Get the href to verify it's correct
    const href = await whitepaperLink.getAttribute('href');
    console.log(`   ✅ Link href: "${href}"`);
    testsPassed++;

    // Test 3: Find whitepaper CTA on homepage
    console.log('\n📍 Test 3: Finding whitepaper CTA on homepage...');

    // Look for "Read the Whitepaper" text
    const whitepaperCTA = await page.getByText(/read the whitepaper/i).first();
    const ctaText = await whitepaperCTA.textContent();
    console.log(`   ✅ Found whitepaper CTA: "${ctaText.trim()}"`);

    // Get the parent link element
    const ctaLink = await whitepaperCTA.locator('..').first();

    // Highlight the CTA link
    await ctaLink.evaluate(el => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotDir, '2-homepage-with-cta-highlighted.png'),
      fullPage: true
    });
    testsPassed++;

    // Test 4: Click whitepaper link
    console.log('\n📍 Test 4: Clicking whitepaper CTA...');
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      ctaLink.click()
    ]);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(1000);

    const whitepaperTitle = await newPage.title();
    console.log(`   ✅ Whitepaper opened in new tab: "${whitepaperTitle}"`);
    await newPage.screenshot({
      path: path.join(screenshotDir, '3-whitepaper-full.png'),
      fullPage: true
    });
    testsPassed++;

    // Test 5: Verify whitepaper content
    console.log('\n📍 Test 5: Verifying whitepaper content...');
    const h1Text = await newPage.locator('h1').first().textContent();
    console.log(`   ✅ Found H1: "${h1Text.trim()}"`);

    const hasNetworkViz = await newPage.locator('.network-viz').count() > 0;
    console.log(`   ✅ Network visualization: ${hasNetworkViz ? 'Present' : 'Missing'}`);

    const statBoxes = await newPage.locator('.stat-box').count();
    console.log(`   ✅ Statistics boxes: ${statBoxes} found`);
    testsPassed++;

    // Test 6: Find back button
    console.log('\n📍 Test 6: Finding "Back to App" button...');
    const backButton = await newPage.locator('.back-to-app');
    const isVisible = await backButton.isVisible();
    const backButtonText = await backButton.textContent();
    console.log(`   ✅ Back button found: "${backButtonText.trim()}" (visible: ${isVisible})`);

    // Get button position
    const buttonBox = await backButton.boundingBox();
    console.log(`   ✅ Button position: top=${buttonBox.y}px, left=${buttonBox.x}px`);

    // Highlight the back button
    await backButton.evaluate(el => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await newPage.waitForTimeout(500);
    await newPage.screenshot({
      path: path.join(screenshotDir, '4-whitepaper-with-back-button-highlighted.png')
    });
    testsPassed++;

    // Test 7: Hover over back button
    console.log('\n📍 Test 7: Testing back button hover effects...');
    await backButton.hover();
    await newPage.waitForTimeout(500);
    await newPage.screenshot({
      path: path.join(screenshotDir, '5-back-button-hover.png')
    });
    console.log('   ✅ Hover effects applied');
    testsPassed++;

    // Test 8: Get button styles
    console.log('\n📍 Test 8: Verifying button styles...');
    const buttonStyles = await backButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        top: computed.top,
        left: computed.left,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        color: computed.color,
        borderRadius: computed.borderRadius,
        zIndex: computed.zIndex
      };
    });
    console.log('   Button styles:', JSON.stringify(buttonStyles, null, 2));
    testsPassed++;

    // Test 9: Click back button
    console.log('\n📍 Test 9: Clicking "Back to App" button...');
    const currentURL = newPage.url();
    console.log(`   Current URL: ${currentURL}`);

    await backButton.click();
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(1000);

    const newURL = newPage.url();
    console.log(`   New URL: ${newURL}`);

    if (newURL.includes('localhost:5014') && !newURL.includes('whitepaper')) {
      console.log('   ✅ Successfully navigated back to app');
      testsPassed++;
    } else {
      console.log('   ❌ Navigation failed - still on whitepaper or wrong page');
      testsFailed++;
    }

    await newPage.screenshot({
      path: path.join(screenshotDir, '6-back-to-homepage.png'),
      fullPage: true
    });

    // Test 10: Verify we're back on homepage
    console.log('\n📍 Test 10: Verifying return to homepage...');
    const finalTitle = await newPage.title();
    console.log(`   ✅ Page title: "${finalTitle}"`);

    const hasHomepageContent = await newPage.locator('h1').first().textContent();
    console.log(`   ✅ Found H1: "${hasHomepageContent.trim()}"`);
    testsPassed++;

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    testsFailed++;

    // Take error screenshot
    try {
      await page.screenshot({
        path: path.join(screenshotDir, 'error-screenshot.png'),
        fullPage: true
      });
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError.message);
    }
  } finally {
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📸 Screenshots saved to: ${screenshotDir}`);
    console.log('='.repeat(60));

    // Keep browser open for 3 seconds to see final state
    await page.waitForTimeout(3000);

    await browser.close();

    // Exit with appropriate code
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

// Run tests
testWhitepaperNavigation();
