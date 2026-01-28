#!/bin/bash
# ============================================
# Leo SaaS - Log Viewer
# ============================================
# View and analyze logs from CloudFront and ECS.
#
# Usage:
#   ./scripts/logs.sh tail [service]     # Stream ECS logs (leo-saas-app or leo)
#   ./scripts/logs.sh access [hours]     # Download CloudFront access logs
#   ./scripts/logs.sh attacks            # Analyze for suspicious patterns
#   ./scripts/logs.sh summary            # Show log locations and retention

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
S3_LOG_BUCKET="leo-saas-access-logs-855235011337"
S3_LOG_PREFIX="cloudfront/"
TEMP_DIR="/tmp/leo-logs"

# Colors
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

# ============================================
# Commands
# ============================================

cmd_tail() {
    local service="${1:-leo-saas-app}"
    local log_group="/ecs/$service"

    log_info "Streaming logs from $log_group..."
    log_info "Press Ctrl+C to stop"
    echo ""

    aws logs tail "$log_group" \
        --follow \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION"
}

cmd_access() {
    local hours="${1:-24}"
    local cutoff_time=$(date -v-${hours}H +%Y-%m-%d 2>/dev/null || date -d "$hours hours ago" +%Y-%m-%d)

    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"

    log_info "Downloading CloudFront access logs from last $hours hours..."
    log_info "Bucket: s3://$S3_LOG_BUCKET/$S3_LOG_PREFIX"

    # List and download recent logs
    aws s3 ls "s3://$S3_LOG_BUCKET/$S3_LOG_PREFIX" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" | \
    while read -r line; do
        file=$(echo "$line" | awk '{print $4}')
        if [[ -n "$file" ]]; then
            aws s3 cp "s3://$S3_LOG_BUCKET/$S3_LOG_PREFIX$file" . \
                --profile "$AWS_PROFILE" \
                --region "$AWS_REGION" \
                --quiet 2>/dev/null || true
        fi
    done

    # Decompress
    gunzip -f *.gz 2>/dev/null || true

    log_success "Downloaded logs to $TEMP_DIR"
    echo ""

    # Show summary
    local total_requests=$(cat *.log 2>/dev/null | wc -l | tr -d ' ')
    log_info "Total requests: $total_requests"

    echo ""
    log_info "Top 20 requested paths:"
    cat *.log 2>/dev/null | awk '{print $8}' | sort | uniq -c | sort -rn | head -20

    echo ""
    log_info "Status code distribution:"
    cat *.log 2>/dev/null | awk '{print $9}' | sort | uniq -c | sort -rn
}

cmd_attacks() {
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"

    if [[ ! -f *.log ]] 2>/dev/null; then
        log_warn "No logs found. Run './scripts/logs.sh access' first."
        exit 1
    fi

    echo ""
    echo "=============================================="
    echo -e "${CYAN}  ATTACK PATTERN ANALYSIS${NC}"
    echo "=============================================="

    echo ""
    log_info "Suspicious paths (404s on common attack vectors):"
    cat *.log 2>/dev/null | awk '$9 == "404" {print $8}' | \
    grep -iE '(wp-admin|wp-login|\.php|\.env|\.git|admin|config|backup|shell|eval|passwd|etc/|\.asp)' | \
    sort | uniq -c | sort -rn | head -20

    echo ""
    log_info "Top IPs with 404 errors:"
    cat *.log 2>/dev/null | awk '$9 == "404" {print $5}' | sort | uniq -c | sort -rn | head -10

    echo ""
    log_info "Top IPs with 403 errors (blocked):"
    cat *.log 2>/dev/null | awk '$9 == "403" {print $5}' | sort | uniq -c | sort -rn | head -10

    echo ""
    log_info "Suspicious user agents:"
    cat *.log 2>/dev/null | awk -F'"' '{print $6}' | \
    grep -iE '(sqlmap|nikto|nmap|scanner|curl|wget|python|bot|crawler)' | \
    sort | uniq -c | sort -rn | head -10

    echo ""
    log_info "Request rate by IP (potential DDoS):"
    cat *.log 2>/dev/null | awk '{print $5}' | sort | uniq -c | sort -rn | head -10
}

cmd_summary() {
    echo ""
    echo "=============================================="
    echo -e "${CYAN}  LEO SAAS LOGGING INFRASTRUCTURE${NC}"
    echo "=============================================="
    echo ""

    echo "CloudFront Access Logs:"
    echo "  Location: s3://$S3_LOG_BUCKET/$S3_LOG_PREFIX"
    echo "  Retention: 90 days"
    echo "  Format: Standard CloudFront log format"
    echo ""

    echo "ECS Container Logs (CloudWatch):"
    echo "  leo-saas-app: /ecs/leo-saas-app (7 day retention)"
    echo "  leo generator: /ecs/leo (7 day retention)"
    echo ""

    echo "ALB Logs:"
    echo "  Status: NOT CONFIGURED (backlog item)"
    echo ""

    echo "Commands:"
    echo "  ./scripts/logs.sh tail              # Stream leo-saas-app logs"
    echo "  ./scripts/logs.sh tail leo          # Stream leo generator logs"
    echo "  ./scripts/logs.sh access 24         # Download last 24h CloudFront logs"
    echo "  ./scripts/logs.sh attacks           # Analyze attack patterns"
    echo ""

    echo "Direct AWS commands:"
    echo "  aws logs tail /ecs/leo-saas-app --follow --profile $AWS_PROFILE"
    echo "  aws s3 ls s3://$S3_LOG_BUCKET/$S3_LOG_PREFIX --profile $AWS_PROFILE"
}

# ============================================
# Main
# ============================================

case "${1:-summary}" in
    tail)
        cmd_tail "$2"
        ;;
    access)
        cmd_access "$2"
        ;;
    attacks)
        cmd_attacks
        ;;
    summary|help|"")
        cmd_summary
        ;;
    *)
        log_error "Unknown command: $1"
        cmd_summary
        exit 1
        ;;
esac
