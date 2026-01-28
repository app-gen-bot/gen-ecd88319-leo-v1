#!/bin/bash

# Check if subagents are being used in the current app generation run

echo "🔍 Checking for subagent activity..."
echo "=================================="

# Find the most recent app_generator log
LATEST_LOG=$(ls -t logs/app_generator_*.log 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
    echo "❌ No app_generator logs found"
    exit 1
fi

echo "📄 Checking log: $LATEST_LOG"
echo ""

# Check for subagent delegation patterns
echo "📊 Subagent Activity Summary:"
echo "-----------------------------"

# Check for Task tool usage (indicates delegation)
TASK_CALLS=$(grep -c "Using tool: Task" "$LATEST_LOG" 2>/dev/null || echo "0")
echo "Task tool calls (delegations): $TASK_CALLS"

# Check for each subagent type
echo ""
echo "Subagents invoked:"
grep -o "subagent_type.*['\"]" "$LATEST_LOG" 2>/dev/null | sed 's/subagent_type[^"]*["'\'']/- /' | sed 's/["'\'']$//' | sort | uniq

# Check for specific subagent patterns
echo ""
echo "📝 Detailed Activity:"
echo "--------------------"

# Look for schema_designer
if grep -q "schema_designer" "$LATEST_LOG" 2>/dev/null; then
    echo "✅ schema_designer: $(grep -c "schema_designer" "$LATEST_LOG") mentions"
else
    echo "❌ schema_designer: Not used"
fi

# Look for api_architect
if grep -q "api_architect" "$LATEST_LOG" 2>/dev/null; then
    echo "✅ api_architect: $(grep -c "api_architect" "$LATEST_LOG") mentions"
else
    echo "❌ api_architect: Not used"
fi

# Look for ui_designer
if grep -q "ui_designer" "$LATEST_LOG" 2>/dev/null; then
    echo "✅ ui_designer: $(grep -c "ui_designer" "$LATEST_LOG") mentions"
else
    echo "❌ ui_designer: Not used"
fi

# Look for code_writer
if grep -q "code_writer" "$LATEST_LOG" 2>/dev/null; then
    echo "✅ code_writer: $(grep -c "code_writer" "$LATEST_LOG") mentions"
else
    echo "❌ code_writer: Not used"
fi

# Look for quality_assurer
if grep -q "quality_assurer" "$LATEST_LOG" 2>/dev/null; then
    echo "✅ quality_assurer: $(grep -c "quality_assurer" "$LATEST_LOG") mentions"
else
    echo "❌ quality_assurer: Not used"
fi

# Look for error_fixer
if grep -q "error_fixer" "$LATEST_LOG" 2>/dev/null; then
    echo "✅ error_fixer: $(grep -c "error_fixer" "$LATEST_LOG") mentions"
else
    echo "❌ error_fixer: Not used"
fi

# Look for research_agent
if grep -q "research_agent" "$LATEST_LOG" 2>/dev/null; then
    echo "✅ research_agent: $(grep -c "research_agent" "$LATEST_LOG") mentions"
else
    echo "❌ research_agent: Not used"
fi

echo ""
echo "🔎 Recent Task Delegations:"
echo "-------------------------"
# Show recent Task tool invocations
grep -A 2 "Using tool: Task" "$LATEST_LOG" 2>/dev/null | tail -20

echo ""
echo "💡 Tip: Run 'tail -f $LATEST_LOG | grep -E \"Task|subagent\"' to monitor live"