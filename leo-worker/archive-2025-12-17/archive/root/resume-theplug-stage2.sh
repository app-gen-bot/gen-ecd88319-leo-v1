#!/bin/bash
# Resume ThePlugStreet app at Stage 2 with dynamic iterations

set -e

APP_NAME="theplug"
CHECKPOINT_FILE="checkpoints/theplug_checkpoint.json"

echo "🚀 Resuming ThePlugStreet app - Stage 2 (Dynamic Iterations)"
echo "=================================================="
echo ""
echo "This script uses the updated Stage 2 with:"
echo "- Dynamic iteration count based on Critic decisions"
echo "- Enhanced Critic with exhaustive testing requirements"
echo "- Enhanced Writer with mandatory build test"
echo "- Continues until Critic approves or safety limit reached"
echo ""

# Check if checkpoint exists
if [ ! -f "$CHECKPOINT_FILE" ]; then
    echo "❌ Error: Checkpoint file not found at $CHECKPOINT_FILE"
    echo "Please ensure you've run Stage 1 first."
    exit 1
fi

# Extract checkpoint ID from the file
CHECKPOINT_ID=$(python3 -c "import json; print(json.load(open('$CHECKPOINT_FILE'))['checkpoint_id'])")

echo "📋 Found checkpoint: $CHECKPOINT_ID"
echo ""

# Resume using main_v2 with --iterative-stage-1 flag
echo "🎯 Using main_v2 pipeline with checkpoint resume..."
echo ""
echo "Note: The existing Stage 2 now includes:"
echo "- Dynamic iterations (min: 2, max: 10)"
echo "- Enhanced Critic system prompt for exhaustive testing"
echo "- Enhanced Writer system prompt for build test enforcement"
echo ""

# Resume from checkpoint with iterative mode
uv run python -m app_factory.main_v2 \
    --checkpoint "$CHECKPOINT_ID" \
    --iterative-stage-1

echo ""
echo "✅ Stage 2 execution complete!"
echo ""
echo "📁 Output location: apps/$APP_NAME/frontend/"
echo "📋 Reports location: apps/$APP_NAME/specs/"
echo ""
echo "Next steps:"
echo "1. Review the generated wireframe in apps/$APP_NAME/frontend/"
echo "2. Check the critic analysis reports in apps/$APP_NAME/specs/"
echo "3. If successful, proceed to Stage 3 (Technical Specification) when implemented"