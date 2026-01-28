#!/bin/bash
# ============================================
# Leo SaaS App - Build and Push to ECR
# ============================================
# Builds the leo-saas-app container and pushes to ECR
#
# IMPORTANT: This script builds from the GEN REPO, not app-factory/leo-saas
# Source: ~/WORK/LEO/saas-dev-agent/repos/gen-219eda6b-032862af
#
# Usage: ./scripts/build-and-push-saas.sh [commit-hash]
# Example: ./scripts/build-and-push-saas.sh 28b144c9

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
AWS_ACCOUNT="855235011337"
ECR_REGISTRY="${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_NAME="leo-saas-app"

# CRITICAL: Source directory is the GEN REPO, not app-factory/leo-saas
LEO_SAAS_DIR="${HOME}/WORK/LEO/saas-dev-agent/repos/gen-219eda6b-032862af"

# Verify source directory exists
if [ ! -d "$LEO_SAAS_DIR" ]; then
    echo "Error: Source directory not found: $LEO_SAAS_DIR"
    echo "Expected the gen repo at ~/WORK/LEO/saas-dev-agent/repos/gen-219eda6b-032862af"
    exit 1
fi

# Get commit hash from argument or from the source directory
if [ -n "$1" ]; then
    GIT_SHA="$1"
else
    cd "$LEO_SAAS_DIR"
    GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
fi

# Verify the source directory is at the expected commit
cd "$LEO_SAAS_DIR"
ACTUAL_SHA=$(git rev-parse --short HEAD 2>/dev/null)
if [ "$GIT_SHA" != "$ACTUAL_SHA" ] && [ "$GIT_SHA" != "dev" ]; then
    echo "Warning: Requested commit ${GIT_SHA} but source is at ${ACTUAL_SHA}"
    echo "Pulling and checking out ${GIT_SHA}..."
    git fetch origin
    git checkout "$GIT_SHA" || {
        echo "Error: Could not checkout ${GIT_SHA}"
        exit 1
    }
fi

BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Leo SaaS App - Build and Push${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Image:${NC} ${IMAGE_NAME}:${GIT_SHA}"
echo -e "${GREEN}Registry:${NC} ${ECR_REGISTRY}"
echo -e "${GREEN}Source:${NC} ${LEO_SAAS_DIR}"
echo -e "${GREEN}Commit:${NC} ${GIT_SHA} ($(git log -1 --format='%s' 2>/dev/null || echo 'unknown'))"
echo -e "${GREEN}AWS Profile:${NC} ${AWS_PROFILE}"
echo -e "${RED}Cache:${NC} DISABLED (--no-cache)"
echo ""

# Step 1: Authenticate with ECR
echo -e "${YELLOW}Step 1/5: Authenticating with ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} --profile ${AWS_PROFILE} | \
    docker login --username AWS --password-stdin ${ECR_REGISTRY}
echo -e "${GREEN}✅ ECR authentication successful${NC}"
echo ""

# Step 2: Fetch Supabase credentials from AWS Secrets Manager
echo -e "${YELLOW}Step 2/5: Fetching Supabase credentials...${NC}"
VITE_SUPABASE_URL=$(aws secretsmanager get-secret-value \
    --secret-id leo/supabase-url \
    --region ${AWS_REGION} \
    --profile ${AWS_PROFILE} \
    --query 'SecretString' --output text)
VITE_SUPABASE_ANON_KEY=$(aws secretsmanager get-secret-value \
    --secret-id leo/supabase-anon-key \
    --region ${AWS_REGION} \
    --profile ${AWS_PROFILE} \
    --query 'SecretString' --output text)

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}Error: Failed to fetch Supabase credentials from Secrets Manager${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Supabase credentials fetched (${VITE_SUPABASE_URL})${NC}"
echo ""

# Step 3: Build the image (ALWAYS with --no-cache during development)
echo -e "${YELLOW}Step 3/5: Building Docker image (no-cache)...${NC}"
cd "$LEO_SAAS_DIR"

# Build for linux/amd64 (required for Fargate)
# VITE_* args are baked into frontend at build time
# --no-cache ensures we always build fresh code
docker build \
    --no-cache \
    --platform linux/amd64 \
    --tag "${IMAGE_NAME}:${GIT_SHA}" \
    --build-arg BUILD_DATE="${BUILD_DATE}" \
    --build-arg VERSION="${GIT_SHA}" \
    --build-arg VITE_SUPABASE_URL="${VITE_SUPABASE_URL}" \
    --build-arg VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY}" \
    .

IMAGE_SIZE=$(docker images "${IMAGE_NAME}:${GIT_SHA}" --format "{{.Size}}")
echo -e "${GREEN}✅ Build complete! Size: ${IMAGE_SIZE}${NC}"
echo ""

# Step 4: Tag for ECR
echo -e "${YELLOW}Step 4/5: Tagging image for ECR...${NC}"
docker tag "${IMAGE_NAME}:${GIT_SHA}" "${ECR_REGISTRY}/${IMAGE_NAME}:${GIT_SHA}"
echo -e "${GREEN}✅ Tagged ${ECR_REGISTRY}/${IMAGE_NAME}:${GIT_SHA}${NC}"
echo ""

# Step 5: Push to ECR
echo -e "${YELLOW}Step 5/5: Pushing to ECR...${NC}"
docker push "${ECR_REGISTRY}/${IMAGE_NAME}:${GIT_SHA}"
echo -e "${GREEN}✅ Push complete!${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Build and Push Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Image pushed:${NC}"
echo "  ${ECR_REGISTRY}/${IMAGE_NAME}:${GIT_SHA}"
echo ""
echo -e "${BLUE}Built from:${NC}"
echo "  ${LEO_SAAS_DIR}"
echo "  Commit: ${GIT_SHA}"
echo ""
echo -e "${YELLOW}Next step - deploy to ECS:${NC}"
echo "  ./scripts/deploy-saas-app.sh ${GIT_SHA}"
echo ""
