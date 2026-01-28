#!/bin/bash
# ============================================
# Leo Container - Push to ECR
# ============================================
# Pushes the leo-container image to ECR
# Usage: ./scripts/push.sh [commit-hash]
# Example: ./scripts/push.sh e72a0a3

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
AWS_ACCOUNT="855235011337"
ECR_REGISTRY="${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPO="leo"  # Note: ECR repo is "leo" not "leo-container"
LOCAL_IMAGE="leo-container"

# Get commit hash
if [ -n "$1" ]; then
    GIT_SHA="$1"
else
    # Try to get from current directory
    GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Leo Container - Push to ECR${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Local Image:${NC} ${LOCAL_IMAGE}:${GIT_SHA}"
echo -e "${GREEN}ECR Image:${NC} ${ECR_REGISTRY}/${ECR_REPO}:${GIT_SHA}"
echo -e "${GREEN}AWS Profile:${NC} ${AWS_PROFILE}"
echo ""

# Check local image exists
echo -e "${YELLOW}Checking local image exists...${NC}"
if ! docker image inspect "${LOCAL_IMAGE}:${GIT_SHA}" >/dev/null 2>&1; then
    echo -e "${RED}Error: Local image ${LOCAL_IMAGE}:${GIT_SHA} not found${NC}"
    echo "Run ./scripts/build.sh ${GIT_SHA} first"
    exit 1
fi
echo -e "${GREEN}✅ Local image found${NC}"
echo ""

# Step 1: Authenticate with ECR
echo -e "${YELLOW}Step 1/3: Authenticating with ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} --profile ${AWS_PROFILE} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY}
echo -e "${GREEN}✅ ECR authentication successful${NC}"
echo ""

# Step 2: Tag for ECR
echo -e "${YELLOW}Step 2/3: Tagging image for ECR...${NC}"
docker tag "${LOCAL_IMAGE}:${GIT_SHA}" "${ECR_REGISTRY}/${ECR_REPO}:${GIT_SHA}"
echo -e "${GREEN}✅ Tagged ${ECR_REGISTRY}/${ECR_REPO}:${GIT_SHA}${NC}"
echo ""

# Step 3: Push to ECR
echo -e "${YELLOW}Step 3/3: Pushing to ECR...${NC}"
docker push "${ECR_REGISTRY}/${ECR_REPO}:${GIT_SHA}"
echo -e "${GREEN}✅ Push complete!${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Push Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Image pushed:${NC}"
echo "  ${ECR_REGISTRY}/${ECR_REPO}:${GIT_SHA}"
echo ""
echo -e "${YELLOW}To use in CDK, update GENERATOR_IMAGE in leo-saas-stack.ts${NC}"
echo ""
