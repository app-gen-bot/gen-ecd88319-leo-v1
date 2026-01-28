#!/bin/bash
# Fix Anthropic Authentication
# This script ensures the correct API key is used and removes the problematic OAuth token

echo "=================================================="
echo "Fixing Anthropic Authentication"
echo "=================================================="
echo ""

# 1. Unset the problematic OAuth token (if set in shell)
echo "✅ Step 1: Clearing any OAuth token from environment"
unset ANTHROPIC_AUTH_TOKEN
export -n ANTHROPIC_AUTH_TOKEN  # Also unexport if exported

# 2. Load the correct API key from .env file
echo "✅ Step 2: Loading ANTHROPIC_API_KEY from .env"
if [ -f ".env" ]; then
    # Extract and clean the API key (remove any whitespace/newlines)
    API_KEY=$(grep "^ANTHROPIC_API_KEY=" .env | cut -d'=' -f2 | tr -d '[:space:]' | tr -d '"' | tr -d "'")

    if [ -n "$API_KEY" ]; then
        export ANTHROPIC_API_KEY="$API_KEY"
        echo "✅ ANTHROPIC_API_KEY set from .env"
        echo "   Key starts with: ${API_KEY:0:20}..."
    else
        echo "❌ ANTHROPIC_API_KEY not found in .env"
        exit 1
    fi
else
    echo "❌ .env file not found"
    exit 1
fi

# 3. Verify the setup
echo ""
echo "=================================================="
echo "Verification"
echo "=================================================="
echo "ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:-<not set>}"
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:20}... (${#ANTHROPIC_API_KEY} chars)"
echo ""
echo "✅ Environment fixed!"
echo ""
echo "Now run your command in this same shell:"
echo "  uv run python run-app-generator.py \"Test AI recommendations\" --no-expand --app-name RaiseIQ"
echo ""
echo "=================================================="
