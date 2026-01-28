#!/bin/bash
set -e

echo "🔧 Automated Database Schema Push"
echo "=================================="

# Load environment variables
if [ -f .env ]; then
  set -a
  source .env
  set +a
  echo "✅ Loaded .env file"
else
  echo "❌ ERROR: .env file not found"
  exit 1
fi

# Validate required variables
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "❌ ERROR: SUPABASE_DB_PASSWORD not found in .env"
  exit 1
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "❌ ERROR: SUPABASE_PROJECT_ID not found in .env"
  exit 1
fi

echo "📊 Project ID: $SUPABASE_PROJECT_ID"
echo ""

# Run drizzle-kit push
echo "🚀 Pushing schema to Supabase database..."
echo ""

npx drizzle-kit push

echo ""
echo "✅ Database schema has been pushed successfully!"
echo "📊 The generation_requests table is now ready to use"
