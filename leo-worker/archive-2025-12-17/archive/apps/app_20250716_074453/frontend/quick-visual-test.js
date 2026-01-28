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

async function runQuickTest() {
  console.log('Starting quick visual test...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  const page = await browser.newPage();
  const errors = [];
  
  // Track errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    // 1. Homepage
    console.log('1. Homepage...');
    await page.goto('http://localhost:3000');
    await sleep(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '01-homepage.png'), fullPage: true });
    
    // 2. Login page
    console.log('2. Login page...');
    await page.goto('http://localhost:3000/login');
    await sleep(1500);
    await page.screenshot({ path: path.join(screenshotsDir, '02-login.png') });
    
    // 3. Try demo login
    console.log('3. Demo login...');
    const demoClicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Continue with Demo Account')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    
    if (demoClicked) {
      console.log('   Clicked demo button');
      await sleep(3000);
      await page.screenshot({ path: path.join(screenshotsDir, '03-after-login.png'), fullPage: true });
    }
    
    // 4. Mobile view
    console.log('4. Mobile view...');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:3000');
    await sleep(1500);
    await page.screenshot({ path: path.join(screenshotsDir, '04-mobile.png'), fullPage: true });
    
    // 5. Check for theme toggle
    console.log('5. Theme toggle...');
    await page.setViewport({ width: 1400, height: 900 });
    const hasThemeToggle = await page.evaluate(() => {
      const selectors = ['[aria-label*="theme"]', '[aria-label*="mode"]', 'button'];
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (el.innerHTML.includes('sun') || el.innerHTML.includes('moon') || 
              el.getAttribute('aria-label')?.includes('theme')) {
            el.click();
            return true;
          }
        }
      }
      return false;
    });
    
    if (hasThemeToggle) {
      console.log('   Found and clicked theme toggle');
      await sleep(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '05-theme-toggled.png') });
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Screenshots saved: ${fs.readdirSync(screenshotsDir).length}`);
    console.log(`Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\nErrors found:');
      errors.forEach(e => console.log(`  - ${e}`));
    }
    
    console.log('\nDone! Browser will close in 5 seconds...');
    await sleep(5000);
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

runQuickTest();