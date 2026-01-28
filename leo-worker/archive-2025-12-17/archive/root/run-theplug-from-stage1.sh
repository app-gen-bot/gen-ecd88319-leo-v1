#!/bin/bash
# Script to run pipeline from Stage 1 with existing PRD
# This creates a checkpoint marking Stage 0 as complete, then resumes

set -e  # Exit on error

echo "🚀 Running AI App Factory Pipeline from Stage 1 for ThePlugStreet"
echo "======================================================"
echo ""

# Configuration
APP_NAME="theplug_20250718_151044"
APP_DIR="apps/${APP_NAME}"
PRD_PATH="${APP_DIR}/specs/business_prd.md"

# Check if PRD exists
if [ ! -f "$PRD_PATH" ]; then
    echo "❌ Error: PRD not found at $PRD_PATH"
    exit 1
fi

echo "📋 Found existing PRD at: $PRD_PATH"
echo "📁 App directory: $APP_DIR"
echo ""

# Create a Python script to set up the checkpoint
cat > setup_checkpoint_for_stage1.py << 'EOF'
import json
import sys
from datetime import datetime
from pathlib import Path

# Get app name from command line
app_name = sys.argv[1]
app_dir = Path(f"apps/{app_name}")
prd_path = app_dir / "specs" / "business_prd.md"

# Read the PRD content
prd_content = prd_path.read_text()

# Create checkpoint marking Stage 0 as complete
checkpoint_id = f"manual_{app_name}_{datetime.now().strftime('%H%M%S')}"
checkpoint_data = {
    "checkpoint_id": checkpoint_id,
    "app_name": app_name,
    "user_prompt": f"PRD loaded from {prd_path}",
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
            "outputs": {"prd_path": str(prd_path)},
            "metadata": {"loaded_from_existing": True},
            "error": None
        },
        "interaction_spec": {
            "stage_name": "interaction_spec",
            "status": "not_started",
            "start_time": None,
            "end_time": None,
            "cost": 0.0,
            "iterations": 0,
            "outputs": {},
            "metadata": {},
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
    "total_cost": 0.0
}

# Save checkpoint
checkpoint_dir = Path("checkpoints")
checkpoint_dir.mkdir(exist_ok=True)
checkpoint_file = checkpoint_dir / f"{checkpoint_id}.json"

with open(checkpoint_file, 'w') as f:
    json.dump(checkpoint_data, f, indent=2)

print(f"✅ Created checkpoint: {checkpoint_id}")
print(f"📝 Checkpoint file: {checkpoint_file}")
print(f"🎯 Ready to resume from Stage 1 with iterative mode")
print("")
print(f"CHECKPOINT_ID={checkpoint_id}")
EOF

echo "🔧 Setting up checkpoint for Stage 1 start..."
CHECKPOINT_OUTPUT=$(uv run python setup_checkpoint_for_stage1.py "$APP_NAME")
echo "$CHECKPOINT_OUTPUT"

# Extract checkpoint ID from output
CHECKPOINT_ID=$(echo "$CHECKPOINT_OUTPUT" | grep "CHECKPOINT_ID=" | cut -d'=' -f2)

if [ -z "$CHECKPOINT_ID" ]; then
    echo "❌ Failed to create checkpoint"
    rm -f setup_checkpoint_for_stage1.py
    exit 1
fi

# Clean up temp script
rm -f setup_checkpoint_for_stage1.py

echo ""
echo "🏃 Resuming pipeline from checkpoint with iterative Stage 1..."
echo "   - Checkpoint: $CHECKPOINT_ID"
echo "   - App name: $APP_NAME"
echo "   - Stage 1: Iterative mode enabled (Writer-Critic pattern)"
echo ""

# Resume pipeline from the checkpoint with iterative mode
uv run python -m app_factory.main_v2 \
    --checkpoint "$CHECKPOINT_ID" \
    --iterative-stage-1

echo ""
echo "✅ Pipeline execution completed!"
echo ""
echo "Check the following locations for generated artifacts:"
echo "  - Interaction Spec: $APP_DIR/specs/frontend-interaction-spec.md"
echo "  - Wireframe: $APP_DIR/frontend/"
echo "  - Checkpoints: checkpoints/"