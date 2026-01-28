#!/bin/bash
# ============================================
# Leo SaaS - Run Local Container
# ============================================
# Runs Leo locally using images built by build.sh
#
# Usage:
#   ./scripts/run-leo.sh                    # default: dev + simple
#   ./scripts/run-leo.sh --prod --leo       # prod db + leo agent
#   ./scripts/run-leo.sh --prod             # prod db + simple agent
#   ./scripts/run-leo.sh --leo              # dev db + leo agent
#   ./scripts/run-leo.sh --detach           # run in background
#   ./scripts/run-leo.sh --stop             # stop container

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_STATE="$PROJECT_DIR/.build-state"
CONTAINER_NAME="leo-web"
PORT="${LEO_PORT:-5013}"

# Defaults: dev + simple
DB_ENV="dev"
AGENT_MODE="simple"
DETACH=false
STOP=false

# AWS config
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================
# Parse Arguments
# ============================================
for arg in "$@"; do
    case $arg in
        --prod) DB_ENV="prod" ;;
        --dev) DB_ENV="dev" ;;
        --leo) AGENT_MODE="leo" ;;
        --simple) AGENT_MODE="simple" ;;
        --detach|-d) DETACH=true ;;
        --stop) STOP=true ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Database (frontend Supabase - baked at build time):"
            echo "  --dev       Use dev Supabase (default)"
            echo "  --prod      Use prod Supabase"
            echo ""
            echo "Agent (MCP tools):"
            echo "  --simple    No MCP tools (default)"
            echo "  --leo       Full MCP toolkit"
            echo ""
            echo "Runtime:"
            echo "  --detach    Run in background"
            echo "  --stop      Stop running container"
            echo ""
            echo "Examples:"
            echo "  $0                    # dev + simple (default)"
            echo "  $0 --prod --leo       # prod + leo (production-like)"
            echo "  $0 --leo              # dev + leo (test full agent safely)"
            exit 0
            ;;
    esac
done

# ============================================
# Handle --stop
# ============================================
if $STOP; then
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        log_info "Stopping container..."
        docker stop "$CONTAINER_NAME" >/dev/null 2>&1
        docker rm "$CONTAINER_NAME" >/dev/null 2>&1
        log_success "Container stopped"
    else
        log_info "Container not running"
    fi
    exit 0
fi

# ============================================
# Read .build-state
# ============================================
if [[ ! -f "$BUILD_STATE" ]]; then
    log_error ".build-state not found!"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

source "$BUILD_STATE"

if [[ -z "$COMMIT" || -z "$IMAGE_ARCH" ]]; then
    log_error ".build-state is invalid"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

# Build image tags
WEB_IMAGE="leo-web:${COMMIT}-${IMAGE_ARCH}-${DB_ENV}"
WORKER_IMAGE="leo-worker:${COMMIT}-${IMAGE_ARCH}-${AGENT_MODE}"

# ============================================
# Verify Images Exist
# ============================================
if ! docker image inspect "$WEB_IMAGE" &>/dev/null; then
    log_error "Image not found: $WEB_IMAGE"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

if ! docker image inspect "$WORKER_IMAGE" &>/dev/null; then
    log_error "Image not found: $WORKER_IMAGE"
    log_error "Run ./scripts/build.sh first"
    exit 1
fi

# ============================================
# Check Port Availability
# ============================================
check_port() {
    local port_pid=$(lsof -ti :${PORT} -sTCP:LISTEN 2>/dev/null | head -1)
    if [[ -n "$port_pid" ]]; then
        local container_id=$(docker ps -q -f name="$CONTAINER_NAME" 2>/dev/null)
        if [[ -z "$container_id" ]]; then
            log_error "Port ${PORT} already in use (PID: $port_pid)"
            log_error "Kill it or set LEO_PORT to use a different port"
            exit 1
        fi
    fi
}
check_port

# ============================================
# Stop Existing Container
# ============================================
if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
    log_info "Removing existing container..."
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

# ============================================
# Get AWS Credentials
# ============================================
if [[ -f "$HOME/.aws/credentials" ]]; then
    AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id --profile "$AWS_PROFILE" 2>/dev/null || echo "")
    AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key --profile "$AWS_PROFILE" 2>/dev/null || echo "")
    AWS_SESSION_TOKEN=$(aws configure get aws_session_token --profile "$AWS_PROFILE" 2>/dev/null || echo "")
fi

if [[ -z "$AWS_ACCESS_KEY_ID" ]]; then
    log_error "AWS credentials not found for profile: $AWS_PROFILE"
    log_error "Run: aws sso login --profile $AWS_PROFILE"
    exit 1
fi

# ============================================
# Determine Secrets Path
# ============================================
if [[ "$DB_ENV" == "dev" ]]; then
    SECRETS_PREFIX="leo-dev"
else
    SECRETS_PREFIX="leo"
fi

# ============================================
# Run Container
# ============================================
echo ""
echo "=========================================="
echo "  Leo SaaS Runner"
echo "=========================================="
echo ""
log_info "Config:       $DB_ENV + $AGENT_MODE"
log_info "Web Image:    $WEB_IMAGE"
log_info "Worker Image: $WORKER_IMAGE"
log_info "Port:         $PORT"
log_info "Secrets:      AWS Secrets Manager (${SECRETS_PREFIX}/*)"
echo ""

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
    -e USE_GITHUB_INTEGRATION="${USE_GITHUB_INTEGRATION:-false}" \
    -e GENERATOR_IMAGE="$WORKER_IMAGE" \
    -e AUTH_MODE="${AUTH_MODE:-supabase}" \
    -e STORAGE_MODE="${STORAGE_MODE:-database}" \
    -e SECRETS_PREFIX="$SECRETS_PREFIX" \
    \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --restart unless-stopped \
    "$WEB_IMAGE"

log_success "Container started: $CONTAINER_NAME"

echo ""
log_info "URL: http://localhost:$PORT/console"
echo ""

# ============================================
# Wait and Check Health
# ============================================
sleep 2
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    log_success "Container is running"

    echo ""
    log_info "Build Manifest:"
    docker exec "$CONTAINER_NAME" cat /build-manifest.json 2>/dev/null || log_warn "No manifest"
    echo ""

    if $DETACH; then
        log_info "Running in background"
        log_info "Logs: docker logs -f $CONTAINER_NAME"
        log_info "Stop: ./scripts/run-leo.sh --stop"
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
