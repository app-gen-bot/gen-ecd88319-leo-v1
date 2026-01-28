#!/bin/bash

# Run the AI Tenant Lawyer app through App Factory v2

echo "🏛️ Starting AI Tenant Rights Advisor generation..."
echo "================================================"

# Read the prompt from file
PROMPT=$(cat prompts/ai_tenant_lawyer_prompt.md)

# Run the app factory with the prompt
uv run python -m app_factory.main_v2 \
  --user-prompt "$PROMPT" \
  --iterative-stage-1

echo ""
echo "✅ App generation started! Check the logs for progress."
echo "📁 Output will be in: apps/[generated-app-name]/"