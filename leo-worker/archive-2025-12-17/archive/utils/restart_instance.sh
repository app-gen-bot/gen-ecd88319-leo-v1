#!/bin/bash

# Restart Instance Script
# Automatically finds and starts your development instance

set -e

# Configuration
AWS_PROFILE=""  # Add your AWS profile if using one
AWS_REGION="us-east-1"
ELASTIC_IP="52.3.82.218"
KEY_PATH="~/labhesh-remote-work-key.pem"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

echo -e "${BLUE}🚀 Restart Development Instance${NC}"
echo "==============================="

# Method 1: Find by Elastic IP
print_info "Looking for instance with Elastic IP $ELASTIC_IP..."
if [ -n "$AWS_PROFILE" ]; then
    PROFILE_ARG="--profile $AWS_PROFILE"
else
    PROFILE_ARG=""
fi
INSTANCE_ID=$(aws ec2 describe-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --filters "Name=ip-address,Values=$ELASTIC_IP" \
    --query 'Reservations[*].Instances[*].InstanceId' \
    --output text 2>/dev/null || echo "")

# Method 2: If not found by IP, look for stopped instances with your security group
if [ -z "$INSTANCE_ID" ]; then
    print_info "Not found by IP, checking stopped instances..."
    INSTANCE_INFO=$(aws ec2 describe-instances \
        $PROFILE_ARG \
        --region $AWS_REGION \
        --filters "Name=instance-state-name,Values=stopped" "Name=tag:Name,Values=*remote-work*" \
        --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0]]' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$INSTANCE_INFO" ]; then
        echo ""
        print_info "Found stopped instances:"
        echo "$INSTANCE_INFO"
        echo ""
        read -p "Enter the instance ID you want to start: " INSTANCE_ID
    fi
fi

# Method 3: If still not found, show all your instances
if [ -z "$INSTANCE_ID" ]; then
    print_warning "Could not auto-detect instance. Here are all your instances:"
    aws ec2 describe-instances \
        $PROFILE_ARG \
        --region $AWS_REGION \
        --query 'Reservations[*].Instances[*].[InstanceId,State.Name,Tags[?Key==`Name`].Value|[0],PublicIpAddress]' \
        --output table
    
    echo ""
    read -p "Enter the instance ID you want to start: " INSTANCE_ID
fi

if [ -z "$INSTANCE_ID" ]; then
    print_error "No instance ID provided"
    exit 1
fi

print_status "Found instance: $INSTANCE_ID"

# Get current state
CURRENT_STATE=$(aws ec2 describe-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].State.Name' \
    --output text)

echo "Current state: $CURRENT_STATE"

# Handle different states
case $CURRENT_STATE in
    "running")
        print_status "Instance is already running!"
        CURRENT_IP=$(aws ec2 describe-instances \
            --profile $AWS_PROFILE \
            --region $AWS_REGION \
            --instance-ids $INSTANCE_ID \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text)
        echo ""
        echo "Connect with:"
        echo "  ssh -A -i $KEY_PATH ec2-user@$CURRENT_IP"
        exit 0
        ;;
    "stopped")
        print_info "Instance is stopped. Starting now..."
        ;;
    "stopping")
        print_warning "Instance is currently stopping. Please wait a moment and try again."
        exit 1
        ;;
    "pending"|"starting")
        print_info "Instance is already starting..."
        ;;
    *)
        print_error "Instance is in unexpected state: $CURRENT_STATE"
        exit 1
        ;;
esac

# Start the instance
if [ "$CURRENT_STATE" = "stopped" ]; then
    print_info "Starting instance..."
    aws ec2 start-instances \
        $PROFILE_ARG \
        --region $AWS_REGION \
        --instance-ids $INSTANCE_ID \
        >/dev/null
    
    print_status "Start command sent"
fi

# Wait for instance to be running
print_info "Waiting for instance to be running (this takes ~30 seconds)..."
aws ec2 wait instance-running \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID

print_status "Instance is running!"

# Get the current IP address
CURRENT_IP=$(aws ec2 describe-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

# Check if Elastic IP is attached
if [ "$CURRENT_IP" = "$ELASTIC_IP" ]; then
    print_status "Elastic IP is properly attached"
else
    print_warning "Elastic IP not attached. Current IP: $CURRENT_IP"
    print_info "You can associate your Elastic IP if needed:"
    echo "  aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id eipalloc-0dc15c29484d883d4"
fi

# Get instance details
INSTANCE_TYPE=$(aws ec2 describe-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].InstanceType' \
    --output text)

INSTANCE_NAME=$(aws ec2 describe-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].Tags[?Key==`Name`].Value' \
    --output text 2>/dev/null || echo "No name tag")

echo ""
echo "=========================================="
print_status "Instance Started Successfully!"
echo ""
echo "Instance Details:"
echo "  Instance ID: $INSTANCE_ID"
echo "  Instance Name: $INSTANCE_NAME"
echo "  Instance Type: $INSTANCE_TYPE"
echo "  Public IP: $CURRENT_IP"
echo ""
echo "🔗 Connect with:"
echo "  ssh -A -i $KEY_PATH ec2-user@$CURRENT_IP"
echo ""
echo "🎯 Ready for development!"
echo "  - Claude Code CLI authenticated"
echo "  - Git helpers available (gclone, gpull, gpush)"
echo "  - Python UV environment ready"
echo "  - All your files preserved"
echo ""
print_info "Happy coding! 🚀"