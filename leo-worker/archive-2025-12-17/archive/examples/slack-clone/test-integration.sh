#!/bin/bash

echo "=== Slack Clone Integration Test ==="
echo

# Test 1: Check if frontend is running
echo "1. Testing Frontend (http://localhost:3000)..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✓ Frontend is running"
else
    echo "   ✗ Frontend is not accessible (HTTP $FRONTEND_STATUS)"
fi

# Test 2: Check if backend is running
echo "2. Testing Backend (http://localhost:8000)..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "   ✓ Backend is running"
else
    echo "   ✗ Backend is not accessible (HTTP $BACKEND_STATUS)"
fi

# Test 3: Test login
echo "3. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token' 2>/dev/null)
if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    echo "   ✓ Login successful"
    echo "   Token: ${ACCESS_TOKEN:0:20}..."
else
    echo "   ✗ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
fi

# Test 4: Test authenticated request
if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    echo "4. Testing Authenticated Request..."
    USER_RESPONSE=$(curl -s http://localhost:8000/api/v1/users/me \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    USER_EMAIL=$(echo "$USER_RESPONSE" | jq -r '.email' 2>/dev/null)
    if [ "$USER_EMAIL" = "test@example.com" ]; then
        echo "   ✓ Authentication working"
        echo "   User: $USER_EMAIL"
    else
        echo "   ✗ Authentication failed"
        echo "   Response: $USER_RESPONSE"
    fi
fi

echo
echo "=== Test Complete ==="
echo
echo "To test the full application:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Login with: test@example.com / password123"
echo "3. You should see the Slack workspace with channels"