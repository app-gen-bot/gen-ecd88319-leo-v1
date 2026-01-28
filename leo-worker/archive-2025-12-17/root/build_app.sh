#!/bin/bash

# AI App Factory Build Script
# This script runs the AI App Factory pipeline to generate applications from prompts

echo "=================================================="
echo "AI App Factory Build Pipeline"
echo "=================================================="
echo ""

# Check if prompt is provided as argument
if [ $# -eq 0 ]; then
    echo "Error: No prompt provided"
    echo "Usage: $0 \"Your app description here\""
    echo "Example: $0 \"A todo list app with user authentication\""
    exit 1
fi

# Generate timestamp-based app name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APP_NAME="app_${TIMESTAMP}"

# Get prompt from command line argument
PROMPT_CONTENT="$1"

echo ""
echo "Starting pipeline with:"
echo "- App name: $APP_NAME"
echo "- Prompt: \"$PROMPT_CONTENT\""
echo "- Iterative Stage 1: Yes (for validation)"
echo "- Skip questions: Yes (direct PRD generation)"
echo ""

# Run the pipeline with all recommended flags
uv run python -m app_factory.main_v2 \
    --user-prompt "$PROMPT_CONTENT" \
    --app-name "$APP_NAME" \
    --skip-questions \
    --iterative-stage-1

# Check if the pipeline completed successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "Pipeline completed successfully!"
    echo "=================================================="
    echo ""
    echo "Generated app location: apps/$APP_NAME/"
    echo ""
    echo "Next steps:"
    echo "1. Review the generated specs in: apps/$APP_NAME/specs/"
    echo "2. Check the frontend implementation in: apps/$APP_NAME/frontend/"
    echo "3. Start the dev server:"
    echo "   cd apps/$APP_NAME/frontend"
    echo "   npm run dev"
    echo ""
else
    echo ""
    echo "=================================================="
    echo "Pipeline failed. Check the logs above for errors."
    echo "=================================================="
    exit 1
fi