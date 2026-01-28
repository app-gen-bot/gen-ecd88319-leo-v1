# Fix for Sign-In Issue

## Problem
The demo user (demo@example.com) could not sign in because:
1. Better Auth was running but not properly handling requests (returning 404)
2. Demo user existed in main DynamoDB table but not in Better Auth's table
3. The original Better Auth server implementation had issues with request handling

## Solution Applied

### 1. Created Demo User in Better Auth Table
```bash
cd backend
npx tsx auth/create-demo-user.ts
```

This created the demo user directly in the Better Auth DynamoDB table with:
- Email: demo@example.com
- Password: DemoRocks2025!
- Proper password hashing with bcrypt

### 2. Fixed Better Auth Server (Recommended)
Created a new Express-based server (`auth/simple-server.ts`) that properly handles Better Auth:
```typescript
import express from 'express';
import { toNodeHandler } from 'better-auth/node';
```

### 3. Updated Start Script
The `start_servers.sh` script now starts the correct Better Auth server.

## Steps to Fix Sign-In

### Option 1: Quick Fix (Demo User Only)
If the servers are already running and you just need the demo user to work:

```bash
cd backend
npx tsx auth/create-demo-user.ts
```

Then try signing in with demo@example.com / DemoRocks2025!

### Option 2: Full Restart (Recommended)
1. Stop all servers (Ctrl+C in the terminal running start_servers.sh)

2. Restart with the updated script:
```bash
./start_servers.sh
```

3. The demo user should now be able to sign in

### Option 3: Manual Server Start
If you prefer to start servers individually:

```bash
# Terminal 1 - Better Auth (NEW Express server)
cd backend
npm run auth:start

# Terminal 2 - Backend API
cd backend
source venv/bin/activate
python simple_server.py

# Terminal 3 - Frontend
cd frontend
npm run dev
```

## Verification
1. Go to http://localhost:3000/sign-in
2. Use credentials: demo@example.com / DemoRocks2025!
3. You should be redirected to the dashboard

## Technical Details

### Better Auth Table Structure
The Better Auth DynamoDB table uses:
- `pk` (lowercase) - Partition key like "USER#uuid"
- `sk` (lowercase) - Sort key like "PROFILE"
- `entity_type` - To identify record types

### Authentication Flow
1. Frontend sends login request to Backend API (port 8000)
2. Backend proxies to Better Auth server (port 3095)
3. Better Auth validates credentials against DynamoDB
4. Session cookie is set for authentication
5. Frontend redirects to dashboard

## Troubleshooting

### "Cannot find module" errors
Make sure you're in the backend directory and have installed dependencies:
```bash
cd backend
npm install
```

### Better Auth not responding
Check if it's running on port 3095:
```bash
lsof -i:3095
```

If not, restart it:
```bash
npm run auth:start
```

### DynamoDB connection issues
Verify AWS credentials in the root .env file:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- DYNAMODB_AUTH_TABLE_NAME=better-auth-table