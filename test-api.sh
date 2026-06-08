#!/bin/bash

# Script untuk testing API Flight Booking System
# Gunakan: bash test-api.sh

echo "==================================="
echo "Flight Booking API Test Script"
echo "==================================="
echo ""

# Warna untuk output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3333"

# Test 1: Cek Backend Running
echo -e "${YELLOW}[1] Testing Backend Connection...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/airports" | grep -q "200"; then
    echo -e "${GREEN}✓ Backend is running!${NC}"
else
    echo -e "${RED}✗ Backend is NOT running or not accessible${NC}"
    echo "   Please start backend with: cd backend && node ace serve --watch"
    exit 1
fi
echo ""

# Test 2: Test Register
echo -e "${YELLOW}[2] Testing Register Endpoint...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Test User $(date +%s)\",\"email\":\"test$(date +%s)@example.com\",\"password\":\"password123\"}")

if echo "$REGISTER_RESPONSE" | grep -q "berhasil"; then
    echo -e "${GREEN}✓ Register endpoint working!${NC}"
    echo "   Response: $REGISTER_RESPONSE"
else
    echo -e "${RED}✗ Register failed${NC}"
    echo "   Response: $REGISTER_RESPONSE"
fi
echo ""

# Test 3: Test Login dengan user yang sudah ada
echo -e "${YELLOW}[3] Testing Login Endpoint...${NC}"
# Gunakan user dari seeder
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flight.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Login endpoint working!${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token received: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "   Response: $LOGIN_RESPONSE"
    echo "   Note: Make sure you run 'node ace db:seed' first"
fi
echo ""

# Test 4: Test /me endpoint
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}[4] Testing /me Endpoint...${NC}"
    ME_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$ME_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✓ /me endpoint working!${NC}"
        echo "   User: $(echo "$ME_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)"
    else
        echo -e "${RED}✗ /me endpoint failed${NC}"
        echo "   Response: $ME_RESPONSE"
    fi
    echo ""
fi

# Test 5: Test CORS
echo -e "${YELLOW}[5] Testing CORS Configuration...${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$API_URL/api/auth/login" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓ CORS is configured!${NC}"
else
    echo -e "${RED}✗ CORS might have issues${NC}"
fi
echo ""

echo "==================================="
echo "Test Summary:"
echo "==================================="
echo "If all tests passed, your API is working correctly!"
echo "If login/register still loading in browser:"
echo "1. Check browser console (F12) for errors"
echo "2. Clear browser cache and localStorage"
echo "3. Make sure frontend is accessing the correct URL"
echo "4. Check firewall/antivirus settings"
echo ""
