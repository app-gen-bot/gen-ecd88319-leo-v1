#!/bin/bash
# Start Better Auth Server

echo "🔐 Starting Better Auth Server on port 3095..."
echo ""
echo "This server handles all authentication for the AI Lawyer app."
echo "It must be running for login/signup to work."
echo ""

# Check if tsx is installed
if ! command -v tsx &> /dev/null; then
    echo "⚠️  tsx not found. Installing dependencies..."
    npm install
fi

# Run the Better Auth server
npm run auth:dev