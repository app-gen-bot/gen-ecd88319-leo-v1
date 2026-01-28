const puppeteer = require('puppeteer');

async function testSlackClone() {
  console.log('🚀 Starting Slack Clone Tests...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Landing Page
    console.log('📍 Test 1: Landing Page');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1', { timeout: 5000 });
    const landingTitle = await page.$eval('h1', el => el.textContent);
    console.log(`   ✅ Landing page loaded: "${landingTitle}"`);
    await page.screenshot({ path: 'screenshots/1-landing-page.png' });
    
    // Test 2: Navigate to Login
    console.log('\n📍 Test 2: Login Page');
    await page.click('a[href="/login"]');
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    console.log('   ✅ Login page loaded');
    await page.screenshot({ path: 'screenshots/2-login-page.png' });
    
    // Test 3: Login with demo credentials
    console.log('\n📍 Test 3: Login Process');
    await page.type('input[type="email"]', 'demo@example.com');
    await page.type('input[type="password"]', 'password');
    await page.screenshot({ path: 'screenshots/3-login-filled.png' });
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('   ✅ Login successful');
    
    // Test 4: Main Workspace View
    console.log('\n📍 Test 4: Workspace View');
    await page.waitForSelector('.workspace-sidebar', { timeout: 5000 });
    console.log('   ✅ Workspace loaded');
    await page.screenshot({ path: 'screenshots/4-workspace-main.png' });
    
    // Test 5: Navigate to channels
    console.log('\n📍 Test 5: Channel Navigation');
    
    // Click on #general channel
    await page.click('button:has-text("general")');
    await page.waitForTimeout(1000);
    console.log('   ✅ Navigated to #general');
    await page.screenshot({ path: 'screenshots/5-channel-general.png' });
    
    // Click on #engineering channel
    await page.click('button:has-text("engineering")');
    await page.waitForTimeout(1000);
    console.log('   ✅ Navigated to #engineering');
    await page.screenshot({ path: 'screenshots/6-channel-engineering.png' });
    
    // Test 6: Direct Messages
    console.log('\n📍 Test 6: Direct Messages');
    await page.click('button:has-text("Alice Johnson")');
    await page.waitForTimeout(1000);
    console.log('   ✅ Opened DM with Alice');
    await page.screenshot({ path: 'screenshots/7-dm-alice.png' });
    
    // Test 7: Browse Channels
    console.log('\n📍 Test 7: Browse Channels');
    await page.goto('http://localhost:3000/browse-channels');
    await page.waitForSelector('h1:has-text("Browse Channels")', { timeout: 5000 });
    console.log('   ✅ Browse channels page loaded');
    await page.screenshot({ path: 'screenshots/8-browse-channels.png' });
    
    // Test 8: Settings
    console.log('\n📍 Test 8: Settings Pages');
    await page.goto('http://localhost:3000/settings/profile');
    await page.waitForTimeout(1000);
    console.log('   ✅ Profile settings loaded');
    await page.screenshot({ path: 'screenshots/9-settings-profile.png' });
    
    await page.goto('http://localhost:3000/settings/preferences');
    await page.waitForTimeout(1000);
    console.log('   ✅ Preferences loaded');
    await page.screenshot({ path: 'screenshots/10-settings-preferences.png' });
    
    console.log('\n✅ All tests completed successfully!');
    console.log('📸 Screenshots saved in ./screenshots/ directory');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'screenshots/error-state.png' });
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run tests
testSlackClone().catch(console.error);