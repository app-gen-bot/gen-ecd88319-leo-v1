#!/bin/bash

# Migrate Secrets from app-gen-saas/* to leo/*
# This script copies secrets without reading their values locally
# Uses AWS CLI to transfer encrypted values server-side
#
# Usage:
#   ./migrate-secrets-to-leo.sh              # Dry run (default)
#   ./migrate-secrets-to-leo.sh --dry-run    # Dry run (explicit)
#   ./migrate-secrets-to-leo.sh --execute    # Actually perform migration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=true
if [ "$1" = "--execute" ]; then
    DRY_RUN=false
elif [ "$1" = "--dry-run" ] || [ -z "$1" ]; then
    DRY_RUN=true
else
    echo -e "${RED}Error: Unknown argument '$1'${NC}"
    echo "Usage: $0 [--dry-run|--execute]"
    exit 1
fi

# Set AWS region and profile
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}=== DRY RUN: Migrate Secrets: app-gen-saas/* → leo/* ===${NC}"
    echo -e "${CYAN}No changes will be made. Run with --execute to perform migration.${NC}"
else
    echo -e "${BLUE}=== EXECUTE: Migrate Secrets: app-gen-saas/* → leo/* ===${NC}"
fi
echo "Region: $AWS_REGION"
echo "Profile: $AWS_PROFILE"
echo ""

# Define secret mappings (old-name -> new-name)
declare -A SECRET_MAPPINGS=(
    ["app-gen-saas/supabase-url"]="leo/supabase-url"
    ["app-gen-saas/supabase-anon-key"]="leo/supabase-anon-key"
    ["app-gen-saas/supabase-service-role-key"]="leo/supabase-service-role-key"
    ["app-gen-saas/database-url"]="leo/database-url"
    ["app-gen-saas/claude-oauth-token"]="leo/claude-oauth-token"
    ["app-gen-saas/github-bot-token"]="leo/github-bot-token"
    ["app-gen-saas/fly-api-token"]="leo/fly-api-token"
)

# Function to show secret metadata (dry run)
show_secret_metadata() {
    local source_name=$1
    local target_name=$2

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}Source:${NC} $source_name"
    echo -e "${CYAN}Target:${NC} $target_name"

    # Check if source secret exists
    if ! aws secretsmanager describe-secret \
        --secret-id "$source_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        >/dev/null 2>&1; then
        echo -e "${YELLOW}Status: Source not found (will skip)${NC}"
        return 0
    fi

    # Get full metadata
    local metadata
    metadata=$(aws secretsmanager describe-secret \
        --secret-id "$source_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        2>/dev/null)

    # Extract and display metadata
    local description
    description=$(echo "$metadata" | jq -r '.Description // "No description"')
    echo -e "${CYAN}Description:${NC} $description"

    local created_date
    created_date=$(echo "$metadata" | jq -r '.CreatedDate // "Unknown"')
    echo -e "${CYAN}Created:${NC} $created_date"

    local last_changed
    last_changed=$(echo "$metadata" | jq -r '.LastChangedDate // "Unknown"')
    echo -e "${CYAN}Last Changed:${NC} $last_changed"

    local last_accessed
    last_accessed=$(echo "$metadata" | jq -r '.LastAccessedDate // "Never accessed"')
    echo -e "${CYAN}Last Accessed:${NC} $last_accessed"

    # Check if target already exists
    if aws secretsmanager describe-secret \
        --secret-id "$target_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        >/dev/null 2>&1; then
        echo -e "${YELLOW}Target Status: Already exists (would update)${NC}"
    else
        echo -e "${GREEN}Target Status: Does not exist (would create)${NC}"
    fi

    # Tags
    local tags
    tags=$(echo "$metadata" | jq -r '.Tags // [] | if length > 0 then map("\(.Key)=\(.Value)") | join(", ") else "No tags" end')
    echo -e "${CYAN}Tags:${NC} $tags"

    # KMS Key
    local kms_key
    kms_key=$(echo "$metadata" | jq -r '.KmsKeyId // "Default AWS managed key"')
    echo -e "${CYAN}KMS Key:${NC} $kms_key"
}

# Function to copy secret without reading it
copy_secret() {
    local source_name=$1
    local target_name=$2

    echo -n "Copying: $source_name → $target_name ... "

    # Check if source secret exists
    if ! aws secretsmanager describe-secret \
        --secret-id "$source_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        >/dev/null 2>&1; then
        echo -e "${YELLOW}Source not found (skipping)${NC}"
        return 0
    fi

    # Get the secret value (encrypted)
    local secret_value
    secret_value=$(aws secretsmanager get-secret-value \
        --secret-id "$source_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --query SecretString \
        --output text 2>/dev/null)

    if [ -z "$secret_value" ]; then
        echo -e "${RED}Failed to retrieve value${NC}"
        return 1
    fi

    # Get metadata from source secret
    local metadata
    metadata=$(aws secretsmanager describe-secret \
        --secret-id "$source_name" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        2>/dev/null)

    # Extract description and tags
    local description
    description=$(echo "$metadata" | jq -r '.Description // "Migrated from '"$source_name"'"')

    local tags
    tags=$(echo "$metadata" | jq -r '.Tags // []' 2>/dev/null)

    # Prepare create/update command with tags if they exist
    local create_args=(
        --name "$target_name"
        --description "$description"
        --secret-string "$secret_value"
        --region "$AWS_REGION"
        --profile "$AWS_PROFILE"
    )

    # Add tags if present
    if [ "$tags" != "[]" ] && [ -n "$tags" ]; then
        create_args+=(--tags "$tags")
    fi

    # Try to create the new secret
    if aws secretsmanager create-secret "${create_args[@]}" >/dev/null 2>&1; then
        echo -e "${GREEN}Created${NC}"
    else
        # If creation fails, try to update instead
        if aws secretsmanager update-secret \
            --secret-id "$target_name" \
            --secret-string "$secret_value" \
            --description "$description" \
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

# Check AWS credentials
echo "Verifying AWS credentials..."
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    echo -e "${RED}Error: AWS credentials not configured for profile $AWS_PROFILE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials verified${NC}"
echo ""

# Perform migration or show metadata
if [ "$DRY_RUN" = true ]; then
    echo "Analyzing secrets metadata..."

    for source in "${!SECRET_MAPPINGS[@]}"; do
        target="${SECRET_MAPPINGS[$source]}"
        show_secret_metadata "$source" "$target"
    done

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}=== Dry Run Complete ===${NC}"
    echo ""
    echo "Review the metadata above and check if any descriptions/tags need updating."
    echo ""
    echo "To perform the actual migration, run:"
    echo -e "  ${GREEN}./scripts/migrate-secrets-to-leo.sh --execute${NC}"
    echo ""
else
    echo "Migrating secrets..."
    echo ""

    for source in "${!SECRET_MAPPINGS[@]}"; do
        target="${SECRET_MAPPINGS[$source]}"
        copy_secret "$source" "$target"
    done

    echo ""
    echo -e "${GREEN}=== Migration Complete ===${NC}"
    echo ""
    echo "Verify new secrets with:"
    echo "  aws secretsmanager list-secrets --region $AWS_REGION --profile $AWS_PROFILE --query 'SecretList[?starts_with(Name, \`leo/\`)].Name'"
    echo ""
    echo "Next steps:"
    echo "  1. Update lib/leo-saas-stack.ts to reference leo/* secrets"
    echo "  2. Test the infrastructure: cdk diff --profile $AWS_PROFILE"
    echo "  3. Deploy: cdk deploy --profile $AWS_PROFILE"
    echo ""
    echo -e "${YELLOW}Note: Old app-gen-saas/* secrets are preserved for V1 deployment${NC}"
    echo ""
fi
