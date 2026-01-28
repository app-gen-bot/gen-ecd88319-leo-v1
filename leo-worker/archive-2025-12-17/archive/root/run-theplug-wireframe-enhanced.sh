#!/bin/bash
# Enhanced wireframe generation with build test validation and retry logic

echo "🚀 Running Enhanced Wireframe Generation for ThePlugStreet"
echo "========================================================"
echo ""
echo "Enhanced features:"
echo "✅ Exponential backoff retry for API errors and timeouts"
echo "✅ Mandatory build test before completion"
echo "✅ Automatic error recovery"
echo ""

# First, we need to temporarily update the wireframe import in stage_2_wireframe_v2.py
# to use the enhanced agent. Create a patch script:

cat > patch_wireframe_stage.py << 'EOF'
import fileinput
import sys

# Read the stage file and replace the import
stage_file = "src/app_factory/stages/stage_2_wireframe_v2.py"

# Create a backup
import shutil
shutil.copy2(stage_file, stage_file + ".backup")

# Replace the import
with fileinput.FileInput(stage_file, inplace=True) as file:
    for line in file:
        if "from app_factory.agents.stage_2_wireframe.wireframe import WireframeAgent" in line:
            print("from app_factory.agents.stage_2_wireframe.wireframe.enhanced_agent import EnhancedWireframeAgent as WireframeAgent")
        else:
            print(line, end='')

print("✅ Patched stage file to use EnhancedWireframeAgent")
EOF

# Apply the patch
echo "📝 Applying enhanced wireframe agent..."
python patch_wireframe_stage.py

# Run the resume command with the enhanced agent
echo ""
echo "🏃 Starting wireframe generation with enhanced features..."
./resume-theplug-wireframe.sh

# Restore the original file
echo ""
echo "🔄 Restoring original stage file..."
mv src/app_factory/stages/stage_2_wireframe_v2.py.backup src/app_factory/stages/stage_2_wireframe_v2.py

# Clean up
rm -f patch_wireframe_stage.py

echo ""
echo "✅ Enhanced wireframe generation complete!"
echo ""
echo "Key improvements applied:"
echo "- API timeouts will retry with exponential backoff"
echo "- Build test will run even if timeout occurs"
echo "- Better error handling and recovery"