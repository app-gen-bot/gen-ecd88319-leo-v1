#!/bin/bash

# Run Flyra MVP through the AI App Factory

echo "🚀 Starting AI App Factory for Flyra MVP..."
echo "================================================"

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run: uv venv && uv pip install -e ."
    exit 1
fi

# Load environment variables (properly handle comments)
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
else
    echo "⚠️  No .env file found. Make sure environment variables are set."
fi

# Read the Flyra prompt
PROMPT_FILE="prompts/flyra_mvp_prompt.md"

if [ ! -f "$PROMPT_FILE" ]; then
    echo "❌ Prompt file not found: $PROMPT_FILE"
    exit 1
fi

# Read the content of the prompt file
PROMPT_CONTENT=$(cat "$PROMPT_FILE")

echo "📄 Using prompt from: $PROMPT_FILE"
echo "================================================"

# Run the app factory with main_v2
echo "🏭 Running app-factory with main_v2..."
echo ""

# Use main_v2 with the prompt content as argument
# --skip-questions: Skip interactive prompts and generate PRD directly
uv run python -m app_factory.main_v2 --user-prompt "$PROMPT_CONTENT" --skip-questions

echo ""
echo "================================================"
echo "✅ App generation process completed!"
echo "📁 Check the 'apps/' directory for the generated Flyra application"
echo ""
echo "Next steps:"
echo "1. Navigate to the generated app directory"
echo "2. Follow the README for setup instructions"
echo "3. Start the development servers"