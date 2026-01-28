# Asana Clone - Issues & Resolutions

**Generated:** 2025-11-03
**Purpose:** Track issues found during asana-clone end-to-end testing and their surgical fixes

---

## Issue #1: Mock Auth Credentials Mismatch (401 Login Error)

### Problem
**Severity:** 🔴 Critical
**Found During:** Chrome DevTools end-to-end testing
**Error:** `401 Unauthorized` when logging in with `demo@example.com / DemoRocks2025!`

### Root Cause
Frontend code (AuthContext.tsx, LoginPage.tsx) uses hardcoded demo credentials that don't match backend mock auth adapter's valid test accounts:
- **Frontend expects:** `demo@example.com`
- **Backend accepts:** `john@app.com` or `admin@app.com`

### Generator Perspective
- Frontend generation uses generic demo credentials
- Backend mock adapter has different hardcoded test accounts
- **No synchronization** between frontend examples and backend test data
- No validation catches credential mismatches

### Resolution (✅ Fixed - 2025-11-03)

**Approach:** Ultra-concise constraint-based specification (prevention over detection)

**Files Modified:**
- `docs/pipeline-prompt.md` (lines 438-457)

**Implementation:**
Added new CRITICAL section "Standardized Mock Auth Test Credentials" specifying:

1. **Hardcoded Standard Accounts:**
   - `john@app.com` / `password123` (userId: `00000000-0000-0000-0000-000000000001`)
   - `admin@app.com` / `admin123` (userId: `00000000-0000-0000-0000-000000000002`)

2. **Mock Adapter Constraints:**
   - Use exact emails, passwords, and userIds above
   - NO "password" or "admin" - use "password123" and "admin123"

3. **LoginPage Requirements:**
   - Display credentials in Alert component at top of form
   - Show both accounts clearly: "john@app.com | password123" format
   - Use Info icon variant
   - Import Alert, AlertDescription from @/components/ui/alert

4. **Updated Example Code:**
   - MOCK_USERS array now uses standardized passwords

**Result:** Future generated apps will have synchronized credentials between frontend and backend, with credentials displayed prominently on login page to prevent user confusion.

---

## Issue #2: ShadCN Component Missing Barrel Exports

### Problem
**Severity:** 🟡 High
**Found During:** AppGeneratorAgent logs during asana-clone generation
**Error:** `Failed to resolve import "@/components/ui/switch"` and `"@/components/ui/select"`

### Root Cause
1. Page generator creates NotificationSettingsPage importing `Switch` and `Select`
2. ShadCN components are generated individually (switch.tsx, select.tsx)
3. **Barrel export (`index.ts`) is never updated** to include new components
4. Build fails because imports can't resolve

### Generator Perspective
- Individual component files are created successfully
- No mechanism to auto-update barrel export file
- No validation checks that imported components are actually exported
- Manual export updates are error-prone and missed

### Resolution (✅ Fixed - 2025-11-03)

**Approach:** Avoid barrel exports entirely - use individual file imports (standard ShadCN practice)

**Files Modified:**
- `docs/pipeline-prompt.md` (lines 1258-1271)

**Implementation:**
Added CRITICAL section "ShadCN Component Setup" specifying:

1. **Page Component Imports (MANDATORY):**
   - ✅ Import from individual files: `import { Switch } from '@/components/ui/switch'`
   - ❌ NEVER from barrel: `import { Switch } from '@/components/ui'`

2. **Why:** Individual imports avoid barrel export sync issues. Standard ShadCN practice.

**Result:** Future generated apps will use individual file imports, eliminating barrel export synchronization issues entirely.

### Original Scalpel Solution (Archive)

#### 1. Auto-Regenerate Barrel Export in `pipeline-prompt.md`

Update ShadCN component installation section (around line 1580):

```markdown
### ShadCN Component Installation (UPDATED - Auto-Export Pattern)

After adding any shadcn component with `npx shadcn@latest add [component]`:

**STEP 1: Auto-Update Barrel Export**
```bash
# Regenerate components/ui/index.ts to export ALL components
cd client/src/components/ui

# Create fresh barrel export
echo "// Auto-generated barrel export - DO NOT EDIT MANUALLY" > index.ts
echo "// Regenerate with: cd client/src/components/ui && for f in *.tsx; do echo \"export * from './\${f%.tsx}';\"; done >> index.ts" >> index.ts
echo "" >> index.ts

# Export all .tsx files
for file in *.tsx; do
  component=$(basename "$file" .tsx)
  echo "export * from './$component';" >> index.ts
done

cd ../../..  # Return to app root
```

**STEP 2: Verify Exports**
```bash
# List all imported UI components from pages
imported=$(grep -rh "from ['\"]@/components/ui/" client/src/pages --include="*.tsx" | \
  sed -E "s/.*from ['\"]@\/components\/ui\/([^'\"]+)['\"].*/\1/" | sort -u)

# Check each is exported
for comp in $imported; do
  grep -q "export.*from.*['\"]\./$comp['\"]" client/src/components/ui/index.ts || \
    echo "❌ ERROR: $comp imported but not exported from index.ts"
done
```

**STEP 3: Ensure Utils Exists (First Component Only)**
```bash
# Check if utils.ts exists, create if missing
if [ ! -f client/src/lib/utils.ts ]; then
  echo "Creating @/lib/utils.ts for shadcn components..."
  cat > client/src/lib/utils.ts << 'EOF'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

  # Install dependencies if not present
  npm install clsx tailwind-merge --save
fi
```
```

#### 2. Add Validation Pattern #10 to `code_writer.py`

Add after Pattern #9 (mock auth), around line 975:

```python
# 10. ShadCN component import/export consistency
echo ""
echo "Pattern #10: ShadCN component barrel exports"

# Check if components/ui directory exists
if [ -d "client/src/components/ui" ]; then
  # Extract all shadcn component imports from pages
  imported_components=$(grep -rh "from ['\"]@/components/ui/" client/src/pages --include="*.tsx" 2>/dev/null | \
    sed -E "s/.*from ['\"]@\/components\/ui\/([^'\"]+)['\"].*/\1/" | sort -u || echo "")

  if [ -n "$imported_components" ]; then
    echo "📦 Checking component exports..."

    # Check each imported component is exported from index.ts
    missing_exports=0
    for component in $imported_components; do
      if ! grep -q "export.*from.*['\"]\./$component['\"]" client/src/components/ui/index.ts 2>/dev/null; then
        echo "❌ ERROR: Component '$component' imported but not exported from components/ui/index.ts"
        missing_exports=$((missing_exports + 1))
      fi
    done

    if [ $missing_exports -eq 0 ]; then
      echo "✅ All imported components are properly exported"
    fi

    # Check if @/lib/utils exists if any component imports it
    if grep -rq "from ['\"]@/lib/utils['\"]" client/src/components/ui 2>/dev/null; then
      if [ ! -f "client/src/lib/utils.ts" ]; then
        echo "❌ ERROR: Components import @/lib/utils but file doesn't exist"
      else
        # Verify utils.ts exports cn() function
        if ! grep -q "export.*cn" client/src/lib/utils.ts; then
          echo "❌ ERROR: utils.ts exists but missing cn() export"
        else
          echo "✅ @/lib/utils.ts exists with cn() helper"
        fi
      fi
    fi
  else
    echo "ℹ️  No shadcn component imports found in pages"
  fi
else
  echo "ℹ️  No components/ui directory found - skipping validation"
fi

# Expected: ZERO errors - all imported components properly exported, utils exists
```

### Implementation Status
- [ ] Update `pipeline-prompt.md` with auto-export pattern
- [ ] Add validation Pattern #10 to `code_writer.py`
- [ ] Update validation summary to include Pattern #10
- [ ] Test auto-regeneration with fresh component addition

---

## Issue #3: Missing @/lib/utils.ts File

### Problem
**Severity:** 🟡 High
**Found During:** AppGeneratorAgent logs - Vite build errors
**Error:** `Failed to resolve import "@/lib/utils" from "client/src/components/ui/switch.tsx"`

### Root Cause
1. ShadCN components (Switch, Select, etc.) import `cn()` helper from `@/lib/utils`
2. Utils file is not auto-created during shadcn component installation
3. First component installation should create utils.ts but doesn't
4. **Dependencies (clsx, tailwind-merge) also not installed**

### Generator Perspective
- ShadCN CLI creates component files but assumes utils already exists
- No check for utils.ts existence before generating components that need it
- No automatic dependency installation for utils requirements

### Resolution (✅ Fixed - 2025-11-03)

**Approach:** Ensure utils.ts exists BEFORE installing any ShadCN components

**Files Modified:**
- `docs/pipeline-prompt.md` (lines 1258-1271)

**Implementation:**
Added to CRITICAL section "ShadCN Component Setup":

1. **Before installing ANY ShadCN components:**
   - Create `client/src/lib/utils.ts` with cn() helper
   - Install dependencies: `npm install clsx tailwind-merge`
   - cn() merges classNames using clsx + tailwind-merge

**Result:** Future generated apps will create utils.ts with required dependencies before adding any ShadCN components, preventing import resolution failures.

---

## Issue #4: Multiple Concurrent Dev Server Processes

### Problem
**Severity:** 🟠 Medium
**Found During:** Chrome DevTools testing - connection refused errors
**Symptom:** Port 5001 showed as listening but connections refused; 4 tsx processes running simultaneously

### Root Cause
1. Multiple `npm run dev` commands started without stopping previous instances
2. tsx watch processes don't properly clean up on termination
3. Processes conflict when trying to bind to same port
4. Server appears to start (logs show initialization) but crashes immediately

### Generator Perspective
**NOT A GENERATOR ISSUE** - This is an environment/testing issue caused by:
- Repeated manual server starts without cleanup
- Background bash processes accumulating
- User error during iterative testing

### Resolution
**Manual Cleanup Process:**
```bash
# Kill all related processes
pkill -f "npm run dev"
pkill -f "tsx watch"

# Verify cleanup
lsof -nP -iTCP -sTCP:LISTEN | grep node

# Start fresh
npm run dev
```

### Prevention
Not applicable to generator - this is a local development environment issue.

---

## Issue #5: Frontend-Backend Test Data Synchronization

### Problem
**Severity:** 🟡 High
**Category:** Related to Issue #1
**Description:** Mock auth valid users may not exist in MemoryStorage test data

### Root Cause
1. Mock auth returns user ID: `00000000-0000-0000-0000-000000000001`
2. MemoryStorage may initialize with different test user IDs
3. After successful login, API calls for user data return 404
4. **Inconsistent UUIDs across mock auth and storage initialization**

### Resolution (✅ Fixed - 2025-11-03)

**Approach:** Cross-reference standardized IDs from Issue #1 fix in existing CRITICAL section

**Files Modified:**
- `docs/pipeline-prompt.md` (lines 780-786)

**Implementation:**
Updated existing CRITICAL section "Seed Data UUID Requirements" to:

1. **Add explicit Issue #5 reference** in section title
2. **Add user ID mismatch prevention** to issue list
3. **Add MUST requirement** to use exact same user IDs as mock-adapter.ts:
   - john@app.com → `00000000-0000-0000-0000-000000000001`
   - admin@app.com → `00000000-0000-0000-0000-000000000002`
4. **Add cross-reference** to Standardized Mock Auth Test Credentials section

**Result:** MemoryStorage seed data will use exact same user IDs as mock auth, preventing 404 errors when authenticated users access their data.

### Original Scalpel Solution (Archive)

#### Add to `pipeline-prompt.md` - Storage Initialization Pattern

After the MemoryStorage example (around line 1250):

```markdown
### MemoryStorage Test Data Initialization (CRITICAL)

When using `STORAGE_MODE=memory`, initialize with test users that match mock auth:

```typescript
// server/lib/storage/mem-storage.ts

// ✅ CRITICAL: Use SAME user IDs as mock-adapter.ts
const TEST_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',  // ← Must match mock auth
    email: 'john@app.com',                       // ← Must match mock auth
    name: 'John Doe',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',  // ← Must match mock auth
    email: 'admin@app.com',                      // ← Must match mock auth
    name: 'Admin User',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  },
];

// Initialize users in constructor
constructor() {
  TEST_USERS.forEach(user => {
    this.users.set(user.id, user);
  });
}
```

**Cross-Reference with Mock Auth:**
```typescript
// server/lib/auth/mock-adapter.ts

const VALID_TEST_ACCOUNTS = [
  { email: 'john@app.com', userId: '00000000-0000-0000-0000-000000000001' },  // ← Same
  { email: 'admin@app.com', userId: '00000000-0000-0000-0000-000000000002' }, // ← Same
];
```
```

#### Add Validation Pattern #11 to `code_writer.py`

```python
# 11. Mock auth and storage test data synchronization
echo ""
echo "Pattern #11: Test data synchronization (auth ↔ storage)"

# Extract user IDs from mock auth
mock_user_ids=$(grep -A5 "VALID_TEST_ACCOUNTS" server/lib/auth/mock-adapter.ts 2>/dev/null | \
  grep -oE "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" | sort || echo "")

# Extract user IDs from memory storage initialization
storage_user_ids=$(grep -A5 "TEST_USERS" server/lib/storage/mem-storage.ts 2>/dev/null | \
  grep -oE "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" | sort || echo "")

if [ -n "$mock_user_ids" ] && [ -n "$storage_user_ids" ]; then
  # Check if IDs match
  if [ "$mock_user_ids" = "$storage_user_ids" ]; then
    echo "✅ Mock auth and storage use synchronized test user IDs"
  else
    echo "❌ ERROR: Mock auth user IDs don't match storage initialization"
    echo "   Mock auth IDs: $mock_user_ids"
    echo "   Storage IDs: $storage_user_ids"
  fi
else
  echo "ℹ️  Test data synchronization check skipped (mock auth or memory storage not found)"
fi

# Expected: User IDs in mock-adapter.ts should match mem-storage.ts initialization
```

### Implementation Status
- [ ] Add storage initialization pattern to `pipeline-prompt.md`
- [ ] Add validation Pattern #11 to `code_writer.py`
- [ ] Update validation summary

---

## Summary Statistics

**Total Issues Found:** 5
**Critical (🔴):** 1 - Mock auth credentials mismatch
**High (🟡):** 3 - ShadCN exports, utils missing, test data sync
**Medium (🟠):** 1 - Multiple server processes (not generator issue)

**Generator Fixes Required:**
- ✅ 3 new validation patterns (#9, #10, #11) for `code_writer.py`
- ✅ 3 new sections in `pipeline-prompt.md`:
  - Authentication test credentials standardization
  - ShadCN auto-export workflow
  - Storage test data initialization

**Implementation Priority:**
1. **Issue #1** (Critical) - Auth credentials mismatch causes complete login failure
2. **Issue #2 + #3** (High) - ShadCN issues prevent pages from loading
3. **Issue #5** (High) - Test data sync prevents authenticated API calls
4. **Issue #4** (N/A) - Not a generator issue

---

## Next Steps

1. [ ] Implement all surgical fixes to `pipeline-prompt.md`
2. [ ] Add validation Patterns #9, #10, #11 to `code_writer.py`
3. [ ] Update validation summary in `code_writer.py` (line 963)
4. [ ] Test with fresh app generation
5. [ ] Re-run Chrome DevTools end-to-end test to verify fixes
6. [ ] Update this document with implementation status

---

**Document Owner:** App Factory Team
**Last Updated:** 2025-11-03
**Next Review:** After implementing surgical fixes
