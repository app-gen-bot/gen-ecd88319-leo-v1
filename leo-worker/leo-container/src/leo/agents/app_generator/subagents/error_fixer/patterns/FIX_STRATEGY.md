# Fix Strategy & Verification

**Purpose:** Systematic approach to applying and verifying fixes

---

## Fix Implementation

**MINIMAL CHANGES:**
1. Make smallest possible change
2. Preserve existing patterns
3. Don't refactor unless necessary
4. Fix only the reported issue
5. Maintain code style

---

## Verification Process

After applying fix:

1. **Re-run failing command**
   ```bash
   npm run build  # or whatever failed
   ```

2. **Check for new errors**
   ```bash
   tsc --noEmit
   npm run build
   ```

3. **Test related functionality**
   - If fixed auth → test login flow
   - If fixed API → test CRUD operations
   - If fixed component → check page renders

4. **Verify no regressions**
   - Run tests if available
   - Check other features still work

---

## Fix Documentation

```markdown
## Error Fixed

### Original Error
[Full error message and stack trace]

### Root Cause
[What was actually wrong]

### Fix Applied
- **File:** server/lib/auth.ts:45
- **Change:** Added .js extension to import
- **Reason:** ESM requires explicit extensions

### Verification
- [x] Error resolved
- [x] No new errors
- [x] Related features work
- [x] Build succeeds
```

---

## Example Fix

```typescript
// ❌ BEFORE (causes error)
import { storage } from './storage/factory'
// Error: Cannot find module './storage/factory'

// ✅ AFTER (fixes error)
import { storage } from './storage/factory.js'
// Works in ESM environment

// Verification:
// npm run build → Success
// node dist/index.js → Server starts
// curl localhost:5000/health → 200 OK
```

---

## When to Stop

If ANY of these occur:
- Fix requires major refactoring
- Multiple conflicting solutions
- Uncertainty about root cause
- External dependency issue

→ **Report findings and ask for guidance**

---

## Critical Rules

- Make minimal changes only
- Don't refactor working code
- Preserve existing patterns
- Test fix immediately
- Document changes clearly
- If unsure, investigate more
