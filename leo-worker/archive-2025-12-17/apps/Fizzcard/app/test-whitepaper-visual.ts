/**
 * Visual Test for Whitepaper Page
 *
 * Captures screenshots of the whitepaper to verify:
 * - Beautiful dark mode design
 * - Proper rendering of all sections
 * - Responsive layout
 * - Gradient effects and styling
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const WHITEPAPER_URL = 'http://localhost:5014/whitepaper';
const SCREENSHOT_DIR = './screenshots/whitepaper';

async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

async function captureWhitepaperScreenshots() {
  console.log('🚀 Starting whitepaper visual test...\n');

  await ensureScreenshotDir();

  const browser: Browser = await chromium.launch({
    headless: false, // Show browser for visual verification
  });

  const page: Page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });

  try {
    // Navigate to whitepaper
    console.log('📄 Navigating to whitepaper page...');
    await page.goto(WHITEPAPER_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Let animations settle

    // 1. Capture full page (cover section)
    console.log('📸 Capturing cover section...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '1-cover-section.png'),
      fullPage: false,
    });

    // 2. Scroll to Executive Summary
    console.log('📸 Capturing Executive Summary...');
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '2-executive-summary.png'),
      fullPage: false,
    });

    // 3. Scroll to Connection Crisis section
    console.log('📸 Capturing Connection Crisis section...');
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '3-connection-crisis.png'),
      fullPage: false,
    });

    // 4. Scroll to Statistics
    console.log('📸 Capturing Statistics cards...');
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '4-statistics.png'),
      fullPage: false,
    });

    // 5. Scroll to Solution section
    console.log('📸 Capturing Solution section...');
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '5-solution-section.png'),
      fullPage: false,
    });

    // 6. Scroll to Reward Table
    console.log('📸 Capturing Reward Table...');
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '6-reward-table.png'),
      fullPage: false,
    });

    // 7. Scroll to Conclusion
    console.log('📸 Capturing Conclusion section...');
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '7-conclusion.png'),
      fullPage: false,
    });

    // 8. Scroll to Footer/Contact
    console.log('📸 Capturing Footer/Contact section...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '8-footer.png'),
      fullPage: false,
    });

    // 9. Full page screenshot
    console.log('📸 Capturing full page screenshot...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'full-page.png'),
      fullPage: true,
    });

    // 10. Test mobile view
    console.log('📱 Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(WHITEPAPER_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-view.png'),
      fullPage: true,
    });

    // 11. Test tablet view
    console.log('📱 Testing tablet view...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(WHITEPAPER_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'tablet-view.png'),
      fullPage: true,
    });

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}\n`);

    // Visual verification checklist
    console.log('🎨 Visual Verification Checklist:');
    console.log('  ✓ Dark mode background (should be dark)');
    console.log('  ✓ Gradient text effects (primary → accent)');
    console.log('  ✓ Network visualization SVG (background pattern)');
    console.log('  ✓ Statistics cards (73%, 14%, 5)');
    console.log('  ✓ Connection flow diagram');
    console.log('  ✓ Reward table styling');
    console.log('  ✓ Responsive design (mobile, tablet, desktop)');
    console.log('  ✓ Typography hierarchy (h1 → h2 → h3)');
    console.log('  ✓ Glass-morphism effects on cards');
    console.log('  ✓ Border accents and highlights');

    // Keep browser open for manual inspection
    console.log('\n👀 Browser kept open for manual inspection...');
    console.log('Press Ctrl+C to close when done.\n');

    // Wait indefinitely (user will close manually)
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
    throw error;
  } finally {
    // Browser will close when user terminates the script
  }
}

// Run the test
captureWhitepaperScreenshots().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
