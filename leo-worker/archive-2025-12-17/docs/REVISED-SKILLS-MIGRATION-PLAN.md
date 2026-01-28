# Revised Skills Migration Plan: App Factory Enhancement

**Document Version:** 2.0
**Date:** January 21, 2025
**Author:** Claude Code Analysis + User Requirements
**Status:** Ready for Review (NOT YET IMPLEMENTED)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Gap Analysis: Original Plan vs Requirements](#gap-analysis)
3. [Revised Architecture](#revised-architecture)
4. [Week-by-Week Implementation Plan](#week-by-week-implementation-plan)
5. [New Skills Detailed Specifications](#new-skills-detailed-specifications)
6. [Validation Strategy](#validation-strategy)
7. [Success Metrics](#success-metrics)
8. [Risk Assessment](#risk-assessment)
9. [Timeline & Deliverables](#timeline--deliverables)
10. [Approval Checklist](#approval-checklist)

---

## Executive Summary

### Original Plan Assessment

**Strengths (What to Keep):**
- ✅ Excellent Drizzle ORM + auth factory + storage factory patterns (95% solution for Issue #1)
- ✅ Systematic validation approach with scripts
- ✅ Subagent wrapper architecture
- ✅ Modularization strategy (1020 lines → 200 lines + focused skills)
- ✅ Quality gates at every stage

**Critical Gaps Identified:**
- ❌ **Issue #2**: No mobile responsiveness validation (0% addressed)
- ❌ **Issue #3**: No Agent SDK OAuth compliance checking (auth_agent.md patterns not enforced)
- ❌ **Issue #4**: Integration testing under-specified (30 lines vs needed 300+ lines)
- ❌ No browser testing strategy (you have browser MCP tool but plan doesn't use it)

### This Revised Plan

**Keeps from Original:**
- All Week 1-2 backend/frontend skills (auth, storage, API patterns)
- Week 4-5 subagent wrapping and pipeline refactoring
- Validation-first approach

**Adds (Critical Enhancements):**
1. **Mobile Responsive Design Skill** - Enforce responsive breakpoints, validate at 3 viewports
2. **Agent SDK Patterns Skill** - Validate OAuth auto-detection (auth_agent.md compliance)
3. **Expanded Integration Testing Skill** - 50+ test scenarios using your existing browser MCP tool

**Timeline:**
- 5 weeks implementation (162 hours)
- 2-3 weeks testing/iteration (60 hours)
- **Total: 7-8 weeks to "single prompt → flawless app"**

**Expected Outcome:**
- Issue #1 (mock→prod): 95% solved (auth + storage factory patterns)
- Issue #2 (mobile): 100% solved (new responsive design skill)
- Issue #3 (Agent SDK): 100% solved (new OAuth compliance skill)
- Issue #4 (testing): 95% solved (expanded integration testing + browser MCP)
- Issue #5 (flawless apps): 95% success rate (up from ~45% current)

---

## Gap Analysis: Original Plan vs Requirements

### Issue #1: Mock to Prod Transition (Auth & DB)

| Aspect | Original Plan | Assessment | Action |
|--------|---------------|------------|--------|
| Auth factory | ✅ Excellent (lines 450-790) | 95% solution | **Keep as-is** |
| Storage factory | ✅ Excellent (lines 211-271) | 95% solution | **Keep as-is** |
| Drizzle ORM setup | ✅ Excellent (drizzle-orm-setup skill) | Validates client exists | **Keep as-is** |
| Storage validation | ✅ Excellent (storage-factory-validation) | LSP checks contract | **Keep as-is** |

**Verdict:** ✅✅ Original plan SOLVES this completely

---

### Issue #2: Designs Not Mobile Responsive

| Aspect | Original Plan | Assessment | Action |
|--------|---------------|------------|--------|
| Responsive breakpoints | ❌ Not mentioned | 0% addressed | **ADD new skill** |
| Mobile-first patterns | ❌ Not mentioned | 0% addressed | **ADD validation** |
| Viewport testing | ❌ Not mentioned | 0% addressed | **ADD browser tests** |
| Touch targets | ❌ Not mentioned | 0% addressed | **ADD to skill** |

**Verdict:** ❌ Original plan DOES NOT address this

**Required Addition:**
```
.claude/skills/frontend/mobile-responsive-design/
├── SKILL.md (300+ lines)
│   ├── Enforce sm:, md:, lg:, xl: breakpoints
│   ├── Mobile-first design principles
│   ├── Touch target sizing (44px min)
│   ├── Navigation patterns (hamburger on mobile)
├── scripts/validate-responsive.sh
│   ├── Check all pages use responsive classes
│   ├── Validate navigation is mobile-friendly
│   ├── Check touch target sizes
└── templates/
    ├── responsive-component.tsx
    ├── responsive-layout.tsx
    └── mobile-navigation.tsx
```

---

### Issue #3: AI Sub-Agents Not Following auth_agent.md

| Aspect | Original Plan | Assessment | Action |
|--------|---------------|------------|--------|
| Subagent wrappers | ✅ Good structure (lines 1272-1442) | 60% solution | **Keep structure** |
| Validation after subagent | ✅ Good pattern | Ensures files exist | **Keep pattern** |
| Agent SDK compliance | ❌ Not mentioned | 0% addressed | **ADD new skill** |
| OAuth auto-detection | ❌ Not mentioned | 0% addressed | **ADD validation** |
| query() pattern check | ❌ Not mentioned | 0% addressed | **ADD to skill** |

**Verdict:** ⚠️ Original plan has STRUCTURE but missing CONTENT

**auth_agent.md Specific Requirements:**
1. Use `@anthropic-ai/claude-agent-sdk` not `@anthropic-ai/sdk`
2. Use `CLAUDE_CODE_OAUTH_TOKEN` not `ANTHROPIC_API_KEY`
3. Use `query()` pattern not `client.messages.create()`
4. Auto-detection, not manual token passing

**Required Addition:**
```
.claude/skills/backend/agent-sdk-patterns/
├── SKILL.md (250+ lines)
│   ├── Import claude-agent-sdk (not standard SDK)
│   ├── OAuth token auto-detection pattern
│   ├── query() usage (not messages.create)
│   ├── No manual token passing
│   ├── Model names (claude-sonnet-4-5-20250929)
├── scripts/validate-agent-sdk.sh
│   ├── Check NOT using @anthropic-ai/sdk
│   ├── Check NOT using ANTHROPIC_API_KEY
│   ├── Check NOT manually passing token
│   ├── Check using query() pattern
└── templates/
    └── ai-service.ts (correct Agent SDK pattern)
```

---

### Issue #4: Pipeline Not Testing Thoroughly (Browser Tool)

| Aspect | Original Plan | Assessment | Action |
|--------|---------------|------------|--------|
| Integration testing | ⚠️ Mentioned (line 186, 373-390) | 10% detail | **Expand massively** |
| Browser testing | ❌ Not mentioned | 0% addressed | **ADD using MCP tool** |
| Mock mode testing | ⚠️ Implied | 5% detail | **ADD explicit scenarios** |
| Prod mode testing | ⚠️ Implied | 5% detail | **ADD explicit scenarios** |
| Mode switching | ❌ Not mentioned | 0% addressed | **ADD validation** |
| Viewport testing | ❌ Not mentioned | 0% addressed | **ADD 3 viewports** |

**Verdict:** ⚠️ Original plan MENTIONS but massively UNDER-SPECIFIED

**Current Plan Says** (lines 378-390):
```markdown
11. **integration-testing** (NEW)
    - Test: signup, login, protected endpoint
    - Uses: browser automation tools
    - Validation: critical flows work
```

**That's 3 lines.** We need **300+ lines.**

**Required Expansion:**
```
.claude/skills/validation/integration-testing/
├── SKILL.md (500+ lines)
│   ├── 1. Auth Flows (6 scenarios × 2 modes = 12 tests)
│   ├── 2. Database Operations (6 scenarios × 2 modes = 12 tests)
│   ├── 3. Mode Switching (4 scenarios)
│   ├── 4. Browser Testing (5 scenarios × 3 viewports = 15 tests)
│   ├── 5. Error States (6 scenarios)
│   ├── 6. Edge Cases (6 scenarios)
│   └── Total: 50+ test scenarios
├── scripts/
│   ├── validate-integration.sh (runs all API tests)
│   ├── test-mock-mode.sh (auth + CRUD in memory)
│   ├── test-prod-mode.sh (auth + CRUD in Supabase)
│   └── test-mode-switching.sh (same tests, both modes)
└── browser-tests/
    ├── test-auth-flow.md (instructions for browser MCP tool)
    ├── test-crud-flow.md
    ├── test-mobile-375px.md
    ├── test-tablet-768px.md
    └── test-desktop-1920px.md
```

---

### Issue #5: Single Prompt → Flawless App

| Aspect | Original Plan | Assessment | Action |
|--------|---------------|------------|--------|
| Architecture | ✅ Excellent | Right approach | **Keep** |
| Timeline | ⚠️ 5 weeks | Realistic but optimistic | **Add 2-3 weeks buffer** |
| Validation gates | ✅ Excellent | Catch bugs early | **Keep** |
| Incremental testing | ❌ Not in plan | Only end-to-end | **ADD weekly checkpoints** |

**Verdict:** ⚠️ Original plan is RIGHT DIRECTION but needs MORE TIME

**Original Plan Timeline:**
- Week 1-5: Implementation (162 hours)
- Then: "Test with 5-10 apps to find edge cases"
- Then: "Iterate on prompts and patterns"
- **Original estimate: "6-8 weeks"**

**Realistic Timeline (This Plan):**
- Week 1-5: Implementation (162 hours)
- Week 6: Real-world testing (5 apps, track bugs)
- Week 7: Skill refinement (fix validation scripts)
- Week 8: Documentation + team training
- **Revised estimate: 8 weeks to production-ready**

---

## Revised Architecture

### Complete Skills Inventory (23 Skills)

#### Backend Skills (6 skills)

| # | Skill Name | Status | Week | Purpose |
|---|------------|--------|------|---------|
| 1 | `drizzle-orm-setup` | ✅ Exists | - | Ensures Drizzle client created (server/lib/db.ts) |
| 2 | `supabase-storage` | ✅ Exists | - | PostgREST patterns for storage layer |
| 3 | `type-safe-queries` | ✅ Exists | - | Decision guide: Drizzle vs PostgREST |
| 4 | `storage-factory-validation` | ✅ Exists | - | LSP validation for IStorage contract |
| 5 | `auth-scaffolding` | 🆕 Create | 1 | Mock/Supabase auth factory pattern |
| 6 | `api-routes-patterns` | 🆕 Create | 1 | Express route templates with error handling |

#### Frontend Skills (6 skills)

| # | Skill Name | Status | Week | Purpose |
|---|------------|--------|------|---------|
| 7 | `api-client-setup` | 🆕 Create | 2 | ts-rest client with dynamic auth headers (getter pattern) |
| 8 | `auth-context` | 🆕 Create | 2 | React AuthProvider with login/signup/logout |
| 9 | `protected-routes` | 🆕 Create | 2 | ProtectedRoute component with redirect logic |
| 10 | `design-system` | 🆕 Create | 2 | Dark mode, color tokens, spacing system |
| 11 | `component-patterns` | 🆕 Create | 2 | React best practices, prop typing, composition |
| 12 | `mobile-responsive-design` | 🆕 Create | 3 | **NEW** - Responsive breakpoints, mobile-first patterns |

#### Validation Skills (3 skills)

| # | Skill Name | Status | Week | Purpose |
|---|------------|--------|------|---------|
| 13 | `build-validation` | 🆕 Create | 3 | TypeScript compilation, ESLint, build process |
| 14 | `integration-testing` | 🆕 Create | 3 | **EXPANDED** - 50+ test scenarios, browser MCP integration |
| 15 | `agent-sdk-patterns` | 🆕 Create | 3 | **NEW** - OAuth auto-detection, query() pattern validation |

#### Subagent Wrappers (8 skills)

| # | Skill Name | Status | Week | Purpose |
|---|------------|--------|------|---------|
| 16 | `schema-designer-skill` | 🆕 Create | 4 | Wraps schema_designer, validates Drizzle client exists |
| 17 | `api-architect-skill` | 🆕 Create | 4 | Wraps api_architect, validates contracts + routes |
| 18 | `code-writer-skill` | 🆕 Create | 4 | Wraps code_writer, validates syntax + imports |
| 19 | `ui-designer-skill` | 🆕 Create | 4 | Wraps ui_designer, validates design tokens |
| 20 | `quality-assurer-skill` | 🆕 Create | 4 | Wraps quality_assurer, runs full test suite |
| 21 | `error-fixer-skill` | 🆕 Create | 4 | Wraps error_fixer, validates fixes work |
| 22 | `ai-integration-skill` | 🆕 Create | 4 | Wraps ai_integration, validates Agent SDK compliance |
| 23 | `research-agent-skill` | 🆕 Create | 4 | Wraps research_agent, validates research complete |

**Summary:**
- **4 skills exist** (no changes needed)
- **19 skills to create** (5 weeks of work)
- **3 skills are NEW** (addressing gaps: mobile, Agent SDK, comprehensive testing)
- **1 skill massively EXPANDED** (integration-testing: 30 lines → 500 lines)

---

## Week-by-Week Implementation Plan

### Week 1: Critical Backend Skills (40 hours)

**Goal:** Solve 80% of mock→prod bugs (Issue #1)

#### Day 1-2: Auth Scaffolding Skill (16 hours)

**Create:**
```
.claude/skills/backend/auth-scaffolding/
├── SKILL.md (400 lines)
├── scripts/validate-auth.sh
└── templates/
    ├── factory.ts
    ├── mock-adapter.ts
    ├── supabase-adapter.ts
    └── auth-middleware.ts
```

**SKILL.md Contents:**
1. **When to Use** - Setting up authentication
2. **Required Files** (5 files):
   - `server/lib/auth/factory.ts` - Factory pattern with mode switching
   - `server/lib/auth/mock-adapter.ts` - Accept any credentials in dev
   - `server/lib/auth/supabase-adapter.ts` - Real Supabase Auth integration
   - `server/middleware/auth.ts` - Auth middleware for route protection
   - `server/routes/auth.ts` - Auth endpoints (signup, login, logout, me)
3. **Validation Checklist** - All 5 files exist, routes registered
4. **Testing** - curl commands to test endpoints
5. **Anti-Patterns** - What NOT to do

**Validation Script:** `validate-auth.sh`
```bash
#!/bin/bash
echo "🔍 Validating Authentication Setup..."

# Check all required files exist
REQUIRED_FILES=(
  "server/lib/auth/factory.ts"
  "server/lib/auth/mock-adapter.ts"
  "server/lib/auth/supabase-adapter.ts"
  "server/middleware/auth.ts"
  "server/routes/auth.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
  echo "✅ Found: $file"
done

# Check auth routes registered in server/index.ts
if ! grep -q "import.*authRoutes.*from.*routes/auth" server/index.ts; then
  echo "❌ Auth routes not imported in server/index.ts"
  exit 1
fi

if ! grep -q "app.use.*authRoutes" server/index.ts; then
  echo "❌ Auth routes not registered in server/index.ts"
  exit 1
fi

echo "✅ Auth routes registered"
echo "✅ Authentication setup validated!"
exit 0
```

**Test Plan:**
- Generate simple app with auth
- Run validation script
- Test in mock mode: signup, login, protected endpoint
- Switch to prod mode: verify same flows work
- **Success criteria:** Both modes pass identical tests

---

#### Day 3-4: API Routes Patterns Skill (16 hours)

**Create:**
```
.claude/skills/backend/api-routes-patterns/
├── SKILL.md (350 lines)
├── scripts/validate-routes.sh
└── templates/
    └── resource-routes.ts
```

**SKILL.md Contents:**
1. **When to Use** - Creating API endpoints
2. **Standard Route Template**:
   - Always use try-catch
   - Validate input with Zod
   - Use appropriate status codes (200, 201, 400, 401, 404, 500)
   - Include error logging
3. **Required Patterns**:
   - GET /api/resources (list)
   - GET /api/resources/:id (get one)
   - POST /api/resources (create, protected)
   - PUT /api/resources/:id (update, protected)
   - DELETE /api/resources/:id (delete, protected)
4. **Anti-Patterns** - No error handling, no validation, wrong status codes
5. **Validation Checklist**

**Validation Script:** `validate-routes.sh`
```bash
#!/bin/bash
echo "🔍 Validating API Routes..."

# Check all routes have try-catch
for route_file in server/routes/*.ts; do
  if ! grep -q "try {" "$route_file"; then
    echo "❌ $route_file missing try-catch blocks"
    exit 1
  fi
  echo "✅ $route_file has error handling"
done

# Check routes use Zod validation for POST/PUT
for route_file in server/routes/*.ts; do
  if grep -q "router.post\|router.put" "$route_file"; then
    if ! grep -q "safeParse\|parse" "$route_file"; then
      echo "⚠️  $route_file may be missing Zod validation"
    fi
  fi
done

echo "✅ API routes validated!"
exit 0
```

**Test Plan:**
- Generate app with 3 entities (users, posts, comments)
- Run validation script
- Test CRUD operations for each entity
- Test error cases (invalid data, missing auth, not found)
- **Success criteria:** All routes have error handling and validation

---

#### Day 5: Week 1 Integration Test (8 hours)

**Test Scenario:**
Generate complete app with:
- Auth (signup, login, logout)
- 3 entities (users, posts, comments)
- CRUD operations for all entities
- Relationships (posts belong to users, comments belong to posts)

**Test in Mock Mode:**
```bash
export AUTH_MODE=mock
export STORAGE_MODE=memory
npm run dev

# Test auth
curl -X POST http://localhost:5000/api/auth/signup -d '{"email":"test@example.com","password":"Pass123","name":"Test User"}'
# Should return: { user: {...}, token: "mock-token-..." }

curl -X POST http://localhost:5000/api/auth/login -d '{"email":"test@example.com","password":"Pass123"}'
# Should return: { user: {...}, token: "mock-token-..." }

# Test CRUD
curl -H "Authorization: Bearer mock-token-123" http://localhost:5000/api/posts
# Should return: []

curl -X POST -H "Authorization: Bearer mock-token-123" http://localhost:5000/api/posts -d '{"title":"Test Post"}'
# Should return: { id: 1, title: "Test Post", ... }
```

**Test in Prod Mode:**
```bash
export AUTH_MODE=supabase
export STORAGE_MODE=database
npm run dev

# Run same curl commands
# Should return identical data structures
```

**Validation:**
- [ ] Auth works in both modes
- [ ] CRUD works in both modes
- [ ] Data shape identical (camelCase in both)
- [ ] No snake_case leaks
- [ ] Protected routes require auth

**Success Criteria:** All tests pass, zero storage bugs

---

### Week 2: Frontend Skills (40 hours)

**Goal:** Consistent, working frontends with auth flow (partial Issue #1, setup for Issue #2)

#### Day 1: API Client Setup Skill (8 hours)

**Create:**
```
.claude/skills/frontend/api-client-setup/
├── SKILL.md (300 lines)
├── scripts/validate-client.sh
└── templates/
    ├── api-client.ts
    └── auth-helpers.ts
```

**SKILL.md Contents:**
1. **When to Use** - Setting up frontend API client
2. **CRITICAL: ts-rest v3 Dynamic Headers**
   - Use getter property (NOT function) for Authorization header
   - Why: Auth token isn't available at module load time
3. **Required Files**:
   - `client/src/lib/api-client.ts` - ts-rest client with dynamic headers
   - `client/src/lib/auth-helpers.ts` - Token management utilities
4. **Anti-Patterns**:
   - ❌ Using function instead of getter
   - ❌ Static header at module load
   - ✅ Correct: getter property pattern
5. **Validation**

**Key Pattern (from SKILL.md):**
```typescript
// client/src/lib/api-client.ts
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    // CRITICAL: Use getter property, NOT function
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});
```

**Test Plan:**
- Generate app with API client
- Verify getter property pattern used
- Test: Login → Set token → API call includes Authorization header
- **Success criteria:** Dynamic auth headers work correctly

---

#### Day 2: Auth Context Skill (8 hours)

**Create:**
```
.claude/skills/frontend/auth-context/
├── SKILL.md (400 lines)
├── scripts/validate-context.sh
└── templates/
    └── AuthContext.tsx
```

**SKILL.md Contents:**
1. **When to Use** - Setting up auth state in React
2. **Required Files**:
   - `client/src/contexts/AuthContext.tsx` - AuthProvider + useAuth hook
3. **Features**:
   - Auth state (user, isAuthenticated, isLoading)
   - Functions (login, signup, logout)
   - Token persistence (localStorage)
   - Restore auth on mount
4. **Usage in Components**
5. **Validation Checklist**

**Test Plan:**
- Generate app with AuthContext
- Test: Login → Refresh page → User still logged in
- Test: Logout → User state cleared
- **Success criteria:** Auth state persists correctly

---

#### Day 3: Protected Routes Skill (8 hours)

**Create:**
```
.claude/skills/frontend/protected-routes/
├── SKILL.md (250 lines)
├── scripts/validate-protected.sh
└── templates/
    └── ProtectedRoute.tsx
```

**SKILL.md Contents:**
1. **When to Use** - Protecting routes that require auth
2. **Required Files**:
   - `client/src/components/auth/ProtectedRoute.tsx`
3. **Features**:
   - Check isAuthenticated
   - Show loading state
   - Redirect to /login if not authenticated
4. **App.tsx Integration**
5. **Validation**

**Test Plan:**
- Generate app with protected routes
- Test: Access /dashboard without login → Redirects to /login
- Test: Login → Access /dashboard → Shows page
- **Success criteria:** Unauthorized access blocked

---

#### Day 4: Design System Skill (8 hours)

**Create:**
```
.claude/skills/frontend/design-system/
├── SKILL.md (300 lines)
├── scripts/validate-design.sh
└── templates/
    └── theme-provider.tsx
```

**SKILL.md Contents:**
1. **When to Use** - Setting up design tokens, dark mode
2. **Required Patterns**:
   - CSS variables for colors
   - Dark mode with Tailwind
   - Consistent spacing (4px grid)
   - shadcn/ui components
3. **Validation**

**Test Plan:**
- Generate app with design system
- Test: Toggle dark mode → Colors change
- Verify: Consistent spacing throughout
- **Success criteria:** Design system applied consistently

---

#### Day 5: Component Patterns Skill (8 hours)

**Create:**
```
.claude/skills/frontend/component-patterns/
├── SKILL.md (350 lines)
├── scripts/validate-patterns.sh
└── templates/
    ├── page-component.tsx
    └── form-component.tsx
```

**SKILL.md Contents:**
1. **When to Use** - Writing React components
2. **Patterns**:
   - TypeScript prop types (no `any`)
   - Component composition
   - Error boundaries
   - Loading states
   - Empty states
3. **Validation**

**Week 2 Checkpoint:**
- Generate app with full auth flow + protected routes
- Test: Signup → Login → Protected page → Logout
- Verify: Both mock and prod modes work
- **Success criteria:** Complete auth flow works end-to-end

---

### Week 3: Validation & Testing (40 hours - EXPANDED)

**Goal:** Systematic quality gates + comprehensive testing (Issues #2, #3, #4)

#### Day 1: Build Validation Skill (8 hours)

**Create:**
```
.claude/skills/validation/build-validation/
├── SKILL.md (250 lines)
└── scripts/validate-build.sh
```

**SKILL.md Contents:**
1. **When to Use** - Before considering app "done"
2. **Validation Steps**:
   - TypeScript compilation (`npx tsc --noEmit`)
   - ESLint (`npx eslint . --ext .ts,.tsx`)
   - Build (`npm run build`)
3. **Error Handling**
4. **Validation Script**

**Test Plan:**
- Generate app with TypeScript errors
- Run validation script → Should fail
- Fix errors, re-run → Should pass
- **Success criteria:** Catches compilation errors

---

#### Day 2: Mobile Responsive Design Skill (**NEW** - 12 hours)

**Create:**
```
.claude/skills/frontend/mobile-responsive-design/
├── SKILL.md (400 lines)
├── scripts/
│   ├── validate-responsive.sh
│   └── check-touch-targets.sh
└── templates/
    ├── responsive-component.tsx
    ├── responsive-layout.tsx
    └── mobile-navigation.tsx
```

**SKILL.md Contents:**

1. **When to Use**
   - Creating any UI component
   - Designing layouts
   - Building navigation

2. **Mobile-First Principles**
   ```markdown
   ## Core Principles

   1. **Design for mobile first** (375px base)
   2. **Progressive enhancement** for larger screens
   3. **Touch-friendly** (44px minimum touch targets)
   4. **No horizontal scroll** on mobile
   5. **Readable text** (16px minimum on mobile)
   ```

3. **Required Patterns**

   **Responsive Breakpoints:**
   ```typescript
   // ✅ CORRECT - Progressive enhancement
   <div className="flex flex-col md:flex-row">
     <aside className="w-full md:w-64">Sidebar</aside>
     <main className="flex-1">Content</main>
   </div>

   // ❌ WRONG - No responsive classes
   <div className="flex flex-row">
     <aside className="w-64">Sidebar</aside>
     <main className="flex-1">Content</main>
   </div>
   ```

   **Navigation Patterns:**
   ```typescript
   // ✅ CORRECT - Mobile menu
   <nav>
     {/* Hamburger menu on mobile, full nav on desktop */}
     <button className="md:hidden" onClick={toggleMenu}>
       <MenuIcon />
     </button>
     <div className="hidden md:flex space-x-4">
       <Link to="/">Home</Link>
       <Link to="/about">About</Link>
     </div>
   </nav>
   ```

   **Container Max Width:**
   ```typescript
   // ✅ CORRECT - Responsive container
   <div className="container mx-auto px-4 max-w-7xl">
     Content
   </div>

   // ❌ WRONG - Fixed width
   <div className="w-[1200px]">
     Content
   </div>
   ```

4. **Touch Target Sizing**
   ```typescript
   // ✅ CORRECT - 44px minimum
   <button className="h-11 px-4">Click me</button> // 44px height

   // ❌ WRONG - Too small for touch
   <button className="h-6 px-2">Click me</button> // 24px height
   ```

5. **Validation Checklist**
   - [ ] All pages use responsive breakpoints (sm:, md:, lg:)
   - [ ] Navigation works on mobile (hamburger menu)
   - [ ] Forms fit in mobile viewport
   - [ ] Touch targets minimum 44px
   - [ ] No horizontal scroll at 375px
   - [ ] Text minimum 16px on mobile

**Validation Script:** `validate-responsive.sh`
```bash
#!/bin/bash
echo "🔍 Validating Mobile Responsiveness..."

ISSUES_FOUND=0

# Check all pages use responsive classes
echo "Checking responsive breakpoints..."
find client/src/pages -name "*.tsx" | while read file; do
  if ! grep -q "sm:\|md:\|lg:\|xl:" "$file"; then
    echo "⚠️  $file may be missing responsive breakpoints"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

# Check navigation is mobile-friendly
echo "Checking navigation patterns..."
NAV_FILES=$(find client/src/components -name "*[Nn]av*.tsx" -o -name "*[Hh]eader*.tsx")
if [ -n "$NAV_FILES" ]; then
  echo "$NAV_FILES" | while read nav_file; do
    if ! grep -q "md:flex\|md:block\|md:hidden" "$nav_file"; then
      echo "⚠️  $nav_file may not be responsive"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  done
fi

# Check containers use max-width
echo "Checking container patterns..."
if ! grep -r "max-w-\|container" client/src/pages/ >/dev/null 2>&1; then
  echo "⚠️  Pages may overflow on mobile (no max-width found)"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ Mobile responsiveness validated!"
  exit 0
else
  echo "⚠️  Found $ISSUES_FOUND potential responsive issues"
  echo "   Review pages and add responsive breakpoints"
  exit 1
fi
```

**Browser Testing (using browser MCP tool):**
```markdown
## Browser Testing Instructions

Use the browser MCP tool to test at 3 viewports:

### Test 1: Mobile (375x667)
1. Open browser: `mcp__browser__open_browser({ headless: false })`
2. Navigate to app: `mcp__browser__navigate_browser({ url: 'http://localhost:5000' })`
3. Check navigation:
   - Should show hamburger menu icon
   - Click hamburger: `mcp__browser__interact_browser({ selector: '[aria-label="Menu"]', interaction: 'click' })`
   - Menu should open
4. Check form:
   - No horizontal scroll
   - Inputs fit in viewport
   - Buttons are thumb-friendly (44px+)
5. Screenshot saved automatically

### Test 2: Tablet (768x1024)
1. Resize viewport (new browser session)
2. Navigate to app
3. Check navigation:
   - May show simplified menu or full navigation
   - All links accessible
4. Check layout:
   - Content uses available space
   - No wasted whitespace

### Test 3: Desktop (1920x1080)
1. Resize viewport (new browser session)
2. Navigate to app
3. Check navigation:
   - Full horizontal navigation
   - All items visible
4. Check layout:
   - Content centered with max-width
   - Multi-column layouts work
```

**Test Plan:**
- Generate app with responsive components
- Run validation script → Check for breakpoints
- Use browser MCP tool to test at 3 viewports
- Verify: No horizontal scroll at 375px
- Verify: Navigation works on mobile
- **Success criteria:** App is mobile-friendly

---

#### Day 3: Agent SDK Patterns Skill (**NEW** - 10 hours)

**Create:**
```
.claude/skills/backend/agent-sdk-patterns/
├── SKILL.md (350 lines)
├── scripts/validate-agent-sdk.sh
└── templates/
    └── ai-service.ts
```

**SKILL.md Contents:**

1. **When to Use**
   - Implementing AI features
   - Calling Claude API
   - Creating AI-powered endpoints

2. **CRITICAL: auth_agent.md Compliance**

   **Rule 1: Use Agent SDK, Not Standard SDK**
   ```typescript
   // ✅ CORRECT
   import { query } from '@anthropic-ai/claude-agent-sdk';

   // ❌ WRONG
   import Anthropic from '@anthropic-ai/sdk';
   ```

   **Rule 2: OAuth Token Auto-Detection**
   ```typescript
   // ✅ CORRECT - Auto-detection
   // No client initialization needed
   // SDK reads CLAUDE_CODE_OAUTH_TOKEN from environment

   // ❌ WRONG - Manual token passing
   const client = new Anthropic({
     apiKey: process.env.CLAUDE_CODE_OAUTH_TOKEN
   });
   ```

   **Rule 3: Use query() Pattern**
   ```typescript
   // ✅ CORRECT
   const result = query({
     prompt: userInput,
     options: {
       model: 'claude-sonnet-4-5-20250929',
       systemPrompt: 'You are...',
       maxTurns: 1,
     },
   });

   // ❌ WRONG
   const response = await client.messages.create({
     model: 'claude-3-5-sonnet-20241022',
     messages: [{ role: 'user', content: userInput }],
   });
   ```

   **Rule 4: Iterate AsyncGenerator**
   ```typescript
   // ✅ CORRECT - Iterate generator
   let responseText = '';
   for await (const message of result) {
     if (message.type === 'assistant') {
       for (const block of message.message.content) {
         if (block.type === 'text') {
           responseText += block.text;
         }
       }
     }
   }

   // ❌ WRONG - Try to await directly
   const response = await result; // Doesn't work!
   ```

3. **Required Pattern: AI Service Class**
   ```typescript
   import { query } from '@anthropic-ai/claude-agent-sdk';

   export class AIService {
     private readonly model = 'claude-sonnet-4-5-20250929';
     private readonly mockMode: boolean;

     constructor() {
       const token = process.env.CLAUDE_CODE_OAUTH_TOKEN;
       this.mockMode = !token;

       if (this.mockMode) {
         console.warn('[AI] Running in mock mode');
       } else {
         console.log('[AI] ✓ Claude Agent SDK enabled');
       }
     }

     async generate(prompt: string, systemPrompt: string): Promise<string> {
       if (this.mockMode) {
         return `Mock response to: ${prompt}`;
       }

       try {
         const result = query({
           prompt,
           options: {
             cwd: process.cwd(),
             maxTurns: 1,
             model: this.model,
             systemPrompt,
             permissionMode: 'bypassPermissions',
           },
         });

         let responseText = '';
         for await (const message of result) {
           if (message.type === 'assistant') {
             for (const block of message.message.content) {
               if (block.type === 'text') {
                 responseText += block.text;
               }
             }
           }
         }

         return responseText;
       } catch (error) {
         console.error('[AI] Error:', error);
         return `Mock response to: ${prompt}`; // Fallback
       }
     }
   }
   ```

4. **Validation Checklist**
   - [ ] Using `@anthropic-ai/claude-agent-sdk` (not standard SDK)
   - [ ] No manual token passing (auto-detection)
   - [ ] Using `query()` (not `client.messages.create()`)
   - [ ] Correct model name (claude-sonnet-4-5-20250929)
   - [ ] Iterating AsyncGenerator correctly
   - [ ] Mock mode fallback for dev without token

**Validation Script:** `validate-agent-sdk.sh`
```bash
#!/bin/bash
echo "🔍 Validating Agent SDK Compliance..."

AI_DIR="server/lib/ai"

if [ ! -d "$AI_DIR" ]; then
  echo "ℹ️  No AI directory found (app may not use AI features)"
  exit 0
fi

ISSUES_FOUND=0

# Check 1: NOT using standard SDK
if grep -r "import.*@anthropic-ai/sdk" "$AI_DIR" 2>/dev/null; then
  echo "❌ Using old Anthropic SDK (should use @anthropic-ai/claude-agent-sdk)"
  echo "   Fix: import { query } from '@anthropic-ai/claude-agent-sdk';"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 2: NOT using API key (should use OAuth token)
if grep -r "ANTHROPIC_API_KEY" server/ 2>/dev/null; then
  echo "❌ Using ANTHROPIC_API_KEY (should use CLAUDE_CODE_OAUTH_TOKEN)"
  echo "   Fix: Remove manual API key usage, OAuth token auto-detected"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 3: NOT manually passing token
if grep -r "new Anthropic.*apiKey\|apiKey:.*process.env" "$AI_DIR" 2>/dev/null; then
  echo "❌ Manually passing token to client (should auto-detect)"
  echo "   Fix: Remove client initialization, use query() directly"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 4: NOT using old messages.create() pattern
if grep -r "client.messages.create\|\.messages\.create" "$AI_DIR" 2>/dev/null; then
  echo "❌ Using old messages.create() pattern (should use query())"
  echo "   Fix: Use query({ prompt, options }) pattern"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check 5: IS using query() pattern
if grep -r "import.*query.*@anthropic-ai/claude-agent-sdk" "$AI_DIR" 2>/dev/null; then
  echo "✅ Using Agent SDK query() pattern"
else
  if [ $ISSUES_FOUND -gt 0 ]; then
    echo "⚠️  Not using Agent SDK - please review AI implementation"
  fi
fi

if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ Agent SDK compliance validated!"
  exit 0
else
  echo ""
  echo "❌ Found $ISSUES_FOUND Agent SDK compliance issues"
  echo "   See: apps/RaiseIQ/app/auth_agent.md for correct patterns"
  exit 1
fi
```

**Test Plan:**
- Generate app with AI features
- Run validation script
- Verify: Uses Agent SDK, not standard SDK
- Verify: OAuth token auto-detected
- Test: AI endpoint works with CLAUDE_CODE_OAUTH_TOKEN set
- Test: Falls back to mock mode without token
- **Success criteria:** AI implementation follows auth_agent.md patterns

---

#### Day 4-5: Integration Testing Skill (**MASSIVELY EXPANDED** - 10 hours)

**Create:**
```
.claude/skills/validation/integration-testing/
├── SKILL.md (600+ lines)
├── scripts/
│   ├── validate-integration.sh
│   ├── test-mock-mode.sh
│   ├── test-prod-mode.sh
│   └── test-mode-switching.sh
└── browser-tests/
    ├── test-auth-flow.md
    ├── test-crud-flow.md
    ├── test-mobile-375px.md
    ├── test-tablet-768px.md
    └── test-desktop-1920px.md
```

**SKILL.md Contents:**

1. **When to Use**
   - Before considering app "done"
   - After major code changes
   - Testing mock→prod transition

2. **Test Coverage Matrix: 50+ Scenarios**

   **Category 1: Auth Flows (12 tests)**
   ```markdown
   Mock Mode Tests (6 scenarios):
   - [ ] POST /api/auth/signup → Creates user in memory
   - [ ] POST /api/auth/login → Returns mock token
   - [ ] GET /api/auth/me (with token) → Returns user
   - [ ] GET /api/auth/me (no token) → Returns 401
   - [ ] Protected route (with token) → Returns 200
   - [ ] Protected route (no token) → Returns 401

   Prod Mode Tests (6 scenarios):
   - [ ] POST /api/auth/signup → Creates user in Supabase Auth + Drizzle
   - [ ] POST /api/auth/login → Returns real Supabase JWT
   - [ ] GET /api/auth/me (with JWT) → Verifies with Supabase
   - [ ] GET /api/auth/me (invalid JWT) → Returns 401
   - [ ] Protected route (with JWT) → Verifies signature
   - [ ] Protected route (invalid JWT) → Returns 401
   ```

   **Category 2: Database Operations (12 tests)**
   ```markdown
   Mock Mode Tests (6 scenarios):
   - [ ] POST /api/entities → Stored in memory (camelCase)
   - [ ] GET /api/entities → Returns array from memory
   - [ ] GET /api/entities/:id → Returns single entity
   - [ ] PUT /api/entities/:id → Updates entity in memory
   - [ ] DELETE /api/entities/:id → Removes from memory
   - [ ] Relationships → Joins work in memory

   Prod Mode Tests (6 scenarios):
   - [ ] POST /api/entities → INSERT via Drizzle (snake_case → Postgres)
   - [ ] GET /api/entities → SELECT via Drizzle (converts to camelCase)
   - [ ] GET /api/entities/:id → SELECT with WHERE
   - [ ] PUT /api/entities/:id → UPDATE via Drizzle
   - [ ] DELETE /api/entities/:id → DELETE via Drizzle
   - [ ] Relationships → Foreign keys enforced in Postgres
   ```

   **Category 3: Mode Switching (4 tests)**
   ```markdown
   - [ ] Change AUTH_MODE=mock → AUTH_MODE=supabase
   - [ ] Change STORAGE_MODE=memory → STORAGE_MODE=database
   - [ ] Run same test suite → All pass
   - [ ] Verify API responses have identical shape (camelCase in both)
   ```

   **Category 4: Browser Testing (15 tests)**
   ```markdown
   Desktop (1920x1080) - 5 tests:
   - [ ] Navigation renders in horizontal layout
   - [ ] Forms display in multi-column layout
   - [ ] Tables show all columns
   - [ ] Modals center on screen
   - [ ] All interactive elements have hover states

   Tablet (768x1024) - 5 tests:
   - [ ] Navigation collapses to simplified menu
   - [ ] Forms switch to single column
   - [ ] Tables scroll horizontally if needed
   - [ ] Touch targets minimum 44px
   - [ ] All interactive elements accessible

   Mobile (375x667) - 5 tests:
   - [ ] Navigation shows hamburger menu
   - [ ] Forms fit in viewport (no horizontal scroll)
   - [ ] Cards stack vertically
   - [ ] Buttons are thumb-friendly
   - [ ] Text remains readable (min 16px)
   ```

   **Category 5: Error States (6 tests)**
   ```markdown
   - [ ] Network error → Shows "Connection failed" message
   - [ ] Validation error → Shows field-specific errors
   - [ ] Auth error 401 → Redirects to /login
   - [ ] Not found 404 → Shows "Page not found"
   - [ ] Server error 500 → Shows "Something went wrong"
   - [ ] Timeout → Shows "Request timed out"
   ```

   **Category 6: Edge Cases (6 tests)**
   ```markdown
   - [ ] Empty state → Shows "No items yet" with CTA
   - [ ] Loading state → Shows spinner or skeleton
   - [ ] Long text → Truncates with ellipsis
   - [ ] Large dataset → Pagination works (10 items per page)
   - [ ] Concurrent requests → No race conditions
   - [ ] Rapid clicks → Buttons disable during submission
   ```

   **Total: 55 test scenarios**

3. **Validation Scripts**

   **Main Script:** `validate-integration.sh`
   ```bash
   #!/bin/bash

   echo "🧪 Running Comprehensive Integration Tests..."
   echo ""

   # Test Mock Mode
   echo "========================================="
   echo "TESTING MOCK MODE"
   echo "========================================="
   export AUTH_MODE=mock
   export STORAGE_MODE=memory

   # Start server in background
   npm run dev > /tmp/server-mock.log 2>&1 &
   SERVER_PID=$!
   sleep 5

   # Run mock mode tests
   bash .claude/skills/validation/integration-testing/scripts/test-mock-mode.sh
   MOCK_RESULT=$?

   kill $SERVER_PID

   if [ $MOCK_RESULT -ne 0 ]; then
     echo "❌ Mock mode tests failed"
     exit 1
   fi

   echo "✅ Mock mode tests passed"
   echo ""

   # Test Prod Mode (requires Supabase)
   echo "========================================="
   echo "TESTING PRODUCTION MODE"
   echo "========================================="
   export AUTH_MODE=supabase
   export STORAGE_MODE=database

   # Check Supabase credentials
   if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
     echo "⚠️  Skipping prod mode tests (Supabase not configured)"
     exit 0
   fi

   # Start server in background
   npm run dev > /tmp/server-prod.log 2>&1 &
   SERVER_PID=$!
   sleep 5

   # Run prod mode tests
   bash .claude/skills/validation/integration-testing/scripts/test-prod-mode.sh
   PROD_RESULT=$?

   kill $SERVER_PID

   if [ $PROD_RESULT -ne 0 ]; then
     echo "❌ Prod mode tests failed"
     exit 1
   fi

   echo "✅ Prod mode tests passed"
   echo ""

   # Test mode switching
   echo "========================================="
   echo "TESTING MODE SWITCHING"
   echo "========================================="
   bash .claude/skills/validation/integration-testing/scripts/test-mode-switching.sh
   SWITCH_RESULT=$?

   if [ $SWITCH_RESULT -ne 0 ]; then
     echo "❌ Mode switching tests failed"
     exit 1
   fi

   echo "✅ Mode switching tests passed"
   echo ""
   echo "═══════════════════════════════════════"
   echo "✅ ALL INTEGRATION TESTS PASSED"
   echo "═══════════════════════════════════════"
   exit 0
   ```

4. **Browser Testing with MCP Tool**

   **File:** `browser-tests/test-mobile-375px.md`
   ```markdown
   # Mobile Viewport Test (375x667)

   ## Instructions for Agent

   Use the browser MCP tool to test the app at mobile viewport.

   ### Step 1: Open Browser
   ```
   mcp__browser__open_browser({ headless: false })
   ```

   ### Step 2: Navigate to App
   ```
   mcp__browser__navigate_browser({ url: 'http://localhost:5000' })
   ```
   Screenshot automatically saved.

   ### Step 3: Test Navigation
   1. Look for hamburger menu icon
   2. Click hamburger menu:
      ```
      mcp__browser__interact_browser({
        selector: '[aria-label="Menu"]',
        interaction: 'click'
      })
      ```
   3. Verify menu opens (screenshot saved)

   ### Step 4: Test Signup Form
   1. Navigate to signup:
      ```
      mcp__browser__interact_browser({
        selector: 'a[href="/signup"]',
        interaction: 'click'
      })
      ```
   2. Fill email:
      ```
      mcp__browser__interact_browser({
        selector: 'input[name="email"]',
        interaction: 'fill',
        value: 'test@example.com'
      })
      ```
   3. Fill password:
      ```
      mcp__browser__interact_browser({
        selector: 'input[name="password"]',
        interaction: 'fill',
        value: 'Pass123!'
      })
      ```
   4. Fill name:
      ```
      mcp__browser__interact_browser({
        selector: 'input[name="name"]',
        interaction: 'fill',
        value: 'Test User'
      })
      ```
   5. Submit form:
      ```
      mcp__browser__interact_browser({
        selector: 'button[type="submit"]',
        interaction: 'click'
      })
      ```

   ### Step 5: Validation
   Review screenshots:
   1. No horizontal scroll
   2. All inputs visible and usable
   3. Buttons large enough for thumb (44px+)
   4. Text readable (16px minimum)
   5. Navigation works via hamburger menu

   ### Step 6: Close Browser
   ```
   mcp__browser__close_browser()
   ```
   ```

**Week 3 Checkpoint:**
- Generate test app
- Run all validation scripts
- Use browser MCP tool for UI testing at 3 viewports
- **Success criteria:**
  - 100% test pass rate (50+ scenarios)
  - App works on mobile (375px)
  - Agent SDK compliance verified
  - Mock and prod modes pass identical tests

---

### Week 4: Subagent Wrapping (32 hours)

**Goal:** Enhance subagents with validation (improve Issue #3)

**Pattern for All Wrappers:**
```markdown
1. Delegate to subagent using Task tool
2. Validate output (files exist, patterns correct)
3. If validation fails → Invoke related skills
4. Report completion
```

#### Day 1: Schema Designer Wrapper (8 hours)

**Create:**
```
.claude/skills/subagents/schema-designer-skill/
├── SKILL.md (300 lines)
└── scripts/validate-schema-output.sh
```

**SKILL.md Contents:**
```markdown
---
name: Schema Designer Subagent Wrapper
description: >
  Use this skill when designing database schemas. Delegates to schema_designer
  subagent and validates that BOTH Zod schemas AND Drizzle client are created.
---

# Schema Designer Subagent Wrapper

## When to Use This Skill

**AUTO-INVOKE** when:
- Creating database schemas
- Designing data models
- Setting up entities

## Process

### Step 1: Delegate to Subagent

Invoke schema_designer subagent:

```
Task(
  "Design complete database schema",
  "Create type-safe schemas for: [list entities]

Requirements:
- Include users table with auth fields
- Add timestamps to all tables
- Create foreign key relationships for: [relationships]
- Use consistent naming (camelCase)

Output:
- shared/schema.zod.ts (Zod validation schemas)
- shared/schema.ts (Drizzle ORM schemas)
",
  "schema_designer"
)
```

### Step 2: Validate Schema Output

After subagent completes, MUST validate:

```bash
# Check Zod schema exists
test -f shared/schema.zod.ts || exit 1

# Check Drizzle schema exists
test -f shared/schema.ts || exit 1
```

### Step 3: CRITICAL - Create Drizzle Client

**This is where 55% of bugs come from!**

Schema exists ≠ Client exists

Invoke `drizzle-orm-setup` skill:
```
The schema_designer created schemas. Now invoke drizzle-orm-setup skill
to create the Drizzle client (server/lib/db.ts).
```

### Step 4: Validate Complete Setup

Run validation:
```bash
.claude/skills/backend/drizzle-orm-setup/scripts/validate-drizzle.sh
```

**Must pass**:
- ✅ server/lib/db.ts exists
- ✅ Drizzle client configured
- ✅ Schema imported correctly

## Validation Checklist

- [ ] shared/schema.zod.ts exists
- [ ] shared/schema.ts exists
- [ ] server/lib/db.ts exists (Drizzle client)
- [ ] Validation script passes
- [ ] No TypeScript errors
```

**Test Plan:**
- Use wrapper to generate schema
- Verify: All 3 files created (schema.zod.ts, schema.ts, db.ts)
- Verify: Drizzle client validated automatically
- **Success criteria:** No missing Drizzle client bugs

---

#### Day 2: API Architect + Code Writer Wrappers (8 hours)

**Create:**
```
.claude/skills/subagents/api-architect-skill/
├── SKILL.md
└── scripts/validate-api-output.sh

.claude/skills/subagents/code-writer-skill/
├── SKILL.md
└── scripts/validate-code-output.sh
```

**Similar pattern:**
- Delegate → Validate → Invoke related skills → Report

**Test Plan:**
- Use wrappers to generate API + code
- Verify: Contracts match routes
- Verify: Code follows patterns
- **Success criteria:** Type safety maintained

---

#### Day 3: UI Designer + Quality Assurer Wrappers (8 hours)

**Create:**
```
.claude/skills/subagents/ui-designer-skill/
├── SKILL.md
└── scripts/validate-ui-output.sh

.claude/skills/subagents/quality-assurer-skill/
├── SKILL.md
└── scripts/validate-qa-output.sh
```

**Test Plan:**
- Use wrappers for UI design + QA
- Verify: Design tokens applied
- Verify: Tests run automatically
- **Success criteria:** Consistent UI, quality gates enforced

---

#### Day 4: Error Fixer + AI Integration + Research Wrappers (8 hours)

**Create:**
```
.claude/skills/subagents/error-fixer-skill/
├── SKILL.md
└── scripts/validate-fix-output.sh

.claude/skills/subagents/ai-integration-skill/
├── SKILL.md (with Agent SDK validation)
└── scripts/validate-ai-output.sh

.claude/skills/subagents/research-agent-skill/
├── SKILL.md
└── scripts/validate-research-output.sh
```

**Special: ai-integration-skill**
- After subagent completes → Automatically invoke `agent-sdk-patterns` skill
- Validates OAuth compliance
- Ensures auth_agent.md patterns followed

**Week 4 Checkpoint:**
- Generate app using all wrapped subagents
- Verify: Each wrapper runs validation
- Verify: Missing pieces caught immediately (like Drizzle client)
- Log: Which skills were auto-invoked
- **Success criteria:** 100% validation coverage, no silent failures

---

### Week 5: Pipeline Refactoring (20 hours)

**Goal:** Create slim orchestrator + integrate all skills

#### Day 1-2: Create pipeline-prompt-v3.md (8 hours)

**Create:**
```
docs/pipeline-prompt-v3.md (200 lines)
```

**Structure:**
```markdown
# App Generator: Skills-Based Pipeline (v3)

You are an orchestrator that coordinates skills and subagents to generate
complete, production-ready applications.

## Overview (20 lines)

**Your role**: Coordinate, not implement
**Your tools**: Skills (auto-invoked) + Subagents (delegated)
**Your output**: Working app with 0% bugs

## Stage 1: Plan (40 lines)

**Objective**: Understand requirements

**Actions**:
1. Read user prompt
2. Create plan/plan.md
3. Validate plan completeness

## Stage 2: Build (100 lines)

### 2.1 Backend (50 lines)

**Objective**: Create type-safe backend

**Actions**:
1. Delegate to `schema_designer` subagent
   - **CRITICAL**: Auto-invokes `drizzle-orm-setup` skill
2. Invoke `auth-scaffolding` skill
3. Invoke `storage-factory-validation` skill
4. Delegate to `api_architect` subagent

**Skills auto-invoked**:
- drizzle-orm-setup (ensures client exists)
- auth-scaffolding (mock/prod switching)
- storage-factory-validation (contract compliance)
- api-routes-patterns (error handling)

### 2.2 Frontend (50 lines)

**Objective**: Create responsive React UI

**Actions**:
1. Invoke `api-client-setup` skill
2. Invoke `auth-context` skill
3. Invoke `mobile-responsive-design` skill ← NEW
4. Delegate to `ui_designer` subagent
5. Delegate to `code_writer` subagent

**Skills auto-invoked**:
- api-client-setup (dynamic auth headers)
- auth-context (auth state management)
- protected-routes (route protection)
- mobile-responsive-design (responsive breakpoints) ← NEW
- design-system (dark mode + tokens)
- component-patterns (React best practices)

## Stage 3: Validate (40 lines)

**Objective**: Ensure quality

**Actions**:
1. Invoke `build-validation` skill
   - TypeScript compilation
   - ESLint
   - npm run build
2. Invoke `agent-sdk-patterns` skill (if AI features) ← NEW
3. Invoke `integration-testing` skill
   - 50+ test scenarios
   - Browser testing at 3 viewports
   - Mock + prod mode validation
4. If fails → Delegate to `error_fixer` subagent

**Skills auto-invoked**:
- build-validation (compilation + lint + build)
- agent-sdk-patterns (OAuth compliance) ← NEW
- integration-testing (comprehensive testing) ← EXPANDED

## Quality Gates

Before proceeding to next stage:
- [ ] Stage 1: plan.md exists and complete
- [ ] Stage 2 Backend: Drizzle client exists, auth works both modes
- [ ] Stage 2 Frontend: Mobile responsive, no horizontal scroll at 375px
- [ ] Stage 3: All 50+ tests pass, build succeeds

If any gate fails:
1. Invoke appropriate skill for validation
2. Review errors
3. Invoke error-fixer skill if needed
4. Re-validate

---

**End of pipeline orchestration. All detailed patterns in skills.**
```

**Test Plan:**
- Review v3 pipeline
- Verify: All skills referenced
- Verify: Quality gates clear
- **Success criteria:** Pipeline is clear and concise (200 lines)

---

#### Day 3: Extract All Patterns to Skills (6 hours)

**Task:**
- Review old 1020-line pipeline
- Identify any patterns NOT yet in skills
- Extract to appropriate skills
- Verify: No duplicated guidance

**Checklist:**
- [ ] Auth patterns → auth-scaffolding skill
- [ ] Storage patterns → storage-factory-validation skill
- [ ] API patterns → api-routes-patterns skill
- [ ] Frontend patterns → component-patterns skill
- [ ] Responsive patterns → mobile-responsive-design skill
- [ ] AI patterns → agent-sdk-patterns skill
- [ ] Testing patterns → integration-testing skill

---

#### Day 4: Test v3 Pipeline with 3 Apps (6 hours)

**Generate 3 Different Apps:**

1. **Simple CRUD App** (Todo List)
   - Auth (signup, login, logout)
   - 1 entity (todos)
   - CRUD operations
   - **Test**: Mock and prod modes
   - **Expected**: Generates in ~5 minutes, all tests pass

2. **Multi-Entity App** (E-commerce)
   - Auth
   - 3 entities (products, orders, reviews)
   - Relationships
   - **Test**: Mobile responsiveness at 375px
   - **Expected**: Generates in ~10 minutes, mobile-friendly

3. **App with AI Features** (Chatbot)
   - Auth
   - 2 entities (conversations, messages)
   - AI integration (Claude chat)
   - **Test**: Agent SDK compliance
   - **Expected**: Generates in ~10 minutes, OAuth auto-detection works

**Comparison:**
| Metric | v2 (Old) | v3 (New) | Improvement |
|--------|----------|----------|-------------|
| Generation time | ~15 min | ~10 min | 33% faster |
| Drizzle client bugs | 55% | 0% | ✅ Fixed |
| Mobile responsive | No | Yes | ✅ Fixed |
| Agent SDK compliance | No | Yes | ✅ Fixed |
| Test coverage | Manual | 50+ scenarios | ✅ Fixed |
| Bug rate | ~55% | ~5% | 91% reduction |

---

#### Day 5: Documentation (4 hours)

**Create:**

1. **Skills Index:** `.claude/skills/README.md`
   ```markdown
   # App Factory Skills Index

   ## Overview
   23 skills organized by category

   ## Backend Skills (6)
   1. drizzle-orm-setup - Ensures Drizzle client created
   2. supabase-storage - PostgREST patterns
   3. type-safe-queries - Drizzle vs PostgREST decision
   4. storage-factory-validation - Contract compliance
   5. auth-scaffolding - Mock/prod auth switching
   6. api-routes-patterns - Error handling + validation

   ## Frontend Skills (6)
   [List all 6 with descriptions]

   ## Validation Skills (3)
   [List all 3 with descriptions]

   ## Subagent Wrappers (8)
   [List all 8 with descriptions]

   ## Usage Guide
   [How to use skills, auto-invocation, validation]
   ```

2. **Migration Guide:** `docs/skills-migration-guide.md`
   ```markdown
   # Migration Guide: v2 → v3

   ## Summary of Changes
   - Pipeline: 1020 lines → 200 lines
   - Skills: 4 → 23
   - Validation: None → 50+ test scenarios

   ## For Developers
   [How to use new pipeline]

   ## For Maintainers
   [How to update skills]
   ```

3. **Update CLAUDE.md**
   ```markdown
   ## Pipeline Version
   Currently using: v3 (skills-based)

   ## Key Skills
   - drizzle-orm-setup: Ensures Drizzle client exists
   - mobile-responsive-design: Validates responsive breakpoints
   - agent-sdk-patterns: Ensures OAuth compliance
   - integration-testing: 50+ test scenarios

   ## Generating Apps
   See: docs/pipeline-prompt-v3.md
   ```

**Week 5 Checkpoint:**
- v3 pipeline functional
- 3 test apps generated successfully
- Documentation complete
- **Success criteria:** v3 ready for production use

---

## Validation Strategy

### After Each Week

**Week 1 Checkpoint:**
```bash
# Generate simple app
cd apps/test-week1
# Expected: Auth works both modes, no storage bugs

# Validate
bash .claude/skills/backend/auth-scaffolding/scripts/validate-auth.sh
# Expected: ✅ All files exist

# Test mock mode
export AUTH_MODE=mock STORAGE_MODE=memory
npm run dev
# curl tests...

# Test prod mode
export AUTH_MODE=supabase STORAGE_MODE=database
npm run dev
# Same curl tests...

# Success criteria: Both modes pass identical tests
```

**Week 2 Checkpoint:**
```bash
# Generate app with full auth flow
cd apps/test-week2
# Expected: Complete auth flow works

# Test
npm run dev
# Open browser → Signup → Login → Dashboard → Logout

# Success criteria: Auth flow works end-to-end
```

**Week 3 Checkpoint:**
```bash
# Generate app, run full test suite
cd apps/test-week3

# Run all validations
bash .claude/skills/validation/build-validation/scripts/validate-build.sh
bash .claude/skills/frontend/mobile-responsive-design/scripts/validate-responsive.sh
bash .claude/skills/backend/agent-sdk-patterns/scripts/validate-agent-sdk.sh
bash .claude/skills/validation/integration-testing/scripts/validate-integration.sh

# Use browser MCP tool for UI testing
# Test at 375px, 768px, 1920px

# Success criteria: All validations pass, mobile-friendly
```

**Week 4 Checkpoint:**
```bash
# Generate app using wrapped subagents
cd apps/test-week4

# Verify validation ran automatically
# Check logs for: "✅ Drizzle client validated"
# Check logs for: "✅ Agent SDK compliance validated"

# Success criteria: All validations ran automatically
```

**Week 5 Checkpoint:**
```bash
# Generate 3 apps with v3 pipeline
cd apps/test-week5-todo
cd apps/test-week5-ecommerce
cd apps/test-week5-chatbot

# Compare quality v2 vs v3
# Measure: Bug count, generation time, test pass rate

# Success criteria: v3 better or equal to v2 on all metrics
```

---

## Success Metrics

### Before Skills Migration (v2)

| Metric | Current Value |
|--------|---------------|
| **Pipeline length** | 1020 lines |
| **Drizzle client bugs** | 55% of apps |
| **Auth issues** | 30% of apps |
| **Storage bugs** | 55% of methods |
| **Mobile responsive** | No validation |
| **Agent SDK compliance** | Not checked |
| **Test coverage** | Manual testing |
| **Bug detection** | Runtime |
| **Subagent validation** | None |
| **Single prompt success** | ~45% |

### After Skills Migration (v3 Target)

| Metric | Target Value |
|--------|--------------|
| **Pipeline length** | 200 lines (80% reduction) |
| **Drizzle client bugs** | 0% (validation prevents) |
| **Auth issues** | 0% (factory pattern + tests) |
| **Storage bugs** | 0% (LSP validation) |
| **Mobile responsive** | 100% validated |
| **Agent SDK compliance** | 100% validated |
| **Test coverage** | 50+ automated scenarios |
| **Bug detection** | Generation time (not runtime) |
| **Subagent validation** | 100% (8 wrappers) |
| **Single prompt success** | ~95% (2x improvement) |

### ROI Analysis

**Investment:**
- Implementation: 162 hours (5 weeks)
- Testing: 60 hours (3 weeks)
- **Total: 222 hours (8 weeks)**

**Savings per App:**
- Debugging time saved: 3 hours (no bugs vs current bugs)
- Manual testing saved: 1 hour (automated vs manual)
- Mode switching issues: 0.5 hours (factory pattern)
- **Total: 4.5 hours saved per app**

**Break-Even:**
- 222 hours / 4.5 hours = 50 apps
- At 1 app/day: Break-even in 10 weeks (2.5 months)
- At 2 apps/day: Break-even in 5 weeks (1.25 months)

**Long-Term:**
- Easier maintenance (update one skill vs hunt through 1020 lines)
- Faster onboarding (clear skill structure)
- Better quality (systematic validation)
- Compound savings as more apps generated

---

## Risk Assessment

### Risk 1: Skills Don't Auto-Invoke

**Probability:** Medium
**Impact:** High
**Mitigation:**
- Test each skill manually first
- Verify description matches use cases
- Include keywords in descriptions
- Add fallback: Explicit skill invocation in pipeline

### Risk 2: Validation Scripts Too Strict

**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Start with warnings (not errors)
- Gather feedback from first 5 apps
- Adjust validation rules based on real usage
- Allow overrides for edge cases

### Risk 3: Browser MCP Tool Limitations

**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Document MCP tool capabilities first
- Design tests within MCP tool constraints
- Have manual testing as backup
- Focus on critical flows only

### Risk 4: Timeline Slips

**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Prioritize Weeks 1-3 (core functionality)
- Weeks 4-5 can be delayed if needed
- Test incrementally (don't wait 5 weeks)
- Cut scope if needed (reduce test scenarios)

### Risk 5: Generated Apps Still Have Bugs

**Probability:** Low
**Impact:** High
**Mitigation:**
- Test after each week
- Iterate on skills immediately
- Don't wait until Week 5 to test
- Have error-fixer subagent as fallback

---

## Timeline & Deliverables

### Implementation Phase (Weeks 1-5)

**Week 1 Deliverables:**
- ✅ auth-scaffolding skill (SKILL.md + validation script)
- ✅ api-routes-patterns skill (SKILL.md + validation script)
- ✅ Test app (auth + 3 entities, both modes work)

**Week 2 Deliverables:**
- ✅ api-client-setup skill
- ✅ auth-context skill
- ✅ protected-routes skill
- ✅ design-system skill
- ✅ component-patterns skill
- ✅ Test app (full auth flow works)

**Week 3 Deliverables:**
- ✅ build-validation skill
- ✅ mobile-responsive-design skill (NEW)
- ✅ agent-sdk-patterns skill (NEW)
- ✅ integration-testing skill (EXPANDED to 500+ lines)
- ✅ Test app (50+ tests pass, mobile-friendly)

**Week 4 Deliverables:**
- ✅ 8 subagent wrapper skills
- ✅ Test app (wrappers validate automatically)

**Week 5 Deliverables:**
- ✅ pipeline-prompt-v3.md (200 lines)
- ✅ Skills index (.claude/skills/README.md)
- ✅ Migration guide (docs/skills-migration-guide.md)
- ✅ 3 test apps (todo, e-commerce, chatbot)
- ✅ Updated CLAUDE.md

### Testing Phase (Weeks 6-8)

**Week 6: Real-World Testing**
- Generate 5 production apps
- Track: Bug count, generation time, manual fixes
- Identify: Missing patterns

**Week 7: Refinement**
- Fix validation script bugs
- Add missing patterns
- Optimize auto-invocation

**Week 8: Documentation**
- Video walkthrough
- Common issues guide
- Team training

---

## Approval Checklist

### Before Starting Implementation

- [ ] **Reviewed revised plan** (this document)
- [ ] **Approved 3 new skills:**
  - [ ] mobile-responsive-design (addresses Issue #2)
  - [ ] agent-sdk-patterns (addresses Issue #3)
  - [ ] Expanded integration-testing (addresses Issue #4)
- [ ] **Approved use of browser MCP tool** for UI testing
- [ ] **Approved 8-week timeline** (5 weeks implementation + 3 weeks testing)
- [ ] **Approved incremental validation** (test after each week)
- [ ] **Confirmed Drizzle ORM approach** (you DO want Drizzle client)
- [ ] **Understood ROI:** Break-even after 50 apps (~2.5 months at 1 app/day)

### Questions to Resolve

1. **Priority:** Should any skills be deprioritized if timeline slips?
2. **Testing:** How many test apps should be generated in Week 5? (Currently: 3)
3. **Validation strictness:** Start with warnings or errors? (Recommended: warnings)
4. **Browser testing:** Which flows are most critical? (Currently: auth + CRUD + mobile)
5. **Documentation:** Video walkthrough required or optional? (Recommended: optional)

---

## Next Steps (After Approval)

1. **Week 1, Day 1:** Create auth-scaffolding skill
2. **Daily standups:** Review progress, adjust timeline
3. **Weekly checkpoints:** Test generated apps, validate approach
4. **Continuous feedback:** Adjust skills based on real results
5. **Week 8 completion:** Production-ready v3 pipeline

---

**Document Status:** ✅ Ready for Review
**Awaiting:** Your approval to begin implementation
**Timeline:** 8 weeks to production-ready (5 implementation + 3 testing/refinement)
**Expected Outcome:** Single prompt → flawless app with 95% success rate

---

**End of Revised Skills Migration Plan**
