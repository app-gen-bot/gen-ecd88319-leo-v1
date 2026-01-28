#!/bin/bash
#
# inspect-efs.sh - Inspect EFS contents on AWS Fargate
#
# Usage:
#   ./scripts/inspect-efs.sh                    # List all app directories
#   ./scripts/inspect-efs.sh <app_id>           # Inspect specific app
#   ./scripts/inspect-efs.sh <app_id> logs      # Show logs directory
#
# Requires: AWS CLI, jq, ECS Exec enabled on cluster
#

set -e

PROFILE="${AWS_PROFILE:-jake-dev}"
CLUSTER="leo-saas-cluster"
EFS_ID="fs-066c3090c34557987"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check for running tasks with EFS mounted
get_task_with_efs() {
    # First try to find a running generator task (has EFS)
    TASK_ARN=$(aws ecs list-tasks --cluster "$CLUSTER" --profile "$PROFILE" 2>/dev/null | \
        jq -r '.taskArns[]' | head -1)

    if [ -z "$TASK_ARN" ]; then
        log_error "No running tasks found in cluster $CLUSTER"
        log_info "Start a generation or deploy Leo SaaS first"
        exit 1
    fi

    echo "$TASK_ARN"
}

# Execute command in container
exec_in_container() {
    local TASK_ARN="$1"
    local CMD="$2"

    # Get task ID from ARN
    TASK_ID=$(echo "$TASK_ARN" | awk -F'/' '{print $NF}')

    aws ecs execute-command \
        --cluster "$CLUSTER" \
        --task "$TASK_ID" \
        --container "leo" \
        --interactive \
        --command "$CMD" \
        --profile "$PROFILE" 2>/dev/null
}

# Check EFS mount status
check_efs_mount() {
    local TASK_ARN="$1"

    log_info "Checking EFS mount status..."
    exec_in_container "$TASK_ARN" "ls -la /efs 2>/dev/null || echo 'EFS not mounted at /efs'"
}

# List all apps on EFS
list_apps() {
    local TASK_ARN="$1"

    echo ""
    echo "=========================================="
    echo "  EFS Contents: /efs (= EFS /apps)"
    echo "=========================================="
    echo ""

    exec_in_container "$TASK_ARN" "ls -la /efs/ 2>/dev/null"
}

# Inspect specific app
inspect_app() {
    local TASK_ARN="$1"
    local APP_ID="$2"

    echo ""
    echo "=========================================="
    echo "  App: $APP_ID"
    echo "=========================================="
    echo ""

    log_info "Workspace structure:"
    exec_in_container "$TASK_ARN" "ls -la /efs/$APP_ID/workspace/ 2>/dev/null || echo 'App not found'"

    echo ""
    log_info "leo-artifacts structure:"
    exec_in_container "$TASK_ARN" "ls -la /efs/$APP_ID/workspace/leo-artifacts/ 2>/dev/null || echo 'No artifacts'"

    echo ""
    log_info "Sessions:"
    exec_in_container "$TASK_ARN" "ls -la /efs/$APP_ID/workspace/leo-artifacts/sessions/ 2>/dev/null | head -20 || echo 'No sessions'"

    echo ""
    log_info "Logs:"
    exec_in_container "$TASK_ARN" "ls -la /efs/$APP_ID/workspace/leo-artifacts/logs/ 2>/dev/null || echo 'No logs directory'"

    echo ""
    log_info "Conversation logs:"
    exec_in_container "$TASK_ARN" "ls -la /efs/$APP_ID/workspace/leo-artifacts/logs/conversations/ 2>/dev/null | head -20 || echo 'No conversation logs'"
}

# Show logs content
show_logs() {
    local TASK_ARN="$1"
    local APP_ID="$2"

    echo ""
    echo "=========================================="
    echo "  Logs for: $APP_ID"
    echo "=========================================="
    echo ""

    log_info "generation.log (last 50 lines):"
    exec_in_container "$TASK_ARN" "tail -50 /efs/$APP_ID/workspace/leo-artifacts/logs/generation.log 2>/dev/null || echo 'No generation.log'"

    echo ""
    log_info "Conversation files:"
    exec_in_container "$TASK_ARN" "ls -la /efs/$APP_ID/workspace/leo-artifacts/logs/conversations/ 2>/dev/null || echo 'No conversations'"
}

# Local EFS check (for development)
check_local() {
    local LOCAL_EFS="$HOME/.leo-efs"

    if [ ! -d "$LOCAL_EFS" ]; then
        log_warn "Local EFS directory not found: $LOCAL_EFS"
        return 1
    fi

    echo ""
    echo "=========================================="
    echo "  Local EFS: $LOCAL_EFS"
    echo "=========================================="
    echo ""

    ls -la "$LOCAL_EFS/"

    for APP_DIR in "$LOCAL_EFS"/*/; do
        if [ -d "$APP_DIR" ]; then
            APP_ID=$(basename "$APP_DIR")
            echo ""
            log_info "App: $APP_ID"

            if [ -d "$APP_DIR/workspace/leo-artifacts/logs" ]; then
                echo "  Logs:"
                ls -la "$APP_DIR/workspace/leo-artifacts/logs/" 2>/dev/null | sed 's/^/    /'

                if [ -d "$APP_DIR/workspace/leo-artifacts/logs/conversations" ]; then
                    echo "  Conversations:"
                    ls -la "$APP_DIR/workspace/leo-artifacts/logs/conversations/" 2>/dev/null | sed 's/^/    /'
                fi
            else
                echo "  No logs directory"
            fi
        fi
    done
}

# Main
case "${1:-}" in
    --local|-l)
        check_local
        ;;
    --help|-h)
        echo "Usage: $0 [options] [app_id] [logs]"
        echo ""
        echo "Options:"
        echo "  --local, -l    Check local EFS (~/.leo-efs)"
        echo "  --help, -h     Show this help"
        echo ""
        echo "Examples:"
        echo "  $0                    # List all apps on AWS EFS"
        echo "  $0 --local            # Check local EFS"
        echo "  $0 <app_id>           # Inspect specific app on AWS"
        echo "  $0 <app_id> logs      # Show logs for app on AWS"
        ;;
    "")
        log_info "Finding task with EFS mount..."
        TASK_ARN=$(get_task_with_efs)
        log_ok "Found task: $(echo $TASK_ARN | awk -F'/' '{print $NF}')"
        list_apps "$TASK_ARN"
        ;;
    *)
        APP_ID="$1"
        SUBCMD="${2:-}"

        log_info "Finding task with EFS mount..."
        TASK_ARN=$(get_task_with_efs)
        log_ok "Found task: $(echo $TASK_ARN | awk -F'/' '{print $NF}')"

        if [ "$SUBCMD" = "logs" ]; then
            show_logs "$TASK_ARN" "$APP_ID"
        else
            inspect_app "$TASK_ARN" "$APP_ID"
        fi
        ;;
esac
