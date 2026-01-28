#!/bin/bash
# Test Phase 1 implementation with 2 pages

echo "🧪 Testing Phase 1: Autonomous File Discovery"
echo "=============================================="
echo ""

# Run parallel frontend generation
uv run python run-parallel-frontend.py apps/timeless-weddings-phase1/app

echo ""
echo "✅ Test complete! Check for HomePage.tsx and SignUpPage.tsx"
