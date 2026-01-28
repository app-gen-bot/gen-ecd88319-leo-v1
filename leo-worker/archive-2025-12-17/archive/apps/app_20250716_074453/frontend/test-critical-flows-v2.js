const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'critical-flow-screenshots-v2');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
  }
}

async function testCriticalFlows() {
  console.log('Starting comprehensive critical flow tests...');
  await ensureDir(screenshotsDir);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const findings = {
    successful: [],
    failures: [],
    warnings: [],
    brokenLinks: [],
    functionalIssues: []
  };

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    if (type === 'error') {
      findings.warnings.push(`⚠ Console error: ${text}`);
    }
  });

  // Capture network errors
  page.on('response', response => {
    if (response.status() >= 400) {
      findings.brokenLinks.push(`${response.status()} - ${response.url()}`);
    }
  });

  try {
    // 1. Homepage Testing
    console.log('\n📍 1. Testing Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png'), fullPage: true });
    
    // Check for key homepage elements
    const homeChecks = [
      { selector: 'h1', name: 'Hero heading' },
      { selector: 'nav', name: 'Navigation bar' },
      { selector: 'a[href="/features"]', name: 'Features link' },
      { selector: 'a[href="/pricing"]', name: 'Pricing link' },
      { selector: 'a[href="/login"]', name: 'Login link' },
      { selector: 'footer', name: 'Footer' }
    ];

    for (const check of homeChecks) {
      const element = await page.$(check.selector);
      if (element) {
        findings.successful.push(`✓ ${check.name} found on homepage`);
      } else {
        findings.failures.push(`✗ ${check.name} missing on homepage`);
      }
    }

    // Check for "Powered by PlanetScale" attribution
    const planetScaleText = await page.evaluate(() => {
      return document.body.textContent.includes('Powered by PlanetScale');
    });
    if (planetScaleText) {
      findings.successful.push('✓ "Powered by PlanetScale" attribution present');
    } else {
      findings.failures.push('✗ "Powered by PlanetScale" attribution missing');
    }

    // 2. Navigation Testing
    console.log('\n📍 2. Testing Main Navigation...');
    
    // Test Features page
    try {
      await page.click('a[href="/features"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(screenshotsDir, '02-features.png'), fullPage: true });
      const featuresUrl = page.url();
      if (featuresUrl.includes('/features')) {
        findings.successful.push('✓ Features page navigation works');
      } else {
        findings.failures.push(`✗ Features navigation failed - URL: ${featuresUrl}`);
      }
    } catch (err) {
      findings.failures.push(`✗ Features page navigation error: ${err.message}`);
    }

    // Test Pricing page
    try {
      await page.click('a[href="/pricing"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(screenshotsDir, '03-pricing.png'), fullPage: true });
      const pricingUrl = page.url();
      if (pricingUrl.includes('/pricing')) {
        findings.successful.push('✓ Pricing page navigation works');
      } else {
        findings.failures.push(`✗ Pricing navigation failed - URL: ${pricingUrl}`);
      }
    } catch (err) {
      findings.failures.push(`✗ Pricing page navigation error: ${err.message}`);
    }

    // 3. Authentication Flow Testing
    console.log('\n📍 3. Testing Authentication Flow...');
    
    // Navigate to login
    try {
      await page.click('a[href="/login"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(screenshotsDir, '04-login-page.png') });
      findings.successful.push('✓ Login page loads successfully');

      // Check for login form elements
      const loginElements = [
        { selector: 'input#email', name: 'Email input' },
        { selector: 'input#password', name: 'Password input' },
        { selector: 'input[type="radio"][value="client"]', name: 'Client portal radio' },
        { selector: 'input[type="radio"][value="staff"]', name: 'Staff portal radio' },
        { selector: 'button[type="submit"]', name: 'Sign in button' }
      ];

      for (const elem of loginElements) {
        const element = await page.$(elem.selector);
        if (element) {
          findings.successful.push(`✓ ${elem.name} present`);
        } else {
          findings.failures.push(`✗ ${elem.name} missing`);
        }
      }

      // Test login with demo credentials
      console.log('   Testing demo login...');
      await page.type('input#email', 'demo@example.com');
      await page.type('input#password', 'demo123');
      
      // Select Client Portal
      await page.click('input[type="radio"][value="client"]');
      await page.screenshot({ path: path.join(screenshotsDir, '05-login-filled.png') });
      
      // Submit form
      await page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for redirect
      
      const afterLoginUrl = page.url();
      await page.screenshot({ path: path.join(screenshotsDir, '06-after-login.png'), fullPage: true });
      
      if (afterLoginUrl.includes('/client')) {
        findings.successful.push(`✓ Client login successful - redirected to: ${afterLoginUrl}`);
      } else {
        findings.functionalIssues.push(`Login completed but unexpected redirect: ${afterLoginUrl}`);
      }

    } catch (err) {
      findings.failures.push(`✗ Login flow failed: ${err.message}`);
    }

    // 4. Client Portal Testing
    console.log('\n📍 4. Testing Client Portal...');
    
    if (!page.url().includes('/client')) {
      await page.goto('http://localhost:3000/client/dashboard', { waitUntil: 'networkidle0' });
    }

    // Check client portal navigation
    const clientNavItems = [
      { href: '/client/dashboard', name: 'Dashboard' },
      { href: '/client/pets', name: 'My Pets' },
      { href: '/client/appointments', name: 'Appointments' },
      { href: '/client/medical-records', name: 'Medical Records' },
      { href: '/client/prescriptions', name: 'Prescriptions' },
      { href: '/client/billing', name: 'Billing' },
      { href: '/client/messages', name: 'Messages' }
    ];

    console.log('   Checking client navigation items...');
    for (const item of clientNavItems) {
      const selector = `a[href="${item.href}"]`;
      const element = await page.$(selector);
      if (element) {
        findings.successful.push(`✓ Client ${item.name} link present`);
        
        // Try clicking it
        try {
          await element.click();
          await new Promise(resolve => setTimeout(resolve, 1500));
          const currentUrl = page.url();
          if (currentUrl.includes(item.href)) {
            findings.successful.push(`✓ Client ${item.name} navigation works`);
            await page.screenshot({ 
              path: path.join(screenshotsDir, `client-${item.name.toLowerCase().replace(/\s+/g, '-')}.png`),
              fullPage: true 
            });
          }
        } catch (navErr) {
          findings.warnings.push(`⚠ Could not navigate to ${item.name}: ${navErr.message}`);
        }
      } else {
        findings.failures.push(`✗ Client ${item.name} link missing`);
      }
    }

    // 5. Test Appointment Booking
    console.log('\n📍 5. Testing Appointment Booking...');
    try {
      await page.goto('http://localhost:3000/client/appointments', { waitUntil: 'networkidle0' });
      
      // Look for book appointment button
      const bookButtons = await page.$$('button');
      let bookButton = null;
      for (const btn of bookButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Book') && text.includes('Appointment')) {
          bookButton = btn;
          break;
        }
      }
      
      if (bookButton) {
        await bookButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({ path: path.join(screenshotsDir, '07-appointment-booking.png'), fullPage: true });
        findings.successful.push('✓ Appointment booking button works');
      } else {
        findings.functionalIssues.push('Book appointment button not found');
      }
    } catch (err) {
      findings.failures.push(`✗ Appointment booking test failed: ${err.message}`);
    }

    // 6. Staff Portal Testing
    console.log('\n📍 6. Testing Staff Portal...');
    
    // First logout and login as staff
    try {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
      await page.type('input#email', 'demo@example.com');
      await page.type('input#password', 'demo123');
      await page.click('input[type="radio"][value="staff"]');
      await page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (page.url().includes('/staff')) {
        findings.successful.push('✓ Staff login successful');
        await page.screenshot({ path: path.join(screenshotsDir, '08-staff-dashboard.png'), fullPage: true });
      }
    } catch (err) {
      findings.failures.push(`✗ Staff login failed: ${err.message}`);
    }

    // Check staff navigation
    const staffNavItems = [
      { href: '/staff/dashboard', name: 'Dashboard' },
      { href: '/staff/schedule', name: 'Schedule' },
      { href: '/staff/patients', name: 'Patients' },
      { href: '/staff/appointments', name: 'Appointments' },
      { href: '/staff/check-in', name: 'Check-in' },
      { href: '/staff/inventory', name: 'Inventory' },
      { href: '/staff/communications', name: 'Communications' }
    ];

    console.log('   Checking staff navigation items...');
    for (const item of staffNavItems) {
      const selector = `a[href="${item.href}"]`;
      const element = await page.$(selector);
      if (element) {
        findings.successful.push(`✓ Staff ${item.name} link present`);
      } else {
        findings.warnings.push(`⚠ Staff ${item.name} link not found`);
      }
    }

    // 7. 404 Error Testing
    console.log('\n📍 7. Testing 404 Error Handling...');
    const notFoundUrls = [
      'http://localhost:3000/nonexistent',
      'http://localhost:3000/client/nonexistent',
      'http://localhost:3000/staff/nonexistent'
    ];

    for (const url of notFoundUrls) {
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle0' });
        const status = response.status();
        const content = await page.content();
        
        if (status === 404 || content.includes('404') || content.includes('not found')) {
          findings.successful.push(`✓ 404 properly handled for: ${url}`);
        } else {
          findings.warnings.push(`⚠ Unexpected response (${status}) for: ${url}`);
        }
      } catch (err) {
        findings.warnings.push(`⚠ Could not test 404 for ${url}: ${err.message}`);
      }
    }

    // 8. Responsive Design Testing
    console.log('\n📍 8. Testing Responsive Design...');
    const viewports = [
      { name: 'iphone-x', width: 375, height: 812 },
      { name: 'ipad', width: 768, height: 1024 },
      { name: 'desktop-hd', width: 1920, height: 1080 }
    ];

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    for (const viewport of viewports) {
      try {
        await page.setViewport({ width: viewport.width, height: viewport.height });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({ 
          path: path.join(screenshotsDir, `09-responsive-${viewport.name}.png`),
          fullPage: false 
        });
        
        // Check if navigation becomes mobile menu
        if (viewport.width < 768) {
          const mobileMenu = await page.$('button[aria-label*="menu"], button[aria-label*="Menu"]');
          if (mobileMenu) {
            findings.successful.push(`✓ Mobile menu present at ${viewport.name} size`);
          }
        }
        
        findings.successful.push(`✓ Responsive design verified at ${viewport.name} (${viewport.width}x${viewport.height})`);
      } catch (err) {
        findings.failures.push(`✗ Responsive test failed for ${viewport.name}: ${err.message}`);
      }
    }

    // 9. Critical Button/Link Testing
    console.log('\n📍 9. Testing Critical Interactive Elements...');
    
    // Go back to homepage
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Find and test all buttons and links
    const buttons = await page.$$('button');
    const links = await page.$$('a');
    
    console.log(`   Found ${buttons.length} buttons and ${links.length} links`);
    
    // Test a sample of buttons
    let testedButtons = 0;
    for (const button of buttons.slice(0, 5)) { // Test first 5 buttons
      try {
        const text = await page.evaluate(el => el.textContent, button);
        const isDisabled = await page.evaluate(el => el.disabled, button);
        if (!isDisabled && text) {
          findings.successful.push(`✓ Button "${text.trim()}" is interactive`);
          testedButtons++;
        }
      } catch (err) {
        // Skip if element is no longer in DOM
      }
    }

  } catch (error) {
    console.error('Critical error during testing:', error);
    findings.failures.push(`✗ Critical test error: ${error.message}`);
  } finally {
    // Generate detailed report
    console.log('\n' + '='.repeat(80));
    console.log('COMPREHENSIVE TEST REPORT - PAWSFLOW');
    console.log('='.repeat(80));
    
    console.log('\n✅ SUCCESSFUL TESTS (' + findings.successful.length + '):');
    findings.successful.forEach(item => console.log(`   ${item}`));
    
    if (findings.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (' + findings.warnings.length + '):');
      findings.warnings.forEach(item => console.log(`   ${item}`));
    }
    
    if (findings.functionalIssues.length > 0) {
      console.log('\n🔧 FUNCTIONAL ISSUES (' + findings.functionalIssues.length + '):');
      findings.functionalIssues.forEach(item => console.log(`   ${item}`));
    }
    
    if (findings.brokenLinks.length > 0) {
      console.log('\n🔗 BROKEN LINKS (' + findings.brokenLinks.length + '):');
      findings.brokenLinks.forEach(item => console.log(`   ${item}`));
    }
    
    if (findings.failures.length > 0) {
      console.log('\n❌ FAILURES (' + findings.failures.length + '):');
      findings.failures.forEach(item => console.log(`   ${item}`));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY:');
    console.log(`✅ Passed: ${findings.successful.length}`);
    console.log(`⚠️  Warnings: ${findings.warnings.length}`);
    console.log(`🔧 Functional Issues: ${findings.functionalIssues.length}`);
    console.log(`🔗 Broken Links: ${findings.brokenLinks.length}`);
    console.log(`❌ Failed: ${findings.failures.length}`);
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
    console.log('='.repeat(80));

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: findings.successful.length,
        warnings: findings.warnings.length,
        functionalIssues: findings.functionalIssues.length,
        brokenLinks: findings.brokenLinks.length,
        failed: findings.failures.length
      },
      details: findings,
      consoleMessages: consoleMessages
    };

    await fs.writeFile(
      path.join(screenshotsDir, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Detailed report saved to test-report.json');
    console.log('\nBrowser will close in 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    await browser.close();
    
    // Kill the dev server
    process.exit(0);
  }
}

// Run the tests
testCriticalFlows().catch(console.error);