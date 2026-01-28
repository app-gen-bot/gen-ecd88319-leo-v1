#!/bin/bash
# Demonstrate standalone Stage 1 execution

echo "🚀 Testing Standalone Stage 1 Execution"
echo "="*60
echo ""
echo "This demonstrates running Stage 1 independently to generate"
echo "an interaction specification from a PRD."
echo ""

# Test 1: Basic execution with PawsFlow PRD
echo "📋 Test 1: Generate interaction spec from PawsFlow PRD"
echo "-"*60
uv run python -m app_factory.standalone.run_stage_1 \
    --prd-file apps/app_20250716_074453/specs/business_prd.md \
    --output-dir test_output/standalone_stage1/ \
    --app-name pawsflow-test

echo ""
echo "📋 Test 2: Generate for Sprint 2 specifically" 
echo "-"*60
echo "This would generate interaction spec for ONLY Sprint 2 features"
echo ""
echo "Command (not executed):"
echo "uv run python -m app_factory.standalone.run_stage_1 \\"
echo "    --prd-file apps/app_20250716_074453/specs/business_prd.md \\"
echo "    --sprint-breakdown apps/app_20250716_074453/specs/sprints_breakdown.md \\"
echo "    --sprint 2 \\"
echo "    --output-dir test_output/standalone_stage1_sprint2/ \\"
echo "    --app-name pawsflow-sprint2"