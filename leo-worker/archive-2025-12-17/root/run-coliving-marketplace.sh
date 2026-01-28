#!/bin/bash
# Run Leonardo Pipeline for Co-Living Marketplace App

set -e  # Exit on error

echo "🏠 Co-Living Marketplace - Leonardo Pipeline"
echo "============================================="
echo ""

# Configuration
PROMPT_FILE="coliving-marketplace-prompt.md"
WORKSPACE_NAME="coliving-marketplace_v2"
WORKSPACE_DIR="apps/$WORKSPACE_NAME"

# Check if prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo "❌ Prompt file not found: $PROMPT_FILE"
    exit 1
fi

echo "📋 Configuration:"
echo "   Prompt: $PROMPT_FILE"
echo "   Workspace: $WORKSPACE_DIR"
echo ""

# Optional: Remove existing workspace for clean run
read -p "🗑️  Remove existing workspace '$WORKSPACE_DIR'? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -d "$WORKSPACE_DIR" ]; then
        echo "🧹 Removing existing workspace..."
        rm -rf "$WORKSPACE_DIR"
        echo "✅ Workspace cleaned"
    else
        echo "ℹ️  No existing workspace to remove"
    fi
fi
echo ""

# Read the prompt
PROMPT=$(cat "$PROMPT_FILE")

# Run the Leonardo pipeline
echo "🚀 Starting Leonardo Pipeline..."
echo "   This will generate:"
echo "   1. Plan (plan.md)"
echo "   2. UI Component Spec"
echo "   3. Design System"
echo "   4. Technical Architecture Spec (pages-and-routes.md)"
echo "   5. Backend Spec (schema.zod.ts + contracts)"
echo "   6. Template Extraction"
echo "   7. Frontend Interaction Spec (Master + Page Specs) - PARALLEL ⚡"
echo "   8. Full Application Code"
echo ""
echo "⏱️  Estimated time: 30-45 minutes"
echo ""

# Run with uv
uv run python src/app_factory_leonardo_replit/run.py \
    --workspace-name "$WORKSPACE_NAME" \
    "$PROMPT"

echo ""
echo "============================================="
echo "✅ Pipeline Complete!"
echo "============================================="
echo ""
echo "📁 Generated app location: $WORKSPACE_DIR/app"
echo ""
echo "🚀 To run the app:"
echo "   cd $WORKSPACE_DIR/app"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "🌐 The app will be available at: http://localhost:5000"
echo ""
