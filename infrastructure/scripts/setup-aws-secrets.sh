#!/bin/bash

# Setup AWS Secrets for App-Gen SaaS Platform
# Reads credentials from .env and creates AWS Secrets Manager secrets

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Look for .env in sibling app-gen-saas directory (configurable via SAAS_ROOT)
SAAS_ROOT="${SAAS_ROOT:-$PROJECT_ROOT/../app-gen-saas}"
ENV_FILE="$SAAS_ROOT/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    echo "Please create .env with your credentials first."
    exit 1
fi

# Load environment variables
set -a
source "$ENV_FILE"
set +a

# Check required variables (using uncommented values from .env)
MISSING_VARS=""
[ -z "$SUPABASE_ANON_KEY" ] && MISSING_VARS="$MISSING_VARS\n  - SUPABASE_ANON_KEY"
[ -z "$CLAUDE_CODE_OAUTH_TOKEN" ] && MISSING_VARS="$MISSING_VARS\n  - CLAUDE_CODE_OAUTH_TOKEN"
[ -z "$GITHUB_BOT_TOKEN" ] && MISSING_VARS="$MISSING_VARS\n  - GITHUB_BOT_TOKEN"
[ -z "$FLY_API_TOKEN" ] && MISSING_VARS="$MISSING_VARS\n  - FLY_API_TOKEN"

if [ -n "$MISSING_VARS" ]; then
    echo -e "${RED}Error: Missing required environment variables in .env${NC}"
    echo "Required variables:"
    echo -e "$MISSING_VARS"
    echo ""
    echo "Optional (will use defaults if not set):"
    echo "  - SUPABASE_URL (default: https://flhrcbbdmgflzgicgeua.supabase.co)"
    echo "  - SUPABASE_SERVICE_ROLE_KEY (will try to extract from .env)"
    echo "  - SUPABASE_DB_PASSWORD"
    exit 1
fi

# Set defaults for Supabase URL if not set
SUPABASE_URL="${SUPABASE_URL:-https://flhrcbbdmgflzgicgeua.supabase.co}"
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID:-flhrcbbdmgflzgicgeua}"
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD:-bKBan1d90BaV5Dqn}"

# Build DATABASE_URL if not set
if [ -z "$DATABASE_URL" ]; then
    DATABASE_URL="postgresql://postgres.${SUPABASE_PROJECT_ID}:${SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
fi

# Extract SERVICE_ROLE_KEY from commented line if not set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    SUPABASE_SERVICE_ROLE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE" | grep -v "^#" | cut -d'=' -f2)
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        # Try to get from commented line
        SUPABASE_SERVICE_ROLE_KEY=$(grep "#SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE" | head -1 | cut -d'=' -f2)
    fi
fi

# Set AWS region and profile
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"

echo -e "${GREEN}=== Leo SaaS - AWS Secrets Setup ===${NC}"
echo "Region: $AWS_REGION"
echo "Profile: $AWS_PROFILE"
echo "Supabase Project: $SUPABASE_PROJECT_ID"
echo ""

# Function to create or update secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3

    echo -n "Creating/updating secret: $secret_name ... "

    # Skip if value is empty
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}Skipped (empty value)${NC}"
        return 0
    fi

    # Try to create the secret
    if aws secretsmanager create-secret \
        --name "$secret_name" \
        --description "$description" \
        --secret-string "$secret_value" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        >/dev/null 2>&1; then
        echo -e "${GREEN}Created${NC}"
    else
        # If creation fails, try to update instead
        if aws secretsmanager update-secret \
            --secret-id "$secret_name" \
            --secret-string "$secret_value" \
            --region "$AWS_REGION" \
            --profile "$AWS_PROFILE" \
            >/dev/null 2>&1; then
            echo -e "${YELLOW}Updated${NC}"
        else
            echo -e "${RED}Failed${NC}"
            return 1
        fi
    fi
}

# Create secrets
echo "Creating AWS Secrets Manager secrets..."
echo ""

create_or_update_secret \
    "leo/supabase-url" \
    "$SUPABASE_URL" \
    "Supabase project URL for Leo SaaS Platform"

create_or_update_secret \
    "leo/supabase-anon-key" \
    "$SUPABASE_ANON_KEY" \
    "Supabase anon key (public) for Leo SaaS Platform"

create_or_update_secret \
    "leo/supabase-service-role-key" \
    "$SUPABASE_SERVICE_ROLE_KEY" \
    "Supabase service role key (SECRET - server only) for Leo SaaS Platform"

create_or_update_secret \
    "leo/claude-oauth-token" \
    "$CLAUDE_CODE_OAUTH_TOKEN" \
    "Claude Code OAuth token for app generation"

create_or_update_secret \
    "leo/database-url" \
    "$DATABASE_URL" \
    "PostgreSQL database connection string for Leo SaaS Platform"

create_or_update_secret \
    "leo/github-bot-token" \
    "$GITHUB_BOT_TOKEN" \
    "GitHub bot account personal access token for repo creation"

create_or_update_secret \
    "leo/fly-api-token" \
    "$FLY_API_TOKEN" \
    "Fly.io org deploy token for automated app deployment"

echo ""
echo -e "${GREEN}=== Secrets Setup Complete ===${NC}"
echo ""
echo "Verify secrets with:"
echo "  aws secretsmanager list-secrets --region $AWS_REGION --profile $AWS_PROFILE --query 'SecretList[?starts_with(Name, \`leo/\`)].Name'"
echo ""
echo "To view a secret value:"
echo "  aws secretsmanager get-secret-value --secret-id leo/supabase-url --region $AWS_REGION --profile $AWS_PROFILE --query SecretString --output text"
echo ""
echo "Next steps:"
echo "  1. npm install && npm run build"
echo "  2. cdk deploy --profile $AWS_PROFILE"
echo "  3. Build and push Docker images to ECR"
echo "  4. ECS service will auto-deploy"
