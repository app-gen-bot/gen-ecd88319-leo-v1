# Modular FIS - Quick Start Guide

## Run Standalone on Existing App

```bash
# For timeless-weddings-phase1 (convenience script)
./run-modular-fis-timeless-weddings.sh

# For any app
uv run python run-modular-fis-standalone.py apps/YOUR-APP-NAME/app
```

## What It Does

1. ✅ Generates **Master Spec** (~7K tokens) with reusable patterns
2. ✅ Extracts pages from `pages-and-routes.md`
3. ✅ Generates **Page Specs** (~1.2K tokens each) that reference master patterns

## Prerequisites (Must Exist)

- `app/specs/plan.md`
- `app/specs/pages-and-routes.md`
- `app/shared/schema.zod.ts`
- `app/shared/contracts/*.contract.ts`

## Output Files

```
app/specs/
├── frontend-interaction-spec-master.md    # Master patterns
└── pages/                                   # Page specs
    ├── homepage.md
    ├── loginpage.md
    └── ... (one per page)
```

## Regenerate

```bash
# Regenerate everything
rm app/specs/frontend-interaction-spec-master.md
rm -rf app/specs/pages/
./run-modular-fis-timeless-weddings.sh

# Regenerate just one page spec
rm app/specs/pages/homepage.md
./run-modular-fis-timeless-weddings.sh
```

## Verify Success

```bash
# Check master spec exists and has content
ls -lh apps/timeless-weddings-phase1/app/specs/frontend-interaction-spec-master.md

# Check page specs were created
ls -1 apps/timeless-weddings-phase1/app/specs/pages/

# Check pattern references (should find QUERY_PATTERN, GLASS_CARD, etc.)
grep -r "PATTERN\|Master Spec" apps/timeless-weddings-phase1/app/specs/pages/ | head -10
```

## Token Estimates

- **Master**: ~7,000 tokens
- **Pages**: ~1,200 tokens × N pages
- **Total for 10 pages**: ~19,000 tokens (59% of 32K limit) ✅

## Full Documentation

- **Usage Guide**: `/docs/MODULAR_FIS_STANDALONE_USAGE.md`
- **Implementation**: `/docs/MODULAR_FIS_IMPLEMENTATION_COMPLETE.md`
- **Bug Review**: `/docs/MODULAR_FIS_BUG_REVIEW_2025-10-03.md`
- **Architecture**: `/docs/MODULAR_FIS_ARCHITECTURE.md`
