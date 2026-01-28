#!/bin/bash
# ============================================
# Leo SaaS - Fast Local Build (Mono-Repo)
# ============================================
# Builds Leo Container and Leo SaaS for local development (native arch only).
# For production deployment, use deploy-ecs.sh which builds AMD64 with prod DB.
#
# Usage:
#   ./scripts/build.sh              # Build both (dev database - default)
#   ./scripts/build.sh --prod       # Build with production database
#   ./scripts/build.sh --container  # Only Leo Container (leo-worker)
#   ./scripts/build.sh --saas       # Only Leo SaaS (leo-web)
#   ./scripts/run-leo.sh            # Run after building

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_STATE="$PROJECT_DIR/.build-state"
LOGS_DIR="$PROJECT_DIR/logs/builds"

# Mono-repo paths (no separate repos, no branches)
LEO_WEB_DIR="$PROJECT_DIR/leo-web"
LEO_WORKER_DIR="$PROJECT_DIR/leo-worker"

# Image names (keeping original names for compatibility)
LEO_CONTAINER_IMAGE="leo-container"
LEO_SAAS_IMAGE="leo-saas-generated"

# Detect host architecture for image tagging
HOST_ARCH=$(uname -m)
case "$HOST_ARCH" in
    arm64|aarch64) IMAGE_ARCH="arm64" ;;
    x86_64)        IMAGE_ARCH="amd64" ;;
    *)             IMAGE_ARCH="amd64" ;; # fallback
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
BUILD_CONTAINER=true
BUILD_SAAS=true
NO_CACHE=""
USE_PROD_DB=false

for arg in "$@"; do
    case "$arg" in
        --container) BUILD_CONTAINER=true; BUILD_SAAS=false ;;
        --saas) BUILD_CONTAINER=false; BUILD_SAAS=true ;;
        --prod) USE_PROD_DB=true ;;
        --no-cache) NO_CACHE="--no-cache" ;;
        --help|-h)
            echo "Usage: $0 [--container] [--saas] [--prod] [--no-cache]"
            echo "  --container  Only build Leo Container (leo-worker)"
            echo "  --saas       Only build Leo SaaS (leo-web)"
            echo "  --prod       Use production database (default: dev)"
            echo "  --no-cache   Force rebuild without Docker cache"
            echo "  (default)    Build both with dev database"
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

# ============================================
# Setup Logging
# ============================================
mkdir -p "$LOGS_DIR"
LOG_FILE="$LOGS_DIR/build-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "Log file: $LOG_FILE"

# Track build time
BUILD_START_TIME=$(date +%s)

echo ""
echo "=============================================="
echo "  Leo SaaS - Fast Local Build (Mono-Repo)"
echo "  Database: $DB_ENV"
echo "=============================================="
echo ""

# ============================================
# Pre-flight: Check for uncommitted changes
# ============================================
cd "$PROJECT_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
    log_error "Uncommitted changes! Commit first:"
    git status --short
    exit 1
fi

# Get mono-repo commit info (shared by both components)
COMMIT=$(git rev-parse --short HEAD)
FULL_COMMIT=$(git rev-parse HEAD)
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "local")
REPO_NAME=$(basename "$REPO_URL" .git)
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
BUILD_HOST=$(hostname)

log_info "Building $REPO_NAME @ $COMMIT"

# ============================================
# Build Leo Container (from leo-worker/)
# ============================================
build_leo_container() {
    log_step "Building Leo Container (leo-worker)..."
    echo "----------------------------------------------"

    # Generate build manifest
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
  "component": "leo-container"
}
EOF
)

    # Build (native architecture, no --platform flag)
    docker build $NO_CACHE \
        --build-arg BUILD_MANIFEST="$BUILD_MANIFEST" \
        -t "$LEO_CONTAINER_IMAGE:$COMMIT-$IMAGE_ARCH" \
        -t "$LEO_CONTAINER_IMAGE:latest-$IMAGE_ARCH" \
        "$LEO_WORKER_DIR"

    log_success "$LEO_CONTAINER_IMAGE:$COMMIT-$IMAGE_ARCH"

    # Update leo-web .env.local with the new container image
    local LEO_WEB_ENV="$LEO_WEB_DIR/.env.local"
    if [[ -f "$LEO_WEB_ENV" ]]; then
        local NEW_IMAGE="$LEO_CONTAINER_IMAGE:$COMMIT-$IMAGE_ARCH"
        if grep -q "^GENERATOR_IMAGE=" "$LEO_WEB_ENV"; then
            sed -i.bak "s|^GENERATOR_IMAGE=.*|GENERATOR_IMAGE=$NEW_IMAGE|" "$LEO_WEB_ENV"
            rm -f "${LEO_WEB_ENV}.bak"
        else
            echo "GENERATOR_IMAGE=$NEW_IMAGE" >> "$LEO_WEB_ENV"
        fi
        log_info "Updated .env.local GENERATOR_IMAGE=$NEW_IMAGE"
    fi
}

# ============================================
# Build Leo SaaS (from leo-web/)
# ============================================
build_leo_saas() {
    log_step "Building Leo SaaS (leo-web)..."
    echo "----------------------------------------------"

    # Fetch build-time secrets from AWS Secrets Manager
    log_info "Fetching secrets from AWS Secrets Manager ($SECRETS_PREFIX/*)..."

    local VITE_SUPABASE_URL=$(aws secretsmanager get-secret-value \
        --secret-id ${SECRETS_PREFIX}/supabase-url \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --query SecretString --output text 2>/dev/null)

    if [[ -z "$VITE_SUPABASE_URL" || "$VITE_SUPABASE_URL" == "null" ]]; then
        log_error "Failed to fetch ${SECRETS_PREFIX}/supabase-url. Run: aws sso login --profile $AWS_PROFILE"
        exit 1
    fi

    local VITE_SUPABASE_ANON_KEY=$(aws secretsmanager get-secret-value \
        --secret-id ${SECRETS_PREFIX}/supabase-anon-key \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --query SecretString --output text 2>/dev/null)

    if [[ -z "$VITE_SUPABASE_ANON_KEY" || "$VITE_SUPABASE_ANON_KEY" == "null" ]]; then
        log_error "Failed to fetch ${SECRETS_PREFIX}/supabase-anon-key"
        exit 1
    fi

    log_success "Secrets fetched ($DB_ENV database)"

    # Generate build manifest
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
  "component": "leo-saas"
}
EOF
)

    # Build (native architecture, no --platform flag)
    docker build $NO_CACHE \
        --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
        --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
        --build-arg GIT_COMMIT="$FULL_COMMIT" \
        --build-arg BUILD_TIME="$BUILD_TIME" \
        --build-arg APP_VERSION="$COMMIT" \
        --build-arg BUILD_MANIFEST="$BUILD_MANIFEST" \
        -t "$LEO_SAAS_IMAGE:$COMMIT-$IMAGE_ARCH" \
        -t "$LEO_SAAS_IMAGE:latest-$IMAGE_ARCH" \
        "$LEO_WEB_DIR"

    log_success "$LEO_SAAS_IMAGE:$COMMIT-$IMAGE_ARCH"

    # Run database migrations (silent)
    log_info "Running database migrations..."
    cd "$LEO_WEB_DIR"
    if [[ ! -d "$LEO_WEB_DIR/node_modules" ]]; then
        npm install --silent >/dev/null 2>&1
    fi
    npx drizzle-kit push --force >/dev/null 2>&1 || true
    log_success "Migrations complete"
}

# ============================================
# Disk Usage Report
# ============================================
report_disk_usage() {
    local TOTAL_USAGE_GB=$(docker system df --format "{{.Size}}" 2>/dev/null | awk '
        /GB/ { sum += $1 }
        /MB/ { sum += $1/1024 }
        END { printf "%.1f", sum }
    ')

    echo ""
    log_info "Docker disk usage: ${TOTAL_USAGE_GB}GB"

    # Warn if usage exceeds threshold
    local WARN_THRESHOLD=30
    if (( $(echo "$TOTAL_USAGE_GB > $WARN_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
        log_warn "Docker disk usage exceeds ${WARN_THRESHOLD}GB!"
        log_warn "Run: docker system prune -a -f"
    fi
}

# ============================================
# Main
# ============================================

# Build requested components
if $BUILD_CONTAINER; then
    echo ""
    build_leo_container
fi

if $BUILD_SAAS; then
    echo ""
    build_leo_saas
fi

# Write .build-state for run-leo.sh
# In mono-repo, both components share the same commit
cat > "$BUILD_STATE" << EOF
LEO_CONTAINER=$COMMIT
LEO_SAAS=$COMMIT
BUILD_TIME=$BUILD_TIME
IMAGE_ARCH=$IMAGE_ARCH
DB_ENV=$DB_ENV
SECRETS_PREFIX=$SECRETS_PREFIX
EOF

# Report disk usage
report_disk_usage

# ============================================
# Summary Banner
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
echo "  Commit:        $COMMIT"
echo "  Architecture:  $IMAGE_ARCH"
echo "  Database:      $DB_ENV ($SECRETS_PREFIX/*)"
echo "  Build Time:    $BUILD_TIME"
echo "  Elapsed:       ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo ""
echo "  Images:"
echo "    $LEO_CONTAINER_IMAGE:$COMMIT-$IMAGE_ARCH"
echo "    $LEO_SAAS_IMAGE:$COMMIT-$IMAGE_ARCH"
echo ""
echo "  State saved to .build-state"
echo "  To run locally: ./scripts/run-leo.sh"
echo ""
echo "=============================================="
echo ""
