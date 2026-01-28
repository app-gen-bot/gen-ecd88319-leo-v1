#!/bin/bash
# Validate Supabase integration uses Drizzle, not PostgREST
# Usage: ./scripts/validate-supabase-integration.sh [app-directory]

set -e

APP_DIR="${1:-.}"
cd "$APP_DIR"

echo "🔍 Validating Supabase integration patterns..."
echo "   Directory: $(pwd)"
echo ""

ERRORS=0
WARNINGS=0

# 1. Check NO PostgREST client in storage layer
echo "1. Checking for PostgREST client in storage layer..."
if grep -r "@supabase/supabase-js" server/lib/storage/ 2>/dev/null; then
  echo "   ❌ FAIL: PostgREST client found in storage layer"
  echo "   Use Drizzle ORM instead: drizzle-orm/postgres-js"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✅ PASS: No PostgREST client in storage"
fi
echo ""

# 2. Check Drizzle is used in storage
echo "2. Checking for Drizzle ORM in storage layer..."
if grep -r "drizzle-orm\|from '../db" server/lib/storage/ 2>/dev/null | grep -q .; then
  echo "   ✅ PASS: Drizzle ORM found in storage layer"
else
  if [ -d "server/lib/storage" ]; then
    echo "   ❌ FAIL: Drizzle ORM not found in storage layer"
    echo "   Storage should import from '../db' and use db.select(), db.insert(), etc."
    ERRORS=$((ERRORS + 1))
  else
    echo "   ⚠️  SKIP: server/lib/storage directory not found"
    WARNINGS=$((WARNINGS + 1))
  fi
fi
echo ""

# 3. Check no manual case conversion in storage
echo "3. Checking for manual case conversion helpers..."
if grep -r "toCamelCase\|toSnakeCase\|snakeToCamel\|camelToSnake" server/lib/storage/ 2>/dev/null; then
  echo "   ❌ FAIL: Manual case conversion found"
  echo "   Drizzle handles snake_case ↔ camelCase automatically"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✅ PASS: No manual case conversion (Drizzle handles it)"
fi
echo ""

# 4. Check db.ts exists and uses Drizzle
echo "4. Checking server/lib/db.ts..."
if [ -f "server/lib/db.ts" ]; then
  if grep -q "drizzle(" server/lib/db.ts; then
    echo "   ✅ PASS: db.ts uses Drizzle client"
  else
    echo "   ❌ FAIL: db.ts exists but doesn't use Drizzle"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "   ⚠️  SKIP: server/lib/db.ts not found"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 5. Check storage modes in factory
echo "5. Checking storage factory modes..."
if [ -f "server/lib/storage/factory.ts" ]; then
  if grep -q "'supabase'\|\"supabase\"" server/lib/storage/factory.ts; then
    echo "   ✅ PASS: Storage factory uses 'supabase' mode"
  elif grep -q "'database'\|\"database\"" server/lib/storage/factory.ts; then
    echo "   ⚠️  WARNING: Storage factory uses 'database' mode"
    echo "   Consider renaming to 'supabase' for clarity"
    WARNINGS=$((WARNINGS + 1))
  else
    echo "   ⚠️  WARNING: Storage mode not detected in factory"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "   ⚠️  SKIP: server/lib/storage/factory.ts not found"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 6. Check .env files exist
echo "6. Checking environment files..."
ENV_FOUND=0
if [ -f ".env" ]; then
  echo "   ✅ .env exists"
  ENV_FOUND=1
fi
if [ -f ".env.development" ]; then
  echo "   ✅ .env.development exists"
  ENV_FOUND=1
fi
if [ -f ".env.production" ]; then
  echo "   ✅ .env.production exists"
  ENV_FOUND=1
fi
if [ $ENV_FOUND -eq 0 ]; then
  echo "   ⚠️  WARNING: No .env files found"
  echo "   Run supabase-project-setup skill to generate"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 7. Check PROJECT_INFO.md exists
echo "7. Checking PROJECT_INFO.md..."
if [ -f "PROJECT_INFO.md" ]; then
  echo "   ✅ PASS: PROJECT_INFO.md exists"
else
  echo "   ⚠️  WARNING: PROJECT_INFO.md not found"
  echo "   Regenerate with supabase-project-setup skill"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 8. Check for Supabase storage implementation
echo "8. Checking supabase-storage.ts implementation..."
if [ -f "server/lib/storage/supabase-storage.ts" ]; then
  if grep -q "db\." server/lib/storage/supabase-storage.ts; then
    echo "   ✅ PASS: supabase-storage.ts uses Drizzle (db.select, etc.)"
  else
    echo "   ❌ FAIL: supabase-storage.ts doesn't use Drizzle queries"
    echo "   Should use: db.select(), db.insert(), db.update(), db.delete()"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "   ⚠️  SKIP: supabase-storage.ts not found"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo "✅ All Supabase integration checks passed!"
  else
    echo "✅ Supabase integration checks passed with $WARNINGS warning(s)"
  fi
  exit 0
else
  echo "❌ Supabase integration validation failed"
  echo "   Errors: $ERRORS"
  echo "   Warnings: $WARNINGS"
  echo ""
  echo "Fix errors before deploying to production."
  exit 1
fi
