#!/bin/bash
# Run all validation scripts before commits

set -e  # Exit on first failure

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 Running all validation checks..."
echo ""

# Track overall status
FAILURES=0

# 1. Agent Config Validation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Agent Configuration Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if python3 "$SCRIPT_DIR/validate_agent_configs.py"; then
    echo "✅ Agent configs passed"
else
    echo "❌ Agent configs failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 2. Import Validation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Python Import Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if python3 "$SCRIPT_DIR/validate_imports.py"; then
    echo "✅ Imports passed"
else
    echo "❌ Imports failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# 3. Type checking (optional - if mypy is installed)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Type Checking (mypy)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v mypy &> /dev/null; then
    if mypy "$PROJECT_ROOT/src/app_factory_leonardo_replit" --ignore-missing-imports --no-error-summary 2>&1 | head -20; then
        echo "✅ Type checking passed"
    else
        echo "⚠️  Type checking found issues (non-blocking)"
        # Don't fail on mypy errors for now
    fi
else
    echo "⏭️  Skipping (mypy not installed)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILURES -eq 0 ]; then
    echo "✅ All critical validations passed!"
    echo ""
    echo "Safe to commit ✓"
    exit 0
else
    echo "❌ $FAILURES validation(s) failed"
    echo ""
    echo "⚠️  Please fix errors before committing"
    exit 1
fi
