#!/bin/bash

# Authentication script for PRIVATE CodeArtifact repository
# Uses jake-dev AWS profile

export AWS_PROFILE=jake-dev
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --profile jake-dev)
REGION=$(aws configure get region --profile jake-dev || echo "us-east-1")
DOMAIN="cc-internal"

# Get authentication token
export UV_INDEX_INTERNAL_USERNAME=aws
export UV_INDEX_INTERNAL_PASSWORD=$(
  aws codeartifact get-authorization-token \
    --domain $DOMAIN \
    --domain-owner $ACCOUNT_ID \
    --query authorizationToken \
    --output text \
    --profile jake-dev
)

# Build repository URL
export UV_INDEX_INTERNAL_URL="https://${DOMAIN}-${ACCOUNT_ID}.d.codeartifact.${REGION}.amazonaws.com/pypi/python-internal/simple/"

echo "✅ Authenticated to PRIVATE CodeArtifact"
echo "   Profile: jake-dev"
echo "   Account: $ACCOUNT_ID"
echo "   Region: $REGION"
echo "   Domain: $DOMAIN (PRIVATE)"
echo "   Repository: python-internal (CONFIDENTIAL)"
echo "   Token valid for: 12 hours"
echo ""
echo "   URL: $UV_INDEX_INTERNAL_URL"