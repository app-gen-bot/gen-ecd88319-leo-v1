const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function runBrowserTests() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  console.log('Starting PawsFlow browser tests on port 3001...\n');

  try {
    // Test 1: Navigation Test
    console.log('1. Navigation Test');
    console.log('   - Navigating to homepage...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png'), fullPage: true });
    console.log('   ✓ Homepage screenshot taken');
    
    // Click Sign In link
    console.log('   - Clicking Sign In link...');
    const signInLink = await page.$('a[href="/login"]');
    if (signInLink) {
      await signInLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const currentUrl = page.url();
      console.log(`   ✓ Navigated to: ${currentUrl}`);
      await page.screenshot({ path: path.join(screenshotsDir, '02-login-page.png'), fullPage: true });
      console.log('   ✓ Login page screenshot taken');
    } else {
      console.log('   ✗ Sign In link not found');
    }

    // Test 2: Authentication Flow
    console.log('\n2. Authentication Flow Test');
    console.log('   - Entering demo credentials...');
    
    // Fill in email
    await page.type('input[type="email"]', 'demo@example.com');
    
    // Fill in password
    await page.type('input[type="password"]', 'demo123');
    
    // Click Sign In button
    console.log('   - Clicking Sign In button...');
    const signInButton = await page.$('button[type="submit"]');
    if (signInButton) {
      await signInButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for redirect
      const afterLoginUrl = page.url();
      console.log(`   ✓ After login URL: ${afterLoginUrl}`);
      await page.screenshot({ path: path.join(screenshotsDir, '03-dashboard.png'), fullPage: true });
      console.log('   ✓ Dashboard screenshot taken');
    } else {
      console.log('   ✗ Sign In button not found');
    }

    // Test 3: Client Portal Navigation
    console.log('\n3. Client Portal Navigation Test');
    
    // Navigate to My Pets
    console.log('   - Clicking My Pets...');
    const myPetsLink = await page.$('a[href="/client/pets"]');
    if (myPetsLink) {
      await myPetsLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: path.join(screenshotsDir, '04-my-pets.png'), fullPage: true });
      console.log('   ✓ My Pets screenshot taken');
    } else {
      console.log('   ✗ My Pets link not found');
    }
    
    // Navigate to Appointments
    console.log('   - Clicking Appointments...');
    const appointmentsLink = await page.$('a[href="/client/appointments"]');
    if (appointmentsLink) {
      await appointmentsLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: path.join(screenshotsDir, '05-appointments.png'), fullPage: true });
      console.log('   ✓ Appointments screenshot taken');
      
      // Click Book Appointment button
      console.log('   - Clicking Book Appointment button...');
      const bookButton = await page.$('a[href="/client/appointments/book"]');
      if (bookButton) {
        await bookButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await page.screenshot({ path: path.join(screenshotsDir, '06-booking-wizard.png'), fullPage: true });
        console.log('   ✓ Booking wizard screenshot taken');
      } else {
        console.log('   ✗ Book Appointment button not found');
      }
    } else {
      console.log('   ✗ Appointments link not found');
    }

    // Test 4: 404 Test
    console.log('\n4. 404 Page Test');
    console.log('   - Navigating to non-existent route...');
    await page.goto('http://localhost:3001/nonexistent', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '07-404-page.png'), fullPage: true });
    console.log('   ✓ 404 page screenshot taken');

    console.log('\n✅ All tests completed successfully!');
    console.log(`\nScreenshots saved to: ${screenshotsDir}`);
    
    // List all screenshots
    const files = await fs.readdir(screenshotsDir);
    console.log('\nGenerated screenshots:');
    files.forEach(file => {
      if (file.endsWith('.png')) {
        console.log(`  - ${file}`);
      }
    });

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
  } finally {
    console.log('\nClosing browser...');
    await browser.close();
    console.log('Browser closed.');
  }
}

// Run the tests
runBrowserTests().catch(console.error);