#!/bin/bash

# =============================================================================
# Local Testing Script for Happy Llama
# =============================================================================
#
# This script starts the app locally with Docker Compose and verifies
# that all environment variables are loaded correctly.
#
# Usage:
#   ./scripts/test-local.sh
#
# Prerequisites:
#   - .env file with all required variables
#   - Docker and Docker Compose installed
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Happy Llama - Local Testing ===${NC}"
echo ""

# Check if .env exists
if [[ ! -f .env ]]; then
  echo -e "${RED}ERROR: .env file not found${NC}"
  echo "Please create a .env file with required variables"
  exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"

# Check for required variables
REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_ANON_KEY" "DATABASE_URL" "GITHUB_BOT_TOKEN")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" .env; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo -e "${RED}ERROR: Missing required variables in .env:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo -e "  - $var"
  done
  exit 1
fi

echo -e "${GREEN}✓ All required variables present${NC}"
echo ""

# Stop any running containers
echo -e "${YELLOW}Stopping any running containers...${NC}"
docker-compose down 2>/dev/null || true

# Build and start
echo -e "${GREEN}Building and starting containers...${NC}"
docker-compose up --build -d

# Wait for service to be ready
echo -e "${YELLOW}Waiting for service to be ready...${NC}"
sleep 5

# Check health
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s http://localhost:5013/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Service is healthy!${NC}"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}ERROR: Service failed to start${NC}"
    echo ""
    echo "Logs:"
    docker-compose logs --tail=50
    exit 1
  fi
  sleep 1
done

# Display environment check
echo ""
echo -e "${GREEN}=== Environment Check ===${NC}"
docker-compose exec -T happy-llama node -e "
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('GITHUB_BOT_TOKEN:', process.env.GITHUB_BOT_TOKEN ? '✓ Set' : '✗ Missing');
console.log('CLAUDE_CODE_OAUTH_TOKEN:', process.env.CLAUDE_CODE_OAUTH_TOKEN ? '✓ Set' : '✗ Missing');
"

echo ""
echo -e "${GREEN}=== Service Info ===${NC}"
curl -s http://localhost:5013/health | jq '.'

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Happy Llama is running locally!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "  URL: ${YELLOW}http://localhost:5013${NC}"
echo ""
echo -e "To view logs:"
echo -e "  docker-compose logs -f"
echo ""
echo -e "To stop:"
echo -e "  docker-compose down"
echo ""
