#!/bin/bash

# PlanetScale Website Sprint Mode Test Script
# This script runs the app factory pipeline with sprint breakdown enabled

# Ensure the script exits on first error
set -e

# Read the prompt content
PROMPT_CONTENT=$(cat prompts/planetscale-website.md)

# Run the pipeline with sprint mode enabled
echo "🚀 Running AI App Factory with Sprint Mode for PlanetScale Website"
echo "📅 Breaking down into 3 sprints, building Sprint 1 (MVP)"
echo "=================================================="

uv run python -m app_factory.main_v2 \
    --user-prompt "$PROMPT_CONTENT" \
    --app-name "planetscale-website-sprint1" \
    --skip-questions \
    --iterative-stage-1 \
    --enable-sprints \
    --num-sprints 3 \
    --sprint 1

echo ""
echo "✅ Sprint 1 MVP generation complete!"
echo ""
echo "To build other sprints, run with --sprint 2 or --sprint 3"
echo "Example: ./run-planetscale-website-sprints.sh --sprint 2"