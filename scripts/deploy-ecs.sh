#!/bin/bash
# ============================================
# Leo SaaS - Deploy to ECS (Mono-Repo)
# ============================================
# Builds AMD64 images, pushes to ECR, deploys to ECS.
# Usage: ./scripts/deploy-ecs.sh
#
# Prerequisites:
#   - AWS credentials configured (aws sso login --profile jake-dev)
#   - .build-state exists (run ./scripts/build.sh first)
#   - Docker running

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_STATE="$PROJECT_DIR/.build-state"
LOGS_DIR="$PROJECT_DIR/logs/deploys"

# Mono-repo paths
LEO_WEB_DIR="$PROJECT_DIR/leo-web"
LEO_WORKER_DIR="$PROJECT_DIR/leo-worker"

# Setup logging (output to terminal AND log file)
mkdir -p "$LOGS_DIR"
LOG_FILE="$LOGS_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Log file: $LOG_FILE"

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
AWS_ACCOUNT="855235011337"
ECR_REGISTRY="${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECS_CLUSTER="leo-saas-cluster"
CLOUDFRONT_DISTRIBUTION_ID="E2D5W0FK2JGR85"
CLOUDFRONT_URL="https://d386l1mt30903c.cloudfront.net"

# Polling settings
DEPLOY_TIMEOUT=600   # 10 minutes for ECS deploy
POLL_INTERVAL=10

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# ============================================
# AMD64 Build Functions
# ============================================

# Build AMD64 images for Fargate deployment
build_amd64_images() {
    log_step "Building AMD64 images for Fargate..."
    echo "----------------------------------------------"

    cd "$PROJECT_DIR"

    # Build Leo Container (AMD64) from leo-worker/
    log_info "Building Leo Container (AMD64) from leo-worker/..."
    docker build --platform linux/amd64 \
        -t "leo-container:${LEO_CONTAINER}-amd64" \
        "$LEO_WORKER_DIR"

    log_success "leo-container:${LEO_CONTAINER}-amd64"

    # Build Leo SaaS (AMD64) from leo-web/
    log_info "Building Leo SaaS (AMD64) from leo-web/..."

    # Fetch build-time secrets from AWS Secrets Manager
    local VITE_SUPABASE_URL=$(aws secretsmanager get-secret-value \
        --secret-id leo/supabase-url \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --query SecretString --output text 2>/dev/null)

    local VITE_SUPABASE_ANON_KEY=$(aws secretsmanager get-secret-value \
        --secret-id leo/supabase-anon-key \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --query SecretString --output text 2>/dev/null)

    if [[ -z "$VITE_SUPABASE_URL" || "$VITE_SUPABASE_URL" == "null" ]]; then
        log_error "Failed to fetch leo/supabase-url"
        exit 1
    fi

    docker build --platform linux/amd64 \
        --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
        --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
        -t "leo-saas-generated:${LEO_SAAS}-amd64" \
        "$LEO_WEB_DIR"

    log_success "leo-saas-generated:${LEO_SAAS}-amd64"
}

# Push images to ECR
push_to_ecr() {
    log_step "Pushing images to ECR..."
    echo "----------------------------------------------"

    # Authenticate with ECR
    log_info "Authenticating with ECR..."
    aws ecr get-login-password --region "$AWS_REGION" --profile "$AWS_PROFILE" | \
        docker login --username AWS --password-stdin "$ECR_REGISTRY"
    log_success "ECR authentication successful"

    # Push Leo Container
    log_info "Pushing Leo Container..."
    docker tag "leo-container:${LEO_CONTAINER}-amd64" "${ECR_REGISTRY}/leo:${LEO_CONTAINER}"
    docker push "${ECR_REGISTRY}/leo:${LEO_CONTAINER}"
    log_success "leo:${LEO_CONTAINER}"

    # Push Leo SaaS
    log_info "Pushing Leo SaaS..."
    docker tag "leo-saas-generated:${LEO_SAAS}-amd64" "${ECR_REGISTRY}/leo-saas-app:${LEO_SAAS}"
    docker push "${ECR_REGISTRY}/leo-saas-app:${LEO_SAAS}"
    log_success "leo-saas-app:${LEO_SAAS}"
}

# ============================================
# Read .build-state
# ============================================
if [[ ! -f "$BUILD_STATE" ]]; then
    log_error ".build-state not found!"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

source "$BUILD_STATE"

# In mono-repo, LEO_CONTAINER and LEO_SAAS are the same commit
if [[ -z "$LEO_CONTAINER" || -z "$LEO_SAAS" ]]; then
    log_error ".build-state is invalid (missing commits)"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

# ============================================
# Version Banner
# ============================================
echo ""
echo "=============================================="
echo -e "${CYAN}  DEPLOYING VERSIONS (Mono-Repo)${NC}"
echo "=============================================="
echo ""
echo "  Commit:      $LEO_CONTAINER"
echo "  Built:       $BUILD_TIME"
echo ""
echo "=============================================="
echo ""

# Track deploy time
DEPLOY_START_TIME=$(date +%s)

# ============================================
# Validate AWS credentials
# ============================================
log_info "Validating AWS credentials..."
if ! aws sts get-caller-identity --profile "$AWS_PROFILE" --region "$AWS_REGION" >/dev/null 2>&1; then
    log_error "AWS credentials not configured for profile $AWS_PROFILE"
    log_error "Run: aws sso login --profile $AWS_PROFILE"
    exit 1
fi
log_success "AWS credentials valid"

# ============================================
# Step 1: Build AMD64 Images
# ============================================
echo ""
build_amd64_images

# ============================================
# Step 2: Push to ECR
# ============================================
echo ""
push_to_ecr

# ============================================
# Step 3: Update Task Definitions
# ============================================
echo ""
log_step "Updating task definitions..."
echo "----------------------------------------------"

LEO_SAAS_IMAGE="${ECR_REGISTRY}/leo-saas-app:${LEO_SAAS}"
LEO_CONTAINER_IMAGE="${ECR_REGISTRY}/leo:${LEO_CONTAINER}"

# --- Update Leo Container (generator) task definition ---
log_info "Updating Leo Container task definition..."

# Get current task definition (family name includes CDK hash suffix)
# Filter: contains "LeoTaskDef" but NOT "SaasApp"
LEO_TASK_DEF_ARN=$(aws ecs list-task-definitions \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --output text | tr '\t' '\n' | grep "LeoSaasStackLeoTaskDef" | grep -v "SaasApp" | tail -1)

if [[ -z "$LEO_TASK_DEF_ARN" || "$LEO_TASK_DEF_ARN" == "None" ]]; then
    log_error "Leo Container task definition not found"
    exit 1
fi

# Get task definition JSON and update image
log_info "Fetching task definition: $LEO_TASK_DEF_ARN"
LEO_TASK_DEF=$(aws ecs describe-task-definition \
    --task-definition "$LEO_TASK_DEF_ARN" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'taskDefinition' \
    --output json)

if [[ -z "$LEO_TASK_DEF" ]]; then
    log_error "Failed to fetch Leo Container task definition"
    exit 1
fi

# Update image in container definition
NEW_LEO_TASK_DEF=$(echo "$LEO_TASK_DEF" | jq --arg img "$LEO_CONTAINER_IMAGE" '
    .containerDefinitions[0].image = $img |
    del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)
')

if [[ -z "$NEW_LEO_TASK_DEF" || "$NEW_LEO_TASK_DEF" == "null" ]]; then
    log_error "Failed to modify Leo Container task definition"
    exit 1
fi

# Register new task definition revision
log_info "Registering new Leo Container task definition..."
TEMP_FILE=$(mktemp)
echo "$NEW_LEO_TASK_DEF" > "$TEMP_FILE"
NEW_LEO_TASK_DEF_ARN=$(aws ecs register-task-definition \
    --cli-input-json "file://$TEMP_FILE" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)
rm -f "$TEMP_FILE"

if [[ -z "$NEW_LEO_TASK_DEF_ARN" || "$NEW_LEO_TASK_DEF_ARN" == "None" ]]; then
    log_error "Failed to register Leo Container task definition"
    exit 1
fi

log_success "Leo Container: $(echo "$NEW_LEO_TASK_DEF_ARN" | awk -F: '{print $NF}')"

# --- Update Leo SaaS (orchestrator) task definition ---
log_info "Updating Leo SaaS task definition..."

# Get current task definition (family name includes CDK hash suffix)
SAAS_TASK_DEF_ARN=$(aws ecs list-task-definitions \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --output text | tr '\t' '\n' | grep "LeoSaasStackLeoSaasAppTaskDef" | tail -1)

if [[ -z "$SAAS_TASK_DEF_ARN" || "$SAAS_TASK_DEF_ARN" == "None" ]]; then
    log_error "Leo SaaS task definition not found"
    exit 1
fi

# Get task definition JSON
log_info "Fetching task definition: $SAAS_TASK_DEF_ARN"
SAAS_TASK_DEF=$(aws ecs describe-task-definition \
    --task-definition "$SAAS_TASK_DEF_ARN" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'taskDefinition' \
    --output json)

if [[ -z "$SAAS_TASK_DEF" ]]; then
    log_error "Failed to fetch Leo SaaS task definition"
    exit 1
fi

# Update image AND GENERATOR_IMAGE env var (points to leo container)
NEW_SAAS_TASK_DEF=$(echo "$SAAS_TASK_DEF" | jq \
    --arg img "$LEO_SAAS_IMAGE" \
    --arg gen_img "$LEO_CONTAINER_IMAGE" \
    --arg gen_task "$NEW_LEO_TASK_DEF_ARN" '
    .containerDefinitions[0].image = $img |
    .containerDefinitions[0].environment = [
        .containerDefinitions[0].environment[] |
        if .name == "GENERATOR_IMAGE" then .value = $gen_img
        elif .name == "ECS_TASK_DEFINITION" then .value = $gen_task
        else . end
    ] |
    del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)
')

if [[ -z "$NEW_SAAS_TASK_DEF" || "$NEW_SAAS_TASK_DEF" == "null" ]]; then
    log_error "Failed to modify Leo SaaS task definition"
    exit 1
fi

# Register new task definition revision
log_info "Registering new Leo SaaS task definition..."
TEMP_FILE=$(mktemp)
echo "$NEW_SAAS_TASK_DEF" > "$TEMP_FILE"
NEW_SAAS_TASK_DEF_ARN=$(aws ecs register-task-definition \
    --cli-input-json "file://$TEMP_FILE" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)
rm -f "$TEMP_FILE"

if [[ -z "$NEW_SAAS_TASK_DEF_ARN" || "$NEW_SAAS_TASK_DEF_ARN" == "None" ]]; then
    log_error "Failed to register Leo SaaS task definition"
    exit 1
fi

log_success "Leo SaaS: $(echo "$NEW_SAAS_TASK_DEF_ARN" | awk -F: '{print $NF}')"

# ============================================
# Step 4: Deploy to ECS
# ============================================
echo ""
log_step "Deploying to ECS..."
echo "----------------------------------------------"

log_info "Cluster: $ECS_CLUSTER"

# Look up service name from cluster (CDK generates random suffixes)
log_info "Looking up ECS service..."
ECS_SERVICE_ARN=$(aws ecs list-services \
    --cluster "$ECS_CLUSTER" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'serviceArns[0]' \
    --output text 2>/dev/null)

if [[ -z "$ECS_SERVICE_ARN" || "$ECS_SERVICE_ARN" == "None" ]]; then
    log_error "No ECS service found in cluster $ECS_CLUSTER"
    exit 1
fi

# Extract service name from ARN
ECS_SERVICE=$(echo "$ECS_SERVICE_ARN" | awk -F'/' '{print $NF}')
log_info "Service: $ECS_SERVICE"

# Check if ECS service exists
log_info "Checking ECS service status..."
SERVICE_STATUS=$(aws ecs describe-services \
    --cluster "$ECS_CLUSTER" \
    --services "$ECS_SERVICE" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'services[0].status' \
    --output text 2>/dev/null)

if [[ "$SERVICE_STATUS" != "ACTIVE" ]]; then
    log_error "ECS service $ECS_SERVICE is not active (status: $SERVICE_STATUS)"
    exit 1
fi
log_success "Service is active"

# Update service with new task definition AND force deployment
log_info "Updating service with new task definition..."
aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "$ECS_SERVICE" \
    --task-definition "$NEW_SAAS_TASK_DEF_ARN" \
    --force-new-deployment \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --output text >/dev/null

log_success "Deployment initiated!"
echo ""

# Poll deployment status
ELAPSED=0

log_info "Waiting for deployment to complete (timeout: ${DEPLOY_TIMEOUT}s)..."

while [[ $ELAPSED -lt $DEPLOY_TIMEOUT ]]; do
    # Get deployment info
    DEPLOYMENTS_JSON=$(aws ecs describe-services \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" \
        --query 'services[0].deployments' \
        --output json 2>/dev/null)

    # Parse deployment info
    PRIMARY_RUNNING=$(echo "$DEPLOYMENTS_JSON" | jq -r '.[0].runningCount // 0')
    PRIMARY_DESIRED=$(echo "$DEPLOYMENTS_JSON" | jq -r '.[0].desiredCount // 1')
    PRIMARY_STATUS=$(echo "$DEPLOYMENTS_JSON" | jq -r '.[0].rolloutState // "UNKNOWN"')
    DEPLOYMENT_COUNT=$(echo "$DEPLOYMENTS_JSON" | jq 'length')

    # Show progress
    log_info "[${ELAPSED}s] Running: $PRIMARY_RUNNING/$PRIMARY_DESIRED | Status: $PRIMARY_STATUS | Deployments: $DEPLOYMENT_COUNT"

    # Check completion: PRIMARY has desired count AND only 1 deployment remains (old one drained)
    if [[ "$PRIMARY_RUNNING" == "$PRIMARY_DESIRED" && "$DEPLOYMENT_COUNT" == "1" && "$PRIMARY_STATUS" == "COMPLETED" ]]; then
        echo ""
        log_success "Deployment complete!"
        break
    fi

    # Check for failure
    if [[ "$PRIMARY_STATUS" == "FAILED" ]]; then
        echo ""
        log_error "Deployment failed!"
        log_error "Check logs: aws logs tail /aws/ecs/leo-saas-app --profile $AWS_PROFILE --follow"
        exit 1
    fi

    sleep $POLL_INTERVAL
    ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

# Timeout check
if [[ $ELAPSED -ge $DEPLOY_TIMEOUT ]]; then
    echo ""
    log_error "Deployment timed out after ${DEPLOY_TIMEOUT}s"
    log_error "Check logs: aws logs tail /aws/ecs/leo-saas-app --profile $AWS_PROFILE --follow"
    log_error "Check deployments: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --profile $AWS_PROFILE --query 'services[0].deployments'"
    exit 1
fi

# Wait for health check
log_info "Waiting for health check (10s)..."
sleep 10

# ============================================
# Invalidate CloudFront Cache
# ============================================
echo ""
log_info "Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --profile "$AWS_PROFILE" \
    --query 'Invalidation.Id' \
    --output text 2>/dev/null)

if [[ -n "$INVALIDATION_ID" ]]; then
    log_success "Invalidation created: $INVALIDATION_ID"
else
    log_warn "CloudFront invalidation failed (non-fatal)"
fi

# ============================================
# Kill Stale Generator Tasks
# ============================================
echo ""
log_info "Checking for stale generator tasks..."

# Get the expected generator task definition ARN (the one we just registered)
EXPECTED_GEN_TASK_DEF="$NEW_LEO_TASK_DEF_ARN"

# List all generator tasks
GENERATOR_TASKS=$(aws ecs list-tasks \
    --cluster "$ECS_CLUSTER" \
    --family "LeoSaasStackLeoTaskDef0259C2DC" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'taskArns[]' \
    --output text 2>/dev/null)

KILLED_COUNT=0
if [[ -n "$GENERATOR_TASKS" && "$GENERATOR_TASKS" != "None" ]]; then
    for TASK_ARN in $GENERATOR_TASKS; do
        # Get task's task definition
        TASK_DEF=$(aws ecs describe-tasks \
            --cluster "$ECS_CLUSTER" \
            --tasks "$TASK_ARN" \
            --profile "$AWS_PROFILE" \
            --region "$AWS_REGION" \
            --query 'tasks[0].taskDefinitionArn' \
            --output text 2>/dev/null)

        # If task definition doesn't match expected, kill it
        if [[ "$TASK_DEF" != "$EXPECTED_GEN_TASK_DEF" ]]; then
            TASK_ID=$(echo "$TASK_ARN" | awk -F/ '{print $NF}')
            log_warn "Killing stale generator task: $TASK_ID (using old task def)"
            aws ecs stop-task \
                --cluster "$ECS_CLUSTER" \
                --task "$TASK_ARN" \
                --reason "Stale task with old image - killed by deploy script" \
                --profile "$AWS_PROFILE" \
                --region "$AWS_REGION" \
                --output text >/dev/null 2>&1
            KILLED_COUNT=$((KILLED_COUNT + 1))
        fi
    done
fi

if [[ $KILLED_COUNT -gt 0 ]]; then
    log_success "Killed $KILLED_COUNT stale generator task(s)"
else
    log_info "No stale generator tasks found"
fi

# ============================================
# Verify Deployed Versions (via ECS)
# ============================================
echo ""
log_info "Verifying deployed versions..."

# Get Leo SaaS running task definition from service
RUNNING_SAAS_TASK_DEF=$(aws ecs describe-services \
    --cluster "$ECS_CLUSTER" \
    --services "$ECS_SERVICE" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'services[0].taskDefinition' \
    --output text 2>/dev/null)

# Extract Leo SaaS image tag
RUNNING_SAAS_IMAGE=$(aws ecs describe-task-definition \
    --task-definition "$RUNNING_SAAS_TASK_DEF" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'taskDefinition.containerDefinitions[0].image' \
    --output text 2>/dev/null)
RUNNING_SAAS_TAG=$(echo "$RUNNING_SAAS_IMAGE" | awk -F: '{print $NF}')

# Extract Leo Container (generator) image from GENERATOR_IMAGE env var
RUNNING_GENERATOR_IMAGE=$(aws ecs describe-task-definition \
    --task-definition "$RUNNING_SAAS_TASK_DEF" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query 'taskDefinition.containerDefinitions[0].environment[?name==`GENERATOR_IMAGE`].value' \
    --output text 2>/dev/null)
RUNNING_GENERATOR_TAG=$(echo "$RUNNING_GENERATOR_IMAGE" | awk -F: '{print $NF}')

# Calculate elapsed time
DEPLOY_END_TIME=$(date +%s)
ELAPSED=$((DEPLOY_END_TIME - DEPLOY_START_TIME))
ELAPSED_MIN=$((ELAPSED / 60))
ELAPSED_SEC=$((ELAPSED % 60))

# Print summary
echo ""
echo "=============================================="
echo -e "${GREEN}  DEPLOY COMPLETE${NC}"
echo "=============================================="
echo ""
echo "  Leo SaaS:"
echo "    Expected:  $LEO_SAAS"
echo "    Running:   $RUNNING_SAAS_TAG"
if [[ "$RUNNING_SAAS_TAG" == "$LEO_SAAS" ]]; then
    echo -e "    Status:    ${GREEN}MATCH${NC}"
else
    echo -e "    Status:    ${RED}MISMATCH${NC}"
fi
echo ""
echo "  Leo Container:"
echo "    Expected:  $LEO_CONTAINER"
echo "    Running:   $RUNNING_GENERATOR_TAG"
if [[ "$RUNNING_GENERATOR_TAG" == "$LEO_CONTAINER" ]]; then
    echo -e "    Status:    ${GREEN}MATCH${NC}"
else
    echo -e "    Status:    ${RED}MISMATCH${NC}"
fi
echo ""
echo "  URL:     $CLOUDFRONT_URL"
echo "  Elapsed: ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo ""
echo "=============================================="
echo ""
