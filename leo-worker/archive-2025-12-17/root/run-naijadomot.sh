#!/bin/bash
#
# NaijaDomot Real Estate Marketplace Generator
#
# This script generates the NaijaDomot real estate marketplace application
# using the autonomous reprompter for 25 iterations.
#
# The prompt file contains comprehensive specifications for:
# - Multi-role authentication (Buyer/Agent/Landlord/Admin)
# - Property listing management with photos/videos
# - Interactive map integration with property pins
# - Analytics dashboards for agents and admin
# - Property verification workflow
# - Inquiry/lead management system
# - Mobile-responsive, SEO-optimized UI
#
# Development Approach:
# 1. Phase 1: Build ALL features with mock auth + in-memory storage
# 2. Phase 2: Migrate to Supabase after validation (ONLY after Phase 1 complete)
#

set -e  # Exit on error

echo "🚀 Starting NaijaDomot Real Estate Marketplace Generation"
echo "=================================================="
echo ""
echo "📋 Configuration:"
echo "   App Name: naijadomot"
echo "   Prompt File: docs/prompts/naijadomot-real-estate-marketplace.md"
echo "   Reprompter Mode: autonomous"
echo "   Max Iterations: 25"
echo "   Prompt Expansion: disabled (--no-expand)"
echo ""
echo "⚠️  IMPORTANT: The app will be built with mock auth + in-memory storage first!"
echo "   Migration to Supabase happens ONLY after all features are validated."
echo ""
echo "Press Ctrl+C within 5 seconds to cancel..."
sleep 5

uv run python run-app-generator.py \
  --app-name naijadomot \
  --prompt-file docs/prompts/naijadomot-real-estate-marketplace.md \
  --no-expand \
  --reprompter-mode autonomous \
  --max-iterations 25

echo ""
echo "✅ Generation complete!"
echo ""
echo "📂 App location: apps/naijadomot/app"
echo ""
echo "🔄 Next steps:"
echo "   1. Review the generated code"
echo "   2. Test all features with mock auth (AUTH_MODE=mock)"
echo "   3. Validate all functionality works end-to-end"
echo "   4. Only then migrate to Supabase (Phase 2)"
echo ""
echo "💡 To start development server:"
echo "   cd apps/naijadomot/app"
echo "   npm install"
echo "   npm run dev"
echo ""
