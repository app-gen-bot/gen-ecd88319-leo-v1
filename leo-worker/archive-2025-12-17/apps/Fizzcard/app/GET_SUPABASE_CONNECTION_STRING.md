# How to Get the Correct Supabase Connection String

Based on research of the "Tenant or user not found" error, the issue is almost always **using the wrong connection string format or hostname**.

---

## 🎯 Solution: Get Connection String from Dashboard

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/luhlijxjiceeyjqdyyyx
2. Navigate to **Settings** (gear icon in sidebar)
3. Click on **Database** in the settings menu

### Step 2: Copy the Pooler Connection String
Look for the section labeled **Connection string** or **Connection pooling**.

You should see different connection string formats:

#### Option A: Session Mode (Port 5432)
```
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@[HOSTNAME]:5432/postgres
```

#### Option B: Transaction Mode (Port 6543) - Recommended
```
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@[HOSTNAME]:6543/postgres
```

### Step 3: Important Things to Verify

⚠️ **DO NOT assume** the hostname is `aws-0-us-east-1.pooler.supabase.com`

The hostname varies by:
- When your project was created
- Which availability zone it was assigned to
- Regional load balancing

**Possible formats you might see:**
- `aws-0-us-east-1.pooler.supabase.com`
- `aws-1-us-east-1.pooler.supabase.com`
- `aws-0-us-east-2.pooler.supabase.com`
- Or other combinations

### Step 4: Username Format

The username should be one of these formats (check what Supabase shows):
- `postgres.[PROJECT_REF]` (most common)
- `postgres.luhlijxjiceeyjqdyyyx` (our project ref)

### Step 5: Password
Replace `[YOUR-PASSWORD]` with: `rBXA2UxRRzPWTTI0`

---

## 🔧 What to Look For in Dashboard

### Connection Pooling Section
Under Settings → Database, find the section that says:

**"Connection pooling"** or **"Pooler"**

It will have a dropdown or tabs showing:
- **Session mode** (port 5432) - Better for long-running connections
- **Transaction mode** (port 6543) - Better for serverless/short connections

### Example of What You'll See

```
Use connection pooling for serverless environments

Session Mode:
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-X-REGION.pooler.supabase.com:5432/postgres

Transaction Mode:
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-X-REGION.pooler.supabase.com:6543/postgres
```

---

## 📝 After Getting the Correct String

### Update Your .env File

1. Copy the **Transaction Mode** connection string (port 6543)
2. Replace `[YOUR-PASSWORD]` with `rBXA2UxRRzPWTTI0`
3. Update `server/.env`:

```env
# Storage Configuration
STORAGE_MODE=database
DATABASE_URL=postgresql://postgres.luhlijxjiceeyjqdyyyx:rBXA2UxRRzPWTTI0@[CORRECT-HOSTNAME]:6543/postgres
```

### Test the Connection

```bash
# Test with psql
PGPASSWORD="rBXA2UxRRzPWTTI0" psql "[YOUR-CONNECTION-STRING]" -c "SELECT version();"

# If that works, test with application
cd server
npm run seed
```

---

## 🐛 Common Issues Found in Research

### Issue 1: Wrong Hostname
**Problem**: Using `aws-0-us-east-1` when project is actually on `aws-1-us-east-1`
**Solution**: Copy exact hostname from dashboard

### Issue 2: Wrong Username Format
**Problem**: Using `postgres` instead of `postgres.[PROJECT_REF]`
**Solution**: Use the format shown in dashboard (usually `postgres.luhlijxjiceeyjqdyyyx`)

### Issue 3: Wrong Port
**Problem**: Mixing up session (5432) and transaction (6543) modes
**Solution**: For serverless/Drizzle, use port 6543 (transaction mode)

### Issue 4: Password in URL
**Problem**: Special characters not properly escaped
**Solution**: If password has special chars, URL-encode them:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`

---

## ✅ Verification Checklist

Before testing, verify you have:
- [ ] Copied the EXACT connection string from Supabase dashboard
- [ ] Used the Transaction Mode (port 6543) string
- [ ] Replaced `[YOUR-PASSWORD]` with `rBXA2UxRRzPWTTI0`
- [ ] The hostname matches what's shown in dashboard (not assumed)
- [ ] The username format matches dashboard (likely `postgres.luhlijxjiceeyjqdyyyx`)
- [ ] No typos in the connection string

---

## 🎬 Quick Test Commands

Once you have the correct string:

```bash
# 1. Export the correct connection string
export DATABASE_URL="postgresql://postgres.luhlijxjiceeyjqdyyyx:rBXA2UxRRzPWTTI0@[CORRECT-HOSTNAME]:6543/postgres"

# 2. Test with psql
PGPASSWORD="rBXA2UxRRzPWTTI0" psql "$DATABASE_URL" -c "SELECT NOW();"

# 3. If that works, test with Drizzle
cd server
npm run seed

# 4. If seeding works, start the app
npm run dev
```

---

## 📊 Expected Results

### If Connection String is Correct:
✅ `psql` command returns current timestamp
✅ `npm run seed` creates 30 users successfully
✅ Application starts without "Tenant or user not found" error

### If Still Getting "Tenant or user not found":
❌ The hostname is still incorrect
❌ OR the database is genuinely not provisioned yet (wait 1-2 hours)
❌ OR there's a Supabase infrastructure issue (contact support)

---

**Next Step**: Please check your Supabase dashboard and get the exact connection string shown there!
