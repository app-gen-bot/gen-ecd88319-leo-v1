#!/bin/bash

# Leonardo App Factory - Timeless Weddings Phase 1
# Builds the core MVP with essential wedding chapel booking features
#
# Usage:
#   ./run-timeless-weddings-phase1.sh              # Normal run (skips existing)
#   ./run-timeless-weddings-phase1.sh --clean      # Full clean + regenerate
#   ./run-timeless-weddings-phase1.sh --clean-contracts  # Clean contracts only
#   ./run-timeless-weddings-phase1.sh --clean-specs      # Clean FIS specs only
#   ./run-timeless-weddings-phase1.sh --clean-pages      # Clean pages only
#   ./run-timeless-weddings-phase1.sh --yes        # Skip confirmation
#   ./run-timeless-weddings-phase1.sh --clean --yes      # Combine flags

echo "🚀 Leonardo App Factory - Timeless Weddings Phase 1 (MVP)"
echo "=========================================================="
echo ""

# Configuration
PROMPT="Create a wedding chapel booking platform with stunning DARK THEME design following docs/design-best-practices/design-requirements.md"
WORKSPACE="timeless-weddings-phase1"
FRONTEND_PORT=5173
BACKEND_PORT=8000
PHASE=1
MAX_ENTITIES=5

# Parse command line arguments
CLEAN_FLAGS=""
SKIP_CONFIRM=false

for arg in "$@"; do
    case $arg in
        --clean)
            CLEAN_FLAGS="$CLEAN_FLAGS --clean"
            ;;
        --clean-contracts)
            CLEAN_FLAGS="$CLEAN_FLAGS --clean-contracts"
            ;;
        --clean-specs)
            CLEAN_FLAGS="$CLEAN_FLAGS --clean-specs"
            ;;
        --clean-pages)
            CLEAN_FLAGS="$CLEAN_FLAGS --clean-pages"
            ;;
        --yes|-y)
            SKIP_CONFIRM=true
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --clean              Clean entire workspace before generation"
            echo "  --clean-contracts    Clean only contracts and API client"
            echo "  --clean-specs        Clean only FIS specifications"
            echo "  --clean-pages        Clean only generated frontend pages"
            echo "  --yes, -y            Skip confirmation prompt"
            echo "  --help, -h           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                          # Normal run (skips existing files)"
            echo "  $0 --clean                  # Full regeneration"
            echo "  $0 --clean-contracts        # Regenerate contracts only"
            echo "  $0 --clean --yes            # Full regeneration without prompt"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $arg"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "Configuration:"
echo "📝 Prompt: Wedding chapel booking platform with dark theme"
echo "📁 Workspace: apps/$WORKSPACE"
echo "🔌 Ports: Frontend=$FRONTEND_PORT, Backend=$BACKEND_PORT"
echo "📊 Phase: $PHASE (Core MVP)"
echo "📈 Max Entities: $MAX_ENTITIES"
if [ -n "$CLEAN_FLAGS" ]; then
    echo "🧹 Clean options:$CLEAN_FLAGS"
fi
echo ""
echo "Phase 1 will include:"
echo "• Basic entity models and database schema"
echo "• Essential CRUD operations"
echo "• Core user authentication"
echo "• Fundamental UI components"
echo "• ASTOUNDING dark theme design"
echo ""

# Confirm before proceeding (unless --yes flag)
if [ "$SKIP_CONFIRM" = false ]; then
    read -p "Continue with Phase 1 generation? [y/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

echo ""
echo "Starting Leonardo App Factory Pipeline (Phase 1)..."
echo ""

# Run the Leonardo App Factory
uv run python src/app_factory_leonardo_replit/run.py \
    "$PROMPT" \
    --workspace-name "$WORKSPACE" \
    --frontend-port $FRONTEND_PORT \
    --backend-port $BACKEND_PORT \
    --phase $PHASE \
    --max-entities-phase1 $MAX_ENTITIES \
    $CLEAN_FLAGS

# Check if the command succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Phase 1 generation complete!"
    echo "📁 App location: apps/$WORKSPACE"
    echo ""
    echo "To run the app:"
    echo "  cd apps/$WORKSPACE/app"
    echo "  npm install"
    echo "  npm run dev"
else
    echo ""
    echo "❌ Phase 1 generation failed. Check the logs for details."
    exit 1
fi
