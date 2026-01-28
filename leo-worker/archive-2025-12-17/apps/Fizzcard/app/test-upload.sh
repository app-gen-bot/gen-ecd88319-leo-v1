#!/bin/bash

# FizzCard Upload API Test Script
# Tests the avatar upload endpoint with various scenarios

API_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo "=================================="
echo "FizzCard Upload API Test"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login to get token
echo "Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  echo ""
  echo "Make sure:"
  echo "  1. Server is running on $API_URL"
  echo "  2. Test user exists (email: $TEST_EMAIL)"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test missing file
echo "Step 2: Testing missing file upload..."
MISSING_FILE_RESPONSE=$(curl -s -X POST "$API_URL/api/upload/avatar" \
  -H "Authorization: Bearer $TOKEN")

if echo "$MISSING_FILE_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Correctly rejected missing file${NC}"
  echo "Error: $(echo $MISSING_FILE_RESPONSE | jq -r '.error')"
else
  echo -e "${RED}✗ Should have rejected missing file${NC}"
fi
echo ""

# Step 3: Test without authentication
echo "Step 3: Testing upload without authentication..."
NO_AUTH_RESPONSE=$(curl -s -X POST "$API_URL/api/upload/avatar")

if echo "$NO_AUTH_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Correctly rejected unauthenticated request${NC}"
  echo "Error: $(echo $NO_AUTH_RESPONSE | jq -r '.error')"
else
  echo -e "${RED}✗ Should have required authentication${NC}"
fi
echo ""

# Step 4: Test with valid image (if available)
echo "Step 4: Testing upload with valid image..."

# Create a small test image using base64
TEST_IMAGE_PATH="/tmp/test-avatar.jpg"

if command -v convert > /dev/null 2>&1; then
  # If ImageMagick is available, create a test image
  convert -size 200x200 xc:blue "$TEST_IMAGE_PATH" 2>/dev/null

  if [ -f "$TEST_IMAGE_PATH" ]; then
    echo "Created test image: $TEST_IMAGE_PATH"

    UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/upload/avatar" \
      -H "Authorization: Bearer $TOKEN" \
      -F "avatar=@$TEST_IMAGE_PATH")

    if echo "$UPLOAD_RESPONSE" | jq -e '.avatarUrl' > /dev/null 2>&1; then
      echo -e "${GREEN}✓ Upload successful${NC}"
      echo "Avatar URL length: $(echo $UPLOAD_RESPONSE | jq -r '.avatarUrl' | wc -c)"
      echo "Dimensions: $(echo $UPLOAD_RESPONSE | jq -r '.dimensions.width')x$(echo $UPLOAD_RESPONSE | jq -r '.dimensions.height')"
      echo "Size: $(echo $UPLOAD_RESPONSE | jq -r '.size') bytes"
      echo "MIME type: $(echo $UPLOAD_RESPONSE | jq -r '.mimeType')"
    else
      echo -e "${RED}✗ Upload failed${NC}"
      echo "Response: $UPLOAD_RESPONSE"
    fi

    rm "$TEST_IMAGE_PATH"
  else
    echo -e "${YELLOW}⚠ Could not create test image${NC}"
  fi
else
  echo -e "${YELLOW}⚠ ImageMagick not available - skipping image upload test${NC}"
  echo "Install ImageMagick to run this test: brew install imagemagick"
fi
echo ""

# Step 5: Test with invalid file type (if we have a text file)
echo "Step 5: Testing upload with invalid file type..."
TEST_TEXT_PATH="/tmp/test-file.txt"
echo "This is not an image" > "$TEST_TEXT_PATH"

INVALID_TYPE_RESPONSE=$(curl -s -X POST "$API_URL/api/upload/avatar" \
  -H "Authorization: Bearer $TOKEN" \
  -F "avatar=@$TEST_TEXT_PATH")

if echo "$INVALID_TYPE_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Correctly rejected invalid file type${NC}"
  echo "Error: $(echo $INVALID_TYPE_RESPONSE | jq -r '.error')"
else
  echo -e "${RED}✗ Should have rejected non-image file${NC}"
fi

rm "$TEST_TEXT_PATH"
echo ""

echo "=================================="
echo "Test Complete"
echo "=================================="
echo ""
echo "To test with your own image:"
echo "  curl -X POST $API_URL/api/upload/avatar \\"
echo "    -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "    -F \"avatar=@/path/to/image.jpg\""
