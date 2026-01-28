#!/bin/bash
#
# HotelIQ - Intelligent Multi-Tenant Hotel Management Platform Generator
#
# This script generates HotelIQ, a secure, scalable, multi-tenant Hotel Management
# SaaS platform designed to serve hotels of all sizes with isolated tenant environments.
#
# "HotelIQ" - Intelligence that elevates hospitality
# Tagline: "Smarter Stays, Seamless Operations"
#
# Key Features:
# - Multi-tenant architecture with complete data isolation (application-level security via Drizzle ORM)
# - Property Management System (PMS) with room inventory
# - Reservation management with guest profiles
# - Front desk operations (check-in/check-out, folios)
# - Housekeeping management with mobile workflow
# - Inventory & procurement tracking
# - Revenue management and dynamic pricing
# - Guest engagement (pre-arrival, during stay, post-stay)
# - Staff management with role-based permissions
# - Supabase auth and database (follows standard pipeline flow)
#
# Technical Approach:
# - Supabase database with Drizzle ORM (type-safe queries)
# - Supabase Auth for production authentication
# - Application-level security for tenant isolation (NOT RLS)
# - Stripe integration for billing
# - Resend for transactional emails
#
# IMPORTANT: If you encounter issues, reference the matchmind app implementation:
#   apps/matchmind/app/ - for Supabase setup, auth patterns, /api routing
#

set -e  # Exit on error

echo "🏨 Starting HotelIQ Hotel Management Platform Generation"
echo "================================================================"
echo "   Smarter Stays, Seamless Operations"
echo "================================================================"
echo ""
echo "📋 Configuration:"
echo "   App Name: hoteliq"
echo "   Prompt File: docs/prompts/hoteliq.md"
echo "   Reprompter Mode: autonomous"
echo "   Max Iterations: 100"
echo "   Prompt Expansion: disabled (--no-expand)"
echo ""
echo "🔐 Database & Auth Configuration:"
echo "   AUTH_MODE: supabase (Supabase Auth for production)"
echo "   STORAGE_MODE: database (Drizzle ORM with pooler)"
echo "   Application-level security (tenant_id filtering in queries)"
echo ""
echo "📋 Pipeline Order (CRITICAL):"
echo "   1. Create schema.zod.ts FIRST (foundation)"
echo "   2. Create schema.ts (Drizzle schema)"
echo "   3. Create contracts (imports from schema.zod.ts)"
echo "   4. Provision Supabase (needs schema for SQL)"
echo "   5. Create server files (db, auth, storage, routes)"
echo ""
echo "📖 REFERENCE: If you encounter issues, look at matchmind app:"
echo "   apps/matchmind/app/ - for Supabase setup, auth, /api patterns"
echo ""
echo "Press Ctrl+C within 5 seconds to cancel..."
sleep 5

# Set environment variables for Supabase and Email from the start
export AUTH_MODE=supabase
export STORAGE_MODE=database
export RESEND_API_KEY=re_LX2tSg9r_Dd4EwvA9BYH2MW3SLXq7f8eC
export FROM_EMAIL=hello@leodavinci.ai

echo ""
echo "🔧 Environment configured:"
echo "   AUTH_MODE=$AUTH_MODE (MANDATORY - real Supabase auth)"
echo "   STORAGE_MODE=$STORAGE_MODE (MANDATORY - Drizzle ORM with pooler)"
echo "   RESEND_API_KEY=re_***...eC"
echo "   FROM_EMAIL=$FROM_EMAIL"
echo ""

# Run the app generator
uv run python run-app-generator.py \
  --app-name hoteliq \
  --prompt-file docs/prompts/hoteliq.md \
  --no-expand \
  --reprompter-mode autonomous \
  --max-iterations 100

echo ""
echo "✅ Generation complete!"
echo ""
echo "📂 App location: apps/hoteliq/app"
echo ""
echo "🔄 Next steps:"
echo "   1. cd apps/hoteliq/app"
echo "   2. Verify Supabase credentials in .env:"
echo "      - SUPABASE_URL"
echo "      - SUPABASE_ANON_KEY"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo "   3. npm install"
echo "   4. npm run db:push  # Apply migrations to Supabase"
echo "   5. npm run dev      # Start development server"
echo "   6. Open http://localhost:5000"
echo ""
echo "💡 Integration Status:"
echo "   - ✅ Supabase: Should be provisioned during generation"
echo "   - ✅ Resend Email API: Configured"
echo "   - ⏳ Stripe API keys: Integration structure created, provide keys when ready"
echo ""
echo "📖 Troubleshooting:"
echo "   If you encounter issues, check matchmind implementation:"
echo "   apps/matchmind/app/ - reference for patterns and solutions"
echo ""
