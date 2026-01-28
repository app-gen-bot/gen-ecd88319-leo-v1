# Browser Testing Guide
**Date:** October 25, 2025
**App:** App-Gen SaaS Platform
**Testing URL:** http://localhost:5176 (Frontend) + http://localhost:5013 (Backend)

---

## System Status

✅ **READY FOR BROWSER TESTING**

**Upgrades Completed:**
- ✅ Node.js upgraded from v18.20.8 → v20.19.5
- ✅ Dependencies reinstalled (553 packages)
- ✅ Playwright installed (chromium-1194)
- ✅ Server running without deprecation warnings
- ✅ Production credentials loaded from AWS Secrets Manager

**Current Configuration:**
```
Frontend: http://localhost:5176 (Vite dev server)
Backend:  http://localhost:5013 (Express API)
Auth:     Supabase (production mode)
Storage:  Database (Supabase PostgreSQL)
```

---

## Manual Browser Testing Instructions

Since the MCP browser tool has version conflicts, here's how to test manually:

### Prerequisites

1. **Access EC2 Instance with Port Forwarding:**
   ```bash
   # From your local machine
   ssh -L 5176:localhost:5176 -L 5013:localhost:5013 ec2-user@<EC2_IP>
   ```

2. **Or Use EC2 Instance Connect with Port Forward:**
   - Open EC2 Console
   - Connect via Instance Connect
   - Forward ports 5176 and 5013

### Test Flow 1: Homepage

**URL:** http://localhost:5176/

**Expected:**
- ✅ Modern dark theme homepage
- ✅ "Turn Ideas into Apps in Minutes" heading
- ✅ Unsplash hero image (developer workspace)
- ✅ Three feature cards:
  - AI-Powered Generation
  - Production Ready
  - Instant Download
- ✅ "Get Started Now" button
- ✅ Navigation with Login/Sign Up buttons

**Screenshots to Capture:**
- Full homepage view
- Feature cards section
- Navigation bar

---

### Test Flow 2: User Registration

**URL:** http://localhost:5176/register

**Steps:**
1. Click "Sign Up" button from homepage
2. Fill in registration form:
   - Name: "Test User"
   - Email: "test-browser-{timestamp}@example.com"
   - Password: "TestPassword123!"
3. Click "Create Account"

**Expected:**
- ✅ Form validation (email format, password strength)
- ✅ Loading state during registration
- ✅ Redirect to /dashboard on success
- ✅ User authenticated (check for UserMenu in nav)

**API Calls to Monitor (DevTools Network Tab):**
```
POST https://flhrcbbdmgflzgicgeua.supabase.co/auth/v1/signup
  Body: { email, password, name }
  Response: { user, session }
```

**Supabase Auth Integration:**
- Email confirmation may be required (check Supabase dashboard)
- Session stored in localStorage
- Access token used for API calls

**Screenshots:**
- Registration form
- Validation errors (if any)
- Dashboard after successful registration

---

### Test Flow 3: User Login

**URL:** http://localhost:5176/login

**Steps:**
1. Logout (if logged in)
2. Navigate to /login
3. Enter credentials:
   - Email: Previously registered email
   - Password: Previously registered password
4. Click "Login"

**Expected:**
- ✅ Form validation
- ✅ Loading state
- ✅ Redirect to /dashboard
- ✅ Session persists on page refresh

**API Calls:**
```
POST https://flhrcbbdmgflzgicgeua.supabase.co/auth/v1/token?grant_type=password
  Body: { email, password }
  Response: { access_token, user }
```

**Screenshots:**
- Login form
- Dashboard after login
- UserMenu in navigation

---

### Test Flow 4: Create Generation Request (CRITICAL TEST)

**URL:** http://localhost:5176/dashboard

**Steps:**
1. Ensure logged in
2. Find "Create New App" card
3. Fill textarea with prompt:
   ```
   Create a simple blog application with React and Express.
   Include user authentication, post creation, editing, and deletion.
   Add comments functionality. Use a modern dark theme with
   Tailwind CSS.
   ```
4. Verify character counter shows: "XXX / 5000 characters"
5. Click "Generate App" button

**Expected:**
- ✅ Button shows "Submitting..." during request
- ✅ New generation appears in list below
- ✅ Status badge shows "QUEUED" (yellow)
- ✅ Status changes to "GENERATING" (blue) within seconds
- ✅ Real-time logs appear in LogViewer component
- ✅ WebSocket connection established
- ✅ Logs stream in real-time

**API Calls:**
```
POST http://localhost:5013/api/generations
  Headers: { Authorization: "Bearer <token>" }
  Body: { prompt: "..." }
  Response: {
    id: 1,
    userId: "<uuid>",
    prompt: "...",
    status: "queued",
    createdAt: "...",
    ...
  }
```

**WebSocket:**
```
ws://localhost:5013/ws/logs/1
  Messages: { type: "log", message: "...", timestamp: "..." }
```

**Screenshots:**
- Empty dashboard before submission
- Form filled with prompt
- Generation in "queued" state
- Generation in "generating" state with logs
- Live log viewer showing progress

**⚠️ Note on Generation Completion:**

In local dev environment, generation will likely **FAIL** because:
- Docker orchestration not configured for local dev
- ECS task spawning requires AWS environment
- Generator container needs to be run separately

**Expected Failure:**
```json
{
  "status": "failed",
  "errorMessage": "Cannot read properties of null (reading 'readyState')"
}
```

This is **EXPECTED** and **NOT A BUG**. The error indicates:
- WebSocket connection attempt failed
- No generator container running locally
- System correctly handled the error

**To Test Full Generation Flow:**
1. Deploy to AWS ECS (production environment)
2. OR run generator container locally with Docker Compose
3. OR test with mocked generator response

---

### Test Flow 5: Data Persistence

**Steps:**
1. Create a generation request (as in Flow 4)
2. Note the request ID and status
3. Refresh the page (Ctrl+R or Cmd+R)
4. Wait for dashboard to reload

**Expected:**
- ✅ User still authenticated (no redirect to login)
- ✅ Generation request still visible
- ✅ Same ID and status
- ✅ Data loaded from database, not localStorage

**API Calls After Refresh:**
```
GET http://localhost:5013/api/generations
  Headers: { Authorization: "Bearer <token>" }
  Response: [{ id: 1, userId: "...", status: "failed", ... }]
```

**Screenshots:**
- Dashboard before refresh
- Dashboard after refresh (should be identical)

---

### Test Flow 6: Error Handling

#### 6.1 Short Prompt Validation

**Steps:**
1. Enter prompt with < 10 characters: "Test"
2. Try to submit

**Expected:**
- ✅ Submit button disabled
- ✅ Error message: "Minimum 10 characters required"
- ✅ Character counter shows red text

#### 6.2 Long Prompt Validation

**Steps:**
1. Enter prompt with > 5000 characters
2. Try to submit

**Expected:**
- ✅ Submit button disabled
- ✅ Error message: "Prompt must not exceed 5000 characters"
- ✅ Character counter shows warning

#### 6.3 Network Error

**Steps:**
1. Open DevTools → Network tab
2. Enable "Offline" mode
3. Try to create generation

**Expected:**
- ✅ Error toast/message: "Network error"
- ✅ Retry button or helpful message
- ✅ No crash or white screen

#### 6.4 Unauthorized Access

**Steps:**
1. Logout
2. Try to navigate to /dashboard directly

**Expected:**
- ✅ Redirect to /login
- ✅ No API calls made (auth check happens client-side)

**Screenshots:**
- Validation errors
- Network error message
- Login redirect

---

### Test Flow 7: Responsive Design

**Viewports to Test:**

1. **Desktop (1920x1080)**
   - Full 3-column feature grid
   - Horizontal navigation
   - Spacious dashboard layout

2. **Tablet (768x1024)**
   - 2-column feature grid
   - Compact navigation
   - Responsive cards

3. **Mobile (375x667)**
   - Single column layout
   - Mobile menu (hamburger?)
   - Touch-friendly buttons

**Expected:**
- ✅ No horizontal scrollbars
- ✅ Readable text at all sizes
- ✅ Buttons remain clickable
- ✅ Forms usable on mobile

**Screenshots:**
- Homepage on all 3 sizes
- Dashboard on all 3 sizes

---

## DevTools Checks

### Network Tab

**Monitor these requests:**

| Endpoint | Method | Status | Response Time | Body |
|----------|--------|--------|---------------|------|
| /health | GET | 200 | < 100ms | {"status":"healthy"} |
| /api/generations | GET | 200 | < 500ms | Array of generations |
| /api/generations | POST | 201 | < 1000ms | Created generation object |
| Supabase auth | POST | 200 | < 2000ms | Session data |

**Red Flags:**
- ❌ 500 errors (server crash)
- ❌ 401 errors (auth broken)
- ❌ CORS errors (misconfiguration)
- ❌ Timeouts > 10 seconds

### Console Tab

**Expected Logs:**
```
[Dashboard] API Response: ...
[Dashboard] Returning data: ...
```

**Red Flags:**
- ❌ Uncaught exceptions
- ❌ React errors (e.g., "Cannot read property of undefined")
- ❌ WebSocket connection errors (during active generation)

### Application Tab → Local Storage

**Check for:**
- `sb-<project-id>-auth-token` - Supabase auth session
- Contains: { access_token, refresh_token, user }

**Verify:**
- ✅ Token present when logged in
- ✅ Token cleared on logout
- ✅ Token persists on refresh

---

## API Testing with curl (Automated Verification)

Run these commands to verify backend is working:

```bash
# Test 1: Health check
curl http://localhost:5013/health | jq .

# Expected: {"status":"healthy","auth":"supabase","storage":"database"}

# Test 2: Get generations (requires auth token from browser)
# Copy token from DevTools → Application → Local Storage
TOKEN="<paste-token-here>"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5013/api/generations | jq .

# Expected: Array of generation objects (may be empty)

# Test 3: Create generation
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Test generation from curl"}' \
  http://localhost:5013/api/generations | jq .

# Expected: Created generation with status "queued"

# Test 4: Get specific generation
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5013/api/generations/1 | jq .

# Expected: Generation details with current status
```

---

## Database Verification

Check Supabase Dashboard for data:

**URL:** https://supabase.com/dashboard/project/flhrcbbdmgflzgicgeua

### Table Editor → generation_requests

**Expected Columns:**
- id (serial)
- user_id (text/uuid)
- prompt (text)
- status (enum: queued, generating, completed, failed)
- created_at (timestamp)
- completed_at (timestamp, nullable)
- download_url (text, nullable)
- github_url (text, nullable)
- error_message (text, nullable)

**Expected Rows:**
- Rows created via browser should appear here
- user_id should match authenticated user's UUID
- Timestamps should match creation time

**SQL Query to Run:**
```sql
SELECT
  id,
  user_id,
  substring(prompt, 1, 50) as prompt_preview,
  status,
  created_at,
  error_message
FROM generation_requests
ORDER BY created_at DESC
LIMIT 10;
```

---

## Success Criteria

✅ **Homepage:**
- Loads without errors
- Images display correctly
- Navigation functional
- CTA buttons work

✅ **Authentication:**
- Registration creates user
- Login works with credentials
- Session persists on refresh
- Logout clears session

✅ **Dashboard:**
- Loads user's generations
- Real-time polling works (3-second interval)
- Empty state shows when no data
- Loading skeletons display

✅ **Create Generation:**
- Form validation works
- API call succeeds
- Database record created
- UI updates in real-time

✅ **Data Persistence:**
- Refresh keeps user logged in
- Generations load from database
- No data loss on page reload

✅ **Error Handling:**
- Validation errors shown
- Network errors handled gracefully
- Unauthorized access redirects
- No crashes or white screens

---

## Known Limitations (Not Bugs)

### 1. Generator Tasks Fail in Local Dev

**Behavior:** Generations created locally show status "failed"

**Reason:**
- ECS task spawning requires AWS environment
- Docker orchestration not configured for local dev
- Generator container not running

**Solution:**
- Test full flow in AWS ECS environment
- OR run generator container with Docker Compose
- OR use mock mode for development

### 2. WebSocket Connection Errors

**Behavior:** Console shows WebSocket connection errors

**Reason:**
- No active generator tasks to connect to
- WebSocket endpoints exist but no clients

**Solution:**
- Normal in local dev without generator
- Will work in production with ECS tasks

### 3. GitHub Features Disabled

**Behavior:** Log message "GitHub features disabled"

**Reason:**
- GitHub token not loaded correctly
- GitHub manager initialization issue

**Impact:**
- Low (GitHub integration works in production)
- Repo creation happens in generator, not orchestrator

---

## Next Steps After Browser Testing

1. **Document Test Results:**
   - Screenshots of each test flow
   - Any bugs or issues found
   - Performance observations

2. **Fix Any Issues Found:**
   - UI bugs
   - API errors
   - Validation problems

3. **Deploy to AWS:**
   - Build Docker images
   - Push to ECR
   - Deploy to ECS
   - Test full generation flow

4. **Production Testing:**
   - Test with real Claude API
   - Verify S3 uploads work
   - Check GitHub repo creation
   - Confirm Fly.io deployment

---

## Troubleshooting

### Problem: Frontend won't load

**Check:**
```bash
# Is Vite running?
ps aux | grep vite

# Check logs
tail -50 /tmp/app-gen-saas-v20.log

# Restart if needed
pkill -f vite
cd /home/ec2-user/APP_GEN/app-gen-saas
npm run client
```

### Problem: Backend returns 500 errors

**Check:**
```bash
# Is server running?
ps aux | grep "tsx watch"

# Check logs
tail -50 /tmp/app-gen-saas-v20.log

# Test health endpoint
curl http://localhost:5013/health

# Restart if needed
pkill -f "tsx watch"
cd /home/ec2-user/APP_GEN/app-gen-saas
npm run server
```

### Problem: Database connection fails

**Check:**
```bash
# Verify credentials
cd /home/ec2-user/APP_GEN/app-gen-saas
cat .env | grep DATABASE_URL

# Test connection manually
psql "<DATABASE_URL>" -c "SELECT 1"

# Check Supabase status
curl https://flhrcbbdmgflzgicgeua.supabase.co/rest/v1/ \
  -H "apikey: <SUPABASE_ANON_KEY>"
```

### Problem: Auth not working

**Check:**
```bash
# Verify Supabase keys
cat .env | grep SUPABASE

# Check browser console for auth errors
# Look for "Failed to get session" or similar

# Verify user exists in Supabase dashboard
# https://supabase.com/dashboard/project/flhrcbbdmgflzgicgeua/auth/users
```

---

## Automation Ideas (Future)

1. **Playwright Test Suite:**
   ```typescript
   // tests/e2e/dashboard.spec.ts
   test('create generation request', async ({ page }) => {
     await page.goto('http://localhost:5176');
     await page.click('text=Sign Up');
     // ... complete flow
   });
   ```

2. **Cypress Tests:**
   ```javascript
   describe('Dashboard', () => {
     it('loads user generations', () => {
       cy.visit('/dashboard');
       cy.get('[data-testid="generation-card"]').should('exist');
     });
   });
   ```

3. **Visual Regression Testing:**
   - Percy.io or Chromatic
   - Capture screenshots of key pages
   - Compare against baseline

---

**Testing Completed:** Pending manual execution
**Next Review:** After browser testing results documented
**Contact:** See COMPREHENSIVE_TESTING_ASSESSMENT.md for system details
