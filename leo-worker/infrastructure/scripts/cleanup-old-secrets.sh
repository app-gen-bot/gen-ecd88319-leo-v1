#!/bin/bash

# Cleanup Old Secrets - Remove launch/* secrets
# Run AFTER creating new app-gen-saas/* secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Set AWS region and profile
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"

echo -e "${YELLOW}=== Cleanup Old Secrets ===${NC}"
echo "Region: $AWS_REGION"
echo "Profile: $AWS_PROFILE"
echo ""

# List of old secrets to remove
OLD_SECRETS=(
  "launch/supabase-url"
  "launch/supabase-anon-key"
  "launch/supabase-service-role-key"
  "launch/database-url"
  "launch/claude-oauth-token"
)

# Function to delete secret
delete_secret() {
  local secret_name=$1

  echo -n "Deleting secret: $secret_name ... "

  # Check if secret exists
  if ! aws secretsmanager describe-secret \
      --secret-id "$secret_name" \
      --region "$AWS_REGION" \
      --profile "$AWS_PROFILE" \
      >/dev/null 2>&1; then
    echo -e "${YELLOW}Not found (already deleted)${NC}"
    return 0
  fi

  # Delete the secret (with recovery window)
  if aws secretsmanager delete-secret \
      --secret-id "$secret_name" \
      --recovery-window-in-days 7 \
      --region "$AWS_REGION" \
      --profile "$AWS_PROFILE" \
      >/dev/null 2>&1; then
    echo -e "${GREEN}Deleted (7-day recovery window)${NC}"
  else
    echo -e "${RED}Failed${NC}"
    return 1
  fi
}

# Confirmation prompt
echo -e "${YELLOW}This will delete the following secrets:${NC}"
for secret in "${OLD_SECRETS[@]}"; do
  echo "  - $secret"
done
echo ""
echo -e "${YELLOW}Secrets will be scheduled for deletion with a 7-day recovery window.${NC}"
echo -e "${YELLOW}You can recover them during this period if needed.${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "Deleting old secrets..."
echo ""

# Delete each secret
for secret in "${OLD_SECRETS[@]}"; do
  delete_secret "$secret"
done

echo ""
echo -e "${GREEN}=== Cleanup Complete ===${NC}"
echo ""
echo "To verify old secrets are gone:"
echo "  aws secretsmanager list-secrets --region $AWS_REGION --profile $AWS_PROFILE --query 'SecretList[?starts_with(Name, \`launch/\`)].Name'"
echo ""
echo "To recover a deleted secret (within 7 days):"
echo "  aws secretsmanager restore-secret --secret-id launch/supabase-url --region $AWS_REGION --profile $AWS_PROFILE"
echo ""
