#!/bin/bash
# Script to run the full AI App Factory pipeline using an existing PRD
# This script reads the existing PRD and runs all stages with iterative mode

set -e  # Exit on error

echo "🚀 Running AI App Factory Pipeline for ThePlugStreet"
echo "=================================================="
echo ""

# Check if PRD exists
PRD_PATH="apps/theplug/specs/business_prd.md"
if [ ! -f "$PRD_PATH" ]; then
    echo "❌ Error: PRD not found at $PRD_PATH"
    echo "Please ensure the Business PRD exists first."
    exit 1
fi

echo "📋 Reading existing PRD from: $PRD_PATH"

# Read the existing PRD content
PRD_CONTENT=$(cat "$PRD_PATH")

# Create a prompt that instructs the system to use this PRD
FULL_PROMPT="Please use the following PRD as the Business PRD for this project. Save it as needed and proceed with generating the interaction specification and subsequent stages.

===== BUSINESS PRD =====
$PRD_CONTENT
===== END OF PRD ====="

echo "✅ PRD loaded successfully"
echo ""
echo "🏃 Running pipeline with:"
echo "   - App name: theplug"
echo "   - Iterative Stage 1: Enabled (Writer-Critic pattern)"
echo "   - Skip questions: Enabled"
echo ""

# Run the main pipeline
uv run python -m app_factory.main_v2 \
    --user-prompt "$FULL_PROMPT" \
    --app-name "theplug" \
    --skip-questions \
    --iterative-stage-1

echo ""
echo "✅ Pipeline execution completed!"
echo ""
echo "Check the following locations for generated artifacts:"
echo "  - Interaction Spec: apps/theplug/specs/frontend-interaction-spec.md"
echo "  - Wireframe: apps/theplug/frontend/"
echo "  - Logs: Check console output above for details"