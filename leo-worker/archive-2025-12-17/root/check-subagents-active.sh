#!/bin/bash
# Check if subagents are active in the running app generator

echo "🔍 Checking for subagent activity..."
echo "=================================="

LOG_DIR="logs"
LATEST_LOG=$(ls -t $LOG_DIR/app_generator_*.log 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ No log file found in $LOG_DIR"
    exit 1
fi

echo "📁 Checking log: $LATEST_LOG"
echo ""

# Check if subagents are enabled
if grep -q "Subagents: enabled" "$LATEST_LOG"; then
    echo "✅ SUBAGENTS ARE ENABLED"
    echo ""

    # Show loaded subagents
    echo "📋 Loaded subagents:"
    grep -A 20 "Loaded 7 subagents:" "$LATEST_LOG" | grep "   -" | tail -7
    echo ""

    # Check for delegation activity
    DELEGATION_COUNT=$(grep -c "Delegating to" "$LATEST_LOG" 2>/dev/null || echo "0")
    echo "🤖 Delegation calls: $DELEGATION_COUNT"

    if [ "$DELEGATION_COUNT" -gt 0 ]; then
        echo ""
        echo "Recent delegations:"
        grep "Delegating to" "$LATEST_LOG" | tail -5
    fi
else
    echo "❌ SUBAGENTS ARE DISABLED"
    echo ""
    echo "To enable subagents, run with: --enable-subagents"
fi

echo ""
echo "💡 Tip: Monitor in real-time with:"
echo "   tail -f $LATEST_LOG | grep -E '(Subagent|Delegating)'"
