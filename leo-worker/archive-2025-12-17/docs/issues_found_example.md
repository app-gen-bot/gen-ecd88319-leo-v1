# Issues Found During Generation - EXAMPLE

**App**: dadcoin (Family rewards economy)
**Generation Started**: 2025-01-08T10:00:00
**Generation Completed**: 2025-01-08T15:30:00
**Total Issues**: 12
**Critical Issues**: 3
**Total Debug Time**: 2h 15min

---

## Summary by Category

| Category | Count | Critical | Avg Fix Time |
|----------|-------|----------|--------------|
| Schema/Database | 4 | 1 | 25 min |
| API Contracts | 3 | 1 | 18 min |
| Frontend Build | 2 | 0 | 12 min |
| Authentication | 2 | 1 | 35 min |
| TypeScript Types | 1 | 0 | 8 min |

**Top 3 Time Sinks**:
1. Supabase connection issues (45 min)
2. Auth UUID bridge implementation (35 min)
3. Drizzle casing mismatch (25 min)

---

## Issues Log

### Issue #1: Drizzle Schema Snake_Case Mismatch ⚠️ COMMON

**Category**: Schema/Database
**Severity**: Critical
**Iteration**: 12
**Timestamp**: 2025-01-08T11:23:45
**Time to Fix**: 25 minutes

**What Happened**:
All API queries returning empty arrays despite database having data. Campaigns, quests, store items - everything empty. Console showed no errors, network tab showed 200 OK with `[]`.

**Error Signature**:
```bash
# Query
GET /api/campaigns → []
GET /api/quests → []
GET /api/store-items → []

# Database shows data exists
psql> SELECT * FROM campaigns WHERE user_id = 1;
 id | user_id | name | ...
----+---------+------+----
  1 |       1 | Q1   | ...
(5 rows)

# Code querying
.where(eq(schema.campaigns.userId, req.user.id))  // ❌ userId doesn't exist
```

**Root Cause**:
1. Drizzle schema generator created tables with snake_case: `user_id`, `created_at`, `created_by`
2. TypeScript code used camelCase: `userId`, `createdAt`, `createdBy`
3. No column name mapping configured in `drizzle.config.ts`
4. Drizzle silently ignores unknown columns (doesn't error!)

**How It Was Fixed**:
```typescript
// drizzle.config.ts - ADDED THIS
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  // ✅ FIX: Enable automatic casing conversion
  casing: "snake_case",  // Database uses snake_case, code uses camelCase
};

// No code changes needed - Drizzle auto-converts now
```

**Subagent**: error_fixer (found via BaseScan query inspection)

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - Schema Generator**: ALWAYS add `casing: "snake_case"` to drizzle.config.ts
2. ⚠️ **PIPELINE - Critic**: Validate drizzle.config.ts has casing configured
3. 💡 **Template**: Include casing config in base template
4. 💡 **Skill**: drizzle-orm-setup skill teaches this (created)
5. 💡 **Validation**: Test query before approving schema (catch this immediately)

**Related Issues**: None
**Frequency**: First occurrence (will be common without pipeline fix)

---

### Issue #2: API Contract Path Double-Prefix ⚠️ COMMON

**Category**: API Contracts
**Severity**: High
**Iteration**: 15
**Timestamp**: 2025-01-08T12:10:33
**Time to Fix**: 15 minutes

**What Happened**:
All API calls from frontend returning 404. Network tab showed:
```
GET /api/api/users → 404
GET /api/api/campaigns → 404
GET /api/api/quests → 404
```

**Error Signature**:
```typescript
// Contract definition (WRONG)
export const campaignsContract = c.router({
  getCampaigns: {
    method: 'GET',
    path: '/api/campaigns',  // ❌ Includes /api prefix
    ...
  }
});

// Server mounting (ADDS /api AGAIN)
app.use('/api', createExpressEndpoints(router));
//      ^^^^^ Mount point

// Result: /api + /api/campaigns = /api/api/campaigns (404!)
```

**Root Cause**:
Contract generator included `/api` prefix in paths. Server also mounts router at `/api`. Paths in contracts should be relative to mount point.

**How It Was Fixed**:
```typescript
// Changed ALL contract paths
// Before: path: '/api/campaigns'
// After:  path: '/campaigns'

export const campaignsContract = c.router({
  getCampaigns: {
    method: 'GET',
    path: '/campaigns',  // ✅ Relative to /api mount point
    ...
  }
});

// Server mounting unchanged
app.use('/api', router);  // Works now: /api + /campaigns = /api/campaigns ✓
```

**Subagent**: error_fixer (found via Chrome DevTools Network tab)

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - Contract Generator**: Add instruction: "Paths NEVER include /api prefix"
2. ⚠️ **PIPELINE - Critic**: Reject contracts with paths starting with /api
3. 💡 **Documentation**: Add prominent example in pipeline-prompt.md
4. 💡 **Validation**: Check contract paths before frontend generation

**Related Issues**: None
**Frequency**: First occurrence (very common mistake without warning)

**Learning**: ts-rest paths are relative to mount point - this should be in BOLD in docs

---

### Issue #3: Supabase Connection "Tenant Not Found" ⚠️ CRITICAL

**Category**: Database
**Severity**: Critical
**Iteration**: 8
**Timestamp**: 2025-01-08T10:45:12
**Time to Fix**: 45 minutes (multiple attempts)

**What Happened**:
Database connection failing completely. App couldn't start.

**Error Signature**:
```bash
Error: Tenant or user not found
    at Connection.parseE (/node_modules/postgres/...)
    at Parser.onError (/node_modules/postgres/...)

Connection string:
postgresql://postgres.abc123:MyP@ssw0rd!@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

**Root Cause** (Multiple Issues):
1. **Wrong pooler mode**: Used Session Mode (port 6543) instead of Transaction Mode
   - Drizzle requires Transaction Mode for prepared statements
   - Supabase UI is confusing - same port for both modes!

2. **Password encoding**: Special characters (@, !, etc.) not URL-encoded
   - `MyP@ssw0rd!` → should be `MyP%40ssw0rd%21`

3. **Missing pgbouncer parameter**: Required for Supabase pooler

**How It Was Fixed**:
```bash
# Step 1: Switch to Transaction Mode in Supabase UI
# (Dashboard → Database → Connection String → Transaction mode)

# Step 2: URL-encode password
# Before: MyP@ssw0rd!
# After:  MyP%40ssw0rd%21

# Step 3: Add pgbouncer parameter
DATABASE_URL="postgresql://postgres.abc123:MyP%40ssw0rd%21@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Subagent**: research (found solution in Supabase docs after multiple error_fixer attempts)

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - Validation**: Check DATABASE_URL format before starting generation
2. ⚠️ **PIPELINE - Prompt**: Add Supabase connection string requirements (bold!)
3. 💡 **Template**: Include .env.example with correct format and comments
4. 💡 **Documentation**: Create Supabase troubleshooting guide
5. 💡 **Error Detection**: Pattern match "Tenant not found" → suggest URL encoding

**Related Issues**: None
**Frequency**: First occurrence (but CRITICAL - blocks everything)

**Learning**: Supabase has TWO pooler modes - Session vs Transaction. Drizzle REQUIRES Transaction mode. This needs to be first thing in Supabase setup docs.

---

### Issue #4: Auto-Injected userId Validation Error

**Category**: Schema/Database
**Severity**: High
**Iteration**: 14
**Timestamp**: 2025-01-08T11:55:20
**Time to Fix**: 20 minutes

**What Happened**:
Creating campaigns failing with Zod validation error:
```
POST /api/campaigns → 400 Bad Request
Error: Required field missing: userId
```

Frontend wasn't sending userId (and shouldn't - it should be auto-injected from auth token).

**Error Signature**:
```typescript
// Insert schema (WRONG - includes userId)
export const insertCampaignSchema = campaignSchema.omit({
  id: true,
  createdAt: true,
  // Missing: userId should be omitted too!
});

// Route handler
router.post('/api/campaigns', authMiddleware(), async (req, res) => {
  // Zod validates req.body
  const validated = insertCampaignSchema.parse(req.body);  // ❌ Expects userId
  // userId should be injected AFTER validation
  const campaign = await storage.createCampaign({
    ...validated,
    userId: req.user.id  // Injected here, not in body
  });
});
```

**Root Cause**:
Schema generator didn't omit auto-injected fields (userId, createdBy) from insert schemas. These fields should never come from request body - they're injected from auth context.

**How It Was Fixed**:
```typescript
// Fixed insert schema
export const insertCampaignSchema = campaignSchema.omit({
  id: true,
  userId: true,      // ✅ Auto-injected from req.user.id
  createdBy: true,   // ✅ Auto-injected from req.user.id
  createdAt: true,
  updatedAt: true,
});

// Route stays same - validation passes now, userId injected after
```

**Subagent**: error_fixer

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - Schema Generator**: Auto-detect userId/createdBy fields and omit from inserts
2. ⚠️ **PIPELINE - Prompt**: Add explicit guidance about auto-injection
3. 💡 **Pattern Library**: Document auto-injection pattern
4. 💡 **Validation**: Check insert schemas don't include userId/createdBy

**Related Issues**: #7 (same pattern with createdBy)
**Frequency**: 2 occurrences (pattern established)

**Learning**: Any field that comes from auth context (userId, createdBy, email from session) should be omitted from insert schemas and injected in route handlers.

---

### Issue #5: Missing lucide-react Dependency

**Category**: Frontend Build
**Severity**: Medium
**Iteration**: 18
**Timestamp**: 2025-01-08T13:20:15
**Time to Fix**: 8 minutes

**What Happened**:
Frontend build failing:
```bash
npm run dev
Error: Cannot find module 'lucide-react'
  at /client/src/components/ui/button.tsx
```

Button component imported icons from lucide-react but package wasn't installed.

**Error Signature**:
```typescript
// button.tsx
import { Loader2 } from 'lucide-react';  // ❌ Package not installed
```

**Root Cause**:
shadcn component generator added Button but didn't detect icon usage and install lucide-react.

**How It Was Fixed**:
```bash
npm install lucide-react
```

**Subagent**: error_fixer

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - shadcn Generator**: Auto-install lucide-react when adding components
2. 💡 **Validation**: Check imports match installed packages before approval
3. 💡 **Template**: Include lucide-react in base dependencies

**Related Issues**: None
**Frequency**: First occurrence

**Learning**: shadcn components often use lucide-react icons. Should be auto-installed or in base template.

---

### Issue #6: Import Path Resolution (@/ vs relative)

**Category**: Frontend Build
**Severity**: Medium
**Iteration**: 20
**Timestamp**: 2025-01-08T13:45:30
**Time to Fix**: 12 minutes

**What Happened**:
Some components using `@/` imports, others using relative `../../`.
Build worked but inconsistent and confusing.

**Error Signature**:
```typescript
// page.tsx
import { Button } from '@/components/ui/button';  // ✅ Works

// another-page.tsx
import { Button } from '../../components/ui/button';  // ✅ Also works (but inconsistent)
```

**Root Cause**:
Page generator wasn't consistent about import style. Both work but mixing them is messy.

**How It Was Fixed**:
Standardized all imports to use `@/`:
```typescript
// Changed all relative imports to @/
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
```

**Subagent**: code (refactoring task)

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - Page Generator**: Always use @/ imports (never relative)
2. ⚠️ **PIPELINE - Critic**: Validate import consistency
3. 💡 **Template**: Include tsconfig.json with @/ path configured

**Related Issues**: #10 (same inconsistency in another file)
**Frequency**: 2 occurrences

**Learning**: Pick ONE import style (@/ recommended) and enforce it everywhere.

---

### Issue #7: createdBy Validation Error (Same as #4)

**Category**: Schema/Database
**Severity**: Medium
**Iteration**: 16
**Timestamp**: 2025-01-08T12:30:45
**Time to Fix**: 10 minutes (knew the fix from #4)

**What Happened**:
Same as Issue #4 but with createdBy field.

**Error Signature**:
```
POST /api/quests → 400
Error: Required field missing: createdBy
```

**Root Cause**:
Insert schema included createdBy (should be auto-injected).

**How It Was Fixed**:
```typescript
export const insertQuestSchema = questSchema.omit({
  id: true,
  userId: true,
  createdBy: true,  // ✅ Added this
  createdAt: true,
});
```

**Subagent**: None (applied fix directly based on #4)

**Prevention Opportunities**:
Same as Issue #4 - this confirms the pattern.

**Related Issues**: #4 (same root cause)
**Frequency**: 2 occurrences - PATTERN CONFIRMED

---

### Issue #8: Response Type Mismatch (Contract vs Route)

**Category**: API Contracts
**Severity**: Medium
**Iteration**: 17
**Timestamp**: 2025-01-08T13:10:22
**Time to Fix**: 18 minutes

**What Happened**:
TypeScript error in route handler:
```typescript
Type 'Campaign[]' is not assignable to type 'z.infer<typeof campaignSchema>[]'
```

**Error Signature**:
```typescript
// Contract expects
responses: { 200: z.array(campaignSchema) }

// Route returns (from database)
const campaigns = await db.select().from(schema.campaigns);
// Type: Campaign[] (Drizzle type, not Zod type)
```

**Root Cause**:
Contract uses Zod schema, route returns Drizzle type. They're structurally identical but TypeScript sees them as different.

**How It Was Fixed**:
```typescript
// Option 1: Cast to Zod type
return campaigns as z.infer<typeof campaignSchema>[];

// Option 2: Validate with Zod (safer)
return z.array(campaignSchema).parse(campaigns);

// Used Option 1 (faster, types guaranteed to match)
```

**Subagent**: error_fixer

**Prevention Opportunities**:
1. 💡 **Pattern**: Document Drizzle → Zod casting pattern
2. 💡 **Type Helpers**: Create utility type for easy casting
3. 💡 **Validation**: Add optional runtime validation in dev mode

**Related Issues**: None
**Frequency**: First occurrence

**Learning**: Drizzle and Zod types are structurally identical but TypeScript needs explicit casting. This is safe because schema.ts derives from schema.zod.ts.

---

### Issue #9: Missing Foreign Key Constraint

**Category**: Schema/Database
**Severity**: Low
**Iteration**: 19
**Timestamp**: 2025-01-08T13:38:40
**Time to Fix**: 15 minutes

**What Happened**:
Created quest with invalid userId (userId: 999) and it succeeded. Should have failed with foreign key constraint error.

**Error Signature**:
```typescript
// This should fail but didn't
await storage.createQuest({
  userId: 999,  // Doesn't exist
  title: "Test",
  ...
});
// ✅ Success (should be ❌ Error!)
```

**Root Cause**:
Drizzle schema didn't define foreign key relationship between quests and users.

**How It Was Fixed**:
```typescript
// Added foreign key reference
export const quests = pgTable('quests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),  // ✅ Added this
  ...
});
```

**Subagent**: code (enhancement)

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - Schema Generator**: Auto-detect foreign key relationships (userId → users.id)
2. 💡 **Validation**: Test referential integrity before approval

**Related Issues**: None
**Frequency**: First occurrence

**Learning**: Schema generator should detect userId fields and add foreign key constraints automatically.

---

### Issue #10: Import Inconsistency (Duplicate of #6)

**Category**: Frontend Build
**Severity**: Low
**Iteration**: 21
**Timestamp**: 2025-01-08T14:05:15
**Time to Fix**: 5 minutes

Same as Issue #6 - import path inconsistency.

**Related Issues**: #6

---

### Issue #11: Timestamp Mode for JSON Serialization

**Category**: Schema/Database
**Severity**: Medium
**Iteration**: 13
**Timestamp**: 2025-01-08T11:40:10
**Time to Fix**: 20 minutes

**What Happened**:
API returning campaigns but createdAt/updatedAt were `{}` (empty objects) in JSON response.

**Error Signature**:
```json
{
  "id": 1,
  "name": "Q1 Campaign",
  "createdAt": {},  // ❌ Should be "2025-01-08T10:00:00Z"
  "updatedAt": {}
}
```

**Root Cause**:
Drizzle timestamp columns default to Date objects which don't serialize to JSON properly.

**How It Was Fixed**:
```typescript
// Before (WRONG)
createdAt: timestamp('created_at').notNull().defaultNow()

// After (CORRECT)
createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow()
//                                   ^^^^^^^^^^^^^^^^
```

**Subagent**: error_fixer (found via Chrome DevTools JSON inspection)

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - Schema Generator**: Always use `{ mode: 'string' }` for timestamps
2. ⚠️ **PIPELINE - Prompt**: Add explicit guidance about timestamp mode
3. 💡 **Validation**: Check API responses serialize correctly

**Related Issues**: None
**Frequency**: First occurrence

**Learning**: Drizzle Date objects don't serialize to JSON. Always use `mode: 'string'` for API-exposed timestamps.

---

### Issue #12: Auth Middleware Ordering

**Category**: Authentication
**Severity**: Critical
**Iteration**: 22
**Timestamp**: 2025-01-08T14:20:50
**Time to Fix**: 35 minutes

**What Happened**:
Protected routes returning 401 even with valid token. Auth was completely broken.

**Error Signature**:
```bash
GET /api/campaigns
Authorization: Bearer valid-token-here
→ 401 Unauthorized
```

**Root Cause**:
Middleware ordering issue. CORS middleware was after auth middleware, causing preflight requests to fail.

**How It Was Fixed**:
```typescript
// Before (WRONG ORDER)
app.use(authMiddleware());  // Auth first
app.use(cors());            // CORS after (breaks preflight!)

// After (CORRECT ORDER)
app.use(cors());            // ✅ CORS first (handle preflight)
app.use(authMiddleware());  // ✅ Auth after
```

**Subagent**: error_fixer (took 3 attempts to find - complex debugging)

**Prevention Opportunities**:
1. ⚠️ **PIPELINE - Server Setup**: Document correct middleware order
2. ⚠️ **PIPELINE - Template**: Include middleware in correct order
3. 💡 **Validation**: Test protected endpoints with preflight requests

**Related Issues**: None
**Frequency**: First occurrence

**Learning**: Middleware order matters! CORS MUST be before auth to handle preflight requests.

---

## Retrospective Analysis

### Pattern Recognition

#### ✅ CONFIRMED PATTERNS (Multiple Occurrences)

**Pattern 1: Auto-Injection Fields**
- **Issues**: #4, #7
- **Root Cause**: Insert schemas including fields that should be auto-injected from auth
- **Fix**: Omit userId, createdBy from all insert schemas
- **Pipeline Change**: AUTO-OMIT pattern in schema generator

**Pattern 2: Import Path Inconsistency**
- **Issues**: #6, #10
- **Root Cause**: Mixed use of @/ and relative imports
- **Fix**: Standardize on @/ everywhere
- **Pipeline Change**: Enforce @/ in page generator critic

#### ⚠️ HIGH-IMPACT ISSUES (Single but Critical)

**Issue #1: Drizzle Casing** (25 min)
- Will affect EVERY app without pipeline fix
- Silent failure (no errors, just empty results)
- **PRIORITY**: Add to schema generator immediately

**Issue #3: Supabase Connection** (45 min)
- Blocks entire generation
- Complex (3 sub-issues: mode, encoding, parameter)
- **PRIORITY**: Add validation and documentation

**Issue #12: Middleware Ordering** (35 min)
- Breaks all protected routes
- Complex debugging (auth seems broken but it's CORS)
- **PRIORITY**: Fix in template

### Time Analysis

**Total Debug Time**: 2h 15min (135 minutes)

**Top 3 Time Sinks**:
1. Supabase connection (45 min) - 33% of total time
2. Middleware ordering (35 min) - 26% of total time
3. Drizzle casing (25 min) - 19% of total time

**Combined**: These 3 issues = 78% of debug time

**Opportunity**: If we fix these in the pipeline, we save **1h 45min per app** (~78% reduction in debug time)

---

## Pipeline Improvement Recommendations

### 🔴 CRITICAL (Implement Immediately)

#### 1. Schema Generator: Auto-Configure Drizzle Casing

**Issues Fixed**: #1 (25 min saved per app)
**Priority**: CRITICAL
**Changes**:
```python
# In schema generator prompt
CRITICAL: After generating schema.ts, ALWAYS update drizzle.config.ts:

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  casing: "snake_case",  // ← MANDATORY: Enables camelCase ↔ snake_case conversion
};

Without this, ALL queries will fail silently (return []).
```

**Validation**: Check drizzle.config.ts has `casing` before approval

---

#### 2. Supabase Connection Validation & Documentation

**Issues Fixed**: #3 (45 min saved per app)
**Priority**: CRITICAL
**Changes**:
```python
# Pre-generation validation
def validate_database_url(url: str) -> bool:
    """Check DATABASE_URL is correctly formatted for Supabase + Drizzle."""
    checks = [
        ("Transaction Mode", ":6543" in url),  # Port 6543 for transaction pooler
        ("pgbouncer param", "?pgbouncer=true" in url),
        ("URL encoding", check_special_chars_encoded(url)),
    ]
    # Report issues before starting generation
```

**Documentation**: Add to pipeline-prompt.md:
```markdown
## CRITICAL: Supabase Connection String

Drizzle requires Transaction Mode pooler (NOT Session Mode):

```bash
# ✅ CORRECT
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# ❌ WRONG (Session Mode - doesn't work with Drizzle)
DATABASE_URL="postgresql://...@...pooler.supabase.com:5432/postgres"

# IMPORTANT:
# - Use port 6543 (Transaction Mode)
# - Add ?pgbouncer=true parameter
# - URL-encode special characters in password (@ → %40, ! → %21)
```
```

---

#### 3. Server Template: Fix Middleware Ordering

**Issues Fixed**: #12 (35 min saved per app)
**Priority**: CRITICAL
**Changes**:
```typescript
// In server template (server/index.ts)
// CORRECT ORDER (documented)

// 1. CORS first (handle preflight)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// 2. Body parsing
app.use(express.json());

// 3. Auth middleware (after CORS, before routes)
app.use(authMiddleware());

// 4. Routes
app.use('/api', router);
```

**Documentation**: Add comment explaining why order matters

---

### 🟡 HIGH PRIORITY (Implement This Week)

#### 4. Schema Generator: Auto-Omit Injection Fields

**Issues Fixed**: #4, #7 (30 min saved per app)
**Priority**: HIGH
**Changes**:
```python
# Schema generator logic
def generate_insert_schema(table_schema):
    """Generate insert schema with auto-injected fields omitted."""

    auto_injection_fields = [
        "id",           # Auto-generated
        "userId",       # From req.user.id
        "createdBy",    # From req.user.id
        "createdAt",    # Auto-timestamp
        "updatedAt",    # Auto-timestamp
    ]

    omit_fields = [field for field in auto_injection_fields if field in table_schema]

    return f"""
export const insert{TableName}Schema = {tableName}Schema.omit({{
  {", ".join(f"{field}: true" for field in omit_fields)}
}});
"""
```

---

#### 5. Schema Generator: Timestamp String Mode

**Issues Fixed**: #11 (20 min saved per app)
**Priority**: HIGH
**Changes**:
```python
# In schema generator prompt
CRITICAL: Timestamps MUST use mode: 'string' for JSON serialization:

✅ CORRECT:
createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow()

❌ WRONG (returns Date objects that break JSON):
createdAt: timestamp('created_at').notNull().defaultNow()

Reason: Drizzle Date objects don't serialize to JSON. APIs must return ISO strings.
```

---

#### 6. Contract Generator: Reject /api Prefix

**Issues Fixed**: #2 (15 min saved per app)
**Priority**: HIGH
**Changes**:
```python
# Contract generator critic
def validate_contract_paths(contract):
    """Ensure paths are relative to mount point."""

    for route in contract.routes:
        if route.path.startswith('/api'):
            return ValidationError(
                f"Path '{route.path}' includes /api prefix. "
                f"Paths should be relative to mount point. "
                f"Change to '{route.path.replace('/api', '')}'"
            )
```

---

### 🟢 MEDIUM PRIORITY (Implement Next Week)

#### 7. Page Generator: Enforce @/ Imports

**Issues Fixed**: #6, #10 (17 min saved per app)
**Priority**: MEDIUM

#### 8. shadcn Generator: Auto-Install lucide-react

**Issues Fixed**: #5 (8 min saved per app)
**Priority**: MEDIUM

#### 9. Schema Generator: Auto-Detect Foreign Keys

**Issues Fixed**: #9 (15 min saved per app)
**Priority**: MEDIUM

---

## Expected Impact

### If We Implement All CRITICAL Fixes:

**Current Debug Time**: 2h 15min per app
**Time Saved**: 1h 45min (78% reduction)
**Remaining Debug Time**: 30min per app

**Issues Prevented**:
- #1 (Drizzle casing) → 100% prevented ✅
- #3 (Supabase connection) → 90% prevented ✅
- #12 (Middleware ordering) → 100% prevented ✅

### If We Implement ALL Fixes (Critical + High + Medium):

**Time Saved**: 2h per app (89% reduction)
**Remaining Debug Time**: 15min per app (edge cases only)

---

## Next Actions

### This Week
1. ✅ Implement CRITICAL fixes (#1, #3, #12) - 2h of work, saves 1h 45min per app
2. ✅ Test with 2 new apps to validate fixes
3. ✅ Update pipeline-prompt.md with learnings

### Next Week
1. ✅ Implement HIGH priority fixes (#4, #5, #6)
2. ✅ Create pattern library for common issues
3. ✅ Train team on new validations

### Monthly
1. ✅ Review issues_found.md from all apps
2. ✅ Identify new patterns
3. ✅ Iterate on pipeline improvements

---

**Generated**: 2025-01-08T15:30:00
**App**: dadcoin
**Total Issues**: 12
**Issues Resolved**: 12 (100%)
**Pipeline Improvements Identified**: 9
**Estimated Time Savings**: 2h per app (89% reduction in debug time)
