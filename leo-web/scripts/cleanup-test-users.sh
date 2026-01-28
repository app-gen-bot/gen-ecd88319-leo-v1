#!/bin/bash

# Cleanup Test Users from Supabase Auth
# DANGER: This deletes users permanently. Use with caution.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load Supabase credentials from AWS Secrets Manager
echo "Loading Supabase credentials from AWS Secrets Manager..."
SUPABASE_URL=$(aws secretsmanager get-secret-value --secret-id app-gen-saas/supabase-url --region us-east-1 --query SecretString --output text)
SUPABASE_SERVICE_KEY=$(aws secretsmanager get-secret-value --secret-id app-gen-saas/supabase-service-role-key --region us-east-1 --query SecretString --output text)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}Error: Failed to load Supabase credentials${NC}"
    exit 1
fi

echo -e "${GREEN}Credentials loaded${NC}"
echo ""

# Fetch all users
echo "Fetching all users from Supabase Auth..."
USERS_JSON=$(curl -s "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}")

# Parse and display users
echo -e "${YELLOW}=== Current Users ===${NC}"
echo "$USERS_JSON" | jq -r '.users[] | "\(.id) - \(.email) - Created: \(.created_at)"'
echo ""

# Count users
USER_COUNT=$(echo "$USERS_JSON" | jq '.users | length')
echo -e "${YELLOW}Total users: ${USER_COUNT}${NC}"
echo ""

# Safety check
if [ "$USER_COUNT" -eq 0 ]; then
    echo "No users to delete."
    exit 0
fi

# Confirmation
echo -e "${RED}WARNING: This will delete users from Supabase Auth permanently!${NC}"
echo -e "${RED}This action cannot be undone.${NC}"
echo ""
read -p "Enter email pattern to delete (e.g., 'test@example.com' or 'test+*' for wildcard): " EMAIL_PATTERN

if [ -z "$EMAIL_PATTERN" ]; then
    echo "No pattern provided. Exiting."
    exit 0
fi

# Filter users matching pattern
MATCHING_USERS=$(echo "$USERS_JSON" | jq -r --arg pattern "$EMAIL_PATTERN" \
  '.users[] | select(.email | test($pattern)) | "\(.id) - \(.email)"')

if [ -z "$MATCHING_USERS" ]; then
    echo "No users match pattern: $EMAIL_PATTERN"
    exit 0
fi

echo ""
echo -e "${YELLOW}Users matching pattern '${EMAIL_PATTERN}':${NC}"
echo "$MATCHING_USERS"
echo ""

MATCH_COUNT=$(echo "$MATCHING_USERS" | wc -l)
echo -e "${RED}This will delete ${MATCH_COUNT} user(s).${NC}"
read -p "Type 'DELETE' to confirm: " CONFIRMATION

if [ "$CONFIRMATION" != "DELETE" ]; then
    echo "Cancelled."
    exit 0
fi

# Delete matching users
echo ""
echo "Deleting users..."
echo "$USERS_JSON" | jq -r --arg pattern "$EMAIL_PATTERN" \
  '.users[] | select(.email | test($pattern)) | .id' | while read -r USER_ID; do

  echo -n "Deleting user ${USER_ID}... "

  RESPONSE=$(curl -s -X DELETE "${SUPABASE_URL}/auth/v1/admin/users/${USER_ID}" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}")

  if [ -z "$RESPONSE" ]; then
    echo -e "${GREEN}Deleted${NC}"
  else
    echo -e "${RED}Failed: $RESPONSE${NC}"
  fi
done

echo ""
echo -e "${GREEN}=== Cleanup Complete ===${NC}"
echo ""

# Show remaining users
echo "Remaining users:"
REMAINING=$(curl -s "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}")
echo "$REMAINING" | jq -r '.users[] | "\(.email)"'
