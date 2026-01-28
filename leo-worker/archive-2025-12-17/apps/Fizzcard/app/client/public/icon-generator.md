# PWA Icon Generation

Use this guide to generate all required icon sizes for the FizzCard PWA.

## Required Icon Sizes

- **192x192** - Minimum size for PWA (Android home screen)
- **512x512** - High-resolution icon (splash screens, app stores)
- **96x96** - Shortcut icons (scan, card)

## Option 1: Using ImageMagick (CLI)

Install ImageMagick:
```bash
# macOS
brew install imagemagick

# Linux
apt-get install imagemagick

# Windows
choco install imagemagick
```

Generate icons from a source image:
```bash
# Main PWA icons
convert source-icon.png -resize 192x192 icon-192.png
convert source-icon.png -resize 512x512 icon-512.png

# Shortcut icons
convert source-icon-scan.png -resize 96x96 icon-scan.png
convert source-icon-card.png -resize 96x96 icon-card.png

# Optional: iOS splash screen
convert source-icon.png -resize 1125x2436 splash-1125x2436.png
```

## Option 2: Using Online Tools

### PWABuilder Image Generator
- URL: https://www.pwabuilder.com/imageGenerator
- Upload your source image
- Automatically generates all required sizes
- Includes iOS and Android assets

### RealFaviconGenerator
- URL: https://realfavicongenerator.net/
- Comprehensive favicon and PWA icon generator
- Generates manifest.json with icons
- Includes preview for all platforms

### Favicon.io
- URL: https://favicon.io/
- Simple PWA icon generator
- Create from text, image, or emoji
- Free and fast

## Design Guidelines

### FizzCard Brand Colors
- Primary: `#00D9FF` (Cyan)
- Accent: `#8B5CF6` (Purple)
- Background: `#0A0A0F` (Dark)

### Icon Design Tips
1. **Simple and recognizable** - Icon should be clear at small sizes
2. **High contrast** - Use bright colors against dark background
3. **Centered design** - Leave padding around edges (safe zone)
4. **Maskable** - Design should work with different shapes (circle, squircle, square)
5. **No text** - Avoid small text, use symbols/logos instead

### Recommended Approach
For FizzCard, create an icon with:
- Gradient background (cyan to purple)
- Simple "F" or lightning bolt symbol in white
- Rounded corners for better appearance

## Testing Icons

After generating icons, test them:

1. **Chrome DevTools**
   - Open DevTools → Application → Manifest
   - Check if icons display correctly

2. **Mobile Device**
   - Install PWA on phone
   - Check home screen icon appearance

3. **Different Platforms**
   - Test on Android (Chrome)
   - Test on iOS (Safari)
   - Test on desktop (Chrome, Edge)

## Placeholder Icons (Current)

The current icons are placeholders. To create production icons:

1. Design a source icon (1024x1024 recommended)
2. Use one of the tools above to generate all sizes
3. Replace placeholder files in `/client/public/`
4. Update manifest.json if needed

## Icon Checklist

- [ ] Create source icon design (1024x1024)
- [ ] Generate icon-192.png
- [ ] Generate icon-512.png
- [ ] Generate icon-scan.png (QR code theme)
- [ ] Generate icon-card.png (card theme)
- [ ] Optional: Generate iOS splash screens
- [ ] Test icons on mobile device
- [ ] Verify manifest.json references

## Resources

- [PWA Icon Guidelines](https://web.dev/add-manifest/#icons)
- [Maskable Icon Spec](https://web.dev/maskable-icon/)
- [Icon Best Practices](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Structural_overview)
