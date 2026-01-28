# Modular FIS Standalone Generation - Usage Guide
**Date: 2025-10-03**

## Overview

The modular FIS generation can be run standalone on existing app artifacts without running the full Leonardo pipeline. This is useful for:
- Testing the new modular architecture on existing apps
- Regenerating FIS after schema/contract changes
- Comparing modular vs. monolithic FIS output

## Prerequisites

The target app directory must contain:
- ✅ `app/specs/plan.md` - Application plan
- ✅ `app/specs/pages-and-routes.md` - Technical architecture specification
- ✅ `app/shared/schema.zod.ts` - Zod schema definitions
- ✅ `app/shared/contracts/*.contract.ts` - API contract files

## Quick Start

### Option 1: Using the Wrapper Script (Recommended)

For the timeless-weddings-phase1 app:

```bash
./run-modular-fis-timeless-weddings.sh
```

This will:
1. Generate the master spec (~7K tokens)
2. Extract pages from pages-and-routes.md
3. Generate individual page specs (~1.2K tokens each)

### Option 2: Using the Standalone Script Directly

For any app:

```bash
uv run python run-modular-fis-standalone.py apps/YOUR-APP-NAME/app
```

Example:
```bash
uv run python run-modular-fis-standalone.py apps/timeless-weddings-phase1/app
```

### Option 3: Using Python Directly

```bash
cd /Users/labheshpatel/apps/app-factory
uv run python run-modular-fis-standalone.py apps/timeless-weddings-phase1/app
```

## What Gets Generated

### Master Specification
**File**: `app/specs/frontend-interaction-spec-master.md`
**Size**: ~7,000 tokens

**Contains**:
- Application overview
- Design system (ASTOUNDING principles)
- Component patterns (GLASS_CARD, PRIMARY_CTA, etc.)
- API integration patterns (QUERY_PATTERN, MUTATION_PATTERN, etc.)
- State management patterns
- Error handling strategies
- Accessibility standards
- Complete pattern registry

### Page Specifications
**Directory**: `app/specs/pages/`
**Files**: One `.md` file per page (e.g., `homepage.md`, `loginpage.md`)
**Size**: ~1,200 tokens each

**Contains** (per page):
- Page header with route and purpose
- Layout structure (references master patterns)
- Component details (uses pattern IDs)
- API integration summary
- Page-specific behaviors
- Mobile adaptations

## Example Output

```
apps/timeless-weddings-phase1/app/
└── specs/
    ├── frontend-interaction-spec-master.md    # Master patterns
    └── pages/                                   # Page specs
        ├── homepage.md
        ├── loginpage.md
        ├── signuppage.md
        ├── vendorcategorygridpage.md
        ├── coupleprofilepage.md
        ├── vendorprofilepage.md
        ├── vendorsearchpage.md
        ├── vendorportfoliopage.md
        ├── couplesdashboardpage.md
        └── vendordashboardpage.md
```

## Skip Logic

The script is idempotent - safe to run multiple times:

- **Master spec exists**: Skips generation, logs message
- **Page spec exists**: Skips that page, continues with others
- **No specs exist**: Generates everything

To regenerate:
```bash
# Regenerate master spec only
rm apps/timeless-weddings-phase1/app/specs/frontend-interaction-spec-master.md
./run-modular-fis-timeless-weddings.sh

# Regenerate specific page spec
rm apps/timeless-weddings-phase1/app/specs/pages/homepage.md
./run-modular-fis-timeless-weddings.sh

# Regenerate all page specs
rm -rf apps/timeless-weddings-phase1/app/specs/pages/
./run-modular-fis-timeless-weddings.sh

# Regenerate everything
rm apps/timeless-weddings-phase1/app/specs/frontend-interaction-spec-master.md
rm -rf apps/timeless-weddings-phase1/app/specs/pages/
./run-modular-fis-timeless-weddings.sh
```

## Expected Output

### Successful Run

```
🚀 Starting modular FIS generation for: /path/to/app
✅ All prerequisites found
   📄 Plan: plan.md
   📄 Tech Spec: pages-and-routes.md
   📄 Schema: schema.zod.ts
   📁 Contracts: 5 files

============================================================
STEP 1: Generating Master Frontend Interaction Spec
============================================================
🎯 FrontendInteractionSpecMasterAgent initialized
   contracts_dir: /path/to/app/shared/contracts
   schema_path: /path/to/app/shared/schema.zod.ts
   spec_path: /path/to/app/specs/frontend-interaction-spec-master.md
   plan_path: /path/to/app/specs/plan.md
🎨 Generating master frontend interaction specification...
✅ Master specification generated (~7200 tokens)
✅ Master spec generated successfully!
   📄 File: frontend-interaction-spec-master.md
   📊 Estimated tokens: 7200
   💬 Master frontend interaction specification generated successfully

============================================================
STEP 2: Extracting Pages from Technical Architecture Spec
============================================================
📋 Extracted 10 pages from technical spec: ['HomePage', 'LoginPage', ...]
✅ Found 10 pages to generate specs for

============================================================
STEP 3: Generating Page Specifications
============================================================
📁 Page specs directory: /path/to/app/specs/pages

📄 [1/10] HomePage
   Route: /home
   File: homepage.md
📄 FrontendInteractionSpecPageAgent initialized for 'HomePage'
   page_route: /home
   master_spec: /path/to/app/specs/frontend-interaction-spec-master.md
   spec_path: /path/to/app/specs/pages/homepage.md
📝 Generating page specification for 'HomePage'...
✅ Page spec for 'HomePage' generated (~1250 tokens)
   ✅ Generated successfully!
   📊 Estimated tokens: 1250

... (9 more pages)

============================================================
SUMMARY
============================================================
✅ Master Spec: Generated
📊 Page Specs: 10/10 successful

📁 Generated files:
   /path/to/app/specs/frontend-interaction-spec-master.md
   /path/to/app/specs/pages/couplesdashboardpage.md
   /path/to/app/specs/pages/coupleprofilepage.md
   /path/to/app/specs/pages/homepage.md
   /path/to/app/specs/pages/loginpage.md
   /path/to/app/specs/pages/signuppage.md
   /path/to/app/specs/pages/vendorcategorygridpage.md
   /path/to/app/specs/pages/vendordashboardpage.md
   /path/to/app/specs/pages/vendorportfoliopage.md
   /path/to/app/specs/pages/vendorprofilepage.md
   /path/to/app/specs/pages/vendorsearchpage.md

🎉 Modular FIS generation completed successfully!
```

### With Skip Logic

```
============================================================
STEP 1: Generating Master Frontend Interaction Spec
============================================================
⏭️  Master spec already exists: frontend-interaction-spec-master.md
   Delete it to regenerate, or continue to page specs

============================================================
STEP 2: Extracting Pages from Technical Architecture Spec
============================================================
📋 Extracted 10 pages from technical spec: ['HomePage', 'LoginPage', ...]
✅ Found 10 pages to generate specs for

============================================================
STEP 3: Generating Page Specifications
============================================================
📁 Page specs directory: /path/to/app/specs/pages

📄 [1/10] HomePage
   Route: /home
   File: homepage.md
   ⏭️  Skipping - spec already exists

... (9 more skipped pages)

============================================================
SUMMARY
============================================================
✅ Master Spec: Generated
📊 Page Specs: 10/10 successful (all skipped)
```

## Troubleshooting

### Error: Missing Prerequisites

```
❌ Missing prerequisites:
   - /path/to/app/specs/plan.md
   - /path/to/app/shared/schema.zod.ts
```

**Solution**: Ensure you've run the earlier stages of the pipeline to generate these files.

### Error: No Pages Found

```
⚠️  No pages found in pages-and-routes.md
   Cannot generate page specs without page definitions
```

**Solution**: Check that `pages-and-routes.md` contains page definitions with the format:
```markdown
#### **PageName**
- **Purpose**: Description of page purpose
```

### Error: Agent Generation Failed

```
❌ Master spec generation failed: Agent failed: ...
```

**Solution**:
1. Check the logs for detailed error messages
2. Verify all prerequisite files are valid (not corrupted)
3. Ensure you have API keys configured (if required)
4. Try regenerating by deleting the spec file and running again

## Verifying Generated Specs

### Check Token Counts

```bash
# Estimate master spec tokens
wc -w apps/timeless-weddings-phase1/app/specs/frontend-interaction-spec-master.md
# Multiply by 1.3 for rough token estimate

# Estimate page spec tokens
for file in apps/timeless-weddings-phase1/app/specs/pages/*.md; do
    echo "$(basename $file): $(($(wc -w < $file) * 13 / 10)) tokens (estimated)"
done
```

### Check Pattern References

Verify page specs reference master patterns correctly:

```bash
# Should find pattern references like "QUERY_PATTERN", "GLASS_CARD", etc.
grep -r "PATTERN\|_CARD\|_CTA" apps/timeless-weddings-phase1/app/specs/pages/

# Should find master spec references like "Master Spec §3"
grep -r "Master Spec" apps/timeless-weddings-phase1/app/specs/pages/
```

### Verify No Duplication

Master patterns should NOT appear in page specs:

```bash
# This should be empty or minimal (only in master spec)
grep -r "useQuery.*queryKey.*queryFn" apps/timeless-weddings-phase1/app/specs/pages/

# Page specs should reference instead:
# "Uses QUERY_PATTERN (Master Spec §3)"
```

## Integration with Full Pipeline

Once verified, these standalone-generated specs will be used by:
1. **Frontend Implementation Agent** - Reads master + page specs to generate components
2. **Browser Critic** - Validates implementation matches specs

The full pipeline integration is already implemented in `build_stage.py` lines 179-231.

## Next Steps After Generation

1. **Verify token counts** are within budget
2. **Check pattern references** in page specs
3. **Review master spec** for completeness
4. **Run frontend implementation** to use the specs
5. **Compare with monolithic FIS** (if it exists) for quality

## Cost Estimates

Based on token usage:
- **Master Spec**: ~$0.10-0.15 (7K tokens)
- **Page Specs**: ~$0.05 per page × 10 pages = $0.50
- **Total**: ~$0.60-0.65 for 10-page app

Compare to monolithic FIS:
- **Before**: $0.67 (failed due to token limit)
- **After**: $0.60-0.65 (successful)

## Support

If you encounter issues:
1. Check the logs for detailed error messages
2. Verify all prerequisites exist and are valid
3. Review the bug report: `/docs/MODULAR_FIS_BUG_REVIEW_2025-10-03.md`
4. Check the implementation docs: `/docs/MODULAR_FIS_IMPLEMENTATION_COMPLETE.md`
