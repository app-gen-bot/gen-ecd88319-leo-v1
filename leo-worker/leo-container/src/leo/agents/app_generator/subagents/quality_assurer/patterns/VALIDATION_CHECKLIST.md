# Quality Assurer: Validation Checklist

**STOP: Before declaring tests complete**

---

## Code Quality

```bash
# TypeScript compilation
tsc --noEmit
# Expected: No errors

# Build
npm run build
# Expected: Success

# Tests (if exist)
npm test
# Expected: All passing
```

---

## Chrome DevTools (BOTH Local & Production)

- [ ] Open URL with new_page
- [ ] Check console messages (ZERO errors required)
- [ ] Check network requests (all successful)
- [ ] Test user flows (fill, click, wait_for)
- [ ] Take screenshots if issues found

---

## API Testing (Local Only)

- [ ] Health check responds
- [ ] Auth endpoints work (login, logout)
- [ ] CRUD operations for EVERY entity
- [ ] Protected routes require auth
- [ ] Validation errors return 400

---

## EdVisor Pattern Checks

- [ ] Check 1: No storage stubs
- [ ] Check 2: ESM .js extensions present
- [ ] Check 3: Database connection valid
- [ ] Check 4: Route Path Consistency
  - Contract paths relative (no /api prefix in shared/contracts/)
  - Auth routes relative (no /api prefix in server/routes/auth.ts)
  - All routers mounted at /api in server/index.ts
- [ ] Check 5: Auth headers use getter property

### Quick Check 4 Validation:
```bash
# Check contracts have NO /api prefix:
grep -r "path: '/api/" shared/contracts/
# Expected: ZERO matches

# Check routes use ts-rest (not pure Express):
grep -r "router\.\(get\|post\|put\|delete\)" server/routes/ | grep -v "express.Router()"
# Expected: ZERO matches (use initServer() from ts-rest)

# Verify all routes mounted at /api:
grep "app.use('/api'," server/index.ts
# Expected: Multiple matches
```

---

## Frontend

- [ ] All pages load without errors
- [ ] No mock data in components
- [ ] Loading states appear
- [ ] Error handling works
- [ ] Empty states display
- [ ] API calls use apiClient

---

## If ANY Check Fails

1. STOP immediately
2. Document exact error
3. Report to main agent
4. DO NOT proceed

---

## Production Build Validation (CRITICAL)

Run AFTER all code generation, BEFORE marking app complete:

### Commands (All must pass)

```bash
cd {app-path}/client
npm run build

# 1. Dark mode survived tree-shaking
grep -c "\.dark" dist/assets/*.css
# MUST return 1+. If 0: .dark inside @layer base (ui-designer skill issue)

# 2. Tailwind utilities generated
grep -c "rounded-lg" dist/assets/*.css
# MUST return 1+. If 0: postcss.config.js missing explicit path

# 3. CSS file size correct
ls -lh dist/assets/*.css
# MUST be >50KB. If <10KB: Utilities not generated
```

### Visual Verification

- Screenshot production build (serve dist folder, not dev server)
- Verify: Dark background, rounded buttons, drop shadows, gradient text
- If any missing: Run commands above to identify issue

**FAILURE CRITERIA**: If ANY check fails, STOP and fix design system. DO NOT mark complete.

---

## Test Report Format

```markdown
## ✅ Passed Tests
- [list]

## ❌ Failed Tests
- [Test]: [Error Details]
- [Suggested Fix]

## ⚠️ Warnings
- [non-critical issues]

## 📊 Coverage
- API Endpoints: X/Y
- Frontend Pages: X/Y
```
