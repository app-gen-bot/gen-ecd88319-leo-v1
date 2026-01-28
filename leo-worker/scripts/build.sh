#!/bin/bash
# ============================================
# Leo Container - Docker Build Script
# ============================================
# Builds the generator container from leo-container directory
# Usage: ./build.sh [commit-hash]
# Example: ./build.sh e72a0a3

set -e

# Configuration
IMAGE_NAME="leo-container"

# Get the leo-container directory (one level up from scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LEO_CONTAINER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse arguments
NO_CACHE=""
GIT_SHA=""
for arg in "$@"; do
    if [[ "$arg" == "--no-cache" ]]; then
        NO_CACHE="--no-cache"
    elif [[ -z "$GIT_SHA" && "$arg" != "--"* ]]; then
        GIT_SHA="$arg"
    fi
done

# Default to current commit if not provided
if [ -z "$GIT_SHA" ]; then
    GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
fi

BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Leo Container - Docker Build${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Image:${NC} ${IMAGE_NAME}"
echo -e "${GREEN}Commit:${NC} ${GIT_SHA}"
echo -e "${GREEN}Build Date:${NC} ${BUILD_DATE}"
echo -e "${GREEN}Build Context:${NC} ${LEO_CONTAINER_DIR}"
echo ""

# Build from leo-container directory (where Dockerfile is)
cd "$LEO_CONTAINER_DIR"

if [[ -n "$NO_CACHE" ]]; then
    echo -e "${YELLOW}Building Docker image for linux/amd64 (no cache)...${NC}"
else
    echo -e "${YELLOW}Building Docker image for linux/amd64...${NC}"
fi

docker build $NO_CACHE \
  --platform linux/amd64 \
  --tag "${IMAGE_NAME}:${GIT_SHA}" \
  --build-arg BUILD_DATE="${BUILD_DATE}" \
  --build-arg VERSION="${GIT_SHA}" \
  .

# Get image size
IMAGE_SIZE=$(docker images "${IMAGE_NAME}:${GIT_SHA}" --format "{{.Size}}")
echo -e "${GREEN}✅ Build complete! Size: ${IMAGE_SIZE}${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Build Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Image built:${NC}"
echo "  ${IMAGE_NAME}:${GIT_SHA}"

# Update Leo SaaS .env.local with the new container image
LEO_SAAS_ENV="$HOME/WORK/LEO/saas-dev-agent/repos/gen-219eda6b-032862af/.env.local"
if [[ -f "$LEO_SAAS_ENV" ]]; then
    echo ""
    echo -e "${YELLOW}Updating Leo SaaS .env.local...${NC}"
    # Use sed to update GENERATOR_IMAGE
    if grep -q "^GENERATOR_IMAGE=" "$LEO_SAAS_ENV"; then
        sed -i.bak "s|^GENERATOR_IMAGE=.*|GENERATOR_IMAGE=${IMAGE_NAME}:${GIT_SHA}|" "$LEO_SAAS_ENV"
        rm -f "${LEO_SAAS_ENV}.bak"
        echo -e "${GREEN}✅ Updated GENERATOR_IMAGE=${IMAGE_NAME}:${GIT_SHA}${NC}"
    else
        echo "GENERATOR_IMAGE=${IMAGE_NAME}:${GIT_SHA}" >> "$LEO_SAAS_ENV"
        echo -e "${GREEN}✅ Added GENERATOR_IMAGE=${IMAGE_NAME}:${GIT_SHA}${NC}"
    fi
    echo ""
    echo -e "${YELLOW}⚠️  Restart Leo SaaS to use new container:${NC}"
    echo "   docker stop leo-saas-generated && docker rm leo-saas-generated"
    echo "   ./scripts/run-leo.sh --detach"
else
    echo ""
    echo -e "${YELLOW}To use this container, set in Leo SaaS .env.local:${NC}"
    echo "   GENERATOR_IMAGE=${IMAGE_NAME}:${GIT_SHA}"
fi

# Cleanup: Remove old images to prevent disk bloat
echo ""
echo -e "${YELLOW}Cleaning up Docker resources...${NC}"

# Remove OLD leo-container images (keep only current commit tag)
OLD_IMAGES=$(docker images "leo-container" --format "{{.Tag}}" | grep -v -E "^${GIT_SHA}$" 2>/dev/null)
if [ -n "$OLD_IMAGES" ]; then
    echo "  Removing old leo-container images..."
    for tag in $OLD_IMAGES; do
        docker rmi "leo-container:$tag" 2>/dev/null || true
    done
fi

# Remove dangling images (untagged intermediates)
DANGLING=$(docker images -f "dangling=true" -q 2>/dev/null)
if [ -n "$DANGLING" ]; then
    echo "  Removing dangling images..."
    docker rmi $DANGLING 2>/dev/null || true
fi

# Remove stopped containers from previous runs
STOPPED=$(docker ps -aq -f "status=exited" -f "ancestor=leo-container" 2>/dev/null)
if [ -n "$STOPPED" ]; then
    echo "  Removing stopped leo containers..."
    docker rm $STOPPED 2>/dev/null || true
fi

# Keep build cache for fast rebuilds - only prune if manually requested
# Run `docker builder prune -af` manually if disk space is needed
echo "  Build cache preserved for fast rebuilds"

# Show final disk usage
echo ""
echo -e "${GREEN}Docker disk usage:${NC}"
docker system df

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
