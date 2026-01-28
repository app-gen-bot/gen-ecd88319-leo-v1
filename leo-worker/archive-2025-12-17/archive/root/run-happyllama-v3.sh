#!/bin/bash

# Happy Llama v3 Website Generation Script
# This script runs the AI App Factory pipeline to generate the Happy Llama website

echo "=================================================="
echo "Happy Llama v3 Website Generation Pipeline"
echo "=================================================="
echo ""

# Set the app name
APP_NAME="happyllama_v3"

# Read the prompt from file
PROMPT_FILE="prompts/happyllama-v3-prompt.md"

if [ ! -f "$PROMPT_FILE" ]; then
    echo "Error: Prompt file not found at $PROMPT_FILE"
    exit 1
fi

echo "Loading prompt from: $PROMPT_FILE"
PROMPT_CONTENT=$(cat "$PROMPT_FILE")

echo ""
echo "Starting pipeline with:"
echo "- App name: $APP_NAME"
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