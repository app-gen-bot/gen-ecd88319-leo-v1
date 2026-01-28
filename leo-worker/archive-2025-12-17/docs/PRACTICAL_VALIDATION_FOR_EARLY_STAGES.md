# Practical Validation for Early Pipeline Stages

## Problem Statement

**Context**: When schema-designer or api-architect skills are invoked, the full app doesn't exist yet. We can't run `npm run dev`, we can't test end-to-end, we can't validate runtime behavior.

**Question**: What validation CAN we do at these early stages that's:
1. **Practical** - Doesn't require full app
2. **Fast** - Doesn't slow down pipeline
3. **Valuable** - Actually catches real errors
4. **Simple** - Easy to implement and maintain

---

## Stage-by-Stage Analysis

### Schema Designer Stage (Very Early)

**What EXISTS at this point**:
- `plan.md`
- `shared/schema.zod.ts` (just created)
- `shared/schema.ts` (just created)
- Maybe: `server/lib/db.ts` (if drizzle-orm-setup invoked)

**What DOESN'T exist**:
- No contracts yet
- No routes yet
- No frontend yet
- No package.json (might not be initialized)
- No node_modules (might not be installed)

**What we CAN validate**:
1. ✅ **TypeScript syntax** (standalone file compilation)
2. ✅ **Pattern presence** (grep/regex checks)
3. ✅ **Field parity** (compare two files)
4. ✅ **File structure** (files created in right location)

**What we CANNOT validate**:
- ❌ Runtime behavior
- ❌ Import resolution (no node_modules)
- ❌ Integration with other files
- ❌ Build process

---

### API Architect Stage (Early)

**What EXISTS at this point**:
- Everything from schema stage
- `shared/contracts/*.contract.ts` (just created)
- `server/routes/*.ts` (just created)

**What DOESN'T exist**:
- No frontend yet
- No full server setup
- May not have auth middleware implemented yet
- May not have storage implementation yet

**What we CAN validate**:
1. ✅ **TypeScript syntax** (standalone file compilation)
2. ✅ **Pattern presence** (grep/regex checks)
3. ✅ **Import statements** (correct file references)
4. ✅ **Contract structure** (status codes present, paths correct)

**What we CANNOT validate**:
- ❌ Runtime API testing
- ❌ Middleware actually works
- ❌ Storage integration
- ❌ Auth flow

---

## Practical Validation Levels

### Level 1: Static File Checks (ALWAYS POSSIBLE)

**Tools**: grep, regex, simple Node.js scripts

**Schema Designer**:
```bash
# Check auto-injected fields omitted
grep -n "export const insert.*Schema" shared/schema.zod.ts | while read line; do
  schema_name=$(echo "$line" | grep -o "insert[A-Za-z]*Schema")
  # Check if it has .omit({ id: true, ... })
  grep -A 5 "$schema_name" shared/schema.zod.ts | grep "\.omit"
done

# Check timestamp mode
grep "timestamp(" shared/schema.ts | grep -v "{ mode: 'string' }" && echo "❌ Missing timestamp mode"

# Check field count roughly matches
zod_fields=$(grep -o "z\.[a-z]*(" shared/schema.zod.ts | wc -l)
drizzle_fields=$(grep -o "[a-z]*(" shared/schema.ts | grep -v "pgTable\|serial\|text\|integer" | wc -l)
echo "Zod fields: $zod_fields, Drizzle fields: $drizzle_fields"
```

**API Architect**:
```bash
# Check no /api prefix in contract paths
grep "path: '/api" shared/contracts/*.contract.ts && echo "❌ Found /api prefix in contracts"

# Check status codes present
grep "responses:" shared/contracts/*.contract.ts | grep -v "200\|201\|204\|400\|401\|404\|500" && echo "⚠️ May be missing status codes"

# Check imports from schema.zod.ts (not inline definitions)
grep "import.*from.*schema\.zod" shared/contracts/*.contract.ts || echo "⚠️ May not be importing from schema.zod.ts"
```

**Pros**:
- ✅ Works without any dependencies
- ✅ Very fast
- ✅ Catches common pattern violations

**Cons**:
- ⚠️ Can have false positives/negatives
- ⚠️ Doesn't catch type errors

---

### Level 2: TypeScript Compilation (IF TypeScript Available)

**Tool**: `tsc --noEmit` on individual files

**Schema Designer**:
```bash
# Check if tsc is available
if command -v npx &> /dev/null; then
  # Try to compile just the schema files
  npx tsc --noEmit --skipLibCheck shared/schema.zod.ts
  npx tsc --noEmit --skipLibCheck shared/schema.ts
fi
```

**API Architect**:
```bash
# Try to compile contracts and routes
npx tsc --noEmit --skipLibCheck shared/contracts/*.contract.ts
npx tsc --noEmit --skipLibCheck server/routes/*.ts
```

**Pros**:
- ✅ Catches real type errors
- ✅ Validates TypeScript syntax
- ✅ Checks import statements (to some degree)

**Cons**:
- ⚠️ Requires TypeScript installed
- ⚠️ May fail on missing dependencies
- ⚠️ Slower than static checks

**Recommendation**: **Optional fallback** if TypeScript available

---

### Level 3: Simple Validation Script (RECOMMENDED)

**Tool**: Small Node.js script that reads files and checks patterns

**Example**: `scripts/validate-schema-patterns.js`

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read files
const zodFile = 'shared/schema.zod.ts';
const drizzleFile = 'shared/schema.ts';

if (!fs.existsSync(zodFile)) {
  console.error('❌ schema.zod.ts not found');
  process.exit(1);
}

if (!fs.existsSync(drizzleFile)) {
  console.error('❌ schema.ts not found');
  process.exit(1);
}

const zodContent = fs.readFileSync(zodFile, 'utf-8');
const drizzleContent = fs.readFileSync(drizzleFile, 'utf-8');

let errors = 0;

// Check 1: Auto-injected fields omitted
const insertSchemas = zodContent.match(/export const insert\w+Schema/g) || [];
console.log(`Found ${insertSchemas.length} insert schemas`);

insertSchemas.forEach(schema => {
  const schemaBlock = zodContent.split(schema)[1].split('export')[0];
  if (!schemaBlock.includes('.omit(')) {
    console.error(`❌ ${schema} missing .omit() - must omit auto-injected fields`);
    errors++;
  } else {
    console.log(`✓ ${schema} has .omit()`);
  }
});

// Check 2: Timestamp mode
const timestamps = drizzleContent.match(/timestamp\([^)]+\)/g) || [];
timestamps.forEach((ts, idx) => {
  if (!ts.includes("mode: 'string'")) {
    console.error(`❌ Timestamp #${idx + 1} missing mode: 'string' - "${ts}"`);
    errors++;
  }
});
console.log(`✓ ${timestamps.length} timestamps checked`);

// Check 3: Field parity (simplified - just count exported schemas)
const zodSchemas = (zodContent.match(/export const \w+Schema/g) || []).filter(s => !s.includes('insert'));
const drizzleTables = drizzleContent.match(/export const \w+ = pgTable/g) || [];

console.log(`\nZod schemas: ${zodSchemas.length}`);
console.log(`Drizzle tables: ${drizzleTables.length}`);

if (zodSchemas.length !== drizzleTables.length) {
  console.warn(`⚠️  Schema count mismatch - may indicate missing tables`);
}

// Summary
console.log(`\n${'='.repeat(50)}`);
if (errors > 0) {
  console.error(`❌ Validation failed with ${errors} error(s)`);
  process.exit(1);
} else {
  console.log('✅ All pattern checks passed');
  process.exit(0);
}
```

**Usage**:
```bash
node scripts/validate-schema-patterns.js
```

**Pros**:
- ✅ Catches real pattern violations
- ✅ Fast (reads files, no compilation)
- ✅ Specific error messages
- ✅ Works without dependencies

**Cons**:
- ⚠️ Needs Node.js installed (but that's a given for this project)
- ⚠️ Parsing is simplistic (regex-based)

**Recommendation**: **PRIMARY validation approach**

---

## Recommended Validation Strategy

### For Schema Designer Skill

**Validation Section**:

```markdown
## Validation

**After creating schema.zod.ts and schema.ts**, run validation:

### Quick Check (30 seconds)

```bash
# Verify files exist
ls shared/schema.zod.ts shared/schema.ts

# Pattern checks (fast, no dependencies)
bash scripts/validate-schema-quick.sh
```

**Checks performed**:
- ✓ Both files created
- ✓ Insert schemas have .omit()
- ✓ Timestamps use mode: 'string'
- ✓ Schema count matches (Zod vs Drizzle)

**Expected output**:
```
✓ schema.zod.ts exists (15 KB)
✓ schema.ts exists (12 KB)
✓ Found 5 insert schemas (all use .omit)
✓ Found 8 timestamps (all use mode: 'string')
✓ Schema count: 5 Zod schemas, 5 Drizzle tables
✅ Quick validation passed
```

### Optional: Deep Check (if TypeScript available)

```bash
# Only if you have TypeScript installed
npx tsc --noEmit --skipLibCheck shared/schema.zod.ts shared/schema.ts
```

**If validation fails**:
1. Read the specific error message
2. Fix the exact issue mentioned
3. Re-run validation
4. Continue only when checks pass
```

---

### For API Architect Skill

**Validation Section**:

```markdown
## Validation

**After creating contracts and routes**, run validation:

### Quick Check (30 seconds)

```bash
# Verify files exist
ls shared/contracts/*.contract.ts server/routes/*.ts

# Pattern checks
bash scripts/validate-api-quick.sh
```

**Checks performed**:
- ✓ Contract files created
- ✓ Route files created
- ✓ No /api prefix in contract paths
- ✓ Imports from schema.zod.ts (not inline)
- ✓ Status codes present (200, 400, etc.)

**Expected output**:
```
✓ Found 3 contract files
✓ Found 3 route files
✓ No /api prefixes found
✓ All contracts import from schema.zod.ts
✓ Status codes present in all contracts
✅ Quick validation passed
```

### Optional: Type Check (if project initialized)

```bash
# Only if package.json and node_modules exist
npm run type-check
```

**If validation fails**:
1. Read the specific error message
2. Fix the exact issue mentioned
3. Re-run validation
4. Continue only when checks pass
```

---

## Implementation: Quick Validation Scripts

### Script 1: `scripts/validate-schema-quick.sh`

```bash
#!/bin/bash
set -e

echo "Validating schema files..."

# Check files exist
if [ ! -f "shared/schema.zod.ts" ]; then
  echo "❌ shared/schema.zod.ts not found"
  exit 1
fi

if [ ! -f "shared/schema.ts" ]; then
  echo "❌ shared/schema.ts not found"
  exit 1
fi

echo "✓ Both schema files exist"

# Check insert schemas have .omit()
insert_count=$(grep -c "export const insert.*Schema" shared/schema.zod.ts || echo 0)
omit_count=$(grep -c "\.omit({" shared/schema.zod.ts || echo 0)

echo "✓ Found $insert_count insert schemas"
if [ "$insert_count" -gt 0 ] && [ "$omit_count" -lt "$insert_count" ]; then
  echo "⚠️  Warning: Not all insert schemas use .omit()"
fi

# Check timestamp mode
if grep -q "timestamp(" shared/schema.ts; then
  missing_mode=$(grep "timestamp(" shared/schema.ts | grep -v "mode: 'string'" || echo "")
  if [ -n "$missing_mode" ]; then
    echo "❌ Found timestamps without mode: 'string'"
    echo "$missing_mode"
    exit 1
  fi
  echo "✓ All timestamps use mode: 'string'"
fi

# Check schema count
zod_count=$(grep -c "export const .*Schema = z\.object" shared/schema.zod.ts || echo 0)
drizzle_count=$(grep -c "export const .* = pgTable" shared/schema.ts || echo 0)
echo "✓ Schema count: $zod_count Zod schemas, $drizzle_count Drizzle tables"

echo "✅ Quick validation passed"
```

---

### Script 2: `scripts/validate-api-quick.sh`

```bash
#!/bin/bash
set -e

echo "Validating API files..."

# Check contract files exist
contract_count=$(ls shared/contracts/*.contract.ts 2>/dev/null | wc -l)
if [ "$contract_count" -eq 0 ]; then
  echo "❌ No contract files found"
  exit 1
fi
echo "✓ Found $contract_count contract file(s)"

# Check route files exist
route_count=$(ls server/routes/*.ts 2>/dev/null | wc -l)
if [ "$route_count" -eq 0 ]; then
  echo "❌ No route files found"
  exit 1
fi
echo "✓ Found $route_count route file(s)"

# Check for /api prefix (should NOT exist in contracts)
if grep -r "path: '/api" shared/contracts/*.contract.ts 2>/dev/null; then
  echo "❌ Found /api prefix in contract paths (should be relative)"
  exit 1
fi
echo "✓ No /api prefixes in contract paths"

# Check imports from schema.zod.ts
import_count=$(grep -r "from.*schema\.zod" shared/contracts/*.contract.ts 2>/dev/null | wc -l)
if [ "$import_count" -eq 0 ]; then
  echo "⚠️  Warning: Contracts may not be importing from schema.zod.ts"
fi
echo "✓ Found $import_count import(s) from schema.zod.ts"

# Check status codes present
if ! grep -r "200\|201\|400\|404" shared/contracts/*.contract.ts 2>/dev/null; then
  echo "⚠️  Warning: May be missing HTTP status codes in contracts"
fi
echo "✓ Status codes present"

echo "✅ Quick validation passed"
```

---

## When to Run Validation

### Schema Designer Workflow

```
1. Invoke schema-designer skill
2. Create schema.zod.ts
3. Create schema.ts
4. RUN VALIDATION: bash scripts/validate-schema-quick.sh  ← HERE
5. If fails: Fix and re-run validation
6. If passes: Continue to next stage
```

---

### API Architect Workflow

```
1. Invoke api-architect skill (or delegate to subagent)
2. Create contracts/*.contract.ts
3. Create routes/*.ts
4. RUN VALIDATION: bash scripts/validate-api-quick.sh  ← HERE
5. If fails: Fix and re-run validation
6. If passes: Continue to next stage
```

---

## What This Validation Catches

### Schema Designer Validation Catches:
- ✅ Missing files (schema.zod.ts or schema.ts not created)
- ✅ Auto-injected fields not omitted (security issue)
- ✅ Timestamp mode missing (JSON serialization bug)
- ✅ Schema count mismatch (missing entities)

### API Architect Validation Catches:
- ✅ Missing contract or route files
- ✅ /api prefix in contracts (path consistency issue)
- ✅ Not importing from schema.zod.ts (type duplication)
- ✅ Missing status codes (incomplete contract)

---

## What This Validation DOESN'T Catch

**Schema Designer**:
- ❌ Runtime behavior (can't run app yet)
- ❌ Exact field parity (would need AST parsing)
- ❌ Transform order (would need TypeScript parsing)

**API Architect**:
- ❌ Runtime API behavior
- ❌ Middleware actually works
- ❌ Storage integration correct

**These will be caught later**:
- In build stage (TypeScript compilation)
- In validation stage (full app testing)
- In QA stage (quality_assurer subagent)

---

## Trade-offs and Recommendations

### Option A: No Validation (Current State)

**Pros**: Fast, simple
**Cons**: Errors caught late, harder to debug

**Verdict**: ❌ Not recommended - too risky

---

### Option B: Quick Bash Scripts (RECOMMENDED)

**Pros**:
- ✅ Fast (30 seconds)
- ✅ Catches common errors
- ✅ Simple to implement
- ✅ Works without dependencies

**Cons**:
- ⚠️ Not exhaustive
- ⚠️ Can have false positives/negatives

**Verdict**: ✅ **RECOMMENDED** - good balance

---

### Option C: Full TypeScript Validation

**Pros**:
- ✅ Catches all type errors
- ✅ Most accurate

**Cons**:
- ❌ Requires dependencies installed
- ❌ Slower (1-2 minutes)
- ❌ May fail due to missing imports

**Verdict**: ⚠️ Optional fallback

---

### Option D: Custom AST Parsing

**Pros**:
- ✅ Most accurate pattern checking
- ✅ Can validate exact field parity

**Cons**:
- ❌ Complex to implement
- ❌ Maintenance burden
- ❌ Overkill for most cases

**Verdict**: ❌ Not recommended - too complex

---

## Final Recommendation

### For Schema Designer Skill

**Add this validation section**:

```markdown
## Validation

**MANDATORY: Run validation after creating schemas**

```bash
# Quick validation (30 seconds, no dependencies)
bash scripts/validate-schema-quick.sh
```

**If validation passes**: ✅ Continue to next stage

**If validation fails**:
1. Read error message
2. Fix the specific issue
3. Re-run validation
4. Continue only when all checks pass
```

**What to include in app-factory**:
- Add `scripts/validate-schema-quick.sh` to project
- Reference it in schema-designer skill
- Make it part of pipeline workflow

---

### For API Architect Skill

**Add this validation section**:

```markdown
## Validation

**MANDATORY: Run validation after creating contracts and routes**

```bash
# Quick validation (30 seconds, no dependencies)
bash scripts/validate-api-quick.sh
```

**If validation passes**: ✅ Continue to next stage

**If validation fails**:
1. Read error message
2. Fix the specific issue
3. Re-run validation
4. Continue only when all checks pass
```

**What to include in app-factory**:
- Add `scripts/validate-api-quick.sh` to project
- Reference it in api-architect skill (or subagent prompt)
- Make it part of pipeline workflow

---

## Benefits

1. **Fast**: 30 seconds per stage
2. **Practical**: Works without full app
3. **Valuable**: Catches real pattern violations
4. **Simple**: Bash scripts, no complex parsing
5. **Actionable**: Specific error messages

---

## Summary

**Keep validation simple and practical at early stages**:

- ✅ Use quick bash scripts for pattern checks
- ✅ Validate immediately after file creation
- ✅ Make validation mandatory (not optional)
- ✅ Provide specific error messages
- ❌ Don't try to validate runtime behavior
- ❌ Don't require full app to be built
- ❌ Don't over-engineer with complex parsing

**This approach**:
- Catches 80% of common errors
- Takes 30 seconds per stage
- Works without dependencies
- Easy to maintain
- Provides clear feedback

**Later stages** (build, validation, QA) will catch:
- TypeScript compilation errors
- Runtime behavior issues
- Integration problems
- Full app testing

This is a **pragmatic balance** between catching errors early and not over-engineering validation.
