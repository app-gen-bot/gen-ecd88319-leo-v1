/**
 * Simple Whitepaper Back Button Test
 * Tests the whitepaper and back button functionality directly
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testWhitepaperBackButton() {
  console.log('🧪 Testing Whitepaper Back Button...\n');

  // Create screenshots directory
  const screenshotDir = path.join(__dirname, 'screenshots', 'whitepaper-test');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Load whitepaper directly
    console.log('📍 Test 1: Loading whitepaper...');
    await page.goto('http://localhost:5014/whitepaper.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const title = await page.title();
    console.log(`   ✅ Whitepaper loaded: "${title}"`);
    await page.screenshot({
      path: path.join(screenshotDir, '1-whitepaper-full.png'),
      fullPage: true
    });
    testsPassed++;

    // Test 2: Verify whitepaper content
    console.log('\n📍 Test 2: Verifying whitepaper content...');
    const h1 = await page.locator('h1').first().textContent();
    console.log(`   ✅ Title: "${h1.trim()}"`);

    const hasNetworkViz = await page.locator('.network-viz').count() > 0;
    console.log(`   ✅ Network visualization: ${hasNetworkViz ? '✓' : '✗'}`);

    const statBoxes = await page.locator('.stat-box').count();
    console.log(`   ✅ Statistics boxes: ${statBoxes}`);
    testsPassed++;

    // Test 3: Find back button
    console.log('\n📍 Test 3: Finding "Back to App" button...');
    const backButton = await page.locator('.back-to-app');
    const isVisible = await backButton.isVisible();
    const buttonText = await backButton.textContent();
    console.log(`   ✅ Button found: "${buttonText.trim()}"`);
    console.log(`   ✅ Is visible: ${isVisible}`);

    // Get button position and styles
    const box = await backButton.boundingBox();
    console.log(`   ✅ Position: top=${Math.round(box.y)}px, left=${Math.round(box.x)}px`);

    // Highlight the button
    await backButton.evaluate(el => {
      el.style.outline = '4px solid #FF0000';
      el.style.outlineOffset = '4px';
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotDir, '2-back-button-highlighted.png')
    });
    testsPassed++;

    // Test 4: Hover over back button
    console.log('\n📍 Test 4: Testing hover effects...');
    await backButton.hover();
    await page.waitForTimeout(800);

    // Get computed style during hover
    const hoverStyles = await backButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        borderColor: computed.borderColor,
        transform: computed.transform
      };
    });
    console.log(`   ✅ Hover color: ${hoverStyles.color}`);
    console.log(`   ✅ Hover border: ${hoverStyles.borderColor}`);
    console.log(`   ✅ Transform: ${hoverStyles.transform}`);

    await page.screenshot({
      path: path.join(screenshotDir, '3-back-button-hover.png')
    });
    testsPassed++;

    // Test 5: Check button attributes
    console.log('\n📍 Test 5: Verifying button attributes...');
    const href = await backButton.getAttribute('href');
    console.log(`   ✅ href: "${href}"`);

    const target = await backButton.getAttribute('target');
    console.log(`   ✅ target: ${target || '(same window)'}`);

    if (href === '/') {
      console.log('   ✅ Button correctly points to homepage');
      testsPassed++;
    } else {
      console.log('   ❌ Button href is incorrect');
      testsFailed++;
    }

    // Test 6: Click back button
    console.log('\n📍 Test 6: Clicking "Back to App" button...');
    const urlBefore = page.url();
    console.log(`   Current URL: ${urlBefore}`);

    await backButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const urlAfter = page.url();
    console.log(`   New URL: ${urlAfter}`);

    if (urlAfter.includes('localhost:5014') && !urlAfter.includes('whitepaper')) {
      console.log('   ✅ Successfully navigated to homepage');
      testsPassed++;
    } else {
      console.log('   ❌ Navigation failed');
      testsFailed++;
    }

    await page.screenshot({
      path: path.join(screenshotDir, '4-back-to-homepage.png'),
      fullPage: true
    });

    // Test 7: Verify we're on homepage
    console.log('\n📍 Test 7: Verifying homepage loaded...');
    await page.waitForTimeout(2000);

    const finalTitle = await page.title();
    console.log(`   ✅ Page title: "${finalTitle}"`);

    // Check if FizzCard header is present
    const hasFizzCardText = await page.getByText(/fizzcard/i).count() > 0;
    console.log(`   ✅ FizzCard branding present: ${hasFizzCardText}`);

    if (hasFizzCardText) {
      testsPassed++;
    } else {
      testsFailed++;
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    testsFailed++;

    try {
      await page.screenshot({
        path: path.join(screenshotDir, 'error-screenshot.png'),
        fullPage: true
      });
    } catch (e) {
      console.error('Could not take error screenshot');
    }
  } finally {
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📸 Screenshots: ${screenshotDir}`);
    console.log('='.repeat(70));

    if (testsFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Whitepaper back button works perfectly!\n');
    } else {
      console.log('\n⚠️  Some tests failed. Check screenshots for details.\n');
    }

    // Keep browser open briefly
    await page.waitForTimeout(2000);
    await browser.close();

    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

testWhitepaperBackButton();
