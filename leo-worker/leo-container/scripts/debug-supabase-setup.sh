#!/bin/bash
# Debug script to test the EXACT flow the MCP tool will use
# This mirrors what supabase_setup MCP tool should do

set -e  # Exit on first error

APP_NAME="${1:-test-debug-app-$(date +%s)}"
APP_DIR="${2:-/tmp/supabase-debug-test}"
REGION="${3:-us-east-1}"

# Get Supabase token from environment or AWS
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "SUPABASE_ACCESS_TOKEN not set, trying AWS Secrets Manager..."
    SUPABASE_ACCESS_TOKEN=$(aws secretsmanager get-secret-value --secret-id "leo/supabase-access-token" --region us-east-1 --query 'SecretString' --output text 2>/dev/null) || {
        echo "❌ Could not get SUPABASE_ACCESS_TOKEN from AWS"
        exit 1
    }
fi

echo "=========================================="
echo "Supabase Setup Debug Script (API-based)"
echo "=========================================="
echo "App Name: $APP_NAME"
echo "App Dir:  $APP_DIR"
echo "Region:   $REGION"
echo "Token:    ${SUPABASE_ACCESS_TOKEN:0:20}..."
echo ""

# Create test directory
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Helper: Filter CLI output to just JSON
filter_json() {
    grep -v "^A new version" | grep -v "^We recommend" | grep -v "^Creating project" | grep -v "^Created a new project" | grep -v "^Try rerunning"
}

#############################################
# Step 0: Detect Organization
#############################################
echo "=== Step 0: Detecting Organization ==="
ORG_JSON=$(supabase orgs list -o json 2>&1 | filter_json)
echo "Result: $ORG_JSON"

ORG_ID=$(echo "$ORG_JSON" | jq -r '.[0].id')
if [ -z "$ORG_ID" ] || [ "$ORG_ID" = "null" ]; then
    echo "❌ FAILED: No organizations found"
    exit 1
fi
echo "✅ Organization: $ORG_ID"
echo ""

#############################################
# Step 1: Generate password and create project
#############################################
echo "=== Step 1: Creating Project ==="
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
echo "Generated password: ${DB_PASSWORD:0:4}****"

CREATE_JSON=$(supabase projects create "$APP_NAME" \
    --org-id "$ORG_ID" \
    --db-password "$DB_PASSWORD" \
    --region "$REGION" \
    -o json 2>&1 | filter_json)

PROJECT_REF=$(echo "$CREATE_JSON" | jq -r '.id')
if [ -z "$PROJECT_REF" ] || [ "$PROJECT_REF" = "null" ]; then
    echo "❌ FAILED: Could not create project"
    echo "Error: $CREATE_JSON"
    exit 1
fi
echo "✅ Project created: $PROJECT_REF"
echo ""

#############################################
# Step 2: Poll for ACTIVE_HEALTHY status
#############################################
echo "=== Step 2: Waiting for Project to be ACTIVE_HEALTHY ==="
MAX_WAIT=300  # 5 minutes max
POLL_INTERVAL=10
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    STATUS=$(curl -s "https://api.supabase.com/v1/projects/$PROJECT_REF" \
        -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
        | jq -r '.status')

    echo "  Status: $STATUS (waited ${WAITED}s)"

    if [ "$STATUS" = "ACTIVE_HEALTHY" ]; then
        echo "✅ Project is ACTIVE_HEALTHY!"
        break
    fi

    sleep $POLL_INTERVAL
    WAITED=$((WAITED + POLL_INTERVAL))
done

if [ "$STATUS" != "ACTIVE_HEALTHY" ]; then
    echo "❌ FAILED: Project did not become ACTIVE_HEALTHY within ${MAX_WAIT}s"
    echo "Final status: $STATUS"
    exit 1
fi
echo ""

#############################################
# Step 3: Get Pooler URL from API (NO TESTING!)
#############################################
echo "=== Step 3: Getting Pooler URL from API ==="
POOLER_RESPONSE=$(curl -s "https://api.supabase.com/v1/projects/$PROJECT_REF/config/database/pooler" \
    -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN")

echo "API Response:"
echo "$POOLER_RESPONSE" | jq '.'

POOLER_HOST=$(echo "$POOLER_RESPONSE" | jq -r '.[0].db_host')
POOLER_PORT=$(echo "$POOLER_RESPONSE" | jq -r '.[0].db_port')
DB_USER=$(echo "$POOLER_RESPONSE" | jq -r '.[0].db_user')
DB_NAME=$(echo "$POOLER_RESPONSE" | jq -r '.[0].db_name')

if [ -z "$POOLER_HOST" ] || [ "$POOLER_HOST" = "null" ]; then
    echo "❌ FAILED: Could not get pooler host from API"
    exit 1
fi

# URL-encode the password
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$DB_PASSWORD', safe=''))")

# Build the DATABASE_URL
DATABASE_URL="postgresql://${DB_USER}:${ENCODED_PASSWORD}@${POOLER_HOST}:${POOLER_PORT}/${DB_NAME}"

echo ""
echo "✅ Pooler URL constructed:"
echo "   Host: $POOLER_HOST"
echo "   Port: $POOLER_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

#############################################
# Step 4: Get API Keys
#############################################
echo "=== Step 4: Retrieving API Keys ==="
KEYS_JSON=$(supabase projects api-keys --project-ref "$PROJECT_REF" -o json 2>&1 | filter_json)

ANON_KEY=$(echo "$KEYS_JSON" | jq -r '.[] | select(.name == "anon") | .api_key')
SERVICE_KEY=$(echo "$KEYS_JSON" | jq -r '.[] | select(.name == "service_role") | .api_key')

if [ -z "$ANON_KEY" ] || [ "$ANON_KEY" = "null" ]; then
    echo "❌ FAILED: Could not get anon key"
    exit 1
fi

echo "✅ Anon key: ${ANON_KEY:0:20}..."
echo "✅ Service key: ${SERVICE_KEY:0:20}..."
echo ""

#############################################
# Step 5: Verify pooler connection works
#############################################
echo "=== Step 5: Verifying Pooler Connection ==="
echo "Testing: psql <pooler_url> -c 'SELECT 1'"

if psql "${DATABASE_URL}?sslmode=require" -c "SELECT 1" 2>&1; then
    echo "✅ Pooler connection VERIFIED!"
else
    echo "❌ FAILED: Pooler connection failed"
    echo "URL: postgresql://${DB_USER}:****@${POOLER_HOST}:${POOLER_PORT}/${DB_NAME}"
    exit 1
fi
echo ""

#############################################
# Step 6: Generate .env file
#############################################
echo "=== Step 6: Generating .env File ==="

SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

cat > "$APP_DIR/.env" << EOF
# Supabase Configuration (Generated by Supabase Setup)
# Project: $APP_NAME
# Region: $REGION
# Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY

# Database Connection (Pooler - Transaction Mode)
DATABASE_URL=$DATABASE_URL

# Storage Mode
AUTH_MODE=supabase
STORAGE_MODE=database
EOF

echo "✅ .env file created: $APP_DIR/.env"
echo ""

#############################################
# Summary
#############################################
echo "=========================================="
echo "✅ SUCCESS - All Steps Completed!"
echo "=========================================="
echo ""
echo "Project Details:"
echo "  Project Ref:   $PROJECT_REF"
echo "  Supabase URL:  $SUPABASE_URL"
echo "  Pooler Host:   $POOLER_HOST"
echo "  Region:        $REGION"
echo ""
echo "Credentials saved to: $APP_DIR/.env"
echo ""
echo "To clean up, delete the project:"
echo "  supabase projects delete $PROJECT_REF"
echo ""
echo "DATABASE_URL (for reference):"
echo "  postgresql://${DB_USER}:****@${POOLER_HOST}:${POOLER_PORT}/${DB_NAME}"
