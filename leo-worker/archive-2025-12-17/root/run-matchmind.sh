#!/bin/bash
#
# MatchMind - AI-Powered B2B Vendor Matching Platform Generator
#
# This script generates MatchMind, an intelligent B2B marketplace that uses AI
# to connect buyers with the perfect vendors based on detailed requirements.
#
# "MatchMind" - The intelligent mind that creates perfect vendor matches
# Tagline: "Where AI Meets Perfect Matches"
#
# Key Features:
# - AI-powered vendor matching with conversational intelligence
# - Optional buyer registration (guests can search, but can't save history)
# - Vendor dashboard to view matches and configure webhooks for CRM integration
# - Admin system for AI training, billing, user management, and support tickets
# - Real Supabase auth and database from the start (no mocking)
#
# Technical Approach:
# - Supabase database with migrations from day one
# - Real authentication via Supabase Auth
# - Anthropic Claude AI for intelligent conversational matching
# - Stripe integration for vendor billing
# - Resend for transactional emails
# - In-app support ticket system
#

set -e  # Exit on error

echo "🧠 Starting MatchMind AI Platform Generation"
echo "================================================================"
echo "   Where AI Meets Perfect Matches"
echo "================================================================"
echo ""
echo "📋 Configuration:"
echo "   App Name: matchmind"
echo "   Prompt File: docs/prompts/matchmind.md"
echo "   Reprompter Mode: autonomous"
echo "   Max Iterations: 30"
echo "   Prompt Expansion: disabled (--no-expand)"
echo ""
echo "🔐 Database & Auth Configuration:"
echo "   AUTH_MODE: supabase (real authentication from start)"
echo "   STORAGE_MODE: supabase (real database from start)"
echo "   Database migrations will be created immediately"
echo ""
echo "⚠️  IMPORTANT: This app will use REAL integrations from the beginning!"
echo "   Make sure you have:"
echo "   - SUPABASE_URL configured in .env"
echo "   - SUPABASE_ANON_KEY configured in .env"
echo "   - SUPABASE_SERVICE_ROLE_KEY configured in .env"
echo "   ✅ Anthropic API key: Configured (from KidIQ app)"
echo "   ✅ Resend API key: Configured (from reclamatch app)"
echo ""
echo "Press Ctrl+C within 5 seconds to cancel..."
sleep 5

# Set environment variables for Supabase, AI, and Email from the start
export AUTH_MODE=supabase
export STORAGE_MODE=database
export ANTHROPIC_API_KEY=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
export RESEND_API_KEY=re_LX2tSg9r_Dd4EwvA9BYH2MW3SLXq7f8eC
export FROM_EMAIL=hello@leodavinci.ai

echo ""
echo "🔧 Environment configured:"
echo "   AUTH_MODE=$AUTH_MODE"
echo "   STORAGE_MODE=$STORAGE_MODE"
echo "   ANTHROPIC_API_KEY=sk-ant-***...AAA (from KidIQ)"
echo "   RESEND_API_KEY=re_***...eC (from reclamatch)"
echo "   FROM_EMAIL=$FROM_EMAIL"
echo ""

# Run the app generator
uv run python run-app-generator.py \
  --app-name matchmind \
  --prompt-file docs/prompts/matchmind.md \
  --no-expand \
  --reprompter-mode autonomous \
  --max-iterations 30

echo ""
echo "✅ Generation complete!"
echo ""
echo "📂 App location: apps/matchmind/app"
echo ""
echo "🔄 Next steps:"
echo "   1. cd apps/matchmind/app"
echo "   2. Configure Supabase credentials in .env:"
echo "      - SUPABASE_URL"
echo "      - SUPABASE_ANON_KEY"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo "   3. npm install"
echo "   4. npm run db:push  # Run migrations to Supabase"
echo "   5. npm run dev      # Start development server"
echo "   6. Open http://localhost:5000"
echo ""
echo "💡 Integration Status:"
echo "   - ✅ Anthropic API key: Configured (from KidIQ app)"
echo "   - ✅ Resend Email API: Configured (from reclamatch app)"
echo "   - ⏳ Stripe API keys: Integration structure created, provide keys when ready"
echo ""
