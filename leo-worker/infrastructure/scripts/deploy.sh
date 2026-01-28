#!/bin/bash

# Leo Infrastructure Deployment Script
# Validates prerequisites and deploys CDK stack safely
#
# Usage:
#   ./deploy.sh                    # Deploy LeoSaasStack only (default)
#   ./deploy.sh --efs-only         # Deploy LeoEfsStack only
#   ./deploy.sh --with-efs         # Deploy LeoSaasStack with EFS enabled
#   ./deploy.sh --all              # Deploy both stacks with EFS enabled

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-default}"
USE_TEST_CONTAINERS="${USE_TEST_CONTAINERS:-false}"

# Parse flags
DEPLOY_MODE="saas"  # default: just LeoSaasStack
while [[ $# -gt 0 ]]; do
    case $1 in
        --efs-only)
            DEPLOY_MODE="efs-only"
            shift
            ;;
        --with-efs)
            DEPLOY_MODE="with-efs"
            shift
            ;;
        --all)
            DEPLOY_MODE="all"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--efs-only|--with-efs|--all]"
            exit 1
            ;;
    esac
done

# Select container repositories and tags based on mode
if [ "$USE_TEST_CONTAINERS" = "true" ]; then
    LEO_SAAS_APP_REPO="leo-saas-app-test"
    LEO_SAAS_APP_TAG="dummy-v1"
    LEO_GENERATOR_REPO="leo-test"
    LEO_GENERATOR_TAG="dummy-v1"
    LEO_GENERATOR_URI_TAG="dummy-v1"
    echo -e "${YELLOW}=== TEST MODE: Using dummy containers ===${NC}"
else
    LEO_SAAS_APP_REPO="leo-saas-app"
    LEO_SAAS_APP_TAG="e6e66de"
    LEO_GENERATOR_REPO="leo"
    LEO_GENERATOR_TAG="0e6b6f38"
    LEO_GENERATOR_URI_TAG="0e6b6f38"
fi

echo -e "${BLUE}=== Leo Infrastructure Deployment ===${NC}"
echo "Region: $AWS_REGION"
echo "Profile: $AWS_PROFILE"
echo "Deploy Mode: $DEPLOY_MODE"
echo "Test Mode: $USE_TEST_CONTAINERS"
if [ "$USE_TEST_CONTAINERS" = "true" ]; then
    echo -e "${YELLOW}Orchestrator: $LEO_SAAS_APP_REPO:$LEO_SAAS_APP_TAG${NC}"
    echo -e "${YELLOW}Generator: $LEO_GENERATOR_REPO:$LEO_GENERATOR_TAG${NC}"
fi
echo ""

# Function to get EFS outputs from CloudFormation
get_efs_outputs() {
    echo -e "${BLUE}Fetching EFS stack outputs...${NC}"

    EFS_FS_ID=$(aws cloudformation describe-stacks \
        --stack-name LeoEfsStack \
        --query 'Stacks[0].Outputs[?ExportName==`LeoEfsFileSystemId`].OutputValue' \
        --output text \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" 2>/dev/null)

    EFS_AP_ID=$(aws cloudformation describe-stacks \
        --stack-name LeoEfsStack \
        --query 'Stacks[0].Outputs[?ExportName==`LeoEfsAccessPointId`].OutputValue' \
        --output text \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" 2>/dev/null)

    if [ -z "$EFS_FS_ID" ] || [ "$EFS_FS_ID" = "None" ]; then
        echo -e "${RED}Error: LeoEfsStack not found or missing outputs${NC}"
        echo "Deploy EFS stack first: $0 --efs-only"
        exit 1
    fi

    echo -e "${GREEN}✓ EFS FileSystem ID: $EFS_FS_ID${NC}"
    echo -e "${GREEN}✓ EFS Access Point ID: $EFS_AP_ID${NC}"
    echo ""
}

# Function to check if ECR image exists
check_ecr_image() {
    local repository=$1
    local tag=$2

    echo -n "Checking ECR image: $repository:$tag ... "

    if aws ecr describe-images \
        --repository-name "$repository" \
        --image-ids imageTag="$tag" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Found${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
        return 1
    fi
}

# Validate AWS credentials
echo "Step 1: Validating AWS credentials..."
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null 2>&1; then
    echo -e "${RED}Error: AWS credentials not configured for profile $AWS_PROFILE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials valid${NC}"
echo ""

# Export tags for CDK stack to consume (needed even for EFS-only since CDK synths all stacks)
export LEO_SAAS_APP_TAG
export LEO_GENERATOR_TAG
export LEO_GENERATOR_URI_TAG

# Skip secrets/images validation for EFS-only mode
if [ "$DEPLOY_MODE" != "efs-only" ]; then

# Validate secrets exist
echo "Step 2: Validating required secrets..."
REQUIRED_SECRETS=(
    "leo/supabase-url"
    "leo/supabase-anon-key"
    "leo/supabase-service-role-key"
    "leo/database-url"
    "leo/claude-oauth-token"
    "leo/github-bot-token"
    "leo/fly-api-token"
)

MISSING_SECRETS=0
for secret in "${REQUIRED_SECRETS[@]}"; do
    echo -n "Checking secret: $secret ... "
    if aws secretsmanager describe-secret \
        --secret-id "$secret" \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Found${NC}"
    else
        echo -e "${RED}✗ NOT FOUND${NC}"
        MISSING_SECRETS=$((MISSING_SECRETS + 1))
    fi
done

if [ $MISSING_SECRETS -gt 0 ]; then
    echo ""
    echo -e "${RED}Error: $MISSING_SECRETS required secret(s) missing${NC}"
    echo "Run: ./scripts/setup-aws-secrets.sh"
    exit 1
fi
echo -e "${GREEN}✓ All secrets found${NC}"
echo ""

# Validate ECR images exist
echo "Step 3: Validating ECR images..."

# Validate no 'latest' tags (safety check) - skip for test mode
if [ "$USE_TEST_CONTAINERS" != "true" ]; then
    if [ "$LEO_SAAS_APP_TAG" = "latest" ] || [ "$LEO_GENERATOR_TAG" = "latest" ] || [ "$LEO_GENERATOR_URI_TAG" = "latest" ]; then
        echo -e "${RED}Error: Image tags cannot be 'latest' in production${NC}"
        echo "Update the tags at the top of this script to specific commit hashes"
        exit 1
    fi
fi

MISSING_IMAGES=0

if ! check_ecr_image "$LEO_SAAS_APP_REPO" "$LEO_SAAS_APP_TAG"; then
    MISSING_IMAGES=$((MISSING_IMAGES + 1))
fi

if ! check_ecr_image "$LEO_GENERATOR_REPO" "$LEO_GENERATOR_TAG"; then
    MISSING_IMAGES=$((MISSING_IMAGES + 1))
fi

# Note: cf1b176 is referenced in GENERATOR_IMAGE env var, might be different tag
if [ "$LEO_GENERATOR_URI_TAG" != "$LEO_GENERATOR_TAG" ]; then
    if ! check_ecr_image "$LEO_GENERATOR_REPO" "$LEO_GENERATOR_URI_TAG"; then
        MISSING_IMAGES=$((MISSING_IMAGES + 1))
    fi
fi

if [ $MISSING_IMAGES -gt 0 ]; then
    echo ""
    echo -e "${RED}Error: $MISSING_IMAGES required image(s) missing in ECR${NC}"
    echo ""
    echo "To build and push images:"
    echo "  1. cd ../leo-saas && ./scripts/build-and-push.sh"
    echo "  2. cd ../leo-container && ./scripts/build-and-push.sh"
    echo ""
    echo -e "${YELLOW}Or update image tags in lib/leo-saas-stack.ts to match existing images${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All ECR images found${NC}"
echo ""

fi  # End of skip validation for efs-only

# Build CDK
echo "Step 4: Building CDK TypeScript..."
if ! npm run build >/dev/null 2>&1; then
    echo -e "${RED}Error: CDK build failed${NC}"
    npm run build
    exit 1
fi
echo -e "${GREEN}✓ CDK build successful${NC}"
echo ""

# Deploy based on mode
case "$DEPLOY_MODE" in
    efs-only)
        echo "Step 5: Showing EFS stack changes..."
        echo ""
        npx cdk diff LeoEfsStack --profile "$AWS_PROFILE" 2>/dev/null || true
        echo ""

        echo -e "${BLUE}Step 6: Deploying LeoEfsStack...${NC}"
        npx cdk deploy LeoEfsStack --profile "$AWS_PROFILE" --require-approval never

        echo ""
        echo -e "${GREEN}=== EFS Stack Deployment Complete ===${NC}"
        echo ""
        echo "EFS stack deployed. Next step:"
        echo "  ./scripts/deploy.sh --with-efs   # Deploy main stack with EFS enabled"
        echo ""
        ;;

    with-efs)
        # Fetch EFS outputs first
        get_efs_outputs

        echo "Step 5: Showing main stack changes (with EFS)..."
        echo ""
        npx cdk diff LeoSaasStack --profile "$AWS_PROFILE" \
            -c efsFileSystemId="$EFS_FS_ID" \
            -c efsAccessPointId="$EFS_AP_ID" 2>/dev/null || true
        echo ""

        echo -e "${BLUE}Step 6: Deploying LeoSaasStack with EFS...${NC}"
        npx cdk deploy LeoSaasStack --profile "$AWS_PROFILE" --require-approval never \
            -c efsFileSystemId="$EFS_FS_ID" \
            -c efsAccessPointId="$EFS_AP_ID"

        echo ""
        echo -e "${GREEN}=== Deployment Complete (with EFS) ===${NC}"
        echo ""
        echo "Main stack deployed with EFS enabled."
        echo "Generator containers will now mount /efs for persistent storage."
        echo ""
        ;;

    all)
        echo "Step 5: Deploying both stacks..."
        echo ""

        echo -e "${BLUE}Step 5a: Deploying LeoEfsStack...${NC}"
        npx cdk deploy LeoEfsStack --profile "$AWS_PROFILE" --require-approval never

        # Fetch EFS outputs
        get_efs_outputs

        echo -e "${BLUE}Step 5b: Deploying LeoSaasStack with EFS...${NC}"
        npx cdk deploy LeoSaasStack --profile "$AWS_PROFILE" --require-approval never \
            -c efsFileSystemId="$EFS_FS_ID" \
            -c efsAccessPointId="$EFS_AP_ID"

        echo ""
        echo -e "${GREEN}=== Full Deployment Complete ===${NC}"
        echo ""
        echo "Both stacks deployed. EFS is enabled."
        echo ""
        ;;

    *)
        # Default: deploy main stack only (no EFS)
        echo "Step 5: Showing infrastructure changes..."
        echo ""
        npx cdk diff LeoSaasStack --profile "$AWS_PROFILE" 2>/dev/null || true
        echo ""

        echo -e "${BLUE}Step 6: Deploying LeoSaasStack...${NC}"
        npx cdk deploy LeoSaasStack --profile "$AWS_PROFILE" --require-approval never

        echo ""
        echo -e "${GREEN}=== Deployment Complete ===${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Check CloudFormation console for stack outputs"
        echo "  2. Review CloudWatch logs: /aws/ecs/leo-saas-app"
        echo "  3. To enable EFS: ./scripts/deploy.sh --efs-only && ./scripts/deploy.sh --with-efs"
        echo ""
        ;;
esac
