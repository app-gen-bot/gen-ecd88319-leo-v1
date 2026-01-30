#!/bin/bash
#
# run-leo.sh - Start Leo SaaS container (Mono-Repo)
#
# Usage:
#   ./scripts/run-leo.sh              # Start with dev database (default)
#   ./scripts/run-leo.sh --prod       # Start with production database
#   ./scripts/run-leo.sh --detach     # Start in background
#   ./scripts/run-leo.sh --prod -d    # Prod + background

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_STATE="$PROJECT_DIR/.build-state"

CONTAINER_NAME="leo-saas-generated"
IMAGE_NAME="leo-saas-generated"
PORT="${LEO_PORT:-5013}"

# Parse arguments
DETACH=false
USE_PROD_DB=false

for arg in "$@"; do
    case "$arg" in
        --detach|-d) DETACH=true ;;
        --prod) USE_PROD_DB=true ;;
        --help|-h)
            echo "Usage: $0 [--prod] [--detach|-d]"
            echo "  --prod      Use production database (default: dev)"
            echo "  --detach    Run in background"
            exit 0
            ;;
    esac
done

# Set secrets prefix based on database choice
if $USE_PROD_DB; then
    SECRETS_PREFIX="leo"
    DB_ENV="prod"
else
    SECRETS_PREFIX="leo-dev"
    DB_ENV="dev"
fi

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

# Check if port is already in use
check_port() {
    local port_pid=$(lsof -ti :${PORT} -sTCP:LISTEN 2>/dev/null | head -1)
    if [[ -n "$port_pid" ]]; then
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

# Read build state
if [[ ! -f "$BUILD_STATE" ]]; then
    log_error ".build-state not found!"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

source "$BUILD_STATE"

if [[ -z "$LEO_CONTAINER" || -z "$LEO_SAAS" ]]; then
    log_error ".build-state is invalid"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

COMMIT="$LEO_SAAS"
IMAGE_TAG="$COMMIT-$IMAGE_ARCH"

# Check if image exists
if ! docker image inspect "$IMAGE_NAME:$IMAGE_TAG" &>/dev/null; then
    log_error "Image $IMAGE_NAME:$IMAGE_TAG not found"
    log_error "Run ./scripts/build.sh first"
    exit 1
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
    log_error "App needs AWS access to read secrets from Secrets Manager (${SECRETS_PREFIX}/* prefix)"
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

# Get generator image tag
GENERATOR_IMAGE="leo-container:$COMMIT-$IMAGE_ARCH"

echo ""
echo "=========================================="
echo "  Leo SaaS Runner (Mono-Repo)"
echo "  Database: $DB_ENV"
echo "=========================================="
echo ""

log_info "Starting Leo SaaS container..."
log_info "  Image: $IMAGE_NAME:$IMAGE_TAG"
log_info "  Generator: $GENERATOR_IMAGE"
log_info "  Architecture: $IMAGE_ARCH"
log_info "  Secrets: AWS Secrets Manager (${SECRETS_PREFIX}/*)"

# Run container
docker run -d \
    --name "$CONTAINER_NAME" \
    -p ${PORT}:${PORT} \
    \
    -e NODE_ENV=production \
    -e PORT=${PORT} \
    -e SECRETS_PREFIX="$SECRETS_PREFIX" \
    \
    -e AWS_REGION="$AWS_REGION" \
    -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
    -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
    ${AWS_SESSION_TOKEN:+-e AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN"} \
    \
    -e USE_AWS_ORCHESTRATOR=false \
    -e USE_GITHUB_INTEGRATION="${USE_GITHUB_INTEGRATION:-true}" \
    -e GENERATOR_IMAGE="$GENERATOR_IMAGE" \
    -e SUPABASE_MODE="${SUPABASE_MODE:-per-app}" \
    ${AGENT_MODE:+-e AGENT_MODE="$AGENT_MODE"} \
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
