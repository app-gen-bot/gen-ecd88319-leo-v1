#!/bin/bash
# Convenience script to run modular FIS generation on timeless-weddings-phase1

set -e

APP_DIR="apps/timeless-weddings-phase1/app"

echo "🚀 Running Modular FIS Generation"
echo "=================================="
echo ""
echo "App Directory: $APP_DIR"
echo ""

# Run the standalone script
uv run python run-modular-fis-standalone.py "$APP_DIR"

echo ""
echo "✅ Done!"
echo ""
echo "Generated files:"
echo "  - $APP_DIR/specs/frontend-interaction-spec-master.md (master patterns)"
echo "  - $APP_DIR/specs/pages/*.md (individual page specs)"
