#!/bin/bash
#
# run-generated-leo.sh - Run the generated Leo SaaS application
#
# Usage:
#   ./scripts/run-generated-leo.sh              # Run latest in container (default)
#   ./scripts/run-generated-leo.sh --dev        # Run with npm run dev (no container)
#   ./scripts/run-generated-leo.sh <commit>     # Run specific commit in container
#   ./scripts/run-generated-leo.sh --help       # Show help
#
# Prerequisites:
#   - Docker (for container mode)
#   - Node.js 18+ (for dev mode)
#   - Git access to app-gen-bot/gen-219eda6b-032862af
#
# The script uses a persistent directory at ~/dev/leo-saas-runner
# with .env.local pointing to leo-dev Supabase project.

set -e

# Configuration
REPO_URL="https://github.com/app-gen-bot/gen-219eda6b-032862af.git"
RUNNER_DIR="$HOME/dev/leo-saas-runner"
ENV_SOURCE="$HOME/dev/gen-219eda6b-032862af/.env.local"
CONTAINER_NAME="leo-saas-generated"
IMAGE_NAME="leo-saas-generated"
PORT="${LEO_GENERATED_PORT:-5014}"  # Use 5014 to avoid conflict with bootstrap on 5013

# Parse arguments
DEV_MODE=false
COMMIT=""

for arg in "$@"; do
    case $arg in
        --dev)
            DEV_MODE=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            COMMIT="$arg"
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_help() {
    echo "Usage: $0 [options] [commit]"
    echo ""
    echo "Run the generated Leo SaaS application."
    echo ""
    echo "Options:"
    echo "  --dev     Run with 'npm run dev' instead of Docker container"
    echo "  --help    Show this help message"
    echo ""
    echo "Arguments:"
    echo "  commit    Optional git commit hash or tag to checkout"
    echo "            If not provided, uses latest from origin/main"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run latest in container"
    echo "  $0 --dev              # Run latest with npm (dev mode)"
    echo "  $0 08cf12f            # Run specific commit in container"
    echo "  $0 v2.0.0             # Run tagged version"
    echo ""
    echo "Environment:"
    echo "  Runner dir: $RUNNER_DIR"
    echo "  Env source: $ENV_SOURCE"
    echo "  Container:  $CONTAINER_NAME"
}

# Handle --help (needs to be after function definition)
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
    exit 0
fi

echo ""
echo "=========================================="
echo "  Leo SaaS Runner"
if $DEV_MODE; then
    echo "  Mode: Development (npm run dev)"
else
    echo "  Mode: Container (Docker)"
fi
echo "=========================================="
echo ""

# Step 1: Ensure runner directory exists
if [[ ! -d "$RUNNER_DIR" ]]; then
    log_info "Creating runner directory: $RUNNER_DIR"
    mkdir -p "$RUNNER_DIR"
fi

# Step 2: Clone or update repository
if [[ ! -d "$RUNNER_DIR/.git" ]]; then
    log_info "Cloning repository..."
    git clone "$REPO_URL" "$RUNNER_DIR"
    log_success "Repository cloned"
else
    log_info "Fetching latest changes..."
    cd "$RUNNER_DIR"
    git fetch origin
    log_success "Fetched latest"
fi

cd "$RUNNER_DIR"

# Step 3: Checkout requested version
if [[ -n "$COMMIT" ]]; then
    log_info "Checking out: $COMMIT"
    git checkout "$COMMIT"
else
    log_info "Checking out: origin/main (latest)"
    git checkout origin/main
fi

CURRENT_COMMIT=$(git rev-parse --short HEAD)
FULL_COMMIT=$(git rev-parse HEAD)
log_success "Now at commit: $CURRENT_COMMIT"

# Step 4: Ensure .env.local exists
if [[ ! -f "$RUNNER_DIR/.env.local" ]]; then
    if [[ -f "$ENV_SOURCE" ]]; then
        log_info "Copying .env.local from source..."
        cp "$ENV_SOURCE" "$RUNNER_DIR/.env.local"
        log_success ".env.local copied"
    else
        log_error ".env.local not found at $ENV_SOURCE"
        log_error "Please create it manually with leo-dev credentials"
        exit 1
    fi
else
    log_info ".env.local already exists"
fi

# Load env vars for use in build/run
set -a
source "$RUNNER_DIR/.env.local"
set +a

# Override PORT to avoid conflict with bootstrap (5013)
PORT="${LEO_GENERATED_PORT:-5014}"

# Extract AWS credentials for injection (matches Fargate behavior)
# In Fargate: ECS task role provides credentials via instance metadata
# Locally: We inject credentials as env vars (no file mounts needed)
AWS_PROFILE="${AWS_PROFILE:-jake-dev}"
if [[ -f "$HOME/.aws/credentials" ]]; then
    # Extract credentials from AWS credentials file
    AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id --profile "$AWS_PROFILE" 2>/dev/null || echo "")
    AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key --profile "$AWS_PROFILE" 2>/dev/null || echo "")
    AWS_SESSION_TOKEN=$(aws configure get aws_session_token --profile "$AWS_PROFILE" 2>/dev/null || echo "")

    if [[ -n "$AWS_ACCESS_KEY_ID" ]]; then
        log_info "AWS credentials loaded from profile: $AWS_PROFILE"
    else
        log_warn "AWS credentials not found for profile: $AWS_PROFILE"
    fi
else
    log_warn "AWS credentials file not found at $HOME/.aws/credentials"
fi

if $DEV_MODE; then
    # ==========================================
    # DEV MODE: npm run dev
    # ==========================================

    # Install dependencies if needed
    if [[ ! -d "$RUNNER_DIR/node_modules" ]] || [[ "$RUNNER_DIR/package-lock.json" -nt "$RUNNER_DIR/node_modules" ]]; then
        log_info "Installing dependencies..."
        npm install
        log_success "Dependencies installed"
    else
        log_info "Dependencies up to date"
    fi

    # Run database migrations
    log_info "Running database migrations..."
    if npx drizzle-kit push --force 2>/dev/null; then
        log_success "Migrations applied"
    else
        log_warn "Migration check completed (may already be up to date)"
    fi

    # Start the application
    echo ""
    log_info "Starting Leo SaaS (dev mode)..."
    log_info "  Commit: $CURRENT_COMMIT"
    log_info "  Port: $PORT"
    log_info "  URL: http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""

    npm run dev
else
    # ==========================================
    # CONTAINER MODE: Docker
    # ==========================================

    # Stop existing container if running
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        log_info "Stopping existing container..."
        docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
        docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
        log_success "Existing container stopped"
    fi

    # Build the container
    log_info "Building Docker image..."
    docker build \
        --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
        --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
        --build-arg GIT_COMMIT="$FULL_COMMIT" \
        --build-arg BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --build-arg APP_VERSION="$CURRENT_COMMIT" \
        -t "$IMAGE_NAME:$CURRENT_COMMIT" \
        -t "$IMAGE_NAME:latest" \
        .
    log_success "Image built: $IMAGE_NAME:$CURRENT_COMMIT"

    # Run database migrations before starting container
    log_info "Running database migrations..."
    if [[ ! -d "$RUNNER_DIR/node_modules" ]]; then
        npm install --silent
    fi
    if npx drizzle-kit push --force 2>/dev/null; then
        log_success "Migrations applied"
    else
        log_warn "Migration check completed"
    fi

    # ==========================================
    # Start Leo SaaS Container
    # ==========================================
    # This mimics how ECS/Fly inject secrets at container start.
    # The container reads process.env.* - same as production.
    #
    # Production (Fargate):
    #   Secrets Manager → ECS Task Def → container env vars
    #
    # Production (Fly.io):
    #   fly secrets set → container env vars
    #
    # Local (this script):
    #   .env.local → docker run -e → container env vars
    #
    # The container doesn't know the difference - it just reads env vars.
    # ==========================================
    echo ""
    log_info "Starting Leo SaaS container..."

    docker run -d \
        --name "$CONTAINER_NAME" \
        -p ${PORT}:${PORT} \
        \
        `# === Platform Config ===` \
        -e NODE_ENV=production \
        -e PORT=${PORT} \
        -e LOCAL_DEV=true \
        \
        `# === Leo SaaS Database (its own DB) ===` \
        -e SUPABASE_URL="$SUPABASE_URL" \
        -e SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
        -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
        -e DATABASE_URL="$DATABASE_URL_POOLING" \
        \
        `# === Pool for Generated Apps (passed to generator containers) ===` \
        -e SUPABASE_POOL_1_URL="$SUPABASE_POOL_1_URL" \
        -e SUPABASE_POOL_1_ANON_KEY="$SUPABASE_POOL_1_ANON_KEY" \
        -e SUPABASE_POOL_1_SERVICE_ROLE_KEY="$SUPABASE_POOL_1_SERVICE_ROLE_KEY" \
        -e SUPABASE_POOL_1_DATABASE_URL="$SUPABASE_POOL_1_DATABASE_URL" \
        \
        `# === Platform Secrets (passed to generator containers) ===` \
        -e CLAUDE_CODE_OAUTH_TOKEN="$CLAUDE_CODE_OAUTH_TOKEN" \
        -e GITHUB_BOT_TOKEN="$GITHUB_BOT_TOKEN" \
        -e FLY_API_TOKEN="${FLY_API_TOKEN:-}" \
        \
        `# === AWS Credentials (for generator to access Secrets Manager if needed) ===` \
        -e AWS_REGION="${AWS_REGION:-us-east-1}" \
        ${AWS_ACCESS_KEY_ID:+-e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"} \
        ${AWS_SECRET_ACCESS_KEY:+-e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"} \
        ${AWS_SESSION_TOKEN:+-e AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN"} \
        \
        `# === Local Dev Flags ===` \
        -e USE_AWS_ORCHESTRATOR=false \
        -e USE_GITHUB_INTEGRATION=false \
        -e GENERATOR_IMAGE="leo-container:dev" \
        \
        `# === Docker Socket (to spawn generator containers) ===` \
        -v /var/run/docker.sock:/var/run/docker.sock \
        --restart unless-stopped \
        "$IMAGE_NAME:$CURRENT_COMMIT"

    log_success "Container started: $CONTAINER_NAME"

    echo ""
    log_info "  Commit: $CURRENT_COMMIT"
    log_info "  Image:  $IMAGE_NAME:$CURRENT_COMMIT"
    log_info "  Port:   $PORT"
    log_info "  URL:    http://localhost:$PORT"
    echo ""
    log_info "Useful commands:"
    echo "  docker logs -f $CONTAINER_NAME    # Follow logs"
    echo "  docker stop $CONTAINER_NAME       # Stop container"
    echo "  docker rm $CONTAINER_NAME         # Remove container"
    echo ""

    # Wait a moment and check health
    sleep 3
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        log_success "Container is running"
        log_info "Tailing logs (Ctrl+C to detach)..."
        echo ""
        docker logs -f "$CONTAINER_NAME"
    else
        log_error "Container failed to start"
        docker logs "$CONTAINER_NAME"
        exit 1
    fi
fi
