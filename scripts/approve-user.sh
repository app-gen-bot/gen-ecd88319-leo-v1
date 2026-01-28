#!/bin/bash

# Approve a Leo SaaS user
# Usage: ./scripts/approve-user.sh <email> [credits]
#
# Examples:
#   ./scripts/approve-user.sh user@example.com        # Approve with 100 credits
#   ./scripts/approve-user.sh user@example.com 500    # Approve with 500 credits

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

EMAIL="${1:-}"
CREDITS="${2:-100}"

if [[ -z "$EMAIL" ]]; then
    echo -e "${RED}Usage: ./scripts/approve-user.sh <email> [credits]${NC}"
    echo ""
    echo "Examples:"
    echo "  ./scripts/approve-user.sh user@example.com"
    echo "  ./scripts/approve-user.sh user@example.com 500"
    exit 1
fi

# Database URL
LEO_DEV_DATABASE_URL="${LEO_DEV_DATABASE_URL:-}"

if [[ -z "$LEO_DEV_DATABASE_URL" ]]; then
    echo -e "${RED}Error: LEO_DEV_DATABASE_URL not set${NC}"
    echo ""
    echo "Set it in your environment:"
    echo "  export LEO_DEV_DATABASE_URL='postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres'"
    echo ""
    echo "Or find it in ~/.secrets/supabase-credentials.md"
    exit 1
fi

echo -e "${BLUE}=== Approve User ===${NC}"
echo "Email: $EMAIL"
echo "Credits: $CREDITS"
echo ""

# Check if user exists and show current status
echo -e "${YELLOW}Current status:${NC}"
CURRENT=$(psql "$LEO_DEV_DATABASE_URL" -t -c "SELECT email, status, credits_remaining, role FROM profiles WHERE email = '$EMAIL';" 2>/dev/null)

if [[ -z "$CURRENT" || "$CURRENT" =~ ^[[:space:]]*$ ]]; then
    echo -e "${RED}User not found: $EMAIL${NC}"
    echo ""
    echo "Available users:"
    psql "$LEO_DEV_DATABASE_URL" -c "SELECT email, status, created_at FROM profiles ORDER BY created_at DESC;" 2>/dev/null
    exit 1
fi

echo "$CURRENT"
echo ""

# Confirm approval
read -p "Approve this user? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Approve user
echo -e "${YELLOW}Approving user...${NC}"
psql "$LEO_DEV_DATABASE_URL" -c "
    UPDATE profiles
    SET status = 'approved',
        credits_remaining = $CREDITS,
        updated_at = NOW()
    WHERE email = '$EMAIL';
" 2>/dev/null

# Verify
echo ""
echo -e "${GREEN}Done! Updated status:${NC}"
psql "$LEO_DEV_DATABASE_URL" -c "SELECT email, status, credits_remaining, role FROM profiles WHERE email = '$EMAIL';" 2>/dev/null
