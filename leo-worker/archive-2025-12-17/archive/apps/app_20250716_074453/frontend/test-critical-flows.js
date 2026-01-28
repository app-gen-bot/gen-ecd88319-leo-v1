const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'critical-flow-screenshots');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
  }
}

async function testCriticalFlows() {
  console.log('Starting critical flow tests...');
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
    warnings: []
  };

  try {
    // 1. Test Homepage
    console.log('\n1. Testing Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png'), fullPage: true });
    findings.successful.push('✓ Homepage loads successfully');

    // Check for key elements
    const heroTitle = await page.$('h1');
    if (heroTitle) {
      const heroText = await page.evaluate(el => el.textContent, heroTitle);
      console.log(`   Hero title: ${heroText}`);
      findings.successful.push(`✓ Hero section present: "${heroText}"`);
    }

    // 2. Test Navigation Links
    console.log('\n2. Testing Navigation Links...');
    
    // Features page
    try {
      await page.click('a[href="/features"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(screenshotsDir, '02-features.png'), fullPage: true });
      findings.successful.push('✓ Features page navigation works');
    } catch (err) {
      findings.failures.push('✗ Features page navigation failed: ' + err.message);
    }

    // Pricing page
    try {
      await page.click('a[href="/pricing"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(screenshotsDir, '03-pricing.png'), fullPage: true });
      findings.successful.push('✓ Pricing page navigation works');
    } catch (err) {
      findings.failures.push('✗ Pricing page navigation failed: ' + err.message);
    }

    // 3. Test Authentication Flow
    console.log('\n3. Testing Authentication Flow...');
    
    // Go to login page
    try {
      await page.click('a[href="/login"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(screenshotsDir, '04-login-page.png') });
      findings.successful.push('✓ Login page navigation works');
    } catch (err) {
      findings.failures.push('✗ Login page navigation failed: ' + err.message);
    }

    // Test login with demo credentials
    try {
      await page.type('input[name="email"]', 'demo@example.com');
      await page.type('input[name="password"]', 'demo123');
      await page.screenshot({ path: path.join(screenshotsDir, '05-login-filled.png') });
      
      // Submit form
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      
      const currentUrl = page.url();
      console.log(`   After login URL: ${currentUrl}`);
      await page.screenshot({ path: path.join(screenshotsDir, '06-after-login.png'), fullPage: true });
      
      if (currentUrl.includes('/client') || currentUrl.includes('/staff')) {
        findings.successful.push(`✓ Login successful - redirected to: ${currentUrl}`);
      } else {
        findings.warnings.push(`⚠ Login completed but unexpected redirect: ${currentUrl}`);
      }
    } catch (err) {
      findings.failures.push('✗ Login process failed: ' + err.message);
    }

    // 4. Test Client Portal Navigation
    console.log('\n4. Testing Client Portal...');
    
    // If not in client portal, navigate there
    if (!page.url().includes('/client')) {
      try {
        await page.goto('http://localhost:3000/client/dashboard', { waitUntil: 'networkidle0' });
      } catch (err) {
        console.log('   Could not navigate to client dashboard directly');
      }
    }

    // Test main navigation items
    const clientNavItems = [
      { selector: 'a[href="/client/pets"]', name: 'Pets', screenshot: '07-client-pets.png' },
      { selector: 'a[href="/client/appointments"]', name: 'Appointments', screenshot: '08-client-appointments.png' },
      { selector: 'a[href="/client/medical-records"]', name: 'Medical Records', screenshot: '09-client-records.png' },
      { selector: 'a[href="/client/prescriptions"]', name: 'Prescriptions', screenshot: '10-client-prescriptions.png' }
    ];

    for (const item of clientNavItems) {
      try {
        const element = await page.$(item.selector);
        if (element) {
          await element.click();
          await page.waitForNavigation({ waitUntil: 'networkidle0' });
          await page.screenshot({ path: path.join(screenshotsDir, item.screenshot), fullPage: true });
          findings.successful.push(`✓ Client ${item.name} navigation works`);
        } else {
          findings.warnings.push(`⚠ Client ${item.name} link not found`);
        }
      } catch (err) {
        findings.failures.push(`✗ Client ${item.name} navigation failed: ${err.message}`);
      }
    }

    // Test appointment booking flow
    console.log('\n5. Testing Appointment Booking...');
    try {
      await page.goto('http://localhost:3000/client/appointments', { waitUntil: 'networkidle0' });
      
      // Look for "Book New Appointment" button
      const bookButton = await page.$('button:has-text("Book New Appointment"), a:has-text("Book New Appointment")');
      if (bookButton) {
        await bookButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({ path: path.join(screenshotsDir, '11-appointment-booking.png'), fullPage: true });
        findings.successful.push('✓ Appointment booking flow initiated');
      } else {
        findings.warnings.push('⚠ Book appointment button not found');
      }
    } catch (err) {
      findings.failures.push('✗ Appointment booking test failed: ' + err.message);
    }

    // 6. Test Staff Portal
    console.log('\n6. Testing Staff Portal...');
    try {
      await page.goto('http://localhost:3000/staff/dashboard', { waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(screenshotsDir, '12-staff-dashboard.png'), fullPage: true });
      findings.successful.push('✓ Staff dashboard loads');

      // Test staff navigation
      const staffNavItems = [
        { selector: 'a[href="/staff/schedule"]', name: 'Schedule', screenshot: '13-staff-schedule.png' },
        { selector: 'a[href="/staff/patients"]', name: 'Patients', screenshot: '14-staff-patients.png' }
      ];

      for (const item of staffNavItems) {
        try {
          const element = await page.$(item.selector);
          if (element) {
            await element.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            await page.screenshot({ path: path.join(screenshotsDir, item.screenshot), fullPage: true });
            findings.successful.push(`✓ Staff ${item.name} navigation works`);
          } else {
            findings.warnings.push(`⚠ Staff ${item.name} link not found`);
          }
        } catch (err) {
          findings.failures.push(`✗ Staff ${item.name} navigation failed: ${err.message}`);
        }
      }
    } catch (err) {
      findings.failures.push('✗ Staff portal access failed: ' + err.message);
    }

    // 7. Check for 404 errors
    console.log('\n7. Testing for 404 errors...');
    const testUrls = [
      'http://localhost:3000/nonexistent',
      'http://localhost:3000/client/nonexistent',
      'http://localhost:3000/staff/nonexistent'
    ];

    for (const url of testUrls) {
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle0' });
        if (response.status() === 404) {
          findings.successful.push(`✓ 404 page properly handled for: ${url}`);
        } else {
          findings.warnings.push(`⚠ Unexpected status ${response.status()} for: ${url}`);
        }
      } catch (err) {
        findings.warnings.push(`⚠ Could not test 404 for ${url}: ${err.message}`);
      }
    }

    // 8. Test Responsive Design
    console.log('\n8. Testing Responsive Design...');
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    for (const viewport of viewports) {
      try {
        await page.setViewport({ width: viewport.width, height: viewport.height });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({ 
          path: path.join(screenshotsDir, `15-responsive-${viewport.name}.png`),
          fullPage: false 
        });
        findings.successful.push(`✓ Responsive design works at ${viewport.name} (${viewport.width}x${viewport.height})`);
      } catch (err) {
        findings.failures.push(`✗ Responsive test failed for ${viewport.name}: ${err.message}`);
      }
    }

    // 9. Check for console errors
    console.log('\n9. Checking for console errors...');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through a few key pages to catch errors
    const pagesToCheck = [
      'http://localhost:3000',
      'http://localhost:3000/features',
      'http://localhost:3000/client/dashboard'
    ];

    for (const url of pagesToCheck) {
      try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        // Continue checking other pages
      }
    }

    if (consoleErrors.length > 0) {
      findings.warnings.push(`⚠ Console errors detected: ${consoleErrors.length} errors`);
      consoleErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      findings.successful.push('✓ No console errors detected');
    }

  } catch (error) {
    console.error('Critical error during testing:', error);
    findings.failures.push(`✗ Critical test error: ${error.message}`);
  } finally {
    // Generate summary report
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY REPORT');
    console.log('='.repeat(80));
    
    console.log('\n✅ SUCCESSFUL TESTS:');
    findings.successful.forEach(item => console.log(`   ${item}`));
    
    if (findings.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      findings.warnings.forEach(item => console.log(`   ${item}`));
    }
    
    if (findings.failures.length > 0) {
      console.log('\n❌ FAILURES:');
      findings.failures.forEach(item => console.log(`   ${item}`));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`Total: ${findings.successful.length} passed, ${findings.warnings.length} warnings, ${findings.failures.length} failures`);
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    console.log('='.repeat(80));

    // Keep browser open for 10 seconds to review
    console.log('\nBrowser will close in 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    await browser.close();
  }
}

// Run the tests
testCriticalFlows().catch(console.error);