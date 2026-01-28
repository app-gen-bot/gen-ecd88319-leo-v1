#!/bin/bash

# Start AI Lawyer Application Servers

echo "Starting AI Lawyer Application..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill any existing processes on the ports
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3095 | xargs kill -9 2>/dev/null
sleep 2

# Start Better Auth Server (MUST be first!)
echo -e "${GREEN}Starting Better Auth Server on port 3095...${NC}"
cd backend
npm run auth:start > auth-server.log 2>&1 &
AUTH_PID=$!

# Wait for Better Auth to start
echo "Waiting for Better Auth server to start..."
sleep 5

# Check if Better Auth is running
if ! lsof -i:3095 >/dev/null 2>&1; then
    echo -e "${RED}Failed to start Better Auth server!${NC}"
    echo "Check backend/auth-server.log for errors"
    exit 1
fi

# Start Backend Server
echo -e "${GREEN}Starting Backend API Server on port 8000...${NC}"
export SUPPORTED_FILE_TYPES='[".pdf",".png",".jpg",".jpeg",".docx",".txt"]'
export ALLOWED_ORIGINS='["http://localhost:3000", "http://localhost:3001", "http://localhost:3095"]'

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "Using Python virtual environment..."
    source venv/bin/activate
fi

python -m uvicorn main:app --port 8000 --reload > backend-server.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend API to start..."
sleep 5

# Check if backend is running
if ! lsof -i:8000 >/dev/null 2>&1; then
    echo -e "${RED}Failed to start Backend API server!${NC}"
    echo "Check backend/backend-server.log for errors"
    kill $AUTH_PID 2>/dev/null
    exit 1
fi

# Start Frontend Server
echo -e "${GREEN}Starting Frontend Server on port 3000...${NC}"
cd ../frontend
npm run dev > frontend-server.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 10

# Display success message
echo ""
echo -e "${GREEN}All servers started successfully!${NC}"
echo "=================================="
echo -e "${GREEN}✓${NC} Better Auth Server: http://localhost:3095"
echo -e "${GREEN}✓${NC} Backend API: http://localhost:8000"
echo -e "${GREEN}✓${NC} Frontend: http://localhost:3000"
echo -e "${GREEN}✓${NC} API Docs: http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Demo credentials:${NC} demo@example.com / DemoRocks2025!"
echo ""
echo "Server logs:"
echo "  - Better Auth: backend/auth-server.log"
echo "  - Backend API: backend/backend-server.log"
echo "  - Frontend: frontend/frontend-server.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all servers...${NC}"
    kill $AUTH_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    
    # Also kill any orphaned processes
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:3095 | xargs kill -9 2>/dev/null
    
    echo -e "${GREEN}All servers stopped.${NC}"
    exit 0
}

# Wait for Ctrl+C
trap cleanup INT TERM
wait