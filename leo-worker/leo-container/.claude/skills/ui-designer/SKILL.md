---
name: ui-designer
description: >
  Create distinctive, production-grade interfaces that avoid generic "AI slop" aesthetics.
  Use when creating design systems, component layouts, or UI specifications.
  Ensures OKLCH colors, mobile responsiveness, accessibility (WCAG 2.2), bold aesthetic choices, and memorable visual moments.
category: implementation
priority: P0
---

# UI Designer

## Design Philosophy

Create interfaces that are **technically excellent AND visually unforgettable**.

**CRITICAL**: Every design must have a BOLD aesthetic direction. Avoid generic AI aesthetics:
- ❌ Generic fonts (Inter, Roboto, Arial, system fonts)
- ❌ Cliché colors (purple gradients on white backgrounds)
- ❌ Cookie-cutter layouts that lack character
- ❌ Predictable component patterns

**REQUIRED**: Choose a clear conceptual direction and execute with precision:
- ✅ Distinctive typography (pair display fonts with refined body fonts)
- ✅ Cohesive color themes (dominant colors with sharp accents)
- ✅ Unexpected layouts (asymmetry, overlap, diagonal flow, grid-breaking)
- ✅ Atmospheric backgrounds (gradient meshes, noise textures, geometric patterns)
- ✅ Memorable micro-interactions (scroll effects, hover states, page load reveals)

**Key Principle**: Bold maximalism and refined minimalism both work — the key is **intentionality**, not intensity.

---

## When to Use

**MANDATORY** when:
- Creating design system files (index.css, tailwind.config.ts)
- Designing component layouts and page structures
- Defining color palettes and design tokens
- User mentions "UI", "design", "components", "styling", "dark mode"

**AUTO-INVOKE** on patterns: "design UI", "create pages", "add component", "style the app"

---

## Design Thinking Process

**Before coding**, understand context and commit to an aesthetic:

1. **Purpose**: What problem does this solve? Who uses it?
2. **Tone**: Pick an extreme aesthetic direction:
   - Brutally minimal, maximalist chaos, retro-futuristic
   - Organic/natural, luxury/refined, playful/toy-like
   - Editorial/magazine, brutalist/raw, art deco/geometric
   - Soft/pastel, industrial/utilitarian, etc.
3. **Differentiation**: What makes this UNFORGETTABLE? The one thing users will remember?

**IMPORTANT**: Vary designs across apps. No two apps should look the same. Different themes, fonts, aesthetics each time.

---

## Core Patterns (12 Critical)

### 1. OKLCH Color Configuration (CRITICAL - Prevents UI Failure)

**Problem**: Using `hsl()` wrapper with OKLCH values causes complete UI breakdown (all white/gray).

```css
/* ❌ WRONG: OKLCH wrapper in CSS variables */
:root {
  --primary: oklch(0.709 0.129 226.02);  /* ❌ Double-wrapping */
}
```

```javascript
// ❌ WRONG: hsl() wrapper in Tailwind
primary: "hsl(var(--primary))"  // Invalid CSS!
```

```css
/* ✅ CORRECT: OKLCH values only in CSS */
:root {
  --primary: 0.709 0.129 226.02;  /* Values only, no wrapper */
  --background: 0.145 0 0;        /* Dark mode */
}
```

```javascript
// ✅ CORRECT: oklch() wrapper in Tailwind
primary: "oklch(var(--primary))"  // Valid OKLCH CSS!
```

**Rule**: CSS variables = values only. Tailwind config = `oklch(var(--variable))`.

---

### 2. 44px Minimum Touch Targets (Mobile Usability)

**Problem**: Touch targets < 44px cause mobile usability failures.

```tsx
// ❌ WRONG: Small icon button
<Button size="icon">  /* Default 40px - too small! */
  <Settings className="h-4 w-4" />
</Button>

// ✅ CORRECT: 44px minimum
<Button size="icon" className="min-h-11 min-w-11">
  <Settings className="h-5 w-5" />
</Button>
```

**Rule**: All interactive elements must be min-h-11 min-w-11 (44px).

---

### 3. Four-State Component Pattern (Loading, Error, Empty, Success)

**Problem**: Missing states create poor UX.

```tsx
// ❌ WRONG: Only success state
function TaskList() {
  const { data } = useQuery({ queryKey: ['tasks'] });
  return <div>{data?.map(task => <Task {...task} />)}</div>;
}

// ✅ CORRECT: All 4 states
function TaskList() {
  const { data, isLoading, error } = useQuery({ queryKey: ['tasks'] });

  if (isLoading) return <Skeleton count={3} />;  // Loading state
  if (error) return <ErrorState retry={() => refetch()} />;  // Error state
  if (!data?.length) return <EmptyState onCreate={...} />;  // Empty state
  return <div>{data.map(task => <Task {...task} />)}</div>;  // Success state
}
```

**Rule**: Every data-fetching component needs all 4 states.

---

### 4. Mobile-First Responsive Design (375px+)

**Problem**: Desktop-first breaks on mobile.

```tsx
// ❌ WRONG: Desktop-first (breaks on mobile)
<div className="flex">  /* Always horizontal */
  <Sidebar />
  <Content />
</div>

// ✅ CORRECT: Mobile-first with breakpoints
<div className="flex flex-col md:flex-row">  /* Stacks mobile, side-by-side desktop */
  <Sidebar className="md:w-64" />
  <Content className="flex-1" />
</div>

// ✅ Navigation transform
<nav>
  {/* Mobile: Hamburger menu */}
  <Button size="icon" className="md:hidden min-h-11 min-w-11">
    <Menu />
  </Button>

  {/* Desktop: Full nav */}
  <div className="hidden md:flex gap-4">
    <NavLink />
    <NavLink />
  </div>
</nav>
```

**Rule**: Start mobile (375px), progressively enhance with md: (768px) and lg: (1024px).

---

### 5. WCAG 2.2 Accessibility (4.5:1 Contrast, Keyboard Nav, ARIA)

**Problem**: Inaccessible UIs exclude users.

```tsx
// ❌ WRONG: Icon button without label
<Button size="icon">
  <Settings />
</Button>

// ✅ CORRECT: ARIA label + screen reader text
<Button size="icon" aria-label="Settings">
  <Settings />
  <span className="sr-only">Settings</span>
</Button>

// ✅ Focus indicators
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Save
</Button>
```

**Rule**: All interactive elements need ARIA labels, focus indicators, and keyboard support.

---

### 6. Design Token System (Consistent Spacing, Typography, Shadows)

**Problem**: Arbitrary values create inconsistent design.

```css
/* ❌ WRONG: Arbitrary values */
.card { padding: 18px; font-size: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }

/* ✅ CORRECT: Use tokens */
.card { @apply p-4 text-base shadow-sm; }  /* From design system */
```

**Rule**: Always use Tailwind tokens (p-4, text-base, shadow-sm) never arbitrary values.

---

### 7. Semantic Color Usage (Primary, Destructive, Success, etc.)

**Problem**: Generic colors don't convey meaning.

```tsx
// ❌ WRONG: Generic "red" button
<Button className="bg-red-500">Delete</Button>

// ✅ CORRECT: Semantic "destructive" variant
<Button variant="destructive">Delete Account</Button>

// ✅ Success feedback
<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Changes saved.</AlertDescription>
</Alert>
```

**Rule**: Use semantic colors (destructive, success, warning, info) not generic (red, green, yellow, blue).

---

### 8. Typography & Font Pairing (Character & Hierarchy)

**Problem**: Generic fonts (Inter, Roboto, Arial) create forgettable interfaces.

```css
/* ❌ WRONG: Generic system font stack */
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif; }

/* ✅ CORRECT: Distinctive font pairing with Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');

body {
  font-family: 'DM Sans', sans-serif;  /* Clean, refined body */
}

h1, h2, h3 {
  font-family: 'Space Mono', monospace;  /* Distinctive, technical display */
}
```

**Pairing Strategies**:
- **Serif + Sans**: Playfair Display (headings) + Inter (body) = Editorial elegance
- **Mono + Sans**: Space Mono (headings) + DM Sans (body) = Technical/modern
- **Display + Geometric**: Bebas Neue (headings) + Raleway (body) = Bold/clean
- **Handwritten + Sans**: Caveat (headings) + Open Sans (body) = Personal/friendly

**Rule**: NEVER use the same font pairings across apps. Vary between serif, sans, mono, display fonts based on aesthetic direction.

---

### 9. Visual Depth & Layered Effects (Atmosphere & Dimension)

**Problem**: Flat designs lack visual interest and memorable moments.

```tsx
// ❌ WRONG: Flat, single-layer design
<div className="bg-primary/10 rounded-lg p-6">
  <Icon className="h-8 w-8 text-primary" />
</div>

// ✅ CORRECT: Layered effects with glow
<div className="relative">
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
    <Icon className="w-8 h-8 text-white" />
  </div>
  <div className="absolute inset-0 blur-xl bg-purple-500/30 -z-10"></div>  {/* Glow effect */}
</div>

// ✅ CORRECT: Full-screen immersive hero
<section className="relative min-h-[90vh]">
  <div className="absolute inset-0">
    <img src="..." className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/80 to-slate-900/95"></div>
  </div>
  <div className="relative z-10">{/* Content */}</div>
</section>
```

**Layering Techniques**:
- Gradient meshes (`bg-gradient-to-br from-purple-600 to-blue-600`)
- Blur effects (`blur-xl bg-purple-500/30`)
- Multiple shadows (`shadow-lg shadow-purple-500/50`)
- Backdrop blur (`backdrop-blur-md`)
- Noise textures (CSS patterns or SVG)

**Rule**: Create depth through layering. Every important element should have at least 2 visual layers.

---

### 10. Circular Gradient Badges (Playful Icons)

**Problem**: Square flat containers look corporate and boring.

```tsx
// ❌ WRONG: Flat square container
<div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
  <Icon className="h-7 w-7 text-primary" />
</div>

// ✅ CORRECT: Circular gradient badge
<div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
  <Icon className="h-7 w-7 text-white" />
</div>

// ✅ BETTER: With glow effect
<div className="relative">
  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center shadow-xl">
    <Icon className="h-7 w-7 text-white" />
  </div>
  <div className="absolute inset-0 blur-lg bg-teal-500/40 -z-10 animate-pulse"></div>
</div>
```

**Gradient Combinations** (vary per component):
```tsx
from-purple-600 to-blue-600   // Purple → Blue
from-blue-600 to-cyan-600     // Blue → Cyan
from-cyan-600 to-teal-600     // Cyan → Teal
from-teal-600 to-green-600    // Teal → Green
from-orange-600 to-red-600    // Orange → Red
from-pink-600 to-purple-600   // Pink → Purple
```

**Rule**: Use circular badges for icons. Vary gradient combinations across the page to create visual interest.

---

### 11. Motion & Micro-Interactions (Delight & Feedback)

**Problem**: Static interfaces feel lifeless and unresponsive.

```tsx
// ❌ WRONG: No animations
<Button>Click me</Button>

// ✅ CORRECT: Hover and active states
<Button className="transition-all hover:scale-105 hover:shadow-xl active:scale-95">
  Click me
</Button>

// ✅ BETTER: Page load animations with stagger
<div className="space-y-4">
  {features.map((feature, i) => (
    <Card
      key={i}
      className="animate-fade-in-up opacity-0"
      style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
    >
      {feature.content}
    </Card>
  ))}
</div>

// Add to index.css:
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}
```

**Animation Priorities**:
1. **Page load reveals**: Staggered fade-in-up for cards/features (high impact)
2. **Hover states**: Scale, shadow, color transitions
3. **Icon animations**: Pulse, bounce, rotate
4. **Scroll indicators**: Bounce animation
5. **Active states**: Scale down on click

**Rule**: Focus on 1-2 high-impact page load animations rather than scattered micro-interactions everywhere.

---

### 12. Brand Color Themes (Cohesive Identity)

**Problem**: Generic blue theme makes every app look the same.

**Theme Examples** (pick ONE per app):

```css
/* Purple Tech Theme */
:root {
  --primary: 0.680 0.180 300.00;      /* Purple */
  --accent: 0.620 0.200 260.00;       /* Blue */
  --background: 0.145 0.020 290.00;   /* Dark purple */
}

/* Teal Modern Theme */
:root {
  --primary: 0.620 0.150 180.00;      /* Teal */
  --accent: 0.650 0.170 200.00;       /* Cyan */
  --background: 0.145 0.015 190.00;   /* Dark teal */
}

/* Orange Energy Theme */
:root {
  --primary: 0.680 0.180 40.00;       /* Orange */
  --accent: 0.650 0.190 60.00;        /* Amber */
  --background: 0.145 0.025 30.00;    /* Dark orange */
}

/* Pink Playful Theme */
:root {
  --primary: 0.700 0.190 350.00;      /* Pink */
  --accent: 0.680 0.180 320.00;       /* Magenta */
  --background: 0.145 0.020 340.00;   /* Dark pink */
}

/* Green Natural Theme */
:root {
  --primary: 0.600 0.160 140.00;      /* Green */
  --accent: 0.650 0.170 170.00;       /* Teal-green */
  --background: 0.145 0.018 150.00;   /* Dark green */
}
```

**Rule**: Choose a BOLD theme color (not blue!) based on app personality. Use hue shifting (±20-40°) for accent colors.

---

## Workflow

### New App (Create)
1. **Read requirements** → Understand entities and workflows from plan.md
2. **Read contracts** → Understand data shape from contracts/*.contract.ts
3. **Create index.css** → OKLCH colors, design tokens, typography scale
4. **Create tailwind.config.ts** → oklch() wrappers, extend theme
5. **Plan pages** → List view, detail view, create/edit for each entity
6. **Design components** → Apply all 7 patterns
7. **Validate** → Run checklist before completing

### Existing App (Modify)
1. **Read existing** → index.css, tailwind.config.ts, pages, components
2. **Identify change** → ADD/MODIFY/DELETE component or page
3. **Preserve existing** → Keep all unmodified components and pages
4. **Apply patterns** → Ensure new/modified components follow 7 patterns
5. **Validate** → Check patterns still apply across all components

---

## Templates

### Complete index.css with OKLCH Colors
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* OKLCH VALUES ONLY - No wrapper! */
    --primary: 0.709 0.129 226.02;       /* Deep Blue */
    --primary-foreground: 0.985 0 0;     /* White */

    --secondary: 0.897 0.02 247.87;      /* Light Gray */
    --secondary-foreground: 0.205 0 0;   /* Dark */

    --accent: 0.897 0.02 247.87;
    --accent-foreground: 0.205 0 0;

    --destructive: 0.579 0.22 27.33;     /* Red */
    --destructive-foreground: 0.985 0 0;

    --success: 0.598 0.18 147.39;        /* Green */
    --success-foreground: 0.985 0 0;

    --warning: 0.795 0.19 70.08;         /* Amber */
    --warning-foreground: 0.205 0 0;

    --info: 0.658 0.17 218.25;           /* Blue */
    --info-foreground: 0.985 0 0;

    /* Surface Colors */
    --background: 1 0 0;                 /* White */
    --foreground: 0.145 0 0;             /* Dark */
    --card: 1 0 0;
    --card-foreground: 0.145 0 0;
    --popover: 1 0 0;
    --popover-foreground: 0.145 0 0;

    /* Component Colors */
    --border: 0.922 0 0;                 /* Light Gray */
    --input: 0.922 0 0;
    --ring: 0.709 0.129 226.02;          /* Blue */
    --muted: 0.897 0.02 247.87;
    --muted-foreground: 0.459 0 0;

    --radius: 0.5rem;

    /* Chart Colors */
    --chart-1: 0.594 0.21 16.47;         /* Orange */
    --chart-2: 0.598 0.18 147.39;        /* Green */
    --chart-3: 0.709 0.129 226.02;       /* Blue */
    --chart-4: 0.795 0.19 70.08;         /* Amber */
    --chart-5: 0.658 0.17 218.25;        /* Cyan */
  }
}

/* ✅ CRITICAL: Dark mode OUTSIDE @layer to prevent tree-shaking in production */
.dark {
  /* Dark Mode - Different lightness values */
  --primary: 0.709 0.129 226.02;
  --primary-foreground: 0.205 0 0;

  --secondary: 0.27 0 0;               /* Dark Gray */
  --secondary-foreground: 0.985 0 0;

  --accent: 0.27 0 0;
  --accent-foreground: 0.985 0 0;

  --destructive: 0.579 0.22 27.33;
  --destructive-foreground: 0.985 0 0;

  --success: 0.598 0.18 147.39;
  --success-foreground: 0.985 0 0;

  --warning: 0.795 0.19 70.08;
  --warning-foreground: 0.205 0 0;

  --info: 0.658 0.17 218.25;
  --info-foreground: 0.985 0 0;

  /* Dark Surfaces */
  --background: 0.145 0 0;             /* Deep Dark */
  --foreground: 0.985 0 0;             /* Off-White */
  --card: 0.145 0 0;
  --card-foreground: 0.985 0 0;
  --popover: 0.145 0 0;
  --popover-foreground: 0.985 0 0;

  /* Dark Components */
  --border: 0.27 0 0;
  --input: 0.27 0 0;
  --ring: 0.709 0.129 226.02;
  --muted: 0.27 0 0;
  --muted-foreground: 0.741 0 0;
}

/* Typography scale with fluid sizing */
@layer base {
  html {
    font-size: clamp(14px, 0.875rem + 0.25vw, 16px);
  }

  h1 { font-size: clamp(1.75rem, 2vw + 1rem, 2.25rem); }
  h2 { font-size: clamp(1.5rem, 1.75vw + 0.875rem, 1.875rem); }
  h3 { font-size: clamp(1.25rem, 1.5vw + 0.75rem, 1.5rem); }
}
```

### Complete tailwind.config.ts

**File**: `client/tailwind.config.ts`

**CRITICAL**: Content paths must be relative to **PROJECT ROOT** (where PostCSS runs), NOT relative to client/

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './client/index.html',                 // ✅ Relative to project root
    './client/src/**/*.{js,ts,jsx,tsx}',   // ✅ Relative to project root
  ],
  theme: {
    extend: {
      colors: {
        /* OKLCH WRAPPER - Not hsl()! */
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "oklch(var(--success))",
          foreground: "oklch(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "oklch(var(--warning))",
          foreground: "oklch(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "oklch(var(--info))",
          foreground: "oklch(var(--info-foreground))",
        },
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        chart: {
          '1': "oklch(var(--chart-1))",
          '2': "oklch(var(--chart-2))",
          '3': "oklch(var(--chart-3))",
          '4': "oklch(var(--chart-4))",
          '5': "oklch(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
```

### Complete postcss.config.js (CRITICAL for Production)

**REQUIRED**: Create at **PROJECT ROOT** to prevent Vite working directory issues.

**File**: `postcss.config.js` (at project root, NOT in client/)

```javascript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  plugins: {
    // ✅ CRITICAL: Point to Tailwind config in client/ directory
    tailwindcss: { config: join(__dirname, 'client/tailwind.config.ts') },
    autoprefixer: {},
  },
};
```

**Why This Matters**:
- Vite's `root: './client'` makes PostCSS run from PROJECT ROOT
- PostCSS config MUST be at root to be found by Vite
- Config explicitly points to `client/tailwind.config.ts`
- Without this: ZERO utility classes generated (broken styling)

**Validation**:
```bash
npm run build
grep -c "rounded-lg" client/dist/assets/*.css  # Must return 1+
```

---

### Complete Four-State Component
```tsx
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileX, Plus } from 'lucide-react';

export function TaskList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.tasks.list()
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="font-semibold mb-2">Failed to load tasks</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </Card>
    );
  }

  // Empty state
  if (!data?.body?.length) {
    return (
      <Card className="p-12 text-center">
        <FileX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
        <p className="text-muted-foreground mb-6">Get started by creating your first task</p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </Card>
    );
  }

  // Success state
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.body.map(task => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{task.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{task.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Responsive Navigation with 44px Touch Targets
```tsx
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="font-bold text-xl">App Name</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="/tasks" className="hover:text-primary transition-colors">
              Tasks
            </a>
            <a href="/settings" className="hover:text-primary transition-colors">
              Settings
            </a>
          </div>

          {/* Mobile Menu Button - 44px minimum */}
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden min-h-11 min-w-11"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <a href="/dashboard" className="py-2 hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="/tasks" className="py-2 hover:text-primary transition-colors">
                Tasks
              </a>
              <a href="/settings" className="py-2 hover:text-primary transition-colors">
                Settings
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
```

---

## Validation

**MANDATORY: Run validation after designing UI**

### Quick Validation (30 seconds)

```bash
# Pattern 1: OKLCH Configuration
grep "oklch(" client/src/index.css && echo "❌ ERROR: Found oklch() in CSS variables" || echo "✅ CSS variables use values only"
grep "hsl(var(--" tailwind.config.ts && echo "❌ ERROR: Using hsl() wrapper" || echo "✅ No hsl() wrappers"
grep -c "oklch(var(--" tailwind.config.ts  # Expected: 10+ matches

# Pattern 2: 44px Touch Targets
grep -r "min-h-11\|min-w-11" client/src  # Expected: All icon buttons

# Pattern 3: Four States
grep -r "isLoading" client/src/pages  # Expected: All data-fetching pages
grep -r "error" client/src/pages      # Expected: All data-fetching pages
grep -r "!data?.length\|!data?.body?.length" client/src/pages  # Expected: All list pages

# Pattern 4: Mobile Responsive
grep -r "md:flex\|md:block\|md:hidden" client/src  # Expected: Mobile-first patterns
grep -r "grid-cols-1 sm:grid-cols-2" client/src    # Expected: Responsive grids

# Pattern 5: Accessibility
grep -r "aria-label" client/src  # Expected: All icon buttons
grep -r "sr-only" client/src     # Expected: Screen reader text
```

### Manual Checklist

- [ ] OKLCH colors: Values only in CSS, oklch() wrapper in Tailwind
- [ ] All interactive elements 44px minimum (min-h-11 min-w-11)
- [ ] All data-fetching components have 4 states (loading, error, empty, success)
- [ ] Works from 375px width (mobile-first)
- [ ] All icon buttons have aria-label or sr-only text
- [ ] Focus indicators visible (focus-visible:ring-2)
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Text contrast 4.5:1 (WCAG 2.2 Level AA)
- [ ] Design tokens used (no arbitrary values)
- [ ] Semantic colors (destructive, success) not generic (red, green)

---

## Common Mistakes

1. **hsl() wrapper with OKLCH values** → Complete UI failure (all white/gray), 2+ hours debugging
2. **Touch targets < 44px** → Mobile usability issues, frustrated users
3. **Missing loading/error/empty states** → Poor UX, confused users
4. **Desktop-first responsive** → Breaks on mobile devices (50%+ users)
5. **Missing ARIA labels on icon buttons** → Accessibility violations, excludes users
6. **Arbitrary values instead of tokens** → Inconsistent design, unprofessional look
7. **Generic colors instead of semantic** → Unclear meaning, poor UX

---

## Time Saved

Following these patterns prevents 5+ hours debugging per app:
- **OKLCH misconfiguration**: 2+ hours (complete UI breakdown, "all white")
- **Mobile usability issues**: 1+ hour (touch target fixes across all pages)
- **Missing states**: 1+ hour (adding error/empty handling retroactively)
- **Accessibility violations**: 1+ hour (ARIA labels, keyboard nav, contrast fixes)

---

## Reference Apps

Generated UIs MUST match reference quality:
- **EchoLens** - Voice analytics dashboard
- **FunnelSight** - Conversion funnel analytics
- **AdFlux** - Advertising dashboard

**Quality bar**: Professional polish, smooth interactions, comprehensive state handling, mobile-responsive (375px+), accessible (WCAG 2.2 Level AA).
