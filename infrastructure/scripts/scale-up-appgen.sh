#!/bin/bash
set -e

# Scale up the ECS service to 1 task (wake up)
# This starts the service and makes it available for use

CLUSTER="app-gen-saas-cluster"
REGION="us-east-1"
PROFILE="${AWS_PROFILE:-jake-dev}"
DESIRED_COUNT=1  # Default desired count

echo "🚀 Scaling up App-Gen-SaaS service..."
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

if [ "$CURRENT_COUNT" == "$DESIRED_COUNT" ]; then
  RUNNING_COUNT=$(aws ecs describe-services \
    --cluster "$CLUSTER" \
    --services "$SERVICE_NAME" \
    --profile "$PROFILE" \
    --region "$REGION" \
    --query 'services[0].runningCount' \
    --output text)

  if [ "$RUNNING_COUNT" == "$DESIRED_COUNT" ]; then
    echo "✅ Service is already scaled up to $DESIRED_COUNT and running"

    # Get the ALB URL
    ALB_URL=$(aws cloudformation describe-stacks \
      --stack-name AppGenSaasStack \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'Stacks[0].Outputs[?OutputKey==`URL`].OutputValue' \
      --output text 2>/dev/null || echo "")

    if [ -n "$ALB_URL" ]; then
      echo ""
      echo "🌐 Service URL: $ALB_URL"
    fi

    exit 0
  fi
fi

# Scale up to desired count
echo "⏫ Scaling up to $DESIRED_COUNT..."
aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICE_NAME" \
  --desired-count "$DESIRED_COUNT" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --query 'service.[serviceName,desiredCount,runningCount]' \
  --output text

echo ""
echo "✅ Scale up initiated!"
echo ""
echo "⏳ Waiting for service to become healthy..."
echo "   (This takes about 60-90 seconds for health checks to pass)"
echo ""

# Wait for service to stabilize
WAIT_TIME=0
MAX_WAIT=120

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
  RUNNING_COUNT=$(aws ecs describe-services \
    --cluster "$CLUSTER" \
    --services "$SERVICE_NAME" \
    --profile "$PROFILE" \
    --region "$REGION" \
    --query 'services[0].runningCount' \
    --output text)

  if [ "$RUNNING_COUNT" == "$DESIRED_COUNT" ]; then
    echo ""
    echo "✅ Service is up and running!"

    # Get the ALB URL
    ALB_URL=$(aws cloudformation describe-stacks \
      --stack-name AppGenSaasStack \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'Stacks[0].Outputs[?OutputKey==`URL`].OutputValue' \
      --output text 2>/dev/null || echo "")

    if [ -n "$ALB_URL" ]; then
      echo ""
      echo "🌐 Service URL: $ALB_URL"
      echo "💡 The service may take another 30 seconds to fully pass health checks"
    fi

    exit 0
  fi

  echo -n "."
  sleep 5
  WAIT_TIME=$((WAIT_TIME + 5))
done

echo ""
echo "⚠️  Service is starting but not yet healthy. Check status with:"
echo "   aws ecs describe-services --cluster $CLUSTER --services $SERVICE_NAME --profile $PROFILE --region $REGION"
