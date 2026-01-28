#!/bin/bash
# Full FIS Regeneration Test for coliving-marketplace_v2
# This script performs a complete regeneration of all FIS specs with condensed prompts

set -e

APP_DIR="apps/coliving-marketplace_v2/app"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   FIS Full Regeneration Test - coliving-marketplace_v2    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify prerequisites
echo "📋 Step 1/5: Verifying prerequisites..."
echo ""

PREREQS_OK=true

if [ ! -f "$APP_DIR/specs/plan.md" ]; then
    echo "❌ Missing: $APP_DIR/specs/plan.md"
    PREREQS_OK=false
else
    echo "✅ Found: specs/plan.md"
fi

if [ ! -f "$APP_DIR/specs/pages-and-routes.md" ]; then
    echo "❌ Missing: $APP_DIR/specs/pages-and-routes.md"
    PREREQS_OK=false
else
    echo "✅ Found: specs/pages-and-routes.md"
fi

if [ ! -f "$APP_DIR/shared/schema.zod.ts" ]; then
    echo "❌ Missing: $APP_DIR/shared/schema.zod.ts"
    PREREQS_OK=false
else
    echo "✅ Found: shared/schema.zod.ts"
fi

if [ ! -d "$APP_DIR/shared/contracts" ]; then
    echo "❌ Missing: $APP_DIR/shared/contracts/"
    PREREQS_OK=false
else
    CONTRACT_COUNT=$(ls -1 "$APP_DIR/shared/contracts"/*.contract.ts 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ Found: shared/contracts/ ($CONTRACT_COUNT files)"
fi

if [ "$PREREQS_OK" = false ]; then
    echo ""
    echo "❌ Prerequisites check failed. Exiting."
    exit 1
fi

# Step 2: Create comprehensive backup
echo ""
echo "💾 Step 2/5: Creating comprehensive backup..."
echo ""

BACKUP_FILE="apps/coliving-marketplace_v2/specs-backup-full-$TIMESTAMP.tar.gz"

cd "$APP_DIR"
tar -czf "../../specs-backup-full-$TIMESTAMP.tar.gz" specs/
cd - > /dev/null

BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Step 3: Capture current sizes for comparison
echo ""
echo "📊 Step 3/5: Capturing current spec sizes..."
echo ""

MASTER_SIZE_BEFORE=$(stat -f%z "$APP_DIR/specs/frontend-interaction-spec-master.md" 2>/dev/null || echo "0")
PAGE_COUNT=$(ls -1 "$APP_DIR/specs/pages"/*.md 2>/dev/null | wc -l | tr -d ' ')
TOTAL_SIZE_BEFORE=$(du -sk "$APP_DIR/specs/pages" 2>/dev/null | awk '{print $1}')

echo "Current sizes:"
echo "  - Master spec: $((MASTER_SIZE_BEFORE / 1024))KB"
echo "  - Page specs: $PAGE_COUNT pages, ${TOTAL_SIZE_BEFORE}KB total"

# Save sizes for later comparison
echo "$MASTER_SIZE_BEFORE" > /tmp/master_size_before.txt
echo "$TOTAL_SIZE_BEFORE" > /tmp/pages_size_before.txt
echo "$PAGE_COUNT" > /tmp/page_count.txt

# Step 4: Delete current specs (except prerequisites)
echo ""
echo "🗑️  Step 4/5: Deleting current specs for clean regeneration..."
echo ""

# Delete master spec
if [ -f "$APP_DIR/specs/frontend-interaction-spec-master.md" ]; then
    rm "$APP_DIR/specs/frontend-interaction-spec-master.md"
    echo "✅ Deleted: frontend-interaction-spec-master.md"
fi

# Delete all page specs
if [ -d "$APP_DIR/specs/pages" ]; then
    DELETED_COUNT=$(ls -1 "$APP_DIR/specs/pages"/*.md 2>/dev/null | wc -l | tr -d ' ')
    rm -f "$APP_DIR/specs/pages"/*.md
    echo "✅ Deleted: $DELETED_COUNT page specs"
fi

# Delete generation state
if [ -f "$APP_DIR/specs/.generation_state.json" ]; then
    rm "$APP_DIR/specs/.generation_state.json"
    echo "✅ Deleted: .generation_state.json"
fi

echo ""
echo "✅ Specs cleaned. Kept: plan.md, pages-and-routes.md"

# Step 5: Run full regeneration
echo ""
echo "🚀 Step 5/5: Running full FIS regeneration with CONDENSED prompts..."
echo ""
echo "Parameters:"
echo "  - Max concurrency: 10"
echo "  - Timeout per page: 1800s (30 min)"
echo "  - Retry attempts: 3"
echo ""
echo "This will take several minutes. Please wait..."
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Run the standalone script
uv run python run-modular-fis-standalone.py "$APP_DIR" \
    --max-concurrency 10 \
    --timeout 1800 \
    --retry-attempts 3

EXIT_CODE=$?

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Full regeneration completed successfully!"
    echo ""

    # Calculate new sizes
    MASTER_SIZE_AFTER=$(stat -f%z "$APP_DIR/specs/frontend-interaction-spec-master.md" 2>/dev/null || echo "0")
    PAGE_COUNT_AFTER=$(ls -1 "$APP_DIR/specs/pages"/*.md 2>/dev/null | wc -l | tr -d ' ')
    TOTAL_SIZE_AFTER=$(du -sk "$APP_DIR/specs/pages" 2>/dev/null | awk '{print $1}')

    # Calculate reductions
    MASTER_REDUCTION=$(( 100 - (MASTER_SIZE_AFTER * 100 / MASTER_SIZE_BEFORE) ))
    PAGES_REDUCTION=$(( 100 - (TOTAL_SIZE_AFTER * 100 / TOTAL_SIZE_BEFORE) ))

    echo "📊 Size Comparison:"
    echo ""
    echo "Master Spec:"
    echo "  Before: $((MASTER_SIZE_BEFORE / 1024))KB"
    echo "  After:  $((MASTER_SIZE_AFTER / 1024))KB"
    echo "  Reduction: ${MASTER_REDUCTION}%"
    echo ""
    echo "Page Specs:"
    echo "  Before: ${PAGE_COUNT} pages, ${TOTAL_SIZE_BEFORE}KB"
    echo "  After:  ${PAGE_COUNT_AFTER} pages, ${TOTAL_SIZE_AFTER}KB"
    echo "  Reduction: ${PAGES_REDUCTION}%"
    echo ""

    echo "📁 Generated files:"
    echo "  - $APP_DIR/specs/frontend-interaction-spec-master.md"
    echo "  - $APP_DIR/specs/pages/*.md ($PAGE_COUNT_AFTER pages)"
    echo ""

    echo "💾 Backup:"
    echo "  - $BACKUP_FILE"
    echo ""

    echo "🔍 Next Steps:"
    echo "  1. Review generated specs for quality"
    echo "  2. Run: python analyze-regeneration-results.py"
    echo "  3. If satisfied, commit changes"
    echo "  4. If issues, restore from backup:"
    echo "     tar -xzf $BACKUP_FILE -C $APP_DIR/../.."
    echo ""

else
    echo "❌ Full regeneration failed!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  1. Check error messages above"
    echo "  2. Restore from backup: tar -xzf $BACKUP_FILE -C $APP_DIR/../.."
    echo "  3. Try with --resume flag if partial success"
    echo "  4. Check logs in $APP_DIR/logs/"
    echo ""
fi

exit $EXIT_CODE
