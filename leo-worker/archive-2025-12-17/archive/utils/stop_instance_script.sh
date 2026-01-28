#!/bin/bash

# Stop Instance Script
# Safely stops your development instance for the night

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

echo -e "${BLUE}🛑 Stop Development Instance${NC}"
echo "============================"

# Auto-detect instance ID using Elastic IP
print_info "Finding your instance..."
if [ -n "$AWS_PROFILE" ]; then
    PROFILE_ARG="--profile $AWS_PROFILE"
else
    PROFILE_ARG=""
fi
INSTANCE_ID=$(aws ec2 describe-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --filters "Name=instance-state-name,Values=running" \
    --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress]' \
    --output text | grep "$ELASTIC_IP" | awk '{print $1}')

if [ -z "$INSTANCE_ID" ]; then
    print_error "Could not find running instance with Elastic IP $ELASTIC_IP"
    
    # Check if instance is already stopped
    STOPPED_INSTANCE=$(aws ec2 describe-instances \
        $PROFILE_ARG \
        --region $AWS_REGION \
        --filters "Name=instance-state-name,Values=stopped" \
        --query 'Reservations[*].Instances[*].[InstanceId,PublicIpAddress]' \
        --output text | grep "$ELASTIC_IP" | awk '{print $1}' || echo "")
    
    if [ -n "$STOPPED_INSTANCE" ]; then
        print_status "Instance $STOPPED_INSTANCE is already stopped"
        echo ""
        echo "💰 You're already saving money!"
        echo "💤 Good night!"
        exit 0
    else
        print_error "Could not find any instance with your Elastic IP"
        exit 1
    fi
fi

print_status "Found running instance: $INSTANCE_ID"

# Get instance details
INSTANCE_NAME=$(aws ec2 describe-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].Tags[?Key==`Name`].Value' \
    --output text 2>/dev/null || echo "No name tag")

INSTANCE_TYPE=$(aws ec2 describe-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].InstanceType' \
    --output text)

# Calculate cost savings
case $INSTANCE_TYPE in
    "m5.2xlarge")
        HOURLY_COST="0.384"
        DAILY_SAVINGS="9.22"
        ;;
    "c5.2xlarge")
        HOURLY_COST="0.340"
        DAILY_SAVINGS="8.16"
        ;;
    "c5.4xlarge")
        HOURLY_COST="0.680"
        DAILY_SAVINGS="16.32"
        ;;
    *)
        HOURLY_COST="~0.40"
        DAILY_SAVINGS="~9.60"
        ;;
esac

echo ""
echo "Instance Details:"
echo "  Instance ID: $INSTANCE_ID"
echo "  Instance Name: $INSTANCE_NAME"
echo "  Instance Type: $INSTANCE_TYPE"
echo "  Hourly Cost: \$$HOURLY_COST"
echo "  Elastic IP: $ELASTIC_IP (will remain attached)"
echo ""

# Cost savings info
print_info "Cost Savings by Stopping:"
echo "  Tonight (12 hours): ~\$$DAILY_SAVINGS"
echo "  Storage cost while stopped: ~\$0.07/day (20GB EBS)"
echo "  Elastic IP cost while stopped: \$3.65/month"
echo ""

# Confirm stop
print_warning "This will:"
echo "  ✓ Stop the instance (preserve all data)"
echo "  ✓ Keep Elastic IP attached (no config changes needed)"
echo "  ✓ Save ~\$$DAILY_SAVINGS tonight"
echo "  ✓ Ready to start again tomorrow"
echo ""
read -p "Stop instance for the night? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled. Instance remains running."
    exit 0
fi

# Stop the instance
print_info "Stopping instance..."
aws ec2 stop-instances \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID \
    >/dev/null

print_status "Stop initiated"

# Wait for instance to stop
print_info "Waiting for instance to fully stop..."
aws ec2 wait instance-stopped \
    $PROFILE_ARG \
    --region $AWS_REGION \
    --instance-ids $INSTANCE_ID

print_status "Instance stopped successfully"

# Create restart instructions
cat > ~/restart-tomorrow.txt << EOF
Tomorrow Morning Restart Instructions
====================================
Date stopped: $(date)
Instance ID: $INSTANCE_ID
Elastic IP: $ELASTIC_IP

Quick Start Commands:
-------------------
# Start the instance
aws ec2 start-instances $PROFILE_ARG --region $AWS_REGION --instance-ids $INSTANCE_ID

# Wait for it to boot (~30 seconds)
aws ec2 wait instance-running $PROFILE_ARG --region $AWS_REGION --instance-ids $INSTANCE_ID

# Connect (same as always)
ssh -A -i $KEY_PATH ec2-user@$ELASTIC_IP

One-liner:
----------
aws ec2 start-instances $PROFILE_ARG --region $AWS_REGION --instance-ids $INSTANCE_ID && echo "Starting... wait 30 seconds then connect"

Everything will be exactly as you left it:
- All your files and projects
- Claude Code CLI authenticated
- Git authentication helpers ready
- Same IP address ($ELASTIC_IP)

Cost Savings Tonight: ~\$$DAILY_SAVINGS
EOF

print_status "Created ~/restart-tomorrow.txt with restart instructions"

echo ""
echo "=========================================="
print_status "Instance Stopped Successfully!"
echo ""
echo "💰 Cost Savings:"
echo "  Tonight: ~\$$DAILY_SAVINGS saved"
echo "  Running cost: \$0.00/hour"
echo "  Storage cost: ~\$0.07/day"
echo ""
echo "🌅 Tomorrow Morning:"
echo "  aws ec2 start-instances $PROFILE_ARG --region $AWS_REGION --instance-ids $INSTANCE_ID"
echo "  # Wait ~30 seconds"
echo "  ssh -A -i $KEY_PATH ec2-user@$ELASTIC_IP"
echo ""
echo "📋 Restart instructions saved to: ~/restart-tomorrow.txt"
echo ""
print_status "💤 Good night! Your development environment is safely stored."
echo ""
echo "✨ Everything will be exactly as you left it when you restart!"