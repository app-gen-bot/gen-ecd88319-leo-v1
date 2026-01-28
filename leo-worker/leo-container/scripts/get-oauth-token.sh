#!/bin/bash
#
# Get OAuth Token from AWS Secrets Manager
#
# Retrieves the Claude Code OAuth token stored in AWS Secrets Manager.
# Useful for verifying the token is correctly stored.
#
# Usage:
#   ./get-oauth-token.sh              # Uses default profile (jake-dev)
#   AWS_PROFILE=prod ./get-oauth-token.sh
#

set -e

# Configuration
SECRET_NAME="leo/claude-oauth-token"
REGION="${AWS_REGION:-us-east-1}"
PROFILE="${AWS_PROFILE:-jake-dev}"

echo "🔐 Fetching OAuth token from AWS Secrets Manager"
echo "   Secret: $SECRET_NAME"
echo "   Region: $REGION"
echo "   Profile: $PROFILE"
echo ""

# Fetch the secret
TOKEN=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$REGION" \
    --profile "$PROFILE" \
    --query 'SecretString' \
    --output text 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Secret not found or empty: $SECRET_NAME"
    echo ""
    echo "To create the secret:"
    echo "  aws secretsmanager create-secret \\"
    echo "    --name $SECRET_NAME \\"
    echo "    --secret-string 'your-oauth-token' \\"
    echo "    --region $REGION \\"
    echo "    --profile $PROFILE"
    exit 1
fi

# Show obfuscated token
TOKEN_LENGTH=${#TOKEN}
TOKEN_PREVIEW="${TOKEN:0:8}...${TOKEN: -4}"

echo "✅ Token found!"
echo "   Length: $TOKEN_LENGTH characters"
echo "   Preview: $TOKEN_PREVIEW"
echo ""

# Option to show full token
read -p "Show full token? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "$TOKEN"
fi
