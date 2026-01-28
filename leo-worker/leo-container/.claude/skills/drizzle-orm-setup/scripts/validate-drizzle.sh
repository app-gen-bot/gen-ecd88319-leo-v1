#!/bin/bash
# Validates Drizzle setup

echo "🔍 Validating Drizzle ORM Setup..."

# Check 1: db.ts exists
if [ ! -f "server/lib/db.ts" ]; then
  echo "❌ server/lib/db.ts NOT FOUND"
  echo "   Create this file with drizzle() client"
  exit 1
fi

echo "✅ server/lib/db.ts exists"

# Check 2: db.ts has drizzle import
if ! grep -q "import.*drizzle.*from.*drizzle-orm" server/lib/db.ts; then
  echo "❌ server/lib/db.ts missing drizzle import"
  echo "   Add: import { drizzle } from 'drizzle-orm/postgres-js';"
  exit 1
fi

echo "✅ drizzle import found"

# Check 3: db.ts has postgres import
if ! grep -q "import.*postgres" server/lib/db.ts; then
  echo "❌ server/lib/db.ts missing postgres import"
  echo "   Add: import postgres from 'postgres';"
  exit 1
fi

echo "✅ postgres import found"

# Check 4: db.ts exports db
if ! grep -q "export.*db.*=.*drizzle" server/lib/db.ts; then
  echo "❌ server/lib/db.ts doesn't export db"
  echo "   Add: export const db = drizzle(client, { schema });"
  exit 1
fi

echo "✅ db export found"

# Check 5: Storage files exist
if [ ! -d "server/lib/storage" ]; then
  echo "⚠️  server/lib/storage directory not found"
  echo "   (Skipping storage validation)"
  exit 0
fi

# Check 6: Storage uses Drizzle (not PostgREST)
STORAGE_FILES=$(find server/lib/storage -name "*-storage.ts" -type f)

if [ -z "$STORAGE_FILES" ]; then
  echo "⚠️  No storage files found in server/lib/storage"
  echo "   (This is OK if you haven't created storage yet)"
  exit 0
fi

HAS_POSTGREST=0
for file in $STORAGE_FILES; do
  if grep -q "getSupabaseClient\|createClient.*@supabase/supabase-js" "$file"; then
    echo "❌ $file still uses Supabase PostgREST client"
    echo "   Should use: import { db } from '../db'"
    HAS_POSTGREST=1
  fi
done

if [ $HAS_POSTGREST -eq 1 ]; then
  echo ""
  echo "💡 Tip: Use Drizzle queries instead of PostgREST"
  echo "   Replace: supabase.from('table').select()"
  echo "   With: db.select().from(schema.table)"
  exit 1
fi

echo "✅ Storage uses Drizzle queries"

# Check 7: No manual conversion if using Drizzle
HAS_MANUAL_CONVERSION=0
for file in $STORAGE_FILES; do
  if grep -q "toSnakeCase\|toCamelCase" "$file"; then
    echo "⚠️  $file has manual conversion functions"
    echo "   These are unnecessary with Drizzle ORM"
    echo "   Drizzle handles snake_case ↔ camelCase automatically"
    HAS_MANUAL_CONVERSION=1
  fi
done

if [ $HAS_MANUAL_CONVERSION -eq 1 ]; then
  echo ""
  echo "💡 Tip: Remove toSnakeCase/toCamelCase when using Drizzle"
fi

echo ""
echo "✅ Drizzle ORM setup validated successfully!"
echo ""
echo "Benefits:"
echo "  ✅ Automatic snake_case ↔ camelCase conversion"
echo "  ✅ Automatic undefined → null conversion"
echo "  ✅ Type-safe queries at compile time"
echo "  ✅ Better performance (direct PostgreSQL protocol)"
