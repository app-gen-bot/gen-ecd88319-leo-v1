# FizzCard PWA Testing Guide

## Quick Start Testing

### 1. Start the Development Server
```bash
cd /Users/labheshpatel/apps/app-factory/apps/Fizzcard/app
npm run dev
```

Server will start at:
- Frontend: http://localhost:5014
- Backend: http://localhost:5013

### 2. Verify PWA Assets

Run these commands to verify all PWA files are accessible:

```bash
# Check manifest
curl http://localhost:5014/manifest.json

# Check service worker
curl http://localhost:5014/sw.js

# Check icons
curl -I http://localhost:5014/icon-192.png
curl -I http://localhost:5014/icon-512.png
curl -I http://localhost:5014/icon-scan.png
curl -I http://localhost:5014/icon-card.png
```

All should return 200 OK.

## Desktop Testing (Chrome/Edge)

### 1. Chrome DevTools PWA Check

1. Open http://localhost:5014 in Chrome
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Application** tab

#### Manifest Check
- Navigate to: Application → Manifest
- Should display:
  ```
  Name: FizzCard - Networking Rewarded
  Short Name: FizzCard
  Theme Color: #00D9FF
  Background Color: #0A0A0F
  Start URL: /
  Display: standalone
  Orientation: portrait
  ```
- Icons section should show:
  - 192x192 icon
  - 512x512 icon
- Shortcuts section should show:
  - Scan QR Code
  - My FizzCard

#### Service Worker Check
- Navigate to: Application → Service Workers
- Should show:
  ```
  sw.js - Active and Running
  Scope: http://localhost:5014/
  Status: activated
  ```
- Try these actions:
  - Click "Update" - should reload SW
  - Click "Unregister" then reload - should re-register
  - Check "Offline" checkbox - should show offline indicator

#### Cache Storage Check
- Navigate to: Application → Cache Storage
- After browsing the app, should show:
  ```
  fizzcard-v1
    ├── / (HTML)
    ├── /manifest.json
    ├── /icon-192.png
    └── /icon-512.png
  ```

### 2. Install the PWA

#### Option A: Install Button (Chrome 90+)
1. Look for install icon in address bar (⊕ or computer/phone icon)
2. Click it
3. Click "Install" in dialog
4. App should open in standalone window

#### Option B: Menu Install
1. Click Chrome menu (⋮)
2. Select "Install FizzCard..."
3. Click "Install" in dialog
4. App should open in standalone window

#### Option C: Install Prompt (may appear automatically)
1. Wait a few seconds after page load
2. Look for FizzCard install prompt at bottom
3. Click "Install App" button
4. Native install dialog should appear

### 3. Test Installed App

After installation:
- [ ] App opens in standalone window (no browser chrome)
- [ ] Window title shows "FizzCard"
- [ ] App appears in Applications folder (Mac) or Start Menu (Windows)
- [ ] App icon appears correct
- [ ] Can pin to dock/taskbar
- [ ] Closing and reopening works
- [ ] App works offline (test below)

### 4. Lighthouse PWA Audit

1. Open http://localhost:5014 in Chrome
2. Open DevTools (F12)
3. Go to **Lighthouse** tab
4. Check only "Progressive Web App"
5. Click "Generate report"

#### Expected Results:
```
Progressive Web App: 90+ / 100

✅ Installable
  ✅ Registers a service worker
  ✅ Provides valid manifest

✅ PWA Optimized
  ✅ Has a viewport meta tag
  ✅ Content sized correctly for viewport
  ✅ Has a theme color meta tag

⚠️ May have warnings:
  ⚠️ Icons (placeholder quality)
  ⚠️ HTTPS (dev server uses HTTP)
  ⚠️ Offline fallback page
```

## Mobile Testing (Recommended)

### Android Testing (Chrome)

#### 1. Access from Mobile
```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from phone:
http://[YOUR_IP]:5014
# Example: http://192.168.1.100:5014
```

#### 2. Install App
1. Open URL in Chrome on Android
2. Banner should appear: "Add FizzCard to Home screen"
   - If not, tap menu (⋮) → "Add to Home screen"
3. Tap "Add" or "Install"
4. App icon appears on home screen

#### 3. Test Installed App
- [ ] Tap icon - opens in full screen
- [ ] No browser address bar
- [ ] Status bar uses theme color (#00D9FF - cyan)
- [ ] Back button works correctly
- [ ] Can switch between apps normally
- [ ] Icon looks correct on home screen

#### 4. Test Offline
1. Open installed FizzCard app
2. Navigate to a few pages
3. Enable airplane mode
4. Close and reopen app
5. Should show:
   - Red "You're offline" banner at top
   - Previously visited pages load from cache
   - New API calls fail gracefully

### iOS Testing (Safari)

#### 1. Access from Mobile
Same as Android - use local IP address.

#### 2. Install App
1. Open URL in Safari on iOS
2. Tap Share button (square with up arrow)
3. Scroll and tap "Add to Home Screen"
4. Edit name if desired
5. Tap "Add"
6. App icon appears on home screen

#### 3. Test Installed App
- [ ] Tap icon - opens in full screen
- [ ] Status bar visible but styled
- [ ] Navigation works correctly
- [ ] Can switch between apps
- [ ] Icon looks correct

#### 4. iOS Limitations
- ⚠️ Install prompt won't appear automatically
- ⚠️ Must use Safari (Chrome on iOS won't install)
- ⚠️ Service worker support may be limited on older iOS
- ⚠️ Some PWA features unavailable

## Offline Testing Scenarios

### Scenario 1: Full Offline
1. Open FizzCard (installed or browser)
2. Navigate to Dashboard
3. Turn off WiFi and mobile data
4. Reload page
5. **Expected**:
   - Red offline banner appears
   - Cached pages still work
   - "You're offline" message visible

### Scenario 2: Intermittent Connection
1. Start with connection
2. Turn off connection
3. Try to navigate
4. Turn on connection
5. **Expected**:
   - Offline banner appears/disappears
   - App recovers automatically
   - API calls retry when online

### Scenario 3: API Offline
1. Stop backend server (Ctrl+C)
2. Keep frontend running
3. Try to use app features
4. **Expected**:
   - App shell still works
   - API calls fail gracefully
   - User-friendly error messages

## App Shortcuts Testing (Android)

1. Long-press FizzCard icon on home screen
2. Should show shortcuts:
   - **Scan QR Code** → Opens /scan
   - **My FizzCard** → Opens /my-fizzcard
3. Tap a shortcut
4. **Expected**: Opens directly to that page

## Network Throttling Test

### Chrome DevTools
1. Open DevTools
2. Go to Network tab
3. Change throttling to "Slow 3G"
4. Navigate app
5. **Expected**:
   - App loads quickly from cache
   - New data loads slower but doesn't block UI
   - Smooth experience despite slow network

## Installation Analytics (Optional)

Add to `InstallPrompt.tsx` to track:
```typescript
const handleInstall = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  // Track this!
  console.log(`Install outcome: ${outcome}`);
  // Send to analytics: analytics.track('pwa_install', { outcome });

  setDeferredPrompt(null);
  setShowPrompt(false);
};
```

## Common Issues and Fixes

### Issue: Service Worker Not Registering
**Symptoms**: Console shows SW registration failed
**Fix**:
- Check sw.js syntax (no errors)
- Verify sw.js is in /public folder
- Hard refresh (Cmd+Shift+R)
- Clear cache and reload

### Issue: Manifest Not Loading
**Symptoms**: DevTools shows no manifest
**Fix**:
- Verify manifest.json in /public
- Check JSON syntax (no trailing commas)
- Ensure link tag in index.html
- Hard refresh

### Issue: Install Button Doesn't Appear
**Symptoms**: No install prompt or button
**Fix**:
- Must use HTTPS in production (HTTP ok for localhost)
- Manifest must be valid
- Service worker must be registered
- May not show if already installed
- Safari/iOS: Manual install only

### Issue: Icons Not Showing
**Symptoms**: Broken image icons in manifest
**Fix**:
- Verify icon files exist in /public
- Check file names match manifest
- Ensure icons are valid PNG files
- Try regenerating with generate-icons.cjs

### Issue: Offline Mode Not Working
**Symptoms**: App doesn't load offline
**Fix**:
- Service worker must be activated
- Cache must be populated (visit pages first)
- Check SW cache in DevTools
- Verify SW fetch event logic

## Automation Testing (Future)

### Playwright PWA Test Example
```typescript
// tests/pwa.spec.ts
import { test, expect } from '@playwright/test';

test('PWA manifest is valid', async ({ page }) => {
  await page.goto('http://localhost:5014');

  const manifest = await page.evaluate(() => {
    const link = document.querySelector('link[rel="manifest"]');
    return fetch(link.href).then(r => r.json());
  });

  expect(manifest.name).toBe('FizzCard - Networking Rewarded');
  expect(manifest.short_name).toBe('FizzCard');
  expect(manifest.theme_color).toBe('#00D9FF');
});

test('Service worker registers', async ({ page }) => {
  await page.goto('http://localhost:5014');

  const swRegistered = await page.evaluate(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const reg = await navigator.serviceWorker.getRegistration();
    return !!reg;
  });

  expect(swRegistered).toBe(true);
});
```

## Production Validation

Before deploying:
- [ ] Replace placeholder icons with production designs
- [ ] Test on HTTPS domain (PWA requires HTTPS)
- [ ] Verify all icons load correctly
- [ ] Test install flow on real devices
- [ ] Run Lighthouse audit (aim for 90+)
- [ ] Test offline functionality thoroughly
- [ ] Verify shortcuts work
- [ ] Check theme colors on different devices
- [ ] Monitor service worker errors
- [ ] Test on multiple browsers/devices

## Monitoring in Production

Track these metrics:
- PWA install rate (prompt shown vs. installed)
- Service worker errors
- Cache hit/miss rate
- Offline usage statistics
- Install abandonment (prompt dismissed)
- Time to interactive (should improve with caching)

## Resources

- [Chrome PWA Testing](https://web.dev/pwa-checklist/)
- [Lighthouse PWA Audits](https://web.dev/lighthouse-pwa/)
- [PWA Testing Tools](https://www.pwabuilder.com/)
- [Can I Use - PWA](https://caniuse.com/serviceworkers)

## Quick Validation Checklist

✅ All files created:
- manifest.json
- sw.js
- icon files
- PWA components

✅ Integration complete:
- Meta tags in index.html
- SW registration in main.tsx
- Components in App.tsx

✅ Testing verified:
- Manifest loads correctly
- Service worker registers
- Icons accessible
- Install prompt works
- Offline indicator works
- Cache strategy functions

✅ Ready for production (after):
- Replacing placeholder icons
- Testing on real devices
- HTTPS deployment
- Lighthouse audit passing
