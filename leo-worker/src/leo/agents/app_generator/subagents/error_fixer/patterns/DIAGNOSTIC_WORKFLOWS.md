# Diagnostic Workflows for Common Errors

**Purpose:** Proven diagnosis patterns for recurring issues

---

## 1. Module Resolution (ERR_MODULE_NOT_FOUND)

**Symptoms:** Works in dev, fails in production/Docker

**Diagnosis:**
```bash
# Check package type
grep '"type"' package.json
# If "module": ESM requires .js extensions

# Find missing extensions
find server -name "*.ts" | xargs grep "from '\\./" | grep -v "\\.js'"

# Check compiled output
ls dist/
```

**Fix:**
```bash
# Add .js to all server relative imports
find server -name "*.ts" -exec sed -i "" "s/from '\\(\\.\\/[^']*\\)'/from '\\1.js'/g" {} \\;

# Verify
npm run build && node dist/index.js
```

**Time:** 5 min (vs 2+ hours)

---

## 2. Database Connection (Supabase Pooler)

**Symptoms:** IPv6 failures, pgbouncer warnings, transaction failures

**Diagnosis:**
```bash
# Check connection string
echo $DATABASE_URL
# Port 6543 = pooler, 5432 = direct

# Check for conflicts
echo $DATABASE_URL | grep "pgbouncer=true"
# If found + port 6543: CONFLICT

# Test connection
psql "$DATABASE_URL" -c "SELECT 1"
```

**Fix:**
```bash
# Transaction pooler for app
DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Direct for migrations
DIRECT_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Remove ?pgbouncer=true
```

**Time:** 10 min (vs 2+ hours)

---

## 3. Authentication Token Stale

**Symptoms:** Login succeeds, API calls return 401

**Diagnosis:**
```bash
# Check for static token
grep -r "Authorization.*Bearer" client/src/lib/

# Verify dynamic getter
grep "get Authorization()" client/src/lib/api-client.ts

# Check auth-helpers
grep "getAuthToken()" client/src/lib/api-client.ts
```

**Fix:**
```typescript
// ✅ CORRECT: Getter property (dynamic)
baseHeaders: {
  get Authorization() {
    const token = getAuthToken();
    return token ? `Bearer ${token}` : '';
  }
}

// ❌ WRONG: Arrow function (static)
Authorization: () => `Bearer ${token}`  // Stale!
```

**Time:** 15 min (vs 1+ hour)

---

## Strategy

1. **Pattern Match** - Identify error type
2. **Run Diagnostic** - Execute workflow
3. **Apply Fix** - Use proven pattern
4. **Verify** - Re-run build/test
5. **Document** - Note error + fix
