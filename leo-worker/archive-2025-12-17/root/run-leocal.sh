#!/bin/bash
#
# LeoCal - Next-Generation AI-Powered Scheduling Platform Generator
#
# This script generates LeoCal, a "Calendly on steroids" scheduling platform
# that uses AI for natural language configuration and intelligent routing.
#
# "LeoCal" - Your AI Scheduling Brain
# Tagline: "Schedule Smarter with AI"
#
# Key Features:
# - Natural language scheduling policy configuration
# - Event type management (1:1, group, round-robin, collective)
# - AI-powered routing forms with intent detection
# - Meeting prep and summary generation
# - Multi-tenant org/team support with roles
# - Workflow automation (reminders, follow-ups)
# - Analytics and reporting
# - Supabase auth and database (single implementation, no fallbacks)
#
# Technical Approach:
# - Uses pipeline-prompt-v2.md (incremental phases with skip checks)
# - Supabase database with Drizzle ORM (DrizzleStorage only)
# - Supabase Auth (SupabaseAuth only, no mock)
# - Single implementations - fail fast if env missing
# - AI integration for NL processing and scheduling intelligence
# - Resend for transactional emails
#

set -e  # Exit on error

echo "📅 Starting LeoCal AI Scheduling Platform Generation"
echo "================================================================"
echo "   Schedule Smarter with AI"
echo "================================================================"
echo ""
echo "📋 Configuration:"
echo "   App Name: leocal"
echo "   Pipeline: pipeline-prompt-v2.md (incremental with skip checks)"
echo "   Reprompter Mode: autonomous"
echo "   Max Iterations: 100"
echo ""
echo "🔧 Single Implementation Principle:"
echo "   Storage: DrizzleStorage only (NO mem-storage)"
echo "   Auth: SupabaseAuth only (NO mock-adapter)"
echo "   Fail fast if environment variables missing"
echo ""
echo "📋 Pipeline Phases (incremental):"
echo "   1. Plan → plan/plan.md"
echo "   2. Schema → schema.zod.ts, schema.ts"
echo "   3. Contracts → contracts/*.contract.ts"
echo "   4. Supabase → .env, migration applied"
echo "   5. DB & Storage → db.ts, storage/ (DrizzleStorage)"
echo "   6. Auth → auth/ (SupabaseAuth), seed.ts"
echo "   [STOPS after Phase 6 for incremental testing]"
echo ""
echo "⏭️  Skip Logic: Each phase checks for existing artifacts and skips if present"
echo ""
echo "Press Ctrl+C within 5 seconds to cancel..."
sleep 5

# Note: No AUTH_MODE or STORAGE_MODE - single implementations only
# Environment for email integration
export RESEND_API_KEY=re_LX2tSg9r_Dd4EwvA9BYH2MW3SLXq7f8eC
export FROM_EMAIL=hello@leodavinci.ai

echo ""
echo "🔧 Environment configured:"
echo "   RESEND_API_KEY=re_***...eC"
echo "   FROM_EMAIL=$FROM_EMAIL"
echo "   (No AUTH_MODE/STORAGE_MODE - single implementations)"
echo ""

# Run the app generator (pipeline-prompt-v2.md is default in config.py)
uv run python run-app-generator.py \
  --app-name leocal \
  --prompt-file docs/prompts/leocal.md \
  --no-expand \
  --reprompter-mode autonomous \
  --max-iterations 100

echo ""
echo "✅ Generation complete (or paused after Phase 6)!"
echo ""
echo "📂 App location: apps/leocal/app"
echo ""
echo "🔄 Next steps:"
echo "   1. cd apps/leocal/app"
echo "   2. Verify .env has Supabase credentials:"
echo "      - SUPABASE_URL"
echo "      - SUPABASE_ANON_KEY"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo "      - DATABASE_URL (pooler)"
echo "   3. npm install"
echo "   4. npm run db:seed  # Create seed users via Admin API"
echo "   5. npm run dev      # Start development server"
echo "   6. Open http://localhost:5000"
echo ""
echo "💡 Phase Status:"
echo "   After Phase 6, remaining phases need manual trigger:"
echo "   - Server routes"
echo "   - API client & frontend"
echo "   - Validation"
echo ""
