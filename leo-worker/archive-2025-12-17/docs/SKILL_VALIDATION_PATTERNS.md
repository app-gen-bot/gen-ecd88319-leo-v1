# Skill Validation Patterns - Best Practices

## Executive Summary

Skills should include **validation steps** that the main agent runs AFTER applying learned patterns. This catches errors early and prevents cascading failures in multi-step workflows.

**Core Pattern**: Run Validator → Fix Errors → Repeat

**Research Sources**:
- [Anthropic Skill Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [Claude Code Engineering Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## Why Validation Matters

### Problems Validation Prevents

1. **Cascading Failures**: Errors in early files (e.g., schema.zod.ts) propagate to dependent files (contracts, routes, pages)
2. **Silent Bugs**: Pattern misapplication that compiles but causes runtime failures
3. **Incomplete Implementation**: Missing required patterns (e.g., forgot auto-injected field omission)
4. **Drift from Standards**: Code that works but violates project conventions

### Benefits of Early Validation

- **Catch errors before propagation**: Fix schema issues before creating contracts
- **Objective verification**: Scripts provide clear pass/fail signals
- **Specific error messages**: Point to exact problems for faster fixing
- **Quality assurance**: Ensure patterns are applied correctly

---

## Validation Pattern Types

### 1. **Executable Validation Scripts**

**Best for**: Code-based skills (schema-designer, api-architect, code-writer)

**Pattern**:
```markdown
## Validation

After creating schemas, run validation:

```bash
# Validate Zod schemas
node scripts/validate-zod-schemas.js shared/schema.zod.ts

# Validate Drizzle schemas
node scripts/validate-drizzle-schemas.js shared/schema.ts

# Validate field parity
node scripts/validate-field-parity.js
```

**Expected output**: "✓ All validations passed" or specific error messages
```

**Implementation**:
- Create validation scripts in `scripts/` directory
- Scripts should exit with code 0 (success) or 1 (failure)
- Provide **specific error messages** with line numbers and field names

**Example Error Message**:
```
❌ Field parity check failed
File: shared/schema.ts
Line: 42
Issue: Field 'avatarUrl' exists in Zod schema but not in Drizzle schema
Available Drizzle fields: id, email, name, role, createdAt
Fix: Add 'avatarUrl: text("avatar_url")' to Drizzle schema
```

---

### 2. **Linting and Type Checking**

**Best for**: All code generation skills

**Pattern**:
```markdown
## Validation

After generating code, verify type safety and style:

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build test (ensures compilation succeeds)
npm run build
```

**Expected output**: Zero errors
```

**Implementation**:
- Use existing tooling (TypeScript, ESLint, OXC)
- Skills should reference project's validation commands
- Main agent runs these after applying skill patterns

---

### 3. **Reference Document Comparison**

**Best for**: Non-code skills (documentation, architecture)

**Pattern**:
```markdown
## Validation

Compare output against reference:

1. **Checklist Review**: Verify all required sections present
2. **Terminology Check**: Confirm consistent term usage
3. **Format Validation**: Match established style guide

**Checklist**:
- [ ] Executive Summary section present
- [ ] All pattern names use PascalCase
- [ ] Code examples include ✅ CORRECT and ❌ WRONG
- [ ] Templates are complete (not fragments)
```

**Implementation**:
- Provide explicit checklists in skill
- Main agent self-reviews against checklist
- Can use validation questions: "Does output include X?"

---

### 4. **Test-Driven Validation**

**Best for**: Complex logic, algorithms, utilities

**Pattern**:
```markdown
## Validation (Test-Driven)

**BEFORE implementing**, write tests:

```typescript
// tests/schema-validation.test.ts
describe('insertOrdersSchema', () => {
  it('should omit auto-injected fields', () => {
    const schema = insertOrdersSchema;
    expect(schema.shape.id).toBeUndefined();
    expect(schema.shape.userId).toBeUndefined();
    expect(schema.shape.createdAt).toBeUndefined();
  });
});
```

**THEN implement** to pass tests.

**Run validation**:
```bash
npm test
```
```

**Implementation**:
- Write tests based on pattern requirements
- Run tests to confirm they fail (no implementation yet)
- Implement code to pass tests
- Use this for critical patterns (security, data integrity)

---

### 5. **Visual Validation** (UI/Design Skills)

**Best for**: ui_designer skill, component generation

**Pattern**:
```markdown
## Validation (Visual)

After generating components:

1. **Start dev server**: `npm run dev`
2. **Take screenshot**: Use browser DevTools
3. **Compare to design**: Check against design tokens
4. **Verify patterns**:
   - [ ] OKLCH colors used (not hex)
   - [ ] Tailwind classes only (no inline styles)
   - [ ] Mobile responsive (test at 375px width)
   - [ ] Dark mode compatible

**If mismatches**: Iterate and re-validate
```

**Implementation**:
- Use MCP Chrome DevTools for automated screenshots
- Compare against reference designs
- Validate design system adherence

---

## Validation Workflow Pattern

### Standard Flow

```
1. Main Agent: Invoke skill (learn patterns)
   ↓
2. Main Agent: Apply patterns (create/modify files)
   ↓
3. Main Agent: Run validation (skill provides validation steps)
   ↓
4. Validation Result:
   - ✅ Pass → Continue to next task
   - ❌ Fail → Read errors, fix issues, re-validate (loop)
   ↓
5. All validations pass → Task complete
```

### Example: schema-designer Skill

```markdown
## Workflow

### New App (Create)
1. Read plan.md → Identify entities
2. Create schema.zod.ts
3. Create schema.ts
4. **Validate**: Run validation checklist ← VALIDATION STEP

### Validation Checklist

**Run these checks BEFORE proceeding**:

```bash
# 1. Type check schemas
npm run type-check

# 2. Validate field parity
node scripts/validate-field-parity.js

# 3. Check auto-injected fields
node scripts/validate-insert-schemas.js
```

**Expected results**:
- ✓ Type check passes (0 errors)
- ✓ Field parity verified (Zod ↔ Drizzle match)
- ✓ Insert schemas omit id, userId, timestamps

**If validation fails**:
1. Read error message
2. Fix specific issue mentioned
3. Re-run validation
4. Repeat until all checks pass
```

---

## Skill Enhancement: Adding Validation

### Before (No Validation)

```markdown
## Workflow

### New App (Create)
1. Read plan.md → Identify entities
2. Create schema.zod.ts
3. Create schema.ts
4. Done ← NO VALIDATION
```

**Problem**: Pattern misapplication goes undetected until runtime

---

### After (With Validation)

```markdown
## Workflow

### New App (Create)
1. Read plan.md → Identify entities
2. Create schema.zod.ts
3. Create schema.ts
4. **Validate**: Run validation checklist
5. **Fix errors** if validation fails
6. Done (only when validation passes)

## Validation

**MANDATORY: Run validation before proceeding**

```bash
# Validation script
npm run validate:schemas
```

**Checks performed**:
1. ✓ Field parity (Zod ↔ Drizzle)
2. ✓ Auto-injected fields omitted
3. ✓ Transform order correct
4. ✓ Timestamp mode set
5. ✓ Fixed UUIDs in seed data

**Expected output**:
```
✓ Zod schemas valid
✓ Drizzle schemas valid
✓ Field parity verified (6/6 entities)
✓ Insert schemas secure (4/4 omit auto-injected)
✓ All validations passed
```

**On failure**:
- Read specific error message
- Fix the exact issue mentioned
- Re-run validation
- Continue only when all checks pass
```

---

## Implementation Guide

### Step 1: Create Validation Scripts

**For each skill, create validation scripts**:

```bash
# Example: schema validation script
# scripts/validate-schemas.js

const fs = require('fs');
const path = require('path');

function validateFieldParity(zodFile, drizzleFile) {
  // Read both files
  const zodContent = fs.readFileSync(zodFile, 'utf-8');
  const drizzleContent = fs.readFileSync(drizzleFile, 'utf-8');

  // Extract field names (simplified - real implementation would parse AST)
  const zodFields = extractFields(zodContent);
  const drizzleFields = extractFields(drizzleContent);

  // Compare
  const mismatches = [];
  for (const field of zodFields) {
    if (!drizzleFields.includes(field)) {
      mismatches.push({
        field,
        location: 'Drizzle schema',
        issue: `Missing in Drizzle but exists in Zod`
      });
    }
  }

  if (mismatches.length > 0) {
    console.error('❌ Field parity check failed:');
    mismatches.forEach(m => {
      console.error(`  - ${m.field}: ${m.issue}`);
    });
    process.exit(1);
  }

  console.log('✓ Field parity verified');
}

// Run validation
validateFieldParity(
  'shared/schema.zod.ts',
  'shared/schema.ts'
);
```

---

### Step 2: Add Validation Section to Skill

**Template for skills**:

```markdown
## Validation

**Run validation AFTER creating {files}**:

```bash
{validation_command}
```

**Checks performed**:
1. {check_1}
2. {check_2}
3. {check_N}

**Expected output**: {success_message}

**On failure**:
1. Read error message carefully
2. Fix the specific issue mentioned
3. Re-run validation
4. Continue only when all checks pass
```

---

### Step 3: Update Workflow Section

**Add validation step to workflow**:

```markdown
## Workflow

### {Scenario} ({Create/Modify})
1. {Step 1}
2. {Step 2}
3. {Step N}
4. **Validate**: Run validation checklist ← ADD THIS
5. **Fix errors** if validation fails ← ADD THIS
6. Done (only when validation passes) ← CLARIFY THIS
```

---

## Validation Scripts Library

### Essential Validation Scripts for App Factory

#### 1. Schema Validation (`scripts/validate-schemas.js`)

**Checks**:
- Field parity (Zod ↔ Drizzle)
- Auto-injected fields omitted in insert schemas
- Transform order (no refine before omit)
- Timestamp mode set to 'string'

#### 2. Contract Validation (`scripts/validate-contracts.js`)

**Checks**:
- Contract paths have no /api prefix
- All HTTP status codes included (200, 201, 204, 400, 401, 404, 500)
- Imports from schema.zod.ts (not redefined)
- All CRUD operations present

#### 3. Route Validation (`scripts/validate-routes.js`)

**Checks**:
- ts-rest handler pattern used (not Express)
- Auth middleware on protected routes
- Storage accessed via factory (not direct import)
- Return { status: X as const, body: Y } pattern

#### 4. Frontend Validation (`scripts/validate-frontend.js`)

**Checks**:
- API client imports correct (not fetch directly)
- TanStack Query used for server state
- Wouter for routing (not react-router)
- Tailwind classes only (no inline styles)

#### 5. Build Validation (Already Exists)

**Use existing**:
```bash
npm run type-check  # TypeScript
npm run lint        # ESLint/OXC
npm run build       # Compilation
npm test           # Unit tests
```

---

## Validation Levels

### Level 1: Basic (Compilation)

**Always required**:
```bash
npm run type-check
npm run build
```

**Catches**: Syntax errors, type errors, missing imports

---

### Level 2: Pattern Compliance

**Skill-specific validation**:
```bash
npm run validate:schemas    # schema-designer
npm run validate:contracts  # api-architect
npm run validate:routes     # code-writer
```

**Catches**: Pattern violations, missing patterns, incorrect patterns

---

### Level 3: Runtime Validation

**Integration testing**:
```bash
npm run dev             # Start server
npm run test:e2e        # End-to-end tests
```

**Catches**: Runtime errors, integration issues, broken flows

---

### Level 4: Quality Validation

**Code quality checks**:
```bash
npm run lint            # Style violations
npm run test:coverage   # Test coverage gaps
npm run audit           # Security vulnerabilities
```

**Catches**: Code smells, security issues, missing tests

---

## Best Practices

### 1. Make Error Messages Specific

**❌ Bad**:
```
Error: Schema validation failed
```

**✅ Good**:
```
❌ Field parity check failed
File: shared/schema.ts
Line: 42
Entity: users
Issue: Field 'avatarUrl' exists in Zod (schema.zod.ts:15) but missing in Drizzle
Available fields: id, email, name, role, createdAt
Fix: Add 'avatarUrl: text("avatar_url")' to users table definition
```

---

### 2. Provide Clear Exit Codes

**Validation scripts should**:
- Exit 0 on success
- Exit 1 on failure
- Print success message on pass
- Print detailed errors on fail

---

### 3. Validate Early and Often

**Don't wait until the end**:
```markdown
## Workflow

1. Create schema.zod.ts
2. **Validate Zod schemas** ← Early validation
3. Create schema.ts
4. **Validate Drizzle schemas** ← Early validation
5. **Validate field parity** ← Final check
```

---

### 4. Use Existing Tools

**Leverage project infrastructure**:
- TypeScript compiler for type checking
- ESLint/OXC for linting
- Jest/Vitest for testing
- Build process for compilation

**Don't reinvent**: If `npm run build` catches the issue, use that

---

### 5. Make Validation Mandatory

**In skill workflow**:
```markdown
4. **Validate**: Run validation checklist (MANDATORY)
5. **Fix errors** if validation fails (MANDATORY)
6. Done (only when ALL validations pass)
```

**Not optional**: Make it clear validation is required, not suggested

---

## Common Validation Patterns by Skill Type

### Schema Design Skills

**Validations**:
- [ ] Field parity (Zod ↔ Drizzle)
- [ ] Auto-injected fields omitted
- [ ] Transform order correct
- [ ] Timestamp mode set
- [ ] Type check passes

---

### API Design Skills

**Validations**:
- [ ] Contract paths relative (no /api)
- [ ] All status codes included
- [ ] Imports from schema (not inline)
- [ ] CRUD operations complete
- [ ] Type check passes

---

### Code Generation Skills

**Validations**:
- [ ] Type check passes
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Tests pass (if applicable)
- [ ] No console errors in dev mode

---

### UI/Design Skills

**Validations**:
- [ ] Design tokens used
- [ ] Tailwind only (no inline styles)
- [ ] Mobile responsive
- [ ] Dark mode compatible
- [ ] Accessibility standards met

---

## Example: Enhanced schema-designer Skill

### Current Version (No Validation)

```markdown
## Workflow

### New App (Create)
1. Read plan.md → Identify entities
2. Create schema.zod.ts
3. Create schema.ts
4. Done
```

---

### Enhanced Version (With Validation)

```markdown
## Workflow

### New App (Create)
1. Read plan.md → Identify entities
2. Create schema.zod.ts
3. **Validate Zod schemas** (Level 1)
4. Create schema.ts
5. **Validate Drizzle schemas** (Level 1)
6. **Validate field parity** (Level 2)
7. **Run type check** (Level 1)
8. Done (only when all validations pass)

## Validation Steps

### Level 1: Basic Validation

**After creating schema.zod.ts**:
```bash
# Validate Zod syntax
npm run type-check -- shared/schema.zod.ts
```

**Expected**: 0 errors

**After creating schema.ts**:
```bash
# Validate Drizzle syntax
npm run type-check -- shared/schema.ts
```

**Expected**: 0 errors

### Level 2: Pattern Validation

**After creating both files**:
```bash
# Validate schema patterns
node scripts/validate-schemas.js
```

**Checks**:
1. ✓ Field parity (Zod ↔ Drizzle match)
2. ✓ Auto-injected fields omitted in insert schemas
3. ✓ Transform order correct (no refine before omit)
4. ✓ Timestamp mode set to 'string'
5. ✓ Fixed UUIDs in seed data (if present)

**Expected output**:
```
✓ Zod schemas valid (5 entities)
✓ Drizzle schemas valid (5 tables)
✓ Field parity verified (5/5 entities)
✓ Insert schemas secure (5/5 omit auto-injected)
✓ Transform order correct (3/3 refined schemas)
✓ Timestamp mode correct (5/5 timestamps)
✓ All validations passed
```

### On Validation Failure

**Example error**:
```
❌ Field parity check failed

Entity: orders
Issue: Field 'userId' missing in Drizzle schema
Zod schema (schema.zod.ts:42): Has field 'userId: z.number()'
Drizzle schema (schema.ts:58): Missing 'userId' field

Fix: Add to orders table definition:
  userId: integer('user_id').notNull().references(() => users.id)
```

**Action**:
1. Read error message
2. Open schema.ts:58
3. Add missing field
4. Re-run validation
5. Continue when all checks pass
```

---

## Integration with Existing Skills

### drizzle-orm-setup Skill

**Add validation section**:
```markdown
## Validation

After creating db.ts:

```bash
# Validate Drizzle client
node scripts/validate-db-client.js
```

**Checks**:
- ✓ Drizzle client imported from 'drizzle-orm/node-postgres'
- ✓ Schema imported from '../shared/schema'
- ✓ Connection string from environment variable
- ✓ Client exported correctly
```

---

### factory-lazy-init Skill

**Add validation section**:
```markdown
## Validation

After creating factory.ts:

```bash
# Validate factory pattern
node scripts/validate-factory.js server/lib/storage/factory.ts
```

**Checks**:
- ✓ Uses Proxy pattern (not eager initialization)
- ✓ Instance variable declared (let instance = null)
- ✓ Lazy initialization on first access
- ✓ No top-level createStorage() call
```

---

## Summary

### Key Takeaways

1. **Always include validation** in skill workflows
2. **Make validation mandatory** (not optional)
3. **Provide specific error messages** for faster fixing
4. **Validate early** (catch errors before propagation)
5. **Use existing tools** (TypeScript, ESLint, build process)

### Pattern to Follow

```markdown
## Workflow
1. {Task step 1}
2. {Task step 2}
3. **Validate**: Run checks (MANDATORY)
4. **Fix**: If validation fails, fix and re-validate
5. Done (only when all validations pass)

## Validation

**Run after completing task**:
```bash
{validation_command}
```

**Expected output**: {success_message}

**On failure**: Read error, fix issue, re-run validation
```

### Benefits

- ✅ Catches errors early
- ✅ Prevents cascading failures
- ✅ Provides clear fix guidance
- ✅ Ensures pattern compliance
- ✅ Improves code quality

---

## Next Steps

1. **Add validation to schema-designer skill** (already created, needs validation section)
2. **Create validation scripts** (scripts/validate-schemas.js, etc.)
3. **Update existing skills** with validation sections
4. **Test validation workflow** with real app generation
5. **Document validation script APIs** for future skills

See: [SUBAGENT_TO_SKILL_MIGRATION_PLAYBOOK.md](SUBAGENT_TO_SKILL_MIGRATION_PLAYBOOK.md) for integration guidance.
