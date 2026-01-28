#!/bin/bash

# Systematic Fix for Supabase snake_case ↔ camelCase Conversions
# Usage: ./scripts/fix-supabase-conversions.sh <path-to-supabase-storage.ts>

set -e

FILE="${1:-./server/lib/storage/supabase-storage.ts}"

if [ ! -f "$FILE" ]; then
  echo "Error: File not found: $FILE"
  echo "Usage: $0 <path-to-supabase-storage.ts>"
  exit 1
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Supabase Storage Conversion Fixer                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Target file: $FILE"
echo ""

# Backup original
BACKUP="${FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$FILE" "$BACKUP"
echo "✅ Created backup: $BACKUP"
echo ""

# Report current state
echo "📊 CURRENT STATE:"
echo "─────────────────────────────────────────────────────────────"

MISSING_CAMEL=$(grep -n "return data as" "$FILE" | grep -v "toCamelCase" | wc -l | tr -d ' ')
echo "  SELECT methods missing toCamelCase: $MISSING_CAMEL"

MISSING_ARRAY=$(grep -n "return.*data.*\[\]" "$FILE" | grep -v "map.*toCamelCase" | wc -l | tr -d ' ')
echo "  Array methods missing .map(toCamelCase): $MISSING_ARRAY"

HAS_SNAKE=$(grep -n "toSnakeCase" "$FILE" | wc -l | tr -d ' ')
echo "  Methods using toSnakeCase: $HAS_SNAKE"

echo ""
echo "🔧 FIXING..."
echo "─────────────────────────────────────────────────────────────"

# Fix 1: Add toCamelCase to single object returns
echo "1. Fixing single object returns..."
sed -i.tmp 's/return data as \([A-Za-z]*\);$/return toCamelCase(data) as \1;  \/\/ Fixed: Added toCamelCase conversion/g' "$FILE"
FIX1_COUNT=$(grep "\/\/ Fixed: Added toCamelCase conversion" "$FILE" | wc -l | tr -d ' ')
echo "   ✅ Fixed $FIX1_COUNT single object returns"

# Fix 2: Add .map(toCamelCase) to array returns (more complex - requires manual review)
echo "2. Array returns need manual fixing (see docs/supabase-problems.md)"
echo "   Pattern: return (data || []).map(item => toCamelCase(item)) as Type[];"

# Fix 3: Report INSERT methods that need toSnakeCase
echo ""
echo "3. Checking INSERT methods..."
INSERTS=$(grep -n "\.insert(insertData)" "$FILE" || true)
if [ -n "$INSERTS" ]; then
  echo "   ⚠️  Found INSERT methods using 'insertData' directly (need toSnakeCase):"
  echo "$INSERTS" | while read line; do
    LINE_NUM=$(echo "$line" | cut -d: -f1)
    echo "      Line $LINE_NUM"
  done
  echo "   Pattern needed:"
  echo "     const dbData = toSnakeCase(insertData);"
  echo "     .insert(dbData)"
else
  echo "   ✅ No direct insertData usage found"
fi

# Clean up temp file
rm -f "${FILE}.tmp"

echo ""
echo "📊 FINAL STATE:"
echo "─────────────────────────────────────────────────────────────"

NEW_MISSING=$(grep -n "return data as" "$FILE" | grep -v "toCamelCase" | grep -v "\/\/ Fixed" | wc -l | tr -d ' ')
echo "  SELECT methods missing toCamelCase: $NEW_MISSING"

FIXED=$(grep "\/\/ Fixed: Added toCamelCase conversion" "$FILE" | wc -l | tr -d ' ')
echo "  Methods auto-fixed: $FIXED"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  NEXT STEPS                                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Review changes: git diff $FILE"
echo "2. Fix array returns manually (see lines marked in analysis)"
echo "3. Fix INSERT methods (add toSnakeCase before .insert())"
echo "4. Test: npm run dev"
echo "5. Verify: Check practice session, chat, achievements, etc."
echo ""
echo "📖 See docs/supabase-problems.md for detailed patterns"
echo ""

# Generate a detailed report
REPORT_FILE="$(dirname $FILE)/supabase-conversion-report.txt"
cat > "$REPORT_FILE" << EOF
Supabase Storage Conversion Report
Generated: $(date)
File: $FILE

METHODS REQUIRING MANUAL FIXES:

Array Returns (need .map(toCamelCase)):
─────────────────────────────────────────────────
EOF

grep -n "return.*data.*\[\]" "$FILE" | grep -v "map.*toCamelCase" | while read line; do
  LINE_NUM=$(echo "$line" | cut -d: -f1)
  echo "Line $LINE_NUM: $line" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << EOF

INSERT Methods (need toSnakeCase):
─────────────────────────────────────────────────
EOF

grep -n "\.insert(insertData)" "$FILE" | while read line; do
  LINE_NUM=$(echo "$line" | cut -d: -f1)
  echo "Line $LINE_NUM: $line" >> "$REPORT_FILE"
done

echo "📝 Detailed report saved: $REPORT_FILE"
echo ""
echo "Done! ✨"
