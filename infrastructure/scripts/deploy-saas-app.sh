#!/bin/bash
# ============================================
# Leo SaaS - ECS Deployment Script
# ============================================
# Updates ECS service with new task definition
# Usage: ./scripts/deploy-saas-app.sh [commit-hash]
# Example: ./scripts/deploy-saas-app.sh f25b089

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
CLUSTER_NAME="leo-saas-cluster"
SERVICE_NAME="LeoSaasStack-LeoSaasServiceCEDED822-lKHLHaTZaKB1"
TASK_FAMILY="LeoSaasStackLeoSaasAppTaskDef72B4FA21"
ECR_REGISTRY="855235011337.dkr.ecr.us-east-1.amazonaws.com"
IMAGE_NAME="leo-saas-app"

# Get commit hash (use provided or auto-detect from git)
if [ -n "$1" ]; then
    GIT_SHA="$1"
else
    # Try to get from leo-saas repo
    if [ -d "/home/jake/LEO/leo-saas/.git" ]; then
        cd /home/jake/LEO/leo-saas
        GIT_SHA=$(git rev-parse --short HEAD)
    else
        echo "Error: No commit hash provided and not in a git repository"
        echo "Usage: $0 <commit-hash>"
        exit 1
    fi
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Leo SaaS - ECS Deployment${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Commit:${NC} ${GIT_SHA}"
echo -e "${GREEN}Cluster:${NC} ${CLUSTER_NAME}"
echo -e "${GREEN}Service:${NC} ${SERVICE_NAME}"
echo -e "${GREEN}Image:${NC} ${ECR_REGISTRY}/${IMAGE_NAME}:${GIT_SHA}"
echo -e "${GREEN}AWS Profile:${NC} ${AWS_PROFILE}"
echo ""

# Step 1: Get current task definition
echo -e "${YELLOW}Step 1/4: Fetching current task definition...${NC}"
TASK_DEF_JSON=$(aws ecs describe-task-definition \
  --task-definition ${TASK_FAMILY} \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE} \
  --query 'taskDefinition' \
  --output json)

echo -e "${GREEN}✅ Current task definition retrieved${NC}"
echo ""

# Step 2: Create new task definition with updated image
echo -e "${YELLOW}Step 2/4: Creating new task definition revision...${NC}"

# Extract the container definitions and update the image
NEW_CONTAINER_DEFS=$(echo $TASK_DEF_JSON | jq \
  --arg IMAGE "${ECR_REGISTRY}/${IMAGE_NAME}:${GIT_SHA}" \
  '.containerDefinitions[0].image = $IMAGE | .containerDefinitions')

# Extract other required fields
TASK_ROLE_ARN=$(echo $TASK_DEF_JSON | jq -r '.taskRoleArn // empty')
EXECUTION_ROLE_ARN=$(echo $TASK_DEF_JSON | jq -r '.executionRoleArn')
NETWORK_MODE=$(echo $TASK_DEF_JSON | jq -r '.networkMode')
CPU=$(echo $TASK_DEF_JSON | jq -r '.cpu // empty')
MEMORY=$(echo $TASK_DEF_JSON | jq -r '.memory // empty')
REQUIRES_COMPATIBILITIES=$(echo $TASK_DEF_JSON | jq -r '.requiresCompatibilities | join(",")')

# Build the register command
REGISTER_CMD="aws ecs register-task-definition \
  --family ${TASK_FAMILY} \
  --container-definitions '${NEW_CONTAINER_DEFS}' \
  --execution-role-arn ${EXECUTION_ROLE_ARN} \
  --network-mode ${NETWORK_MODE} \
  --requires-compatibilities ${REQUIRES_COMPATIBILITIES} \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE}"

# Add optional fields if they exist
[ -n "$TASK_ROLE_ARN" ] && REGISTER_CMD="${REGISTER_CMD} --task-role-arn ${TASK_ROLE_ARN}"
[ -n "$CPU" ] && REGISTER_CMD="${REGISTER_CMD} --cpu ${CPU}"
[ -n "$MEMORY" ] && REGISTER_CMD="${REGISTER_CMD} --memory ${MEMORY}"

# Register new task definition
eval $REGISTER_CMD > /tmp/new-task-def.json

NEW_REVISION=$(cat /tmp/new-task-def.json | jq -r '.taskDefinition.revision')
echo -e "${GREEN}✅ New task definition created: ${TASK_FAMILY}:${NEW_REVISION}${NC}"
echo ""

# Step 3: Update ECS service
echo -e "${YELLOW}Step 3/4: Updating ECS service...${NC}"
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --task-definition ${TASK_FAMILY}:${NEW_REVISION} \
  --force-new-deployment \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE} \
  > /dev/null

echo -e "${GREEN}✅ Service update initiated${NC}"
echo ""

# Step 4: Wait for deployment (optional)
echo -e "${YELLOW}Step 4/4: Waiting for deployment to stabilize...${NC}"
echo -e "${BLUE}This may take 2-5 minutes...${NC}"
echo ""

aws ecs wait services-stable \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE}

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""

# Get service status
echo -e "${YELLOW}Service Status:${NC}"
aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --region ${AWS_REGION} \
  --profile ${AWS_PROFILE} \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,TaskDefinition:taskDefinition}' \
  --output table

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Application URL:${NC}"
echo "  http://LeoSaa-LeoSa-2Ix1kNIp5Qs1-319629496.us-east-1.elb.amazonaws.com/"
echo ""
echo -e "${BLUE}Deployed Image:${NC}"
echo "  ${ECR_REGISTRY}/${IMAGE_NAME}:${GIT_SHA}"
echo ""
echo -e "${YELLOW}Check logs:${NC}"
echo "  ./scripts/get-recent-logs.sh"
echo ""
