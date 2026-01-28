#!/bin/bash

# Validation script for Supabase storage implementations
# Checks for common snake_case ↔ camelCase conversion bugs

set -e

FILE="${1:-./server/lib/storage/supabase-storage.ts}"

if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE"
  echo "Usage: $0 <path-to-supabase-storage.ts>"
  exit 1
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Supabase Storage Validator                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Validating: $FILE"
echo ""

ISSUES_FOUND=0

# Check 1: Helper functions exist
echo "✓ Check 1: Helper functions"
echo "─────────────────────────────────────────────────────────────"
if grep -q "function toSnakeCase" "$FILE"; then
  echo "  ✅ toSnakeCase() helper found"
else
  echo "  ❌ toSnakeCase() helper MISSING"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if grep -q "function toCamelCase" "$FILE"; then
  echo "  ✅ toCamelCase() helper found"
else
  echo "  ❌ toCamelCase() helper MISSING"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check if toSnakeCase handles undefined → null
if grep -A5 "function toSnakeCase" "$FILE" | grep -q "undefined.*null"; then
  echo "  ✅ toSnakeCase() handles undefined → null"
else
  echo "  ⚠️  toSnakeCase() may not handle undefined → null"
  echo "     Add: result[snakeKey] = obj[key] === undefined ? null : obj[key];"
fi

echo ""

# Check 2: SELECT methods
echo "✓ Check 2: SELECT method conversions"
echo "─────────────────────────────────────────────────────────────"

MISSING_SINGLE=$(grep -n "return data as" "$FILE" | grep -v "toCamelCase" | grep -v "\/\/" || true)
MISSING_COUNT=$(echo "$MISSING_SINGLE" | grep -c "return" || echo "0")

if [ "$MISSING_COUNT" -eq 0 ]; then
  echo "  ✅ All single-object SELECT methods use toCamelCase()"
else
  echo "  ❌ Found $MISSING_COUNT SELECT methods WITHOUT toCamelCase():"
  echo "$MISSING_SINGLE" | head -5 | while read line; do
    LINE_NUM=$(echo "$line" | cut -d: -f1)
    echo "     Line $LINE_NUM: $(echo $line | cut -d: -f2-)"
  done
  if [ "$MISSING_COUNT" -gt 5 ]; then
    echo "     ... and $((MISSING_COUNT - 5)) more"
  fi
  ISSUES_FOUND=$((ISSUES_FOUND + MISSING_COUNT))
fi

echo ""

# Check 3: Array returns
echo "✓ Check 3: Array return conversions"
echo "─────────────────────────────────────────────────────────────"

ARRAY_RETURNS=$(grep -n "return.*data.*\[\]" "$FILE" || true)
ARRAY_COUNT=$(echo "$ARRAY_RETURNS" | grep -c "return" || echo "0")
ARRAY_FIXED=$(echo "$ARRAY_RETURNS" | grep -c "map.*toCamelCase" || echo "0")
ARRAY_MISSING=$((ARRAY_COUNT - ARRAY_FIXED))

if [ "$ARRAY_MISSING" -eq 0 ]; then
  echo "  ✅ All array returns use .map(toCamelCase)"
else
  echo "  ❌ Found $ARRAY_MISSING array returns WITHOUT .map(toCamelCase)"
  echo "$ARRAY_RETURNS" | grep -v "map.*toCamelCase" | head -5 | while read line; do
    LINE_NUM=$(echo "$line" | cut -d: -f1)
    echo "     Line $LINE_NUM"
  done
  ISSUES_FOUND=$((ISSUES_FOUND + ARRAY_MISSING))
fi

echo ""

# Check 4: INSERT methods
echo "✓ Check 4: INSERT method conversions"
echo "─────────────────────────────────────────────────────────────"

# Find INSERT methods
INSERTS=$(grep -n "\.insert(" "$FILE" || true)
INSERT_COUNT=$(echo "$INSERTS" | grep -c "insert" || echo "0")

# Check for toSnakeCase usage before inserts
CONVERTS=$(grep -B2 "\.insert(" "$FILE" | grep -c "toSnakeCase" || echo "0")

if [ "$INSERT_COUNT" -eq "$CONVERTS" ]; then
  echo "  ✅ All INSERT methods use toSnakeCase() before insert"
elif [ "$INSERT_COUNT" -gt "$CONVERTS" ]; then
  MISSING_INSERTS=$((INSERT_COUNT - CONVERTS))
  echo "  ⚠️  $MISSING_INSERTS INSERT methods may be missing toSnakeCase()"
  echo "     Check for .insert(insertData) instead of .insert(dbData)"

  # Find specific cases
  DIRECT_INSERTS=$(grep -n "\.insert(insertData)" "$FILE" || true)
  if [ -n "$DIRECT_INSERTS" ]; then
    echo "  ❌ Found direct .insert(insertData) usage:"
    echo "$DIRECT_INSERTS" | head -3 | while read line; do
      LINE_NUM=$(echo "$line" | cut -d: -f1)
      echo "     Line $LINE_NUM"
    done
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
fi

echo ""

# Check 5: UPDATE methods (if any)
echo "✓ Check 5: UPDATE method conversions"
echo "─────────────────────────────────────────────────────────────"

UPDATES=$(grep -n "\.update(" "$FILE" || true)
UPDATE_COUNT=$(echo "$UPDATES" | grep -c "update" || echo "0")

if [ "$UPDATE_COUNT" -eq 0 ]; then
  echo "  ℹ️  No UPDATE methods found"
else
  # Check for toSnakeCase usage before updates
  UPDATE_CONVERTS=$(grep -B2 "\.update(" "$FILE" | grep -c "toSnakeCase" || echo "0")

  if [ "$UPDATE_COUNT" -eq "$UPDATE_CONVERTS" ]; then
    echo "  ✅ All UPDATE methods use toSnakeCase() before update"
  else
    echo "  ⚠️  Some UPDATE methods may be missing toSnakeCase()"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
fi

echo ""

# Final report
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  VALIDATION RESULT                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$ISSUES_FOUND" -eq 0 ]; then
  echo "🎉 SUCCESS: No issues found!"
  echo ""
  echo "Your Supabase storage implementation follows best practices."
  exit 0
else
  echo "❌ FAILED: Found $ISSUES_FOUND issue(s)"
  echo ""
  echo "Next steps:"
  echo "1. Review the issues listed above"
  echo "2. Run: ./scripts/fix-supabase-conversions.sh $FILE"
  echo "3. Or manually fix using patterns from docs/supabase-problems.md"
  echo ""
  exit 1
fi
