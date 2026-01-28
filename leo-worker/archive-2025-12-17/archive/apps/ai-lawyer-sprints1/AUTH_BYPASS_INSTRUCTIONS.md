# Authentication Bypass Instructions (For Debugging)

I've enabled a temporary authentication bypass so you can access the app without dealing with the login issues.

## How to Use

1. **The frontend has been configured with AUTH_BYPASS mode enabled**
   - This uses a mock user instead of real authentication
   - The `.env.local` file now contains: `NEXT_PUBLIC_AUTH_BYPASS=true`

2. **Restart the frontend server** (if it's already running):
   ```bash
   # Kill the current frontend process
   # Then restart it:
   cd frontend
   npm run dev
   ```

3. **Access the app**:
   - Go to http://localhost:3000
   - Click "Sign In" 
   - Enter ANY email/password (e.g., demo@example.com / demo)
   - You'll be logged in with a mock user and can access the dashboard

## What This Does

- Bypasses Better Auth entirely on the frontend
- Uses a mock user with these details:
  - Email: demo@example.com
  - Name: Demo User
  - Type: tenant
  - ID: demo_user_123

## To Disable Auth Bypass

When you want to go back to real authentication:

1. Edit `frontend/.env.local`
2. Change `NEXT_PUBLIC_AUTH_BYPASS=true` to `NEXT_PUBLIC_AUTH_BYPASS=false`
3. Restart the frontend server

## Note

This is ONLY for debugging. Both the frontend and backend are now bypassed, so you have full "god mode" access to all features without authentication.

## What's Bypassed

1. **Frontend**: Uses a mock user, no real authentication
2. **Backend**: All API endpoints accept any request as if from the demo user
3. **You can now**:
   - Chat with the AI lawyer
   - Upload documents
   - View conversation history
   - Access all features without any authentication