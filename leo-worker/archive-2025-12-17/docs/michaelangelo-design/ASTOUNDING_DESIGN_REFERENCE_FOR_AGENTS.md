# ASTOUNDING Design Reference for FIS Generation Agents

**Purpose**: This document provides the authoritative design principles, component patterns, and visual guidelines for generating Frontend Interaction Specifications that produce ASTOUNDING applications.

**Benchmark**: Timeless Weddings (https://timeless-weddings.vercel.app/) and PawsFlow (https://pawsflow-app.vercel.app/)

**Date**: October 5, 2025

---

## Core Design Philosophy

### 1. BOLD, Not Subtle

**Principle**: Make intentional, confident design choices. ASTOUNDING designs are never timid.

- ✅ **DO**: Choose vibrant purple (#8B5CF6) as primary accent OR pure monochrome white
- ❌ **DON'T**: Use subtle blue (#3B82F6) as primary - this feels corporate and safe

**Color Strategy Options**:
1. **Vibrant** (Timeless Weddings style): Purple primary + pink gradients
2. **Monochrome** (PawsFlow style): White CTAs + gray accents + no color

**Never** use subtle/muted colors as the primary accent. Either go bold or go monochrome.

### 2. Exceptional Typography

- **Hero headings**: 72px+, font-weight 800 (not 700!)
- **H1 headings**: 48px, font-weight 700
- **H2 headings**: 36px, font-weight 700 (not 600!)
- **H3 headings**: 28px, font-weight 600

**Contrast**: Always white text on dark backgrounds (#0A0A0B, #18181B, #27272A)

### 3. Status-Driven UX

**Principle**: Users should ALWAYS know the status of their data at a glance.

- Use color-coded badges on EVERY card that has a status
- Define 5 semantic status colors (not just success/warning/error)
- Status badges are not optional - they're mandatory for entity cards

### 4. Empty States with Purpose

**Principle**: Never show blank pages. Always show what's possible.

- Large icon (64px, gray-600)
- Clear heading explaining why it's empty
- Helpful message about what can be done
- CTA button to take action

### 5. Dashboard Personalization

**Principle**: Make users feel the app is built for them specifically.

- Greet by name: "Welcome back, {Name}!"
- Show key metrics prominently with gradient cards
- Use countdown/timer cards for time-sensitive data
- Display recent activity with color-coded timeline

---

## Foundation Tokens (CORRECTED)

### Colors - Vibrant Option (Default)

```css
/* Dark Backgrounds (CORRECT - keep these) */
--bg-primary: #0A0A0B;           /* Deep black, main background */
--bg-secondary: #18181B;         /* Charcoal, card backgrounds */
--bg-tertiary: #27272A;          /* Dark gray, elevated surfaces */

/* Accent Colors (CORRECTED - purple is now primary!) */
--accent-primary: #8B5CF6;       /* Vibrant purple, PRIMARY CTAs */
--accent-secondary: #3B82F6;     /* Royal blue, SECONDARY accents */
--accent-tertiary: #EC4899;      /* Hot pink, gradients and highlights */

/* Status Colors (NEW - semantic meaning) */
--status-confirmed: #10B981;     /* Emerald green - confirmed bookings/appointments */
--status-completed: #3B82F6;     /* Blue - completed bookings/appointments */
--status-paid: #8B5CF6;          /* Purple - paid bookings/invoices */
--status-pending: #F59E0B;       /* Amber - pending bookings/approvals */
--status-cancelled: #EF4444;     /* Red - cancelled bookings/appointments */

/* Gradients (NEW - for hero cards and metrics) */
--gradient-hero: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
--gradient-cta: linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%);
--gradient-metric: linear-gradient(to right, #8B5CF6, #EC4899);

/* Text Colors (CORRECT - keep these) */
--text-primary: #FFFFFF;         /* Pure white, main text */
--text-secondary: #A1A1AA;       /* Muted gray, secondary text */
```

### Colors - Monochrome Option (Alternative)

```css
/* Use for professional/medical/legal applications */
--accent-primary: #FFFFFF;       /* White CTAs */
--accent-secondary: #E5E5E5;     /* Light gray accents */
/* No tertiary accent - keep it pure monochrome */
```

### Typography (CORRECTED)

```css
/* Font Stack */
--font-primary: 'Inter', system-ui, sans-serif;

/* Heading Scale (Mobile / Desktop) - CORRECTED WEIGHTS */
--text-hero: 48px / 72px;        /* Line height: 1.1, Weight: 800 (not 700!) */
--text-h1: 36px / 48px;          /* Line height: 1.2, Weight: 700 */
--text-h2: 28px / 36px;          /* Line height: 1.3, Weight: 700 (not 600!) */
--text-h3: 24px / 28px;          /* Line height: 1.4, Weight: 600 */
--text-body: 16px / 16px;        /* Line height: 1.6, Weight: 400 */
--text-small: 14px / 14px;       /* Line height: 1.5, Weight: 400 */

/* Letter Spacing */
--tracking-tight: -0.02em;       /* For headings */
--tracking-normal: 0;            /* For body text */
```

### Spacing (Generous, not cramped)

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 32px;
--space-xl: 64px;
--space-2xl: 96px;      /* Use this! Don't be afraid of whitespace */
```

---

## Critical Component Patterns (NEW)

### 1. STATUS_BADGE (MANDATORY for entity cards)

**Pattern ID**: `STATUS_BADGE`

**When to use**: EVERY card that displays an entity with a status field.

**Visual Design**:
- Pill-shaped badge with rounded-full
- Padding: 6px 12px
- Font size: 12px
- Font weight: 600
- Text transform: uppercase
- Letter spacing: 0.05em

**Color Variants** (use semantic status colors):
```tsx
// Confirmed (green)
<Badge className="bg-emerald-600 text-white">Confirmed</Badge>

// Completed (blue)
<Badge className="bg-blue-600 text-white">Completed</Badge>

// Paid (purple)
<Badge className="bg-purple-600 text-white">Paid</Badge>

// Pending (amber with dark text for contrast)
<Badge className="bg-amber-500 text-gray-900">Pending</Badge>

// Cancelled (red)
<Badge className="bg-red-600 text-white">Cancelled</Badge>

// Featured/Most Popular
<Badge className="bg-purple-600 text-white">Most Popular</Badge>
```

**Tailwind Implementation**:
```tsx
className="inline-flex px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full bg-{color}-600 text-white"
```

### 2. EMPTY_STATE (MANDATORY for empty lists/collections)

**Pattern ID**: `EMPTY_STATE`

**When to use**: ALWAYS when a list, grid, or collection has no items.

**Visual Design**:
```tsx
<div className="flex flex-col items-center justify-center py-16 px-8 text-center max-w-md mx-auto">
  {/* Icon - 64px, gray-600 */}
  <CalendarIcon className="w-16 h-16 text-gray-600 mb-6" />

  {/* Optional heading */}
  <h3 className="text-2xl font-semibold text-white mb-3">
    No bookings yet
  </h3>

  {/* Message */}
  <p className="text-gray-400 text-base mb-8">
    Browse our beautiful chapels and book your dream ceremony
  </p>

  {/* CTA */}
  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
    Browse Chapels
  </Button>
</div>
```

**Common Scenarios**:
- No bookings: Calendar icon + "Browse Chapels" CTA
- No guests: Users icon + "Manage Guest List" CTA
- No pets: Heart icon + "Add Pet" CTA
- No messages: Mail icon + "Contact Support" CTA
- No results: Search icon + "Clear Filters" CTA

### 3. TAB_NAVIGATION (MANDATORY for complex detail pages)

**Pattern ID**: `TAB_NAVIGATION`

**When to use**: Detail pages with multiple sections (Overview, Vendors, Guests, Timeline, Documents).

**Visual Design**:
```tsx
<Tabs>
  <TabsList className="border-b border-white/10">
    <TabsTrigger
      value="overview"
      className="px-6 py-4 text-sm font-medium text-gray-400 hover:text-gray-300 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
    >
      Overview
    </TabsTrigger>
    <TabsTrigger value="vendors">
      Vendors
    </TabsTrigger>
    <TabsTrigger value="guests">
      Guests <span className="ml-2 text-xs text-gray-500">(12)</span>
    </TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* Content */}
  </TabsContent>
</Tabs>
```

**States**:
- Active: Purple bottom border, white text, font-weight 600
- Inactive: Gray text, font-weight 500
- Hover: Lighter gray text

**Optional**: Badge counts in tabs (e.g., "All (12)")

### 4. GRADIENT_METRIC_CARD (MANDATORY for dashboard hero/countdown)

**Pattern ID**: `GRADIENT_METRIC_CARD`

**When to use**: Dashboard pages that need to highlight a key metric or countdown.

**Visual Design**:
```tsx
<div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-lg">
  {/* Label */}
  <p className="text-lg font-medium text-white/80 mb-2">
    Your ceremony is in
  </p>

  {/* Metric - HUGE number */}
  <div className="text-6xl font-bold mb-2">
    {daysRemaining}
  </div>

  {/* Unit */}
  <p className="text-lg text-white/80">
    days
  </p>

  {/* Optional subtext */}
  <p className="text-base text-white/60 mt-4">
    {formattedDate}
  </p>
</div>
```

**Use Cases**:
- Countdown timers (weddings, appointments)
- Key metrics (total revenue, patient count)
- Outstanding balances
- Important KPIs

### 5. NOTIFICATION_BELL (Optional but recommended for portals)

**Pattern ID**: `NOTIFICATION_BELL`

**Visual Design**:
```tsx
<button className="relative p-2">
  <BellIcon className="w-6 h-6 text-gray-400" />
  {/* Badge count */}
  <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 rounded-full text-xs font-semibold text-white flex items-center justify-center">
    3
  </span>
</button>
```

### 6. USER_PROFILE_DROPDOWN (Optional but recommended for portals)

**Pattern ID**: `USER_PROFILE_DROPDOWN`

**Visual Design**:
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Avatar>
      <AvatarImage src={user.imageUrl} />
      <AvatarFallback>{userInitials}</AvatarFallback>
    </Avatar>
  </DropdownMenuTrigger>

  <DropdownMenuContent>
    {/* User info */}
    <div className="px-4 py-3">
      <p className="font-semibold text-white">{user.name}</p>
      <p className="text-sm text-gray-400">{user.email}</p>
    </div>

    <DropdownMenuSeparator />

    {/* Navigation links */}
    <DropdownMenuItem>Dashboard</DropdownMenuItem>
    <DropdownMenuItem>Bookings</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>

    <DropdownMenuSeparator />

    <DropdownMenuItem>Sign Out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Portal-Specific Patterns

### Dashboard Layout Pattern

**Principle**: Dashboards should feel personalized and informative.

**Required Components**:
1. **Welcome Header**: "Welcome back, {Name}!" with user avatar and notification bell
2. **Hero/Countdown Card**: Gradient card with key metric (use GRADIENT_METRIC_CARD)
3. **Quick Stats Cards**: 3-4 cards with icon + number + label, clickable filters
4. **Upcoming Items List**: Cards with STATUS_BADGE for each item
5. **Empty State**: If no items, use EMPTY_STATE pattern with CTA

**Layout**:
- Hero card: Full width OR prominent position
- Stats: Grid of 2-4 cards (responsive)
- Upcoming list: Vertical stack with STATUS_BADGE on each card

### Detail Page Layout Pattern

**Principle**: Complex detail pages need clear content organization.

**Required Components**:
1. **Back Button**: Top-left, returns to list view
2. **Page Header**: Entity ID/name + STATUS_BADGE
3. **Tab Navigation**: Use TAB_NAVIGATION for sections (Overview, Details, History, etc.)
4. **Two-Column Layout** (desktop): Main content (2/3) + Quick Actions Sidebar (1/3)

**Tabs to Consider**:
- Overview: Main information
- Vendors/Related Entities: Lists with empty states
- Guests/Participants: Lists with empty states
- Timeline: Status history with color-coded icons
- Documents: Files with empty state

### List Page Layout Pattern

**Principle**: Lists should be filterable and scannable.

**Required Components**:
1. **Page Header**: Title + "New {Entity}" CTA (PRIMARY_CTA)
2. **Tab Filters**: Use TAB_NAVIGATION for "All", "Upcoming", "Past", "Cancelled" with counts
3. **Entity Cards**: Grid of cards (2-column desktop, 1-column mobile)
4. **STATUS_BADGE**: On EVERY card
5. **Empty State**: Use EMPTY_STATE when filtered list is empty

**Icons on Cards**:
- Date: Calendar icon
- Time: Clock icon
- Location: MapPin icon

---

## Critical Rules for Agents

### Rule 1: Status Badges are Mandatory

If an entity has a `status` field, the card/detail page MUST display a STATUS_BADGE. No exceptions.

### Rule 2: Empty States are Mandatory

If a list/grid/collection can be empty, it MUST have an EMPTY_STATE. Never show blank pages.

### Rule 3: Purple is Primary

Unless using monochrome style, `--accent-primary` is ALWAYS purple (#8B5CF6), not blue.

### Rule 4: Bold Typography

Hero headings are 72px with font-weight 800. Don't reduce this. Bold is GOOD.

### Rule 5: Gradient Cards for Key Metrics

Dashboards MUST have at least one gradient card for the most important metric (countdown, revenue, key stat).

### Rule 6: Tab Navigation for Complex Pages

If a detail page has 3+ sections of content, use TAB_NAVIGATION, not long scroll.

### Rule 7: Generous Spacing

Use `--space-lg` (32px) and `--space-xl` (64px) liberally. Don't be cramped.

---

## Component Pattern Priority

When generating Master Spec, include patterns in this order:

1. **FOUNDATION_TOKENS** (with CORRECTED colors and typography)
2. **GLASS_CARD** (existing, keep it)
3. **PRIMARY_CTA** (update to use purple gradient)
4. **SECONDARY_CTA** (existing, keep it)
5. **STATUS_BADGE** (NEW - critical)
6. **EMPTY_STATE** (NEW - critical)
7. **TAB_NAVIGATION** (NEW - critical)
8. **GRADIENT_METRIC_CARD** (NEW - critical)
9. **DARK_INPUT** (existing, keep it)
10. **SKELETON_LOADER** (existing, keep it)
11. **ERROR_BOUNDARY** (existing, keep it)
12. **NOTIFICATION_BELL** (NEW - optional)
13. **USER_PROFILE_DROPDOWN** (NEW - optional)
14. **HERO_SECTION** (existing, keep it)
15. **MODAL_OVERLAY** (existing, keep it)
16. **TOAST_NOTIFICATION** (existing, keep it)

---

## Visual Design Checklist

For EVERY page specification, ensure:

- ✅ Color system uses purple primary (or monochrome)
- ✅ Typography uses 800 weight for hero, 700 for h1/h2
- ✅ All entity cards have STATUS_BADGE
- ✅ All empty lists have EMPTY_STATE
- ✅ Complex pages use TAB_NAVIGATION
- ✅ Dashboard has GRADIENT_METRIC_CARD
- ✅ Generous spacing (space-lg, space-xl)
- ✅ Dark theme with high contrast
- ✅ Icons from Lucide React
- ✅ Accessible (WCAG AA minimum)

---

## Testing Generated Specs

To verify a generated spec is ASTOUNDING:

1. **Search for `#3B82F6` in accent-primary** → If found, FAIL (should be purple)
2. **Search for `STATUS_BADGE`** → Should appear in entity card specs
3. **Search for `EMPTY_STATE`** → Should appear in list component specs
4. **Search for `TAB_NAVIGATION`** → Should appear in detail page specs
5. **Search for `GRADIENT_METRIC_CARD`** → Should appear in dashboard spec
6. **Check hero typography** → Should be 72px / 800 weight
7. **Check h2 typography** → Should be 700 weight (not 600)

---

## Reference Applications

- **Timeless Weddings**: https://timeless-weddings.vercel.app/ (vibrant purple theme)
- **PawsFlow**: https://pawsflow-app.vercel.app/ (monochrome white theme)

Screenshots: `/docs/michaelangelo-design/*.png`

Full Analysis: `/docs/michaelangelo-design/DESIGN_ANALYSIS_NOTES.md`

---

**Last Updated**: October 5, 2025

**Status**: ✅ AUTHORITATIVE - Use this as the single source of truth for ASTOUNDING design generation
