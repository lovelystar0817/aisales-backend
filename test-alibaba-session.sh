#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Testing Alibaba Session Creation"
echo "===================================="
echo ""

# Step 1: Get guest token
echo "Step 1: Creating guest user and getting token..."
GUEST_RESPONSE=$(curl -s -X POST http://localhost:8430/auth/guest/alibaba \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "alibaba-test@example.com"
  }')

# Extract token using grep and sed (works on macOS without jq)
TOKEN=$(echo "$GUEST_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//' | sed 's/"$//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  echo "Response: $GUEST_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Got guest token${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Create session
echo "Step 2: Creating sales session..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:8430/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "personaId": "697075c160b6c0c470b061da",
    "productId": "697075c160b6c0c470b061db",
    "moduleId": "discovery-call-meddpicc"
  }')

# Check if we got a session ID
if echo "$SESSION_RESPONSE" | grep -q '"sessionId"'; then
  echo -e "${GREEN}✅ Session created successfully!${NC}"
  SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"sessionId":"[^"]*"' | sed 's/"sessionId":"//' | sed 's/"$//')
  echo "Session ID: $SESSION_ID"
else
  echo -e "${RED}❌ Failed to create session${NC}"
  echo "Response: $SESSION_RESPONSE"
  exit 1
fi

echo ""
echo "🎉 All tests passed!"
