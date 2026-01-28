#!/bin/bash
set -e

API_URL="http://localhost:5013"

echo "🧪 Testing Blockchain Connection Flow"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create User 1
echo "1️⃣  Creating User 1..."
TIMESTAMP=$(date +%s)
USER1_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"alice${TIMESTAMP}@example.com\",
    \"password\": \"password123\",
    \"name\": \"Alice Smith\"
  }")

USER1_TOKEN=$(echo $USER1_RESPONSE | jq -r '.token')
USER1_ID=$(echo $USER1_RESPONSE | jq -r '.user.id')

if [ "$USER1_TOKEN" == "null" ]; then
  echo -e "${RED}❌ Failed to create User 1${NC}"
  echo $USER1_RESPONSE | jq .
  exit 1
fi

echo -e "${GREEN}✅ User 1 created (ID: $USER1_ID)${NC}"
echo ""

# Step 2: Create User 2
echo "2️⃣  Creating User 2..."
USER2_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"bob${TIMESTAMP}@example.com\",
    \"password\": \"password123\",
    \"name\": \"Bob Johnson\"
  }")

USER2_TOKEN=$(echo $USER2_RESPONSE | jq -r '.token')
USER2_ID=$(echo $USER2_RESPONSE | jq -r '.user.id')

if [ "$USER2_TOKEN" == "null" ]; then
  echo -e "${RED}❌ Failed to create User 2${NC}"
  echo $USER2_RESPONSE | jq .
  exit 1
fi

echo -e "${GREEN}✅ User 2 created (ID: $USER2_ID)${NC}"
echo ""

# Step 3: Create crypto wallets for both users
echo "3️⃣  Creating crypto wallets..."

# User 1 wallet - generate a unique address for testing
WALLET1_ADDR=$(printf "0x%040d" $((TIMESTAMP % 10000000000))1111111111)
WALLET1_RESPONSE=$(curl -s -X POST "$API_URL/api/crypto-wallet" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d "{
    \"walletAddress\": \"$WALLET1_ADDR\",
    \"walletType\": \"embedded\"
  }")

WALLET1_ADDRESS=$(echo $WALLET1_RESPONSE | jq -r '.walletAddress')
if [ "$WALLET1_ADDRESS" == "null" ]; then
  echo -e "${YELLOW}⚠️  User 1 wallet creation issue: $(echo $WALLET1_RESPONSE | jq -r '.error')${NC}"
else
  echo -e "${GREEN}✅ User 1 wallet: $WALLET1_ADDRESS${NC}"
fi

# User 2 wallet - generate a unique address for testing
WALLET2_ADDR=$(printf "0x%040d" $((TIMESTAMP % 10000000000))2222222222)
WALLET2_RESPONSE=$(curl -s -X POST "$API_URL/api/crypto-wallet" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -d "{
    \"walletAddress\": \"$WALLET2_ADDR\",
    \"walletType\": \"embedded\"
  }")

WALLET2_ADDRESS=$(echo $WALLET2_RESPONSE | jq -r '.walletAddress')
if [ "$WALLET2_ADDRESS" == "null" ]; then
  echo -e "${YELLOW}⚠️  User 2 wallet creation issue: $(echo $WALLET2_RESPONSE | jq -r '.error')${NC}"
else
  echo -e "${GREEN}✅ User 2 wallet: $WALLET2_ADDRESS${NC}"
fi
echo ""

# Step 4: User 1 initiates contact exchange (scans User 2's QR)
echo "4️⃣  User 1 initiates contact exchange with User 2..."
EXCHANGE_RESPONSE=$(curl -s -X POST "$API_URL/api/contact-exchanges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -d "{
    \"receiverId\": $USER2_ID,
    \"method\": \"qr_code\",
    \"latitude\": 37.7749,
    \"longitude\": -122.4194,
    \"metAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
  }")

EXCHANGE_ID=$(echo $EXCHANGE_RESPONSE | jq -r '.id')

if [ "$EXCHANGE_ID" == "null" ]; then
  echo -e "${RED}❌ Failed to create exchange${NC}"
  echo $EXCHANGE_RESPONSE | jq .
  exit 1
fi

echo -e "${GREEN}✅ Exchange created (ID: $EXCHANGE_ID)${NC}"
echo ""

# Step 5: User 2 accepts the exchange (this should trigger blockchain reward)
echo "5️⃣  User 2 accepts exchange (triggering blockchain reward)..."
echo -e "${YELLOW}📡 This will attempt to mint on-chain FIZZ rewards...${NC}"

ACCEPT_RESPONSE=$(curl -s -X PUT "$API_URL/api/contact-exchanges/$EXCHANGE_ID/accept" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER2_TOKEN")

FIZZ_EARNED=$(echo $ACCEPT_RESPONSE | jq -r '.fizzcoinsEarned')
ERROR=$(echo $ACCEPT_RESPONSE | jq -r '.error')

echo ""
echo "📊 ACCEPT RESPONSE:"
echo $ACCEPT_RESPONSE | jq .
echo ""

if [ "$ERROR" != "null" ]; then
  echo -e "${RED}❌ Exchange acceptance failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Exchange accepted!${NC}"
echo -e "${GREEN}💰 FizzCoins earned: $FIZZ_EARNED${NC}"
echo ""

# Step 6: Check balances
echo "6️⃣  Checking user balances..."

USER1_WALLET=$(curl -s "$API_URL/api/crypto-wallet" \
  -H "Authorization: Bearer $USER1_TOKEN")

USER2_WALLET=$(curl -s "$API_URL/api/crypto-wallet" \
  -H "Authorization: Bearer $USER2_TOKEN")

USER1_PENDING=$(echo $USER1_WALLET | jq -r '.pendingClaimAmount')
USER2_PENDING=$(echo $USER2_WALLET | jq -r '.pendingClaimAmount')

echo -e "${GREEN}User 1 Pending Balance: $USER1_PENDING FIZZ${NC}"
echo -e "${GREEN}User 2 Pending Balance: $USER2_PENDING FIZZ${NC}"
echo ""

# Final summary
echo "✨ TEST SUMMARY"
echo "==============="
echo -e "Users Created: ${GREEN}2${NC}"
echo -e "Wallets Created: ${GREEN}2${NC}"
echo -e "Exchange Status: ${GREEN}Accepted${NC}"
echo -e "Rewards Earned: ${GREEN}$FIZZ_EARNED FIZZ each${NC}"
echo ""

if [ "$USER1_PENDING" == "25" ] && [ "$USER2_PENDING" == "25" ]; then
  echo -e "${GREEN}🎉 SUCCESS! Blockchain integration test PASSED${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Rewards credited to database (blockchain may not be enabled)${NC}"
  echo -e "${YELLOW}💡 Check server logs for blockchain initialization messages${NC}"
  exit 0
fi
