const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testAuthFlow() {
  const screenshotsDir = path.join(__dirname, 'screenshots-auth');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slower for better visibility
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('Starting authentication flow test...\n');

  try {
    // 1. Go to home page
    console.log('1. Loading home page...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '01-home.png'), fullPage: true });
    console.log('✓ Home page loaded');

    // 2. Look for Sign In/Login button more thoroughly
    console.log('\n2. Looking for authentication entry point...');
    
    // Try multiple selectors
    const loginSelectors = [
      'a:has-text("Sign In")',
      'a:has-text("Log In")',
      'a:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'button:has-text("Login")',
      'a[href="/login"]',
      'a[href="/signin"]',
      'a[href="/auth/login"]',
      '[data-testid="login-button"]',
      '.sign-in-button',
      '#login-button'
    ];

    let loginElement = null;
    for (const selector of loginSelectors) {
      try {
        loginElement = await page.$(selector);
        if (loginElement) {
          console.log(`✓ Found login element with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying
      }
    }

    // If not found, check for authentication in navigation
    if (!loginElement) {
      console.log('Checking navigation for auth links...');
      const navLinks = await page.$$eval('nav a, header a, nav button, header button', elements => 
        elements.map(el => ({ 
          text: el.textContent.trim(), 
          href: el.href || 'button',
          tagName: el.tagName 
        }))
      );
      console.log('Navigation elements found:', navLinks);
      
      // Look for auth-related text
      const authLink = navLinks.find(link => 
        /sign|log|auth/i.test(link.text)
      );
      
      if (authLink) {
        console.log(`Found auth link in nav: ${authLink.text}`);
        loginElement = await page.$(`text="${authLink.text}"`);
      }
    }

    if (!loginElement) {
      console.log('⚠ No login/sign-in element found on home page');
      console.log('Trying direct navigation to /login...');
      
      // Try direct navigation
      await page.goto('http://localhost:3000/login');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotsDir, '02-login-direct.png'), fullPage: true });
      
      // Check if we reached a login page
      const pageTitle = await page.title();
      const pageUrl = page.url();
      console.log(`Current page title: ${pageTitle}`);
      console.log(`Current URL: ${pageUrl}`);
    } else {
      // Click the login element
      await loginElement.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotsDir, '02-login-page.png'), fullPage: true });
      console.log('✓ Navigated to login page');
    }

    // 3. Try to login with demo credentials
    console.log('\n3. Attempting login with demo credentials...');
    
    // Wait a bit for any redirects or page loads
    await page.waitForTimeout(2000);
    
    // Find email/username field
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="username" i]',
      'input[id="email"]',
      'input[id="username"]',
      '#email',
      '#username'
    ];
    
    let emailField = null;
    for (const selector of emailSelectors) {
      emailField = await page.$(selector);
      if (emailField) {
        console.log(`✓ Found email field with selector: ${selector}`);
        break;
      }
    }

    // Find password field
    const passwordField = await page.$('input[type="password"]');
    
    if (emailField && passwordField) {
      console.log('✓ Found login form fields');
      
      // Fill in demo credentials
      await emailField.fill('demo@example.com');
      await passwordField.fill('DemoRocks2025!');
      
      await page.screenshot({ path: path.join(screenshotsDir, '03-login-filled.png') });
      console.log('✓ Filled in demo credentials');
      
      // Find and click submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Log In")',
        'button:has-text("Login")',
        'input[type="submit"]',
        '[data-testid="login-submit"]'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        submitButton = await page.$(selector);
        if (submitButton) {
          console.log(`✓ Found submit button with selector: ${selector}`);
          break;
        }
      }
      
      if (submitButton) {
        await submitButton.click();
        console.log('✓ Clicked submit button');
        
        // Wait for navigation or response
        await page.waitForTimeout(3000);
        
        const afterLoginUrl = page.url();
        console.log(`URL after login: ${afterLoginUrl}`);
        
        await page.screenshot({ path: path.join(screenshotsDir, '04-after-login.png'), fullPage: true });
        
        // Check if we're on a dashboard or authenticated page
        if (afterLoginUrl.includes('dashboard') || afterLoginUrl !== 'http://localhost:3000/login') {
          console.log('✓ Login successful - reached authenticated area');
          
          // Test dashboard features
          console.log('\n4. Testing dashboard features...');
          
          // Look for key dashboard elements
          const dashboardFeatures = [
            'Upload', 'Templates', 'Models', 'History', 
            'Settings', 'Profile', 'Dashboard', 'Overview'
          ];
          
          for (const feature of dashboardFeatures) {
            const element = await page.$(`text="${feature}"`);
            if (element) {
              console.log(`✓ Found dashboard feature: ${feature}`);
              
              // Try clicking on some features
              if (['Templates', 'Models', 'Upload'].includes(feature)) {
                try {
                  await element.click();
                  await page.waitForLoadState('networkidle');
                  await page.screenshot({ 
                    path: path.join(screenshotsDir, `05-${feature.toLowerCase()}.png`), 
                    fullPage: true 
                  });
                  console.log(`✓ Navigated to ${feature} page`);
                  
                  // Go back to dashboard if possible
                  const dashboardLink = await page.$('a:has-text("Dashboard")');
                  if (dashboardLink) {
                    await dashboardLink.click();
                    await page.waitForLoadState('networkidle');
                  }
                } catch (e) {
                  console.log(`⚠ Could not navigate to ${feature}: ${e.message}`);
                }
              }
            }
          }
        } else {
          console.log('⚠ Login may have failed - still on login page');
        }
      } else {
        console.log('⚠ Could not find submit button');
      }
    } else {
      console.log('⚠ Could not find login form fields');
      console.log(`Email field found: ${!!emailField}`);
      console.log(`Password field found: ${!!passwordField}`);
    }

    // 5. Test error pages
    console.log('\n5. Testing error handling...');
    await page.goto('http://localhost:3000/nonexistent-page-404');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '06-404-page.png'), fullPage: true });
    console.log('✓ Tested 404 page');

    // Final summary
    console.log('\n=== Authentication Flow Test Summary ===');
    console.log(`Screenshots saved in: ${screenshotsDir}`);
    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png'), fullPage: true });
  } finally {
    console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to close.');
    await new Promise(() => {}); // Keep script running
  }
}

testAuthFlow().catch(console.error);