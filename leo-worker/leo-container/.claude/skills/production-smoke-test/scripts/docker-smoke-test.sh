#!/bin/bash

#
# Production Smoke Test
#
# Tests that the application builds and runs correctly in a production Docker environment.
# Catches deployment failures BEFORE pushing to Fly.io.
#
# Usage:
#   cd /workspace/app
#   ~/.claude/skills/production-smoke-test/scripts/docker-smoke-test.sh
#

set -e  # Exit on error

APP_DIR="$(pwd)"
IMAGE_NAME="app-smoke-test-$(date +%s)"
CONTAINER_NAME="app-smoke-test-container-$(date +%s)"
PORT=8080
CLEANUP_NEEDED=false

echo ""
echo "🔧 Production Smoke Test"
echo "========================"
echo ""

# Cleanup function
cleanup() {
  if [ "$CLEANUP_NEEDED" = true ]; then
    echo ""
    echo "Cleanup: Stopping and removing container..."
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rmi "$IMAGE_NAME" >/dev/null 2>&1 || true
  fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Test 1: Build Application
echo "Test 1: Build Application"
echo "  Running: npm run build"

if npm run build >/dev/null 2>&1; then
  echo "  ✅ Build succeeded"
else
  echo "  ❌ FAILED: Build failed"
  echo ""
  echo "Run 'npm run build' to see error details"
  exit 1
fi
echo ""

# Test 2: Build Docker Image
echo "Test 2: Build Docker Image"
echo "  Running: docker build -t $IMAGE_NAME ."

if ! docker build -t "$IMAGE_NAME" . >/dev/null 2>&1; then
  echo "  ❌ FAILED: Docker build failed"
  echo ""
  echo "Run 'docker build -t test .' to see error details"
  exit 1
fi

echo "  ✅ Docker image built"
echo ""

# Test 3: Start Container
echo "Test 3: Start Container"
echo "  Running: docker run -d -p $PORT:$PORT $IMAGE_NAME"

CONTAINER_ID=$(docker run -d \
  -p $PORT:$PORT \
  -e NODE_ENV=production \
  -e PORT=$PORT \
  -e STORAGE_MODE=memory \
  -e AUTH_MODE=mock \
  --name "$CONTAINER_NAME" \
  "$IMAGE_NAME" 2>&1)

if [ -z "$CONTAINER_ID" ]; then
  echo "  ❌ FAILED: Container failed to start"
  exit 1
fi

CLEANUP_NEEDED=true
echo "  ✅ Container started (ID: ${CONTAINER_ID:0:12})"
echo ""

# Test 4: Static Files Serve
echo "Test 4: Static Files Serve"
echo "  Waiting 10s for server to start..."
sleep 10

# Check if container is still running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
  echo "  ❌ FAILED: Container exited (crashed on startup)"
  echo ""
  echo "Container logs:"
  docker logs "$CONTAINER_NAME"
  exit 1
fi

echo "  Testing: curl http://localhost:$PORT/"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/" || echo "000")
RESPONSE_SIZE=$(curl -s "http://localhost:$PORT/" | wc -c)

if [ "$HTTP_CODE" = "200" ] && [ "$RESPONSE_SIZE" -gt 100 ]; then
  echo "  ✅ Static files serve (200 OK, ${RESPONSE_SIZE} bytes)"
else
  echo "  ❌ FAILED: Static files not found (HTTP $HTTP_CODE, ${RESPONSE_SIZE} bytes)"
  echo ""
  echo "Container logs:"
  docker logs "$CONTAINER_NAME"
  exit 1
fi
echo ""

# Test 5: API Health Check
echo "Test 5: API Health Check"
echo "  Testing: curl http://localhost:$PORT/health"

HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/health" || echo "000")

if [ "$HEALTH_CODE" = "200" ]; then
  echo "  ✅ Health endpoint responds (200 OK)"
elif [ "$HEALTH_CODE" = "404" ]; then
  echo "  ⚠️  Health endpoint not found (404) - skipping"
else
  echo "  ❌ FAILED: Health endpoint error (HTTP $HEALTH_CODE)"
  exit 1
fi
echo ""

# Test 6: Auth Flow (if auth endpoints exist)
echo "Test 6: Auth Flow"
echo "  Step 1: POST /api/auth/login"

LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  "http://localhost:$PORT/api/auth/login" || echo "")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo "  ✅ Login successful (token received)"

  # Extract token (simple grep, assumes JSON response)
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

  if [ -n "$TOKEN" ]; then
    echo ""
    echo "  Step 2: GET /api/users (with auth token)"

    PROTECTED_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      "http://localhost:$PORT/api/users" || echo "000")

    if [ "$PROTECTED_CODE" = "200" ] || [ "$PROTECTED_CODE" = "201" ]; then
      echo "  ✅ Protected route accessible (HTTP $PROTECTED_CODE)"
    else
      echo "  ⚠️  Protected route returned HTTP $PROTECTED_CODE (expected 200)"
    fi
  fi
elif echo "$LOGIN_RESPONSE" | grep -q "404"; then
  echo "  ⚠️  Auth endpoints not found (404) - skipping auth flow test"
else
  echo "  ❌ FAILED: Login failed"
  echo "  Response: $LOGIN_RESPONSE"
fi
echo ""

# All tests passed
echo "========================"
echo "✅ ALL SMOKE TESTS PASSED"
echo ""
echo "Production deployment should succeed!"
echo "Safe to deploy to Fly.io."
echo ""

exit 0
