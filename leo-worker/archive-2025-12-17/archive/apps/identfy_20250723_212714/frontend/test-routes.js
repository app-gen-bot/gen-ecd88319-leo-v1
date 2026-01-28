const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testRoutes() {
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('Starting route testing...\n');

  try {
    // Test 1: Home page
    console.log('1. Testing home page...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '01-home.png'), fullPage: true });
    console.log('✓ Home page loaded successfully');

    // Test 2: Check navigation links
    console.log('\n2. Checking navigation links...');
    const navLinks = await page.$$eval('nav a, header a', links => 
      links.map(link => ({ href: link.href, text: link.textContent.trim() }))
    );
    console.log(`Found ${navLinks.length} navigation links:`, navLinks);

    // Test 3: Authentication flow - click login
    console.log('\n3. Testing authentication flow...');
    const loginLink = await page.$('a[href="/login"], button:has-text("Log In"), button:has-text("Sign In")');
    if (loginLink) {
      await loginLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotsDir, '02-login.png'), fullPage: true });
      console.log('✓ Login page loaded');

      // Try demo login
      const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      const passwordInput = await page.$('input[type="password"], input[name="password"]');
      
      if (emailInput && passwordInput) {
        await emailInput.fill('demo@example.com');
        await passwordInput.fill('DemoRocks2025!');
        await page.screenshot({ path: path.join(screenshotsDir, '03-login-filled.png') });
        
        const submitButton = await page.$('button[type="submit"], button:has-text("Log In"), button:has-text("Sign In")');
        if (submitButton) {
          await submitButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000); // Wait for redirect
          await page.screenshot({ path: path.join(screenshotsDir, '04-after-login.png'), fullPage: true });
          console.log('✓ Login submitted');
          console.log(`Current URL after login: ${page.url()}`);
        }
      }
    } else {
      console.log('⚠ No login link found');
    }

    // Test 4: Check main features/pages
    console.log('\n4. Testing main features...');
    const currentUrl = page.url();
    
    // If we're on dashboard, test dashboard features
    if (currentUrl.includes('dashboard')) {
      console.log('✓ Reached dashboard');
      
      // Check for main dashboard elements
      const dashboardElements = await page.$$eval('[class*="card"], [class*="Card"], section, .dashboard-section', 
        elements => elements.length
      );
      console.log(`Found ${dashboardElements} dashboard sections`);
      
      // Look for specific features
      const features = ['Upload', 'Templates', 'Models', 'History', 'Settings'];
      for (const feature of features) {
        const element = await page.$(`text=${feature}`);
        if (element) {
          console.log(`✓ Found ${feature} feature`);
        }
      }
    }

    // Test 5: Check for 404 errors on linked pages
    console.log('\n5. Checking for 404 errors...');
    const allLinks = await page.$$eval('a[href]', links => 
      links.map(link => link.href).filter(href => href.startsWith('http://localhost:3000'))
    );
    
    const uniqueLinks = [...new Set(allLinks)];
    console.log(`Found ${uniqueLinks.length} unique internal links to check`);
    
    const brokenLinks = [];
    for (const link of uniqueLinks.slice(0, 10)) { // Check first 10 links
      try {
        const response = await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 5000 });
        if (response && response.status() === 404) {
          brokenLinks.push(link);
          console.log(`✗ 404 error: ${link}`);
        } else {
          console.log(`✓ OK: ${link}`);
        }
      } catch (error) {
        console.log(`⚠ Error checking ${link}: ${error.message}`);
      }
    }

    // Test 6: Key pages screenshots
    console.log('\n6. Taking screenshots of key pages...');
    const keyPages = [
      { path: '/', name: 'home-final' },
      { path: '/templates', name: 'templates' },
      { path: '/models', name: 'models' },
      { path: '/about', name: 'about' },
      { path: '/contact', name: 'contact' }
    ];

    for (const pageDef of keyPages) {
      try {
        await page.goto(`http://localhost:3000${pageDef.path}`, { waitUntil: 'networkidle' });
        await page.screenshot({ 
          path: path.join(screenshotsDir, `${pageDef.name}.png`), 
          fullPage: true 
        });
        console.log(`✓ Screenshot saved: ${pageDef.name}.png`);
      } catch (error) {
        console.log(`⚠ Could not access ${pageDef.path}: ${error.message}`);
      }
    }

    // Final summary
    console.log('\n=== Test Summary ===');
    console.log(`Screenshots saved in: ${screenshotsDir}`);
    console.log(`Broken links found: ${brokenLinks.length}`);
    if (brokenLinks.length > 0) {
      console.log('Broken links:', brokenLinks);
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to close.');
    await new Promise(() => {}); // Keep script running
  }
}

testRoutes().catch(console.error);