#!/bin/bash
# Quick test to verify backward compatibility

echo "🧪 Quick Backward Compatibility Test"
echo "===================================="
echo ""
echo "Testing that the pipeline works without any sprint features..."
echo ""

# Run with a very simple prompt to test quickly
uv run python -m app_factory.main_v2 \
    --user-prompt "Create a hello world web app that displays a greeting" \
    --skip-questions \
    --app-name "test-backward-compat" \
    2>&1 | grep -E "(Sprint|sprint)" || echo "✅ No sprint references found - backward compatibility maintained!"

echo ""
echo "Checking generated files..."
if [ -d "apps/test-backward-compat/specs" ]; then
    echo "✅ Specs directory created"
    if [ -f "apps/test-backward-compat/specs/sprints_breakdown.md" ]; then
        echo "❌ Sprint breakdown file found - this shouldn't exist in normal mode!"
    else
        echo "✅ No sprint breakdown file - correct!"
    fi
else
    echo "❌ Specs directory not found"
fi

echo ""
echo "Test complete!"