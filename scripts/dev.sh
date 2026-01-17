#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}Starting Vocalize development servers...${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}Shutting down...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Setup backend inside FHS environment
if [ ! -d "backend/.venv" ]; then
    echo -e "${BLUE}Setting up backend (first run)...${NC}"
    vocalize-python -c "cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
fi

# Start backend inside FHS environment
echo -e "${GREEN}Starting backend on http://localhost:8000${NC}"
vocalize-python -c "cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" &
BACKEND_PID=$!

# Install frontend deps if needed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    (cd frontend && npm install)
fi

# Start frontend
echo -e "${GREEN}Starting frontend on http://localhost:4321${NC}"
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo -e "\n${GREEN}Both servers running. Press Ctrl+C to stop.${NC}\n"

# Wait for both processes
wait
