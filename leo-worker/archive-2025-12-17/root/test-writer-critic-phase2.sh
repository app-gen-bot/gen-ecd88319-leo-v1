#!/bin/bash
# Test Phase 2: Writer-Critic Loop Implementation
# This script tests the complete flow with quality validation

set -e  # Exit on error

echo "🧪 Testing Phase 2: Writer-Critic Loop for Page Generation"
echo "=============================================================="
echo ""

APP_DIR="apps/timeless-weddings-phase1/app"

# Step 1: Clean up any existing pages
echo "📁 Step 1: Cleaning up existing pages..."
if [ -d "$APP_DIR/client/src/pages" ]; then
    rm -rf "$APP_DIR/client/src/pages"
    echo "   ✅ Deleted existing pages directory"
else
    echo "   ℹ️  No existing pages directory"
fi

# Step 2: Verify FIS specs exist or generate them
echo ""
echo "📋 Step 2: Checking FIS specifications..."
if [ ! -f "$APP_DIR/specs/frontend-interaction-spec.md" ]; then
    echo "   ⚠️  FIS specs not found. Generating them first..."
    uv run python run-modular-fis-standalone.py "$APP_DIR"
    echo "   ✅ FIS specs generated"
else
    echo "   ✅ FIS specs already exist"
    echo "   Master spec: $(ls -lh $APP_DIR/specs/frontend-interaction-spec.md | awk '{print $5}')"
    echo "   Page specs: $(ls -1 $APP_DIR/specs/pages/*.md 2>/dev/null | wc -l | tr -d ' ') files"
fi

# Step 3: Verify AppLayout exists or will be generated
echo ""
echo "🏗️  Step 3: Checking AppLayout component..."
if [ ! -f "$APP_DIR/client/src/components/layout/AppLayout.tsx" ]; then
    echo "   ℹ️  AppLayout will be generated during parallel frontend generation"
else
    echo "   ✅ AppLayout already exists"
fi

# Step 4: Run parallel frontend generation with Writer-Critic loop
echo ""
echo "🚀 Step 4: Running Parallel Frontend Generation with Writer-Critic Loop"
echo "----------------------------------------------------------------------"
echo "   This will:"
echo "   1. Generate each page with the Writer agent"
echo "   2. Validate with the Critic agent (checks API usage, imports, styling)"
echo "   3. Iterate up to 3 times if Critic finds issues"
echo "   4. Continue until all pages pass validation or reach max iterations"
echo ""
echo "   Max iterations per page: 3"
echo "   Max concurrency: 10 pages in parallel"
echo "   Timeout per page: 600s (10 minutes)"
echo ""

# Create log directory
mkdir -p logs

# Run with full logging
uv run python run-parallel-frontend.py "$APP_DIR" 2>&1 | tee logs/writer-critic-test-$(date +%Y%m%d_%H%M%S).log

# Step 5: Verify results
echo ""
echo "📊 Step 5: Verification Results"
echo "================================"

# Count generated pages
if [ -d "$APP_DIR/client/src/pages" ]; then
    PAGE_COUNT=$(ls -1 "$APP_DIR/client/src/pages"/*.tsx 2>/dev/null | wc -l | tr -d ' ')
    echo "   ✅ Pages generated: $PAGE_COUNT"
    echo ""
    echo "   Generated files:"
    ls -lh "$APP_DIR/client/src/pages"/*.tsx | awk '{print "      - " $9 " (" $5 ")"}'
else
    echo "   ❌ No pages directory created!"
    exit 1
fi

# Check for Critic validation in logs
echo ""
echo "📝 Step 6: Critic Validation Summary"
echo "===================================="
LATEST_LOG=$(ls -t logs/writer-critic-test-*.log | head -1)

if [ -f "$LATEST_LOG" ]; then
    echo "   Checking latest log: $LATEST_LOG"
    echo ""

    # Count Writer-Critic iterations
    ITERATION_COUNT=$(grep -c "Writer-Critic Iteration" "$LATEST_LOG" || echo "0")
    echo "   Total Writer-Critic iterations: $ITERATION_COUNT"

    # Count completions
    COMPLETE_COUNT=$(grep -c "complete after.*iteration" "$LATEST_LOG" || echo "0")
    echo "   Pages completed with validation: $COMPLETE_COUNT"

    # Check for compliance scores
    echo ""
    echo "   Compliance scores:"
    grep "Compliance Score:" "$LATEST_LOG" | tail -10 || echo "      No compliance scores found"
fi

# Final summary
echo ""
echo "✨ Test Complete!"
echo "================="
echo ""
echo "Next steps:"
echo "1. Review the generated pages in: $APP_DIR/client/src/pages/"
echo "2. Check the log for Writer-Critic iterations: $LATEST_LOG"
echo "3. Verify pages follow patterns:"
echo "   - Use 'api' from @/lib/api (no fetch() calls)"
echo "   - Wrapped in AppLayout"
echo "   - Tailwind-only styling (no inline styles)"
echo "   - Proper loading/error states"
echo ""
