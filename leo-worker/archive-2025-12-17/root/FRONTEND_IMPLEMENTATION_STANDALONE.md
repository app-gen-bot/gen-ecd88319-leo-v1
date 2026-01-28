# Frontend Implementation - Standalone Test Runner

This document describes how to run the Frontend Implementation stage in isolation for testing and development.

## Purpose

The standalone runner allows you to:
- Test Frontend Implementation without running the full pipeline
- Verify AppLayout detection and reuse behavior
- Generate pages from FIS specifications
- Debug page generation issues

## Prerequisites

Before running, ensure these files exist:
- ✅ `app/specs/frontend-interaction-spec-master.md` (FIS Master Spec)
- ✅ `app/specs/pages/*.md` (Page specifications)
- ✅ `app/shared/schema.zod.ts` (Database schema)
- ✅ `app/shared/contracts/*.contract.ts` (API contracts)
- ⚠️ `app/client/src/components/layout/AppLayout.tsx` (Optional - will reuse if exists, generate if missing)

## Usage

### Basic Usage (Default Directory)

```bash
./run-frontend-implementation-standalone.sh
```

This uses the default app directory: `apps/timeless-weddings-phase1/app`

### Custom Directory

```bash
./run-frontend-implementation-standalone.sh apps/my-app/app
```

Or with absolute path:

```bash
./run-frontend-implementation-standalone.sh /Users/yourname/projects/my-app/app
```

## What It Does

1. **Verifies Prerequisites**
   - Checks for required FIS specs, schema, and contracts
   - Verifies AppLayout.tsx exists (if already generated)

2. **Optionally Cleans Pages**
   - Prompts to delete existing pages
   - Allows fresh generation or update of existing pages

3. **Runs Frontend Implementation**
   - Detects existing AppLayout.tsx and skips regeneration
   - Generates shared components (EmptyState, ErrorBoundary, etc.)
   - Generates all pages from FIS specifications
   - Validates with OXC linting
   - Self-tests with build verification

4. **Reports Results**
   - Shows generated pages count
   - Confirms AppLayout was reused (not regenerated)
   - Displays import usage statistics

## Expected Output

### Successful Run

```
╔════════════════════════════════════════════════════════════╗
║  Frontend Implementation - Standalone Test Runner         ║
╚════════════════════════════════════════════════════════════╝

📂 App Directory: /Users/.../apps/timeless-weddings-phase1/app

🔍 Verifying required files...
  ✓ frontend-interaction-spec-master.md
  ✓ schema.zod.ts
  ✓ contracts
  ✓ AppLayout.tsx (will be reused, not regenerated)

════════════════════════════════════════════════════════════
  Starting Frontend Implementation Test
════════════════════════════════════════════════════════════

⏱️  This may take 5-15 minutes depending on complexity...
💡 Watch for:
   ✓ Detection of existing AppLayout
   ✓ Shared component generation
   ✓ Page generation (9 pages expected)
   ✓ OXC validation passing

... (generation logs) ...

════════════════════════════════════════════════════════════
✅ SUCCESS - Frontend Implementation completed!

📄 Generated Pages: 9

Generated files:
  • BookingCreatePage.tsx
  • BookingDetailPage.tsx
  • ChapelDetailPage.tsx
  • ChapelsPage.tsx
  • DashboardPage.tsx
  • HomePage.tsx
  • LoginPage.tsx
  • ProfilePage.tsx
  • SignupPage.tsx

🔍 AppLayout Status:
   Last modified: 2025-10-05 10:10:02
   ✓ Imported by 7 page(s)
════════════════════════════════════════════════════════════
```

## Key Validations

### 1. AppLayout Reuse Verification ✅

The script verifies that:
- AppLayout.tsx modification time stays the same (not regenerated)
- Pages correctly import AppLayout
- No duplicate layout generation occurs

**Example Output**:
```
🔍 AppLayout Status:
   Last modified: 2025-10-05 10:10:02  ← Timestamp unchanged!
   ✓ Imported by 7 page(s)
```

### 2. Page Generation ✅

Expected pages (9 total):
- ✅ HomePage.tsx
- ✅ ChapelsPage.tsx (with search/filter)
- ✅ ChapelDetailPage.tsx
- ✅ BookingCreatePage.tsx
- ✅ BookingDetailPage.tsx
- ✅ DashboardPage.tsx
- ✅ ProfilePage.tsx
- ✅ LoginPage.tsx
- ✅ SignupPage.tsx

### 3. Shared Components ✅

The agent also generates:
- EmptyState.tsx
- ErrorBoundary.tsx
- SkeletonLoader.tsx
- StatusBadge.tsx

## Logs

All test runs are logged to:
```
logs/frontend-impl-standalone-YYYYMMDD-HHMMSS.log
```

Use these logs to debug issues or verify generation details.

## Pipeline Integration

This standalone test validates the same behavior that occurs in the full build pipeline:

**Stage 6: Layout Generator** → Generates AppLayout.tsx
↓
**Stage 7: Frontend Implementation** → Detects AppLayout, skips regeneration, generates pages

The standalone runner simulates Stage 7 in isolation.

## Troubleshooting

### Error: Missing required files

**Symptom**: Script exits with "Missing required files"

**Solution**: Run these stages first:
1. FIS Master Spec generation
2. FIS Page Specs generation
3. Schema generation
4. Contracts generation

### Error: AppLayout was regenerated

**Symptom**: AppLayout.tsx modification time changed

**Solution**: This is a bug! The Frontend Implementation should skip AppLayout if it exists. Check:
- System prompt has skip instructions
- User prompt has check instructions
- Agent logs show "AppLayout.tsx already exists"

### Error: Pages missing imports

**Symptom**: Pages generated but don't import AppLayout

**Solution**: Check:
- AppLayout.tsx is in correct location
- Import path `@/components/layout/AppLayout` is correct
- TypeScript path aliases configured

## Script Features

- ✅ **Color-coded output** for easy reading
- ✅ **Automatic path resolution** (relative or absolute)
- ✅ **Prerequisite verification** before running
- ✅ **Optional cleanup** of existing pages
- ✅ **Detailed logging** to file
- ✅ **Result summary** with statistics
- ✅ **AppLayout reuse verification**

## Exit Codes

- `0` - Success (Frontend Implementation completed)
- `1` - Error (missing files, validation failed, generation error)

## Related Files

- **Test Script**: `src/app_factory_leonardo_replit/standalone/test_frontend_implementation.py`
- **Writer Agent**: `src/app_factory_leonardo_replit/agents/frontend_implementation/agent.py`
- **Critic Agent**: `src/app_factory_leonardo_replit/agents/frontend_implementation/browser_critic/agent.py`
- **System Prompt**: `src/app_factory_leonardo_replit/agents/frontend_implementation/system_prompt.py`
- **User Prompt**: `src/app_factory_leonardo_replit/agents/frontend_implementation/user_prompt.py`

## Integration Testing

After standalone testing succeeds, test the full pipeline:

```bash
# Run full build pipeline
uv run python src/app_factory_leonardo_replit/run.py "Create a wedding booking app"
```

The full pipeline should:
1. Generate FIS Master Spec (Stage 5)
2. Generate AppLayout from NAVIGATION_HEADER (Stage 6)
3. Detect AppLayout and generate pages (Stage 7)

No conflicts or duplicate generation should occur! 🎉
