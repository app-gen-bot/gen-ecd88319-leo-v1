const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function testPawsFlow() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  console.log('Starting PawsFlow browser testing...\n');

  try {
    // Test 1: Homepage
    console.log('1. Testing Homepage...');
    await page.goto('http://localhost:3007', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png'), fullPage: true });
    console.log('✓ Homepage loaded and screenshot taken');

    // Test 2: Navigation Links
    console.log('\n2. Testing Navigation Links...');
    
    // Features page
    const featuresLink = await page.$('a[href="/features"]');
    if (featuresLink) {
      await featuresLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: path.join(screenshotsDir, '02-features.png'), fullPage: true });
      console.log('✓ Features page loaded');
    } else {
      console.log('✗ Features link not found');
    }

    // Pricing page
    const pricingLink = await page.$('a[href="/pricing"]');
    if (pricingLink) {
      await pricingLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: path.join(screenshotsDir, '03-pricing.png'), fullPage: true });
      console.log('✓ Pricing page loaded');
    } else {
      console.log('✗ Pricing link not found');
    }

    // Test 3: Login page
    console.log('\n3. Testing Login page...');
    const loginLink = await page.$('a[href="/login"]');
    if (loginLink) {
      await loginLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: path.join(screenshotsDir, '04-login.png'), fullPage: true });
      console.log('✓ Login page loaded');
      
      // Try demo login
      console.log('  Testing demo login...');
      await page.type('input[type="email"]', 'demo@example.com');
      await page.type('input[type="password"]', 'demo123');
      await page.screenshot({ path: path.join(screenshotsDir, '05-login-filled.png') });
      
      // Submit login
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: path.join(screenshotsDir, '06-after-login.png'), fullPage: true });
        console.log('✓ Login submitted');
      }
    } else {
      console.log('✗ Login link not found');
    }

    // Test 4: Check current page (should be dashboard after login)
    console.log('\n4. Checking post-login state...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('dashboard')) {
      console.log('✓ Successfully redirected to dashboard');
      await page.screenshot({ path: path.join(screenshotsDir, '07-dashboard.png'), fullPage: true });
    }

    // Test 5: Responsive Design
    console.log('\n5. Testing Responsive Design...');
    
    // Mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3007');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '08-mobile-homepage.png') });
    console.log('✓ Mobile view (375x667) tested');
    
    // Tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '09-tablet-homepage.png') });
    console.log('✓ Tablet view (768x1024) tested');
    
    // Desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '10-desktop-homepage.png') });
    console.log('✓ Desktop view (1920x1080) tested');

    // Test 6: Interactive Elements
    console.log('\n6. Testing Interactive Elements...');
    await page.goto('http://localhost:3007');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check for modals/dropdowns
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons on homepage`);
    
    // Click first non-navigation button
    if (buttons.length > 0) {
      for (let i = 0; i < Math.min(3, buttons.length); i++) {
        const buttonText = await buttons[i].evaluate(el => el.textContent);
        console.log(`  Button ${i + 1}: "${buttonText}"`);
      }
    }

    // Test 7: Check for broken images
    console.log('\n7. Checking for broken images...');
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth
      }))
    );
    
    let brokenImages = 0;
    images.forEach(img => {
      if (img.naturalWidth === 0) {
        console.log(`✗ Broken image: ${img.src}`);
        brokenImages++;
      }
    });
    
    if (brokenImages === 0) {
      console.log(`✓ All ${images.length} images loaded successfully`);
    }

    // Test 8: Check console errors
    console.log('\n8. Checking for console errors...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('✗ Console error:', msg.text());
      }
    });
    
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n✅ Browser testing completed!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n👀 Browser will remain open for manual inspection.');
    console.log('Press Ctrl+C to close and exit.');
  }
}

// Run the test
testPawsFlow().catch(console.error);