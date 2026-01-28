#!/bin/bash
# Test script for LoveyTasks app generation

echo "🏭 Testing AI App Factory with LoveyTasks - Family Task Assigner"
echo "=============================================================="
echo ""
echo "This will test:"
echo "✅ Navigation completeness (all menus and links)"
echo "✅ Browser in visible mode"
echo "✅ Checkpoint system"
echo "✅ Progress monitoring"
echo ""

# Read the prompt from file
PROMPT=$(cat test_prompts/lovey_task_prompt.md)

# Run the app factory with the prompt
echo "🚀 Starting App Factory..."
echo ""

uv run python -m app_factory.main_v2 \
  --user-prompt "$PROMPT" \
  --iterative-stage-1 \
  --skip-questions

# Note: You can monitor progress in another terminal with:
# uv run python -m app_factory.monitor