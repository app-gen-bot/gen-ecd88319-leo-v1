#!/bin/bash

# Run the Happy Llama website generation pipeline

echo "🦙 Starting Happy Llama Website Generation Pipeline"
echo "================================================="

# Read the prompt from file
PROMPT_CONTENT=$(cat prompts/happyllama-website.md)

# Run the pipeline with the recommended flags
uv run python -m app_factory.main_v2 \
    --user-prompt "$PROMPT_CONTENT" \
    --app-name "happyllama_v2" \
    --skip-questions \
    --iterative-stage-1

echo "Pipeline execution complete!"