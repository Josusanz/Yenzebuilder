#!/bin/bash

# YENZE 2.0 Quick Install Script
# Run with: bash install.sh

set -e

echo "🚀 YENZE 2.0 Installation Script"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. You have: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Setup environment
if [ ! -f .env ]; then
    echo -e "${BLUE}Setting up environment file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your credentials${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Create necessary directories
echo -e "${BLUE}Creating directories...${NC}"
mkdir -p public/src/{editor,components,utils,integrations}
mkdir -p tests
mkdir -p .github/workflows
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Install Playwright browsers
echo -e "${BLUE}Installing Playwright browsers...${NC}"
npx playwright install
echo -e "${GREEN}✅ Playwright browsers installed${NC}"
echo ""

# Success message
echo ""
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit .env file with your credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo -e "${YELLOW}Don't forget to:${NC}"
echo "- Add environment variables to Vercel"
echo "- Run database migrations in Supabase"
echo "- Configure Stripe webhooks"
echo ""
echo "📚 Read MIGRATION_GUIDE_V2.md for full setup instructions"
echo ""
