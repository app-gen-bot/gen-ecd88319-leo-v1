#!/bin/bash

# Script to manually publish cc-tools to AWS CodeArtifact
# This is useful for local publishing or debugging

set -e

echo "=== Publishing cc-tools to CodeArtifact ==="

# Configuration (can be overridden by environment variables)
DOMAIN="${CODEARTIFACT_DOMAIN:-cc-internal}"
REPOSITORY="${CODEARTIFACT_REPOSITORY:-python-internal}"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"

echo "Configuration:"
echo "  Domain: $DOMAIN"
echo "  Repository: $REPOSITORY"
echo "  AWS Profile: $AWS_PROFILE"

# Dynamically resolve AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --profile $AWS_PROFILE)
REGION=$(aws configure get region --profile $AWS_PROFILE || echo "us-east-1")

echo "  Account ID: $ACCOUNT_ID"
echo "  Region: $REGION"

# Get authentication token
echo ""
echo "Getting CodeArtifact authentication token..."
TOKEN=$(aws codeartifact get-authorization-token \
  --domain $DOMAIN \
  --domain-owner $ACCOUNT_ID \
  --query authorizationToken \
  --output text \
  --profile $AWS_PROFILE)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Authentication successful"

# Build repository URL
REPO_URL="https://${DOMAIN}-${ACCOUNT_ID}.d.codeartifact.${REGION}.amazonaws.com/pypi/${REPOSITORY}/"

echo ""
echo "Repository URL: $REPO_URL"

# Build the package
echo ""
echo "Building package..."
uv build

# Show built artifacts
echo ""
echo "Built artifacts:"
ls -la dist/

# Publish to CodeArtifact
echo ""
echo "Publishing to CodeArtifact..."

UV_PUBLISH_USERNAME=aws \
UV_PUBLISH_PASSWORD=$TOKEN \
uv publish \
  --publish-url "$REPO_URL" \
  --username aws \
  --password "$TOKEN"

echo ""
echo "✅ Successfully published cc-tools to CodeArtifact"

# Verify publication
PACKAGE_NAME=$(python -c "import tomllib; print(tomllib.load(open('pyproject.toml', 'rb'))['project']['name'])")

echo ""
echo "Verifying package in repository..."
aws codeartifact list-package-versions \
  --domain $DOMAIN \
  --domain-owner $ACCOUNT_ID \
  --repository $REPOSITORY \
  --package $PACKAGE_NAME \
  --format pypi \
  --max-items 5 \
  --profile $AWS_PROFILE \
  --output table

echo ""
echo "=== Publishing complete ==="
echo ""
echo "To install this package in another project:"
echo "1. Run the authentication script: source auth-codeartifact.sh"
echo "2. Install: uv pip install $PACKAGE_NAME"