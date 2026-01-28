#!/bin/bash
# ============================================
# Leo SaaS - Build All Images
# ============================================
# Builds all 4 image variants for local development (native arch only):
#   - leo-worker:commit-arch-simple  (no MCP tools)
#   - leo-worker:commit-arch-leo     (full MCP tools)
#   - leo-web:commit-arch-dev        (dev Supabase baked in)
#   - leo-web:commit-arch-prod       (prod Supabase baked in)
#
# Usage:
#   ./scripts/build.sh              # Build all 4 images
#   ./scripts/build.sh --no-cache   # Force rebuild without Docker cache
#   ./scripts/run-leo.sh            # Run after building (default: dev + simple)

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_STATE="$PROJECT_DIR/.build-state"
LOGS_DIR="$PROJECT_DIR/logs/builds"

# Repo paths
LEO_WEB_DIR="$PROJECT_DIR/leo-web"
LEO_WORKER_DIR="$PROJECT_DIR/leo-worker"

# Detect host architecture for image tagging
HOST_ARCH=$(uname -m)
case "$HOST_ARCH" in
    arm64|aarch64) IMAGE_ARCH="arm64" ;;
    x86_64)        IMAGE_ARCH="amd64" ;;
    *)             IMAGE_ARCH="amd64" ;;
esac

# AWS config for secrets
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================
# Logging
# ============================================
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# ============================================
# Parse Arguments
# ============================================
NO_CACHE=""

for arg in "$@"; do
    case "$arg" in
        --no-cache) NO_CACHE="--no-cache" ;;
        --help|-h)
            echo "Usage: $0 [--no-cache]"
            echo "  --no-cache   Force rebuild without Docker cache"
            echo ""
            echo "Builds all 4 image variants:"
            echo "  leo-worker:commit-arch-simple  (no MCP tools)"
            echo "  leo-worker:commit-arch-leo     (full MCP tools)"
            echo "  leo-web:commit-arch-dev        (dev Supabase)"
            echo "  leo-web:commit-arch-prod       (prod Supabase)"
            exit 0
            ;;
    esac
done

# ============================================
# Setup Logging
# ============================================
mkdir -p "$LOGS_DIR"
LOG_FILE="$LOGS_DIR/build-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Log file: $LOG_FILE"

BUILD_START_TIME=$(date +%s)

echo ""
echo "=============================================="
echo "  Leo SaaS - Build All Images"
echo "=============================================="
echo ""

# ============================================
# Pre-flight Checks
# ============================================
cd "$PROJECT_DIR"

# Check for uncommitted changes
if [[ -n "$(git status --porcelain)" ]]; then
    log_error "Uncommitted changes! Commit first:"
    git status --short
    exit 1
fi

# Pull latest
git pull origin main --quiet 2>/dev/null || true

# Get commit info
COMMIT=$(git rev-parse --short HEAD)
FULL_COMMIT=$(git rev-parse HEAD)
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "unknown")
REPO_NAME=$(basename "$REPO_URL" .git)
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
BUILD_HOST=$(hostname)

log_info "Building $REPO_NAME @ $COMMIT"
echo ""

# ============================================
# Fetch Supabase Credentials (dev + prod)
# ============================================
log_step "Fetching Supabase credentials..."
echo "----------------------------------------------"

# Dev credentials
DEV_SUPABASE_URL=$(aws secretsmanager get-secret-value \
    --secret-id leo-dev/supabase-url \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --query SecretString --output text 2>/dev/null)

DEV_SUPABASE_ANON_KEY=$(aws secretsmanager get-secret-value \
    --secret-id leo-dev/supabase-anon-key \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --query SecretString --output text 2>/dev/null)

if [[ -z "$DEV_SUPABASE_URL" || "$DEV_SUPABASE_URL" == "null" ]]; then
    log_error "Failed to fetch leo-dev/supabase-url"
    log_error "Run: aws sso login --profile $AWS_PROFILE"
    log_error "Or create secrets: aws secretsmanager create-secret --name leo-dev/supabase-url --secret-string 'https://xxx.supabase.co'"
    exit 1
fi
log_success "Dev credentials fetched"

# Prod credentials
PROD_SUPABASE_URL=$(aws secretsmanager get-secret-value \
    --secret-id leo/supabase-url \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --query SecretString --output text 2>/dev/null)

PROD_SUPABASE_ANON_KEY=$(aws secretsmanager get-secret-value \
    --secret-id leo/supabase-anon-key \
    --region "$AWS_REGION" \
    --profile "$AWS_PROFILE" \
    --query SecretString --output text 2>/dev/null)

if [[ -z "$PROD_SUPABASE_URL" || "$PROD_SUPABASE_URL" == "null" ]]; then
    log_error "Failed to fetch leo/supabase-url"
    exit 1
fi
log_success "Prod credentials fetched"
echo ""

# ============================================
# Build leo-worker (simple + leo variants)
# ============================================
build_worker() {
    local MODE=$1  # simple or leo
    local TAG="leo-worker:${COMMIT}-${IMAGE_ARCH}-${MODE}"

    log_step "Building leo-worker ($MODE)..."

    local BUILD_MANIFEST=$(cat <<EOF
{
  "commit": "$COMMIT",
  "commitFull": "$FULL_COMMIT",
  "repo": "$REPO_NAME",
  "repoUrl": "$REPO_URL",
  "branch": "main",
  "buildTime": "$BUILD_TIME",
  "buildHost": "$BUILD_HOST",
  "architecture": "native",
  "component": "leo-worker",
  "agentMode": "$MODE"
}
EOF
)

    docker build $NO_CACHE \
        --build-arg AGENT_MODE="$MODE" \
        --build-arg BUILD_MANIFEST="$BUILD_MANIFEST" \
        -t "$TAG" \
        "$LEO_WORKER_DIR"

    log_success "$TAG"
}

echo ""
build_worker "simple"
echo ""
build_worker "leo"

# ============================================
# Build leo-web (dev + prod variants)
# ============================================
build_web() {
    local ENV=$1  # dev or prod
    local TAG="leo-web:${COMMIT}-${IMAGE_ARCH}-${ENV}"

    if [[ "$ENV" == "dev" ]]; then
        local VITE_URL="$DEV_SUPABASE_URL"
        local VITE_KEY="$DEV_SUPABASE_ANON_KEY"
    else
        local VITE_URL="$PROD_SUPABASE_URL"
        local VITE_KEY="$PROD_SUPABASE_ANON_KEY"
    fi

    log_step "Building leo-web ($ENV)..."

    local BUILD_MANIFEST=$(cat <<EOF
{
  "commit": "$COMMIT",
  "commitFull": "$FULL_COMMIT",
  "repo": "$REPO_NAME",
  "repoUrl": "$REPO_URL",
  "branch": "main",
  "buildTime": "$BUILD_TIME",
  "buildHost": "$BUILD_HOST",
  "architecture": "native",
  "component": "leo-web",
  "dbEnv": "$ENV"
}
EOF
)

    docker build $NO_CACHE \
        --build-arg VITE_SUPABASE_URL="$VITE_URL" \
        --build-arg VITE_SUPABASE_ANON_KEY="$VITE_KEY" \
        --build-arg GIT_COMMIT="$FULL_COMMIT" \
        --build-arg BUILD_TIME="$BUILD_TIME" \
        --build-arg APP_VERSION="$COMMIT" \
        --build-arg BUILD_MANIFEST="$BUILD_MANIFEST" \
        -t "$TAG" \
        "$LEO_WEB_DIR"

    log_success "$TAG"
}

echo ""
build_web "dev"
echo ""
build_web "prod"

# ============================================
# Write .build-state
# ============================================
cat > "$BUILD_STATE" << EOF
COMMIT=$COMMIT
IMAGE_ARCH=$IMAGE_ARCH
BUILD_TIME=$BUILD_TIME
# Images built:
# leo-worker:${COMMIT}-${IMAGE_ARCH}-simple
# leo-worker:${COMMIT}-${IMAGE_ARCH}-leo
# leo-web:${COMMIT}-${IMAGE_ARCH}-dev
# leo-web:${COMMIT}-${IMAGE_ARCH}-prod
EOF

# ============================================
# Disk Usage Report
# ============================================
TOTAL_USAGE_GB=$(docker system df --format "{{.Size}}" 2>/dev/null | awk '
    /GB/ { sum += $1 }
    /MB/ { sum += $1/1024 }
    END { printf "%.1f", sum }
')

echo ""
log_info "Docker disk usage: ${TOTAL_USAGE_GB}GB"

WARN_THRESHOLD=30
if (( $(echo "$TOTAL_USAGE_GB > $WARN_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
    log_warn "Docker disk usage exceeds ${WARN_THRESHOLD}GB!"
    log_warn "Run: docker system prune -a -f"
fi

# ============================================
# Summary
# ============================================
BUILD_END_TIME=$(date +%s)
ELAPSED=$((BUILD_END_TIME - BUILD_START_TIME))
ELAPSED_MIN=$((ELAPSED / 60))
ELAPSED_SEC=$((ELAPSED % 60))

echo ""
echo "=============================================="
echo -e "${GREEN}  BUILD COMPLETE${NC}"
echo "=============================================="
echo ""
echo "  Commit: $COMMIT"
echo "  Arch:   $IMAGE_ARCH"
echo ""
echo "  Images:"
echo "    leo-worker:${COMMIT}-${IMAGE_ARCH}-simple"
echo "    leo-worker:${COMMIT}-${IMAGE_ARCH}-leo"
echo "    leo-web:${COMMIT}-${IMAGE_ARCH}-dev"
echo "    leo-web:${COMMIT}-${IMAGE_ARCH}-prod"
echo ""
echo "  Elapsed: ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo ""
echo "  To run locally: ./scripts/run-leo.sh"
echo "  (defaults to dev + simple)"
echo ""
echo "=============================================="
echo ""
