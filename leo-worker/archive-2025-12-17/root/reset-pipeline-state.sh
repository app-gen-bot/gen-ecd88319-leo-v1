#!/bin/bash

# Script to reset pipeline state when agents get stuck at max iterations

WORKSPACE_DIR="/Users/labheshpatel/apps/app-factory/apps/test-pipeline-1759180486"

echo "🔄 Pipeline State Reset Tool"
echo "============================="
echo ""
echo "This will reset the iteration states for stuck agents."
echo "Choose an option:"
echo ""
echo "1) Reset ONLY Contracts Designer (recommended)"
echo "2) Reset ALL iteration states (fresh start)"
echo "3) View current states"
echo "4) Exit"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "🗑️ Resetting Contracts Designer state..."
        rm -f "$WORKSPACE_DIR/.iteration/Contracts Designer_state.yaml"
        echo "✅ Contracts Designer state reset. It will start fresh on next run."
        ;;
    2)
        echo "🗑️ Resetting ALL iteration states..."
        rm -rf "$WORKSPACE_DIR/.iteration"
        echo "✅ All states reset. Pipeline will start fresh."
        ;;
    3)
        echo "📊 Current iteration states:"
        echo ""
        if [ -d "$WORKSPACE_DIR/.iteration" ]; then
            for state_file in "$WORKSPACE_DIR/.iteration"/*.yaml; do
                if [ -f "$state_file" ]; then
                    filename=$(basename "$state_file")
                    agent_name="${filename%_state.yaml}"
                    iteration=$(grep "^iteration:" "$state_file" | cut -d: -f2 | xargs)
                    status=$(grep "^last_decision:" "$state_file" | cut -d: -f2 | xargs)
                    score=$(grep "^compliance_score:" "$state_file" | head -1 | cut -d: -f2 | xargs)
                    echo "  📁 $agent_name:"
                    echo "     Iteration: $iteration"
                    echo "     Status: ${status:-in_progress}"
                    echo "     Compliance: ${score:-0}%"
                    echo ""
                fi
            done
        else
            echo "  No state files found."
        fi
        ;;
    4)
        echo "👋 Exiting without changes."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "💡 Next steps:"
echo "1. Run the pipeline again with:"
echo "   ./run-timeless-weddings-sept29.sh"
echo ""
echo "2. Or run specific stage:"
echo "   python -m app_factory_leonardo_replit.stages.backend_spec_stage"