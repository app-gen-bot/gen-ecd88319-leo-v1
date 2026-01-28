#!/bin/bash
set -e

# Scale down the ECS service to 0 tasks (sleep mode)
# This stops all running tasks and reduces costs to near-zero

CLUSTER="leo-saas-cluster"
REGION="us-east-1"
PROFILE="${AWS_PROFILE:-jake-dev}"

echo "🛑 Scaling down Leo-SaaS service..."
echo "========================================"

# Get the service name
SERVICE=$(aws ecs list-services \
  --cluster "$CLUSTER" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query 'serviceArns[0]' \
  --output text)

if [ -z "$SERVICE" ] || [ "$SERVICE" == "None" ]; then
  echo "❌ Error: Could not find service in cluster $CLUSTER"
  exit 1
fi

# Extract service name from ARN
SERVICE_NAME=$(echo "$SERVICE" | awk -F'/' '{print $NF}')

echo "📋 Service: $SERVICE_NAME"

# Get current desired count
CURRENT_COUNT=$(aws ecs describe-services \
  --cluster "$CLUSTER" \
  --services "$SERVICE_NAME" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query 'services[0].desiredCount' \
  --output text)

echo "📊 Current desired count: $CURRENT_COUNT"

if [ "$CURRENT_COUNT" == "0" ]; then
  echo "✅ Service is already scaled down to 0"
  exit 0
fi

# Scale down to 0
echo "⏬ Scaling down to 0..."
aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICE_NAME" \
  --desired-count 0 \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query 'service.[serviceName,desiredCount,runningCount]' \
  --output text

echo ""
echo "✅ Scale down initiated!"
echo ""
echo "💡 The service will stop all tasks within 1-2 minutes."
echo "💰 Cost savings: ~$0.024/hour (~$17/month) while scaled down"
echo ""
echo "To scale back up, run: ./scripts/scale-up-leo.sh"
