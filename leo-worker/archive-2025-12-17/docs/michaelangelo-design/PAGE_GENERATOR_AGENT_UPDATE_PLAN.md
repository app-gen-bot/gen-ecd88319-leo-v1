# Page Generator Agent Update Plan

**Date**: October 5, 2025
**Problem**: Page generator agents are not using ASTOUNDING design principles
**Root Cause**: Agents read outdated design requirements document

---

## Problem Analysis

### Current State

The page generator agent (`src/app_factory_leonardo_replit/agents/page_generator/system_prompt.py`) references:
```
docs/design-best-practices/design-requirements.md
```

This file has **OUTDATED** design guidance:
- ❌ Accent Color: ONE vibrant color (e.g., #3B82F6 blue) - **WRONG!**
- ❌ Missing STATUS_BADGE pattern
- ❌ Missing EMPTY_STATE pattern
- ❌ Missing TAB_NAVIGATION pattern
- ❌ Missing GRADIENT_METRIC_CARD pattern
- ❌ Missing 5 semantic status colors
- ❌ Missing gradient definitions
- ❌ No reference to FIS master spec

### What We Updated

We successfully updated the **FIS generation agents**:
- `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_master/system_prompt.py` ✅
- `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_page/system_prompt.py` ✅

These now produce ASTOUNDING specifications with:
- ✅ Purple (#8B5CF6) primary accent
- ✅ 5 status colors
- ✅ 3 gradients
- ✅ STATUS_BADGE, EMPTY_STATE, TAB_NAVIGATION, GRADIENT_METRIC_CARD patterns

### What We DIDN'T Update

The **frontend implementation agents** that generate actual React code:
- `src/app_factory_leonardo_replit/agents/page_generator/` ❌
- `src/app_factory_leonardo_replit/agents/main_page_generator/` ❌
- `src/app_factory_leonardo_replit/agents/multi_page_generator/` ❌
- `src/app_factory_leonardo_replit/agents/frontend_implementation/` ❌

These still read the old design requirements!

---

## Solution

### Option 1: Update design-requirements.md (Quick Fix)

**Pros**:
- Single file to update
- Agents already reference it
- Minimal code changes

**Cons**:
- Duplicates information from ASTOUNDING reference
- Two sources of truth (design-requirements.md + ASTOUNDING_DESIGN_REFERENCE_FOR_AGENTS.md)

### Option 2: Update Agent System Prompts (Better)

**Pros**:
- Single source of truth (ASTOUNDING_DESIGN_REFERENCE_FOR_AGENTS.md + FIS master spec)
- Agents read from generated FIS specs
- DRY principle

**Cons**:
- Must update multiple agent system prompts
- More changes required

### Option 3: Hybrid Approach (RECOMMENDED)

**Combination**:
1. Update `design-requirements.md` with ASTOUNDING principles
2. Add reference to FIS master spec in page generator prompts
3. Instruct agents to read `specs/frontend-interaction-spec-master.md` for pattern definitions

**Why Best**:
- Backwards compatible
- Single source of truth for patterns (FIS master spec)
- Agents can work with or without FIS
- Clear hierarchy: FIS spec > design-requirements.md

---

## Implementation Plan

### Step 1: Update design-requirements.md

**File**: `/docs/design-best-practices/design-requirements.md`

**Changes**:
```markdown
### Color System
PRIMARY PALETTE (Dark Mode First):
- Background Primary: #0A0A0B (near-black)
- Background Secondary: #18181B (charcoal)
- Background Tertiary: #27272A (dark gray)
- Text Primary: #FFFFFF (pure white)
- Text Secondary: #A1A1AA (muted gray)

ACCENT COLORS (ASTOUNDING Purple Theme):
- Primary Accent: #8B5CF6 (vibrant PURPLE - use for primary CTAs)
- Secondary Accent: #3B82F6 (royal blue - use for secondary accents)
- Tertiary Accent: #EC4899 (hot pink - use in gradients)

STATUS COLORS (Semantic Meaning):
- Confirmed: #10B981 (emerald green)
- Completed: #3B82F6 (blue)
- Paid: #8B5CF6 (purple)
- Pending: #F59E0B (amber)
- Cancelled: #EF4444 (red)

GRADIENTS:
- Hero: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)
- CTA: linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)
- Metric: linear-gradient(to right, #8B5CF6, #EC4899)
```

**Add Section**:
```markdown
### Critical Component Patterns

**STATUS_BADGE**:
For any entity with a status field, display a color-coded badge:
- Confirmed: bg-emerald-600 text-white
- Completed: bg-blue-600 text-white
- Paid: bg-purple-600 text-white
- Pending: bg-amber-600 text-white
- Cancelled: bg-red-600 text-white

**EMPTY_STATE**:
For any list/grid that can be empty, show:
- Icon: 64px, gray-600
- Message: Explain why empty + what user can do
- CTA: Primary action button (if applicable)

**TAB_NAVIGATION**:
For detail pages with 3+ content sections:
- Horizontal tabs with counts
- Active state: border-b-2 border-purple-600, text-white, font-semibold
- Inactive state: text-gray-400, hover:text-gray-300

**GRADIENT_METRIC_CARD**:
For dashboard key metrics/countdowns:
- Background: gradient-metric (purple to pink)
- Large metric value: text-4xl font-bold
- Description text below
```

### Step 2: Update Page Generator System Prompt

**File**: `src/app_factory_leonardo_replit/agents/page_generator/system_prompt.py`

**Add After Line 32**:
```python
## CRITICAL: ASTOUNDING Design Principles

**PRIMARY DESIGN REFERENCE**: Read `specs/frontend-interaction-spec-master.md` for complete pattern definitions.

If FIS master spec exists, it is the AUTHORITATIVE source for:
1. Color system (purple primary #8B5CF6, status colors, gradients)
2. Component patterns (STATUS_BADGE, EMPTY_STATE, TAB_NAVIGATION, GRADIENT_METRIC_CARD)
3. Typography (800 weight heroes, 700 weight headings)
4. Spacing system
5. API integration patterns

**FALLBACK**: If FIS master spec doesn't exist, use `docs/design-best-practices/design-requirements.md`

**MANDATORY PATTERN USAGE**:
- Entity cards with status → MUST use STATUS_BADGE
- Empty lists → MUST use EMPTY_STATE
- Detail pages with 3+ sections → MUST use TAB_NAVIGATION
- Dashboard pages → MUST include GRADIENT_METRIC_CARD

**PATTERN IMPLEMENTATION**: Read the pattern definition from FIS master spec and implement EXACTLY as specified with all styling details.
```

### Step 3: Update Other Implementation Agents

**Files to Update**:
- `src/app_factory_leonardo_replit/agents/main_page_generator/system_prompt.py`
- `src/app_factory_leonardo_replit/agents/multi_page_generator/system_prompt.py`
- `src/app_factory_leonardo_replit/agents/frontend_implementation/system_prompt.py` (if exists)

**Add Same Section** as Step 2.

### Step 4: Update Page Generator User Prompt

**File**: `src/app_factory_leonardo_replit/agents/page_generator/user_prompt.py`

**Add to prompt builder**:
```python
def create_user_prompt(...):
    prompt = f"""
Generate the {page_name} component.

**DESIGN REFERENCE**: Read `specs/frontend-interaction-spec-master.md` and `specs/pages/{page_name.lower()}.md` for complete requirements.

**CRITICAL PATTERNS TO IMPLEMENT**:
1. If page spec mentions STATUS_BADGE → Implement with exact colors from master spec
2. If page spec mentions EMPTY_STATE → Implement with icon + message + CTA structure
3. If page spec mentions TAB_NAVIGATION → Implement with purple active border
4. If page spec mentions GRADIENT_METRIC_CARD → Implement with purple-pink gradient

**COLOR SYSTEM**:
- Primary accent: #8B5CF6 (purple) for all CTAs
- Status colors: Use exact values from master spec
- Gradients: Use exact definitions from master spec

Read the page specification carefully and implement ALL components exactly as specified.
"""
```

---

## Testing After Updates

### Validation Checklist

After regenerating pages, verify:

**HomePage**:
- [ ] Hero section has full-viewport height
- [ ] Primary CTA is purple (#8B5CF6) with gradient
- [ ] Hero heading is 72px with 800 weight
- [ ] Featured chapels grid shows 6 chapel cards
- [ ] Chapel cards use GLASS_CARD pattern
- [ ] EMPTY_STATE shown when no chapels

**DashboardPage**:
- [ ] Welcome header shows user name
- [ ] GRADIENT_METRIC_CARD for countdown (purple-pink gradient)
- [ ] Quick stats use GLASS_CARD pattern
- [ ] Booking cards have STATUS_BADGE
- [ ] EMPTY_STATE when no bookings

**BookingDetailPage**:
- [ ] Back button in header
- [ ] STATUS_BADGE in page header
- [ ] TAB_NAVIGATION with Overview/Chapel/Package tabs
- [ ] Purple active border on active tab
- [ ] Two-column layout (content + sidebar)
- [ ] EMPTY_STATE for empty sections

**Visual Comparison**:
- [ ] Purple primary accent everywhere (not blue)
- [ ] Bold typography (800 for heroes, 700 for headings)
- [ ] Generous spacing (64px between sections)
- [ ] Status badges color-coded
- [ ] Empty states have icons and CTAs

---

## Rollback Plan

If updates cause issues:

```bash
# Revert design-requirements.md
git checkout HEAD -- docs/design-best-practices/design-requirements.md

# Revert page generator prompts
git checkout HEAD -- src/app_factory_leonardo_replit/agents/page_generator/system_prompt.py
git checkout HEAD -- src/app_factory_leonardo_replit/agents/page_generator/user_prompt.py
git checkout HEAD -- src/app_factory_leonardo_replit/agents/main_page_generator/system_prompt.py
git checkout HEAD -- src/app_factory_leonardo_replit/agents/multi_page_generator/system_prompt.py
```

---

## Success Metrics

**Before**:
- Blue (#3B82F6) primary accent
- No status badges
- No empty states
- No tab navigation
- No gradient metric cards
- 40% visual parity with reference apps

**After (Target)**:
- Purple (#8B5CF6) primary accent
- STATUS_BADGE on all entity cards
- EMPTY_STATE for all empty lists
- TAB_NAVIGATION on detail pages
- GRADIENT_METRIC_CARD on dashboard
- 85-90% visual parity with reference apps

---

**Status**: Plan ready for implementation
**Next Step**: Execute Step 1 (Update design-requirements.md)
