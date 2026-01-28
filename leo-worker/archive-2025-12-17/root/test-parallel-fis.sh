#!/bin/bash
# Test script for parallel FIS generation

set -e  # Exit on error

echo "🧪 Testing Parallel FIS Generation"
echo "=================================="
echo ""

APP_DIR="apps/timeless-weddings-phase1/app"

# Check prerequisites
echo "📋 Checking prerequisites..."
if [ ! -d "$APP_DIR" ]; then
    echo "❌ App directory not found: $APP_DIR"
    exit 1
fi

if [ ! -f "$APP_DIR/specs/plan.md" ]; then
    echo "❌ plan.md not found"
    exit 1
fi

if [ ! -f "$APP_DIR/specs/pages-and-routes.md" ]; then
    echo "❌ pages-and-routes.md not found"
    exit 1
fi

if [ ! -f "$APP_DIR/shared/schema.zod.ts" ]; then
    echo "❌ schema.zod.ts not found"
    exit 1
fi

if [ ! -d "$APP_DIR/shared/contracts" ]; then
    echo "❌ contracts/ directory not found"
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Remove existing page specs for clean test
if [ -d "$APP_DIR/specs/pages" ]; then
    echo "🧹 Removing existing page specs for clean test..."
    rm -rf "$APP_DIR/specs/pages"
fi

# Run parallel FIS generation
echo "🚀 Running parallel FIS generation..."
echo ""
uv run python run-modular-fis-standalone.py "$APP_DIR" \
    --max-concurrency 5 \
    --timeout 1800 \
    --retry-attempts 3

echo ""
echo "✅ Test complete!"
echo ""

# Show generated files
if [ -d "$APP_DIR/specs/pages" ]; then
    echo "📁 Generated page specs:"
    ls -lh "$APP_DIR/specs/pages/"
else
    echo "⚠️  No page specs directory created"
fi
