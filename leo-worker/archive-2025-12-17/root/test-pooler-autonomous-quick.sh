#!/bin/bash
# Quick Autonomous Pooler Detection Test
# Tests both aws-0 and aws-1 variants automatically

set -e

echo ""
echo "================================================================================"
echo "🧪 Quick Autonomous Pooler Detection Test"
echo "================================================================================"
echo ""

# Step 1: Get organization
ORG_SLUG=$(supabase orgs list -o json | jq -r '.[0].id')
echo "✅ Organization: $ORG_SLUG"

# Step 2: Generate password
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
echo "✅ Password generated: ${DB_PASSWORD:0:4}****"

# Step 3: Create project
TEST_PROJECT_NAME="pooler-test-$(date +%s)"
echo ""
echo "Creating project: $TEST_PROJECT_NAME"

PROJECT_DATA=$(supabase projects create "$TEST_PROJECT_NAME" \
  --org-id "$ORG_SLUG" \
  --db-password "$DB_PASSWORD" \
  --region us-east-1 \
  -o json)

PROJECT_REF=$(echo "$PROJECT_DATA" | jq -r '.id')

if [ -z "$PROJECT_REF" ] || [ "$PROJECT_REF" = "null" ]; then
  echo "❌ Failed to create project"
  exit 1
fi

echo "✅ Project created: $PROJECT_REF"

# Step 4: Wait for startup
echo ""
echo "Waiting 30 seconds for project startup..."
sleep 30

# Step 5: Get region
PROJECT_INFO=$(supabase projects list -o json | jq ".[] | select(.id == \"$PROJECT_REF\")")
REGION=$(echo "$PROJECT_INFO" | jq -r '.region')
echo "✅ Region: $REGION"

# Step 6: Construct both pooler variants
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$DB_PASSWORD', safe=''))")

POOLER_URL_V0="postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true"
POOLER_URL_V1="postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@aws-1-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true"

echo ""
echo "Testing pooler variants..."

# Create test script
cat > /tmp/test-pooler-quick.mjs << 'EOFTEST'
import postgres from 'postgres';

async function testURL(url, label) {
  try {
    const client = postgres(url, {
      ssl: 'require',
      prepare: false,
      connect_timeout: 15,
      max: 1,
    });

    const result = await client`SELECT 1 as test`;
    await client.end();

    console.log(`✅ ${label}: WORKS`);
    return true;
  } catch (error) {
    console.log(`❌ ${label}: ${error.message}`);
    return false;
  }
}

const [url0, url1] = process.argv.slice(2);

const works0 = await testURL(url0, 'aws-0');
const works1 = await testURL(url1, 'aws-1');

console.log(`WINNER:${works0 ? 'aws-0' : (works1 ? 'aws-1' : 'none')}`);
EOFTEST

# Run test
TEST_OUTPUT=$(node /tmp/test-pooler-quick.mjs "$POOLER_URL_V0" "$POOLER_URL_V1" 2>&1)
echo "$TEST_OUTPUT"

WINNER=$(echo "$TEST_OUTPUT" | grep "^WINNER:" | cut -d: -f2)

echo ""
echo "================================================================================"
echo "📊 RESULT"
echo "================================================================================"
echo ""

if [ "$WINNER" = "aws-0" ]; then
  echo "🎉 SUCCESS! Working pooler variant: aws-0"
  echo ""
  echo "DATABASE_URL=\"postgresql://postgres.${PROJECT_REF}:<password>@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true\""
elif [ "$WINNER" = "aws-1" ]; then
  echo "🎉 SUCCESS! Working pooler variant: aws-1"
  echo ""
  echo "DATABASE_URL=\"postgresql://postgres.${PROJECT_REF}:<password>@aws-1-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true\""
else
  echo "❌ FAILED: Neither pooler variant worked"
  echo "   This may indicate:"
  echo "   1. Pooler not enabled for new projects"
  echo "   2. Need more wait time"
  echo "   3. Different pooler subdomain pattern"
fi

# Cleanup
echo ""
echo "Cleaning up..."
supabase projects delete "$PROJECT_REF" --yes
rm -f /tmp/test-pooler-quick.mjs

echo "✅ Test complete"
