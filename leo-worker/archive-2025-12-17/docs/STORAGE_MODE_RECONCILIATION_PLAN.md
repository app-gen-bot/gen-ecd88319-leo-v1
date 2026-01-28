# Storage Mode Reconciliation Plan - Database Only (Drizzle ORM)

**Date**: 2025-11-24
**Status**: 📋 PLAN - Awaiting Review
**Priority**: 🔴 CRITICAL

---

## Executive Summary

**Decision**: Use ONLY `STORAGE_MODE=database` with Drizzle ORM for all database operations.

**Rationale**:
- IPv6 issues now solved by transaction pooler (port 6543, IPv4-compatible)
- Database-agnostic design (easy migration to Neon, Railway, AWS RDS)
- Type-safe with Drizzle ORM
- Better performance than REST API
- Auth adapter should use Drizzle for `public.users` (not Supabase Client SDK)

**Current Problem**: Recent fixes recommended Supabase Client SDK for database operations due to IPv6 issues. This is now obsolete with working pooler solution.

---

## Affected Files (Need Updates)

### 1. Pattern Files (HIGH PRIORITY)

#### ❌ docs/patterns/code_writer/AUTH_SIGNUP_PATTERN.md
**Problem**: Shows auth adapter using `this.adminClient.from('users')` (Supabase Client SDK)
**Fix**: Update to use Drizzle ORM: `await db.insert(schema.users).values(...)`

**Current Code (WRONG)**:
```typescript
// Uses Supabase Client SDK
const { data: newUser } = await this.adminClient
  .from('users')
  .insert({ id: data.user.id, email, name, role })
  .select()
  .single();
```

**Should Be (CORRECT)**:
```typescript
// Uses Drizzle ORM
import { db, schema } from '../db.js';

const [newUser] = await db
  .insert(schema.users)
  .values({ id: data.user.id, email, name, role })
  .returning();
```

**Impact**: Auth adapters generated with wrong pattern will use Supabase Client unnecessarily.

---

#### ❌ docs/NAIJADOMOT_ISSUES_CATEGORIZED_ANALYSIS.md
**Problem**:
- Issue #32 recommends "Make Supabase Client (REST API) the default"
- Issue #34 shows auth adapter using Supabase Client instead of Drizzle
- Multiple references to `STORAGE_MODE=supabase`

**Fix**:
- Update recommendation to "Use transaction pooler with Drizzle ORM"
- Show auth adapter using Drizzle for all `public.users` operations
- Replace `STORAGE_MODE=supabase` references with "pooler fallback strategy"

**Current Recommendation (WRONG)**:
```markdown
**Solution**: Make Supabase Client (REST API) the default for Supabase deployments
```

**Should Be (CORRECT)**:
```markdown
**Solution**: Use transaction pooler with Drizzle ORM (IPv4-compatible, database-agnostic)
- Primary: Drizzle ORM with pooler connection (port 6543)
- Fallback: If pooler unavailable, warn and suggest troubleshooting
```

**Impact**: Future developers will follow outdated guidance and use Supabase Client unnecessarily.

---

### 2. Skills (HIGH PRIORITY)

#### ❌ ~/.claude/skills/code-writer/SKILL.md
**Problem**: Pattern #10 (Auth Signup Endpoint) shows Supabase Client usage

**Current (WRONG)**:
```typescript
// Auth adapter with Supabase Client
const { data: newUser } = await this.adminClient
  .from('users')
  .insert({ id: data.user.id, email, name, role })
```

**Should Be (CORRECT)**:
```typescript
// Auth adapter with Drizzle ORM
import { db, schema } from '../db.js';

const [newUser] = await db
  .insert(schema.users)
  .values({ id: data.user.id, email, name, role })
  .returning();
```

**Action**: Update Pattern #10 in code-writer skill (both locations)

---

#### ✅ ~/.claude/skills/supabase-project-setup/SKILL.md
**Status**: CORRECT - Already uses pooler with Drizzle ORM
**No changes needed** - This skill is the gold standard

Key points already correct:
- Step 9: Autonomous pooler detection (aws-0 vs aws-1)
- Step 10: Configure db.ts with `prepare: false` for pooler
- STORAGE_MODE=database when pooler works
- Only falls back to REST API if pooler detection fails

---

### 3. Subagent System Prompts (HIGH PRIORITY)

#### ❌ src/.../subagents/code_writer.py
**Problem**: Pattern #15 references will point to AUTH_SIGNUP_PATTERN.md with wrong code

**Action**:
- File itself is correct (just references pattern file)
- Will automatically use updated pattern once AUTH_SIGNUP_PATTERN.md is fixed
- No direct changes needed to Python file

---

### 4. Auth Adapter Templates (CRITICAL)

**Check if these exist**:
- Template files in `~/.mcp-tools/templates/`
- Auth adapter scaffolding files
- Any generator code that creates `server/lib/auth/supabase-adapter.ts`

**Action**: Update to use Drizzle ORM, not Supabase Client SDK

---

## Detailed Changes Required

### Change 1: AUTH_SIGNUP_PATTERN.md

**File**: `docs/patterns/code_writer/AUTH_SIGNUP_PATTERN.md`

**Section to Update**: "✅ CORRECT Pattern" → Auth Adapter implementation

**Replace**:
```typescript
// server/lib/auth/supabase-adapter.ts
import { createClient } from '@supabase/supabase-js';

export class SupabaseAuthAdapter {
  private supabase;
  private adminClient;  // Service role key for public.users

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    this.adminClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async signup(email: string, password: string, name: string, phone: string, role: string) {
    // 1. Create in auth.users (Supabase Auth API)
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    // 2. Create in public.users (Supabase Client SDK)
    const { data: newUser, error: dbError } = await this.adminClient
      .from('users')
      .insert({ id: data.user.id, email, name, phone, role })
      .select()
      .single();

    if (dbError) {
      await this.supabase.auth.admin.deleteUser(data.user.id);
      throw new Error(dbError.message);
    }

    return { user: newUser, token: data.session.access_token };
  }
}
```

**With**:
```typescript
// server/lib/auth/supabase-adapter.ts
import { createClient } from '@supabase/supabase-js';
import { db, schema } from '../db.js';

export class SupabaseAuthAdapter {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  async signup(email: string, password: string, name: string, phone: string, role: string) {
    // 1. Create in auth.users (Supabase Auth API)
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('No user returned from signup');

    // 2. Create in public.users (Drizzle ORM)
    try {
      const [newUser] = await db
        .insert(schema.users)
        .values({
          id: data.user.id,
          email,
          name,
          phone: phone || null,
          role,
          emailVerified: false
        })
        .returning();

      return { user: newUser, token: data.session?.access_token || null };
    } catch (dbError: any) {
      // Cleanup: Delete from auth.users if public.users insert fails
      await this.supabase.auth.admin.deleteUser(data.user.id);
      throw new Error(`User record creation failed: ${dbError.message}`);
    }
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw new Error(error.message);

    // Get user from public.users using Drizzle
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, data.user.id))
      .limit(1);

    if (!user) throw new Error('User not found in database');

    return { user, token: data.session.access_token };
  }
}
```

**Key Changes**:
- Remove `adminClient` (no longer needed)
- Import `db` and `schema` from `../db.js`
- Use `db.insert(schema.users)` instead of `adminClient.from('users')`
- Use Drizzle's `.returning()` instead of `.select().single()`
- Consistent with database-only storage mode

---

### Change 2: code-writer SKILL.md (Pattern #10)

**File**: `~/.claude/skills/code-writer/SKILL.md` (and apps/.claude/skills/ copy)

**Section**: Pattern #10 - Auth Signup Endpoint

**Replace** the auth adapter example with the same Drizzle-based code from Change 1.

**Also Update** the "Rule" statement:
```markdown
**OLD Rule**: Auth adapter creates user in BOTH auth.users and public.users. Signup endpoint NEVER calls storage.createUser().

**NEW Rule**: Auth adapter creates user in auth.users (via Supabase Auth API) and public.users (via Drizzle ORM). Signup endpoint NEVER calls storage.createUser().
```

---

### Change 3: NAIJADOMOT_ISSUES_CATEGORIZED_ANALYSIS.md

**File**: `docs/NAIJADOMOT_ISSUES_CATEGORIZED_ANALYSIS.md`

**Issue #32** - Section updates:

**Replace**:
```markdown
**Solution**: Make Supabase Client (REST API) the default for Supabase deployments
```

**With**:
```markdown
**Solution**: Use transaction pooler with Drizzle ORM (now IPv4-compatible)
- Transaction pooler (port 6543) is IPv4-compatible
- Requires `prepare: false` in postgres client config
- Autonomous pooler variant detection (aws-0 vs aws-1)
- See supabase-project-setup skill for complete recipe
```

**Issue #34** - Section updates:

**Replace** all Supabase Client examples with Drizzle ORM examples:

```typescript
// OLD (Supabase Client)
const { data: newUsers } = await this.adminClient
  .from('users')
  .insert({ id: data.user.id, name, role })
  .select()
  .single();

// NEW (Drizzle ORM)
const [newUser] = await db
  .insert(schema.users)
  .values({ id: data.user.id, name, role })
  .returning();
```

**Update recommendations**:
```markdown
## Generator Fix Required: ✅ CRITICAL PRIORITY

**Problem**: Auth adapter should use Drizzle ORM (not Supabase Client SDK)

**Solution**: Enforce Drizzle everywhere - only use Supabase SDK for auth.users operations

**Pattern**:
- Supabase Auth SDK: For auth.users operations (signUp, signIn, getUser)
- Drizzle ORM: For public.users and all app tables
- No STORAGE_MODE=supabase needed - always use database mode
```

**Remove sections**:
- "Step 10: Configure Storage Mode" (no mode choice - always database)
- "Option A: Supabase Client (REST API) - RECOMMENDED" (remove this option)
- "Option B: Drizzle ORM (Direct PostgreSQL) - ADVANCED" (this is now the ONLY option)

---

### Change 4: Remove STORAGE_MODE=supabase References

**Global Search and Replace**:

```bash
# Find all references
grep -r "STORAGE_MODE=supabase" docs/
grep -r "supabase-client-storage" docs/
grep -r "Supabase Client SDK" docs/patterns/
```

**Update Strategy**:
1. Replace `STORAGE_MODE=supabase` → `STORAGE_MODE=database` (with pooler)
2. Replace "Supabase Client SDK for database operations" → "Drizzle ORM"
3. Keep "Supabase Auth SDK" (for auth.users operations only)
4. Update any diagrams or architecture docs

---

## Testing Plan

### Test 1: Verify Pooler Connection
```bash
# In a generated app
cat server/lib/db.ts | grep "prepare: false"
# Should find: prepare: false

cat .env | grep STORAGE_MODE
# Should find: STORAGE_MODE=database
```

### Test 2: Verify Auth Adapter Uses Drizzle
```bash
# Check auth adapter imports
grep "from '../db.js'" server/lib/auth/supabase-adapter.ts
# Should find: import { db, schema } from '../db.js'

# Check auth adapter does NOT use Supabase Client for DB
grep "adminClient.from" server/lib/auth/supabase-adapter.ts
# Should find: nothing

# Check auth adapter uses Drizzle
grep "db.insert(schema.users)" server/lib/auth/supabase-adapter.ts
# Should find: db.insert(schema.users).values(...).returning()
```

### Test 3: End-to-End Signup Flow
```bash
# Start app
npm run dev

# Signup via API
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User","role":"buyer"}'

# Should return: 201 with user object and token
# Should NOT error with IPv6 issues
# Should NOT create duplicate users
```

### Test 4: Verify Database-Agnostic Design
```bash
# Check db.ts only uses Drizzle (no Supabase SDK imports)
grep "from '@supabase/supabase-js'" server/lib/db.ts
# Should find: nothing (db.ts is pure Drizzle)

# Check storage implementations
ls server/lib/storage/
# Should find: memory-storage.ts, drizzle-storage.ts (NO supabase-storage.ts)
```

---

## Implementation Checklist

**Phase 1: Pattern Files** (30 min)
- [ ] Update AUTH_SIGNUP_PATTERN.md (Drizzle examples)
- [ ] Update code-writer SKILL.md Pattern #10 (both locations)
- [ ] Update NAIJADOMOT_ISSUES_CATEGORIZED_ANALYSIS.md (Issue #32, #34)

**Phase 2: Remove Obsolete References** (15 min)
- [ ] Search and remove STORAGE_MODE=supabase references
- [ ] Search and remove supabase-client-storage mentions
- [ ] Update any architecture diagrams

**Phase 3: Validation** (15 min)
- [ ] Run grep checks (no Supabase Client SDK for DB operations)
- [ ] Verify code_writer subagent loads successfully
- [ ] Review all changes for consistency

**Phase 4: Testing** (30 min)
- [ ] Generate test app with Supabase auth
- [ ] Verify pooler connection works
- [ ] Test signup/login flow
- [ ] Verify no IPv6 errors
- [ ] Verify no duplicate user errors

**Total Time**: ~90 minutes

---

## Success Criteria

**After Implementation**:
1. ✅ All pattern files show Drizzle ORM for database operations
2. ✅ Auth adapter uses Drizzle for `public.users` queries
3. ✅ No references to `STORAGE_MODE=supabase` in patterns
4. ✅ No Supabase Client SDK imports in db.ts or storage files
5. ✅ Pooler connection works (no IPv6 errors)
6. ✅ Signup flow works (no duplicate user errors)
7. ✅ Database-agnostic design (easy migration to other DBs)

---

## Rollback Plan

If pooler connection fails in production:

**Option 1: Troubleshoot Pooler** (Recommended)
```bash
# Check if port 6543 is accessible
nc -zv aws-1-us-east-1.pooler.supabase.com 6543

# Verify DATABASE_URL format
echo $DATABASE_URL | grep "pooler.supabase.com:6543"

# Test connection with prepare: false
node -e "import('postgres').then(p => p.default(process.env.DATABASE_URL, {ssl:'require',prepare:false}).then(c => c\`SELECT 1\`.then(() => console.log('✅ Connected'))))"
```

**Option 2: Use Session Pooler** (Alternative)
```bash
# Get session pooler URL from dashboard (port 5432, not 6543)
# Can use prepare: true with session pooler
# Slightly different characteristics but still Drizzle
```

**Option 3: Direct Connection** (Last Resort)
```bash
# Only if network has IPv6 support
# db.PROJECT.supabase.co:5432
# Not portable to Fly.io/Vercel
```

**NOT an option**: Fall back to Supabase Client SDK - defeats database-agnostic design.

---

## Questions for Review

1. **Confirm**: Should we completely remove supabase-client-storage.ts template?
2. **Confirm**: Auth adapter should NEVER use Supabase Client SDK for public.users?
3. **Confirm**: Always use pooler (port 6543) with Drizzle, never direct connection (port 5432)?
4. **Confirm**: If pooler fails, we troubleshoot/fix pooler rather than fall back to REST API?

---

**Document Status**: 📋 PLAN - Awaiting User Review
**Author**: Claude Code Analysis
**Date**: 2025-11-24
**Next Step**: User approval → Implementation
