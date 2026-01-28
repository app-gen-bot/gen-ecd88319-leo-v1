#!/bin/bash

# Test script for Frontend Implementation Binary on Chapel Elegance app
# Run this to see how BinaryAgent picks up from existing work

echo "============================================"
echo "🧪 Frontend Implementation Binary Test"
echo "============================================"
echo ""
echo "This will test the iteration-aware BinaryAgent on the existing Chapel Elegance app"
echo "Workspace: /Users/labheshpatel/apps/app-factory/apps/app-phase2-20250928-011324/app"
echo ""

# Change to the app-factory directory
cd /Users/labheshpatel/apps/app-factory

# Run the test with uv
echo "▶️  Starting test (this may take a few minutes for one iteration)..."
echo ""
uv run python test_frontend_binary.py

# Show exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test completed successfully!"
else
    echo ""
    echo "❌ Test failed or was interrupted"
fi

# Check if state file was created
STATE_FILE="/Users/labheshpatel/apps/app-factory/apps/app-phase2-20250928-011324/app/.iteration/frontend_implementation_state.yaml"
if [ -f "$STATE_FILE" ]; then
    echo ""
    echo "📄 State file created at:"
    echo "   $STATE_FILE"
    echo ""
    echo "State contents:"
    head -20 "$STATE_FILE"
fi

# Check git log in the app directory
echo ""
echo "📝 Recent git commits in app:"
cd /Users/labheshpatel/apps/app-factory/apps/app-phase2-20250928-011324/app
git log --oneline -5 2>/dev/null || echo "No git history yet"

echo ""
echo "============================================"
echo "Test complete. Check the output above."
echo "============================================"