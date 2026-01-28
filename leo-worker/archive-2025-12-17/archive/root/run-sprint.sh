#!/bin/bash

# Generic Sprint Mode Runner
# Usage: ./run-sprint.sh <prompt-file> <app-name> <sprint-number>

# Ensure the script exits on first error
set -e

# Check arguments
if [ $# -lt 3 ]; then
    echo "Usage: $0 <prompt-file> <app-name> <sprint-number>"
    echo "Example: $0 prompts/planetscale-website.md planetscale-sprint 2"
    exit 1
fi

PROMPT_FILE=$1
APP_NAME=$2
SPRINT_NUMBER=$3

# Validate prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: Prompt file '$PROMPT_FILE' not found"
    exit 1
fi

# Read the prompt content
PROMPT_CONTENT=$(cat "$PROMPT_FILE")

# Run the pipeline with sprint mode enabled
echo "🚀 Running AI App Factory - Sprint Mode"
echo "📋 Prompt: $PROMPT_FILE"
echo "🏷️  App Name: $APP_NAME"
echo "📅 Building Sprint: $SPRINT_NUMBER of 3"
echo "=================================================="

uv run python -m app_factory.main_v2 \
    --user-prompt "$PROMPT_CONTENT" \
    --app-name "$APP_NAME" \
    --skip-questions \
    --iterative-stage-1 \
    --enable-sprints \
    --num-sprints 3 \
    --sprint "$SPRINT_NUMBER"

echo ""
echo "✅ Sprint $SPRINT_NUMBER generation complete!"
echo ""
echo "📁 Check apps/$APP_NAME/ for the generated application"
echo "📄 Sprint PRDs are in apps/$APP_NAME/specs/"