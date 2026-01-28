# Clerk Dashboard - Adding Production Domain Guide

## Where to Look:

### Option 1: Domains Section
1. **Left Sidebar** → Look for "**Domains**"
2. Click on "Domains"
3. Add your domain: `theplug-music.vercel.app`

### Option 2: Development/Production Toggle
1. **Top of Dashboard** → Find "**Development**" button/dropdown
2. Click → Select "**Create production instance**"
3. Enter domain: `theplug-music.vercel.app`
4. This will redirect you to the Domains section

### Option 3: If Domains is Hidden
Sometimes "Domains" might be under:
- **Settings** → Domains
- **Configuration** → Domains
- **Deployments** → Domains
- **Instance Settings** → Domains

## What You'll Need to Configure:

1. **Primary Domain**: `theplug-music.vercel.app`
2. **DNS Records**: Clerk will show you what records to add (if using custom domain)
3. **For Vercel domains**: Usually no DNS config needed

## After Adding Domain:

1. The 500 error should be resolved
2. Authentication will work on production
3. You might need to wait a few minutes for propagation

## Can't Find It?

If you still can't find the Domains section:
1. Try using the search function in Clerk Dashboard
2. Look for a "?" help icon that might have documentation
3. The UI might have changed - look for any section related to:
   - Production setup
   - Deployment
   - Environment configuration
   - Instance settings