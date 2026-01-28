#!/bin/bash
# Script to continue pipeline from Stage 2 (Wireframe) with existing interaction spec
# This finds the latest checkpoint and resumes from where it left off

set -e  # Exit on error

echo "🚀 Continuing AI App Factory Pipeline from Stage 2 for ThePlugStreet"
echo "==================================================================="
echo ""

# Configuration
APP_NAME="theplug_20250718_151044"
APP_DIR="apps/${APP_NAME}"
INTERACTION_SPEC="${APP_DIR}/specs/frontend-interaction-spec.md"

# Check if interaction spec exists
if [ ! -f "$INTERACTION_SPEC" ]; then
    echo "❌ Error: Interaction spec not found at $INTERACTION_SPEC"
    echo "Please run Stage 1 first."
    exit 1
fi

echo "✅ Found interaction spec at: $INTERACTION_SPEC"
echo ""

# Find the latest checkpoint for this app
echo "🔍 Looking for checkpoints..."
LATEST_CHECKPOINT=$(ls -t checkpoints/manual_${APP_NAME}_*.json 2>/dev/null | head -1)

if [ -z "$LATEST_CHECKPOINT" ]; then
    # Try pipeline checkpoints
    LATEST_CHECKPOINT=$(ls -t checkpoints/pipeline_*.json 2>/dev/null | grep -l "\"app_name\": \"${APP_NAME}\"" | head -1)
fi

if [ -z "$LATEST_CHECKPOINT" ]; then
    echo "❌ No checkpoint found for app: $APP_NAME"
    echo "Creating a new checkpoint..."
    
    # Create checkpoint with Stage 1 marked as complete
    cat > create_stage2_checkpoint.py << EOF
import json
from datetime import datetime
from pathlib import Path

app_name = "${APP_NAME}"
app_dir = Path(f"apps/{app_name}")

checkpoint_id = f"stage2_{app_name}_{datetime.now().strftime('%H%M%S')}"
checkpoint_data = {
    "checkpoint_id": checkpoint_id,
    "app_name": app_name,
    "user_prompt": "Continuing from completed Stage 1",
    "created_at": datetime.now().isoformat(),
    "updated_at": datetime.now().isoformat(),
    "stages": {
        "prd": {
            "stage_name": "prd",
            "status": "completed",
            "start_time": datetime.now().isoformat(),
            "end_time": datetime.now().isoformat(),
            "cost": 0.0,
            "iterations": 0,
            "outputs": {"prd_path": str(app_dir / "specs" / "business_prd.md")},
            "metadata": {},
            "error": None
        },
        "interaction_spec": {
            "stage_name": "interaction_spec",
            "status": "completed",
            "start_time": datetime.now().isoformat(),
            "end_time": datetime.now().isoformat(),
            "cost": 3.17,  # Approximate from previous run
            "iterations": 1,
            "outputs": {"spec_path": str(app_dir / "specs" / "frontend-interaction-spec.md")},
            "metadata": {"writer_critic_iterations": 1},
            "error": None
        },
        "wireframe": {
            "stage_name": "wireframe",
            "status": "not_started",
            "start_time": None,
            "end_time": None,
            "cost": 0.0,
            "iterations": 0,
            "outputs": {},
            "metadata": {},
            "error": None
        }
    },
    "total_cost": 3.17
}

checkpoint_dir = Path("checkpoints")
checkpoint_dir.mkdir(exist_ok=True)
checkpoint_file = checkpoint_dir / f"{checkpoint_id}.json"

with open(checkpoint_file, 'w') as f:
    json.dump(checkpoint_data, f, indent=2)

print(f"CHECKPOINT_ID={checkpoint_id}")
EOF

    CHECKPOINT_OUTPUT=$(uv run python create_stage2_checkpoint.py)
    CHECKPOINT_ID=$(echo "$CHECKPOINT_OUTPUT" | grep "CHECKPOINT_ID=" | cut -d'=' -f2)
    rm -f create_stage2_checkpoint.py
else
    CHECKPOINT_ID=$(basename "$LATEST_CHECKPOINT" .json)
    echo "📋 Found checkpoint: $CHECKPOINT_ID"
fi

echo ""
echo "🏃 Resuming pipeline from Stage 2 (Wireframe)..."
echo "   - Checkpoint: $CHECKPOINT_ID"
echo "   - App name: $APP_NAME"
echo "   - Stage 2: Wireframe generation with Critic"
echo ""

# Resume pipeline from checkpoint
# Note: Stage 2 always uses iterative mode by default in v2
uv run python -m app_factory.main_v2 \
    --checkpoint "$CHECKPOINT_ID" 2>&1 | tee stage2_output.log || true

# Check if wireframe was created
if [ -d "${APP_DIR}/frontend/src" ]; then
    echo ""
    echo "✅ Stage 2 completed successfully!"
    echo ""
    echo "📁 Generated files:"
    echo "$(find ${APP_DIR}/frontend -name "*.tsx" -o -name "*.ts" | wc -l) TypeScript/React files created"
    echo ""
    echo "Key locations:"
    echo "  - Frontend code: ${APP_DIR}/frontend/"
    echo "  - Components: ${APP_DIR}/frontend/src/components/"
    echo "  - Pages: ${APP_DIR}/frontend/src/app/"
else
    echo ""
    echo "⚠️  Stage 2 may have encountered issues. Check stage2_output.log for details."
fi