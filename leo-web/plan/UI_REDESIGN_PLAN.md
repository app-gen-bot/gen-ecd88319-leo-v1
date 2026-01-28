# Leo UI/UX Redesign Plan

## Executive Summary

This document outlines a comprehensive UI/UX redesign for the Leo App Generator platform. The goal is to transform the interface from a functional developer tool into a **memorable, production-grade experience** that users will love.

---

## Current State Analysis

### What's Working ✅
1. **Cosmic Aurora Theme** - The purple/cyan gradient theme is visually interesting
2. **Space Grotesk + DM Sans fonts** - Good typography pairing
3. **Basic component structure** - Solid foundation with shadcn/ui components
4. **Glow effects** - Atmospheric depth with shadow-glow utilities

### Pain Points & UX Issues ❌

#### ConsolePage (Main Work Area)
1. **Preview panel always visible** - Shows empty state when no screenshots; wastes space
2. **Cluttered form area** - Too many controls crammed into small space
3. **Small touch targets** - Buttons under 44px violate mobile usability
4. **Missing loading states** - No skeleton loaders during transitions
5. **Overwhelming complexity** - New/Resume toggle, Mode toggle, iterations slider all competing for attention
6. **Form feels cramped** - Textarea with buttons overlapping feels cluttered
7. **No visual hierarchy** - Everything has same visual weight

#### HomePage
1. **Generic hero section** - Looks like typical SaaS landing page
2. **Feature cards lack personality** - Standard three-column grid
3. **Missing social proof** - No real user testimonials or stats

#### General Issues
1. **Not using OKLCH colors** - Still on HSL (per skill guidance, should migrate)
2. **Inconsistent spacing** - Mix of arbitrary and token values
3. **Missing empty/error states** - Some components lack proper state handling
4. **Mobile responsiveness gaps** - Some elements don't adapt well to 375px

---

## Design Philosophy

### Aesthetic Direction: **"Technical Elegance"**

Leo is a developer tool that generates production apps. The UI should feel:
- **Powerful yet approachable** - Complex capabilities, simple interface
- **Dark & atmospheric** - Like a command center for building apps
- **Confident & refined** - Premium feel, not cluttered or overwhelming
- **Alive & responsive** - Smooth animations, real-time feedback

### Key Principles

1. **Progressive Disclosure** - Show only what's needed, reveal complexity on demand
2. **Spatial Breathing Room** - Generous padding, clear visual hierarchy
3. **Focus on the Task** - The prompt input should dominate, everything else supports it
4. **Contextual Preview** - Preview panel appears only when there's content to show
5. **Delightful Details** - Micro-interactions that spark joy

---

## Redesign Specifications

### 1. ConsolePage Transformation

#### A. Layout Changes

**Current**: Fixed 50/50 split (console left, preview right)

**New**: Adaptive layout with three modes:
1. **Input Mode** (no generation running)
   - Full-width prompt input centered
   - Clean, focused interface
   - No preview panel visible

2. **Generation Mode** (running)
   - Console panel (60%) + Preview panel (40%)
   - Preview auto-shows when first screenshot arrives
   - Smooth slide-in animation for preview

3. **Review Mode** (complete)
   - Resizable split view
   - Full preview controls visible

#### B. Input Form Redesign

**Current Issues**:
- Toggle buttons crowded at top
- Settings inline with prompt
- Attached files in separate area
- Multiple rows of small controls

**New Design**:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Console Header                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      Terminal Output                            │
│                    (or welcome state)                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  What would you like to build?                          │  │
│  │  │                                                       │  │
│  │                                                          │  │
│  │                                                          │  │
│  │  [📎] [🎤]                                    [Settings⚙]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [New App ○]  [Resume ○]     Iterations: ═══●═══ 10           │
│                                                                 │
│                                         [Generate →]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Changes**:
1. **Larger, more prominent textarea** - 4-5 rows, not 2
2. **Settings in expandable panel** - Click gear icon to reveal mode, iterations, subagents
3. **New/Resume as radio buttons** - Cleaner than toggle buttons
4. **Submit button outside textarea** - Clear, prominent action button
5. **Attachments as chips below textarea** - Not inline with other controls

#### C. Preview Panel Behavior

**New Logic**:
```typescript
// Preview visibility conditions
const showPreview =
  screenshots.length > 0 ||      // Screenshots streaming
  completionInfo?.download_url;  // Deployed app URL

// Smooth transition
<AnimatePresence>
  {showPreview && (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: '40%', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <PreviewPanel />
    </motion.div>
  )}
</AnimatePresence>
```

#### D. Welcome State (No Generation)

When terminal is empty, show inspiring welcome:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│               ✨ Welcome to Leo Console                         │
│                                                                 │
│   Describe your app idea below and watch it come to life.       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  "A project management app for remote teams"            │  │
│   │  "An invoice generator for freelancers"                 │  │
│   │  "A recipe sharing platform with AI suggestions"        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   [Try an example →]                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Component Improvements

#### A. Touch Targets (44px minimum)

**Files to update**:
- `ConsolePage.tsx` - All buttons
- `GenerationTabs.tsx` - Tab buttons
- `UserMenu.tsx` - Menu triggers
- `FeedbackModal.tsx` - Close button

**Pattern**:
```tsx
// Before
<Button size="icon">
  <Settings className="h-4 w-4" />
</Button>

// After
<Button size="icon" className="min-h-11 min-w-11" aria-label="Settings">
  <Settings className="h-5 w-5" />
</Button>
```

#### B. Four-State Components

**Apply to**:
- Apps list page
- Settings page
- Resume dropdown

**Pattern**:
```tsx
if (isLoading) return <Skeleton />;
if (error) return <ErrorState retry={refetch} />;
if (!data?.length) return <EmptyState />;
return <DataList data={data} />;
```

#### C. Input Field Improvements

**Current issues**:
- Small, cramped inputs
- Low contrast placeholders
- No focus states

**New styles**:
```css
.leo-input {
  @apply bg-leo-bg-tertiary/50 border border-leo-border/50 rounded-xl
         px-4 py-3 text-leo-text text-base
         placeholder:text-leo-text-tertiary/70
         focus:outline-none focus:border-leo-primary/50
         focus:ring-2 focus:ring-leo-primary/20
         focus:bg-leo-bg-tertiary
         transition-all duration-200;
}

/* Prominent textarea for prompts */
.leo-prompt-input {
  @apply bg-leo-bg-tertiary/30 border-2 border-leo-border
         rounded-2xl px-5 py-4 text-leo-text text-lg
         placeholder:text-leo-text-secondary
         focus:outline-none focus:border-leo-primary/60
         focus:ring-4 focus:ring-leo-primary/10
         focus:bg-leo-bg-tertiary/50
         transition-all duration-300;
  min-height: 120px;
  resize: none;
}
```

### 3. Animation & Micro-interactions

#### A. Page Load Animations

```css
/* Staggered fade-in for lists */
.animate-list-item {
  opacity: 0;
  animation: fade-in-up 0.4s ease-out forwards;
}

.animate-list-item:nth-child(1) { animation-delay: 0ms; }
.animate-list-item:nth-child(2) { animation-delay: 50ms; }
.animate-list-item:nth-child(3) { animation-delay: 100ms; }
/* ... */
```

#### B. Button Hover States

```css
.leo-btn-primary {
  @apply transform transition-all duration-200;
}

.leo-btn-primary:hover {
  @apply scale-105 shadow-glow-md;
}

.leo-btn-primary:active {
  @apply scale-95;
}
```

#### C. Preview Panel Slide-in

Using CSS transforms or Framer Motion for smooth preview appearance.

### 4. Color System Update (OKLCH)

While the current HSL system works, future consideration for OKLCH migration:

```css
/* Future state - OKLCH values */
:root {
  --leo-primary: 0.68 0.18 285;      /* Purple */
  --leo-accent: 0.72 0.15 190;       /* Cyan */
  --leo-emerald: 0.65 0.17 155;      /* Emerald */
}
```

For now, maintain HSL but ensure proper contrast ratios.

---

## Implementation Priority

### Phase 1: Quick Wins (This Session)
1. ✅ ConsolePage layout - Hide preview when empty
2. ✅ Larger touch targets (44px minimum)
3. ✅ Improved textarea styling
4. ✅ Settings panel collapse/expand
5. ✅ Welcome state for empty console

### Phase 2: Enhanced UX
1. Form reorganization (New/Resume as radio)
2. Attachment chips redesign
3. Better loading states
4. Progress indicator improvements

### Phase 3: Polish
1. Page load animations
2. Micro-interactions
3. Mobile responsive fixes
4. Accessibility audit

---

## File Changes Required

### Phase 1 Files

1. **`ConsolePage.tsx`**
   - Conditional preview rendering
   - Textarea styling update
   - Touch target fixes
   - Settings panel redesign
   - Welcome state component

2. **`index.css`**
   - New utility classes
   - Updated input styles
   - Animation keyframes

3. **`ScreenshotPreview.tsx`**
   - Entry/exit animations

4. **`tailwind.config.ts`**
   - Additional animation config (if needed)

---

## Success Metrics

After redesign:
- [ ] Preview panel hidden when no content (reduces visual clutter)
- [ ] All touch targets ≥44px (mobile usability)
- [ ] Console feels spacious and focused
- [ ] Settings accessible but not overwhelming
- [ ] Clear visual hierarchy in input form
- [ ] Smooth animations for state transitions
- [ ] Build passes, no TypeScript errors

---

## Next Steps

1. Review this plan
2. Begin Phase 1 implementation
3. Test with `npm run build`
4. Verify in browser with Chrome DevTools
5. Iterate based on visual inspection
