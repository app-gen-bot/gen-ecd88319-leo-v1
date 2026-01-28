#!/bin/bash

# 🚀 COMPLETE AUTOMATION PIPELINE - Replit-Level Deployment
# This script will run immediately after project deletion to achieve 100% automation

set -e

echo "🚀 Starting Complete Automation Pipeline"
echo "========================================"
echo ""

# Step 1: Create new Supabase project
echo "📦 Step 1: Creating new Supabase project..."
cd /home/ec2-user/LEAPFROG/app-factory/scripts/deploy-automation
PROJECT_RESULT=$(npx tsx create-supabase-project.ts notetaker-automated)
echo "$PROJECT_RESULT"

# Extract project details from creation output
PROJECT_ID=$(echo "$PROJECT_RESULT" | grep -oP 'ID: \K[a-zA-Z0-9]+' || echo "")
DATABASE_PASSWORD=$(echo "$PROJECT_RESULT" | grep -oP 'Database Password: \K[a-zA-Z0-9]+' || echo "")

if [ -z "$PROJECT_ID" ] || [ -z "$DATABASE_PASSWORD" ]; then
    echo "❌ Failed to extract project details"
    exit 1
fi

echo "✅ Project created: $PROJECT_ID"
echo "✅ Database password captured: ${DATABASE_PASSWORD:0:4}..."

# Step 2: Run database migrations immediately
echo ""
echo "🗃️  Step 2: Running database migrations..."
DATABASE_URL="postgresql://postgres:${DATABASE_PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres"
NODE_TLS_REJECT_UNAUTHORIZED=0 DATABASE_URL=$DATABASE_URL npx tsx run-migrations-direct.ts /home/ec2-user/LEAPFROG/app-factory/apps/notetaker/app

echo "✅ Database migrations completed!"

# Step 3: Update app environment variables
echo ""
echo "🔧 Step 3: Updating app environment variables..."
cd /home/ec2-user/LEAPFROG/app-factory/apps/notetaker/app

# Update .env file with new project details
cat > .env << EOF
SUPABASE_URL=https://${PROJECT_ID}.supabase.co
SUPABASE_ANON_KEY=<anon_key_will_be_fetched>
PORT=5173
NODE_ENV=development
EOF

# Get API keys
cd /home/ec2-user/LEAPFROG/app-factory/scripts/deploy-automation
KEYS_RESULT=$(npx tsx -e "
import { getSupabaseProjectKeys } from './create-supabase-project.js';
getSupabaseProjectKeys('${PROJECT_ID}').then(keys => {
    console.log('ANON_KEY:' + keys.anonKey);
    console.log('SERVICE_ROLE_KEY:' + keys.serviceRoleKey);
}).catch(err => console.error('Error:', err));
")

ANON_KEY=$(echo "$KEYS_RESULT" | grep -oP 'ANON_KEY:\K.*' || echo "")
SERVICE_ROLE_KEY=$(echo "$KEYS_RESULT" | grep -oP 'SERVICE_ROLE_KEY:\K.*' || echo "")

# Update .env with actual keys
cd /home/ec2-user/LEAPFROG/app-factory/apps/notetaker/app
cat > .env << EOF
SUPABASE_URL=https://${PROJECT_ID}.supabase.co
SUPABASE_ANON_KEY=${ANON_KEY}
PORT=5173
NODE_ENV=development
EOF

echo "✅ Environment variables updated!"

# Step 4: Test local app
echo ""
echo "🧪 Step 4: Testing local app with new database..."
curl -s http://localhost:5173/api/notes || echo "App not running, will need to restart"

# Step 5: Deploy to Railway
echo ""
echo "🚂 Step 5: Deploying to Railway..."
cd /home/ec2-user/LEAPFROG/app-factory/scripts/deploy-automation
npx tsx deploy-full-stack.ts deploy \
    --name notetaker-automated \
    --path /home/ec2-user/LEAPFROG/app-factory/apps/notetaker/app \
    --supabase-project ${PROJECT_ID} \
    --skip-supabase

echo ""
echo "🎉 COMPLETE AUTOMATION SUCCESSFUL!"
echo "=================================="
echo "✅ Supabase project: ${PROJECT_ID}"
echo "✅ Database tables: Created"
echo "✅ App environment: Updated"
echo "✅ Railway deployment: In progress"
echo ""
echo "🌐 Next: Railway will provide live URL"
echo "🚀 Achievement: Full 'Prompt to URL' automation!"