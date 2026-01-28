#!/bin/bash

# Delete all repositories from the GitHub bot account
# This script deletes all repos owned by the authenticated bot user
#
# Usage:
#   export GITHUB_BOT_TOKEN=ghp_xxxxx
#   ./scripts/delete-bot-repos.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for GitHub token
if [ -z "$GITHUB_BOT_TOKEN" ]; then
  echo -e "${RED}Error: GITHUB_BOT_TOKEN environment variable not set${NC}"
  echo "Set it with: export GITHUB_BOT_TOKEN=ghp_xxxxx"
  exit 1
fi

# Get authenticated user info
echo -e "${YELLOW}Fetching authenticated user info...${NC}"
USER_INFO=$(curl -s -H "Authorization: token $GITHUB_BOT_TOKEN" https://api.github.com/user)
USERNAME=$(echo "$USER_INFO" | jq -r '.login')

if [ "$USERNAME" = "null" ] || [ -z "$USERNAME" ]; then
  echo -e "${RED}Error: Could not authenticate with GitHub. Check your token.${NC}"
  exit 1
fi

echo -e "${GREEN}Authenticated as: $USERNAME${NC}"

# Fetch all repositories for the authenticated user
echo -e "${YELLOW}Fetching all repositories...${NC}"
REPOS=$(curl -s -H "Authorization: token $GITHUB_BOT_TOKEN" \
  "https://api.github.com/user/repos?per_page=100&type=owner" | \
  jq -r '.[].full_name')

if [ -z "$REPOS" ]; then
  echo -e "${GREEN}No repositories found to delete.${NC}"
  exit 0
fi

# Count repositories
REPO_COUNT=$(echo "$REPOS" | wc -l)
echo -e "${YELLOW}Found $REPO_COUNT repositories:${NC}"
echo "$REPOS"

# Confirmation prompt
echo ""
echo -e "${RED}WARNING: This will DELETE ALL $REPO_COUNT repositories!${NC}"
echo -e "${RED}This action CANNOT be undone.${NC}"
echo ""
read -p "Type 'DELETE ALL' to confirm: " CONFIRMATION

if [ "$CONFIRMATION" != "DELETE ALL" ]; then
  echo -e "${GREEN}Aborted. No repositories deleted.${NC}"
  exit 0
fi

# Delete each repository
echo -e "${YELLOW}Deleting repositories...${NC}"
DELETED_COUNT=0
FAILED_COUNT=0

while IFS= read -r repo; do
  echo -n "Deleting $repo... "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE \
    -H "Authorization: token $GITHUB_BOT_TOKEN" \
    "https://api.github.com/repos/$repo")

  if [ "$HTTP_CODE" = "204" ]; then
    echo -e "${GREEN}✓${NC}"
    ((DELETED_COUNT++))
  else
    echo -e "${RED}✗ (HTTP $HTTP_CODE)${NC}"
    ((FAILED_COUNT++))
  fi

  # Rate limit: GitHub allows 5000 requests/hour for authenticated users
  # Sleep 1 second between deletes to be safe
  sleep 1
done <<< "$REPOS"

echo ""
echo -e "${GREEN}Deletion complete!${NC}"
echo -e "  Deleted: $DELETED_COUNT"
if [ $FAILED_COUNT -gt 0 ]; then
  echo -e "  ${RED}Failed: $FAILED_COUNT${NC}"
fi
