# Authentication Fix Summary - 2025-10-23

## Problem
Authentication was bouncing users back to login page immediately after successful login. The session wasn't persisting.

## Root Cause
**Vite environment variables not available during Docker build**, causing the frontend to fall back to mock authentication instead of real Supabase authentication.

### Technical Details
In `app-gen-saas/Dockerfile`, the Supabase credentials were declared as `ARG` but **NOT set as `ENV` variables**:

```dockerfile
# BEFORE (BROKEN):
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
# ... builds frontend without these variables available
RUN npm run build  # Vite can't see the args!
```

**Why this failed:**
- Docker `ARG` makes values available to the Dockerfile script itself
- BUT Vite (the build tool) runs as a separate process and only sees `ENV` variables
- Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, the frontend code fell back to mock auth
- Mock auth doesn't persist sessions properly → immediate bounce to login

## Solution
Set the build args as ENV variables so Vite can access them during the build:

```dockerfile
# AFTER (FIXED):
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL=""

# Set as ENV so Vite can access them during build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build  # Now Vite can see these!
```

## File Changed
- `app-gen-saas/Dockerfile` (lines 13-16 added)

## Verification Steps
After rebuild:
1. Check built frontend includes Supabase URL:
   ```bash
   docker exec happy-llama grep -r "flhrcbbdmgflzgicgeua" /app/dist/
   ```

2. Check browser console logs for auth mode:
   - Should see: "🔐 Supabase Client: Supabase auth"
   - Should NOT see: "🎭 Supabase Client: Mock auth"

3. Test login:
   - Navigate to `http://localhost:5013`
   - Login with test credentials
   - Should stay on dashboard, not bounce back to login

## Related Issues
- Deploy button not showing: This was a SEPARATE issue (GitHub token mismatch) that was already fixed
- This auth bounce was introduced in commit `d89379a` when Supabase build args were added to Dockerfile but not properly exposed to Vite

## Prevention
Always remember: **Vite needs `ENV` variables at build time, not `ARG` variables!**

```dockerfile
# Pattern for Vite environment variables in Dockerfile:
ARG VITE_SOMETHING=default_value
ENV VITE_SOMETHING=$VITE_SOMETHING  # <-- Don't forget this!
```

## Testing Checklist
- [ ] Docker build completes successfully
- [ ] Container starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Login works and session persists
- [ ] Dashboard loads without bouncing to login
- [ ] Browser console shows "Supabase auth" (not "Mock auth")

## Status
- ✅ Fix identified
- ✅ Code updated
- 🔄 Docker rebuild in progress
- ⏳ Testing pending (after rebuild)

## Next Steps
1. Wait for Docker rebuild to complete
2. Start container: `docker compose up -d`
3. Test authentication flow
4. If working, commit and push
5. Rebuild AWS ECS image with same fix
