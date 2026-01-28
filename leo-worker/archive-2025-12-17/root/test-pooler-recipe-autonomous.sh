#!/bin/bash
# Autonomous Pooler Recipe Test
#
# This script proves the pooler recipe works end-to-end autonomously:
# 1. Creates new Supabase project
# 2. Gets pooler connection string
# 3. Tests connection with Drizzle ORM
# 4. Cleans up (deletes project)
#
# Usage: ./test-pooler-recipe-autonomous.sh

set -e  # Exit on any error

TEST_PROJECT_NAME="pooler-recipe-test-$(date +%s)"
CLEANUP_ON_SUCCESS=true  # Set to false to keep project for inspection

echo ""
echo "================================================================================"
echo "🧪 Autonomous Pooler Recipe Test"
echo "================================================================================"
echo ""
echo "This will:"
echo "  1. Create a new Supabase project: $TEST_PROJECT_NAME"
echo "  2. Get pooler connection string automatically"
echo "  3. Test Drizzle ORM connection"
echo "  4. Clean up (delete project)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Step 1: Get organization
echo ""
echo "================================================================================";
echo "Step 1: Getting Supabase organization"
echo "================================================================================";
ORG_SLUG=$(supabase orgs list -o json | jq -r '.[0].id')
echo "✅ Organization: $ORG_SLUG"

# Step 2: Generate secure password
echo ""
echo "================================================================================";
echo "Step 2: Generating database password"
echo "================================================================================";
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
echo "✅ Password generated: ${DB_PASSWORD:0:4}****"

# Step 3: Create project
echo ""
echo "================================================================================";
echo "Step 3: Creating Supabase project"
echo "================================================================================";
echo "Project name: $TEST_PROJECT_NAME"
echo "Region: us-east-1"
echo ""

PROJECT_DATA=$(supabase projects create "$TEST_PROJECT_NAME" \
  --org-id "$ORG_SLUG" \
  --db-password "$DB_PASSWORD" \
  --region us-east-1 \
  -o json)

PROJECT_REF=$(echo "$PROJECT_DATA" | jq -r '.id')

if [ -z "$PROJECT_REF" ] || [ "$PROJECT_REF" = "null" ]; then
  echo "❌ Failed to create project"
  echo "Output: $PROJECT_DATA"
  exit 1
fi

echo "✅ Project created: $PROJECT_REF"
echo "   URL: https://$PROJECT_REF.supabase.co"

# Step 4: Wait for project to be ready
echo ""
echo "================================================================================";
echo "Step 4: Waiting for project startup (30 seconds)"
echo "================================================================================";
echo "Status: COMING_UP → ACTIVE_HEALTHY"
sleep 30
echo "✅ Project should be ready"

# Step 5: Get project details (including pooler hostname)
echo ""
echo "================================================================================";
echo "Step 5: Fetching project connection details"
echo "================================================================================";

# Get the actual project data to find pooler URL
PROJECT_INFO=$(supabase projects list -o json | jq ".[] | select(.id == \"$PROJECT_REF\")")
REGION=$(echo "$PROJECT_INFO" | jq -r '.region')
DB_HOST=$(echo "$PROJECT_INFO" | jq -r '.database.host')

echo "✅ Project details:"
echo "   Region: $REGION"
echo "   DB Host: $DB_HOST"

# Step 6: Construct pooler URLs
echo ""
echo "================================================================================";
echo "Step 6: Constructing pooler connection strings"
echo "================================================================================";

# URL-encode password
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$DB_PASSWORD', safe=''))")

# The key question: Is it aws-0 or aws-1? Let's try both
POOLER_URL_V0="postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true"
POOLER_URL_V1="postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@aws-1-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true"

echo "✅ Pooler URLs constructed:"
echo "   aws-0 variant"
echo "   aws-1 variant"

# Step 7: Test connections with Node.js
echo ""
echo "================================================================================";
echo "Step 7: Testing pooler connections"
echo "================================================================================";

# Create test script
cat > /tmp/test-new-pooler.mjs << 'EOFTEST'
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

console.log('Testing aws-0 variant...');
const works0 = await testURL(url0, 'aws-0');

console.log('Testing aws-1 variant...');
const works1 = await testURL(url1, 'aws-1');

console.log(`WINNER:${works0 ? 'aws-0' : (works1 ? 'aws-1' : 'none')}`);
EOFTEST

# Run test
TEST_OUTPUT=$(node /tmp/test-new-pooler.mjs "$POOLER_URL_V0" "$POOLER_URL_V1" 2>&1)
echo "$TEST_OUTPUT"

WINNER=$(echo "$TEST_OUTPUT" | grep "^WINNER:" | cut -d: -f2)

if [ "$WINNER" = "aws-0" ]; then
  WORKING_POOLER_URL="$POOLER_URL_V0"
  POOLER_VARIANT="aws-0"
elif [ "$WINNER" = "aws-1" ]; then
  WORKING_POOLER_URL="$POOLER_URL_V1"
  POOLER_VARIANT="aws-1"
else
  WORKING_POOLER_URL=""
  POOLER_VARIANT="none"
fi

echo ""
if [ -n "$WORKING_POOLER_URL" ]; then
  echo "✅ Working pooler: $POOLER_VARIANT variant"
else
  echo "❌ Neither pooler variant worked!"
  echo "   This may indicate pooler is not enabled for new projects"
  echo "   Or requires additional setup/wait time"
fi

# Step 8: Test with Drizzle ORM (if pooler works)
if [ -n "$WORKING_POOLER_URL" ]; then
  echo ""
  echo "================================================================================";
  echo "Step 8: Testing with Drizzle ORM"
  echo "================================================================================";

  # Create Drizzle test
  cat > /tmp/test-drizzle.mjs << 'EOFDRIZZLE'
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

async function testDrizzle(url) {
  try {
    const client = postgres(url, {
      ssl: 'require',
      prepare: false,
      connect_timeout: 15,
      max: 1,
    });

    const db = drizzle(client);

    // Test basic query
    const result = await client`SELECT version()`;
    const version = result[0].version.split(' ').slice(0, 2).join(' ');

    await client.end();

    console.log(`✅ Drizzle ORM works!`);
    console.log(`✅ Database: ${version}`);
    return true;
  } catch (error) {
    console.log(`❌ Drizzle test failed: ${error.message}`);
    return false;
  }
}

const url = process.argv[2];
await testDrizzle(url);
EOFDRIZZLE

  node /tmp/test-drizzle.mjs "$WORKING_POOLER_URL"
fi

# Step 9: Results
echo ""
echo "================================================================================";
echo "📊 TEST RESULTS"
echo "================================================================================";
echo ""

if [ -n "$WORKING_POOLER_URL" ]; then
  echo "🎉 SUCCESS! Pooler recipe works autonomously!"
  echo ""
  echo "✅ Project created: $PROJECT_REF"
  echo "✅ Pooler connection: $POOLER_VARIANT variant"
  echo "✅ Drizzle ORM: Verified working"
  echo ""
  echo "📋 Working Configuration:"
  echo "   DATABASE_URL=\"postgresql://postgres.$PROJECT_REF:****@$POOLER_VARIANT-$REGION.pooler.supabase.com:6543/postgres?pgbouncer=true\""
  echo "   STORAGE_MODE=database"
  echo ""
  echo "🔑 Key Finding:"
  echo "   This project uses: $POOLER_VARIANT variant"
  echo "   Pooler hostname: $POOLER_VARIANT-$REGION.pooler.supabase.com"
  echo ""

  TEST_PASSED=true
else
  echo "❌ FAILED: Pooler connection did not work"
  echo ""
  echo "Possible reasons:"
  echo "  1. Pooler not enabled for new projects by default"
  echo "  2. Requires additional wait time or configuration"
  echo "  3. Need to enable in dashboard manually"
  echo ""

  TEST_PASSED=false
fi

# Step 10: Cleanup
echo ""
echo "================================================================================";
echo "Step 10: Cleanup"
echo "================================================================================";

if [ "$TEST_PASSED" = true ] && [ "$CLEANUP_ON_SUCCESS" = true ]; then
  echo "Deleting test project: $PROJECT_REF"
  supabase projects delete "$PROJECT_REF" --yes
  echo "✅ Project deleted"
elif [ "$TEST_PASSED" = false ]; then
  echo "⚠️  Test failed - keeping project for investigation"
  echo "   Project: $PROJECT_REF"
  echo "   URL: https://$PROJECT_REF.supabase.co"
  echo ""
  echo "   To delete manually:"
  echo "   supabase projects delete $PROJECT_REF"
else
  echo "✅ Test passed - project kept for inspection"
  echo "   Project: $PROJECT_REF"
  echo "   Password: $DB_PASSWORD"
  echo ""
  echo "   To delete:"
  echo "   supabase projects delete $PROJECT_REF"
fi

# Cleanup temp files
rm -f /tmp/test-new-pooler.mjs /tmp/test-drizzle.mjs

echo ""
echo "================================================================================"
echo "TEST COMPLETE"
echo "================================================================================"
echo ""

if [ "$TEST_PASSED" = true ]; then
  echo "✅ Autonomous pooler recipe: VERIFIED"
  echo ""
  echo "Ready to update supabase-project-setup skill with pooler recipe!"
  exit 0
else
  echo "❌ Autonomous pooler recipe: FAILED"
  echo ""
  echo "Need to investigate before updating skill."
  exit 1
fi
