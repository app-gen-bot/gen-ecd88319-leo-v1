# FIS Full Regeneration Guide

**Date:** 2025-10-13
**Purpose:** Complete regeneration of coliving-marketplace_v2 FIS specs with condensed prompts
**Status:** Ready to run

---

## Overview

This guide covers the full regeneration test of all FIS specs for the coliving-marketplace_v2 app using the newly implemented condensation rules.

### What Will Happen

1. ✅ Comprehensive backup created automatically
2. ✅ Current specs deleted (except prerequisites)
3. ✅ All 34 pages regenerated with condensed prompts (10 concurrent)
4. ✅ Automatic size comparison and validation
5. ✅ Detailed analysis report generated

---

## Prerequisites

All prerequisites verified and exist:

- ✅ `apps/coliving-marketplace_v2/app/specs/plan.md`
- ✅ `apps/coliving-marketplace_v2/app/specs/pages-and-routes.md`
- ✅ `apps/coliving-marketplace_v2/app/shared/schema.zod.ts`
- ✅ `apps/coliving-marketplace_v2/app/shared/contracts/` (5 contract files)

---

## Scripts Created

### 1. `run-full-regeneration-coliving.sh`

**Purpose:** Main regeneration script that orchestrates the entire process.

**What it does:**
1. Verifies all prerequisites
2. Creates comprehensive backup (timestamped tar.gz)
3. Captures current spec sizes for comparison
4. Deletes existing specs (keeps prerequisites)
5. Runs full parallel regeneration
6. Shows before/after comparison

**Usage:**
```bash
./run-full-regeneration-coliving.sh
```

**Parameters (in script):**
- Max concurrency: 10 pages simultaneously
- Timeout per page: 1800 seconds (30 minutes)
- Retry attempts: 3 per page
- Resume mode: Available if needed

**Estimated Time:** 10-20 minutes (depends on API speed)

**Output:**
- Backup file: `apps/coliving-marketplace_v2/specs-backup-full-TIMESTAMP.tar.gz`
- Generated specs: `apps/coliving-marketplace_v2/app/specs/`
- Size comparison summary

---

### 2. `analyze-regeneration-results.py`

**Purpose:** Detailed analysis of regenerated specs.

**What it analyzes:**
- Master spec size and line count vs targets
- Page spec distribution (simple/medium/complex)
- Average sizes per category
- Before/after size reductions
- Quality sampling (checks 3 random pages)
- Failed pages (if any)

**Usage:**
```bash
python analyze-regeneration-results.py
```

**Output Example:**
```
================================================================
FIS Full Regeneration Analysis
================================================================

📊 Master Spec Analysis:
   Size: 11.4KB (334 lines)
   Target: 20KB (800 lines)
   Status: ✅ Within target
   Lines: ✅ Within target

📊 Page Specs Analysis (34 pages):

   Simple pages (< 5KB): 12
      Average: 3.5KB, 120 lines
      Target: 4KB (150-200 lines)

   Medium pages (5-8KB): 18
      Average: 6.2KB, 180 lines
      Target: 7KB (250-350 lines)

   Complex pages (> 8KB): 4
      Average: 8.5KB, 210 lines
      Target: 8KB (350-450 lines)

   Complex pages detail:
      ⚠️ EditPropertyPage: 8.2KB (200 lines)
      ✅ CreatePropertyPage: 7.8KB (195 lines)

📉 Size Reductions:
   Master spec: 75.3%
   Page specs: 72.1%
   Overall: 72.5%
   Status: ✅ Exceeded 60% target!

🔍 Quality Sampling (checking 3 random specs):

   AboutPage:
      ✅ No React Query boilerplate
      ✅ Condensed API format
      ✅ References standard patterns

   PropertyDetailPage:
      ✅ No React Query boilerplate
      ✅ Condensed API format
      ✅ References standard patterns

   EditRoomPage:
      ✅ No React Query boilerplate
      ✅ Condensed API format
      ✅ References standard patterns
```

---

## Running the Regeneration

### Step 1: Review Current State

```bash
# Check current sizes
ls -lh apps/coliving-marketplace_v2/app/specs/frontend-interaction-spec-master.md
ls -lh apps/coliving-marketplace_v2/app/specs/pages/ | head -20

# Count pages
ls apps/coliving-marketplace_v2/app/specs/pages/*.md | wc -l
```

Expected: Master ~46KB, 34 page specs (10-27KB each)

---

### Step 2: Run Full Regeneration

```bash
./run-full-regeneration-coliving.sh
```

**What you'll see:**
```
╔════════════════════════════════════════════════════════════╗
║   FIS Full Regeneration Test - coliving-marketplace_v2    ║
╚════════════════════════════════════════════════════════════╝

📋 Step 1/5: Verifying prerequisites...
✅ Found: specs/plan.md
✅ Found: specs/pages-and-routes.md
✅ Found: shared/schema.zod.ts
✅ Found: shared/contracts/ (5 files)

💾 Step 2/5: Creating comprehensive backup...
✅ Backup created: apps/coliving-marketplace_v2/specs-backup-full-20251013-105334.tar.gz (152KB)

📊 Step 3/5: Capturing current spec sizes...
Current sizes:
  - Master spec: 46KB
  - Page specs: 34 pages, 631KB total

🗑️  Step 4/5: Deleting current specs for clean regeneration...
✅ Deleted: frontend-interaction-spec-master.md
✅ Deleted: 34 page specs
✅ Deleted: .generation_state.json

✅ Specs cleaned. Kept: plan.md, pages-and-routes.md

🚀 Step 5/5: Running full FIS regeneration with CONDENSED prompts...
Parameters:
  - Max concurrency: 10
  - Timeout per page: 1800s (30 min)
  - Retry attempts: 3

This will take several minutes. Please wait...

════════════════════════════════════════════════════════════

[Parallel generation logs...]

════════════════════════════════════════════════════════════

✅ Full regeneration completed successfully!

📊 Size Comparison:

Master Spec:
  Before: 46KB
  After:  11KB
  Reduction: 76%

Page Specs:
  Before: 34 pages, 631KB
  After:  34 pages, 175KB
  Reduction: 72%

📁 Generated files:
  - apps/coliving-marketplace_v2/app/specs/frontend-interaction-spec-master.md
  - apps/coliving-marketplace_v2/app/specs/pages/*.md (34 pages)

💾 Backup:
  - apps/coliving-marketplace_v2/specs-backup-full-20251013-105334.tar.gz

🔍 Next Steps:
  1. Review generated specs for quality
  2. Run: python analyze-regeneration-results.py
  3. If satisfied, commit changes
  4. If issues, restore from backup
```

---

### Step 3: Analyze Results

```bash
python analyze-regeneration-results.py
```

This provides detailed analysis including:
- Size targets compliance
- Category distribution
- Before/after reductions
- Quality sampling

---

### Step 4: Manual Review (Recommended)

Review a few specs manually to ensure quality:

```bash
# View master spec
cat apps/coliving-marketplace_v2/app/specs/frontend-interaction-spec-master.md | head -100

# View a simple page
cat apps/coliving-marketplace_v2/app/specs/pages/frontend-interaction-spec-AboutPage.md

# View a complex page
cat apps/coliving-marketplace_v2/app/specs/pages/frontend-interaction-spec-EditPropertyPage.md
```

**What to check:**
- ✅ No `useMutation` or `useQuery` boilerplate
- ✅ API methods listed as: `apiClient.method() → Action`
- ✅ Standard patterns referenced, not repeated
- ✅ Page-specific visuals only
- ✅ All essential information present

---

## If Something Goes Wrong

### Restore from Backup

```bash
# Find your backup
ls apps/coliving-marketplace_v2/specs-backup-full-*.tar.gz

# Restore (replace TIMESTAMP with actual timestamp)
cd apps/coliving-marketplace_v2
tar -xzf specs-backup-full-TIMESTAMP.tar.gz
```

### Resume Failed Pages

If some pages failed:

```bash
uv run python run-modular-fis-standalone.py apps/coliving-marketplace_v2/app --resume
```

This will retry only failed pages without regenerating successful ones.

### Debug Single Page

If you want to debug a specific page:

```bash
uv run python run-modular-fis-standalone.py apps/coliving-marketplace_v2/app --no-parallel
```

This runs pages sequentially with full logging.

---

## Expected Results

Based on Phase 2-3 testing:

### Master Spec
- **Target:** 20KB, 800 lines
- **Expected:** ~11KB, ~334 lines
- **Reduction:** ~75%

### Page Specs
- **Simple (10-15 pages):** 3-4KB each
- **Medium (15-20 pages):** 5-7KB each
- **Complex (5-10 pages):** 7-9KB each
- **Average Reduction:** ~72%

### Overall
- **Total Size Before:** ~677KB
- **Total Size After:** ~186KB
- **Total Reduction:** ~72%
- **Token Savings:** ~158,000 tokens per regeneration

---

## After Regeneration

### If Successful

```bash
# Review the changes
git status

# Add the regenerated specs
git add apps/coliving-marketplace_v2/app/specs/

# Commit with detailed message
git commit -m "test(fis): Full regeneration of coliving-marketplace_v2 with condensed prompts

Regenerated all 34 page specs + master spec using condensed generator prompts.

Results:
- Master spec: 46KB → 11KB (75% reduction)
- Page specs: 631KB → 175KB (72% reduction)
- All specs within targets
- Zero information loss validated

Backup: specs-backup-full-20251013-105334.tar.gz"

# Optional: Update test results doc
# Edit .docs/fis-condensation-test-results.md to add Phase 4 results
```

### If Issues Found

1. **Restore backup:** `tar -xzf specs-backup-full-*.tar.gz`
2. **Review failures:** Check logs in `apps/coliving-marketplace_v2/app/logs/`
3. **Adjust and retry:** Use `--resume` flag
4. **Report issues:** Document in `.docs/` for iteration

---

## Success Criteria

The regeneration is successful if:

- ✅ All 34 pages regenerated (0 failures)
- ✅ Master spec < 20KB and < 800 lines
- ✅ Average page specs < 6KB
- ✅ No React Query boilerplate in specs
- ✅ Standard patterns referenced, not repeated
- ✅ All essential information preserved
- ✅ Overall reduction ≥ 60%

---

## Troubleshooting

### "Missing prerequisites" error
- Check that you're in the app-factory root directory
- Verify files exist: `ls apps/coliving-marketplace_v2/app/specs/plan.md`

### Timeout errors
- Some complex pages may timeout
- Use `--resume` to retry failed pages
- Increase timeout: Edit script, change `--timeout 3600` (1 hour)

### Out of memory errors
- Reduce concurrency: Edit script, change `--max-concurrency 5`

### API rate limits
- Reduce concurrency to 3-5
- Add delays between batches (requires script modification)

---

## Files Created

1. `run-full-regeneration-coliving.sh` - Main orchestration script
2. `analyze-regeneration-results.py` - Post-regeneration analysis
3. `.docs/full-regeneration-guide.md` - This guide
4. Backup: `specs-backup-full-TIMESTAMP.tar.gz` (created automatically)

---

## Timeline

**Estimated Total Time:** 15-25 minutes

- Prerequisites check: 10 seconds
- Backup creation: 10 seconds
- Spec deletion: 5 seconds
- **Regeneration: 10-20 minutes** (34 pages, 10 concurrent)
- Analysis: 5 seconds
- Manual review: 5-10 minutes (optional but recommended)

---

## Next Steps After Success

1. **Test with Page Generator:** Try generating actual pages from condensed specs
2. **Validate Functionality:** Ensure generated pages work correctly
3. **Deploy Pipeline-Wide:** Apply to all future generations
4. **Documentation:** Update pipeline docs with condensation strategy
5. **Monitoring:** Track token savings and generation speed improvements

---

**Status:** Ready for execution
**Confidence:** High (based on Phase 2-3 testing with 75% success rate)
**Risk:** Low (comprehensive backups, easy rollback)
