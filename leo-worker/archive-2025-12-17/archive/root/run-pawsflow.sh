#!/bin/bash

# PawsFlow - Veterinary Practice Management SaaS Pipeline Runner
# This script runs the app-factory pipeline to generate the PawsFlow application

set -e  # Exit on error

echo "🐾 Starting PawsFlow app generation pipeline..."
echo "================================================"

# Check if we're in the app-factory directory
if [ ! -f "pyproject.toml" ] || [ ! -d "src/app_factory" ]; then
    echo "❌ Error: This script must be run from the app-factory root directory"
    exit 1
fi

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ Error: 'uv' is not installed. Please install it first."
    exit 1
fi

# Read the prompt from file
PROMPT_FILE="prompts/vet-practice-saas.md"

# Check if prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo "❌ Error: Prompt file not found at $PROMPT_FILE"
    exit 1
fi

# Read the prompt content
PROMPT_CONTENT=$(cat "$PROMPT_FILE")

# Display pipeline configuration
echo "📋 Pipeline Configuration:"
echo "  - Prompt File: $PROMPT_FILE"
echo "  - App will be generated based on the prompt content"
echo "  - The app name will be determined automatically"
echo ""

# Ask for confirmation
read -p "🤔 Continue with pipeline execution? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Pipeline execution cancelled."
    exit 0
fi

echo ""
echo "🚀 Running app-factory pipeline..."
echo ""

# Run the pipeline with the prompt content
uv run python -m app_factory.main_v2 \
    --user-prompt "$PROMPT_CONTENT" \
    --skip-questions \
    --iterative-stage-1

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Pipeline completed successfully!"
    echo ""
    echo "📁 Generated files are in: apps/[app-name]"
    echo "   (The app name is determined from the prompt)"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Review the generated specs in apps/[app-name]/specs/"
    echo "  2. Check the frontend code in apps/[app-name]/frontend/"
    echo "  3. When stages 3-5 are implemented, you'll also have:"
    echo "     - Backend implementation"
    echo "     - Deployment configuration"
    echo ""
    echo "🐾 PawsFlow is ready for the next stage of development!"
else
    echo ""
    echo "❌ Pipeline execution failed. Check the error messages above."
    exit 1
fi