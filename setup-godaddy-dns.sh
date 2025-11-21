#!/bin/bash

# 🌐 GoDaddy DNS Auto-Configuration Script
# This script automatically configures DNS records for yenze.io on GoDaddy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   GoDaddy DNS Setup for yenze.io          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if API credentials are provided
if [ -z "$GODADDY_API_KEY" ] || [ -z "$GODADDY_API_SECRET" ]; then
    echo -e "${YELLOW}⚠️  API credentials not found in environment variables${NC}"
    echo ""
    echo "To get your GoDaddy API credentials:"
    echo "1. Go to: https://developer.godaddy.com/keys"
    echo "2. Create a new API Key (select 'Production')"
    echo "3. Copy the Key and Secret"
    echo ""
    read -p "Enter your GoDaddy API Key: " GODADDY_API_KEY
    read -p "Enter your GoDaddy API Secret: " GODADDY_API_SECRET
    echo ""
fi

# Configuration
DOMAIN="yenze.io"
API_URL="https://api.godaddy.com/v1/domains/${DOMAIN}/records"
AUTH_HEADER="Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   Domain: $DOMAIN"
echo "   API Key: ${GODADDY_API_KEY:0:10}..."
echo ""

# DNS Records to create
echo -e "${BLUE}🔧 DNS Records to configure:${NC}"
echo "   1. A     @    → 76.76.21.21"
echo "   2. CNAME www  → cname.vercel-dns.com"
echo ""

# Confirm before proceeding
read -p "Do you want to proceed? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⏳ Configuring DNS records...${NC}"
echo ""

# Create A record for root domain
echo -e "${BLUE}1️⃣  Creating A record for @ (yenze.io)...${NC}"

A_RECORD='[
  {
    "type": "A",
    "name": "@",
    "data": "76.76.21.21",
    "ttl": 600
  }
]'

A_RESPONSE=$(curl -s -X PUT \
  "$API_URL/A/@" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "$A_RECORD")

if [ -z "$A_RESPONSE" ] || [ "$A_RESPONSE" = "[]" ]; then
    echo -e "${GREEN}   ✅ A record configured successfully${NC}"
else
    echo -e "${RED}   ❌ Error: $A_RESPONSE${NC}"
fi

echo ""

# Create CNAME record for www
echo -e "${BLUE}2️⃣  Creating CNAME record for www...${NC}"

CNAME_RECORD='[
  {
    "type": "CNAME",
    "name": "www",
    "data": "cname.vercel-dns.com",
    "ttl": 600
  }
]'

CNAME_RESPONSE=$(curl -s -X PUT \
  "$API_URL/CNAME/www" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "$CNAME_RECORD")

if [ -z "$CNAME_RESPONSE" ] || [ "$CNAME_RESPONSE" = "[]" ]; then
    echo -e "${GREEN}   ✅ CNAME record configured successfully${NC}"
else
    echo -e "${RED}   ❌ Error: $CNAME_RESPONSE${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ DNS Configuration Complete!    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Verify the records
echo -e "${BLUE}🔍 Verifying DNS records...${NC}"
echo ""

VERIFY_RESPONSE=$(curl -s -X GET \
  "$API_URL" \
  -H "$AUTH_HEADER")

echo "$VERIFY_RESPONSE" | grep -E "(\"type\":\"A\"|\"type\":\"CNAME\")" | head -10

echo ""
echo -e "${YELLOW}⏰ Next steps:${NC}"
echo "   1. Wait 5-15 minutes for DNS propagation"
echo "   2. Vercel will automatically verify your domain"
echo "   3. You'll receive an email when SSL certificate is ready"
echo ""
echo -e "${BLUE}🧪 To check DNS propagation:${NC}"
echo "   dig yenze.io"
echo "   dig www.yenze.io"
echo ""
echo -e "${BLUE}📊 To check Vercel domain status:${NC}"
echo "   vercel domains ls"
echo ""
echo -e "${GREEN}🎉 Done! Your domain should be live soon at:${NC}"
echo -e "${GREEN}   https://yenze.io${NC}"
echo ""
