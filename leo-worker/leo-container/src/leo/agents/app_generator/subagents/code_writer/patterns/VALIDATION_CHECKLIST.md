# Code Writer: Pre-Completion Validation Checklist

**STOP: Before marking ANY code generation task complete**

Run through this checklist for EVERY file you generate.

---

## Pattern 1: Storage Completeness

```bash
# Check for stub methods
grep -r "throw new Error.*Not implemented" server/lib/storage/
grep -r "TODO: Implement" server/lib/storage/

# Expected: ZERO matches
# If ANY matches found → implementation INCOMPLETE → MUST FIX
```

**Manual check:**
- [ ] ALL IStorage methods fully implemented
- [ ] NO stub methods throwing errors
- [ ] NO TODO comments in storage layer

---

## Pattern 2: Interactive Component State

```bash
# Find interactive components without useState
grep -l "DropdownMenu\|Dialog\|Popover\|Accordion" client/src/pages/*.tsx | \
while read file; do
  if ! grep -q "useState" "$file"; then
    echo "❌ MISSING STATE: $file"
  fi
done

# Expected: ZERO output
```

**Manual check:**
- [ ] DropdownMenu has useState + open prop
- [ ] Dialog has useState + isOpen prop
- [ ] Popover has useState + open prop
- [ ] Accordion has useState + value prop
- [ ] Tabs has useState + activeTab prop

---

## Pattern 3: Auth Helpers

```bash
# Check auth helpers file exists
test -f client/src/lib/auth-helpers.ts && echo "✅ exists" || echo "❌ MISSING"

# Check it contains required functions
grep -c "getAuthToken\|setAuthToken\|clearAuth\|isAuthenticated\|getAuthUser\|setAuthUser" client/src/lib/auth-helpers.ts

# Expected: File exists, 6 functions present
```

**Manual check:**
- [ ] auth-helpers.ts exists
- [ ] Contains getAuthToken()
- [ ] Contains setAuthToken()
- [ ] Contains getAuthUser()
- [ ] Contains setAuthUser()
- [ ] Contains clearAuth()
- [ ] Contains isAuthenticated()
- [ ] NO inline localStorage access in components

---

## Pattern 4: ESM Import Extensions

```bash
# Scan server/ for relative imports without .js
grep -r "from '\\.\\.\\./" server/ | grep -v "\\.js'" | grep -v "node_modules"
grep -r "from '\\./" server/ | grep -v "\\.js'" | grep -v "node_modules"

# Expected: ZERO matches
# If ANY matches found → missing .js extensions → MUST FIX
```

**Manual check:**
- [ ] ALL relative imports in server/ have .js extension
- [ ] npm package imports DON'T have .js extension
- [ ] Path alias imports DON'T have .js extension

---

## Pattern 5: Wouter Routing

```bash
# Check for component prop usage
grep -c "component={" client/src/App.tsx

# Expected: At least N routes using component prop (where N = number of static routes)
```

**Manual check:**
- [ ] Static routes use `component` prop
- [ ] Dynamic routes use inline component or wrapper
- [ ] NO unnecessary render functions

---

## Pattern 6: Date Calculations

```bash
# Check for unclamped date calculations
grep -r "daysElapsed\|progress.*=" server/ client/ | grep -v "Math.max\|Math.min"

# Expected: ZERO matches (all calculations should use Math.max/min)
```

**Manual check:**
- [ ] Date calculations use Math.max/min for clamping
- [ ] No negative progress percentages possible
- [ ] Handles future start dates correctly
- [ ] Handles past end dates correctly

---

## Pattern 7: ID Flexibility

```bash
# Check metrics endpoints for fallback logic (ts-rest handlers)
grep -A 20 "Metrics.*handler" server/routes/*.ts | grep -c "if (!.*)"

# Expected: At least N fallback checks (where N = number of metrics endpoints)
```

**Manual check (if applicable):**
- [ ] Metrics endpoints have ID fallback logic
- [ ] Fallback queries filter by userId
- [ ] Aggregation functions handle multiple entities

---

## Pattern 8: ts-rest v3 API Client

```bash
# Check baseUrl includes /api path
grep "baseUrl.*/api" client/src/lib/api-client.ts && \
  echo "✅ Correct v3 baseUrl" || \
  echo "❌ ERROR: Missing /api in baseUrl"

# Check NO basePath option (v2 only)
grep "basePath" client/src/lib/api-client.ts && \
  echo "❌ ERROR: Using v2 basePath" || \
  echo "✅ No basePath (correct for v3)"

# Check dynamic auth header uses getter
grep "get Authorization()" client/src/lib/api-client.ts && \
  echo "✅ Using getter property" || \
  echo "❌ ERROR: Not using dynamic getter"

# Verify environment variable validation
grep "if (!API_URL)" client/src/lib/api-client.ts && \
  echo "✅ Environment validation present" || \
  echo "⚠️  WARNING: Missing env var validation"
```

**Manual check:**
- [ ] baseUrl includes full path with /api
- [ ] NO basePath option present (v3 doesn't use it)
- [ ] Authorization uses getter property (not arrow function)
- [ ] VITE_API_URL validated before use
- [ ] .env file has VITE_API_URL defined

---

## Pattern 9: React Query Provider

```bash
# Check QueryClientProvider exists
grep "QueryClientProvider" client/src/App.tsx && \
  echo "✅ Provider exists" || \
  echo "❌ ERROR: Missing QueryClientProvider"

# Check QueryClient configured
grep "QueryClient({" client/src/App.tsx && \
  echo "✅ QueryClient configured" || \
  echo "⚠️  WARNING: Using default config"

# Check QueryClient created outside component
grep -B 5 "export default function App" client/src/App.tsx | \
  grep "const queryClient" && \
  echo "✅ QueryClient created outside" || \
  echo "❌ ERROR: QueryClient created inside component"
```

**Manual check:**
- [ ] QueryClient created outside component (module level)
- [ ] QueryClient has defaultOptions configuration
- [ ] QueryClientProvider wraps entire app (outermost provider)
- [ ] AuthProvider inside QueryClientProvider (if using auth)
- [ ] Routes inside all providers (innermost)

---

## Pattern 10: Proxy Method Binding

```bash
# Check auth factory has method binding
grep "value.bind(instance)" server/lib/auth/factory.ts && \
  echo "✅ Method binding exists" || \
  echo "⚠️  No Proxy method binding in auth factory"

# Check storage factory has method binding
grep "value.bind(instance)" server/lib/storage/factory.ts && \
  echo "✅ Method binding exists" || \
  echo "⚠️  No Proxy method binding in storage factory"
```

**Manual check (if using Proxy pattern):**
- [ ] Proxy get handler checks `typeof value === 'function'`
- [ ] Functions are bound: `value.bind(instance)`
- [ ] Non-functions returned as-is
- [ ] Singleton instance pattern (let instance variable)

---

## Pattern 11: ShadCN Component Exports

```bash
# List all components
component_count=$(ls client/src/components/ui/*.tsx 2>/dev/null | grep -v index.tsx | wc -l | xargs)

# Count exports in barrel (if using barrel pattern)
export_count=$(grep -c "^export" client/src/components/ui/index.ts 2>/dev/null || echo 0)

echo "Components: $component_count, Exports: $export_count"

# Check each component is exported (if using barrel)
for component in $(ls client/src/components/ui/*.tsx 2>/dev/null | sed 's|.*/||' | sed 's/.tsx//' | grep -v index); do
  grep -q "export.*$component" client/src/components/ui/index.ts 2>/dev/null || \
    echo "❌ MISSING EXPORT: $component"
done
```

**Manual check (if using barrel exports):**
- [ ] All component files have corresponding exports in index.ts
- [ ] Component names match between file and export
- [ ] Multi-component files export all sub-components

**Alternative (direct imports):**
- [ ] Using direct imports: `from '@/components/ui/button'`
- [ ] No barrel export file needed

---

## Pattern 12: Wouter Link (formerly Pattern 9)

```bash
# Check for nested anchors in Link components
grep -r "<Link.*><a" client/src && echo "❌ ERROR: Nested anchors found" || echo "✅ No nested anchors"

# Check for duplicate keys using href
grep -r "key={.*\.href}" client/src && echo "⚠️  WARNING: Potential duplicate keys using href"
```

**Manual check:**
- [ ] NO nested `<a>` tags inside Link components
- [ ] Link components use unique keys (not href)

---

## Pattern 13: Port Configuration Consistency

```bash
# Check environment variables exist
grep -q "^PORT=" .env || echo "❌ ERROR: PORT not configured in .env"
grep -q "^VITE_API_URL=" .env || echo "❌ ERROR: VITE_API_URL not configured in .env"

# Check for hardcoded ports in client code
hardcoded=$(grep -r "localhost:50[0-9][0-9]" client/src --include="*.ts" --include="*.tsx" | \
  grep -v "VITE_API_URL" | grep -v ".env" | wc -l | xargs)

if [ "$hardcoded" -gt 0 ]; then
  echo "❌ ERROR: Found $hardcoded hardcoded port references"
  grep -r "localhost:50[0-9][0-9]" client/src --include="*.ts" --include="*.tsx" | grep -v "VITE_API_URL"
else
  echo "✅ No hardcoded ports found"
fi

# Check api-client uses env var
grep -q "import.meta.env.VITE_API_URL" client/src/lib/api-client.ts || \
  echo "❌ ERROR: api-client.ts not using VITE_API_URL"
```

**Manual check:**
- [ ] .env file has PORT defined
- [ ] .env file has VITE_API_URL defined
- [ ] NO hardcoded ports in client code
- [ ] api-client.ts uses import.meta.env.VITE_API_URL
- [ ] All client code references VITE_API_URL env var

---

## TypeScript Validation

```bash
# Type checking (if mcp__build_test is available)
# Verifies all types resolve correctly
mcp__build_test__verify_project

# Alternative: Direct TypeScript check
npx tsc --noEmit
```

**Manual check:**
- [ ] File compiles without TypeScript errors
- [ ] All imports resolve correctly
- [ ] Types imported from schema.zod.ts (not redefined inline)
- [ ] No `any` types unless absolutely necessary
- [ ] Proper type annotations on all functions

---

## Frontend-Specific Checks

**For React components that display backend data:**

- [ ] Uses `useQuery` for data fetching (not fetch/axios directly)
- [ ] Has loading state (LoadingSkeleton or spinner)
- [ ] Has error state (ErrorMessage component)
- [ ] Has empty state (EmptyState component with CTA)
- [ ] NO mock/placeholder data (e.g., `const items = []`)
- [ ] Uses `apiClient` imported from '@/lib/api-client'
- [ ] All interactive elements have proper event handlers

**For forms:**

- [ ] Uses react-hook-form with Zod validation
- [ ] Uses useMutation for data mutations
- [ ] Invalidates queries after success
- [ ] Shows loading state on submit button
- [ ] Displays form validation errors
- [ ] Displays mutation errors

---

## Backend-Specific Checks

**For API routes:**

- [ ] Validates request body/query with Zod schema
- [ ] Uses storage factory pattern (not direct DB access)
- [ ] Returns proper HTTP status codes:
  - 201 for POST (created)
  - 200 for GET (success)
  - 204 for DELETE (no content)
  - 400 for validation errors
  - 401 for auth errors
  - 500 for server errors
- [ ] Error handling with try/catch
- [ ] Logs errors appropriately
- [ ] Injects userId from req.user for user-scoped resources
- [ ] Imports query/body schemas from schema.zod.ts (NEVER redefines them)

---

## Code Quality Checks

- [ ] Proper indentation (consistent with codebase)
- [ ] Meaningful variable names (no x, y, temp, data1)
- [ ] Functions are focused (single responsibility)
- [ ] NO console.log statements left in production code
- [ ] NO commented-out code
- [ ] NO TODO comments

---

## Final Verification Step

**Re-read the file you just generated from top to bottom.**

Ask yourself:
1. Would this code work in production?
2. Are all edge cases handled?
3. Is error handling present everywhere?
4. Are loading states present (if frontend)?
5. Are types imported from schema (not redefined)?

If ANY checkbox is unchecked, FIX IT NOW before marking complete.

---

## If ANY Check Fails

**DO NOT proceed with task completion.**

1. STOP immediately
2. Fix the failing check
3. Re-run validation
4. Only mark complete when ALL checks pass

---

## These Patterns Prevent

**EdVisor Production Issues:**
- ✅ Issue #5 - Storage stubs (Pattern 1)
- ✅ Issue #6 - Nested anchors (Pattern 12)
- ✅ Issue #7 - React key warnings & inline auth logic (Patterns 3, 12)
- ✅ Issue #12 - Permanently visible components (Pattern 2)
- ✅ Issue #17 - Missing component state (Pattern 2)
- ✅ Issue #18 - ESM import failures (Pattern 4)
- ✅ Issue #22 - Blank routing pages (Pattern 5)

**Coverage Gaps:**
- ✅ Gap #1 - Date calculation edge cases (Pattern 6)
- ✅ Gap #2 - ID type flexibility (Pattern 7)

**asana-clone Production Issues:**
- ✅ ts-rest v3 API 404 errors (Pattern 8)
- ✅ React Query Provider crashes (Pattern 9)
- ✅ Proxy method binding failures (Pattern 10)
- ✅ ShadCN component import errors (Pattern 11)
- ✅ Port configuration CORS errors (Pattern 13)

**Total Production Failures Prevented**: 13 patterns covering 15+ distinct failure modes

---

**Remember**: These checks exist because EVERY pattern listed here was a real production failure that wasted hours of debugging time.

Don't skip validation. It saves hours of debugging later.
