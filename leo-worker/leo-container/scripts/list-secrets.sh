#!/bin/bash
#
# List Leo Secrets from AWS Secrets Manager
#
# Shows all secrets with the 'leo/' prefix and their status.
#
# Usage:
#   ./list-secrets.sh
#   AWS_PROFILE=prod ./list-secrets.sh
#

set -e

# Configuration
REGION="${AWS_REGION:-us-east-1}"
PROFILE="${AWS_PROFILE:-jake-dev}"

echo "🔐 Leo Secrets in AWS Secrets Manager"
echo "   Region: $REGION"
echo "   Profile: $PROFILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# List all secrets with leo/ prefix
aws secretsmanager list-secrets \
    --region "$REGION" \
    --profile "$PROFILE" \
    --filters Key=name,Values=leo/ \
    --query 'SecretList[*].[Name,Description,LastChangedDate]' \
    --output table 2>/dev/null || {
    echo "❌ Failed to list secrets"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check AWS credentials: aws sts get-caller-identity --profile $PROFILE"
    echo "  2. Verify IAM permissions for secretsmanager:ListSecrets"
    exit 1
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Expected secrets for Leo Remote:"
echo "  • leo/claude-oauth-token    - Your Claude Code OAuth token (USER)"
echo "  • leo/github-bot-token      - GitHub bot token (PLATFORM)"
echo "  • leo/fly-api-token         - Fly.io API token (PLATFORM)"
echo ""
echo "To view a secret value:"
echo "  ./get-oauth-token.sh"
echo ""
echo "To create a secret:"
echo "  aws secretsmanager create-secret --name leo/secret-name --secret-string 'value'"
