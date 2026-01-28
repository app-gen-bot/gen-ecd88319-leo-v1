# Create Test User - Quick Fix

## Problem
Existing users in database have unknown passwords, causing login failures.

## Solution
Use the API to create a new test user with a known password.

## Create Test User

```bash
# Create a test user
curl -X POST http://localhost:5013/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@fizzcard.com",
    "password": "password123",
    "name": "Test User"
  }'
```

## Login with Test User

```bash
# Login
curl -X POST http://localhost:5013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@fizzcard.com",
    "password": "password123"
  }'
```

## From the Browser

1. Go to http://localhost:5014
2. Click "Sign Up"
3. Use:
   - Name: Test User
   - Email: test@fizzcard.com
   - Password: password123

## For Existing Users

If you need to login as an existing user (like labhesh@gmail.com), you need to know their password from when they were created.

### Option 1: Create New User
Just create a new user with a known password using signup.

### Option 2: Reset Database
If you need to start fresh:

```bash
# This will reset all data
cd server
npm run db:push
```

Then run the network seeding script to populate with demo data:

```bash
npm run seed:network
```

All seeded users have password: `password123`

## Pre-Seeded Demo Users

If you ran `npm run seed:network`, these users exist with password `password123`:

- alice@fizzcard.com
- bob@fizzcard.com
- charlie@fizzcard.com
- diana@fizzcard.com
- eve@fizzcard.com
- user1@demo.com through user10@demo.com

## Quick Test

```bash
# Works immediately - I just created this user
curl -X POST http://localhost:5013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testnew@example.com",
    "password": "testpass123"
  }'
```

Response:
```json
{
  "user": {
    "id": 89,
    "email": "testnew@example.com",
    "name": "Test User",
    "role": "user"
  },
  "token": "mock_token_89_..."
}
```
