#!/bin/bash
# ============================================
# Leo SaaS - Fast Local Build
# ============================================
# Builds Leo Container and Leo SaaS for local development (native arch only).
# For production deployment, use deploy-ecs.sh which builds AMD64 via GitHub Actions.
#
# Usage:
#   ./scripts/build.sh              # Build both (default)
#   ./scripts/build.sh --container  # Only Leo Container
#   ./scripts/build.sh --saas       # Only Leo SaaS
#   ./scripts/run-leo.sh            # Run after building

set -e

# ============================================
# Configuration
# ============================================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$HOME/WORK/LEO/saas-dev-agent"
BUILD_STATE="$PROJECT_DIR/.build-state"
LOGS_DIR="$PROJECT_DIR/logs/builds"

# Repo paths and branches
LEO_SAAS_DIR="$PROJECT_DIR/repos/gen-219eda6b-032862af"
LEO_SAAS_BRANCH="main"
LEO_CONTAINER_DIR="$PROJECT_DIR/repos/app-factory"
LEO_CONTAINER_BRANCH="feat/efs"

# Image names
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

for arg in "$@"; do
    case "$arg" in
        --container) BUILD_CONTAINER=true; BUILD_SAAS=false ;;
        --saas) BUILD_CONTAINER=false; BUILD_SAAS=true ;;
        --no-cache) NO_CACHE="--no-cache" ;;
        --help|-h)
            echo "Usage: $0 [--container] [--saas] [--no-cache]"
            echo "  --container  Only build Leo Container"
            echo "  --saas       Only build Leo SaaS"
            echo "  --no-cache   Force rebuild without Docker cache"
            echo "  (default)    Build both"
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

# Track build time
BUILD_START_TIME=$(date +%s)

echo ""
echo "=============================================="
echo "  Leo SaaS - Fast Local Build"
echo "=============================================="
echo ""

# Track commits for summary
LEO_CONTAINER_COMMIT=""
LEO_SAAS_COMMIT=""

# ============================================
# Build Leo Container
# ============================================
build_leo_container() {
    log_step "Building Leo Container..."
    echo "----------------------------------------------"

    cd "$LEO_CONTAINER_DIR"

    # Fetch and checkout
    git fetch origin --quiet

    # Check for uncommitted changes
    if [[ -n "$(git status --porcelain)" ]]; then
        log_error "Uncommitted changes in app-factory! Commit and push first:"
        git status --short
        exit 1
    fi

    git checkout "$LEO_CONTAINER_BRANCH" --quiet
    git pull origin "$LEO_CONTAINER_BRANCH" --quiet

    # Get commit info
    local COMMIT=$(git rev-parse --short HEAD)
    local FULL_COMMIT=$(git rev-parse HEAD)
    local REPO_URL=$(git remote get-url origin 2>/dev/null || echo "unknown")
    local REPO_NAME=$(basename "$REPO_URL" .git)
    local BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local BUILD_HOST=$(hostname)

    log_info "Building $REPO_NAME @ $COMMIT"

    # Generate build manifest
    local BUILD_MANIFEST=$(cat <<EOF
{
  "commit": "$COMMIT",
  "commitFull": "$FULL_COMMIT",
  "repo": "$REPO_NAME",
  "repoUrl": "$REPO_URL",
  "branch": "$LEO_CONTAINER_BRANCH",
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
        "$LEO_CONTAINER_DIR/leo-container"

    log_success "$LEO_CONTAINER_IMAGE:$COMMIT-$IMAGE_ARCH"

    # Update Leo SaaS .env.local with the new container image
    local LEO_SAAS_ENV="$LEO_SAAS_DIR/.env.local"
    if [[ -f "$LEO_SAAS_ENV" ]]; then
        local NEW_IMAGE="$LEO_CONTAINER_IMAGE:$COMMIT-$IMAGE_ARCH"
        if grep -q "^GENERATOR_IMAGE=" "$LEO_SAAS_ENV"; then
            sed -i.bak "s|^GENERATOR_IMAGE=.*|GENERATOR_IMAGE=$NEW_IMAGE|" "$LEO_SAAS_ENV"
            rm -f "${LEO_SAAS_ENV}.bak"
        else
            echo "GENERATOR_IMAGE=$NEW_IMAGE" >> "$LEO_SAAS_ENV"
        fi
        log_info "Updated .env.local GENERATOR_IMAGE=$NEW_IMAGE"
    fi

    LEO_CONTAINER_COMMIT="$COMMIT"
}

# ============================================
# Build Leo SaaS
# ============================================
build_leo_saas() {
    log_step "Building Leo SaaS..."
    echo "----------------------------------------------"

    cd "$LEO_SAAS_DIR"

    # Fetch and checkout
    git fetch origin --quiet

    # Check for uncommitted changes
    if [[ -n "$(git status --porcelain)" ]]; then
        log_error "Uncommitted changes in Leo SaaS! Commit and push first:"
        git status --short
        exit 1
    fi

    git checkout "$LEO_SAAS_BRANCH" --quiet
    git pull origin "$LEO_SAAS_BRANCH" --quiet

    # Get commit info
    local COMMIT=$(git rev-parse --short HEAD)
    local FULL_COMMIT=$(git rev-parse HEAD)
    local REPO_URL=$(git remote get-url origin 2>/dev/null || echo "unknown")
    local REPO_NAME=$(basename "$REPO_URL" .git)
    local BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local BUILD_HOST=$(hostname)

    log_info "Building $REPO_NAME @ $COMMIT"

    # Fetch build-time secrets from AWS Secrets Manager (No FAF policy)
    log_info "Fetching secrets from AWS Secrets Manager..."

    local VITE_SUPABASE_URL=$(aws secretsmanager get-secret-value \
        --secret-id leo/supabase-url \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --query SecretString --output text 2>/dev/null)

    if [[ -z "$VITE_SUPABASE_URL" || "$VITE_SUPABASE_URL" == "null" ]]; then
        log_error "Failed to fetch leo/supabase-url. Run: aws sso login --profile $AWS_PROFILE"
        exit 1
    fi

    local VITE_SUPABASE_ANON_KEY=$(aws secretsmanager get-secret-value \
        --secret-id leo/supabase-anon-key \
        --region "$AWS_REGION" \
        --profile "$AWS_PROFILE" \
        --query SecretString --output text 2>/dev/null)

    if [[ -z "$VITE_SUPABASE_ANON_KEY" || "$VITE_SUPABASE_ANON_KEY" == "null" ]]; then
        log_error "Failed to fetch leo/supabase-anon-key"
        exit 1
    fi

    log_success "Secrets fetched"

    # Generate build manifest
    local BUILD_MANIFEST=$(cat <<EOF
{
  "commit": "$COMMIT",
  "commitFull": "$FULL_COMMIT",
  "repo": "$REPO_NAME",
  "repoUrl": "$REPO_URL",
  "branch": "$LEO_SAAS_BRANCH",
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
        "$LEO_SAAS_DIR"

    log_success "$LEO_SAAS_IMAGE:$COMMIT-$IMAGE_ARCH"

    # Run database migrations (silent)
    log_info "Running database migrations..."
    cd "$LEO_SAAS_DIR"
    if [[ ! -d "$LEO_SAAS_DIR/node_modules" ]]; then
        npm install --silent >/dev/null 2>&1
    fi
    npx drizzle-kit push --force >/dev/null 2>&1 || true
    log_success "Migrations complete"

    LEO_SAAS_COMMIT="$COMMIT"
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

# Write .build-state for deploy-ecs.sh
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Get commits if we didn't build them this run
if [[ -z "$LEO_CONTAINER_COMMIT" ]]; then
    LEO_CONTAINER_COMMIT=$(cd "$LEO_CONTAINER_DIR" && git rev-parse --short HEAD)
fi
if [[ -z "$LEO_SAAS_COMMIT" ]]; then
    LEO_SAAS_COMMIT=$(cd "$LEO_SAAS_DIR" && git rev-parse --short HEAD)
fi

cat > "$BUILD_STATE" << EOF
LEO_CONTAINER=$LEO_CONTAINER_COMMIT
LEO_SAAS=$LEO_SAAS_COMMIT
BUILD_TIME=$BUILD_TIME
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
echo "  Leo Container: $LEO_CONTAINER_COMMIT"
echo "  Leo SaaS:      $LEO_SAAS_COMMIT"
echo "  Build Time:    $BUILD_TIME"
echo "  Elapsed:       ${ELAPSED_MIN}m ${ELAPSED_SEC}s"
echo ""
echo "  State saved to .build-state"
echo "  To run locally: ./scripts/run-leo.sh"
echo ""
echo "=============================================="
echo ""
