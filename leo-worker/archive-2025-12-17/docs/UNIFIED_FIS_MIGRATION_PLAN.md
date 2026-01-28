# Unified FIS Migration Plan
## Simplifying Design & Using API Client

**Date**: October 5, 2025
**Purpose**: Single actionable document to fix FIS generation - simpler design, API client usage, cleaner prompts

---

## What We're Changing

### 1. Design Simplification
- **Remove**: ASTOUNDING principles, gradients, 72px/800 weight fonts, complex patterns
- **Add**: Simple colors, clean layouts, concrete specifications
- **Reference**: Michaelangelo branch's simple approach

### 2. API Integration via Client
- **Remove**: Direct contract/schema reading
- **Add**: Use generated `apiClient` from `client/src/lib/api.ts`
- **Benefit**: Type-safe, guaranteed to work

### 3. Keep Two-Stage Process
- **Master Spec**: Defines foundation (colors, layouts, navigation, API methods)
- **Per-Page Specs**: Details for each page, references master's foundation

---

## File Changes Required

### 1. Master Spec Agent

**File**: `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_master/system_prompt.py`

```python
SYSTEM_PROMPT = """You are a Frontend Architecture Specification designer.
Your master specification defines the complete navigation map and reusable foundations.

## CRITICAL: Navigation Completeness
If an interaction isn't defined here, it will be a 404 or broken link in the app.
You MUST document EVERY route and EVERY clickable element exhaustively.

## Your Inputs
1. Read plan.md for application understanding
2. Read client/src/lib/api.ts for available API methods (if exists)
3. DO NOT read contracts or schema files directly

## Generate These Sections (In Order)

### 1. Design Foundation (Keep Simple)
Define basic design tokens - no gradients, no complexity:

Colors:
- Backgrounds: Use dark slate (#0F172A, #1E293B) not pure black
- Text: White primary (#FAFAFA), gray secondary (#94A3B8)
- Accent: One purple (#8B5CF6) - use sparingly
- Semantic: Success green, error red

Typography:
- Font: Inter
- Sizes: 48px (h1), 36px (h2), 24px (h3), 16px (body)
- Weights: 700 (headings), 400 (body) - never 800

Spacing: 8px, 16px, 24px, 32px

### 2. Layouts (3 Templates)
Define concrete page templates:

Standard Layout:
- Fixed header with nav
- Main content (max 1200px, centered)
- Footer

Dashboard Layout:
- Header
- Sidebar (240px)
- Main content
- No footer

Form Layout:
- Header
- Centered card (480px max)
- Footer

### 3. Complete Navigation & Interaction Map (CRITICAL)
**This section prevents 404s and broken interactions - MUST be exhaustive!**

#### Route Inventory (ALL routes that will exist):
**Public Routes:**
- `/` - Homepage
- `/chapels` - Browse all chapels
- `/chapels/:id` - Chapel details page
- `/packages` - Browse wedding packages
- `/about` - About page
- `/contact` - Contact form
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset
- `/reset-password/:token` - Reset with token

**Protected Routes:**
- `/dashboard` - User dashboard
- `/bookings` - User's bookings list
- `/bookings/:id` - Booking details
- `/bookings/create` - Create new booking
- `/profile` - User profile settings
- `/profile/edit` - Edit profile

**Utility Routes:**
- `/404` - Not found page
- `/500` - Server error page
- `/maintenance` - Maintenance mode

#### Interactive Element Catalog (EVERY clickable element):
**Header Navigation:**
- "Timeless" logo (click) → `/`
- "Venues" nav link → `/chapels`
- "Packages" nav link → `/packages`
- "About" nav link → `/about`
- "Contact" nav link → `/contact`
- "Sign In" button → `/login`
- User avatar (when logged in) → opens dropdown:
  - "Dashboard" item → `/dashboard`
  - "My Bookings" item → `/bookings`
  - "Profile" item → `/profile`
  - Divider line (not clickable)
  - "Sign Out" item → logout action + redirect to `/`

**Chapel Cards (on any listing page):**
- Chapel card container (click) → `/chapels/:id`
- "View Details" button → `/chapels/:id`
- "Book Now" button → `/bookings/create?chapel=:id`
- Heart icon (click) → toggle favorite (no navigation)

**Forms & Actions:**
- "Submit" on login → authenticate then `/dashboard`
- "Create Account" link → `/signup`
- "Forgot Password?" link → `/forgot-password`
- "Back to Login" link → `/login`
- All form cancels → go back one page

**Footer Links:**
- "Privacy Policy" → `/privacy`
- "Terms of Service" → `/terms`
- Social media icons → external links (new tab)

### 4. Available API Methods
Document methods from apiClient:

apiClient.chapels.getChapels({ query }) - List chapels
apiClient.chapels.getChapel({ params: { id } }) - Single chapel
apiClient.users.login({ body }) - User login
apiClient.users.register({ body }) - User registration
apiClient.bookings.createBooking({ body }) - Create booking
apiClient.bookings.getMyBookings() - User's bookings

### 5. Basic Components
Simple, concrete definitions:

Button: Purple background (#8B5CF6), white text, 8px radius
Input: Dark background (#1E293B), light border (#334155)
Card: Dark background, subtle border, 12px radius

## What to Avoid
- ASTOUNDING design principles
- Gradients and glows
- Abstract pattern IDs
- Complex animations
- Reading contracts/schema files
- Incomplete navigation (if a route/interaction isn't defined, it won't work)
- Invented API methods (only use what's in apiClient)

## Navigation Completeness Check
Remember: If an interaction isn't specified in the master spec, it will result in:
- 404 errors for undefined routes
- Broken links and dead clicks
- Confused users unable to navigate

EVERY interactive element needs an explicit destination or action.
"""
```

**File**: `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_master/user_prompt.py`

```python
def create_user_prompt(plan_content: str, api_client_content: str = None) -> str:
    prompt = f"""Create a master frontend specification based on this plan:

{plan_content}

"""

    if api_client_content:
        prompt += f"""
Available API Client Methods:
{api_client_content}

Use these exact apiClient methods in your specification.
"""

    prompt += """
Generate a master specification with:
1. Simple design tokens (dark slate, purple accent)
2. Three reusable layouts (Standard, Dashboard, Form)
3. COMPLETE navigation map - EVERY route and clickable element
4. Available apiClient methods
5. Basic component styles

CRITICAL: Document every single route and interaction exhaustively.
Missing routes = 404 errors. Missing interactions = broken UI.
"""

    return prompt
```

### 2. Per-Page Spec Agent

**File**: `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_page/system_prompt.py`

```python
SYSTEM_PROMPT = """You are a Page Specification designer.
Create detailed specifications for individual pages using the master spec foundation.

## Your Inputs
1. Master specification - for design tokens, layouts, navigation map, API methods
2. Page name and route from master's navigation map

## CRITICAL: Use Master's Navigation Map
- ONLY link to routes defined in master spec
- Use EXACT element labels from master spec
- If a route isn't in master, it will be a 404

## Generate These Sections

### 1. Page Setup
- Name and route (must exist in master's navigation map)
- Which layout from master
- Purpose (one sentence)

### 2. Content Structure
Specific sections and arrangement:
- Hero with heading and subtitle
- Grid of 3 chapel cards
- CTA button at bottom

### 3. User Interactions
Every clickable element with concrete details:
- "Sign In" button, top right → /login
- Chapel card click → /chapels/:id
- "Book Now" button → /bookings/create

### 4. API Integration
Use apiClient syntax from master:

On page load:
```typescript
const { data } = await apiClient.chapels.getChapels({
  query: { limit: 12, page: 1 }
});
```

On search:
```typescript
const { data } = await apiClient.chapels.getChapels({
  query: { search: term }
});
```

### 5. States
- Loading: Show 12 skeleton cards
- Empty: "No chapels found" message
- Error: "Unable to load" with retry button

## Reference Master, Don't Redefine
- Use master's colors/typography
- Use master's layouts
- Use master's apiClient methods

## Be Specific
- "Purple button with white text" not abstract patterns
- Exact positions and labels
- Real error messages
"""
```

**File**: `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_page/user_prompt.py`

```python
def create_user_prompt(master_spec: str, page_name: str, page_route: str) -> str:
    return f"""Create page spec for {page_name} at {page_route}.

Master spec reference:
{master_spec}

Generate:
1. Layout from master
2. Content structure
3. Interactions (use ONLY routes from master's navigation map)
4. API calls (use apiClient.namespace.method() syntax)
5. States (loading, empty, error)

Every link/button MUST point to routes in master spec or it will 404.
"""
```

### 3. Pipeline Updates

**File**: `src/app_factory_leonardo_replit/run_modular_fis.py`

```python
async def generate_fis(app_dir: Path):
    # Step 1: Check if API client exists
    api_client_path = app_dir / "client/src/lib/api.ts"
    api_client_content = None

    if api_client_path.exists():
        # Extract available methods from API client
        api_client_content = extract_api_methods(api_client_path)
        logger.info("✅ Found API client, will use for FIS")
    else:
        logger.warning("⚠️ No API client found, FIS will need to document APIs manually")

    # Step 2: Generate Master Spec
    master_agent = FrontendInteractionSpecMasterAgent(app_dir)

    # Pass plan and API client (not contracts/schema)
    master_spec = await master_agent.generate_master_spec(
        plan_path=app_dir / "specs/plan.md",
        api_client_content=api_client_content  # NEW: Pass API client info
        # REMOVED: contracts_path, schema_path
    )

    # Step 3: Extract pages from technical spec
    pages = extract_pages_from_tech_spec(app_dir / "specs/pages-and-routes.md")

    # Step 4: Generate page specs in parallel
    page_tasks = []
    for page in pages:
        agent = FrontendInteractionSpecPageAgent(app_dir, page)
        task = agent.generate_page_spec(
            master_spec=master_spec,
            page_name=page["name"],
            page_route=page["route"]
            # REMOVED: contracts parameter
        )
        page_tasks.append(task)

    page_specs = await asyncio.gather(*page_tasks)

    logger.info(f"✅ Generated {len(page_specs)} page specifications")
```

**Helper Function**:
```python
def extract_api_methods(api_client_path: Path) -> str:
    """Extract available methods from generated API client."""
    content = api_client_path.read_text()

    # Parse the contractsRouter to find available namespaces
    # Return formatted list of apiClient.namespace.method() calls

    methods = []
    # Example parsing (simplified)
    if "chapels: chapelsContract" in content:
        methods.append("apiClient.chapels.getChapels({ query })")
        methods.append("apiClient.chapels.getChapel({ params: { id } })")

    if "users: usersContract" in content:
        methods.append("apiClient.users.login({ body })")
        methods.append("apiClient.users.register({ body })")

    return "\n".join(methods)
```

---

## Key Changes Summary

### What We're Removing
1. ❌ ASTOUNDING design references
2. ❌ Reading contracts/schema files directly
3. ❌ Complex gradients and effects
4. ❌ Abstract pattern IDs
5. ❌ Token budgets
6. ❌ 72px/800 weight typography

### What We're Adding
1. ✅ Simple dark slate colors
2. ✅ API client usage (`apiClient.namespace.method()`)
3. ✅ Concrete specifications
4. ✅ Complete navigation mapping
5. ✅ Clean, professional design
6. ✅ Parallel page generation

### What We're Keeping
1. ✅ Two-stage process (master + per-page)
2. ✅ Reusable layouts
3. ✅ Design foundation in master
4. ✅ Page details in individual specs

---

## Implementation Steps

### Day 1: Update System Prompts
1. Update master spec system prompt - remove ASTOUNDING, add API client
2. Update page spec system prompt - use apiClient syntax
3. Remove contract/schema reading

### Day 2: Update Pipeline
1. Modify `run_modular_fis.py` to pass API client instead of contracts
2. Add helper to extract API methods from client
3. Test with existing Timeless Weddings

### Day 3: Validate Output
1. Check design is simpler (no gradients)
2. Verify API calls use apiClient syntax
3. Ensure navigation is complete

---

## Example Output

### Master Spec (Simplified)
```markdown
# Frontend Interaction Specification - Master

## Design Foundation
Colors:
- Background: #0F172A (dark slate)
- Cards: #1E293B
- Text: #FAFAFA
- Accent: #8B5CF6 (purple)

Typography:
- Font: Inter
- H1: 48px/700
- Body: 16px/400

## Available API Methods
- apiClient.chapels.getChapels({ query })
- apiClient.chapels.getChapel({ params: { id } })
- apiClient.users.login({ body })

## Navigation Map
Routes:
/ - Homepage
/chapels - Chapel browse
/login - Login

Elements:
Logo → /
"Venues" → /chapels
"Sign In" → /login
```

### Page Spec (Concrete)
```markdown
# ChapelsPage Specification

## Setup
- Route: /chapels
- Layout: Standard Layout
- Purpose: Browse wedding chapels

## User Interactions
- Search bar at top → triggers API call after 300ms
- Chapel cards in 3-column grid → click navigates to /chapels/:id
- "Book Now" button on card → /bookings/create

## API Calls
On load:
```typescript
const { data } = await apiClient.chapels.getChapels({
  query: { page: 1, limit: 12 }
});
```

## States
- Loading: 12 skeleton cards
- Empty: "No chapels found"
- Error: "Unable to load chapels" with retry
```

---

## Reconciliation with Michaelangelo Branch

The key insight from michaelangelo branch's stage_1 FIS system prompt (lines 58-89):
**Complete Navigation & Interaction Map is CRITICAL** - it's not optional or secondary.

### What We're Taking from Michaelangelo:
1. **Navigation First**: Master spec MUST exhaustively document ALL routes and interactions
2. **Prevent 404s**: If it's not in the navigation map, it won't work
3. **Every Click Matters**: Document destination for EVERY interactive element
4. **Explicit Over Implicit**: List all dropdown items, all menu options, all buttons

### What We're Keeping from Our Approach:
1. **Two-Stage Process**: Master spec + per-page specs (not single document)
2. **API Client Usage**: apiClient.namespace.method() instead of raw contracts
3. **Simple Design**: Dark slate backgrounds, purple accent, no gradients
4. **Parallel Generation**: Page specs can be generated simultaneously

## Success Criteria

✅ Complete navigation map prevents ALL 404s (michaelangelo emphasis)
✅ Simpler design without gradients/ASTOUNDING
✅ API calls use apiClient, not fetch()
✅ Exhaustive interaction documentation
✅ Two-stage process maintained
✅ Concise, impactful prompts

---

## This Document Supersedes

- PLAN_MIGRATE_TO_MICHAELANGELO_FIS_APPROACH.md
- REFINED_PLAN_SIMPLIFY_MODULAR_FIS.md
- FIS_API_CLIENT_INTEGRATION_GUIDE.md

Use THIS document for implementation.