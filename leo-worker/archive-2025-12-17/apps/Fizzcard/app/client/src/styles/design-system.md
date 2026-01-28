# FizzCard Design System

> A vibrant, dark-mode-first design system for a modern contact sharing platform with gamified crypto rewards.

**Version:** 1.0.0
**Last Updated:** 2025-10-23
**Design Philosophy:** Rewarding, Minimalistic, Mobile-First

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Layout System](#layout-system)
5. [Component Library](#component-library)
6. [Screen Designs](#screen-designs)
7. [Interaction Patterns](#interaction-patterns)
8. [Animation Guidelines](#animation-guidelines)
9. [Accessibility](#accessibility)
10. [Responsive Design](#responsive-design)

---

## Design Principles

### Core Values

1. **Rewarding & Celebratory**
   - Every connection should feel like an achievement
   - Visual feedback for FizzCoin earnings (particles, glows, animations)
   - Gamified elements that encourage engagement

2. **Dark Mode First**
   - Deep dark backgrounds (#0A0A0F) for reduced eye strain
   - High contrast for excellent readability
   - Vibrant accent colors that pop against dark surfaces

3. **Minimalistic & Clean**
   - Uncluttered interfaces with clear hierarchy
   - Generous white space
   - Focus on essential information

4. **Mobile-First**
   - Optimized for one-handed use
   - Touch-friendly targets (minimum 44x44px)
   - Bottom navigation for easy reach

5. **Premium Feel**
   - Glass-morphism effects
   - Smooth animations and transitions
   - Polished micro-interactions

---

## Color System

### Primary Palette

```css
/* Vibrant Cyan - Primary Brand */
--primary-500: #00D9FF;        /* Main brand color */
--primary-glow: rgba(0, 217, 255, 0.4);

/* Neon Purple - Accent */
--accent-500: #B744FF;         /* Highlights & badges */
--accent-glow: rgba(183, 68, 255, 0.4);

/* Deep Dark - Backgrounds */
--bg-primary: #0A0A0F;         /* Page background */
--bg-secondary: #1A1A24;       /* Card backgrounds */
--bg-tertiary: #2A2A3A;        /* Elevated surfaces */
--bg-glass: rgba(26, 26, 36, 0.6); /* Glass effect */

/* Gold - FizzCoin */
--fizzcoin-500: #FFD700;       /* Main gold */
--fizzcoin-glow: rgba(255, 215, 0, 0.6);
```

### Usage Guidelines

| Color | Usage | Examples |
|-------|-------|----------|
| Primary Cyan | Primary actions, links, focus states | Buttons, QR code border, active nav |
| Accent Purple | Highlights, badges, premium features | Super-Connector badge, active filters |
| Gold | FizzCoin displays, rewards, success | Balance display, earnings, celebration |
| Background Dark | Page backgrounds, overlays | Main view, modal backgrounds |
| Background Secondary | Card surfaces, containers | Connection cards, profile sections |

### Semantic Colors

```css
/* Success */
--success-500: #00D084;
--success-glow: rgba(0, 208, 132, 0.4);

/* Error */
--error-500: #FF4444;
--error-glow: rgba(255, 68, 68, 0.4);

/* Warning */
--warning-500: #FF9500;
--warning-glow: rgba(255, 149, 0, 0.4);
```

### Text Colors

```css
--text-primary: #FFFFFF;       /* Headings, primary content */
--text-secondary: #A0A0B0;     /* Body text, descriptions */
--text-tertiary: #70707D;      /* Muted text, timestamps */
--text-disabled: #4A4A54;      /* Disabled states */
```

---

## Typography

### Font Stack

```css
/* Sans-serif - Body & UI */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Display - Headings & Hero */
font-family: 'DM Sans', 'Inter', sans-serif;

/* Monospace - FizzCoin amounts */
font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| Hero | 48px / 3rem | 700 Bold | 1.2 | Main landing hero |
| H1 | 36px / 2.25rem | 700 Bold | 1.2 | Page titles |
| H2 | 30px / 1.875rem | 600 Semibold | 1.3 | Section headers |
| H3 | 24px / 1.5rem | 600 Semibold | 1.4 | Subsection headers |
| H4 | 20px / 1.25rem | 600 Semibold | 1.4 | Card titles |
| Body Large | 18px / 1.125rem | 400 Regular | 1.6 | Important body text |
| Body | 16px / 1rem | 400 Regular | 1.5 | Default body text |
| Body Small | 14px / 0.875rem | 400 Regular | 1.5 | Secondary text |
| Caption | 12px / 0.75rem | 400 Regular | 1.4 | Timestamps, labels |
| FizzCoin | 20-48px | 600 Semibold | 1.2 | Amounts (monospace) |

### Typography Patterns

**Gradient Text** (for hero headings):
```css
background: linear-gradient(135deg, #00D9FF 0%, #B744FF 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

**Emphasis Styles:**
- Bold: 600 semibold for emphasis
- Italic: Reserve for quotes or special context
- Uppercase: Small caps for labels, badges (11px, 0.05em spacing)

---

## Layout System

### Grid System

**Mobile (< 768px):**
- Single column layout
- 16px side padding
- 16px vertical spacing between elements

**Tablet (768px - 1023px):**
- 2-column grid for cards
- 24px side padding
- 24px gap between columns

**Desktop (1024px+):**
- Max width: 1280px (centered)
- 3-4 column grid for cards
- 32px side padding
- 24px gap between columns

### Spacing System

Based on 4px base unit:

```
4px  (spacing-1)   - Tight padding, icon spacing
8px  (spacing-2)   - Small gaps, button internal padding
12px (spacing-3)   - Form element spacing
16px (spacing-4)   - Standard padding, card internal spacing
24px (spacing-6)   - Section spacing, card external spacing
32px (spacing-8)   - Large section gaps
48px (spacing-12)  - Major section dividers
64px (spacing-16)  - Page section spacing
```

### Container Patterns

**Page Container:**
```css
max-width: 1280px;
margin: 0 auto;
padding: 0 16px; /* Mobile */
padding: 0 32px; /* Desktop */
```

**Card Container:**
```css
background: rgba(26, 26, 36, 0.6);
backdrop-filter: blur(12px);
border: 1px solid #2A2A3A;
border-radius: 12px;
padding: 24px;
```

**Glass Container:**
```css
background: rgba(26, 26, 36, 0.4);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

---

## Component Library

### 1. Buttons

#### Primary Button (CTA)
```css
/* Base */
background: linear-gradient(135deg, #00D9FF 0%, #B744FF 100%);
color: #FFFFFF;
padding: 0 24px;
height: 48px;
border-radius: 8px;
font-weight: 600;
font-size: 16px;
box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);

/* Hover */
transform: translateY(-2px);
box-shadow: 0 8px 20px rgba(0, 217, 255, 0.5);

/* Active */
transform: translateY(0);
box-shadow: 0 2px 8px rgba(0, 217, 255, 0.4);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

#### Secondary Button
```css
background: transparent;
border: 2px solid #00D9FF;
color: #00D9FF;
padding: 0 24px;
height: 48px;
border-radius: 8px;
font-weight: 600;

/* Hover */
background: rgba(0, 217, 255, 0.1);
box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
```

#### Ghost Button
```css
background: transparent;
color: #A0A0B0;
padding: 0 16px;
height: 40px;
border-radius: 8px;

/* Hover */
color: #FFFFFF;
background: rgba(255, 255, 255, 0.05);
```

#### FizzCoin Button (Special)
```css
background: linear-gradient(135deg, #FFD700 0%, #FFEB99 50%, #FFD700 100%);
color: #0A0A0F;
padding: 0 24px;
height: 48px;
border-radius: 8px;
font-weight: 700;
box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);

/* Hover */
box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
transform: scale(1.05);
```

**Sizes:**
- Small: 32px height, 12px padding
- Medium: 40px height, 16px padding
- Large: 48px height, 24px padding
- XL: 56px height, 32px padding

---

### 2. Cards

#### Connection Card
```css
/* Container */
background: rgba(26, 26, 36, 0.6);
backdrop-filter: blur(12px);
border: 1px solid #2A2A3A;
border-radius: 12px;
padding: 16px;
transition: all 250ms ease-out;

/* Hover */
border-color: #00D9FF;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(0, 217, 255, 0.2);
transform: translateY(-4px) scale(1.02);
```

**Layout:**
```
┌─────────────────────────────┐
│  [Avatar]  Name              │
│           Title              │
│           Company            │
│  ─────────────────────      │
│  📍 Met in: San Francisco   │
│  📅 Oct 23, 2025            │
└─────────────────────────────┘
```

#### Stats Card
```css
/* Container */
background: linear-gradient(135deg,
  rgba(0, 217, 255, 0.1) 0%,
  rgba(183, 68, 255, 0.1) 100%);
border: 1px solid rgba(0, 217, 255, 0.3);
border-radius: 16px;
padding: 24px;

/* Content */
- Large number (48px, bold)
- Label below (14px, muted)
- Optional icon (32px)
```

#### FizzCoin Balance Card
```css
/* Hero card with glow */
background: linear-gradient(135deg, #1A1A24 0%, #2A2A3A 100%);
border: 2px solid #FFD700;
border-radius: 24px;
padding: 32px;
box-shadow: 0 0 40px rgba(255, 215, 0, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.5);
text-align: center;

/* Balance display */
font-family: 'JetBrains Mono', monospace;
font-size: 48px;
font-weight: 700;
color: #FFD700;
text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
```

---

### 3. Forms & Inputs

#### Text Input
```css
/* Base */
background: #1A1A24;
border: 1px solid #2A2A3A;
border-radius: 8px;
height: 48px;
padding: 0 16px;
color: #FFFFFF;
font-size: 16px;

/* Focus */
border-color: #00D9FF;
box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2);
outline: none;

/* Error */
border-color: #FF4444;
box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.2);

/* Disabled */
background: #0A0A0F;
color: #4A4A54;
cursor: not-allowed;
```

#### Floating Label Pattern
```html
<div class="input-wrapper">
  <input type="text" placeholder=" " />
  <label>Email Address</label>
</div>
```

```css
.input-wrapper {
  position: relative;
}

.input-wrapper label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #70707D;
  transition: all 200ms;
  pointer-events: none;
}

.input-wrapper input:focus + label,
.input-wrapper input:not(:placeholder-shown) + label {
  top: -8px;
  font-size: 12px;
  color: #00D9FF;
  background: #0A0A0F;
  padding: 0 4px;
}
```

#### Search Bar
```css
background: rgba(26, 26, 36, 0.6);
backdrop-filter: blur(8px);
border: 1px solid #2A2A3A;
border-radius: 24px; /* Fully rounded */
height: 44px;
padding: 0 48px 0 16px; /* Room for search icon */

/* Search icon (absolute right) */
position: absolute;
right: 16px;
color: #70707D;
```

---

### 4. Navigation

#### Bottom Navigation (Mobile)
```css
/* Container */
position: fixed;
bottom: 0;
left: 0;
right: 0;
height: 64px;
background: rgba(26, 26, 36, 0.9);
backdrop-filter: blur(16px);
border-top: 1px solid #2A2A3A;
z-index: 1030;

/* Layout */
display: flex;
justify-content: space-around;
align-items: center;
padding: 8px 16px;
```

**Nav Items:**
```
[Icon] Home
[Icon] Scan (larger, center, elevated)
[Icon] Wallet
[Icon] Profile
```

```css
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #70707D;
  transition: all 200ms;
}

.nav-item.active {
  color: #00D9FF;
}

.nav-item-center {
  /* Scan button - elevated */
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00D9FF 0%, #B744FF 100%);
  box-shadow: 0 4px 16px rgba(0, 217, 255, 0.5);
  transform: translateY(-8px);
}
```

#### Header Navigation (Desktop)
```css
/* Container */
position: sticky;
top: 0;
height: 72px;
background: rgba(26, 26, 36, 0.8);
backdrop-filter: blur(16px);
border-bottom: 1px solid #2A2A3A;
z-index: 1030;

/* Layout */
display: flex;
justify-content: space-between;
align-items: center;
padding: 0 32px;
max-width: 1280px;
margin: 0 auto;
```

**Content:**
```
[Logo] FizzCard    [Home] [Connections] [Leaderboard]    [Notifications] [FizzCoin: 1,234] [Avatar]
```

---

### 5. Badges

#### Badge Variants
```css
/* Base badge */
display: inline-flex;
align-items: center;
gap: 4px;
padding: 0 10px;
height: 24px;
border-radius: 12px;
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.05em;
```

**Types:**

**Super-Connector Badge:**
```css
background: rgba(183, 68, 255, 0.2);
border: 1px solid #B744FF;
color: #B744FF;
box-shadow: 0 0 12px rgba(183, 68, 255, 0.3);
```

**Verified Badge:**
```css
background: rgba(0, 217, 255, 0.2);
border: 1px solid #00D9FF;
color: #00D9FF;
```

**Top Earner Badge:**
```css
background: rgba(255, 215, 0, 0.2);
border: 1px solid #FFD700;
color: #FFD700;
box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
```

**Location Tag:**
```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid #2A2A3A;
color: #A0A0B0;
```

---

### 6. Avatars

```css
/* Base */
width: 40px;
height: 40px;
border-radius: 50%;
border: 2px solid #2A2A3A;
overflow: hidden;

/* With status indicator */
position: relative;

.avatar::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00D084; /* Online */
  border: 2px solid #0A0A0F;
}
```

**Sizes:**
- XS: 24px (navigation, inline)
- SM: 32px (list items)
- MD: 40px (cards, default)
- LG: 48px (profile preview)
- XL: 64px (profile headers)
- 2XL: 80px (profile page)
- 3XL: 96px (hero profile)

---

### 7. QR Code Display

#### QR Code Container
```css
/* Container */
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 32px;
background: #1A1A24;
border: 4px solid #00D9FF;
border-radius: 32px;
box-shadow: 0 0 40px rgba(0, 217, 255, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.5);

/* QR Code */
width: 280px;
height: 280px;
padding: 16px;
background: #FFFFFF;
border-radius: 16px;

/* Center logo overlay */
position: absolute;
width: 48px;
height: 48px;
background: #00D9FF;
border-radius: 50%;
box-shadow: 0 0 20px rgba(0, 217, 255, 0.6);
```

**Active scanning state:**
```css
/* Pulsing glow animation */
animation: glowPulse 2s ease-in-out infinite;

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 40px rgba(0, 217, 255, 0.4); }
  50% { box-shadow: 0 0 60px rgba(0, 217, 255, 0.8); }
}
```

---

### 8. FizzCoin Display

#### Balance Display (Large)
```css
/* Container */
display: flex;
align-items: center;
gap: 12px;

/* Icon */
width: 48px;
height: 48px;
background: linear-gradient(135deg, #FFD700 0%, #FFEB99 100%);
border-radius: 50%;
box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);

/* Amount */
font-family: 'JetBrains Mono', monospace;
font-size: 48px;
font-weight: 700;
color: #FFD700;
text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
```

#### Inline Display (Small)
```css
display: inline-flex;
align-items: center;
gap: 4px;

/* Icon: 16px */
/* Amount: 14px, monospace, #FFD700 */
```

#### Earning Animation
```css
/* Particle container */
position: relative;

/* Particles (absolute positioned) */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.8);
  animation: floatUp 1s ease-out forwards;
}

@keyframes floatUp {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-50px) scale(0.5); opacity: 0; }
}

/* Main number celebration */
animation: fizzCoinCelebrate 500ms ease-out;

@keyframes fizzCoinCelebrate {
  0% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.2); filter: brightness(1.5); }
  100% { transform: scale(1); filter: brightness(1); }
}
```

---

### 9. Modals & Overlays

#### Modal Container
```css
/* Backdrop */
position: fixed;
inset: 0;
background: rgba(10, 10, 15, 0.9);
backdrop-filter: blur(8px);
z-index: 1040;

/* Modal */
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
max-width: 500px;
width: calc(100% - 32px);
background: #1A1A24;
border: 1px solid #2A2A3A;
border-radius: 24px;
padding: 32px;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
z-index: 1050;

/* Animation */
animation: scaleIn 300ms ease-out;

@keyframes scaleIn {
  from { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
```

#### Toast Notification
```css
/* Container */
position: fixed;
top: 16px;
right: 16px;
max-width: 400px;
background: rgba(26, 26, 36, 0.95);
backdrop-filter: blur(12px);
border: 1px solid #00D9FF;
border-radius: 12px;
padding: 16px;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(0, 217, 255, 0.3);
z-index: 1080;

/* Animation */
animation: slideDown 300ms ease-out;

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**Toast Types:**
- Success: Green border (#00D084)
- Error: Red border (#FF4444)
- Warning: Orange border (#FF9500)
- Info: Cyan border (#00D9FF)
- FizzCoin: Gold border (#FFD700) with glow

---

### 10. Loading States

#### Skeleton Screen
```css
/* Skeleton element */
background: linear-gradient(
  90deg,
  rgba(42, 42, 58, 0.5) 0%,
  rgba(60, 60, 80, 0.5) 50%,
  rgba(42, 42, 58, 0.5) 100%
);
background-size: 200% 100%;
animation: shimmer 1.5s ease-in-out infinite;
border-radius: 8px;

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Pattern:**
```
┌─────────────────────────────┐
│  [○○○] ▬▬▬▬▬▬▬             │  ← Skeleton card
│       ▬▬▬▬▬                 │
│       ▬▬▬▬▬▬▬▬              │
└─────────────────────────────┘
```

#### Spinner (for inline loading)
```css
/* Spinner */
width: 24px;
height: 24px;
border: 3px solid rgba(255, 255, 255, 0.1);
border-top-color: #00D9FF;
border-radius: 50%;
animation: spin 600ms linear infinite;

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### 11. Empty States

```css
/* Container */
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 64px 32px;
text-align: center;

/* Illustration */
width: 200px;
height: 200px;
opacity: 0.6;
margin-bottom: 24px;

/* Heading */
font-size: 24px;
font-weight: 600;
color: #FFFFFF;
margin-bottom: 8px;

/* Description */
font-size: 16px;
color: #70707D;
margin-bottom: 24px;
max-width: 400px;

/* CTA Button */
/* Use primary button styling */
```

**Empty state messages:**
- No connections: "Start networking! Scan your first QR code."
- No FizzCoin: "Earn FizzCoins by making connections."
- No notifications: "All caught up! No new notifications."

---

## Screen Designs

### 1. Home / Dashboard

**Layout:**
```
┌─────────────────────────────────────┐
│ [Header]                            │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  FizzCoin Balance           │   │
│  │  💰 1,234                   │   │ ← Hero card
│  │  +12 this week              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌────────┐ ┌────────┐             │
│  │ Share  │ │ Scan   │             │ ← Quick actions
│  │ QR     │ │ QR     │             │
│  └────────┘ └────────┘             │
│                                     │
│  Recent Connections                 │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] John Doe           │   │
│  │         Software Engineer   │   │ ← Connection cards
│  │         📍 San Francisco    │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Jane Smith         │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [Bottom Navigation]                 │
└─────────────────────────────────────┘
```

**Features:**
- Large FizzCoin balance display (gold, glowing)
- Stats: Total connections, weekly earnings
- Quick action buttons (Share QR, Scan QR)
- Recent connections list (scrollable)
- Bottom navigation (mobile)

---

### 2. My FizzCard

**Layout:**
```
┌─────────────────────────────────────┐
│ [Header] My FizzCard                │
├─────────────────────────────────────┤
│                                     │
│        ┌─────────────────┐          │
│        │                 │          │
│        │   [QR Code]     │          │ ← Large QR with glow
│        │                 │          │
│        └─────────────────┘          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar]                    │   │
│  │                             │   │
│  │ John Doe                    │   │
│  │ Software Engineer           │   │
│  │ Acme Inc.                   │   │ ← Profile card
│  │                             │   │
│  │ 📧 john@example.com         │   │
│  │ 📱 +1 555-0123              │   │
│  │ 🌐 johndoe.com              │   │
│  │                             │   │
│  │ [Edit Profile]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Share Button] [Copy Link]        │
│                                     │
├─────────────────────────────────────┤
│ [Bottom Navigation]                 │
└─────────────────────────────────────┘
```

**Features:**
- Large QR code with glowing border
- Editable profile fields
- Social links with icons
- Share button (opens native share sheet)
- Copy link button
- Theme color picker (future)

---

### 3. QR Scanner

**Layout:**
```
┌─────────────────────────────────────┐
│ [Camera View - Full Screen]         │
│                                     │
│                                     │
│        ┌─────────────────┐          │
│        │                 │          │
│        │   [Scan Zone]   │          │ ← Targeting overlay
│        │                 │          │
│        └─────────────────┘          │
│                                     │
│  [Scan line animation]              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📍 San Francisco, CA        │   │ ← Context info
│  │ Oct 23, 2025 2:30 PM        │   │
│  └─────────────────────────────┘   │
│                                     │
│         [Close Button]              │
└─────────────────────────────────────┘
```

**Features:**
- Full-screen camera view
- QR code targeting overlay (cyan border)
- Animated scan line
- Context info (GPS location, timestamp)
- Success animation when QR detected
- Haptic feedback on scan

**Success Animation:**
```
1. QR code detected → Flash cyan glow
2. Show checkmark animation (scale in)
3. Transition to connection request screen
```

---

### 4. Connection Request (Received)

**Layout:**
```
┌─────────────────────────────────────┐
│ [Modal Overlay]                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ New Connection Request      │   │
│  │                             │   │
│  │      [Large Avatar]         │   │
│  │                             │   │
│  │      John Doe               │   │
│  │      Software Engineer      │   │
│  │      Acme Inc.              │   │
│  │                             │   │
│  │ ─────────────────────       │   │
│  │                             │   │
│  │ 📍 Met in: San Francisco   │   │
│  │ 📅 Oct 23, 2025 2:30 PM    │   │
│  │                             │   │
│  │ ─────────────────────       │   │
│  │                             │   │
│  │ 💰 Earn 10 FizzCoins        │   │ ← Reward preview
│  │                             │   │
│  │ [Accept] [Reject]           │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Modal overlay (blurred background)
- Contact preview card
- Context tags (location, date)
- FizzCoin reward preview (gold, glowing)
- Accept/Reject buttons
- Animation on accept (particles, celebration)

**Accept Animation:**
```
1. Button press → Scale down
2. Show FizzCoin particles floating up
3. Number count-up animation
4. Success checkmark
5. Transition to connections list
```

---

### 5. Connections List

**Layout:**
```
┌─────────────────────────────────────┐
│ [Header] Connections                │
│ [Search: "Search connections..."]   │
├─────────────────────────────────────┤
│                                     │
│ [All] [Recent] [Location] [Tags]    │ ← Filter chips
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] John Doe           │   │
│  │         Software Engineer   │   │
│  │         📍 San Francisco    │   │
│  │         📅 Oct 23, 2025     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Avatar] Jane Smith         │   │
│  │         Product Designer    │   │
│  │         📍 New York         │   │
│  │         📅 Oct 20, 2025     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [...more connections...]           │
│                                     │
├─────────────────────────────────────┤
│ [Bottom Navigation]                 │
└─────────────────────────────────────┘
```

**Features:**
- Search bar (sticky at top)
- Filter chips (All, Recent, Location, Tags)
- Connection cards (scrollable grid)
- Each card shows: Avatar, Name, Title, Context
- Connection strength indicator (optional)
- Swipe actions: Message, Delete (mobile)

**Card Hover State (Desktop):**
- Lift effect (translateY -4px)
- Border glow (cyan)
- Scale slightly (1.02)

---

### 6. Wallet / FizzCoin Screen

**Layout:**
```
┌─────────────────────────────────────┐
│ [Header] Wallet                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │         💰                  │   │
│  │      1,234 FizzCoins        │   │ ← Balance hero
│  │                             │   │
│  │  ┌─────────────────────┐   │   │
│  │  │ This week: +12      │   │   │
│  │  └─────────────────────┘   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Recent Activity                    │
│  ┌─────────────────────────────┐   │
│  │ +10 💰 Connection           │   │
│  │ John Doe                    │   │
│  │ Oct 23, 2025 2:30 PM        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ +5 💰 Profile Complete      │   │
│  │ Oct 22, 2025 10:15 AM       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [...more transactions...]          │
│                                     │
├─────────────────────────────────────┤
│ [Bottom Navigation]                 │
└─────────────────────────────────────┘
```

**Features:**
- Large balance display (gold, glowing)
- Weekly earnings summary
- Transaction history (scrollable list)
- Each transaction: Amount, Source, Timestamp
- Earnings breakdown (chart or list)
- Filter by type: Connections, Bonuses, Achievements

**Balance Card Animation:**
- Subtle pulse on page load
- Count-up animation for balance
- Particle effects on new earnings

---

### 7. Leaderboard

**Layout:**
```
┌─────────────────────────────────────┐
│ [Header] Leaderboard                │
│ [Global] [Local] [This Month]       │ ← Filter tabs
├─────────────────────────────────────┤
│                                     │
│  Your Rank: #42 🎯                  │ ← User position
│  ┌─────────────────────────────┐   │
│  │ #42 [Avatar] You            │   │
│  │     1,234 FizzCoins         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Top 100                            │
│  ┌─────────────────────────────┐   │
│  │ #1  [Avatar] Alice          │   │
│  │     💰 9,999 [Badge]        │   │ ← Top 3 highlighted
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ #2  [Avatar] Bob            │   │
│  │     💰 8,888 [Badge]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ #3  [Avatar] Carol          │   │
│  │     💰 7,777 [Badge]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  [...more entries...]               │
│                                     │
├─────────────────────────────────────┤
│ [Bottom Navigation]                 │
└─────────────────────────────────────┘
```

**Features:**
- Filter tabs (Global, Local, This Month)
- User's position highlighted at top
- Top 3 entries with special styling
- Scrollable list (100 entries)
- Each entry: Rank, Avatar, Name, FizzCoin count
- Badges visible (Super-Connector, Top Earner)
- Pull to refresh

**Top 3 Styling:**
- #1: Gold gradient background
- #2: Silver gradient background
- #3: Bronze gradient background

---

### 8. Profile / Settings

**Layout:**
```
┌─────────────────────────────────────┐
│ [Header] Profile                    │
├─────────────────────────────────────┤
│                                     │
│      [Large Avatar]                 │
│      John Doe                       │
│      @johndoe                       │
│      [Edit Profile]                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Stats                       │   │
│  │ 42 Connections              │   │
│  │ 1,234 FizzCoins             │   │
│  │ Rank #42                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Badges                      │   │
│  │ [Super-Connector]           │   │
│  │ [Top Earner] [Verified]     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Settings                           │
│  ┌─────────────────────────────┐   │
│  │ Notifications               │   │
│  │ Privacy                     │   │
│  │ Dark Mode [ON]              │   │
│  │ Help & Support              │   │
│  │ Log Out                     │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [Bottom Navigation]                 │
└─────────────────────────────────────┘
```

**Features:**
- Large avatar with edit button
- Stats card (connections, FizzCoins, rank)
- Badges display
- Settings list
- Privacy controls
- Notification preferences
- Dark mode toggle (default on)
- Log out button

---

## Interaction Patterns

### Hover States

**Cards:**
```css
transition: all 250ms ease-out;

/* Hover */
transform: translateY(-4px) scale(1.02);
border-color: #00D9FF;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(0, 217, 255, 0.2);
```

**Buttons:**
```css
transition: all 200ms ease-out;

/* Hover */
transform: translateY(-2px);
box-shadow: 0 8px 20px rgba(0, 217, 255, 0.5);
```

**Links:**
```css
color: #00D9FF;
transition: color 150ms ease-out;

/* Hover */
color: #5CE2FF;
text-decoration: underline;
```

### Active States

**Buttons:**
```css
/* Active (pressed) */
transform: translateY(0) scale(0.98);
box-shadow: 0 2px 8px rgba(0, 217, 255, 0.4);
```

**Cards:**
```css
/* Active (selected) */
border-color: #00D9FF;
box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2);
```

### Focus States

**Keyboard navigation:**
```css
/* Focus visible */
outline: 2px solid #00D9FF;
outline-offset: 2px;
border-radius: 8px;
```

**Form inputs:**
```css
/* Focus */
border-color: #00D9FF;
box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2);
outline: none;
```

### Touch Interactions

**Tap targets:**
- Minimum size: 44x44px
- Spacing between targets: 8px minimum
- Haptic feedback on important actions

**Swipe actions (mobile):**
- Connection cards: Swipe left for actions
- Reveal: Message, Delete buttons
- Smooth 300ms animation

### Loading States

**Button loading:**
```html
<button disabled>
  <span class="spinner"></span>
  Loading...
</button>
```

**Page loading:**
- Show skeleton screens
- Shimmer animation
- Preserve layout (no content shifts)

**Lazy loading:**
- Infinite scroll for long lists
- Load more trigger at 80% scroll
- Show spinner at bottom

---

## Animation Guidelines

### Micro-Interactions (150-250ms)

**Button press:**
```css
animation: buttonPress 150ms ease-out;

@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
```

**Checkbox toggle:**
```css
transition: all 200ms ease-out;
```

**Icon change:**
```css
transition: transform 200ms ease-out;
```

### Standard Transitions (250-400ms)

**Page transitions:**
```css
animation: fadeIn 300ms ease-out;

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Modal open:**
```css
animation: scaleIn 300ms ease-out;

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

**Card reveal:**
```css
animation: slideUp 400ms ease-out;

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### Celebration Animations (500ms+)

**FizzCoin earning:**
```css
/* Main display */
animation: fizzCoinCelebrate 500ms ease-out;

/* Particles */
.particle {
  animation: floatUp 1000ms ease-out forwards;
}

/* Number count-up */
/* Use JavaScript: countUp.js or similar */
```

**Connection accepted:**
```css
/* Checkmark scale in */
animation: checkmarkAppear 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);

@keyframes checkmarkAppear {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
```

**Achievement unlocked:**
```css
/* Badge bounce in */
animation: bounceIn 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55);

@keyframes bounceIn {
  0% { transform: scale(0) rotate(-180deg); }
  60% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}
```

### Continuous Animations

**QR scan line:**
```css
animation: scanLine 2s linear infinite;

@keyframes scanLine {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
```

**Glow pulse:**
```css
animation: glowPulse 2s ease-in-out infinite;

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.4); }
  50% { box-shadow: 0 0 40px rgba(0, 217, 255, 0.8); }
}
```

**Shimmer (loading):**
```css
background: linear-gradient(90deg, ...);
background-size: 200% 100%;
animation: shimmer 1.5s ease-in-out infinite;

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Animation Best Practices

1. **Performance:**
   - Use `transform` and `opacity` (GPU accelerated)
   - Avoid animating `width`, `height`, `top`, `left`
   - Use `will-change` sparingly

2. **Timing:**
   - Fast interactions: 150-250ms
   - Standard transitions: 250-400ms
   - Celebrations: 500-1000ms
   - Continuous: 1-3s loops

3. **Easing:**
   - Ease-out for entrances
   - Ease-in for exits
   - Ease-in-out for reversible actions
   - Spring/bounce for celebrations

4. **Accessibility:**
   - Respect `prefers-reduced-motion`
   - Provide alternative feedback (haptics, sound)
   - Never rely solely on animation for information

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### Color Contrast

**WCAG AAA compliance:**
- Text on background: 7:1 minimum
- Large text (18px+): 4.5:1 minimum
- UI components: 3:1 minimum

**High contrast mode:**
```css
@media (prefers-contrast: high) {
  /* Increase border widths */
  border-width: 2px;

  /* Increase text weight */
  font-weight: 600;

  /* Remove subtle effects */
  backdrop-filter: none;
}
```

### Keyboard Navigation

**Focus indicators:**
```css
:focus-visible {
  outline: 2px solid #00D9FF;
  outline-offset: 2px;
  border-radius: 8px;
}
```

**Tab order:**
- Logical flow (top to bottom, left to right)
- Skip links for main content
- Modal focus trap

**Keyboard shortcuts:**
- `Cmd/Ctrl + K`: Search
- `Cmd/Ctrl + /`: Shortcuts help
- `Esc`: Close modal/drawer

### Screen Readers

**Semantic HTML:**
```html
<nav aria-label="Main navigation">
<main id="main-content">
<button aria-label="Share QR code">
<img alt="John Doe's profile picture">
```

**ARIA attributes:**
```html
<button aria-pressed="true">
<div role="alert" aria-live="polite">
<input aria-invalid="true" aria-describedby="error-message">
```

**Hidden content:**
```html
<span class="sr-only">New notification</span>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Touch & Pointer

**Target sizes:**
- Minimum: 44x44px (WCAG 2.1 Level AAA)
- Recommended: 48x48px
- Spacing: 8px between targets

**Pointer support:**
```css
/* Coarse (touch) */
@media (pointer: coarse) {
  button {
    min-height: 48px;
    padding: 0 24px;
  }
}

/* Fine (mouse) */
@media (pointer: fine) {
  button {
    min-height: 40px;
  }
}
```

### Motion & Animation

**Reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Alternative feedback:**
- Haptic feedback for touch devices
- Sound effects (with mute option)
- Status messages for screen readers

---

## Responsive Design

### Breakpoints

```css
/* Mobile (default) */
@media (min-width: 320px) { }

/* Large mobile */
@media (min-width: 480px) { }

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large desktop */
@media (min-width: 1280px) { }
```

### Layout Adaptations

**Mobile (< 768px):**
- Single column layout
- Bottom navigation
- Full-width cards
- Stack all content
- Hamburger menu (if needed)

**Tablet (768px - 1023px):**
- 2-column grid for cards
- Side navigation (optional)
- Larger touch targets
- More whitespace

**Desktop (1024px+):**
- 3-4 column grid
- Persistent side navigation
- Hover states
- Keyboard shortcuts
- Larger typography

### Component Adaptations

**Navigation:**
```css
/* Mobile: Bottom nav */
@media (max-width: 767px) {
  .bottom-nav { display: flex; }
  .side-nav { display: none; }
}

/* Desktop: Side nav */
@media (min-width: 768px) {
  .bottom-nav { display: none; }
  .side-nav { display: flex; }
}
```

**Cards:**
```css
/* Mobile: Stack */
@media (max-width: 767px) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* Desktop: 3+ columns */
@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
}
```

**Typography:**
```css
/* Mobile */
h1 { font-size: 30px; }
h2 { font-size: 24px; }
body { font-size: 16px; }

/* Desktop */
@media (min-width: 1024px) {
  h1 { font-size: 48px; }
  h2 { font-size: 36px; }
  body { font-size: 18px; }
}
```

### Images & Media

**Responsive images:**
```html
<img
  srcset="image-320.jpg 320w,
          image-640.jpg 640w,
          image-1280.jpg 1280w"
  sizes="(max-width: 767px) 100vw,
         (max-width: 1023px) 50vw,
         33vw"
  src="image-640.jpg"
  alt="Description"
/>
```

**Background images:**
```css
background-image: url('image-mobile.jpg');

@media (min-width: 768px) {
  background-image: url('image-tablet.jpg');
}

@media (min-width: 1024px) {
  background-image: url('image-desktop.jpg');
}
```

### Touch vs. Mouse

**Hover effects:**
```css
/* Only show hover on devices that support it */
@media (hover: hover) {
  .card:hover {
    transform: translateY(-4px);
  }
}

/* Touch devices: Show on tap/active */
@media (hover: none) {
  .card:active {
    transform: scale(0.98);
  }
}
```

---

## Design Tokens Usage

### Importing Tokens

```typescript
import { colors, typography, spacing, shadows, animation } from '@/styles/design-tokens';

// Use in styled-components
const Button = styled.button`
  background: ${colors.primary[500]};
  font-size: ${typography.fontSize.base};
  padding: ${spacing[4]} ${spacing[6]};
  box-shadow: ${shadows.glow.primary};
  transition: all ${animation.duration.normal} ${animation.easing.easeOut};
`;

// Use in Tailwind config
export default {
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        accent: colors.accent,
        // ...
      },
      fontSize: typography.fontSize,
      spacing: spacing,
      // ...
    },
  },
};
```

### Custom CSS Properties

```css
:root {
  /* Colors */
  --color-primary: #00D9FF;
  --color-accent: #B744FF;
  --color-fizzcoin: #FFD700;

  /* Spacing */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;

  /* Shadows */
  --shadow-glow-primary: 0 0 20px rgba(0, 217, 255, 0.4);

  /* Animation */
  --duration-normal: 250ms;
  --easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

---

## Component Checklist

When implementing a new component, ensure:

- [ ] Matches design tokens (colors, spacing, typography)
- [ ] Dark mode optimized
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Keyboard accessible
- [ ] Screen reader friendly (ARIA labels)
- [ ] Touch-friendly (44x44px minimum)
- [ ] Loading state defined
- [ ] Error state defined
- [ ] Empty state defined
- [ ] Hover effects (desktop)
- [ ] Active/pressed states
- [ ] Focus indicators
- [ ] Smooth animations (respects prefers-reduced-motion)
- [ ] High contrast mode support
- [ ] Documented usage examples

---

## Tools & Resources

### Design Tools
- Figma: UI design & prototyping
- Unsplash: High-quality images
- Iconify: Icon library
- QR Code Generator: Custom branded QR codes

### Development Tools
- Tailwind CSS: Utility-first styling
- shadcn/ui: Component library
- Framer Motion: Advanced animations
- React Spring: Physics-based animations

### Testing Tools
- Accessibility: axe DevTools, WAVE
- Contrast: Contrast Checker
- Performance: Lighthouse, WebPageTest
- Cross-browser: BrowserStack

### Documentation
- Storybook: Component documentation
- Chromatic: Visual regression testing
- Design tokens: Style Dictionary

---

## Version History

**1.0.0** (2025-10-23)
- Initial design system
- Dark mode color palette
- Component library
- Screen designs
- Animation guidelines
- Accessibility standards

---

**Design System maintained by FizzCard Design Team**
