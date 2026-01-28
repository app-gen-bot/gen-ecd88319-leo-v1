# AI Lawyer Authentication Setup Guide

## Overview

The AI Lawyer app uses Better Auth for authentication. This requires running TWO separate servers:

1. **Better Auth Server** (Port 3095) - Handles all authentication
2. **FastAPI Backend** (Port 8000) - Main API that proxies auth requests to Better Auth

## Architecture

```
Frontend (3000)
    ↓
Backend API (8000)
    ↓ (proxies auth requests)
Better Auth Server (3095)
    ↓
DynamoDB (AWS)
```

## Setup Instructions

### 1. Environment Variables

Ensure these are set in `/Users/labheshpatel/apps/app-factory/.env`:

```bash
# Better Auth
BETTER_AUTH_SECRET=PhQ5Pk+0iJ03dWr6Tq0L+/CXZA1x7TsES3EYj+kM0h4=
BETTER_AUTH_URL=http://localhost:3095
DEMO_USER_PASSWORD=DemoRocks2025!

# AWS (for DynamoDB)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
DYNAMODB_AUTH_TABLE_NAME=better-auth-table
```

### 2. Install Dependencies

```bash
cd backend

# Install Node.js dependencies (for Better Auth)
npm install

# Install Python dependencies (for FastAPI)
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Start the Servers

You need TWO terminal windows:

**Terminal 1 - Better Auth Server:**
```bash
cd backend
npm run auth:dev
# Should see: 🔐 Better Auth server running on http://localhost:3095
```

**Terminal 2 - FastAPI Backend:**
```bash
cd backend
source venv/bin/activate
python simple_server.py
# Should see: INFO: Uvicorn running on http://0.0.0.0:8000
```

### 4. Test the Setup

```bash
cd backend
source venv/bin/activate
python test_backend_auth.py
```

This will test:
- Health check
- User signup
- User login  
- Session validation

## Common Issues

### "Connection refused on port 3095"
- The Better Auth server is not running
- Solution: Run `npm run auth:dev` in the backend directory

### "Authentication service is not available"
- Better Auth server crashed or isn't started
- Check Terminal 1 for error messages
- Restart with `npm run auth:dev`

### "Internal server error" from Better Auth
- Usually means the DynamoDB adapter has an issue
- Check AWS credentials in .env
- Verify DynamoDB tables exist: `python test_auth_setup.py`

### TypeScript/Node errors
- Make sure you have Node.js 18+ installed
- Run `npm install` to get all dependencies

## API Endpoints

### Better Auth Server (3095)
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Check session
- `POST /api/auth/signout` - Logout

### Backend API (8000) - Proxies to Better Auth
- `POST /api/v1/auth/signup` - Create account
- `POST /api/v1/auth/login` - Login  
- `GET /api/v1/auth/session` - Check session
- `POST /api/v1/auth/logout` - Logout

## Development Tips

1. Always start Better Auth server BEFORE the FastAPI backend
2. Better Auth uses cookies for session management
3. The custom DynamoDB adapter stores all auth data
4. Check server logs in both terminals for debugging
5. Frontend should only call Backend API endpoints (port 8000), never Better Auth directly

## Files Structure

```
backend/
├── auth/
│   ├── server.ts          # Better Auth server entry
│   ├── auth-server.ts     # Better Auth configuration
│   ├── dynamodb-adapter.ts # Custom DynamoDB adapter
│   └── README.md          # Auth-specific docs
├── api/
│   └── auth.py           # FastAPI auth proxy endpoints
├── package.json          # Node dependencies
├── requirements.txt      # Python dependencies
└── test_backend_auth.py  # Test script
```