# MULTI-PAGE APP IMPLEMENTATION PLAN
**Date: 2025-01-16 (Enhanced 2025-09-16)**  
**Purpose: Enable Leonardo Pipeline to Generate Multi-Page Applications**

## Current State
- Pipeline generates single-page apps only (HomePage)
- Technical Architecture Spec stage exists but not integrated
- App Shell Generator expects pages that don't exist
- Build stage has Writer-Critic loops for Schema, Storage, Routes, App Shell, and Main Page

## Key Design Decisions

### Workflow Structure
```
Fast Preview: plan.md → ui-spec → design-system → preview (single component)
Build Phase: plan + ui-spec + design-system + preview → technical-arch-spec → multi-page app
```

### No Extraction Pattern
- DO NOT generate massive frontend-interaction-spec then extract from it
- Generate focused, purpose-built documents directly
- Use existing artifacts (plan.md, ui-spec, design-system, preview component)

### Client-Side Routing with URLs
- YES, we need URL patterns even with client-side routing (Wouter)
- Enables bookmarkable pages, browser navigation, logical structure
- Example: `/dashboard`, `/booking/step-1`, `/auth`

## Implementation Plan

### TypeScript Configuration Setup
**When**: After template extraction, before any code generation  
**Purpose**: Prevent "module not found" errors across multi-page imports

```python
# In build_stage.py, generate tsconfig.base.json:
{
    "compilerOptions": {
        "paths": {
            "@shared/*": ["../shared/*"],
            "@/components/*": ["./src/components/*"],
            "@/lib/*": ["./src/lib/*"],
            "@/pages/*": ["./src/pages/*"]
        }
    }
}
```
- Ensure client/tsconfig.json and server/tsconfig.json extend base
- Align vite.config.ts resolve.alias with these paths

### Integrate Technical Architecture Stage
**When**: After TypeScript config setup  
**Purpose**: Define all pages and routes from plan

```python
# In build_stage.py
technical_arch_spec_path = specs_dir / "pages-and-routes.md"

if not technical_arch_spec_path.exists():
    tech_spec_result = await technical_architecture_spec_stage.run_stage(
        plan_path=plan_path,
        ui_spec_path=ui_spec_path,
        preview_component_path=preview_react_path,
        output_dir=specs_dir
    )
```

**Output Format** (pages-and-routes.md):
```markdown
## Pages Required
- HomePage (public) - Landing page with hero, features
- AuthPage (public, template: AuthPageTemplate) - Login/Signup
- DashboardPage (protected) - User dashboard
- BookingPage (protected) - Multi-step booking flow

## Route Structure
/ → HomePage
/auth → AuthPage
/dashboard → DashboardPage [requires: auth]
/booking → BookingPage [requires: auth]
```

### Update App Shell Generator
**When**: After Technical Architecture Spec  
**Purpose**: Generate routing for ALL pages

- Read pages-and-routes.md to get all pages
- Generate App.tsx with ALL route definitions
- Import statements for all pages (even if not yet created)

```typescript
// Generated App.tsx
import { HomePage } from '@/pages/HomePage'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'

<Routes>
  <Route path="/" component={HomePage} />
  <Route path="/auth" component={AuthPage} />
  <Route path="/dashboard" component={DashboardPage} />
</Routes>
```

### API Client Generator
**When**: After Schema Generator, before Page Generators  
**Purpose**: Type-safe API calls from all pages

**New Agent**: `agents/api_client_generator/`
- Input: `shared/schema.ts` with Zod schemas
- Output: `client/src/lib/api.ts`

```typescript
// Generated api.ts
import { insertBookingSchema, updateBookingSchema } from '@shared/schema'

export const api = {
  bookings: {
    getAll: async (): Promise<Booking[]> => {...},
    create: async (data: unknown) => {
      const validated = insertBookingSchema.parse(data)
      return fetch('/api/bookings', {...})
    }
  }
}
```

### Shared Layout Components
**When**: Before Page Generators  
**Purpose**: Consistent UI structure across all pages

Generate foundational components:
- `client/src/components/layout/AppLayout.tsx` - Header, nav, container
- `client/src/components/ui/LoadingState.tsx` - Skeleton loaders
- `client/src/components/ui/ErrorState.tsx` - Error boundaries
- `client/src/components/ui/EmptyState.tsx` - No data states

### Page Generator System
**When**: After App Shell and API Client  
**Purpose**: Generate individual pages

**Agent Structure**: `agents/page_generator/`
```python
class PageGenerator:
    def __init__(self, cwd: str, page_config: dict):
        self.page_name = page_config['name']
        self.route = page_config['route']
        self.template = page_config.get('template', None)
        
    # System prompt includes:
    # - Must import from @/lib/api for data fetching
    # - Must wrap in AppLayout
    # - Must use design tokens, no inline styles
    # - Must include loading/error states
```

**Available Templates** (provided to Technical Architecture agent):
- AuthPageTemplate - Login/signup/password reset
- DashboardTemplate - Stats cards, data tables
- DataTableTemplate - CRUD list with search/sort/filter
- WizardTemplate - Multi-step forms/flows

### UI Consistency Critic
**When**: Paired with each PageGenerator  
**Purpose**: Enforce patterns across all pages

```python
class UIConsistencyCritic:
    def validate(self, page_path):
        # Check for:
        # - No inline styles or hex colors
        # - AppLayout wrapper present
        # - Uses @/lib/api, not raw fetch
        # - Loading/error states present
        # - Imports from @shared/schema for types
        # - Uses design system tokens
```

### Enhanced Validation
**When**: After all pages generated  
**Purpose**: Verify multi-page app works

- Run OXC on all generated code
- Build the application
- Browser smoke tests:
  - Navigate to root and 2 random routes
  - Check for console errors
  - Verify API returns 200
- Categorize failures: LINT_FAIL, COMPILE_FAIL, RUNTIME_FAIL

### Future Enhancements (After Working)
- Parallel page generation
- AuthAdapter integration (provided by user)
- Incremental updates (diff-based regeneration)
- Observability (JSON summaries per stage)

## Build Pipeline Integration

```python
# build_stage.py execution order:
1. Template extraction
2. TypeScript config setup
3. Technical Architecture Spec generation
4. Schema Generator (Writer-Critic)
5. Storage Generator (Writer-Critic)
6. Routes Generator (Writer-Critic)
7. API Client Generator (Writer-Critic)
8. Shared Layout Components (single generation)
9. App Shell Generator (Writer-Critic)
10. Page Generators (Writer-Critic per page with UI Consistency Critic)
11. Enhanced Validation
```

## File Structure

```
src/app_factory_leonardo_replit/
├── stages/
│   └── technical_architecture_spec_stage.py  # Already exists
├── agents/
│   ├── api_client_generator/
│   │   ├── agent.py
│   │   ├── critic/agent.py
│   │   └── system_prompt.py
│   ├── page_generator/
│   │   ├── agent.py
│   │   ├── critic/agent.py
│   │   ├── ui_consistency_critic.py
│   │   └── system_prompt.py
│   └── layout_generator/
│       └── agent.py
└── templates/
    ├── page_templates/
    │   ├── AuthPageTemplate.tsx
    │   └── DashboardTemplate.tsx
    └── shared/
        └── AppLayout.tsx
```

## Success Criteria
- [ ] TypeScript paths resolve correctly (@shared, @/lib, @/pages)
- [ ] Technical Architecture stage generates pages-and-routes.md
- [ ] API client generated with typed methods
- [ ] App Shell creates routing for all pages
- [ ] All pages wrap content in AppLayout
- [ ] Pages use typed API client, not raw fetch
- [ ] UI Consistency Critic passes for all pages
- [ ] App compiles and runs with multiple pages
- [ ] Navigation between pages works
- [ ] No console errors on route navigation

## Notes
- Auth implementation (AuthAdapter) already exists, will be added later
- Focus on getting basic multi-page working first
- Templates are optional - agent decides when to use them
- All decisions driven by specs, not hard-coded logic
- Path aliases prevent import errors in multi-page apps
- Type-safe API client eliminates fetch boilerplate
- Shared layout ensures consistent navigation