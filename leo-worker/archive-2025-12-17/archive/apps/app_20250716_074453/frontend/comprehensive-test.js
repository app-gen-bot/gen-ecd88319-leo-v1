const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create directories
const screenshotsDir = path.join(__dirname, 'test-screenshots-full');
const reportDir = path.join(__dirname, 'test-report');
[screenshotsDir, reportDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testComprehensive() {
  console.log('🚀 Starting Comprehensive Visual Testing for PawsFlow\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1400,900', '--no-sandbox']
  });
  
  const page = await browser.newPage();
  const report = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: [],
    warnings: []
  };
  
  // Collect console messages and errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      report.errors.push({ url: page.url(), message: text, time: new Date().toISOString() });
    } else if (type === 'warning') {
      report.warnings.push({ url: page.url(), message: text, time: new Date().toISOString() });
    }
  });
  
  page.on('pageerror', error => {
    report.errors.push({ url: page.url(), message: error.message, time: new Date().toISOString() });
  });
  
  try {
    // Test 1: Homepage Load and Performance
    console.log('📄 Test 1: Homepage');
    const startTime = Date.now();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    const loadTime = Date.now() - startTime;
    
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png'), fullPage: true });
    
    report.tests.push({
      name: 'Homepage Load',
      status: 'passed',
      loadTime: `${loadTime}ms`,
      screenshot: '01-homepage.png'
    });
    
    // Check for required elements
    const hasLogo = await page.$('img[alt*="PawsFlow"], [class*="logo"]');
    const hasNavigation = await page.$('nav');
    const hasHeroSection = await page.$('h1');
    
    console.log(`  ✓ Load time: ${loadTime}ms`);
    console.log(`  ${hasLogo ? '✓' : '❌'} Logo present`);
    console.log(`  ${hasNavigation ? '✓' : '❌'} Navigation present`);
    console.log(`  ${hasHeroSection ? '✓' : '❌'} Hero section present`);
    
    // Test 2: Navigation Links
    console.log('\n🔗 Test 2: Navigation Links');
    const navLinks = await page.$$eval('nav a', links => 
      links.map(link => ({ text: link.textContent.trim(), href: link.href }))
    );
    
    console.log(`  Found ${navLinks.length} navigation links`);
    navLinks.forEach(link => console.log(`    - ${link.text}`));
    
    // Test 3: Login Page
    console.log('\n🔐 Test 3: Login Page');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '02-login-page.png') });
    
    // Test 4: Login Process
    console.log('\n🔑 Test 4: Login Process');
    
    // First, try to click the demo button to fill the form
    const demoFilled = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const demoBtn = buttons.find(btn => btn.textContent.includes('Continue with Demo Account'));
      if (demoBtn) {
        demoBtn.click();
        return true;
      }
      return false;
    });
    
    if (demoFilled) {
      console.log('  ✓ Demo credentials filled');
      await sleep(500);
      
      // Now click the Sign In button
      const signedIn = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const signInBtn = buttons.find(btn => btn.textContent.trim() === 'Sign In');
        if (signInBtn) {
          signInBtn.click();
          return true;
        }
        return false;
      });
      
      if (signedIn) {
        console.log('  ✓ Sign In button clicked');
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
        await sleep(2000);
      }
    }
    
    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);
    await page.screenshot({ path: path.join(screenshotsDir, '03-after-login.png'), fullPage: true });
    
    // Test 5: Dashboard Features (if logged in)
    if (!currentUrl.includes('/login')) {
      console.log('\n📊 Test 5: Dashboard Features');
      
      // Check for dashboard elements
      const dashboardElements = await page.evaluate(() => {
        return {
          hasStats: !!document.querySelector('[class*="stat"], [class*="metric"], [class*="card"]'),
          hasNavigation: !!document.querySelector('nav, [class*="sidebar"]'),
          hasContent: !!document.querySelector('main, [class*="content"]'),
          pageTitle: document.title
        };
      });
      
      console.log(`  Page title: ${dashboardElements.pageTitle}`);
      console.log(`  ${dashboardElements.hasStats ? '✓' : '❌'} Statistics/Cards present`);
      console.log(`  ${dashboardElements.hasNavigation ? '✓' : '❌'} Navigation present`);
      console.log(`  ${dashboardElements.hasContent ? '✓' : '❌'} Main content present`);
      
      await page.screenshot({ path: path.join(screenshotsDir, '04-dashboard.png'), fullPage: true });
    }
    
    // Test 6: Dark Mode Toggle
    console.log('\n🌙 Test 6: Dark Mode Toggle');
    const themeToggled = await page.evaluate(() => {
      // Try multiple selectors for theme toggle
      const selectors = [
        'button[aria-label*="theme"]',
        'button[aria-label*="mode"]',
        '[data-testid="theme-toggle"]',
        'button'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const ariaLabel = el.getAttribute('aria-label');
          const innerHTML = el.innerHTML.toLowerCase();
          
          if (ariaLabel?.includes('theme') || ariaLabel?.includes('mode') ||
              innerHTML.includes('sun') || innerHTML.includes('moon')) {
            el.click();
            return true;
          }
        }
      }
      return false;
    });
    
    if (themeToggled) {
      console.log('  ✓ Theme toggle clicked');
      await sleep(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '05-dark-mode.png'), fullPage: true });
    } else {
      console.log('  ⚠️  Theme toggle not found');
    }
    
    // Test 7: Mobile Responsive
    console.log('\n📱 Test 7: Mobile Responsive Design');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '06-mobile-homepage.png'), fullPage: true });
    
    // Check for mobile menu
    const hasMobileMenu = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).some(btn => 
        btn.getAttribute('aria-label')?.includes('menu') ||
        btn.innerHTML.includes('menu')
      );
    });
    
    console.log(`  ${hasMobileMenu ? '✓' : '❌'} Mobile menu button present`);
    
    // Test 8: Tablet View
    console.log('\n💻 Test 8: Tablet View');
    await page.setViewport({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '07-tablet-view.png'), fullPage: true });
    
    // Generate Report
    report.summary = {
      totalTests: report.tests.length,
      passed: report.tests.filter(t => t.status === 'passed').length,
      failed: report.tests.filter(t => t.status === 'failed').length,
      errors: report.errors.length,
      warnings: report.warnings.length,
      screenshots: fs.readdirSync(screenshotsDir).length
    };
    
    // Save report
    fs.writeFileSync(
      path.join(reportDir, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Print Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Console Errors: ${report.summary.errors}`);
    console.log(`Console Warnings: ${report.summary.warnings}`);
    console.log(`Screenshots: ${report.summary.screenshots}`);
    
    if (report.errors.length > 0) {
      console.log('\n❌ Console Errors:');
      report.errors.forEach(err => {
        console.log(`  - ${err.message}`);
        console.log(`    at ${err.url}`);
      });
    }
    
    console.log('\n✅ Testing complete!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
    console.log(`📄 Report saved to: ${path.join(reportDir, 'test-report.json')}`);
    
    // Keep browser open for manual inspection
    console.log('\n👁️  Browser will remain open for manual inspection.');
    console.log('You can interact with the application now.');
    console.log('Press Ctrl+C when done to exit.\n');
    
    // Wait indefinitely
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    report.errors.push({
      url: page.url(),
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    });
  }
}

// Run the test
testComprehensive().catch(console.error);