# Social Sharing Feature

## Overview

The Social Sharing feature enables users to easily share their FizzCard digital business card across multiple platforms, increasing network reach and driving viral growth. Users can share via social media, messaging apps, email, or simply copy the link to share anywhere.

## Features

### Share Destinations

**4 Major Social/Messaging Platforms**:
1. **Twitter**: Share with pre-populated tweet text
2. **LinkedIn**: Professional network sharing
3. **WhatsApp**: Direct mobile sharing with formatted message
4. **Email**: mailto link with subject and body

**Universal Sharing**:
5. **Native Share API**: System share dialog (mobile-optimized)
6. **Copy Link**: One-click clipboard copy with toast confirmation

### Visual Design

**Full Mode** (MyFizzCardPage):
- Card heading: "Share Your FizzCard"
- Subtitle: "Share your digital business card with your network"
- 2x2 grid layout for platform buttons
- Native share + Copy link buttons below grid
- Share URL preview in code block

**Compact Mode** (for widgets/dashboards):
- Horizontal layout with Share and Copy Link buttons only
- Minimal spacing, no headings

### Share Content

**Pre-populated Messages**:
- **Twitter**: `"Check out {Name}'s FizzCard - {Title} on @FizzCard_App 🎯"`
- **WhatsApp/Email**: `"Check out {Name}'s FizzCard - {Title}\n{URL}"`
- **Native Share**: Title, text, and URL passed to system dialog

**Share URL Format**:
```
{window.location.origin}/card/{fizzCardId}
```

Example: `https://fizzcard.app/card/62`

## Component Architecture

### SocialShareButtons Component

**Location**: `client/src/components/share/SocialShareButtons.tsx`

**Props**:
```typescript
interface SocialShareButtonsProps {
  fizzCardId: string;
  userName: string;
  userTitle?: string;
  compact?: boolean; // Default: false
}
```

**Key Functions**:

1. **handleTwitterShare()**
   - Opens Twitter intent URL in popup window
   - Window size: 550x420
   - Pre-fills tweet with text + URL

2. **handleLinkedInShare()**
   - Opens LinkedIn share-offsite URL
   - Window size: 550x420
   - LinkedIn auto-extracts Open Graph data

3. **handleWhatsAppShare()**
   - Opens WhatsApp web share URL
   - Combines text + URL in message
   - Works on mobile and desktop

4. **handleEmailShare()**
   - Creates mailto: URL with subject + body
   - Formatted professional email template
   - Opens user's default email client

5. **handleNativeShare()**
   - Uses Web Share API (if available)
   - Shows system share dialog
   - Fallback to Copy Link on unsupported browsers
   - Handles user cancellation gracefully

6. **handleCopyLink()**
   - Copies share URL to clipboard
   - Shows toast notification: "Link copied to clipboard!" with 🔗 icon
   - Error handling for clipboard failures

### MetaTags Component

**Location**: `client/src/components/seo/MetaTags.tsx`

**Purpose**: Dynamically update page meta tags for better social previews

**Props**:
```typescript
interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'profile';
}
```

**Updates**:
- Document title
- Meta description
- Open Graph tags (og:title, og:description, og:image, og:type, og:url)
- Twitter Card tags (twitter:title, twitter:description, twitter:image)

**Usage Pattern**:
```typescript
<MetaTags
  title={`${userName}'s FizzCard - Digital Business Card`}
  description={bio || `Connect with ${userName} on FizzCard`}
  image={avatarUrl}
  url={fizzCardUrl}
  type="profile"
/>
```

## Integration

### MyFizzCardPage Integration

**Import Statements**:
```typescript
import { SocialShareButtons } from '@/components/share/SocialShareButtons';
import { MetaTags } from '@/components/seo/MetaTags';
```

**MetaTags Usage** (top of component):
```typescript
{primaryCard && (
  <MetaTags
    title={`${primaryCard.displayName || 'My'} FizzCard - Digital Business Card`}
    description={primaryCard.bio || `Connect with ${primaryCard.displayName} on FizzCard. ${primaryCard.title ? primaryCard.title : ''}`}
    image={primaryCard.avatarUrl || undefined}
    url={fizzCardUrl}
    type="profile"
  />
)}
```

**SocialShareButtons Placement**:
```typescript
{/* Social Share Section */}
{primaryCard && (
  <GlassCard className="p-8 mb-8">
    <SocialShareButtons
      fizzCardId={String(primaryCard.id)}
      userName={primaryCard.displayName || 'FizzCard User'}
      userTitle={primaryCard.title || undefined}
    />
  </GlassCard>
)}
```

**Placement Strategy**:
- After ProfileCompletionIndicator
- Before Profile edit section
- Encourages sharing after seeing completion status

## Open Graph Implementation

### Static Meta Tags (index.html)

**Location**: `client/index.html`

**Default Tags**:
```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://fizzcard.app/" />
<meta property="og:title" content="FizzCard - Smart Contact Sharing with Crypto Rewards" />
<meta property="og:description" content="Connect, share, and earn FizzCoins with every networking interaction. The future of digital business cards powered by blockchain." />
<meta property="og:image" content="https://fizzcard.app/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://fizzcard.app/" />
<meta name="twitter:title" content="FizzCard - Smart Contact Sharing with Crypto Rewards" />
<meta name="twitter:description" content="Connect, share, and earn FizzCoins with every networking interaction. The future of digital business cards powered by blockchain." />
<meta name="twitter:image" content="https://fizzcard.app/og-image.png" />
<meta name="twitter:creator" content="@FizzCard_App" />
```

### Dynamic Meta Tags (Per-Card)

**Mechanism**: MetaTags component dynamically updates meta tags based on FizzCard data

**Implementation**:
```typescript
useEffect(() => {
  // Update document title
  document.title = title;

  // Update meta tags
  updateMetaTag('name', 'description', description);
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:image', image);
  // ... more tags
}, [title, description, image, url, type]);
```

**Result**: When shared, each FizzCard shows personalized preview with user's name, title, bio, and avatar.

## User Flows

### Desktop Sharing Flow
1. User opens My FizzCard page
2. User scrolls to "Share Your FizzCard" section
3. User clicks desired platform (e.g., Twitter)
4. New popup window opens with pre-filled content
5. User confirms/edits message and shares
6. Popup closes automatically
7. FizzCard link is now shared on platform

### Mobile Sharing Flow
1. User opens My FizzCard page on mobile
2. User scrolls to share section
3. User taps "Share..." button (native share API)
4. System share dialog appears with FizzCard link
5. User selects app (WhatsApp, Messages, Email, etc.)
6. User sends the link
7. Toast confirmation: "Shared successfully!" ✨

### Copy Link Flow
1. User clicks "Copy Link" button
2. URL copied to clipboard via `navigator.clipboard.writeText()`
3. Toast notification appears: "Link copied to clipboard!" 🔗
4. User can paste link anywhere (Slack, Discord, SMS, etc.)

### Fallback Flow (No Native Share)
1. User clicks "Share..." on unsupported browser
2. Component detects no `navigator.share` support
3. Automatically falls back to Copy Link function
4. Toast notification: "Link copied to clipboard!"
5. User can manually paste link into platform of choice

## Technical Implementation

### Share URL Construction

**Base URL Detection**:
```typescript
const shareUrl = `${window.location.origin}/card/${fizzCardId}`;
```

**Example URLs**:
- Development: `http://localhost:5014/card/62`
- Production: `https://fizzcard.app/card/62`

### Platform-Specific URL Encoding

**Twitter**:
```typescript
const text = `${defaultShareText} on @FizzCard_App 🎯`;
const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
window.open(twitterUrl, '_blank', 'width=550,height=420');
```

**LinkedIn**:
```typescript
const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
window.open(linkedInUrl, '_blank', 'width=550,height=420');
```

**WhatsApp**:
```typescript
const text = `${defaultShareText}\n${shareUrl}`;
const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
window.open(whatsAppUrl, '_blank');
```

**Email**:
```typescript
const subject = `Check out my FizzCard - ${userName}`;
const body = `Hi!\n\nI'd like to share my digital business card with you:\n\n${defaultShareText}\n${shareUrl}\n\nFizzCard is a modern networking platform that combines digital business cards with blockchain rewards.\n\nBest regards,\n${userName}`;
const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
window.location.href = mailtoUrl;
```

### Native Share API Detection

**Browser Compatibility Check**:
```typescript
const hasNativeShare =
  typeof navigator !== 'undefined' &&
  'share' in navigator &&
  typeof navigator.share === 'function';
```

**Conditional Rendering**:
```typescript
{hasNativeShare && (
  <Button onClick={handleNativeShare} variant="primary">
    <Share2 className="h-4 w-4" />
    Share...
  </Button>
)}
```

**Error Handling**:
```typescript
try {
  await navigator.share({ title, text, url });
  toast.success('Shared successfully!', { icon: '✨' });
} catch (error) {
  // User cancelled (AbortError) - don't show error
  if ((error as Error).name !== 'AbortError') {
    toast.error('Failed to share');
  }
}
```

### Clipboard API

**Copy Implementation**:
```typescript
try {
  await navigator.clipboard.writeText(shareUrl);
  toast.success('Link copied to clipboard!', {
    icon: '🔗',
    duration: 3000,
  });
} catch (error) {
  toast.error('Failed to copy link');
}
```

**Browser Support**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Styling

### Button Variants

**Primary** (gradient):
- Used for: Native "Share..." button
- Gradient: `from-primary-500 to-accent-500`
- Shadow: Cyan glow effect

**Secondary** (bordered):
- Used for: Platform buttons (Twitter, LinkedIn, WhatsApp, Email, Copy Link)
- Border: `border-2 border-primary-500`
- Hover: Platform-specific color highlights

### Platform-Specific Hover Colors

```typescript
// Twitter
className="hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]"

// LinkedIn
className="hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"

// WhatsApp
className="hover:bg-[#25D366]/10 hover:text-[#25D366]"

// Email
className="hover:bg-primary/10 hover:text-primary"
```

### Icons

**Lucide React Icons**:
- `<Share2>` - Share icon
- `<Twitter>` - Twitter bird icon
- `<Linkedin>` - LinkedIn icon
- `<Send>` - WhatsApp icon
- `<Mail>` - Email icon
- `<Link>` - Copy link icon

### Layout

**Full Mode Grid**:
```typescript
<div className="grid grid-cols-2 gap-3">
  {/* 4 platform buttons in 2x2 grid */}
</div>

<div className="flex gap-3">
  {/* Native share + Copy link buttons */}
</div>
```

**Share URL Preview**:
```typescript
<div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
  <p className="text-xs text-muted-foreground mb-1">Your share link:</p>
  <code className="text-xs text-foreground break-all">{shareUrl}</code>
</div>
```

## Testing

### Manual Testing Checklist

- [ ] **Twitter Share**
  - Click Twitter button
  - Verify popup opens (550x420)
  - Verify pre-filled text: "Check out {Name}'s FizzCard - {Title} on @FizzCard_App 🎯"
  - Verify FizzCard URL is included
  - Verify can edit message before posting
  - Verify share completes successfully

- [ ] **LinkedIn Share**
  - Click LinkedIn button
  - Verify popup opens
  - Verify LinkedIn loads share dialog
  - Verify Open Graph preview appears (if meta tags configured)
  - Verify share completes successfully

- [ ] **WhatsApp Share**
  - Click WhatsApp button
  - Verify WhatsApp Web opens (desktop) or app opens (mobile)
  - Verify pre-filled message: "{Name}'s FizzCard - {Title}\n{URL}"
  - Verify can select contact/group
  - Verify send works

- [ ] **Email Share**
  - Click Email button
  - Verify default email client opens
  - Verify subject: "Check out my FizzCard - {Name}"
  - Verify body contains formatted message with URL
  - Verify can edit before sending

- [ ] **Native Share (Mobile)**
  - On mobile device, click "Share..." button
  - Verify system share dialog appears
  - Verify multiple app options available
  - Verify can share to Messages, Email, social apps
  - Verify "Shared successfully!" toast appears

- [ ] **Copy Link**
  - Click "Copy Link" button
  - Verify toast appears: "Link copied to clipboard!" with 🔗 icon
  - Paste into text field
  - Verify correct URL pasted
  - Verify URL format: `{origin}/card/{id}`

- [ ] **Fallback (Desktop without Native Share)**
  - On desktop browser (no Web Share API)
  - Verify "Share..." button does not appear
  - Verify "Copy Link" button is full width
  - Click Copy Link
  - Verify toast and clipboard functionality work

- [ ] **Responsive Design**
  - Test on mobile (< 640px)
  - Verify grid stacks to single column if needed
  - Verify buttons are tappable (min 44x44px)
  - Test on tablet (640-1024px)
  - Test on desktop (> 1024px)

- [ ] **Error Handling**
  - Block clipboard API in browser
  - Verify error toast appears
  - Cancel native share dialog
  - Verify no error toast (AbortError ignored)

### Open Graph Validation

**Facebook Debugger**:
1. Visit: https://developers.facebook.com/tools/debug/
2. Enter share URL: `https://fizzcard.app/card/{id}`
3. Click "Debug"
4. Verify og:title shows user's name
5. Verify og:description shows bio or default
6. Verify og:image shows user's avatar (if uploaded)

**Twitter Card Validator**:
1. Visit: https://cards-dev.twitter.com/validator
2. Enter share URL
3. Verify card type: summary_large_image
4. Verify title, description, image render correctly

**LinkedIn Post Inspector**:
1. Visit: https://www.linkedin.com/post-inspector/
2. Enter share URL
3. Verify preview renders correctly
4. Verify image aspect ratio (1.91:1 recommended)

### Automated Testing

**Test File**: `client/src/components/share/__tests__/SocialShareButtons.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SocialShareButtons } from '../SocialShareButtons';

describe('SocialShareButtons', () => {
  const mockProps = {
    fizzCardId: '123',
    userName: 'Test User',
    userTitle: 'Software Engineer',
  };

  it('renders all share buttons in full mode', () => {
    render(<SocialShareButtons {...mockProps} />);
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  it('renders compact mode correctly', () => {
    render(<SocialShareButtons {...mockProps} compact />);
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
  });

  it('displays correct share URL', () => {
    render(<SocialShareButtons {...mockProps} />);
    const urlElement = screen.getByText(/\/card\/123/);
    expect(urlElement).toBeInTheDocument();
  });

  it('handles copy link click', async () => {
    const mockWriteText = jest.fn();
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    render(<SocialShareButtons {...mockProps} />);
    fireEvent.click(screen.getByText('Copy Link'));

    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('/card/123')
    );
  });

  it('opens Twitter window with correct URL', () => {
    const mockOpen = jest.fn();
    window.open = mockOpen;

    render(<SocialShareButtons {...mockProps} />);
    fireEvent.click(screen.getByText('Twitter'));

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'width=550,height=420'
    );
  });
});
```

## Performance Considerations

### Bundle Size
- SocialShareButtons: ~5KB (minified)
- MetaTags: ~2KB (minified)
- lucide-react icons: Already included in bundle
- **Total impact**: ~7KB (< 0.5% increase)

### Network Requests
- **No additional API calls** for social sharing
- All functionality is client-side
- Share URL constructed from existing data

### Render Performance
- MetaTags uses `useEffect` for DOM updates
- Updates only when props change
- No unnecessary re-renders
- Browser-native clipboard/share APIs (fast)

## Analytics Tracking

### Events to Track

**Implement after launch**:

```typescript
// Share button clicked
analytics.track('share_button_clicked', {
  platform: 'twitter' | 'linkedin' | 'whatsapp' | 'email' | 'native' | 'copy',
  fizzcard_id: fizzCardId,
  user_id: userId,
  source_page: 'my-fizzcard',
});

// Share completed (for native share API)
analytics.track('share_completed', {
  platform: 'native',
  fizzcard_id: fizzCardId,
  user_id: userId,
});

// Share failed
analytics.track('share_failed', {
  platform: platform,
  error_type: 'clipboard_denied' | 'share_cancelled',
  fizzcard_id: fizzCardId,
});

// Link copied successfully
analytics.track('link_copied', {
  fizzcard_id: fizzCardId,
  user_id: userId,
  source: 'share_section',
});
```

### Metrics to Monitor

1. **Share Button CTR**:
   - % of users who click any share button
   - Target: >40% of users share their FizzCard

2. **Platform Preference**:
   - Which platforms are used most
   - Hypothesis: WhatsApp > Copy Link > Twitter > LinkedIn > Email

3. **Viral Coefficient**:
   - # of new signups per shared link
   - Target: 0.3+ (viral growth threshold)

4. **Share-to-Connection Ratio**:
   - % of shares that result in new connections
   - Target: >15%

## Future Enhancements

### Phase 1 (Current) ✅
- [x] Twitter, LinkedIn, WhatsApp, Email sharing
- [x] Native Share API support
- [x] Copy link with toast notification
- [x] Open Graph meta tags
- [x] Dynamic meta tags per FizzCard
- [x] Share URL preview
- [x] Platform-specific hover colors

### Phase 2 (Next Sprint)
- [ ] **QR Code Sharing**: Generate QR code for FizzCard link
- [ ] **Share Analytics**: Track shares per platform
- [ ] **Share Incentives**: Reward 10 FizzCoins for first share
- [ ] **Referral Tracking**: Track signups from shared links
- [ ] **Share Templates**: Custom messages per industry

### Phase 3 (Future)
- [ ] **Social Proof**: "1,234 people shared their FizzCard today"
- [ ] **Leaderboard**: Top sharers of the week
- [ ] **Share Challenges**: "Share 5 times this week, earn bonus"
- [ ] **Share History**: See who you've shared with and when
- [ ] **A/B Testing**: Test different share messages

### Phase 4 (Advanced)
- [ ] **Deep Linking**: Open FizzCard in mobile app
- [ ] **SMS Sharing**: Direct SMS with link
- [ ] **Slack Integration**: Share to Slack channels/DMs
- [ ] **Instagram Stories**: Share card as story image
- [ ] **Dynamic OG Images**: Generate personalized card images

## Troubleshooting

### Issue: Copy Link doesn't work

**Possible Causes**:
1. Clipboard API not supported (old browser)
2. HTTPS required (clipboard API restricted on HTTP)
3. User denied clipboard permission

**Solution**:
```typescript
// Check if clipboard API available
if (!navigator.clipboard) {
  // Fallback: Create temp textarea and copy
  const textarea = document.createElement('textarea');
  textarea.value = shareUrl;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
```

### Issue: Native Share button doesn't appear on desktop

**Expected Behavior**: Native Share API primarily available on mobile

**Solution**: This is correct - desktop browsers (except Safari 12.1+) don't support Web Share API. The button correctly hides on unsupported browsers.

### Issue: LinkedIn share doesn't show preview

**Possible Causes**:
1. Open Graph tags not configured
2. LinkedIn cache hasn't refreshed
3. Image URL not accessible

**Solution**:
1. Verify meta tags with LinkedIn Post Inspector
2. Click "Inspect" to refresh LinkedIn's cache
3. Ensure og:image URL is publicly accessible (HTTPS)

### Issue: Twitter share truncates message

**Possible Causes**:
1. Combined text + URL exceeds 280 characters
2. URL counted as 23 characters (Twitter's t.co shortener)

**Solution**:
```typescript
// Keep message under ~250 characters to be safe
const maxLength = 250;
const message = shareText.length > maxLength
  ? shareText.substring(0, maxLength - 3) + '...'
  : shareText;
```

### Issue: WhatsApp opens in browser instead of app

**Expected Behavior**: WhatsApp Web is default on desktop

**Solution**: This is correct. On mobile, `wa.me` URLs automatically open the WhatsApp app.

## Related Features

- **[Profile Completion](./PROFILE_COMPLETION.md)**: Encourages users to complete profiles before sharing
- **[Confetti Celebrations](./CONFETTI_CELEBRATIONS.md)**: Could celebrate first share
- **[QR Code Display](../client/src/components/fizzcard/QRCodeDisplay.tsx)**: Alternative sharing method
- **[FizzCoin Rewards](./BLOCKCHAIN_INTEGRATION.md)**: Potential reward for sharing

---

**Document Version**: 1.0
**Last Updated**: October 25, 2025
**Feature Status**: ✅ Complete and Deployed
**Next Review**: After collecting 7 days of analytics data
