const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const screenshotPath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✓ Screenshot saved: ${name}.png`);
}

async function checkConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  return errors;
}

async function runVisualTests() {
  console.log('Starting visual testing...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1400,900']
  });
  
  const page = await browser.newPage();
  const errors = [];
  
  // Set up error tracking
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ page: page.url(), error: msg.text() });
      console.log(`❌ Console error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push({ page: page.url(), error: error.message });
    console.log(`❌ Page error: ${error.message}`);
  });
  
  try {
    // Test 1: Homepage
    console.log('1. Testing Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await sleep(2000);
    await takeScreenshot(page, '01-homepage');
    
    // Test 2: Navigate to Login
    console.log('\n2. Testing Login Page...');
    await page.click('a[href="/login"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await sleep(1000);
    await takeScreenshot(page, '02-login-page');
    
    // Test 3: Login with demo credentials
    console.log('\n3. Testing Login Process...');
    
    // Look for the demo button using evaluate
    const hasDemoButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(btn => btn.textContent.includes('Continue with Demo Account'));
      if (demoBtn) {
        demoBtn.click();
        return true;
      }
      return false;
    });
    
    if (hasDemoButton) {
      console.log('Clicked demo account button...');
    } else {
      // Fill in the form manually
      console.log('Filling login form manually...');
      
      try {
        // Clear and type email
        const emailInput = await page.$('input[placeholder*="example.com"]');
        if (emailInput) {
          await emailInput.click({ clickCount: 3 }); // Triple click to select all
          await emailInput.type('demo@example.com');
        }
        
        // Clear and type password
        const passwordInput = await page.$('input[type="password"]');
        if (passwordInput) {
          await passwordInput.click({ clickCount: 3 });
          await passwordInput.type('demo123');
        }
        
        await takeScreenshot(page, '03-login-filled');
        
        // Click sign in button
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const signInBtn = buttons.find(btn => btn.textContent.includes('Sign In'));
          if (signInBtn) signInBtn.click();
        });
      } catch (error) {
        console.log('Error filling form:', error.message);
      }
    }
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await sleep(2000);
    await takeScreenshot(page, '04-after-login');
    
    // Test 4: Check current dashboard
    console.log('\n4. Testing Dashboard...');
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    await takeScreenshot(page, '05-dashboard');
    
    // Test 5: Navigate through main menu items
    console.log('\n5. Testing Navigation...');
    
    // Try to find and click main navigation items
    const navItems = await page.$$eval('nav a', links => 
      links.map(link => ({ text: link.textContent, href: link.href }))
    );
    console.log('Found navigation items:', navItems);
    
    // Click through main navigation items
    for (let i = 0; i < Math.min(navItems.length, 3); i++) {
      const item = navItems[i];
      if (item.href && !item.href.includes('logout')) {
        console.log(`Navigating to: ${item.text}`);
        await page.goto(item.href, { waitUntil: 'networkidle0' });
        await sleep(1500);
        await takeScreenshot(page, `06-nav-${i}-${item.text.toLowerCase().replace(/\s+/g, '-')}`);
      }
    }
    
    // Test 6: Dark mode toggle
    console.log('\n6. Testing Dark Mode...');
    // Look for theme toggle button - try multiple selectors
    const themeToggleSelectors = [
      '[data-testid="theme-toggle"]',
      'button[aria-label*="theme"]',
      'button[aria-label*="mode"]',
      'button:has(svg[class*="sun"])',
      'button:has(svg[class*="moon"])',
      '[role="button"][aria-label*="theme"]'
    ];
    
    let themeToggle = null;
    for (const selector of themeToggleSelectors) {
      themeToggle = await page.$(selector);
      if (themeToggle) break;
    }
    
    if (themeToggle) {
      console.log('Found theme toggle, clicking...');
      await themeToggle.click();
      await sleep(1000);
      await takeScreenshot(page, '07-theme-toggled');
      
      // Toggle back
      await themeToggle.click();
      await sleep(1000);
    } else {
      console.log('⚠️  Dark mode toggle not found');
    }
    
    // Test 7: Mobile responsive view
    console.log('\n7. Testing Mobile Responsive Design...');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await sleep(1500);
    await takeScreenshot(page, '08-mobile-homepage');
    
    // Check mobile navigation
    const mobileMenuButton = await page.$('[aria-label*="menu"], button[aria-label*="navigation"]');
    if (mobileMenuButton) {
      await mobileMenuButton.click();
      await sleep(1000);
      await takeScreenshot(page, '09-mobile-menu');
    }
    
    // Test 8: Check for staff access
    console.log('\n8. Checking for Staff Dashboard...');
    await page.setViewport({ width: 1400, height: 900 });
    
    // Try to find staff/admin link
    const staffLink = await page.$('a[href*="staff"], a[href*="admin"]');
    if (staffLink) {
      await staffLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await sleep(1500);
      await takeScreenshot(page, '10-staff-dashboard');
    } else {
      console.log('⚠️  Staff dashboard link not found');
    }
    
    // Summary
    console.log('\n=== Testing Complete ===');
    console.log(`Total screenshots taken: ${fs.readdirSync(screenshotsDir).length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Console/Page Errors Found:');
      errors.forEach(err => {
        console.log(`  - ${err.page}: ${err.error}`);
      });
    } else {
      console.log('\n✅ No console errors detected!');
    }
    
    console.log('\nScreenshots saved to:', screenshotsDir);
    console.log('\n👁️  Browser window will remain open for manual inspection.');
    console.log('Press Ctrl+C to exit when done.');
    
    // Keep browser open for manual inspection
    await sleep(300000); // 5 minutes
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

runVisualTests().catch(console.error);