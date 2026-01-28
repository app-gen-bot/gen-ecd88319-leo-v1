#!/bin/bash

# Setup script for AI Lawyer Sprint 1

echo "AI Lawyer Sprint 1 - Setup Script"
echo "================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if command -v python3.12 &> /dev/null; then
    PYTHON_VERSION=$(python3.12 --version)
    echo -e "${GREEN}✓ Python installed: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3.12 not found. Please install Python 3.12${NC}"
    exit 1
fi

# Check .env file
echo -e "${YELLOW}Checking environment configuration...${NC}"
if [ -f "../../.env" ]; then
    echo -e "${GREEN}✓ Central .env file found${NC}"
    
    # Check required variables
    REQUIRED_VARS=("OPENAI_API_KEY" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "BETTER_AUTH_SECRET")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" ../../.env; then
            echo -e "  ${GREEN}✓ $var configured${NC}"
        else
            echo -e "  ${RED}✗ $var missing${NC}"
            MISSING_VARS+=($var)
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo -e "${RED}Please add missing variables to ../../.env${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Central .env file not found at ../../.env${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "\n${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
if npm install; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Install backend dependencies
echo -e "\n${YELLOW}Installing backend dependencies...${NC}"
cd ../backend

# Install Node dependencies for Better Auth
if npm install; then
    echo -e "${GREEN}✓ Better Auth dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install Better Auth dependencies${NC}"
    exit 1
fi

# Create Python virtual environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3.12 -m venv venv
fi

# Install Python dependencies
source venv/bin/activate
if pip install -r requirements.txt; then
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install Python dependencies${NC}"
    exit 1
fi

# Make start script executable
cd ..
chmod +x start_servers.sh

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "${GREEN}=================================${NC}"
echo -e "Run ${YELLOW}./start_servers.sh${NC} to start all servers"
echo ""
echo "The script will start:"
echo "  1. Better Auth Server (port 3095)"
echo "  2. Backend API (port 8000)"
echo "  3. Frontend (port 3000)"
echo ""
echo -e "${YELLOW}Demo credentials:${NC} demo@example.com / DemoRocks2025!"