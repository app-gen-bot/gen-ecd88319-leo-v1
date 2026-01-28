#!/bin/bash

# Smart Connect Script  
# Connects to your development instance with helpful error handling

# Configuration
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

echo -e "${BLUE}🔗 Connecting to Development Instance${NC}"
print_info "Connecting to ec2-user@$ELASTIC_IP with SSH agent forwarding..."

# Connect with proper error handling
if ssh -A -i $KEY_PATH -o ConnectTimeout=10 ec2-user@$ELASTIC_IP; then
    print_status "SSH session ended normally"
else
    EXIT_CODE=$?
    echo ""
    case $EXIT_CODE in
        255)
            print_error "Connection failed - instance might be stopped"
            print_warning "Try: ./restart_instance.sh"
            ;;
        130)
            print_info "Connection interrupted (Ctrl+C)"
            ;;
        *)
            print_error "SSH connection failed (exit code: $EXIT_CODE)"
            print_warning "Check: ./restart_instance.sh or verify key permissions"
            ;;
    esac
fi