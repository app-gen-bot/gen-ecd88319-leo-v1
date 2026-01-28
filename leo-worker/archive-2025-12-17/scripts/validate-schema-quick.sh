#!/bin/bash
set -e

echo "Validating schema files..."

# Check files exist
if [ ! -f "shared/schema.zod.ts" ]; then
  echo "❌ shared/schema.zod.ts not found"
  exit 1
fi

if [ ! -f "shared/schema.ts" ]; then
  echo "❌ shared/schema.ts not found"
  exit 1
fi

echo "✓ Both schema files exist"

# Check insert schemas have .omit()
insert_count=$(grep -c "export const insert.*Schema" shared/schema.zod.ts || echo 0)
omit_count=$(grep -c "\.omit({" shared/schema.zod.ts || echo 0)

echo "✓ Found $insert_count insert schemas"
if [ "$insert_count" -gt 0 ] && [ "$omit_count" -lt "$insert_count" ]; then
  echo "⚠️  Warning: Not all insert schemas use .omit()"
fi

# Check timestamp mode
if grep -q "timestamp(" shared/schema.ts; then
  missing_mode=$(grep "timestamp(" shared/schema.ts | grep -v "mode: 'string'" || echo "")
  if [ -n "$missing_mode" ]; then
    echo "❌ Found timestamps without mode: 'string'"
    echo "$missing_mode"
    exit 1
  fi
  echo "✓ All timestamps use mode: 'string'"
fi

# Check schema count
zod_count=$(grep -c "export const .*Schema = z\.object" shared/schema.zod.ts || echo 0)
drizzle_count=$(grep -c "export const .* = pgTable" shared/schema.ts || echo 0)
echo "✓ Schema count: $zod_count Zod schemas, $drizzle_count Drizzle tables"

echo "✅ Quick validation passed"
