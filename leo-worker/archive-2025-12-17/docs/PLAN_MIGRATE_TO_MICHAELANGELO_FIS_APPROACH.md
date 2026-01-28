# Plan: Migrate to Michaelangelo FIS Approach
## Simplifying Frontend Interaction Spec Generation

**Date**: October 5, 2025
**Author**: Claude (Opus)
**Purpose**: Replace overcomplicated modular FIS generation with simpler, more effective approach from michaelangelo-happyllama-new-stack-validated branch

---

## Executive Summary

The current modular FIS generation system (`modular-fis-on-7960c030`) is overcomplicating design specifications, resulting in ugly, overengineered designs. The `michaelangelo-happyllama-new-stack-validated` branch has a much simpler approach that produces beautiful, clean designs. We need to migrate to that approach while keeping only one addition: API contract integration.

### Key Problems with Current System

1. **Overcomplicated Design Specs**: ASTOUNDING principles, gradient obsession, fictional "2035 aesthetic"
2. **Two-Stage Generation**: Separate master spec + page specs creates unnecessary complexity
3. **Pattern Overload**: Too many abstract patterns instead of concrete specifications
4. **Wrong Focus**: Focused on creating reusable patterns instead of clear interaction flows
5. **Poor Results**: Generated designs don't match reference sites, look gaudy and unprofessional

### What Michaelangelo Branch Does Right

1. **Single-Stage Generation**: One comprehensive FIS document that covers everything
2. **Concrete Over Abstract**: Specific interactions instead of pattern libraries
3. **User Flow Focus**: Clear navigation and interaction mapping
4. **Simplicity**: Direct, clear specifications without overengineering
5. **Beautiful Results**: Clean, professional designs that match references

---

## Detailed Analysis

### Current System (modular-fis-on-7960c030)

#### Structure
```
Frontend Interaction Spec Master Agent
├── Reads: plan.md, schema.zod.ts, contracts/
├── Generates: frontend-interaction-spec-master.md (8000 tokens)
├── Defines: ASTOUNDING principles, pattern library
└── Output: Abstract patterns for page specs to reference

Frontend Interaction Spec Page Agent (x9 pages)
├── Reads: master spec, contracts
├── Generates: Individual page specs (2000 tokens each)
├── References: Master patterns by ID
└── Output: Page-specific implementations
```

#### Problems in System Prompts

**Master Agent (`frontend_interaction_spec_master/system_prompt.py`)**:
- Lines 5-20: Obsession with "ASTOUNDING design principles"
- Lines 56-111: Overcomplicated foundation tokens with gradients everywhere
- Lines 172-189: Too many abstract patterns (17+ patterns)
- Lines 63-84: Wrong color priorities (purple gradients, pink accents)
- Focus on creating reusable pattern library instead of actual UI

**Page Agent (`frontend_interaction_spec_page/system_prompt.py`)**:
- Forced to reference abstract patterns
- Can't deviate from master spec
- Results in cookie-cutter pages
- No flexibility for page-specific needs

### Reference System (michaelangelo-happyllama-new-stack-validated)

#### Structure
```
Stage 1 Interaction Spec Agent
├── Reads: Business PRD
├── Generates: Complete interaction specification
├── Focus: User flows, navigation, concrete interactions
└── Output: Single comprehensive document
```

#### What Works in System Prompt

**Stage 1 Agent (`stage_1_interaction_spec/interaction_spec/system_prompt.py`)**:
- Lines 7-13: Focus on user flows and interaction patterns
- Lines 58-89: **Complete Navigation & Interaction Map** (CRITICAL)
- Lines 91-97: Key principles: exhaustive, specific, consistent
- Lines 100-109: Common patterns applied concretely
- No abstract pattern libraries, just clear specifications

**Key Section (Lines 58-89)**: Complete Navigation & Interaction Map
- Documents EVERY route/URL
- Specifies EVERY clickable element
- Maps ALL interactions to destinations
- Includes all dropdowns, menus, modals
- Prevents broken links and 404s

---

## Reconciliation Strategy: Merging Master + Page Specs

### What Each Approach Provides

**Master Spec (Current System)**:
- Design tokens and foundation
- Reusable patterns
- Global navigation structure
- Consistent styling rules
- API integration patterns

**Page Specs (Current System)**:
- Page-specific interactions
- Individual user flows
- Detailed component behavior
- Page-level API calls

**Stage 1 (Michaelangelo)**:
- Complete interaction flows
- Navigation mapping
- Concrete specifications
- User journey focus

### The Reconciliation: Best of All Worlds

We need to **merge** these approaches, not replace one with another:

1. **Keep from Master**: API contract patterns, basic design tokens (colors, spacing)
2. **Keep from Pages**: Detailed interactions per page
3. **Add from Michaelangelo**: Complete navigation mapping, concrete specifications
4. **Remove**: ASTOUNDING complexity, excessive patterns, two-stage generation

### New Unified Structure

```
Single Frontend Interaction Spec Document
├── Part 1: Foundation (from Master, simplified)
│   ├── Basic design tokens (colors, spacing, typography)
│   ├── API integration patterns
│   └── Common UI patterns (buttons, forms, cards)
│
├── Part 2: Navigation (from Michaelangelo)
│   ├── Complete route inventory
│   ├── Interactive element catalog
│   └── Menu and dropdown mappings
│
└── Part 3: Page Details (from Page specs, inline)
    ├── Page 1: Layout, interactions, API calls
    ├── Page 2: Layout, interactions, API calls
    └── ... all pages in one document
```

## Migration Plan

### Phase 1: Reconcile and Simplify System Prompts

#### 1.1 Create New Unified FIS Agent

**Location**: `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_unified/`

**System Prompt Structure (Reconciled)**:
```python
SYSTEM_PROMPT = """You are an expert Frontend Interaction Specification designer.
Your role is to create a SINGLE comprehensive specification that combines
foundation patterns, navigation mapping, and detailed page interactions.

## Your Mission
Transform application plans into a unified specification that developers
can implement directly - no interpretation needed, no patterns to look up.

## Document Structure You Must Follow

### Part 1: Foundation (Minimal, Essential Only)
Define these ONCE at the start, then reference throughout:

1. **Core Design Tokens** (Simple, no gradients):
   - Primary colors (background, text, accent)
   - Typography scale (base size, headings)
   - Spacing units (sm, md, lg, xl)
   - Border radius values

2. **API Patterns** (How to call backend):
   - Query pattern (GET requests)
   - Mutation pattern (POST/PUT/DELETE)
   - Error handling pattern
   - Loading state pattern

3. **Basic Components** (5-6 max):
   - Button (primary, secondary)
   - Input field
   - Card container
   - Modal/Dialog
   - Navigation menu

### Part 2: Complete Navigation Map (CRITICAL)
This prevents broken links and 404s:

1. **Route Inventory**:
   - List EVERY URL path
   - Mark public vs protected
   - Include dynamic routes (/item/:id)
   - Always include /404 and /error

2. **Interactive Element Catalog**:
   For EVERY clickable thing, specify:
   - Element text/label
   - Destination or action
   - Which page it appears on

3. **Menu Structures**:
   - Main navigation → all destinations
   - User menu → all options
   - Settings → all sections
   - Any dropdowns → all items

### Part 3: Page Specifications (All inline)
For EACH page in the application:

**[Page Name] - [Route]**

1. **Purpose**: One sentence what this page does

2. **Layout**:
   - Component arrangement
   - Responsive behavior

3. **User Interactions**:
   - What users see
   - What they can click/type/select
   - What happens when they do
   - Where it takes them

4. **API Calls**:
   - Contract: contractName.methodName
   - When: On load/on submit/on click
   - Request: What we send
   - Response: What we get back
   - Error: How we handle failures

5. **States**:
   - Loading: What shows while fetching
   - Empty: What shows with no data
   - Error: What shows on failure
   - Success: Confirmation messages

## Critical Rules

1. **Be Concrete**: "Sign In button in top right" not "PRIMARY_CTA pattern"
2. **Be Complete**: If it's not specified, it won't exist
3. **Be Consistent**: Similar actions work similarly
4. **Include API Details**: Every data fetch needs contract method
5. **Think Mobile**: Define mobile behavior for everything

## What NOT to Include

- Abstract pattern definitions
- ASTOUNDING design principles
- Gradient specifications
- Complex animation details
- Separate master/page documents
- Pattern IDs to reference

## Remember

You're writing THE specification. One document. Complete.
Developers will build EXACTLY what you write, nothing more, nothing less.
"""
```

#### 1.2 User Prompt Updates

**Remove**:
- ASTOUNDING design references
- Pattern library requirements
- Master/page split approach
- Abstract component definitions

**Add**:
- API contract integration section
- Contract-to-UI mapping
- Data flow specifications

### Phase 2: Remove Complexity

#### 2.1 Eliminate Two-Stage Generation

**Current**: Master Spec → Page Specs
**New**: Single Unified Spec

**Benefits**:
- Simpler mental model
- Faster generation
- More coherent output
- Easier to modify

#### 2.2 Remove ASTOUNDING References

**Delete or Archive**:
- `/docs/michaelangelo-design/ASTOUNDING_DESIGN_REFERENCE_FOR_AGENTS.md` references
- Gradient obsession
- "2035 aesthetic" mentions
- Bold typography requirements (72px/800 weight)

**Replace With**:
- Clean, professional design
- Reference actual deployed sites
- Extract design from screenshots
- Simple, readable typography

### Phase 3: Implementation Changes

#### 3.1 Update run_modular_fis.py

**Current Flow**:
```python
# Step 1: Generate Master Spec
master_agent.generate_master_spec()

# Step 2: Extract pages
pages = extract_pages_from_spec()

# Step 3: Generate each page spec
for page in pages:
    page_agent.generate_page_spec(page)
```

**New Flow**:
```python
# Single Step: Generate Complete FIS
unified_agent.generate_interaction_spec(
    plan_content=plan,
    schema_content=schema,
    contracts_content=contracts
)
```

#### 3.2 Agent Configuration

**New Config Structure**:
```python
AGENT_CONFIG = {
    "name": "Frontend Interaction Spec Unified",
    "model": "sonnet",  # Fast and effective
    "allowed_tools": ["Read", "Write", "Grep", "Glob"],
    "max_turns": 15,    # Single generation needs fewer turns
    "max_tokens": 12000  # Single doc instead of 8000 + (2000 * 9)
}
```

### Phase 4: Content Structure

#### 4.1 Reconciled FIS Document Structure

Here's exactly how the new unified document should look:

```markdown
# Frontend Interaction Specification

## Part 1: Foundation

### Design Tokens
- Background: #0F172A (dark slate)
- Card Background: #1E293B
- Text Primary: #FAFAFA
- Text Secondary: #94A3B8
- Accent: #8B5CF6 (purple)
- Success: #10B981
- Error: #EF4444
- Font: Inter
- Base Size: 16px
- Heading Sizes: 48px (h1), 36px (h2), 24px (h3)
- Spacing: 8px (sm), 16px (md), 24px (lg), 32px (xl)
- Radius: 8px (default), 12px (large)

### API Patterns
**Query Pattern**:
- Use contractName.methodName()
- Show loading spinner while fetching
- Display error message on failure
- Cache for 5 minutes

**Mutation Pattern**:
- Disable submit button while processing
- Show success toast on completion
- Display validation errors inline
- Redirect on success where applicable

### Basic Components
**Button Primary**: Purple background, white text, 8px radius
**Button Secondary**: Transparent, white border, white text
**Input Field**: Dark background, light border, white text
**Card**: Dark slate background, subtle border, 12px radius
**Modal**: Centered overlay, dark background, close button

## Part 2: Complete Navigation Map

### Routes Inventory
**Public Routes**:
- `/` - Homepage
- `/chapels` - Browse all chapels
- `/chapels/:id` - Chapel details
- `/packages` - Browse packages
- `/login` - Login page
- `/signup` - Registration page

**Protected Routes**:
- `/dashboard` - User dashboard
- `/bookings` - My bookings
- `/bookings/create` - Create booking
- `/bookings/:id` - Booking details
- `/profile` - User profile
- `/settings` - Account settings

**Utility Routes**:
- `/404` - Not found page
- `/error` - Error page

### Interactive Elements Catalog

**Main Navigation** (appears on all pages):
- "Timeless" logo → `/`
- "Venues" → `/chapels`
- "Packages" → `/packages`
- "Sign In" → `/login` (when logged out)
- User avatar → dropdown menu (when logged in)

**User Dropdown Menu**:
- "Dashboard" → `/dashboard`
- "My Bookings" → `/bookings`
- "Profile" → `/profile`
- "Settings" → `/settings`
- "Sign Out" → Logout action, redirect to `/`

**Chapel Card** (on /chapels page):
- Entire card → `/chapels/:id`
- "Book Now" button → `/chapels/:id#booking`

## Part 3: Page Specifications

### Homepage - `/`

**Purpose**: Landing page showcasing wedding venues and packages

**Layout**:
- Navigation header
- Hero section with image and CTA
- Featured chapels grid (3 columns desktop, 1 mobile)
- Featured packages section
- Footer

**User Interactions**:
- "Get Started" button in hero → `/chapels`
- Chapel cards are clickable → `/chapels/:id`
- "View All Venues" button → `/chapels`
- "View All Packages" button → `/packages`

**API Calls**:
- Contract: `chapelsContract.getFeaturedChapels()`
- When: On page load
- Request: `{ limit: 6, featured: true }`
- Response: Array of chapel objects
- Error: Show "Unable to load venues" with retry

**States**:
- Loading: Show 6 skeleton cards
- Empty: Show "No venues available" message
- Error: Show error message with retry button
- Success: Display chapel cards

### Chapels Page - `/chapels`

**Purpose**: Browse and filter all available wedding chapels

**Layout**:
- Navigation header
- Page title and description
- Search bar
- Filter options (capacity, location, price)
- Results grid (2 columns desktop, 1 mobile)
- Pagination controls

**User Interactions**:
- Search input → Updates results after 300ms delay
- Capacity slider → Filters results immediately
- Location dropdown → Filters by city
- Chapel card click → `/chapels/:id`
- "Book Now" on card → `/chapels/:id#booking`
- Page numbers → Load new page of results

**API Calls**:
- Contract: `chapelsContract.getChapels()`
- When: On load, on filter change, on search
- Request: `{ search, minCapacity, maxCapacity, city, page, limit: 12 }`
- Response: `{ chapels: [], total: number, page: number }`
- Error: Show "Unable to load results" with retry

**States**:
- Loading: Show 12 skeleton cards
- Empty search: "No chapels match your search"
- Empty filters: "No chapels available in this configuration"
- Error: Error message with retry
- Success: Display chapel grid

### Login Page - `/login`

**Purpose**: User authentication

**Layout**:
- Centered form card
- Logo at top
- Email and password inputs
- Submit button
- Links to signup and forgot password

**User Interactions**:
- Email input → Validate email format
- Password input → Minimum 8 characters
- "Sign In" button → Submit form
- "Create Account" link → `/signup`
- "Forgot Password" link → `/forgot-password`
- Success → Redirect to `/dashboard`

**API Calls**:
- Contract: `usersContract.login()`
- When: On form submit
- Request: `{ email, password }`
- Response: `{ token, user }`
- Error: "Invalid credentials" or "Server error"

**States**:
- Loading: Disable form, show spinner on button
- Error: Show error message above form
- Success: Redirect to dashboard

[Continue with remaining pages...]

## Part 4: User Flows

### Booking Flow
1. User browses chapels → `/chapels`
2. Clicks on chapel → `/chapels/:id`
3. Selects package and date
4. Clicks "Book Now" → `/bookings/create` (if logged in) or `/login` (if not)
5. Fills booking details
6. Submits → `/bookings/:id` confirmation page

### Authentication Flow
1. User clicks "Sign In" → `/login`
2. Enters credentials
3. Success → `/dashboard`
4. Or clicks "Create Account" → `/signup`
5. Fills registration form
6. Success → `/dashboard` with welcome message
```

### Phase 5: Design System Integration

#### 5.1 Separate Design from Interaction

**Current Problem**: Mixing design specs with interaction specs

**Solution**: Keep them separate
- Interaction Spec: WHAT happens
- Design System: HOW it looks

#### 5.2 Reference-Based Design

Instead of inventing designs:
1. Extract design system from reference sites
2. Apply extracted design to interaction spec
3. Validate against reference

---

## Implementation Steps

### Step 1: Create New Agent Structure
```bash
mkdir -p src/app_factory_leonardo_replit/agents/frontend_interaction_spec_unified
touch src/app_factory_leonardo_replit/agents/frontend_interaction_spec_unified/__init__.py
touch src/app_factory_leonardo_replit/agents/frontend_interaction_spec_unified/agent.py
touch src/app_factory_leonardo_replit/agents/frontend_interaction_spec_unified/config.py
touch src/app_factory_leonardo_replit/agents/frontend_interaction_spec_unified/system_prompt.py
touch src/app_factory_leonardo_replit/agents/frontend_interaction_spec_unified/user_prompt.py
```

### Step 2: Copy and Simplify from Stage 1
- Take navigation mapping approach from michaelangelo branch
- Add API contract integration
- Remove all design-specific content

### Step 3: Update Pipeline
```python
# In run_modular_fis.py
def generate_fis():
    # Old: generate_master_and_pages()
    # New:
    unified_agent = FrontendInteractionSpecUnifiedAgent(app_dir)
    result = await unified_agent.generate_spec(
        plan=plan_content,
        schema=schema_content,
        contracts=contracts_content
    )
    save_to_file(app_dir / "specs/frontend-interaction-spec.md", result)
```

### Step 4: Test with Timeless Weddings
1. Generate new FIS with unified approach
2. Compare to current overcomplicated version
3. Verify all features covered
4. Confirm API integration included

### Step 5: Clean Up
- Archive old master/page agents
- Remove ASTOUNDING references
- Update documentation

---

## Success Criteria

### Must Have
✅ Single-stage FIS generation
✅ Complete navigation mapping
✅ API contract integration
✅ Concrete specifications (not abstract patterns)
✅ All PRD features covered

### Should Have
✅ Simpler, cleaner output
✅ Faster generation time
✅ Easier to understand specs
✅ Better alignment with reference designs

### Nice to Have
✅ Automatic design extraction from references
✅ Validation against reference sites
✅ Design system as separate concern

---

## Migration Timeline

### Day 1: Setup
- Create new agent structure
- Port system prompt from michaelangelo branch
- Add API integration section

### Day 2: Implementation
- Implement unified agent
- Update pipeline to use new agent
- Test with existing apps

### Day 3: Validation
- Compare outputs
- Verify completeness
- Fix any gaps

### Day 4: Cleanup
- Archive old agents
- Update documentation
- Create migration guide

---

## Risk Mitigation

### Risk: Missing Features
**Mitigation**: Keep old system available for comparison

### Risk: API Integration Gaps
**Mitigation**: Carefully map all contract methods in prompt

### Risk: Breaking Existing Apps
**Mitigation**: Test on new workspace first

---

## Code Examples

### Old Approach (Abstract Patterns)
```markdown
**Primary CTA**: Uses `PRIMARY_CTA` pattern from §2.2
**Cards**: Use `GLASS_CARD` pattern with `STATUS_BADGE` (§2.2)
**Layout**: References `GRID_LAYOUT_3COL` (§2.3)
```

### New Approach (Concrete Specifications)
```markdown
**Sign In Button**:
- Label: "Sign In"
- Position: Top right of navigation
- Action: Navigate to /login
- Style: Primary button (purple background, white text)
- Mobile: Full width below navigation

**Chapel Cards**:
- Display: 3-column grid on desktop, 1-column on mobile
- Content: Image, name, location, capacity, price
- Interaction: Click navigates to /chapels/:id
- API: Fetches from chapelsContract.getChapels()
- Loading: Shows skeleton cards while fetching
- Error: Shows "Unable to load chapels" with retry button
```

---

## Conclusion

The current modular FIS system is overengineered and produces poor results. By migrating to the simpler approach from the michaelangelo branch - adding only API contract integration - we can:

1. **Simplify** the generation process
2. **Improve** output quality
3. **Speed up** development
4. **Match** reference designs better
5. **Maintain** API integration benefits

The key insight: **Concrete beats abstract**. Users and developers need specific instructions, not pattern libraries. The michaelangelo branch got this right, and we should follow its lead.

---

## Next Steps

1. **Approval**: Review and approve this plan
2. **Implementation**: Follow the step-by-step guide
3. **Testing**: Validate with Timeless Weddings
4. **Rollout**: Replace current system
5. **Documentation**: Update all references

**Estimated Time**: 4 days
**Complexity**: Medium
**Impact**: High - significantly better output quality