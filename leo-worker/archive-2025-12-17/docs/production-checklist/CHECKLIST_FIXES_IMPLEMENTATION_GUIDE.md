# Production Checklist - Implementation Guide for Required Fixes

## Overview
This guide provides specific code examples and implementation steps for fixing the identified issues in the production deployment checklist.

---

## Priority 1: CRITICAL FIXES

### Fix 1: Add Linting Tool (ESLint or OXC)

**Problem**: No linting tool configured. `npm run lint` command missing.

**Solution**: Add ESLint configuration

**Step 1**: Install dependencies
```bash
npm install --save-dev eslint @eslint/js typescript-eslint
```

**Step 2**: Update `package.json`
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

**Step 3**: Create `.eslintrc.json`
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "env": {
    "node": true,
    "browser": true,
    "es2020": true
  },
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ]
  },
  "ignorePatterns": [
    "dist",
    "client/dist",
    "node_modules"
  ]
}
```

**Step 4**: Update checklist
- Add after `npm run typecheck` line:
```markdown
- ✅ **Linting**
  - [ ] `npm run lint` passes with no errors
  - Command: `npm run lint`
```

**Verification**:
```bash
npm run lint
# Should output: "ESLint (11 errors, 3 warnings)"
# Run: npm run lint:fix
# Then: npm run lint
# Should output: "0 errors, 0 warnings"
```

---

### Fix 2: Fix VITE_ Environment Variables

**Problem**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` not prefixed with `VITE_`. Frontend cannot access these.

**Current State** in `.env`:
```
SUPABASE_URL=https://gdlovbbyuehfekkbcfnr.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

**Solution**: Rename with VITE_ prefix

**Step 1**: Update `.env.example`
```bash
# Before
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...

# After
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Also keep server-only variables (no VITE_ prefix)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Step 2**: Update production `.env`
```bash
# Update existing variables
VITE_SUPABASE_URL=https://gdlovbbyuehfekkbcfnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Step 3**: Verify Supabase client initialization in frontend
Check if frontend is using these variables correctly.

Search for Supabase initialization:
```bash
grep -r "createClient\|supabase" client/src/ | head -10
```

**Step 4**: Update checklist Section 1
```markdown
- ✅ **Supabase Client Configuration**
  - [ ] `VITE_SUPABASE_URL` set to production Supabase project
  - [ ] `VITE_SUPABASE_ANON_KEY` set (safe to expose with RLS)
  - Verify: `grep VITE_SUPABASE .env` shows both variables
```

**Verification**:
```bash
grep VITE_SUPABASE .env
# Should show:
# VITE_SUPABASE_URL=https://gdlovbbyuehfekkbcfnr.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
```

---

### Fix 3: Remove Console.log from Client Code

**Problem**: 50+ console.log statements in client code. Exposes internal state in production.

**Solution**: Remove or conditionally execute debug logs

**Step 1**: Find all console.log statements
```bash
grep -rn "console.log" client/src/ | wc -l
# Should return: 0 after fixes
```

**Step 2**: Review and remove/comment them
```bash
grep -rn "console.log" client/src/ | head -20
```

**Step 3**: For logging that's needed during debugging, wrap conditionally
```typescript
// Before (always logs)
console.log('User data:', user);

// After (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('User data:', user);
}

// OR use a debug utility
const debug = import.meta.env.DEV;
if (debug) console.log('...');
```

**Step 4**: Add build-time verification
Create `scripts/verify-production.sh`:
```bash
#!/bin/bash
echo "Checking for console.log in production build..."
npm run build
if grep -q "console\.log" client/dist/assets/*.js; then
  echo "ERROR: console.log found in production build"
  exit 1
fi
echo "OK: No console.log in production build"
```

**Step 5**: Update checklist Section 6
```markdown
- ✅ **Frontend Performance**
  - [ ] No console.log statements in client/src/ code
  - Command: `grep -r "console\.log" client/src/` should return nothing
  - Verify after build: `npm run build && grep "console.log" client/dist/assets/*.js` returns nothing
```

**Verification**:
```bash
npm run build
grep "console\.log" client/dist/assets/*.js
# Should return: (empty)
```

---

### Fix 4: Add HTTP Health Check to fly.toml

**Problem**: No HTTP health check configured. Only TCP checks present.

**Current State** in `fly.toml`:
```toml
[[services.tcp_checks]]
  interval = '15s'
  timeout = '2s'
  grace_period = '1s'
```

**Solution**: Add HTTP health check

**Step 1**: Update `fly.toml`
```toml
[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

  # Add HTTP health check
  [http_service.checks]
    grace_period = "5s"
    interval = "15s"
    method = "GET"
    path = "/api/health"
    protocol = "http"
    timeout = "5s"
```

**Step 2**: Verify health endpoint exists
```bash
curl -s http://localhost:5013/api/health | jq .
# Or in production:
curl -s https://raiseiq.fly.dev/api/health | jq .
```

**Step 3**: Deploy and verify
```bash
flyctl deploy --app raiseiq
# Wait for deployment to complete
flyctl status --app raiseiq
# Should show health checks passing
```

**Step 4**: Update checklist Section 7
```markdown
- ✅ **Pre-Deployment**
  - [ ] Health check endpoint configured in fly.toml
  - [ ] Endpoint path is `/api/health`
  - [ ] Configured as HTTP GET request
  - Verify: `grep -A5 "http_service.checks" fly.toml`

- ✅ **Machine Configuration**
  - [ ] Health checks passing in fly.io dashboard
  - [ ] Machine state = "started"
  - Verify: `flyctl status --app raiseiq`
```

**Verification**:
```bash
grep -A5 "http_service.checks" fly.toml
# Should show health check configuration

# After deployment:
flyctl status --app raiseiq
# Should show health checks passing
```

---

## Priority 2: IMPORTANT FIXES

### Fix 5: Review CORS Configuration

**Problem**: CORS too permissive in production - allows any origin.

**Current Code** in `server/index.ts` (lines 43-60):
```typescript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // PROBLEM: Allows ANY origin in production
      if (process.env.NODE_ENV === 'production') {
        callback(null, true);  // Too permissive!
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
}));
```

**Solution**: Restrict to known origins

**Updated Code**:
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://raiseiq.fly.dev',
  'https://www.raiseiq.com',  // Add your production domain
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

**Update .env.example**:
```bash
# CORS Configuration
CLIENT_URL=https://raiseiq.fly.dev
```

**Update checklist Section 4**:
```markdown
- ✅ **CORS Configuration**
  - [ ] Production domain added to allowed origins
  - [ ] No wildcard origins in production
  - [ ] Credentials enabled: `credentials: true`
  - Verify: Check `server/index.ts` allowedOrigins list
  - Current allowed: localhost:5173, localhost:5174, raiseiq.fly.dev
```

---

### Fix 6: Clarify @shared Import Path Handling

**Problem**: Checklist says "no @shared imports" but app uses them everywhere (11 instances found).

**Current Issue**:
```bash
grep -r "@shared" server/
# Returns 11 results in:
# - server/middleware/auth.ts
# - server/lib/auth/factory.ts
# - server/lib/storage/factory.ts
# - etc.
```

**Solution**: Either allow it OR resolve aliases properly

**Option A: Allow @shared imports (Recommended)**
- Update checklist to recognize this is intentional
- Vite and tsx can both resolve these aliases

**Option B: Resolve aliases in production**
- Configure path alias resolution in `tsconfig.server.json`

**Update checklist Section 2**:
```markdown
- ✅ **Path Aliases**
  - [ ] Path aliases (@shared, @) resolve correctly in build
  - [ ] `npm run build` completes without resolve errors
  - Verify: `npm run build` should show no "Cannot resolve" errors
  - Note: @shared imports in server code are intentional and supported
```

**Verification**:
```bash
npm run build 2>&1 | grep -i "cannot resolve\|not found"
# Should return: (empty)
```

---

### Fix 7: Clarify Bundle Size Metric

**Problem**: Checklist says "< 500KB" but doesn't specify gzipped vs raw.

**Current Reality**:
- Raw: 1,343.51 KB (FAILS)
- Gzipped: 441.48 KB (PASSES)

**Solution**: Update checklist to specify gzipped size

**Update checklist Section 2**:
```markdown
- ✅ **Bundle Size**
  - [ ] Frontend bundle < 500KB (gzipped)
  - Verify: `npm run build` shows final gzip sizes
  - Expected output:
    ```
    dist/assets/index-TFAJw8ZZ.js   1,343.51 kB │ gzip: 441.48 kB
    ```
  - Pass: All .js files have gzip size < 500KB
  - Current: 441.48 KB ✓
```

**Verification**:
```bash
npm run build 2>&1 | grep "gzip:"
# Should show gzip sizes < 500KB for JS bundles
```

---

## Priority 3: AUTOMATION IMPROVEMENTS

### Create Pre-Deployment Verification Script

**File**: `scripts/pre-deploy.sh`

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "PRE-DEPLOYMENT VERIFICATION CHECKLIST"
echo "=========================================="
echo ""

# 1. TypeScript Check
echo "1. Checking TypeScript compilation..."
npm run typecheck
echo "✓ TypeScript OK"
echo ""

# 2. Linting Check
echo "2. Checking code quality (linting)..."
npm run lint
echo "✓ Linting OK"
echo ""

# 3. Build Check
echo "3. Building production bundle..."
npm run build
echo "✓ Build OK"
echo ""

# 4. Environment Check
echo "4. Checking environment variables..."
if ! grep -q "VITE_SUPABASE_URL" .env; then
  echo "✗ VITE_SUPABASE_URL not set in .env"
  exit 1
fi
if ! grep -q "VITE_SUPABASE_ANON_KEY" .env; then
  echo "✗ VITE_SUPABASE_ANON_KEY not set in .env"
  exit 1
fi
if ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env; then
  echo "✗ SUPABASE_SERVICE_ROLE_KEY not set in .env"
  exit 1
fi
echo "✓ Environment variables OK"
echo ""

# 5. Security Check
echo "5. Checking for exposed secrets..."
if grep -r "sk-ant-" client/ 2>/dev/null; then
  echo "✗ API keys found in client code"
  exit 1
fi
if grep -r "SERVICE_ROLE" client/ 2>/dev/null; then
  echo "✗ Service role key found in client code"
  exit 1
fi
echo "✓ No exposed secrets"
echo ""

# 6. Console Check
echo "6. Checking for debug console.log statements..."
if grep -q "console\.log" client/dist/assets/*.js 2>/dev/null; then
  echo "✗ console.log found in production build"
  exit 1
fi
echo "✓ No console.log in production build"
echo ""

# 7. Health Check
echo "7. Verifying health check endpoint exists..."
if ! grep -q "'/api/health'" server/index.ts; then
  echo "✗ Health check endpoint not found"
  exit 1
fi
echo "✓ Health check endpoint configured"
echo ""

echo "=========================================="
echo "✓ ALL PRE-DEPLOYMENT CHECKS PASSED"
echo "=========================================="
echo ""
echo "Ready to deploy! Run:"
echo "  flyctl deploy --no-cache --app raiseiq"
echo ""
```

**Usage**:
```bash
chmod +x scripts/pre-deploy.sh
./scripts/pre-deploy.sh
```

**Add to package.json**:
```json
{
  "scripts": {
    "predeploy": "./scripts/pre-deploy.sh"
  }
}
```

---

### Create Post-Deployment Verification Script

**File**: `scripts/post-deploy.sh`

```bash
#!/bin/bash
set -e

APP_NAME="${1:-raiseiq}"
TIMEOUT=60
ELAPSED=0

echo "=========================================="
echo "POST-DEPLOYMENT VERIFICATION"
echo "=========================================="
echo ""
echo "Waiting for health check endpoint to respond..."
echo ""

while [ $ELAPSED -lt $TIMEOUT ]; do
  if curl -s https://${APP_NAME}.fly.dev/api/health | grep -q "healthy"; then
    echo "✓ Health check endpoint responding"
    break
  fi
  echo "  Waiting... ($ELAPSED/$TIMEOUT seconds)"
  ELAPSED=$((ELAPSED + 5))
  sleep 5
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "✗ Health check timeout - deployment may have failed"
  exit 1
fi

echo ""
echo "Checking health response..."
RESPONSE=$(curl -s https://${APP_NAME}.fly.dev/api/health)
echo "$RESPONSE" | jq .

echo ""
echo "Verifying response contains required fields..."
echo "$RESPONSE" | jq 'has("status") and has("timestamp") and has("authMode") and has("storageMode")'

echo ""
echo "Checking frontend loads..."
if curl -s https://${APP_NAME}.fly.dev/ | grep -q "<!DOCTYPE html>"; then
  echo "✓ Frontend loads successfully"
else
  echo "✗ Frontend not responding"
  exit 1
fi

echo ""
echo "=========================================="
echo "✓ POST-DEPLOYMENT CHECKS PASSED"
echo "=========================================="
echo ""
echo "Deployment successful!"
echo ""
```

**Usage**:
```bash
chmod +x scripts/post-deploy.sh
./scripts/post-deploy.sh raiseiq
```

---

## Timeline for Implementation

### Week 1: Critical Fixes
- Day 1: Add linting tool
- Day 2: Fix VITE_ environment variables
- Day 3: Remove console.log statements
- Day 4: Add fly.toml health check
- Day 5: Test and deploy

### Week 2: Important Fixes
- Fix CORS configuration
- Update @shared import guidance
- Clarify bundle size metric

### Week 3: Automation
- Create pre/post-deploy scripts
- Set up GitHub Actions
- Update deployment runbook

---

## Testing Each Fix

### Test Linting
```bash
npm run lint
# Should output: "0 errors"
```

### Test Environment Variables
```bash
npm run build
grep "VITE_SUPABASE" .env
# Should show VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### Test Console Cleanup
```bash
npm run build
grep "console\.log" client/dist/assets/*.js || echo "OK: No console.log"
```

### Test Health Check
```bash
curl https://raiseiq.fly.dev/api/health | jq .
# Should show: {"status":"healthy","timestamp":"...","authMode":"supabase",...}
```

### Test Pre-Deploy Script
```bash
./scripts/pre-deploy.sh
# Should pass all checks
```

### Test Post-Deploy Script
```bash
./scripts/post-deploy.sh raiseiq
# Should pass health check verification
```

---

## Questions to Answer

1. **Should @shared imports be allowed in server code?**
   - Current: Yes (app uses them)
   - Recommendation: Document as intentional

2. **Which linter to use - ESLint or OXC?**
   - ESLint: More popular, more configurable
   - OXC: Faster, more modern
   - Recommendation: ESLint for compatibility

3. **Should all console.log be removed or just from client?**
   - Current: 50+ in client, many in server
   - Recommendation: Keep in server (helpful for debugging), remove from client

4. **Are there specific domains that should be CORS allowed?**
   - Current: raiseiq.fly.dev only
   - Recommendation: Add production domain(s)

---

## Rollback Procedure

If fixes cause issues:

```bash
# Roll back to previous deployment
flyctl releases list --app raiseiq
flyctl releases rollback <version> --app raiseiq

# Verify rollback
curl https://raiseiq.fly.dev/api/health
```

---

**Last Updated**: October 26, 2025  
**Status**: Ready for implementation  
**Estimated Effort**: 4-6 hours total
