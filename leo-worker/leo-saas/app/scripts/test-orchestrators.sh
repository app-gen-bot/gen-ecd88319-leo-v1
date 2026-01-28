#!/bin/bash

# ============================================
# Orchestrator Testing Script
# ============================================
# Tests both Local Docker and AWS ECS orchestrator modes
# Usage:
#   ./scripts/test-orchestrators.sh            # Run all tests
#   ./scripts/test-orchestrators.sh local      # Test local mode only
#   ./scripts/test-orchestrators.sh aws        # Test AWS mode only
#   ./scripts/test-orchestrators.sh build      # Build images only

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

# Configuration
MODE=${1:-all}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check .env file exists
if [ ! -f ".env" ]; then
    error ".env file not found"
    warn "Copy .env.example to .env and configure your credentials"
    exit 1
fi

# Load environment variables
source .env

# Verify required environment variables
check_env_vars() {
    local missing=()

    # Required for both modes
    [ -z "$SUPABASE_URL" ] && missing+=("SUPABASE_URL")
    [ -z "$SUPABASE_ANON_KEY" ] && missing+=("SUPABASE_ANON_KEY")
    [ -z "$DATABASE_URL" ] && missing+=("DATABASE_URL")

    # Required for AWS mode
    if [ "$MODE" == "aws" ] || [ "$MODE" == "all" ]; then
        [ -z "$ECS_CLUSTER" ] && missing+=("ECS_CLUSTER")
        [ -z "$AWS_REGION" ] && missing+=("AWS_REGION")
        [ -z "$S3_BUCKET" ] && missing+=("S3_BUCKET")
    fi

    if [ ${#missing[@]} -ne 0 ]; then
        error "Missing required environment variables:"
        for var in "${missing[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
}

# Build Docker image
build_image() {
    header "🏗️  Building Docker Image"

    log "Building app-gen-saas:test image..."

    docker build \
        --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
        --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
        --build-arg VITE_API_URL="http://localhost:5013" \
        --build-arg GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" \
        --build-arg BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        --build-arg APP_VERSION="test" \
        -t app-gen-saas:test \
        -f Dockerfile \
        .

    success "Docker image built successfully"
}

# Clean up containers and networks
cleanup() {
    header "🧹 Cleaning Up"

    log "Stopping containers..."
    docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true

    log "Removing test networks..."
    docker network rm test-local-network 2>/dev/null || true
    docker network rm test-aws-network 2>/dev/null || true

    log "Cleaning test workspace..."
    rm -rf ./test-workspace-local/* 2>/dev/null || true

    success "Cleanup complete"
}

# Test Local Docker Mode
test_local() {
    header "🐳 Testing Local Docker Mode"

    log "Starting local mode container..."
    docker-compose -f docker-compose.test.yml up -d test-local

    log "Waiting for service to be healthy..."
    timeout 60s bash -c 'until docker inspect --format="{{.State.Health.Status}}" app-gen-test-local | grep -q "healthy"; do sleep 2; done' || {
        error "Local mode failed to become healthy"
        docker-compose -f docker-compose.test.yml logs test-local
        return 1
    }

    success "Local mode is healthy"

    log "Testing local mode API..."
    curl -f http://localhost:5013/health || {
        error "Health check failed"
        return 1
    }

    success "Local mode is responding"

    # Show logs
    info "Container logs:"
    docker-compose -f docker-compose.test.yml logs --tail=20 test-local
}

# Test AWS ECS Mode
test_aws() {
    header "☁️  Testing AWS ECS Mode"

    log "Starting AWS mode container..."
    docker-compose -f docker-compose.test.yml up -d test-aws

    log "Waiting for service to be healthy..."
    timeout 60s bash -c 'until docker inspect --format="{{.State.Health.Status}}" app-gen-test-aws | grep -q "healthy"; do sleep 2; done' || {
        error "AWS mode failed to become healthy"
        docker-compose -f docker-compose.test.yml logs test-aws
        return 1
    }

    success "AWS mode is healthy"

    log "Testing AWS mode API..."
    curl -f http://localhost:5014/health || {
        error "Health check failed"
        return 1
    }

    success "AWS mode is responding"

    # Show logs
    info "Container logs:"
    docker-compose -f docker-compose.test.yml logs --tail=20 test-aws
}

# Run automated tests
run_automated_tests() {
    header "🧪 Running Automated Tests"

    log "Starting test runner..."
    docker-compose -f docker-compose.test.yml up --exit-code-from test-runner test-runner || {
        error "Automated tests failed"
        docker-compose -f docker-compose.test.yml logs test-runner
        return 1
    }

    success "All automated tests passed"
}

# Show test results
show_results() {
    header "📊 Test Results"

    if [ -f "./test-results/summary.txt" ]; then
        cat ./test-results/summary.txt
    fi

    info "\nTest logs saved to: ./test-results/"
    info "Container logs:"
    info "  Local: docker-compose -f docker-compose.test.yml logs test-local"
    info "  AWS:   docker-compose -f docker-compose.test.yml logs test-aws"
}

# Main execution
main() {
    header "🚀 Orchestrator Testing Suite"

    info "Mode: $MODE"
    info "Project: $PROJECT_ROOT"

    # Check environment
    check_env_vars

    # Cleanup first
    cleanup

    # Build or test
    case "$MODE" in
        build)
            build_image
            success "Build complete"
            ;;

        local)
            build_image
            test_local
            success "Local mode test complete"
            ;;

        aws)
            build_image
            test_aws
            success "AWS mode test complete"
            ;;

        all)
            build_image
            test_local
            test_aws
            run_automated_tests
            show_results
            success "All tests complete"
            ;;

        *)
            error "Invalid mode: $MODE"
            echo "Usage: $0 [build|local|aws|all]"
            exit 1
            ;;
    esac

    # Final cleanup
    if [ "$MODE" != "build" ]; then
        echo ""
        read -p "Stop containers? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cleanup
        else
            info "Containers left running. Clean up with: docker-compose -f docker-compose.test.yml down"
        fi
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main
main
