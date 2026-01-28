const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function visualTest() {
  const screenshotsDir = path.join(__dirname, 'screenshots-visual');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('Starting visual inspection...\n');

  try {
    // 1. Home page (will redirect)
    console.log('1. Testing home page redirect...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log(`Redirected to: ${currentUrl}`);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-signin-page.png'), 
      fullPage: true 
    });

    // 2. Check if Clerk sign-in loaded
    console.log('\n2. Checking Clerk sign-in elements...');
    
    // Wait for Clerk to load
    await page.waitForTimeout(3000);
    
    // Look for Clerk-specific elements
    const clerkElements = await page.$$eval('*', elements => {
      const clerkSelectors = [];
      elements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          if (el.className.includes('cl-') || el.id?.includes('clerk')) {
            clerkSelectors.push({
              tag: el.tagName,
              class: el.className,
              id: el.id || '',
              text: el.textContent?.slice(0, 50)
            });
          }
        }
      });
      return clerkSelectors.slice(0, 10);
    });
    
    console.log('Found Clerk elements:', clerkElements);

    // 3. Try sign-up page
    console.log('\n3. Checking sign-up page...');
    await page.goto('http://localhost:3000/sign-up');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-signup-page.png'), 
      fullPage: true 
    });

    // 4. Check auth routes
    console.log('\n4. Checking other auth routes...');
    const authRoutes = [
      '/auth/reset-password',
      '/auth/2fa/setup'
    ];
    
    for (const route of authRoutes) {
      try {
        console.log(`Checking ${route}...`);
        await page.goto(`http://localhost:3000${route}`);
        await page.waitForLoadState('networkidle');
        const finalUrl = page.url();
        console.log(`  Result: ${finalUrl}`);
        
        if (!finalUrl.includes('sign-in')) {
          await page.screenshot({ 
            path: path.join(screenshotsDir, `${route.replace(/\//g, '-')}.png`), 
            fullPage: true 
          });
        }
      } catch (e) {
        console.log(`  Error: ${e.message}`);
      }
    }

    // 5. Test public routes from middleware
    console.log('\n5. Testing public routes...');
    const publicRoutes = ['/terms', '/privacy', '/contact-sales', '/system-status'];
    
    for (const route of publicRoutes) {
      try {
        console.log(`Testing ${route}...`);
        const response = await page.goto(`http://localhost:3000${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });
        const status = response ? response.status() : 'unknown';
        console.log(`  Status: ${status}`);
        
        if (status === 200) {
          await page.screenshot({ 
            path: path.join(screenshotsDir, `${route.replace(/\//g, '-')}.png`), 
            fullPage: true 
          });
        }
      } catch (e) {
        console.log(`  Error: ${e.message}`);
      }
    }

    // Final summary
    console.log('\n=== Visual Test Summary ===');
    console.log(`Current application state:`);
    console.log(`- Authentication: Clerk (hosted UI)`);
    console.log(`- Entry point: Redirects to sign-in`);
    console.log(`- Dashboard-focused application`);
    console.log(`\nScreenshots saved in: ${screenshotsDir}`);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    console.log('\nBrowser will remain open for manual inspection.');
    console.log('You can manually test the sign-in with demo@example.com / DemoRocks2025!');
    console.log('Press Ctrl+C to close.');
    await new Promise(() => {});
  }
}

visualTest().catch(console.error);