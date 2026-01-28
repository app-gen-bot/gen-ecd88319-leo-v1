#!/bin/bash

# MCP-Jumio Suite Generator
# This script generates the Jumio MCP server suite using the app-factory pipeline

set -e

echo "Starting MCP-Jumio Suite generation..."
echo "Prompt file: prompts/jumio-mcp-suite.md"
echo ""

uv run python run-app-generator.py \
  --app-name jumio-mcp \
  --no-expand \
  --prompt-file prompts/jumio-mcp-suite.md \
  --reprompter-mode autonomous \
  --max-iterations 25

echo ""
echo "Generation complete! Check apps/jumio-mcp/ for output."
