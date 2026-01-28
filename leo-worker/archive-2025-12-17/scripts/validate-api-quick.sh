#!/bin/bash
set -e

echo "Validating API files..."

# Check contract files exist
contract_count=$(ls shared/contracts/*.contract.ts 2>/dev/null | wc -l | tr -d ' ')
if [ "$contract_count" -eq 0 ]; then
  echo "❌ No contract files found in shared/contracts/"
  exit 1
fi
echo "✓ Found $contract_count contract file(s)"

# Check route files exist
route_count=$(ls server/routes/*.ts 2>/dev/null | grep -v "index.ts" | wc -l | tr -d ' ')
if [ "$route_count" -eq 0 ]; then
  echo "❌ No route files found in server/routes/"
  exit 1
fi
echo "✓ Found $route_count route file(s)"

# Check for /api prefix in contract paths (should NOT exist)
api_prefix_count=$(grep -r "path: '/api" shared/contracts/*.contract.ts 2>/dev/null | wc -l | tr -d ' ')
if [ "$api_prefix_count" -gt 0 ]; then
  echo "❌ Found $api_prefix_count contract paths with /api prefix (should be relative)"
  grep -n "path: '/api" shared/contracts/*.contract.ts
  exit 1
fi
echo "✓ No /api prefixes in contract paths (correct - paths are relative)"

# Check imports from schema.zod.ts
import_count=$(grep -r "from.*['\"].*schema\.zod" shared/contracts/*.contract.ts 2>/dev/null | wc -l | tr -d ' ')
if [ "$import_count" -eq 0 ]; then
  echo "⚠️  Warning: No imports from schema.zod.ts found (may be using inline schemas)"
else
  echo "✓ Found $import_count import(s) from schema.zod.ts"
fi

# Check POST endpoints use 201 (Created)
post_with_201=$(grep -A 10 "method: 'POST'" shared/contracts/*.contract.ts 2>/dev/null | grep -c "201:" || echo 0)
post_count=$(grep -c "method: 'POST'" shared/contracts/*.contract.ts 2>/dev/null || echo 0)
if [ "$post_count" -gt 0 ]; then
  if [ "$post_with_201" -lt "$post_count" ]; then
    echo "⚠️  Warning: Some POST endpoints may not use 201 Created ($post_with_201/$post_count)"
  else
    echo "✓ POST endpoints use 201 Created ($post_with_201/$post_count)"
  fi
fi

# Check DELETE endpoints use 204 (No Content)
delete_with_204=$(grep -A 10 "method: 'DELETE'" shared/contracts/*.contract.ts 2>/dev/null | grep -c "204:" || echo 0)
delete_count=$(grep -c "method: 'DELETE'" shared/contracts/*.contract.ts 2>/dev/null || echo 0)
if [ "$delete_count" -gt 0 ]; then
  if [ "$delete_with_204" -lt "$delete_count" ]; then
    echo "⚠️  Warning: Some DELETE endpoints may not use 204 No Content ($delete_with_204/$delete_count)"
  else
    echo "✓ DELETE endpoints use 204 No Content ($delete_with_204/$delete_count)"
  fi
fi

# Check for error status codes (400, 401, 404, 500)
error_codes=$(grep -r "responses:" shared/contracts/*.contract.ts 2>/dev/null | grep -oE "40[014]|500" | wc -l | tr -d ' ')
if [ "$error_codes" -eq 0 ]; then
  echo "⚠️  Warning: No error status codes found (400/401/404/500)"
else
  echo "✓ Found $error_codes error status code(s) (400/401/404/500)"
fi

# Check contract registration (index.ts exists)
if [ ! -f "shared/contracts/index.ts" ]; then
  echo "⚠️  Warning: shared/contracts/index.ts not found (contracts may not be registered)"
else
  echo "✓ Contract registration file exists (shared/contracts/index.ts)"
fi

# Check route registration (index.ts exists)
if [ ! -f "server/routes/index.ts" ]; then
  echo "⚠️  Warning: server/routes/index.ts not found (routes may not be registered)"
else
  echo "✓ Route registration file exists (server/routes/index.ts)"
fi

echo "✅ Quick validation passed"
