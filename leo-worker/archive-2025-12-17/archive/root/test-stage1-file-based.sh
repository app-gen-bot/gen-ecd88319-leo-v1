#!/bin/bash
# Test script for file-based Writer-Critic iteration in Stage 1

echo "Testing file-based Writer-Critic iteration for Stage 1..."

# Use a simple test prompt
TEST_PROMPT="Create a simple todo list application with add, delete, and mark complete features."

# Run with iterative mode and a test app name
uv run python -m app_factory.main_v2 \
    --user-prompt "$TEST_PROMPT" \
    --app-name "test-stage1-file-iteration" \
    --skip-questions \
    --iterative-stage-1 \
    --stop-after-stage 1

echo "Test complete. Check apps/test-stage1-file-iteration/specs/frontend-interaction-spec.md"