# Pipeline Improvement Implementation Plan

**Based on**: Fizzcard Retrospective Analysis (retro_changelog.md)
**Target**: AppGeneratorAgent Pipeline (pipeline-prompt.md)
**Date**: October 24, 2025

---

## Executive Summary

**Finding**: The AppGeneratorAgent pipeline has **3 of 4 critical issues** identified in the Fizzcard retrospective, plus shows evidence that similar problems could occur in production.

**Approach**: Use **Claude Skills** (progressive disclosure) to add validation and fixes WITHOUT bloating the 1,050-line pipeline-prompt.md.

**Timeline**: Phased implementation over 3 sprints (P0 → P1 → P2)

---

## Issue Verification Matrix

Comparing Fizzcard failures against current pipeline-prompt.md:

| Issue | Fizzcard | Pipeline Prompt | Evidence | Priority |
|-------|----------|----------------|----------|----------|
| **1. Auth Token Missing** | ❌ Not sent with requests | ✅ **FIXED** | Lines 385-437: Uses getter pattern `get Authorization()` | ✅ DONE |
| **2. Missing Logout** | ❌ No logout route/button | ✅ **FIXED** | Lines 298-301 (route), 483-486 (context) | ✅ DONE |
| **3. Factory Pattern Bug** | ❌ Eager initialization | ❌ **SAME BUG** | Line 256: `export const storage = createStorage()` | 🔴 P0 |
| **4. Schema-Frontend Mismatch** | ❌ Hardcoded limit: 100 vs max: 50 | ❌ **NOT VALIDATED** | No mention of checking query params | 🔴 P0 |
| **5. Production Build Paths** | ❌ Wrong __dirname resolution | ⚠️ **NOT TESTED** | Lines 800-808: Basic validation only | 🟡 P0 |
| **6. Module Loading Order** | ❌ ES6 hoisting issues | ⚠️ **LIKELY SAME** | dotenv/config import pattern | 🟡 P1 |
| **7. Network Graph Crashes** | ❌ Complex query timeout | ⚠️ **UNKNOWN** | No query optimization guidance | 🟢 P2 |

**Summary**:
- ✅ **2 issues already fixed** (auth token, logout)
- 🔴 **2 critical issues present** (factory pattern, schema validation)
- 🟡 **2 likely issues** (production build, module order)
- 🟢 **1 unknown** (performance)

---

## Claude Skills: Progressive Disclosure Architecture

### What Are Claude Skills?

**Announced**: October 2025 by Anthropic
**Purpose**: Modularize specialized knowledge without bloating system prompts

**Structure**:
```
.claude/skills/skill-name/
├── SKILL.md              # Instructions (30-50 tokens when not active)
├── core/                 # Python modules for validation/execution
│   └── validator.py
└── resources/            # Supporting files
```

**Key Properties**:
1. **Progressive Disclosure**: Only loads when needed (~30 tokens until activated)
2. **Composable**: Multiple skills work together automatically
3. **Portable**: Same format across Claude apps, Claude Code, API
4. **Executable**: Can include Python code for validation

### Why Skills for This Pipeline?

**Problem**: pipeline-prompt.md is 1,050 lines. Adding validation logic would make it 1,500+ lines.

**Solution**: Keep prompt concise, add skill invocation points:
```markdown
**Before writing schema**: Invoke `schema-query-validator` skill to ensure frontend respects limits.
```

**Benefits**:
- Prompt stays focused on architecture
- Skills provide deep validation logic
- Easy to test skills independently
- Skills reusable across projects

---

## Current Skills Analysis

### Existing Skills in `.claude/skills/`:

1. **drizzle-orm-setup** ✅
   - Purpose: Configure Drizzle ORM with snake_case conversion
   - Status: Already integrated (line 116 of pipeline-prompt.md)

2. **storage-factory-validation** ✅
   - Purpose: Verify IStorage contract compliance
   - Status: Mentioned (line 224)

3. **supabase-storage** ✅
   - Purpose: PostgreSQL + PostgREST setup
   - Status: Alternative to Drizzle (line 222)

4. **type-safe-queries** ✅
   - Purpose: Choose between Drizzle ORM and PostgREST
   - Status: Decision helper (line 220)

5. **supabase-full-stack** ✅
   - Purpose: Complete Supabase integration
   - Status: Available but not mentioned in prompt

### Gap Analysis

**Missing Skills** (needed for P0 issues):
- ❌ Schema-to-frontend validation
- ❌ Factory pattern lazy initialization
- ❌ Production build smoke testing
- ❌ Module loading order verification

---

## Proposed New Skills

### P0 Skills (Critical Issues)

#### 1. `schema-query-validator`
**Purpose**: Prevent schema-frontend mismatches (Fizzcard Issue #1)

**When to invoke**: After generating frontend query hooks

**What it does**:
1. Reads `shared/schema.zod.ts` to extract query parameter constraints
2. Scans frontend files for query parameter usage
3. Validates: hardcoded values ≤ schema max limits
4. Reports violations with file:line references

**Skill Structure**:
```markdown
# SKILL.md
---
name: Schema Query Validator
description: Validates frontend query parameters match backend schema constraints
applies_when: Generating frontend data-fetching hooks
---

## Instructions

After generating frontend pages with useQuery hooks:

1. Extract all query schemas from shared/schema.zod.ts
2. Find all useQuery calls in client/src/pages/
3. Check: hardcoded limit values ≤ schema.max()
4. Check: filter values match schema.enum()
5. Report violations with fix suggestions

## Example Violation

❌ Bad:
```typescript
// LeaderboardPage.tsx
useQuery({ queryFn: () => api.getLeaderboard({ limit: 100 }) })

// schema.zod.ts
leaderboardQuerySchema = z.object({ limit: z.number().max(50) })
```

✅ Fix: Use schema.max() value or make it configurable
```

**Python Validator** (`core/validator.py`):
```python
import re
from pathlib import Path
from typing import List, Dict

def extract_schema_limits(schema_path: Path) -> Dict[str, int]:
    """Extract max() constraints from Zod schemas."""
    content = schema_path.read_text()
    limits = {}

    # Find patterns: z.number().max(50)
    for match in re.finditer(r'(\w+).*?z\.number\(\)\.max\((\d+)\)', content):
        param_name, max_value = match.groups()
        limits[param_name] = int(max_value)

    return limits

def find_hardcoded_limits(pages_dir: Path) -> List[Dict]:
    """Find hardcoded limit values in useQuery calls."""
    violations = []

    for tsx_file in pages_dir.glob('**/*.tsx'):
        content = tsx_file.read_text()

        # Find patterns: limit: 100
        for line_num, line in enumerate(content.split('\n'), 1):
            if 'limit:' in line:
                match = re.search(r'limit:\s*(\d+)', line)
                if match:
                    violations.append({
                        'file': str(tsx_file),
                        'line': line_num,
                        'value': int(match.group(1))
                    })

    return violations

def validate(app_path: Path) -> List[str]:
    """Validate frontend respects schema limits."""
    schema_limits = extract_schema_limits(app_path / 'shared' / 'schema.zod.ts')
    violations = find_hardcoded_limits(app_path / 'client' / 'src' / 'pages')

    errors = []
    for v in violations:
        # Check if hardcoded value exceeds schema max
        if 'limit' in schema_limits and v['value'] > schema_limits['limit']:
            errors.append(
                f"❌ {v['file']}:{v['line']}\n"
                f"   Hardcoded limit: {v['value']} exceeds schema max: {schema_limits['limit']}"
            )

    return errors
```

---

#### 2. `factory-lazy-init`
**Purpose**: Fix eager factory initialization (Fizzcard Issue #3)

**When to invoke**: Before generating auth/storage factories

**What it does**:
1. Detects `export const storage = createStorage()` pattern
2. Replaces with lazy Proxy pattern
3. Ensures factories initialize AFTER dotenv loads

**Skill Structure**:
```markdown
# SKILL.md
---
name: Factory Lazy Initialization
description: Fixes module loading order bugs with lazy Proxy pattern
applies_when: Generating factory patterns for auth/storage
---

## The Problem

```typescript
// ❌ BAD: Eager initialization
import { createStorage } from './create';
export const storage = createStorage();  // Runs BEFORE dotenv!

// server/index.ts
import './lib/storage/factory';  // Module hoisting executes factory first
import 'dotenv/config';          // Too late!
```

Result: `process.env.STORAGE_MODE` is undefined, always defaults to 'memory'

## The Solution

Use lazy Proxy pattern:

```typescript
// ✅ GOOD: Lazy initialization
let instance: IStorage | null = null;

export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!instance) {
      instance = createStorage();  // Only runs when first accessed
    }
    return instance[prop as keyof IStorage];
  }
});
```

Result: Factory initializes when routes first use it, AFTER dotenv loads

## Implementation

Apply this pattern to BOTH:
- `server/lib/auth/factory.ts`
- `server/lib/storage/factory.ts`
```

**Auto-Fix Code** (`core/fix_factory.py`):
```python
def fix_factory_file(factory_path: Path) -> None:
    """Convert eager initialization to lazy Proxy pattern."""
    content = factory_path.read_text()

    # Detect eager pattern
    if 'export const storage = createStorage()' in content:
        # Replace with lazy pattern
        lazy_pattern = '''
let instance: IStorage | null = null;

export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!instance) {
      instance = createStorage();
    }
    return instance[prop as keyof IStorage];
  }
});
'''
        content = content.replace(
            'export const storage = createStorage();',
            lazy_pattern
        )

        factory_path.write_text(content)
        print(f"✅ Fixed lazy initialization in {factory_path}")
```

---

#### 3. `production-smoke-test`
**Purpose**: Catch production build failures (Fizzcard Issue #5)

**When to invoke**: After Stage 3 validation

**What it does**:
1. Builds app in production mode
2. Starts in Docker container (simulates Fly.io)
3. Tests: static files serve, API responds, auth flow works
4. Reports: path issues, environment variable problems

**Skill Structure**:
```markdown
# SKILL.md
---
name: Production Smoke Test
description: Validates app works in production-like environment
applies_when: After completing validation stage
---

## Test Suite

1. **Build Test**: `npm run build` succeeds
2. **Container Test**: Starts in Docker without errors
3. **Static Files**: GET / returns index.html
4. **Health Endpoint**: GET /health returns 200
5. **Auth Flow**: POST /api/auth/login → POST /api/resource (with token)

## Dockerfile Template

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["node", "dist/server/index.js"]
EXPOSE 5000
```

## Common Failures

❌ **Static path wrong**: `__dirname` resolves to dist/server not dist
✅ **Fix**: Use `path.join(__dirname, '../../../client/dist')`

❌ **Dockerfile CMD wrong**: Points to non-existent file
✅ **Fix**: Match TypeScript output structure
```

**Test Runner** (`core/smoke_test.py`):
```python
import subprocess
import requests
import time

def run_smoke_tests(app_path: Path) -> List[str]:
    """Run production smoke tests."""
    errors = []

    # 1. Build test
    result = subprocess.run(
        ['npm', 'run', 'build'],
        cwd=app_path,
        capture_output=True
    )
    if result.returncode != 0:
        errors.append(f"❌ Build failed: {result.stderr.decode()}")
        return errors  # Stop here if build fails

    # 2. Start server in background
    server = subprocess.Popen(
        ['node', 'dist/server/index.js'],
        cwd=app_path,
        env={'NODE_ENV': 'production', 'PORT': '5555'}
    )

    time.sleep(3)  # Wait for server

    try:
        # 3. Static files test
        resp = requests.get('http://localhost:5555/')
        if resp.status_code != 200 or 'DOCTYPE html' not in resp.text:
            errors.append("❌ Static files not serving")

        # 4. Health endpoint
        resp = requests.get('http://localhost:5555/health')
        if resp.status_code != 200:
            errors.append("❌ Health endpoint failed")

        # 5. Auth flow
        resp = requests.post('http://localhost:5555/api/auth/login',
                           json={'email': 'test@example.com', 'password': 'test'})
        if resp.status_code == 401:  # Expected for mock auth
            pass  # Auth system working
        elif resp.status_code >= 500:
            errors.append(f"❌ Auth endpoint error: {resp.status_code}")

    finally:
        server.terminate()

    return errors
```

---

### P1 Skills (Likely Issues)

#### 4. `module-loading-validator`
**Purpose**: Verify dotenv loads before factory imports

**What it does**:
1. Checks `server/index.ts` for `import 'dotenv/config'` at top
2. Verifies no factory imports happen before dotenv
3. Validates lazy patterns are used

---

### P2 Skills (Performance)

#### 5. `query-optimizer`
**Purpose**: Add LIMIT clauses and pagination to complex queries

**What it does**:
1. Detects queries without LIMIT clauses
2. Adds default pagination (limit: 50, offset: 0)
3. Suggests indexes for foreign key joins

---

## Prompt Enhancements

**Principle**: Add skill invocation points, NOT detailed instructions

### Changes to pipeline-prompt.md

#### Location 1: After Line 256 (Storage Factory)

**Current**:
```markdown
export const storage = createStorage();
```

**Add**:
```markdown
**🔧 SKILLS INTEGRATION - CRITICAL**: Before creating factories, invoke the **`factory-lazy-init` skill** to prevent module loading order bugs. This ensures factories initialize AFTER dotenv loads.

See: `.claude/skills/factory-lazy-init/SKILL.md`

export const storage = createStorage();
```

**Token Cost**: +25 tokens (skill only loads when generating factories)

---

#### Location 2: After Line 437 (API Client)

**Current**:
```typescript
export const apiClient = initClient(contract, { ... });
```

**Add**:
```markdown
**🔧 SKILLS INTEGRATION**: After generating frontend pages, invoke the **`schema-query-validator` skill** to ensure query parameters respect backend schema constraints (e.g., limit ≤ schema.max()).

See: `.claude/skills/schema-query-validator/SKILL.md`
```

**Token Cost**: +20 tokens

---

#### Location 3: After Line 808 (Validation)

**Current**:
```markdown
4. **Server Start**: Verify server runs without errors
```

**Add**:
```markdown
**🔧 SKILLS INTEGRATION**: After basic validation passes, invoke the **`production-smoke-test` skill** to validate the app works in production-like environment (Docker container with correct paths and environment variables).

See: `.claude/skills/production-smoke-test/SKILL.md`
```

**Token Cost**: +25 tokens

---

**Total Addition**: ~70 tokens to 1,050-line prompt (0.07% increase)

---

## Implementation Phases

### Phase 1: P0 Critical Fixes (Sprint 1)

**Week 1: Create Core Skills**
- [ ] Create `.claude/skills/factory-lazy-init/`
  - [ ] Write SKILL.md with problem/solution
  - [ ] Write core/fix_factory.py auto-fixer
  - [ ] Test on existing factory patterns

- [ ] Create `.claude/skills/schema-query-validator/`
  - [ ] Write SKILL.md with validation rules
  - [ ] Write core/validator.py schema parser
  - [ ] Test on Fizzcard leaderboard example

- [ ] Create `.claude/skills/production-smoke-test/`
  - [ ] Write SKILL.md with test cases
  - [ ] Write core/smoke_test.py test runner
  - [ ] Create Dockerfile template

**Week 2: Integrate Skills**
- [ ] Update pipeline-prompt.md with 3 skill invocation points
- [ ] Test skill invocation manually
- [ ] Verify skills only load when needed (check token usage)

**Week 2: Validate**
- [ ] Generate test app with known issues
- [ ] Verify skills catch:
  - ✅ Hardcoded limit: 100 vs schema max: 50
  - ✅ Eager factory initialization
  - ✅ Production build path errors
- [ ] Measure: % of issues caught

**Success Metrics**:
- Skills catch 90% of P0 issues
- Prompt increase < 100 tokens
- Generation time increase < 10%

---

### Phase 2: P1 Enhancements (Sprint 2)

**Week 3: Additional Skills**
- [ ] Create `module-loading-validator` skill
- [ ] Enhance `production-smoke-test` with Docker Compose
- [ ] Add auth flow end-to-end test

**Week 4: Template Improvements**
- [ ] Update factory templates to use lazy pattern by default
- [ ] Add schema introspection helper functions
- [ ] Create production deployment checklist

**Success Metrics**:
- Zero module loading order bugs
- Production deployment success rate > 90%

---

### Phase 3: P2 Performance (Sprint 3)

**Week 5-6: Query Optimization**
- [ ] Create `query-optimizer` skill
- [ ] Add LIMIT/OFFSET guidance to prompt
- [ ] Create performance testing skill

**Success Metrics**:
- No query timeout errors
- All queries < 1 second

---

## Success Metrics (Overall)

### Quantitative

| Metric | Baseline | Target (3mo) |
|--------|----------|--------------|
| Apps functional on first gen | 60% (Fizzcard) | 95% |
| Critical bugs shipped | 4 per app | <1 per app |
| Manual fixes required | 10+ hours | <1 hour |
| Production deployment success | 0% | 90% |
| Schema mismatches | Common | Zero |
| Factory initialization bugs | Common | Zero |

### Qualitative

**Developer Experience**:
- ✅ Prompts stay concise (< 1,200 lines)
- ✅ Skills provide deep validation
- ✅ Clear error messages with fix suggestions
- ✅ Skills reusable across projects

**Code Quality**:
- ✅ Type-safe AND integration-safe
- ✅ Works in dev AND production
- ✅ Environment variables always respected
- ✅ Query parameters validated

---

## Error Handling in Claude Skills

### Research Findings (October 2025)

Based on official Anthropic documentation and community reports:

#### What Happens When Skill Code Fails?

**✅ Conversation CONTINUES** (does not halt):
- When Python code throws an exception, the error is captured and returned to Claude
- Claude receives error information in the tool result
- Claude can then attempt alternative approaches or inform the user

**Error Types Returned**:
- `unavailable`: Tool temporarily unavailable
- `execution_time_exceeded`: Code exceeded timeout
- `container_expired`: Execution environment no longer available
- Python exceptions (e.g., `ValueError`, `FileNotFoundError`)

**Sandbox Limitations**:
- Memory: 5GB RAM
- Disk: 5GB workspace storage
- CPU: 1 CPU
- Container lifespan: 30 days
- No internet access (403 forbidden on web requests)

#### No Automatic Retry

**Important**: Claude does NOT automatically retry failed skills. Instead:
1. Skill executes and returns error
2. Claude receives error message
3. Claude decides next action (try different approach, ask user, etc.)
4. No built-in retry loop

#### Self-Healing Behavior

While there's no automatic retry, Claude can exhibit "self-healing" by:
- **Analyzing error messages** and attempting fixes
- **Trying alternative approaches** based on error type
- **Iterating within conversation** if previous attempt failed
- **Maintaining container state** across multiple requests (can fix and retry)

### Example: Schema Validator Fails

**Scenario**: `schema-query-validator` skill throws exception

```python
# Skill code
def validate(app_path):
    schema_file = app_path / 'shared' / 'schema.zod.ts'
    if not schema_file.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_file}")
    # ...
```

**What Happens**:
1. Python raises `FileNotFoundError`
2. Error returned to Claude: "FileNotFoundError: Schema file not found: /app/shared/schema.zod.ts"
3. Claude reads error and can:
   - ✅ Check if schema is in different location
   - ✅ Ask user where schema file is
   - ✅ Generate schema first if it doesn't exist
   - ✅ Continue with other validation steps

**Conversation continues**, Claude doesn't halt.

### Implications for Our Skills

#### Design for Graceful Degradation

```python
# ❌ BAD: Hard failure halts validation
def validate(app_path):
    schema = parse_schema(app_path / 'shared/schema.zod.ts')  # Throws if missing
    violations = find_violations(schema)  # Never runs if schema missing
    return violations

# ✅ GOOD: Graceful degradation
def validate(app_path):
    errors = []

    # Try to find schema
    schema_path = app_path / 'shared' / 'schema.zod.ts'
    if not schema_path.exists():
        errors.append("⚠️  Schema file not found - skipping validation")
        return errors  # Return warning, not exception

    # Continue with validation
    try:
        schema = parse_schema(schema_path)
        violations = find_violations(schema)
        errors.extend(violations)
    except Exception as e:
        errors.append(f"⚠️  Validation failed: {str(e)}")

    return errors  # Always return list, never throw
```

#### Return Structured Results

```python
# Return dict with success/failure info
def validate(app_path):
    return {
        'success': True,  # or False
        'errors': [],     # List of error messages
        'warnings': [],   # Non-critical issues
        'fixed': []       # Auto-fixes applied
    }
```

#### Log Diagnostics

```python
import sys

def validate(app_path):
    print("🔍 Starting schema validation...", file=sys.stderr)
    print(f"   App path: {app_path}", file=sys.stderr)

    # Claude sees this in error output for debugging
```

### Updated Risk Assessment

#### Risk 1: Skills Don't Load
**Mitigation**:
- Test skill invocation separately
- Ensure SKILL.md frontmatter correct
- Verify code execution tool is enabled

#### Risk 2: Skills Throw Exceptions and Halt Pipeline
**Impact**: ✅ MITIGATED - Conversation continues, Claude can recover
**Additional Mitigation**:
- Design skills with graceful degradation
- Return structured results instead of throwing
- Log diagnostic info for debugging

#### Risk 3: Skills Too Slow
**Mitigation**:
- Use Python (fast), not LLM calls for validation
- Timeout limit: Unknown, but has execution_time_exceeded error
- Keep validation code efficient

#### Risk 4: False Positives
**Mitigation**:
- Start with high-confidence checks only
- Return warnings vs hard errors
- Iterate based on feedback

---

## Comparison: Prompt-Only vs Skills Approach

### Prompt-Only Approach
```markdown
## Schema Validation

IMPORTANT: When generating frontend query hooks, you must:

1. Read shared/schema.zod.ts
2. Find all query parameter schemas
3. Extract max() constraints using regex: z.number().max(\d+)
4. For each useQuery call:
   - Check if limit is hardcoded
   - Verify hardcoded value <= schema max
   - If violation, use schema.max() instead
5. Example violations to avoid:
   - useQuery({ limit: 100 }) when schema has max(50)
   - Using arbitrary numbers instead of reading schema
6. Always use the schema as source of truth...

[Another 20+ lines of detailed instructions]
```

**Cost**: +500 tokens, always loaded

### Skills Approach
```markdown
**🔧 SKILLS**: Invoke `schema-query-validator` skill after generating pages.
```

**Cost**: +20 tokens until skill activates, then 30-50 tokens for skill header

**Benefit**: 95% token reduction, same functionality

---

## Appendix A: Existing Skill Examples

### drizzle-orm-setup Skill (Current)

Shows progressive disclosure in action:

**SKILL.md Header** (~40 tokens):
```yaml
---
name: Drizzle ORM Setup
description: Configures Drizzle with automatic snake_case conversion
applies_when: Setting up database queries
---
```

**Full Instructions** (~400 tokens, only loaded when skill activates):
```markdown
## Problem

Drizzle schema uses camelCase but PostgreSQL uses snake_case...

[Detailed solution]
```

**Token Savings**: 360 tokens per generation that doesn't need Drizzle

---

## Appendix B: Manual Testing Checklist

Before deploying improved pipeline, test:

### Test Case 1: Schema Mismatch
```bash
uv run python run-app-generator.py \
  --prompt-file test-prompts/leaderboard-app.txt \
  --app-name test-schema-validation
```

**Expected**: schema-query-validator skill catches hardcoded limit

### Test Case 2: Factory Pattern
```bash
uv run python run-app-generator.py \
  --prompt-file test-prompts/simple-crud.txt \
  --app-name test-factory-pattern
```

**Expected**: factory-lazy-init skill generates Proxy pattern

### Test Case 3: Production Build
```bash
uv run python run-app-generator.py \
  --prompt-file test-prompts/full-stack-app.txt \
  --app-name test-production
```

**Expected**: production-smoke-test skill validates Docker deployment

---

## Conclusion

This implementation plan addresses **5 of 7** Fizzcard issues using a **skills-first approach** that:

✅ Keeps prompts concise (0.07% increase vs 50% for prompt-only)
✅ Provides deep validation (executable Python code)
✅ Progressive disclosure (only loads when needed)
✅ Reusable across projects
✅ Easy to test independently

**Next Steps**:
1. Review this plan
2. Create P0 skills (Week 1-2)
3. Test on sample apps
4. Iterate based on results

**Timeline**: 6 weeks to 95% functional on first generation.
