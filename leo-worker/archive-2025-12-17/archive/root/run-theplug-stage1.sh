#!/bin/bash
# Script to generate Frontend Interaction Spec for ThePlugs app
# This runs ONLY Stage 1 with iterative mode for full coverage

set -e  # Exit on error

echo "🎯 Running Stage 1: Frontend Interaction Spec Generation for ThePlugs"
echo "===================================================================="
echo ""

# Configuration
APP_NAME="theplug"
APP_DIR="apps/${APP_NAME}"
PRD_PATH="${APP_DIR}/specs/business_prd.md"
OUTPUT_PATH="${APP_DIR}/specs/frontend-interaction-spec.md"

# Check if PRD exists and is not empty
if [ ! -f "$PRD_PATH" ]; then
    echo "❌ Error: PRD not found at $PRD_PATH"
    echo "Please ensure the Business PRD exists first."
    exit 1
fi

if [ ! -s "$PRD_PATH" ]; then
    echo "❌ Error: PRD file is empty at $PRD_PATH"
    echo "Please ensure the Business PRD has content."
    exit 1
fi

echo "📋 Input PRD: $PRD_PATH"
echo "📝 Output will be: $OUTPUT_PATH"
echo ""

# Method 1: Using the standalone stage script (if it exists)
if [ -f "src/app_factory/standalone/run_stage_1.py" ]; then
    echo "Using standalone Stage 1 runner..."
    uv run python -m app_factory.standalone.run_stage_1 \
        --prd-file "$PRD_PATH" \
        --output-dir "${APP_DIR}/specs" \
        --app-name "$APP_NAME" \
        --iterative
else
    # Method 2: Create a custom Python script to run just Stage 1
    echo "Creating custom Stage 1 runner..."
    
    cat > run_stage1_temp.py << 'EOF'
import asyncio
import sys
from pathlib import Path

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory.stages import stage_1_interaction_spec
from app_factory.utils import print_stage_header

async def main():
    app_name = sys.argv[1]
    prd_path = Path(sys.argv[2])
    
    # Read PRD content
    prd_content = prd_path.read_text()
    
    print(f"\n📄 PRD loaded: {len(prd_content)} characters")
    
    # Run Stage 1 with iterative mode for full coverage
    print("\n🔄 Running Stage 1 with iterative mode (Writer-Critic pattern)")
    print("This ensures complete coverage of all PRD features...\n")
    
    result = await stage_1_interaction_spec.run_stage(
        prd_content=prd_content,
        iterative_mode=True,  # Enable Writer-Critic iteration
        app_name=app_name
    )
    
    if result.success:
        # Save the interaction spec
        output_path = prd_path.parent / "frontend-interaction-spec.md"
        output_path.write_text(result.content)
        
        print(f"\n✅ Success! Interaction spec generated")
        print(f"📝 Output saved to: {output_path}")
        print(f"💰 Cost: ${result.cost:.4f}")
        
        # Show preview
        lines = result.content.split('\n')[:20]
        print("\n📄 Preview (first 20 lines):")
        print("-" * 60)
        for line in lines:
            print(line)
        print("-" * 60)
        
        if hasattr(result, 'metadata') and result.metadata:
            print(f"\n📊 Metadata: {result.metadata}")
    else:
        print(f"\n❌ Failed to generate interaction spec: {result.content}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python run_stage1_temp.py <app_name> <prd_path>")
        sys.exit(1)
    
    asyncio.run(main())
EOF

    # Run the custom script
    uv run python run_stage1_temp.py "$APP_NAME" "$PRD_PATH"
    
    # Clean up
    rm -f run_stage1_temp.py
fi

echo ""
echo "🎉 Stage 1 Complete!"
echo ""
echo "Next steps:"
echo "1. Review the generated interaction spec at: $OUTPUT_PATH"
echo "2. Run Stage 2 to generate the wireframe/frontend code"
echo ""
echo "To run Stage 2 after review:"
echo "uv run python -m app_factory.main_v2 \\"
echo "    --checkpoint <checkpoint-id> \\"
echo "    --app-name $APP_NAME"