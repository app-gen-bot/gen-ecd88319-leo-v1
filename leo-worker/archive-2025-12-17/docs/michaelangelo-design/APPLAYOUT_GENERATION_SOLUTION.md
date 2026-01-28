# AppLayout Generation Solution

**Date**: October 5, 2025
**Problem**: Existing AppLayout is a "relic" using old design patterns (blue primary, old CSS variables)
**Solution**: Generate AppLayout from FIS Master Spec with ASTOUNDING design principles

---

## Problem Analysis

### Current AppLayout Issues
1. **Old Design Tokens**: Uses `rgb(var(--accent-primary))` instead of purple #8B5CF6
2. **No Purple Gradient**: Logo doesn't use ASTOUNDING gradient branding
3. **Generic Styling**: Missing glassmorphism effects and bold ASTOUNDING aesthetic
4. **Not Referenced in Specs**: No pattern definition in FIS master spec

### Why This Matters
- AppLayout is the FIRST thing users see on every page
- Sets the tone for entire application
- Must exemplify ASTOUNDING design principles
- Navigation and auth UI must be visually consistent with rest of app

---

## Solution Architecture

### Where AppLayout Fits in Generation Pipeline

```
User Prompt
    ↓
FIS Master Spec Generation → Defines NAVIGATION_HEADER pattern
    ↓
Layout Component Generation → Generates AppLayout.tsx from pattern
    ↓
Page Generation → Pages wrap content with <AppLayout>
```

### Three-Part Solution

#### 1. FIS Master Spec Pattern Definition ✅ COMPLETE

**File**: `/apps/timeless-weddings-phase1/app/specs/frontend-interaction-spec-master.md`

Added `NAVIGATION_HEADER` pattern (lines 388-467) with:
- Usage: "ALL PAGES" - Global navigation wrapper
- Implementation: Wrap all pages with `<AppLayout>` component
- Visual Design: Complete ASTOUNDING specification
- Features: Sticky header, purple gradient logo, auth UI, mobile menu, footer
- Tailwind Classes: Exact implementation examples
- Required: "ALL pages without exception"

**Key Features Specified**:
```tsx
// Logo with ASTOUNDING purple gradient
<span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
  Timeless Weddings
</span>

// Sticky header with glassmorphism
<header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(24,24,27,0.8)] backdrop-blur-xl">

// Primary CTA with purple gradient
<button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg">
  Sign up
</button>
```

#### 2. Page Generator Mandate ✅ COMPLETE

**File**: `/src/app_factory_leonardo_replit/agents/page_generator/system_prompt.py`

**Changes Made**:

1. **Task Requirements** (lines 28):
   - Changed from "Uses shared layout components" to "MANDATORY: Wraps content with AppLayout"
   - First requirement (most important)

2. **AppLayout Wrapper Section** (lines 62-84):
   - Title: "CRITICAL - AppLayout Wrapper (NON-NEGOTIABLE)"
   - Exact implementation pattern with import and wrapper
   - Lists benefits: navigation, auth, mobile menu, footer, branding
   - Exception clause: "Only skip if page spec explicitly states 'No AppLayout needed'"

**Implementation Pattern**:
```tsx
import { AppLayout } from '@/components/layout/AppLayout';

export function PageName() {
  return (
    <AppLayout>
      {/* Your page-specific content */}
    </AppLayout>
  );
}
```

#### 3. Layout Component Generator (TODO)

**Need**: Agent to generate AppLayout.tsx from NAVIGATION_HEADER pattern

**Options**:

**Option A: Create New Layout Generator Agent**
- Pros: Clean separation of concerns, dedicated agent
- Cons: Adds complexity, another agent to maintain
- Implementation: New agent in `/agents/layout_generator/`

**Option B: Reuse Component Generator**
- Pros: Leverages existing component generation logic
- Cons: Component generator may be focused on page components
- Implementation: Extend existing component generator

**Option C: Generate During App Shell Stage**
- Pros: Fits in existing pipeline (app shell generates base structure)
- Cons: App shell generator was deprecated
- Implementation: May need to resurrect or create new shell stage

**Recommended: Option A - New Layout Generator Agent**

Rationale:
1. AppLayout is foundational - deserves dedicated agent
2. Runs once per app (not per page) - minimal overhead
3. Can validate against NAVIGATION_HEADER pattern in master spec
4. Clear responsibility: "Generate layout components from FIS patterns"

---

## Layout Generator Agent Specification

### Agent Responsibilities
1. Read FIS Master Spec NAVIGATION_HEADER pattern
2. Generate AppLayout.tsx component with ASTOUNDING design
3. Implement all features: sticky header, gradient logo, auth UI, mobile menu, footer
4. Use exact Tailwind classes from pattern
5. Integrate with useAuth hook for authentication
6. Write to `/client/src/components/layout/AppLayout.tsx`

### System Prompt Key Points
```python
SYSTEM_PROMPT = """You are the Layout Component Generator for Leonardo App Factory.

## Task
Generate the AppLayout component based on the NAVIGATION_HEADER pattern from FIS Master Spec.

## Requirements
1. Read `specs/frontend-interaction-spec-master.md`
2. Find NAVIGATION_HEADER pattern definition
3. Implement AppLayout component with EXACT specifications:
   - Sticky header with glassmorphism
   - Logo with purple gradient (from-purple-600 to-pink-600)
   - Navigation links (Home, Chapels, + authenticated routes)
   - Auth UI (Sign In/Sign Up buttons OR user dropdown)
   - Mobile hamburger menu with slide-out sheet
   - Footer with copyright and PlanetScale attribution

## Tech Stack
- React 18 + TypeScript
- Wouter for routing
- Tailwind CSS with ASTOUNDING purple theme
- shadcn/ui components (Sheet, DropdownMenu, Button)
- useAuth hook from @/hooks/useAuth

## ASTOUNDING Design Principles
- Purple primary (#8B5CF6) for all CTAs and active states
- Gradient logo: from-purple-600 to-pink-600
- Glassmorphism: backdrop-blur-xl with rgba backgrounds
- Sticky positioning for always-visible navigation
- Responsive: Desktop nav + mobile hamburger

## Output
Write complete AppLayout.tsx to client/src/components/layout/AppLayout.tsx
"""
```

### When to Run
- **After**: FIS Master Spec generated (NAVIGATION_HEADER pattern exists)
- **Before**: Page generation starts (pages need AppLayout to import)
- **Frequency**: Once per app

### Integration Point
Add to Build Stage after schema/storage generation, before page generation:

```python
# In build_stage.py
async def run_build_stage(app_dir: Path) -> AgentResult:
    # 1. Generate schema
    # 2. Generate storage
    # 3. Generate routes
    # 4. ✅ NEW: Generate layout components
    layout_result = await generate_layout_components(app_dir)
    if not layout_result.success:
        return layout_result

    # 5. Generate pages (pages now use AppLayout)
    # ...
```

---

## Migration Strategy

### For Existing Apps

**Timeless Weddings Phase 1** (Current App):

1. **Delete Old AppLayout** (optional - will be overwritten):
   ```bash
   rm apps/timeless-weddings-phase1/app/client/src/components/layout/AppLayout.tsx
   ```

2. **Generate New AppLayout**:
   - Run layout generator agent (once created)
   - OR manually create from NAVIGATION_HEADER pattern

3. **Regenerate Pages**:
   - Delete existing pages
   - Run page generator (will now wrap with AppLayout)

4. **Verify**:
   - Check all pages import AppLayout
   - Check navigation header visible on all pages
   - Check purple gradient logo
   - Check auth UI works

### For New Apps

AppLayout will be generated automatically:
1. FIS Master Spec defines NAVIGATION_HEADER pattern
2. Layout Generator creates AppLayout.tsx
3. Page Generator wraps all pages with AppLayout

---

## Verification Checklist

After AppLayout generation and page regeneration:

### AppLayout Component
- [ ] File exists at `client/src/components/layout/AppLayout.tsx`
- [ ] Imports React, Wouter, useAuth, shadcn components
- [ ] Exports `AppLayout` function accepting `children` prop
- [ ] Logo uses purple gradient (`from-purple-600 to-pink-600`)
- [ ] Header has glassmorphism (`backdrop-blur-xl`)
- [ ] Navigation links: Home, Chapels
- [ ] Auth UI: Sign In + Sign Up buttons (or user dropdown if authenticated)
- [ ] Mobile menu: Hamburger → Sheet with navigation
- [ ] Footer: Copyright + "Powered by PlanetScale"
- [ ] All Tailwind classes match NAVIGATION_HEADER pattern

### Page Integration
- [ ] HomePage imports AppLayout
- [ ] HomePage wraps content with `<AppLayout>{children}</AppLayout>`
- [ ] LoginPage imports and wraps with AppLayout
- [ ] ChapelsPage imports and wraps with AppLayout
- [ ] DashboardPage imports and wraps with AppLayout
- [ ] All other pages import and wrap with AppLayout

### Visual Verification (Browser)
- [ ] Navigation header visible at top of all pages
- [ ] Logo gradient visible (purple to pink)
- [ ] Header sticky (stays visible on scroll)
- [ ] "Home" and "Chapels" links work
- [ ] "Sign In" and "Sign up" buttons visible (when not authenticated)
- [ ] User dropdown visible (when authenticated)
- [ ] Mobile menu works (hamburger → slide-out)
- [ ] Footer visible at bottom with PlanetScale attribution

---

## Current Status

### ✅ Complete
1. FIS Master Spec NAVIGATION_HEADER pattern defined
2. Page Generator updated to mandate AppLayout wrapper
3. Solution architecture documented

### 🔄 In Progress
- FIS generation still running (background process)
- Need to monitor and verify NAVIGATION_HEADER pattern in output

### ⏳ TODO
1. **Create Layout Generator Agent**:
   - Agent wrapper class
   - System prompt referencing NAVIGATION_HEADER
   - Config with allowed tools (Read, Write, Grep, Glob)
   - Domain method: `generate_app_layout()`

2. **Integrate into Build Stage**:
   - Add layout generation step before page generation
   - Ensure AppLayout exists before pages generated

3. **Generate New AppLayout**:
   - Run layout generator on timeless-weddings-phase1
   - Verify ASTOUNDING design (purple gradient, glassmorphism)

4. **Regenerate Pages**:
   - Delete existing pages (HomePage, LoginPage, etc.)
   - Run page generator (will wrap with AppLayout)

5. **Visual Verification**:
   - Start dev server
   - Test navigation on all pages
   - Verify purple branding throughout

---

## Expected Results

### Before Fix
- ❌ No navigation header on pages
- ❌ No way to navigate between pages
- ❌ No auth UI visible
- ❌ Users stuck on landing page
- ⚠️ Visual parity: 60%

### After Fix
- ✅ Navigation header on ALL pages
- ✅ Purple gradient logo ("Timeless Weddings")
- ✅ Working navigation links (Home, Chapels)
- ✅ Auth UI (Sign In / Sign Up buttons)
- ✅ User dropdown when authenticated
- ✅ Mobile responsive menu
- ✅ Footer with PlanetScale attribution
- ✅ Sticky header (always visible)
- ✅ Visual parity: 95%+

---

## Implementation Priority

**Priority**: 🔴 **CRITICAL** - Must implement before any user testing

**Rationale**:
- Blocks all navigation
- Blocks authentication flow
- Makes app unusable as a multi-page application
- First impression (header/logo) sets tone for entire app

**Effort**: Medium (2-3 hours)
- Create layout generator agent: 1 hour
- Generate AppLayout: 15 minutes
- Regenerate pages: 30 minutes
- Testing and verification: 30 minutes

**Impact**: Extremely High
- Completes ASTOUNDING design implementation
- Enables full app navigation
- Achieves visual parity with reference apps
- Makes app production-ready

---

**Next Steps**: Create Layout Generator Agent and integrate into Build Stage
**Status**: Ready for implementation
**Owner**: Leonardo Pipeline Development Team
