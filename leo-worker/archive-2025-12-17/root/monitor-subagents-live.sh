#!/bin/bash

# Live monitoring of subagent activity

echo "🔍 Live Subagent Monitor - Press Ctrl+C to stop"
echo "==============================================="
echo ""
echo "Watching for:"
echo "  - Task tool invocations (delegation)"
echo "  - Subagent mentions"
echo "  - Schema/Contract generation"
echo ""
echo "Starting at $(date)"
echo ""

tail -f logs/cc_agent_2025-10-16.log | grep --line-buffered -E "Task|subagent|schema_designer|api_architect|ui_designer|delegate|Delegating"
