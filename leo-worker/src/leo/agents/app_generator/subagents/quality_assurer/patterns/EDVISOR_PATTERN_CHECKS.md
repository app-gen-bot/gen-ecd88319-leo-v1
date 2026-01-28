# EdVisor Pattern Checks (5 Critical Validations)

**Purpose:** Automated checks preventing recurring production issues

---

## Check 1: Storage Method Completeness (Issue #5)

```bash
grep -r "throw new Error.*Not implemented" server/lib/storage/
# Expected: ZERO matches

# If found: STOP and report
echo "❌ FAILED: Storage layer incomplete - found stub methods"
```

**Saves:** 60+ minutes

---

## Check 2: ESM Import Extensions (Issue #18)

```bash
find server -name "*.ts" -o -name "*.js" | xargs grep "from '\\./" | grep -v "\\.js'"
# Expected: ZERO matches

# If found: CRITICAL failure
echo "❌ CRITICAL: Missing .js extensions - will fail in production"
```

**Saves:** 2+ hours

---

## Check 3: Database Connection (Issue #23)

```bash
# Check Supabase connection string format
if grep -q "SUPABASE_URL" .env; then
  if grep "pooler.supabase" .env | grep -q "6543"; then
    if grep -q "pgbouncer=true" .env; then
      echo "❌ FAILED: ?pgbouncer=true incompatible with transaction pooler"
    fi
  fi
fi
```

**Saves:** 2+ hours

---

## Check 4: API Contract Paths (Issue #3)

```bash
grep -r "path: '/api/" shared/contracts/
# Expected: ZERO matches

# Paths should be relative to mount point
# ✅ Correct: path: '/users'
# ❌ Wrong: path: '/api/users'
```

**Saves:** 30+ minutes

---

## Check 5: Dynamic Auth Headers (Issue #11)

```bash
# Verify getter property
grep "get Authorization()" client/src/lib/api-client.ts
# Expected: ONE match

# Check for wrong pattern
grep "Authorization.*() =>" client/src/lib/api-client.ts
# Expected: ZERO matches (arrow function doesn't work)
```

**Saves:** 45+ minutes

---

## Automated Validation Script

```bash
#!/bin/bash
echo "Running EdVisor pattern validation..."

FAILED=0

# All 5 checks here...

if [ $FAILED -eq 0 ]; then
  echo "✅ All pattern validations passed"
else
  echo "❌ Pattern validation failed"
  exit 1
fi
```

---

## Why This Matters

These 5 checks prevent hours of debugging. Run after build succeeds, before declaring tests passed.
