#!/bin/bash
# Test simplified sprint breakdown with PawsFlow PRD

echo "🚀 Running Simplified Sprint Breakdown Test"
echo ""
echo "This approach creates ONE comprehensive document instead of multiple files."
echo "The agent will analyze the PawsFlow PRD and create a single 'sprints_breakdown.md' file."
echo ""

# Run the test
uv run python test_pawsflow_simple_sprint.py