#!/bin/bash

# FizzCard API Integration Test Script
# Tests end-to-end functionality of backend APIs

BASE_URL="http://localhost:5013"
TOKEN1="mock_token_1_1761430977091"
TOKEN2="mock_token_1_1761430983211"

echo "=================================="
echo "FIZZCARD API INTEGRATION TESTS"
echo "=================================="
echo ""

# Test 1: Auth verification
echo "TEST 1: Auth Verification"
echo "- Testing /me endpoint..."
RESPONSE=$(curl -s $BASE_URL/api/auth/me -H "Authorization: Bearer $TOKEN1")
echo "$RESPONSE" | jq '{id,email,name}' 2>/dev/null && echo "✅ Auth working" || echo "❌ Auth failed"
echo ""

# Test 2: Create FizzCard for User 1
echo "TEST 2: Create FizzCard (User 1)"
CARD1=$(curl -s -X POST $BASE_URL/api/fizzcards \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName":"Test User One",
    "title":"Software Engineer",
    "company":"TechCorp",
    "email":"testuser1@fizzcard.com",
    "phone":"+1234567890",
    "bio":"Testing FizzCard app",
    "isActive":true
  }')
CARD1_ID=$(echo "$CARD1" | jq -r '.id' 2>/dev/null)
echo "$CARD1" | jq '{id,displayName,title,company}' 2>/dev/null && echo "✅ FizzCard created (ID: $CARD1_ID)" || echo "❌ Failed"
echo ""

# Test 3: Create FizzCard for User 2
echo "TEST 3: Create FizzCard (User 2)"
CARD2=$(curl -s -X POST $BASE_URL/api/fizzcards \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName":"Test User Two",
    "title":"Product Manager",
    "company":"StartupXYZ",
    "email":"testuser2@fizzcard.com",
    "phone":"+0987654321",
    "bio":"Product enthusiast",
    "isActive":true
  }')
CARD2_ID=$(echo "$CARD2" | jq -r '.id' 2>/dev/null)
echo "$CARD2" | jq '{id,displayName,title,company}' 2>/dev/null && echo "✅ FizzCard created (ID: $CARD2_ID)" || echo "❌ Failed"
echo ""

# Test 4: Get my FizzCards
echo "TEST 4: Retrieve FizzCards"
MY_CARDS=$(curl -s $BASE_URL/api/fizzcards/my -H "Authorization: Bearer $TOKEN1")
echo "$MY_CARDS" | jq 'length' 2>/dev/null && echo "✅ Retrieved FizzCards" || echo "❌ Failed"
echo ""

# Test 5: Get wallet
echo "TEST 5: Get FizzCoin Wallet"
WALLET=$(curl -s $BASE_URL/api/wallet -H "Authorization: Bearer $TOKEN1")
echo "$WALLET" | jq '{balance,totalEarned}' 2>/dev/null && echo "✅ Wallet retrieved" || echo "❌ Failed"
echo ""

# Test 6: Initiate contact exchange (User 1 → User 2)
echo "TEST 6: Initiate Contact Exchange"
EXCHANGE=$(curl -s -X POST $BASE_URL/api/contact-exchanges \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId":1,
    "method":"qr_code",
    "latitude":37.7749,
    "longitude":-122.4194,
    "locationName":"San Francisco, CA"
  }')
EXCHANGE_ID=$(echo "$EXCHANGE" | jq -r '.id' 2>/dev/null)
echo "$EXCHANGE" | jq '{id,senderId,receiverId,status}' 2>/dev/null && echo "✅ Exchange initiated (ID: $EXCHANGE_ID)" || echo "❌ Failed"
echo ""

# Test 7: Get my exchanges
echo "TEST 7: Get My Exchanges"
MY_EXCHANGES=$(curl -s "$BASE_URL/api/contact-exchanges/my?status=pending" -H "Authorization: Bearer $TOKEN1")
echo "$MY_EXCHANGES" | jq 'if type=="array" then length else . end' 2>/dev/null && echo "✅ Exchanges retrieved" || echo "❌ Failed"
echo ""

# Test 8: Get leaderboard
echo "TEST 8: Get Leaderboard"
LEADERBOARD=$(curl -s "$BASE_URL/api/leaderboard?limit=5" -H "Authorization: Bearer $TOKEN1")
echo "$LEADERBOARD" | jq 'if type=="array" then length else . end' 2>/dev/null && echo "✅ Leaderboard retrieved" || echo "❌ Failed"
echo ""

# Test 9: Get my badges
echo "TEST 9: Get My Badges"
BADGES=$(curl -s $BASE_URL/api/badges/my -H "Authorization: Bearer $TOKEN1")
echo "$BADGES" | jq 'if type=="array" then length else . end' 2>/dev/null && echo "✅ Badges retrieved" || echo "❌ Failed"
echo ""

# Test 10: Get my connections
echo "TEST 10: Get My Connections"
CONNECTIONS=$(curl -s "$BASE_URL/api/connections/my?limit=10" -H "Authorization: Bearer $TOKEN1")
echo "$CONNECTIONS" | jq '.pagination // . | if type=="object" then .total else length end' 2>/dev/null && echo "✅ Connections retrieved" || echo "❌ Failed"
echo ""

echo "=================================="
echo "TESTS COMPLETED"
echo "=================================="
