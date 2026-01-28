# Confetti Celebrations Feature

**Added**: October 26, 2025
**Purpose**: Enhance user delight with visual celebrations for key achievements

## 🎉 Overview

FizzCard now includes confetti celebrations to make earning rewards and completing actions more delightful. Using the `canvas-confetti` library, we trigger celebratory animations at key moments in the user journey.

## 🎨 Celebration Types

### 1. Claim Rewards (`celebrateClaim`)
**When**: User successfully claims pending FizzCoin rewards from blockchain
**Animation**: Large burst from center with gold, cyan, and purple confetti
**Duration**: 3-4 seconds
**Location**: `useCryptoWallet` hook - claim success

```typescript
// Triggered automatically when user claims rewards
celebrateClaim();
toast.success(`Claimed ${amount} FIZZ! 🎉`);
```

### 2. New Connection (`celebrateConnection`)
**When**: User accepts a connection request
**Animation**: Moderate burst with cyan, purple, and white confetti
**Duration**: ~2 seconds
**Location**: `ConnectionRequestsPage` - accept success

```typescript
// Triggered when connection is accepted
celebrateConnection();
if (fizzcoinsEarned > 0) {
  setTimeout(() => celebrateReward(), 500);
}
```

### 3. Reward Earned (`celebrateReward`)
**When**: User earns FizzCoins (appears 500ms after connection celebration)
**Animation**: Continuous burst from sides with gold/cyan/purple confetti
**Duration**: 3 seconds
**Location**: `ConnectionRequestsPage` - accept success (delayed)

```typescript
// Triggered 500ms after connection for reward earning
setTimeout(() => celebrateReward(), 500);
```

### 4. Wallet Connected (`celebrateSuccess`)
**When**: User successfully creates/connects blockchain wallet
**Animation**: Quick burst from center
**Duration**: ~1 second
**Location**: `useCryptoWallet` hook - wallet creation success

```typescript
// Triggered when crypto wallet is created
celebrateSuccess();
toast.success('Crypto wallet connected!');
```

### 5. Introduction Created (`celebrateSuccess`)
**When**: User creates an introduction between two connections
**Animation**: Quick burst from center
**Duration**: ~1 second
**Location**: `CreateIntroductionPage` - introduction creation success

```typescript
// Triggered when introduction is created
celebrateSuccess();
toast.success('Introduction created!');
```

### 6. Achievement Unlocked (`celebrateAchievement`)
**When**: User unlocks a badge or achievement (future implementation)
**Animation**: Stars and sparkles from sides for 5 seconds
**Duration**: 5 seconds
**Location**: Not yet implemented (ready for badge system)

```typescript
// To be used when implementing badge achievements
celebrateAchievement();
toast.success('Badge unlocked: Super Connector!');
```

### 7. Emoji Confetti (`celebrateWithEmoji`)
**When**: Special events (e.g., first connection, milestone achievements)
**Animation**: Custom emoji particles
**Duration**: Customizable
**Location**: Available for future use

```typescript
// Example: Celebrate first connection
celebrateWithEmoji('🎉', 100);
```

## 📁 File Structure

```
client/src/
├── lib/
│   └── confetti.ts              # All confetti celebration functions
├── hooks/
│   └── useCryptoWallet.ts       # Wallet & claim celebrations
└── pages/
    ├── ConnectionRequestsPage.tsx    # Connection & reward celebrations
    ├── CreateIntroductionPage.tsx    # Introduction success
    └── WalletPage.tsx                # (UI only, logic in hook)
```

## 🔧 Implementation Details

### Dependencies
```json
{
  "canvas-confetti": "^1.9.3",
  "@types/canvas-confetti": "^1.6.4"
}
```

### Configuration

Each celebration type has specific parameters:

**celebrateClaim** - Major success (rewards claimed):
- Particle count: 200 total
- Colors: Gold (#FFD700), Cyan (#00D9FF), Purple (#B744FF)
- Pattern: Multiple bursts with varying spread
- Origin: Center-bottom (y: 0.7)

**celebrateConnection** - Medium success (connection made):
- Particle count: 100
- Colors: Cyan, Purple, White
- Spread: 70 degrees
- Origin: Center-middle (y: 0.6)

**celebrateReward** - Extended celebration (earning coins):
- Particle count: 50 per interval (250ms intervals)
- Colors: Gold, Cyan, Purple
- Duration: 3000ms
- Pattern: Continuous from both sides

**celebrateSuccess** - Quick success (general achievements):
- Particle count: 50
- Colors: Cyan, Purple
- Spread: 45 degrees
- Origin: Center-middle (y: 0.6)

## 🎯 Usage Guidelines

### When to Use Confetti

✅ **Do use confetti for**:
- Claiming blockchain rewards
- Accepting connections (especially first connection)
- Creating introductions
- Wallet creation
- Unlocking achievements/badges
- Major milestones (10th connection, 100 FIZZ earned)

❌ **Don't use confetti for**:
- Loading states
- Navigation between pages
- Failed actions
- Minor UI interactions
- Every single reward earn (would be excessive)

### Combining Celebrations

For compound actions (e.g., accepting connection + earning reward), use both celebrations with a delay:

```typescript
// First: connection celebration
celebrateConnection();

// Then: reward celebration (delayed)
if (fizzcoinsEarned > 0) {
  setTimeout(() => celebrateReward(), 500);
}
```

### Performance Considerations

- Confetti animations use requestAnimationFrame (efficient)
- Automatically cleanup after duration completes
- Z-index: 9999 (appears above all UI elements)
- No impact on scrolling or UI interactions
- Mobile-friendly (works on all devices)

## 🧪 Testing

### Manual Testing Checklist

1. **Claim Rewards**:
   - Navigate to `/wallet`
   - Click "Claim Rewards" (if pending > 0)
   - Verify: Large confetti burst from center
   - Verify: Toast notification appears
   - Verify: Balance updates after animation

2. **Accept Connection**:
   - Navigate to `/connections/requests`
   - Click "Accept" on a pending request
   - Verify: Initial connection confetti (cyan/purple)
   - Verify: Secondary reward confetti after 500ms (gold/cyan/purple)
   - Verify: Toast shows "+25 FizzCoins earned!"

3. **Create Wallet**:
   - Navigate to `/wallet` (without wallet)
   - Click "Connect Wallet"
   - Verify: Success confetti after wallet created
   - Verify: Toast shows "Crypto wallet connected!"

4. **Create Introduction**:
   - Navigate to `/introductions/create`
   - Select two people and submit
   - Verify: Success confetti burst
   - Verify: Redirect to introductions list

### Automated Testing (Future)

```typescript
// Example E2E test
test('confetti appears on reward claim', async () => {
  // Mock confetti library
  const celebrateSpy = vi.spyOn(confetti, 'celebrateClaim');

  // Perform claim action
  await claimRewards();

  // Verify confetti was triggered
  expect(celebrateSpy).toHaveBeenCalled();
});
```

## 🎨 Customization

### Changing Colors

Edit `client/src/lib/confetti.ts`:

```typescript
// Current FizzCard colors
colors: ['#FFD700', '#00D9FF', '#B744FF']

// To change (e.g., for special events):
colors: ['#FF6B6B', '#4ECDC4', '#45B7D1']
```

### Adjusting Duration

```typescript
// Current: 3 second celebration
const duration = 3000;

// Longer celebration:
const duration = 5000;

// Shorter celebration:
const duration = 1500;
```

### Creating Custom Celebrations

```typescript
export function celebrateCustomEvent() {
  confetti({
    particleCount: 150,
    angle: 90,
    spread: 60,
    origin: { y: 0.5 },
    colors: ['#YOUR_COLOR_1', '#YOUR_COLOR_2'],
    zIndex: 9999
  });
}
```

## 🐛 Troubleshooting

### Confetti Not Appearing

1. **Check z-index**: Ensure no elements have z-index > 9999
2. **Check canvas**: Confetti library creates a `<canvas>` element - verify it's in DOM
3. **Check console**: Look for confetti library errors
4. **Check imports**: Verify `import { celebrate... } from '@/lib/confetti'`

### Performance Issues

1. **Reduce particle count**: Lower `particleCount` values
2. **Shorten duration**: Reduce animation duration
3. **Disable on mobile**: Add device detection

```typescript
import { isMobile } from '@/lib/utils';

if (!isMobile()) {
  celebrateReward();
}
```

### Confetti Behind Elements

1. **Increase z-index**: Change `zIndex: 9999` to higher value
2. **Check parent stacking context**: Ensure no parent has `position: relative` with high z-index

## 📊 Analytics (Future)

Track confetti celebrations for user engagement metrics:

```typescript
// Example analytics tracking
celebrateClaim();
trackEvent('confetti_celebration', {
  type: 'claim_rewards',
  amount: data.amount,
  timestamp: new Date().toISOString()
});
```

## 🚀 Future Enhancements

1. **Sound Effects**: Add optional sound for celebrations
2. **Haptic Feedback**: Vibration on mobile devices
3. **Custom Shapes**: Use FizzCoin logo as confetti shape
4. **Fireworks Mode**: Extreme celebration for major milestones
5. **User Preference**: Toggle confetti on/off in settings
6. **Accessibility**: Respect `prefers-reduced-motion` setting

### Reduced Motion Support (Recommended)

```typescript
// Check user's motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  celebrateReward();
}
```

## 📝 Change Log

### v1.0.0 (October 26, 2025)
- ✅ Initial implementation
- ✅ Added 5 celebration types
- ✅ Integrated into wallet claims
- ✅ Integrated into connection acceptance
- ✅ Integrated into wallet creation
- ✅ Integrated into introduction creation
- ✅ Documentation completed

### Future Versions
- ⏳ Add sound effects
- ⏳ Add reduced motion support
- ⏳ Add badge achievement celebrations
- ⏳ Add milestone celebrations (10th, 50th, 100th connection)
- ⏳ Add user preference toggle

## 🎯 Success Metrics

Track these metrics to measure impact:

1. **User Engagement**:
   - % of users who claim rewards (before/after confetti)
   - Time spent on wallet page
   - Connection acceptance rate

2. **User Feedback**:
   - Survey: "How do you feel about the reward animations?"
   - Support tickets related to animations (positive or negative)

3. **Performance**:
   - Page load time (should not increase)
   - Animation frame rate (should be 60fps)
   - Bundle size increase (<50KB acceptable)

## 📚 Resources

- [canvas-confetti Documentation](https://www.npmjs.com/package/canvas-confetti)
- [Web Animation Best Practices](https://web.dev/animations/)
- [Designing Delightful Microinteractions](https://uxdesign.cc/microinteractions-the-secret-to-great-app-design-4cfe70fbaccf)

---

**Maintained by**: FizzCard Development Team
**Last Updated**: October 26, 2025
**Version**: 1.0.0
