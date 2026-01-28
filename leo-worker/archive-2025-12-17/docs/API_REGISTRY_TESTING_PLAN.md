# API Registry System: Agent-by-Agent Testing Plan

**Date**: 2025-10-11
**Status**: Ready for Testing
**Related**: `API_REGISTRY_SYSTEM_PLAN.md`, `API_REGISTRY_IMPLEMENTATION_STATUS.md`

---

## Testing Strategy

Test agents in pipeline execution order to ensure each stage produces correct outputs before testing downstream consumers. Use a simple test application to validate the complete flow.

**Pipeline Order**:
1. Contracts Designer → Produces `.contract.ts` + `.contract.meta.json`
2. TsRest API Client Generator → Produces `api-client.ts` + `api-registry.md`
3. FIS Generators (Master + Page) → Produce specs using only registry methods
4. Page Generators → Produce pages using only registry methods

---

## Test Application Setup

### Prerequisites

```bash
# Ensure you're on the correct branch
git checkout modular-fis-on-7960c030

# Authenticate with CodeArtifact
source auth-codeartifact.sh

# Sync dependencies
uv sync
```

### Create Test Application

For testing, we'll use a minimal application schema with 2-3 entities:

```bash
# Create test app directory
mkdir -p apps/api-registry-test-app/plan

# Create minimal plan
cat > apps/api-registry-test-app/plan/plan.md << 'EOF'
# API Registry Test App

A minimal app for testing the API Registry System.

## Features
1. Users can create and view tasks
2. Users can add comments to tasks

## Entities
- Users: id, name, email
- Tasks: id, title, description, userId (foreign key)
- Comments: id, content, taskId (foreign key), userId (foreign key)
EOF
```

---

## Phase 1: Contracts Designer Testing

**Objective**: Verify that contracts generator produces both `.contract.ts` AND `.contract.meta.json` files with correct structure.

### Test Setup

1. Create minimal schema for test app:

```bash
# Create schema file
mkdir -p apps/api-registry-test-app/app/shared
cat > apps/api-registry-test-app/app/shared/schema.ts << 'EOF'
import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
EOF
```

2. Generate Zod schemas:

```bash
# Run schema to Zod conversion (if you have that agent)
# Or manually create schema.zod.ts for testing
```

3. Run Contracts Designer:

```bash
# Run contracts generator
uv run python -c "
from pathlib import Path
from src.app_factory_leonardo_replit.agents.contracts_designer.agent import ContractsDesignerAgent
import asyncio

async def test():
    app_dir = Path('apps/api-registry-test-app/app')
    contracts_dir = app_dir / 'shared' / 'contracts'
    contracts_dir.mkdir(parents=True, exist_ok=True)

    agent = ContractsDesignerAgent(
        schema_path=str(app_dir / 'shared' / 'schema.zod.ts'),
        contracts_dir=str(contracts_dir),
        plan_path='apps/api-registry-test-app/plan/plan.md'
    )

    success, data, message = await agent.generate_contracts()
    print(f'Success: {success}')
    print(f'Message: {message}')

asyncio.run(test())
"
```

### Expected Outputs

After running, verify these files exist:

```bash
apps/api-registry-test-app/app/shared/contracts/
├── users.contract.ts
├── users.contract.meta.json        ← MUST EXIST
├── tasks.contract.ts
├── tasks.contract.meta.json        ← MUST EXIST
├── comments.contract.ts
├── comments.contract.meta.json     ← MUST EXIST
└── index.ts
```

### Validation Checklist

#### ✅ File Existence
```bash
# Check all metadata files exist
ls -la apps/api-registry-test-app/app/shared/contracts/*.meta.json

# Expected: 3 files (users, tasks, comments)
```

#### ✅ Valid JSON
```bash
# Validate each metadata file is valid JSON
for f in apps/api-registry-test-app/app/shared/contracts/*.meta.json; do
    echo "Validating $f..."
    python -m json.tool "$f" > /dev/null && echo "✅ Valid" || echo "❌ Invalid JSON"
done
```

#### ✅ Metadata Schema Compliance

Check each `.contract.meta.json` file has required fields:

```bash
# Check users.contract.meta.json structure
cat apps/api-registry-test-app/app/shared/contracts/users.contract.meta.json
```

**Required fields**:
- `$schema`: "contract-metadata-v1"
- `entity`: "users", "tasks", or "comments"
- `contractFile`: "{entity}.contract.ts"
- `generatedAt`: ISO 8601 timestamp
- `apiNamespace`: "apiClient.users", etc.
- `methods`: Array with at least CRUD operations

**Each method must have**:
- `name`: Method name (e.g., "getUsers")
- `signature`: Full TypeScript signature
- `httpMethod`: GET, POST, PUT, PATCH, or DELETE
- `path`: API endpoint path
- `description`: Method description
- `parameters`: Object with params/query/body arrays
- `returns`: Return type as string
- `authRequired`: Boolean
- `requiredRole`: String or null

#### ✅ Method Completeness

Each entity should have at minimum:
- `get{Entities}` - List all (GET)
- `get{Entity}` - Get one by ID (GET)
- `create{Entity}` - Create (POST)
- `update{Entity}` - Update (PATCH)
- `delete{Entity}` - Delete (DELETE)

```bash
# Count methods for users
cat apps/api-registry-test-app/app/shared/contracts/users.contract.meta.json | \
    python -c "import json, sys; print(len(json.load(sys.stdin)['methods']))"

# Expected: >= 5 (CRUD + potentially more)
```

#### ✅ Contract-Metadata Match

Verify that metadata accurately reflects the contract:

```bash
# Manual check: Open both files side by side
code apps/api-registry-test-app/app/shared/contracts/users.contract.ts
code apps/api-registry-test-app/app/shared/contracts/users.contract.meta.json
```

**Verify**:
- Every method in contract has corresponding metadata entry
- Method signatures match
- HTTP methods match
- Paths match

### Success Criteria

- [ ] All 3 metadata files exist
- [ ] All metadata files are valid JSON
- [ ] All metadata files have correct schema ($schema: "contract-metadata-v1")
- [ ] Each entity has at least 5 CRUD methods
- [ ] Method signatures match contract definitions
- [ ] Auth fields are set appropriately

### Troubleshooting

**If metadata files missing**:
1. Check agent logs for errors
2. Verify agent has Write tool access
3. Check system prompt was updated correctly
4. Review `contracts_designer/system_prompt.py` line 30-130

**If JSON invalid**:
1. Check for trailing commas
2. Check for unescaped quotes in descriptions
3. Re-run with Critic to catch errors

**If methods incomplete**:
1. Check that plan.md specifies all required operations
2. Verify agent read the schema correctly
3. Check contract files have all methods

---

## Phase 2: TsRest API Client Generator Testing

**Objective**: Verify that the API client generator produces `api-client.ts` AND compiles `api-registry.md` from metadata.

### Test Setup

Assumes Phase 1 completed successfully with metadata files present.

### Run Generator

```bash
# Run the fix_api_client utility directly
uv run python -c "
from pathlib import Path
from src.app_factory_leonardo_replit.utilities.fix_api_client import fix_api_client

app_dir = Path('apps/api-registry-test-app/app')
success = fix_api_client(app_dir)
print(f'Success: {success}')
"
```

Or run via the agent wrapper:

```bash
uv run python -c "
from pathlib import Path
from src.app_factory_leonardo_replit.agents.tsrest_api_client_generator.agent import TsRestApiClientGeneratorAgent
import asyncio

async def test():
    app_dir = Path('apps/api-registry-test-app/app')

    agent = TsRestApiClientGeneratorAgent(
        contracts_dir=str(app_dir / 'shared' / 'contracts'),
        api_client_path=str(app_dir / 'client' / 'src' / 'lib' / 'api.ts'),
        plan_path='apps/api-registry-test-app/plan/plan.md'
    )

    success, data, message = await agent.generate_api_client()
    print(f'Success: {success}')
    print(f'Message: {message}')

asyncio.run(test())
"
```

### Expected Outputs

```bash
apps/api-registry-test-app/app/client/src/lib/
├── api-client.ts         ← Primary client with auth
├── api.ts                ← Re-export for backward compatibility
└── api-registry.md       ← Compiled registry (NEW)
```

### Validation Checklist

#### ✅ File Existence
```bash
# Check all three files exist
ls -la apps/api-registry-test-app/app/client/src/lib/api-client.ts
ls -la apps/api-registry-test-app/app/client/src/lib/api.ts
ls -la apps/api-registry-test-app/app/client/src/lib/api-registry.md
```

#### ✅ API Client Structure

```bash
# Check api-client.ts has required exports
grep -E "(export const apiClient|export const setAuthToken|export const isAuthenticated)" \
    apps/api-registry-test-app/app/client/src/lib/api-client.ts
```

**Required exports**:
- `apiClient` - Main client
- `setAuthToken` - Auth helper
- `isAuthenticated` - Auth check
- Type exports

#### ✅ API Registry Content

```bash
# View the generated registry
cat apps/api-registry-test-app/app/client/src/lib/api-registry.md
```

**Required sections**:
1. Header with generation timestamp
2. Table of Contents with all entities
3. Section per entity with:
   - Entity name as header
   - Namespace (apiClient.{entity})
   - Method count
   - Methods table (Method | HTTP | Path | Description | Auth)
   - Method Details with signatures
4. Usage Guidelines footer

#### ✅ Registry Completeness

```bash
# Count total methods in registry
grep -c "^#### \`apiClient\." apps/api-registry-test-app/app/client/src/lib/api-registry.md

# Expected: 15+ (5 CRUD methods × 3 entities)
```

#### ✅ Registry Accuracy

Manually verify a few methods:

```bash
# Check that users.getUsers is in registry
grep -A 5 "getUsers" apps/api-registry-test-app/app/client/src/lib/api-registry.md
```

**Verify**:
- Method name matches metadata
- HTTP method correct
- Path correct
- Signature matches
- Auth icon (🔒) present if authRequired

#### ✅ File Size

```bash
# Check registry file size
wc -c apps/api-registry-test-app/app/client/src/lib/api-registry.md

# Expected: 2-5 KB for 3 entities (~15 methods)
```

### Success Criteria

- [ ] api-client.ts created with auth support
- [ ] api.ts created as re-export
- [ ] api-registry.md created
- [ ] Registry contains all 3 entities
- [ ] Registry contains all methods (15+)
- [ ] Registry file size < 5KB
- [ ] Method signatures match metadata
- [ ] Auth markers (🔒) present for protected methods

### Troubleshooting

**If api-registry.md missing**:
1. Check metadata files exist (Phase 1)
2. Check logs for "⚠️ No metadata files found"
3. Verify `compile_api_registry_from_metadata()` was called
4. Check `fix_api_client.py` lines 323-330

**If registry incomplete**:
1. Verify all metadata files are valid JSON
2. Check metadata files have non-empty methods arrays
3. Re-run compilation manually

**If file size > 5KB**:
1. This is acceptable but unexpected for 3 entities
2. Check if method descriptions are excessively long
3. May indicate too many methods (not necessarily a problem)

---

## Phase 3: FIS Generators Testing

**Objective**: Verify that FIS generators (master and page-level) read the API registry and use ONLY methods from it.

### Test Setup

Assumes Phases 1-2 completed successfully.

### 3A: Master FIS Generator

#### Run Generator

```bash
uv run python -c "
from pathlib import Path
from src.app_factory_leonardo_replit.agents.frontend_interaction_spec.agent import FrontendInteractionSpecAgent
import asyncio

async def test():
    app_dir = Path('apps/api-registry-test-app/app')

    agent = FrontendInteractionSpecAgent(
        contracts_dir=str(app_dir / 'shared' / 'contracts'),
        schema_path=str(app_dir / 'shared' / 'schema.zod.ts'),
        spec_path=str(app_dir.parent / 'specs' / 'frontend-interaction-spec-master.md'),
        plan_path='apps/api-registry-test-app/plan/plan.md'
    )

    success, spec_content, message = await agent.generate_interaction_spec()
    print(f'Success: {success}')
    print(f'Message: {message}')

asyncio.run(test())
"
```

#### Expected Output

```bash
apps/api-registry-test-app/specs/
└── frontend-interaction-spec-master.md
```

#### Validation Checklist

##### ✅ File Existence
```bash
ls -la apps/api-registry-test-app/specs/frontend-interaction-spec-master.md
```

##### ✅ Registry Was Read

Check agent logs for:
```
"Read file: client/src/lib/api-registry.md"
```

Or check the spec file references registry:
```bash
# The spec should mention reading the registry
grep -i "api.registry\|registry" apps/api-registry-test-app/specs/frontend-interaction-spec-master.md
```

##### ✅ Only Registry Methods Used

Extract all API method references from the spec:

```bash
# Find all apiClient method calls
grep -Eo "apiClient\.[a-zA-Z]+\.[a-zA-Z]+\(" \
    apps/api-registry-test-app/specs/frontend-interaction-spec-master.md | \
    sort -u
```

**Verify each method exists in registry**:

For each method found (e.g., `apiClient.users.getUsers`):
```bash
# Check it exists in registry
grep "apiClient.users.getUsers" apps/api-registry-test-app/app/client/src/lib/api-registry.md
```

##### ✅ No Hallucinated Methods

**Common hallucinations to check for**:
- `getTaskImages()` - If schema has imageUrls field
- `getUserProfile()` - If only `getUser()` exists
- `getTaskComments()` - If not in registry
- Any method with "get{Entity}{RelatedEntity}" pattern

```bash
# Search for suspicious methods
grep -Eo "apiClient\.[a-zA-Z]+\.get[A-Z][a-zA-Z]*[A-Z][a-zA-Z]*\(" \
    apps/api-registry-test-app/specs/frontend-interaction-spec-master.md
```

For each found, verify in registry or mark as hallucination.

#### Success Criteria

- [ ] FIS master spec created
- [ ] Spec references API registry (in agent logs or content)
- [ ] All `apiClient.*` calls exist in api-registry.md
- [ ] Zero hallucinated methods
- [ ] Methods match exact signatures from registry

### 3B: Page-Level FIS Generator (If Used)

If your pipeline generates page-specific FIS specs:

#### Run Generator

```bash
# Example for a "TasksPage"
uv run python -c "
from pathlib import Path
from src.app_factory_leonardo_replit.agents.frontend_interaction_spec_page.agent import FrontendInteractionSpecPageAgent
import asyncio

async def test():
    app_dir = Path('apps/api-registry-test-app/app')

    # Read master spec
    master_spec = (app_dir.parent / 'specs' / 'frontend-interaction-spec-master.md').read_text()

    agent = FrontendInteractionSpecPageAgent(
        app_dir=app_dir,
        page_info={'name': 'TasksPage', 'route': '/tasks'}
    )

    result = await agent.generate_page_spec(
        master_spec=master_spec,
        page_name='TasksPage',
        page_route='/tasks'
    )

    print(f'Success: {result[\"success\"]}')

asyncio.run(test())
"
```

#### Expected Output

```bash
apps/api-registry-test-app/specs/pages/
└── frontend-interaction-spec-TasksPage.md
```

#### Validation (Same as Master)

Use same validation steps as Master FIS Generator:
1. Check file exists
2. Verify registry was read (logs)
3. Extract all `apiClient.*` calls
4. Verify each exists in registry
5. Check for hallucinations

### Troubleshooting

**If spec contains hallucinated methods**:
1. Check agent actually read api-registry.md (logs)
2. Verify system prompt updated correctly (`system_prompt_enhanced.py`)
3. Check user prompt includes registry path
4. Run with Critic to catch violations

**If agent didn't read registry**:
1. Check path derivation in user_prompt.py (line 25-31)
2. Verify api-registry.md exists at expected location
3. Check agent has Read tool access

---

## Phase 4: Page Generators Testing

**Objective**: Verify that page generators produce pages using only registry methods, and critics catch violations.

### Test Setup

Assumes Phases 1-3 completed successfully with valid FIS specs.

### Run Page Generator

```bash
# Run parallel frontend generation
uv run python run-parallel-frontend.py apps/api-registry-test-app/app --max-concurrency 3
```

Or for a single page:

```bash
# Example for HomePage
uv run python -c "
from pathlib import Path
from src.app_factory_leonardo_replit.agents.page_generator.agent import PageGeneratorAgent
import asyncio

async def test():
    app_dir = Path('apps/api-registry-test-app/app')

    # Read page spec
    page_spec = (app_dir.parent / 'specs' / 'pages' / 'frontend-interaction-spec-TasksPage.md').read_text()

    # Read master spec
    master_spec = (app_dir.parent / 'specs' / 'frontend-interaction-spec-master.md').read_text()

    agent = PageGeneratorAgent(
        app_dir=app_dir,
        page_name='TasksPage'
    )

    success, page_content, message = await agent.generate_page(
        page_spec=page_spec,
        master_spec=master_spec
    )

    print(f'Success: {success}')
    print(f'Message: {message}')

asyncio.run(test())
"
```

### Expected Outputs

```bash
apps/api-registry-test-app/app/client/src/pages/
├── HomePage.tsx
├── TasksPage.tsx
└── ...
```

### Validation Checklist

#### ✅ File Existence
```bash
ls -la apps/api-registry-test-app/app/client/src/pages/*.tsx
```

#### ✅ Critic Validation Passed

Check logs for:
```
"✅ Page spec validation passed"
"compliance_score: 95+"
"api_registry_compliance: 25"  # Full marks
```

#### ✅ Extract API Calls from Generated Pages

```bash
# Find all apiClient calls in generated pages
for file in apps/api-registry-test-app/app/client/src/pages/*.tsx; do
    echo "Checking $file..."
    grep -Eo "apiClient\.[a-zA-Z]+\.[a-zA-Z]+\(" "$file" | sort -u
done
```

#### ✅ Verify Each Call Exists in Registry

For each method found:
```bash
# Example: Check apiClient.tasks.getTasks
grep "apiClient.tasks.getTasks" apps/api-registry-test-app/app/client/src/lib/api-registry.md
```

Should return the method details.

#### ✅ Check Critic Logs for Hallucinations

```bash
# Check for hallucination warnings in logs
grep -i "hallucinated\|does not exist in registry" logs/*.log
```

Should return nothing or only warnings that were caught and fixed.

#### ✅ Verify TypeScript Compilation

```bash
cd apps/api-registry-test-app/app
npm install
npm run oxc  # Or your linting command
```

Should pass without API-related errors.

### Success Criteria

- [ ] All pages generated successfully
- [ ] Critic validation passed (score >= 85)
- [ ] API Registry Compliance = 25/25 points
- [ ] All `apiClient.*` calls exist in registry
- [ ] Zero hallucinated methods in generated code
- [ ] TypeScript compilation passes
- [ ] No "method does not exist" errors

### Troubleshooting

**If pages contain hallucinated methods**:
1. Check FIS spec doesn't contain hallucinations (Phase 3)
2. Verify Critic system prompt updated (`page_generator/critic/system_prompt.py`)
3. Check Critic has Read tool to access registry
4. Review Critic logs for API validation

**If Critic doesn't catch hallucinations**:
1. Verify Critic system prompt line 16-20 added
2. Check Critic is reading api-registry.md (logs)
3. Verify XML output includes `<api_registry_compliance>` section
4. May need to adjust Critic decision logic

**If compilation fails**:
1. Check if methods exist in api-client.ts
2. Verify imports are correct (`@/lib/api-client` or `@/lib/api`)
3. May be unrelated to API Registry (check error message)

---

## Complete Pipeline Test

After individual agent testing, run a complete pipeline test:

### Run Full Pipeline

```bash
# Run complete pipeline on test app
uv run python src/app_factory_leonardo_replit/run.py \
    --workspace apps/api-registry-test-app \
    --prompt "Create a task management app with users, tasks, and comments"
```

### Success Metrics

Track these metrics from the plan:

#### Metric 1: Metadata Coverage
```bash
# Check all contracts have metadata
contract_count=$(ls apps/api-registry-test-app/app/shared/contracts/*.contract.ts | wc -l)
metadata_count=$(ls apps/api-registry-test-app/app/shared/contracts/*.contract.meta.json | wc -l)
echo "Contracts: $contract_count, Metadata: $metadata_count"
# Expected: Equal counts
```

#### Metric 2: Registry Completeness
```bash
# Count methods in metadata vs registry
metadata_methods=$(cat apps/api-registry-test-app/app/shared/contracts/*.contract.meta.json | \
    python -c "import json, sys; print(sum(len(json.loads(line)['methods']) for line in sys.stdin))")

registry_methods=$(grep -c "^#### \`apiClient\." apps/api-registry-test-app/app/client/src/lib/api-registry.md)

echo "Metadata methods: $metadata_methods, Registry methods: $registry_methods"
# Expected: Equal counts
```

#### Metric 3: FIS Accuracy
```bash
# Check for hallucinated methods in FIS
# Should return empty or only known good methods
grep -Eo "apiClient\.[a-zA-Z]+\.[a-zA-Z]+\(" \
    apps/api-registry-test-app/specs/frontend-interaction-spec-master.md | \
    sort -u > /tmp/fis_methods.txt

# Manually review each against registry
echo "Review /tmp/fis_methods.txt - all should exist in registry"
```

#### Metric 4: Page Generation Success Rate
```bash
# Check logs for success rate
# Target: 90%+ success rate (vs 22.2% before)
```

#### Metric 5: API Method Errors
```bash
# Check for "method does not exist" errors in logs
grep -i "method does not exist\|not found.*apiClient" logs/*.log
# Expected: Zero results
```

---

## Regression Testing

After confirming the test app works, test with an existing app to ensure backward compatibility:

### Test with Timeless Weddings App

```bash
# Re-generate contracts for existing app
cd apps/timeless-weddings-phase1/app

# 1. Re-run contracts generator (will create metadata)
# 2. Re-run fix_api_client (will create registry)
# 3. Check existing FIS specs for hallucinations
# 4. Re-generate pages
```

---

## Automated Test Script

Create a shell script to automate validation:

```bash
#!/bin/bash
# test-api-registry.sh

set -e

APP_DIR="apps/api-registry-test-app/app"

echo "🧪 Testing API Registry System"
echo ""

echo "📋 Phase 1: Checking Contracts & Metadata"
CONTRACTS=$(ls $APP_DIR/shared/contracts/*.contract.ts | wc -l)
METADATA=$(ls $APP_DIR/shared/contracts/*.contract.meta.json | wc -l)
echo "   Contracts: $CONTRACTS"
echo "   Metadata: $METADATA"
[[ $CONTRACTS -eq $METADATA ]] && echo "   ✅ All contracts have metadata" || echo "   ❌ Missing metadata files"

echo ""
echo "📋 Phase 2: Checking API Client & Registry"
[[ -f "$APP_DIR/client/src/lib/api-client.ts" ]] && echo "   ✅ api-client.ts exists" || echo "   ❌ Missing api-client.ts"
[[ -f "$APP_DIR/client/src/lib/api-registry.md" ]] && echo "   ✅ api-registry.md exists" || echo "   ❌ Missing api-registry.md"

REGISTRY_SIZE=$(wc -c < "$APP_DIR/client/src/lib/api-registry.md")
echo "   Registry size: $REGISTRY_SIZE bytes"
[[ $REGISTRY_SIZE -lt 5000 ]] && echo "   ✅ Size under 5KB" || echo "   ⚠️  Size over 5KB (acceptable but unusual)"

echo ""
echo "📋 Phase 3: Checking FIS Specs"
[[ -f "apps/api-registry-test-app/specs/frontend-interaction-spec-master.md" ]] && \
    echo "   ✅ Master FIS spec exists" || echo "   ❌ Missing master spec"

# Extract and validate methods (simplified)
echo "   Extracting API methods from FIS..."
grep -Eo "apiClient\.[a-zA-Z]+\.[a-zA-Z]+\(" \
    apps/api-registry-test-app/specs/frontend-interaction-spec-master.md 2>/dev/null | \
    sort -u > /tmp/fis_methods.txt || true
FIS_METHODS=$(wc -l < /tmp/fis_methods.txt)
echo "   Found $FIS_METHODS unique API calls in FIS"

echo ""
echo "📋 Phase 4: Checking Generated Pages"
PAGES=$(ls $APP_DIR/client/src/pages/*.tsx 2>/dev/null | wc -l)
echo "   Generated pages: $PAGES"
[[ $PAGES -gt 0 ]] && echo "   ✅ Pages generated" || echo "   ⚠️  No pages found"

echo ""
echo "🎉 Testing complete!"
echo "   Review results above for any ❌ or ⚠️ indicators"
```

Save as `test-api-registry.sh` and run:
```bash
chmod +x test-api-registry.sh
./test-api-registry.sh
```

---

## Reporting

After testing, document results:

### Create Test Report

```markdown
# API Registry System Test Report

**Date**: YYYY-MM-DD
**Tester**: [Name]
**App**: api-registry-test-app

## Phase 1: Contracts Designer
- [ ] Metadata files generated
- [ ] Valid JSON
- [ ] Complete method coverage
- Issues: [None / List issues]

## Phase 2: API Client Generator
- [ ] api-client.ts generated
- [ ] api-registry.md generated
- [ ] Registry complete
- [ ] Registry size acceptable
- Issues: [None / List issues]

## Phase 3: FIS Generators
- [ ] Master FIS spec generated
- [ ] Page FIS specs generated
- [ ] Only registry methods used
- [ ] Zero hallucinations
- Issues: [None / List issues]

## Phase 4: Page Generators
- [ ] Pages generated successfully
- [ ] Critic validation passed
- [ ] Only registry methods used
- [ ] Zero hallucinations
- [ ] TypeScript compiles
- Issues: [None / List issues]

## Metrics
- Metadata Coverage: ___%
- Registry Completeness: ___%
- Page Success Rate: ___%
- API Method Errors: ___

## Overall Result
[ ] PASS - Ready for production
[ ] FAIL - Issues need fixing
```

---

## Next Steps After Testing

1. **If all tests pass**:
   - Document in `API_REGISTRY_IMPLEMENTATION_STATUS.md`
   - Update status to "Production Ready"
   - Consider testing with larger apps

2. **If tests fail**:
   - Document failures in issue tracker
   - Fix identified bugs
   - Re-run affected test phases
   - Don't proceed to next phase until current phase passes

3. **Performance testing**:
   - Measure token usage (target: 500-1000 tokens vs 15K)
   - Measure page generation time
   - Compare success rates (target: 90%+ vs 22.2%)

---

## Appendix: Quick Reference Commands

```bash
# Check metadata files
ls -la apps/*/app/shared/contracts/*.meta.json

# Validate JSON
python -m json.tool [file.json]

# Find API calls in code
grep -r "apiClient\." [directory]

# Check registry size
wc -c [api-registry.md]

# Count methods
grep -c "^####" [api-registry.md]

# Run full pipeline
uv run python src/app_factory_leonardo_replit/run.py [args]

# Run parallel frontend
uv run python run-parallel-frontend.py [app-dir]
```
