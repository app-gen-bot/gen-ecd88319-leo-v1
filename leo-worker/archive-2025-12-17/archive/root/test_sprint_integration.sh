#!/bin/bash
# Test script to verify sprint integration and backward compatibility

set -e  # Exit on error

echo "🧪 Testing Sprint Integration and Backward Compatibility"
echo "========================================================"
echo ""

# Test 1: Normal mode (backward compatibility)
echo "📋 Test 1: Normal Mode (No Sprint Features)"
echo "-------------------------------------------"
echo "This should work exactly as before, without any sprint features"
echo ""
echo "Command:"
echo 'uv run python -m app_factory.main_v2 \
    --user-prompt "Create a simple todo list app" \
    --skip-questions \
    --iterative-stage-1'
echo ""
echo "Expected: Normal pipeline execution without sprint breakdown"
echo ""

# Test 2: Sprint breakdown only mode
echo "📋 Test 2: Sprint Breakdown Only Mode"
echo "-------------------------------------"
echo "This should generate sprint breakdown and stop"
echo ""
echo "Command:"
echo 'uv run python -m app_factory.main_v2 \
    --user-prompt "Create a task management app with authentication, CRUD, and reporting" \
    --skip-questions \
    --sprint-breakdown-only'
echo ""
echo "Expected: Generate sprint breakdown in specs folder and stop"
echo ""

# Test 3: Sprint build mode
echo "📋 Test 3: Sprint Build Mode"
echo "----------------------------"
echo "This should build a specific sprint from an existing breakdown"
echo ""
echo "Command:"
echo 'uv run python -m app_factory.main_v2 \
    --sprint-breakdown apps/example-app/specs/sprints_breakdown.md \
    --sprint 1 \
    --iterative-stage-1'
echo ""
echo "Expected: Build Sprint 1 without generating PRD"
echo ""

# Test 4: Incremental sprint build
echo "📋 Test 4: Incremental Sprint Build"
echo "-----------------------------------"
echo "This should build Sprint 2 on top of Sprint 1"
echo ""
echo "Command:"
echo 'uv run python -m app_factory.main_v2 \
    --sprint-breakdown apps/example-app/specs/sprints_breakdown.md \
    --sprint 2 \
    --previous-sprint-path apps/example-app-sprint1/ \
    --iterative-stage-1'
echo ""
echo "Expected: Build Sprint 2 features incrementally"
echo ""

# Test 5: Deprecated mode (backward compatibility)
echo "📋 Test 5: Deprecated Sprint Mode"
echo "---------------------------------"
echo "This should still work but show deprecation warning"
echo ""
echo "Command:"
echo 'uv run python -m app_factory.main_v2 \
    --user-prompt "Create a simple app" \
    --skip-questions \
    --enable-sprints \
    --num-sprints 3 \
    --sprint 1'
echo ""
echo "Expected: Warning about deprecation, but still works"
echo ""

echo "💡 To run these tests:"
echo "1. Choose a test command above"
echo "2. Run it in your terminal"
echo "3. Verify the expected behavior"
echo ""
echo "✅ If all tests pass, the sprint integration is working correctly!"