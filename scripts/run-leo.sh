#!/bin/bash
#
# run-leo.sh - Start Leo SaaS container
#
# NO FAF POLICY: Run locally exactly like Fargate
# - Same image tag (commit hash, not 'latest')
# - Secrets from AWS Secrets Manager (not .env.local)
# - Only pass AWS credentials and local-only settings
#
# Usage:
#   ./scripts/run-leo.sh              # Start container (foreground logs)
#   ./scripts/run-leo.sh --detach     # Start container (background)

set -e

# Configuration
RUNNER_DIR="$HOME/WORK/LEO/saas-dev-agent/repos/gen-219eda6b-032862af"
CONTAINER_NAME="leo-saas-generated"
IMAGE_NAME="leo-saas-generated"
PORT="${LEO_PORT:-5013}"

DETACH=false
[[ "$1" == "--detach" || "$1" == "-d" ]] && DETACH=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if port is already in use (by something other than our container)
check_port() {
    # Only check for LISTEN sockets, not ESTABLISHED connections
    local port_pid=$(lsof -ti :${PORT} -sTCP:LISTEN 2>/dev/null | head -1)
    if [[ -n "$port_pid" ]]; then
        # Check if it's our container
        local container_id=$(docker ps -q -f name="$CONTAINER_NAME" 2>/dev/null)
        if [[ -z "$container_id" ]]; then
            log_error "Port ${PORT} is already in use by another process (PID: $port_pid)"
            log_error "Run: lsof -i :${PORT}"
            log_error "Kill it or set LEO_PORT to use a different port"
            exit 1
        fi
    fi
}

check_port

# Get current commit (used for image tag - No FAF policy)
CURRENT_COMMIT=$(cd "$RUNNER_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "")
if [[ -z "$CURRENT_COMMIT" ]]; then
    log_error "Could not determine commit hash from $RUNNER_DIR"
    exit 1
fi

# Detect host architecture
HOST_ARCH=$(uname -m)
case "$HOST_ARCH" in
    arm64|aarch64) IMAGE_ARCH="arm64" ;;
    x86_64)        IMAGE_ARCH="amd64" ;;
    *)             IMAGE_ARCH="amd64" ;; # fallback
esac

IMAGE_TAG="$CURRENT_COMMIT-$IMAGE_ARCH"

# Check if image exists with commit-arch tag
if ! docker image inspect "$IMAGE_NAME:$IMAGE_TAG" &>/dev/null; then
    log_error "Image $IMAGE_NAME:$IMAGE_TAG not found"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

# Load minimal local config (only local-only settings, not secrets)
if [[ -f "$RUNNER_DIR/.env.local" ]]; then
    set -a
    source "$RUNNER_DIR/.env.local"
    set +a
fi

# Get AWS credentials for Secrets Manager access
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"

if [[ -f "$HOME/.aws/credentials" ]]; then
    AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id --profile "$AWS_PROFILE" 2>/dev/null || echo "")
    AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key --profile "$AWS_PROFILE" 2>/dev/null || echo "")
    AWS_SESSION_TOKEN=$(aws configure get aws_session_token --profile "$AWS_PROFILE" 2>/dev/null || echo "")
fi

if [[ -z "$AWS_ACCESS_KEY_ID" ]]; then
    log_error "AWS credentials not found. Configure with: aws configure --profile $AWS_PROFILE"
    log_error "App needs AWS access to read secrets from Secrets Manager (leo/* prefix)"
    exit 1
fi

# Stop existing container
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    log_info "Stopping existing container..."
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
    log_success "Existing container stopped"
fi

# Also remove stopped container if exists
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo ""
echo "=========================================="
echo "  Leo SaaS Runner (No FAF Mode)"
echo "=========================================="
echo ""

log_info "Starting Leo SaaS container..."
log_info "  Image: $IMAGE_NAME:$IMAGE_TAG"
log_info "  Architecture: $IMAGE_ARCH"
log_info "  Secrets: AWS Secrets Manager (leo/*)"

# Run container
# - NO secrets passed via -e (app reads from AWS Secrets Manager)
# - Only pass: AWS creds, local settings, Docker socket
docker run -d \
    --name "$CONTAINER_NAME" \
    -p ${PORT}:${PORT} \
    \
    -e NODE_ENV=production \
    -e PORT=${PORT} \
    \
    -e AWS_REGION="$AWS_REGION" \
    -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
    -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
    ${AWS_SESSION_TOKEN:+-e AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN"} \
    \
    -e USE_AWS_ORCHESTRATOR=false \
    -e USE_GITHUB_INTEGRATION="${USE_GITHUB_INTEGRATION:-true}" \
    -e GENERATOR_IMAGE="${GENERATOR_IMAGE:?GENERATOR_IMAGE must be set (e.g., leo-container:abc123)}" \
    -e SUPABASE_MODE="${SUPABASE_MODE:-per-app}" \
    ${LEO_EFS_PATH:+-e LEO_EFS_PATH="$LEO_EFS_PATH"} \
    \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --restart unless-stopped \
    "$IMAGE_NAME:$IMAGE_TAG"

log_success "Container started: $CONTAINER_NAME"

echo ""
log_info "  Image: $IMAGE_NAME:$IMAGE_TAG"
log_info "  Port:   $PORT"
log_info "  URL:    http://localhost:$PORT/console"
echo ""

# Wait and check health
sleep 2
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    log_success "Container is running"

    # Print build manifest for version verification
    echo ""
    log_info "Build Manifest:"
    docker exec "$CONTAINER_NAME" cat /build-manifest.json 2>/dev/null || log_warn "Manifest not found (old image?)"
    echo ""

    if $DETACH; then
        log_info "Running in background. Use 'docker logs -f $CONTAINER_NAME' to view logs"
    else
        log_info "Tailing logs (Ctrl+C to detach)..."
        echo ""
        docker logs -f "$CONTAINER_NAME"
    fi
else
    log_error "Container failed to start"
    docker logs "$CONTAINER_NAME"
    exit 1
fi
