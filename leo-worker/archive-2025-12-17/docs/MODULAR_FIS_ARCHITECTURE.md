# Modular Frontend Interaction Spec Architecture
**Date: 2025-10-03**
**Problem: 32K Output Token Limit, Solution: DRY Modular Specifications**

## Executive Summary

**Problem**: Frontend Interaction Spec generation hits the 32,000 output token limit when trying to document a comprehensive application in a single file.

**Root Cause**: Massive redundancy - same patterns repeated for every page, every component, every interaction.

**Solution**: Apply DRY (Don't Repeat Yourself) principle using a **Master Spec + Page Spec** architecture inspired by design token systems.

**Result**:
- ✅ Stay within token limits (each file <8K tokens)
- ✅ Enable parallel implementation
- ✅ Maintain consistency ("designed by the same hand")
- ✅ Preserve ASTOUNDING quality
- ✅ Reduce generation cost by ~60%

## Current Problem Analysis

### Token Breakdown (2125-line FIS)
```
Total: ~45,000-50,000 tokens (exceeds 32K OUTPUT limit)

IMPORTANT: The 32K limit is per SINGLE GENERATION OUTPUT, not per file.
- A single agent generating one massive FIS file hits the limit
- Multiple agents each generating separate files can exceed 32K total
- Our solution: Split into Master (7K) + Pages (1.2K each) = separate generations

Redundancy Analysis:
- 84 sections (pages/components)
- 29 useQuery pattern examples (~1,500 tokens)
- 9 useMutation pattern examples (~600 tokens)
- Repeated design principles per page (~3,000 tokens)
- Repeated API integration patterns (~2,000 tokens)
- Repeated error handling per component (~1,500 tokens)
- Repeated responsive breakpoints (~1,000 tokens)

Estimated Redundancy: ~40% of total tokens
```

### What Gets Repeated
1. **API Patterns** - useQuery/useMutation boilerplate (29+ times)
2. **Design Principles** - ASTOUNDING aesthetic repeated per component
3. **Error Handling** - Same error patterns for each interaction
4. **Loading States** - Skeleton screens pattern repeated
5. **Responsive Design** - Breakpoint behavior per component
6. **Accessibility** - ARIA patterns repeated
7. **State Management** - React Query setup per page

## New Architecture: The Pyramid Model

Inspired by Design Token Systems (Foundation → Semantic → Component)

```
┌─────────────────────────────────────────────┐
│         MASTER SPECIFICATION                │
│  (Foundation + Semantic Patterns)           │
│                                             │
│  - Design System (ASTOUNDING principles)    │
│  - API Integration Patterns                 │
│  - Component Patterns (reusable)           │
│  - Error Handling Strategies                │
│  - State Management Patterns                │
│  - Navigation Architecture                  │
│                                             │
│  Estimated: 5,000-7,000 tokens             │
└─────────────────────────────────────────────┘
                     ▼
         References (not copies)
                     ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Page 1  │  │  Page 2  │  │  Page 3  │  │  Page N  │
│   Spec   │  │   Spec   │  │   Spec   │  │   Spec   │
│          │  │          │  │          │  │          │
│ Browse   │  │ Details  │  │ Booking  │  │Dashboard │
│ Chapels  │  │ Page     │  │ Flow     │  │          │
│          │  │          │  │          │  │          │
│ 800-1500 │  │ 800-1500 │  │1200-2000 │  │ 800-1500 │
│  tokens  │  │  tokens  │  │  tokens  │  │  tokens  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

## File Structure

### 1. Master Specification
**File**: `specs/frontend-interaction-spec-master.md`
**Size**: ~5,000-7,000 tokens
**Purpose**: Define once, reference everywhere

**Contents**:

#### 1.1 Application Overview
- Purpose and target audience
- Core value proposition
- User personas
- Navigation architecture (sitemap)

#### 1.2 Design System (ASTOUNDING Principles)
```markdown
## Design System

### Foundation Tokens
- Colors: #0A0A0B (bg-primary), #18181B (bg-secondary), #3B82F6 (accent)
- Typography: Inter 400/700, line-height 1.6
- Spacing: 4/8/16/32/64/128px (8px grid)
- Radius: 8/12/16px
- Shadows: Defined glassmorphism patterns

### Component Patterns
Define each pattern ONCE with clear naming:
- `<GlassCard>` - Standard glassmorphic card
- `<PrimaryCTA>` - Neon gradient call-to-action
- `<SkeletonLoader>` - Loading state pattern
- `<ErrorBoundary>` - Error handling wrapper

### Responsive Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

Behavior defined once, referenced by pages.
```

#### 1.3 API Integration Patterns
```markdown
## API Integration Patterns

### Query Pattern (GET requests)
**Pattern ID**: `QUERY_PATTERN`
\`\`\`typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['entity', filters],
  queryFn: async () => {
    const result = await apiClient.entity.getEntities({ query: filters });
    if (result.status === 200) return result.body;
    throw new Error('Failed to fetch');
  }
});
\`\`\`

### Mutation Pattern (POST/PUT/DELETE)
**Pattern ID**: `MUTATION_PATTERN`
\`\`\`typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const result = await apiClient.entity.createEntity({ body: data });
    if (result.status === 201) return result.body;
    throw new Error('Failed to create');
  },
  onSuccess: () => queryClient.invalidateQueries(['entity'])
});
\`\`\`

Pages reference these by ID, not by copying code.
```

#### 1.4 State Management Strategy
- React Query configuration
- Cache invalidation rules
- Optimistic update patterns
- Form state with react-hook-form

#### 1.5 Error Handling Strategy
- Network errors
- API validation errors
- 404/500 handling
- Retry mechanisms

#### 1.6 Accessibility Standards
- WCAG AAA requirements
- Keyboard navigation
- Screen reader patterns
- Focus management

### 2. Page Specifications
**Files**: `specs/pages/[page-name].md`
**Size**: 800-2,000 tokens each
**Purpose**: Page-specific details that reference master patterns

**Template**:
```markdown
# [Page Name] - Page Specification

**Route**: /path/to/page
**References**: frontend-interaction-spec-master.md

## Page Purpose
Brief description of page goal and user intent.

## Layout
Uses: `<GlassCard>` pattern (see Master Spec §1.2)
Grid: 3-column on lg+, 1-column on mobile

## Components

### Component 1: Chapel List
- **Pattern**: Uses `QUERY_PATTERN` (Master Spec §1.3)
- **API**: apiClient.chapels.getChapels
- **Design**: `<GlassCard>` pattern
- **States**:
  - Loading: `<SkeletonLoader>` (Master Spec)
  - Error: `<ErrorBoundary>` (Master Spec)
- **Interactions**:
  - Hover: Apply elevation-hover (Master Spec §1.2)
  - Click: Navigate to detail page

### Component 2: Search Filter
- **Pattern**: Uses `QUERY_PATTERN` with debounce
- **API**: apiClient.chapels.searchChapels
- **Design**: Dark input with accent glow on focus
- **Validation**: Min 2 characters

## Page-Specific Behavior
Only unique behaviors not covered by master patterns.

## API Integration Summary
| Component | Pattern | API Method |
|-----------|---------|------------|
| Chapel List | QUERY_PATTERN | chapels.getChapels |
| Search | QUERY_PATTERN | chapels.searchChapels |
| Filter | QUERY_PATTERN | chapels.filter |
```

## Implementation Workflow

### Phase 1: Generate Master Spec
```
Agent: FrontendInteractionSpecMasterAgent
Input: plan.md, schema.ts, contracts/, design-requirements.md
Output: frontend-interaction-spec-master.md
Tokens: ~7,000 (well within limit)
```

### Phase 2: Generate Page Specs (Parallel)
```
Agent: FrontendInteractionSpecPageAgent
Runs in parallel for each page:
  - Input: plan.md, master-spec.md, page-requirements
  - Output: specs/pages/browse-chapels.md
  - Tokens: ~1,200 per page

Total for 8 pages: ~9,600 tokens (parallelizable)
```

### Phase 3: Frontend Implementation
```
Agent: FrontendImplementationAgent
For each page:
  1. Read master spec for patterns
  2. Read page spec for specific requirements
  3. Generate components referencing both

Enables parallel implementation across pages.
```

## Token Estimates

### Old Approach (Monolithic)
```
Single FIS: 45,000-50,000 tokens
Result: FAILS (exceeds 32K OUTPUT limit for single generation)
Cost: $0.67 for failed attempt
Limit: ~7 pages maximum before hitting output limit
```

### New Approach (Modular)
```
Master Spec: 7,000 tokens (single generation)
Page Specs: 1,200 tokens each (separate generations)

8-page app:
- Master: 7,000 tokens (1 generation)
- Pages: 1,200 × 8 = 9,600 tokens total (8 separate generations)
- Combined total: 16,600 tokens
- Each individual generation: < 7,000 tokens ✅ Well under 32K limit

100-page app:
- Master: 7,000 tokens (1 generation)
- Pages: 1,200 × 100 = 120,000 tokens total (100 separate generations)
- Each individual generation: < 7,000 tokens ✅ Still under 32K limit
- NO LIMIT on total pages!

Generation Cost (8 pages):
- Master: $0.10 (one-time)
- Pages: $0.02 × 8 = $0.16 (parallelizable)
Total Cost: $0.26 (62% reduction vs. failed monolithic)

Scalability: UNLIMITED pages (each page is independent generation)
```

## Consistency Mechanisms

### 1. Pattern Registry
Master spec maintains a registry of reusable patterns:
```
- QUERY_PATTERN → Standard GET request with React Query
- MUTATION_PATTERN → Standard POST/PUT/DELETE
- GLASS_CARD → Glassmorphic card design
- PRIMARY_CTA → Neon gradient button
- SKELETON_LOADER → Loading state
- ERROR_BOUNDARY → Error handling wrapper
```

### 2. Design Token References
Page specs reference design tokens, never redefine:
```
Color: $accent-blue (not #3B82F6)
Spacing: $space-lg (not 32px)
Typography: $heading-xl (not 48px bold)
```

### 3. Component Naming Convention
```
<ChapelCard> → Uses GLASS_CARD pattern
<BookingCTA> → Uses PRIMARY_CTA pattern
<ChapelListSkeleton> → Uses SKELETON_LOADER pattern
```

### 4. Cross-Page Verification
Each page spec includes:
```markdown
## Cross-Page Consistency Check
- [ ] Uses master design tokens
- [ ] References API patterns by ID
- [ ] No duplicate pattern definitions
- [ ] Follows accessibility standards
```

## Migration Plan

### Step 1: Update FIS Agent Architecture
Create two new agents:
1. `FrontendInteractionSpecMasterAgent` - Generates master spec
2. `FrontendInteractionSpecPageAgent` - Generates page specs

### Step 2: Update System Prompts
**Master Agent**:
```
You are generating the MASTER specification that defines:
1. Design system patterns (define once)
2. API integration patterns (define once)
3. Component patterns (define once)
4. Error/loading/state patterns (define once)

Do NOT include page-specific details.
Focus on reusable patterns that pages will reference.
```

**Page Agent**:
```
You are generating a PAGE specification that:
1. References patterns from master spec (never redefines)
2. Includes only page-specific details
3. Uses pattern IDs (QUERY_PATTERN, GLASS_CARD, etc.)
4. Stays under 2,000 tokens

CRITICAL: Reference, don't repeat. Use "See Master Spec §X.Y" format.
```

### Step 3: Update Build Stage
```python
# Old: Single FIS generation
fis_result = await fis_agent.generate_interaction_spec()

# New: Master + Page specs
master_result = await fis_master_agent.generate_master_spec()

page_results = await asyncio.gather(*[
    fis_page_agent.generate_page_spec(page_name)
    for page_name in pages
])
```

### Step 4: Update Frontend Implementation Agent
```python
# Read both master and page specs
master_spec = read_file("specs/frontend-interaction-spec-master.md")
page_spec = read_file(f"specs/pages/{page_name}.md")

# Generate components using both
components = await implementation_agent.generate_components(
    master_patterns=master_spec,
    page_details=page_spec
)
```

## Benefits

### 1. Scalability
- **10-page app**: 7K (master) + 12K (pages) = 19K total ✅
- **20-page app**: 7K (master) + 24K (pages) = 31K total ✅
- **100-page app**: 7K (master) + 120K (pages) = 127K total ✅
- **Unlimited pages**: Each page is a separate generation (1.2K output), no total limit! ✅
- **Monolithic**: Single generation hits 32K output limit at ~7 pages ❌

**Key Insight**: The 32K limit is per single agent output, not per total generated content.
With separate page generations, there's NO PRACTICAL LIMIT on the number of pages!

### 2. Parallel Implementation
```
Traditional: Page 1 → Page 2 → Page 3 (sequential, slow)
Modular: Page 1 ∥ Page 2 ∥ Page 3 (parallel, 3x faster)
```

### 3. Consistency
- Master spec ensures all pages use same patterns
- No "drift" between page implementations
- "Designed by the same hand" guarantee

### 4. Maintainability
- Update pattern once in master → affects all pages
- Easy to add new pages (just reference master)
- Clear separation of concerns

### 5. Cost Reduction
- 63% cheaper token generation
- No failed attempts wasting money
- Parallel generation reduces time

## Example: Timeless Weddings App

### Master Spec (6,800 tokens)
```markdown
# Frontend Interaction Spec - Master

## 1. Application Overview
Timeless Weddings - Chapel booking platform...

## 2. Design System
### ASTOUNDING Principles
[Define once: dark theme, glassmorphism, spacing grid, colors, typography]

### Component Patterns
- GLASS_CARD: [CSS and behavior]
- PRIMARY_CTA: [Neon gradient button]
- CHAPEL_CARD: Extends GLASS_CARD with chapel-specific layout
...

## 3. API Integration Patterns
QUERY_PATTERN: [useQuery template]
MUTATION_PATTERN: [useMutation template]
...

## 4. State Management
[React Query config, cache strategy]

## 5. Navigation
/browse, /chapel/:id, /book/:id, /dashboard
```

### Page Specs (1,200 tokens each × 7 pages = 8,400 tokens)

**browse-chapels.md** (1,150 tokens):
```markdown
# Browse Chapels Page

Route: /browse
Uses: Master Spec patterns

## Components
### ChapelGrid
- Pattern: QUERY_PATTERN (Master §3.1)
- API: chapels.getChapels
- Design: CHAPEL_CARD (Master §2.2)
- Unique: Grid layout 3-col on lg+

### SearchBar
- Pattern: QUERY_PATTERN with debounce
- API: chapels.search
- Design: Dark input (Master §2.3)
```

**chapel-detail.md** (1,300 tokens):
```markdown
# Chapel Detail Page

Route: /chapel/:id
Uses: Master Spec patterns

## Components
### ChapelHero
- Pattern: QUERY_PATTERN
- API: chapels.getChapel
- Design: Full-width hero with overlay
- Unique: Unsplash integration specific to this page

### PackageList
- Pattern: QUERY_PATTERN
- API: packages.getPackages
- Design: GLASS_CARD grid
```

... (5 more page specs)

**Total: 6,800 + 8,400 = 15,200 tokens (well within limits!)**

## Success Criteria

✅ **Token Limit Compliance**
- Master spec: <8,000 tokens (single output)
- Each page spec: <2,000 tokens (per output)
- **No limit on total pages** - each page is a separate generation!
- Each individual generation well under 32K output limit

✅ **Pattern Reusability**
- 0 duplicate pattern definitions
- All pages reference master patterns

✅ **Consistency Verification**
- All pages use same design tokens
- All pages use same API patterns
- All pages follow same accessibility standards

✅ **Implementation Readiness**
- Frontend agent can implement from specs
- No ambiguity in requirements
- Parallel implementation possible

✅ **ASTOUNDING Quality**
- Design excellence maintained
- All aesthetic principles preserved
- User experience not compromised

## Next Steps

1. **Create Master Agent** - Implement FrontendInteractionSpecMasterAgent
2. **Create Page Agent** - Implement FrontendInteractionSpecPageAgent
3. **Update Build Stage** - Orchestrate master + page generation
4. **Update Frontend Agent** - Read both spec types
5. **Test with Timeless Weddings** - Verify token limits and quality
6. **Document Patterns** - Maintain pattern registry in master spec

## Appendix: Pattern Naming Conventions

### Design Patterns
- `GLASS_CARD` - Glassmorphic card
- `PRIMARY_CTA` - Primary call-to-action button
- `SECONDARY_CTA` - Secondary button
- `DARK_INPUT` - Dark theme input field
- `SKELETON_LOADER` - Loading skeleton
- `ERROR_BOUNDARY` - Error wrapper
- `HERO_SECTION` - Full-width hero
- `GRID_LAYOUT_3COL` - 3-column responsive grid

### API Patterns
- `QUERY_PATTERN` - Standard useQuery
- `MUTATION_PATTERN` - Standard useMutation
- `PAGINATED_QUERY` - Query with pagination
- `SEARCH_QUERY` - Query with debounced search
- `OPTIMISTIC_UPDATE` - Optimistic mutation

### State Patterns
- `FORM_STATE` - react-hook-form setup
- `MODAL_STATE` - Modal open/close state
- `FILTER_STATE` - Filter/search state
- `AUTH_STATE` - Authentication state

These IDs are referenced but never redefined, ensuring DRY compliance.
