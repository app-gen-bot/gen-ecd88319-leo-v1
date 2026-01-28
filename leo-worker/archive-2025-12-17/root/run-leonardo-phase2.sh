#!/bin/bash

# Leonardo App Factory Runner Script - Phase 2
# This script runs the Leonardo pipeline up to Phase 2 (enhanced features)
# Phase 2 includes more advanced entities and features beyond the MVP

echo "🚀 Leonardo App Factory - Phase 2 Runner"
echo "========================================="
echo "This will generate an app with enhanced features (Phase 2)"
echo ""

# Default values
DEFAULT_PROMPT="Create a wedding chapel booking platform with beautiful design"
DEFAULT_WORKSPACE="timeless-weddings-phase2"
DEFAULT_FRONTEND_PORT=5173
DEFAULT_BACKEND_PORT=8000
DEFAULT_PHASE=2
DEFAULT_MAX_ENTITIES=5

# Parse command line arguments or use defaults
PROMPT="${1:-$DEFAULT_PROMPT}"
WORKSPACE_NAME="${2:-$DEFAULT_WORKSPACE}"

echo "Configuration:"
echo "📝 Prompt: $PROMPT"
echo "📁 Workspace: apps/$WORKSPACE_NAME"
echo "🔌 Ports: Frontend=$DEFAULT_FRONTEND_PORT, Backend=$DEFAULT_BACKEND_PORT"
echo "📊 Phase: $DEFAULT_PHASE (Enhanced Features)"
echo "📈 Max Entities per Phase: $DEFAULT_MAX_ENTITIES"
echo ""

# Confirm before proceeding
read -p "Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "Starting Leonardo App Factory Pipeline (Phase 2)..."
echo ""

# Run the Leonardo App Factory with Phase 2 configuration
uv run python src/app_factory_leonardo_replit/run.py \
    "$PROMPT" \
    --workspace-name "$WORKSPACE_NAME" \
    --frontend-port $DEFAULT_FRONTEND_PORT \
    --backend-port $DEFAULT_BACKEND_PORT \
    --phase $DEFAULT_PHASE \
    --max-entities-phase1 $DEFAULT_MAX_ENTITIES

# Check if the command succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Phase 2 generation complete!"
    echo "📁 App location: apps/$WORKSPACE_NAME"
    echo ""
    echo "To run the generated app:"
    echo "  cd apps/$WORKSPACE_NAME/app"
    echo "  npm install"
    echo "  npm run dev"
else
    echo ""
    echo "❌ Phase 2 generation failed. Check the logs for details."
    exit 1
fi