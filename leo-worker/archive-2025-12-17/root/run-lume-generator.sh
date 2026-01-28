#!/bin/bash

# Generate Lume - Longevity Knowledge & Protocol Generator App
# This script runs the app generator with the Lume prompt

set -e  # Exit on error

echo "🌟 Generating Lume App - Longevity Knowledge & Protocol Generator"
echo "================================================================"
echo ""

# Check if prompt file exists
if [ ! -f "prompts/lume-prompt.md" ]; then
    echo "❌ Error: Prompt file not found at prompts/lume-prompt.md"
    exit 1
fi

# Run the app generator
uv run python run-app-generator.py \
    --prompt-file prompts/lume-prompt.md \
    --no-expand \
    --app-name lume
    --reprompter-mode autonomous
    --max-iterations 25

echo ""
echo "✅ Lume app generation complete!"
echo ""
echo "Next steps:"
echo "  cd apps/lume/app"
echo "  npm install"
echo "  npm run dev"
echo ""
