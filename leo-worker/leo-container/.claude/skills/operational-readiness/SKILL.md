---
name: operational-readiness
description: Generate production-grade evidence pack for CTOs and security reviewers
category: validation
priority: P0
---

# Operational Readiness

## Purpose

Generate a **Production-Grade Evidence Pack** (App Release Assurance Pack) for CTOs and security reviewers. This skill analyzes the codebase, **fixes issues** it finds, and documents what was fixed.

**Core Principle**: Fix First, Document Second.

The skill does NOT just generate a report of problems - it actively FIXES issues. The evidence pack shows what was analyzed AND what was fixed.

---

## When to Invoke

### On-Demand Trigger
- User sends mid-generation input: "generate the assurance pack"
- User invokes: `/operational-readiness`
- Pipeline Phase 10 (optional for production builds)

### Risk Tier Selection
Default: **low** (prototype/MVP)

User can specify tier via:
- "generate assurance pack --tier=med"
- "generate high-risk assurance pack"

| Tier | Use Case | Required Evidence |
|------|----------|-------------------|
| low | Prototype, internal tool | Executive summary, basic threat model, WAIVER for gaps |
| med | Internal app with user data | + RLS policies, backup plan, runbook |
| high | Production SaaS | + SOC2 mapping, full STRIDE, incident response |

---

## What This Skill Does

### Step 1: Bootstrap Pack Structure

Run the bootstrap script to create the evidence pack directory:

```bash
python ~/.claude/skills/operational-readiness/scripts/bootstrap_pack.py --tier low
```

This creates:
```
release-assurance/
└── v1.0.0/
    ├── EXECUTIVE_SUMMARY.md
    ├── THREAT_MODEL.md
    ├── RUNBOOK.md
    ├── SOC2_MAPPING.md (med/high only)
    ├── SUPABASE_RLS.md
    ├── BACKUP_RESTORE.md
    ├── FLYIO_ROLLBACK.md
    ├── WAIVER.md
    └── EVIDENCE_MANIFEST.json
```

### Step 2: Analyze and FIX Issues

**Application Security Fixes:**

| Issue | Detection | Fix |
|-------|-----------|-----|
| No input validation | API routes without Zod | Add insertXxxSchema validation to all POST/PUT routes |
| Missing error handling | Async functions without try/catch | Wrap in try/catch, return proper error responses |
| No rate limiting | Express routes without limiter | Add express-rate-limit to sensitive endpoints |
| Hardcoded secrets | Strings matching patterns | Move to environment variables |
| No auth on endpoints | Routes without authMiddleware | Add authMiddleware to protected routes |
| Missing CORS config | No cors() setup | Configure CORS with allowed origins |
| No health check | Missing /health endpoint | Add GET /health returning { status: 'ok' } |

**Example Fix - Add Input Validation:**

```typescript
// BEFORE (no validation)
app.post('/api/users', async (req, res) => {
  const user = await storage.createUser(req.body);
  res.json(user);
});

// AFTER (with validation)
import { insertUserSchema } from '../shared/schema';

app.post('/api/users', async (req, res) => {
  const result = insertUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }
  const user = await storage.createUser(result.data);
  res.json(user);
});
```

### Step 3: Supabase Database Security

**Enable Row Level Security:**

```sql
-- For each table, add RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

**Document in SUPABASE_RLS.md:**
- List all tables with RLS status
- List all policies per table
- Document any tables without RLS (with justification)

**Backup/Restore Documentation:**

Add to BACKUP_RESTORE.md:
- Supabase automatic daily backups (7-day retention on Pro)
- Point-in-time recovery procedure
- Manual backup via pg_dump if needed
- Restore procedure with Supabase CLI

### Step 4: Fly.io Deployment Security

**Add Health Checks to fly.toml:**

```toml
[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.http_checks]]
    interval = 10000
    grace_period = 5s
    method = "get"
    path = "/health"
    protocol = "http"
    timeout = 2000

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

**Document Rollback Procedure in FLYIO_ROLLBACK.md:**

```bash
# List recent releases
fly releases list -a <app-name>

# Rollback to previous version
fly releases rollback -a <app-name>

# Rollback to specific version
fly releases rollback v5 -a <app-name>

# Emergency: Scale to zero then back up
fly scale count 0 -a <app-name>
fly scale count 2 -a <app-name>
```

### Step 5: Generate Evidence Documents

For each document, use the templates in `assets/templates/` and populate with actual findings.

**EXECUTIVE_SUMMARY.md:**
- One-page CTO brief
- App purpose and risk classification
- Key security controls implemented
- Known gaps and mitigations
- Deployment and monitoring summary

**THREAT_MODEL.md:**
- STRIDE analysis for the application
- Data flow diagrams
- Trust boundaries
- Mitigations for each threat

**RUNBOOK.md:**
- Incident response contacts
- Monitoring dashboard links
- Common issue troubleshooting
- Escalation procedures

**SOC2_MAPPING.md (med/high only):**
- Map controls to SOC2 Trust Service Criteria
- Document evidence for each control
- Identify gaps requiring waivers

### Step 6: Generate Tamper-Evident Manifest

Run the manifest generator:

```bash
python ~/.claude/skills/operational-readiness/scripts/generate_manifest.py release-assurance/v1.0.0/
```

This creates `EVIDENCE_MANIFEST.json`:

```json
{
  "version": "1.0.0",
  "generated_at": "2025-01-23T12:00:00Z",
  "risk_tier": "low",
  "files": {
    "EXECUTIVE_SUMMARY.md": {
      "sha256": "abc123...",
      "size_bytes": 2048
    },
    "THREAT_MODEL.md": {
      "sha256": "def456...",
      "size_bytes": 4096
    }
  },
  "issues_found": 5,
  "issues_fixed": 5,
  "issues_waived": 0
}
```

---

## Verification Checklist

After running the skill, verify:

### Application Security
- [ ] All API routes have input validation (Zod schemas)
- [ ] Error handling present in all async functions
- [ ] Rate limiting on auth and sensitive endpoints
- [ ] No hardcoded secrets in codebase
- [ ] Health check endpoint exists at GET /health
- [ ] CORS configured properly
- [ ] Auth middleware on protected routes

### Supabase Database
- [ ] RLS enabled on all tables
- [ ] RLS policies exist for each table
- [ ] SUPABASE_RLS.md documents all policies
- [ ] BACKUP_RESTORE.md has restore procedure

### Fly.io Deployment
- [ ] Health checks in fly.toml
- [ ] FLYIO_ROLLBACK.md has rollback procedure
- [ ] Multi-machine deployment documented

### Evidence Pack
- [ ] All required documents created
- [ ] EVIDENCE_MANIFEST.json has valid SHA-256 hashes
- [ ] WAIVER.md documents any unfixable gaps

---

## Common Issues and Fixes

### Issue: Routes without validation

**Detection:**
```typescript
// Look for POST/PUT/PATCH without schema validation
app.post('/api/items', async (req, res) => {
  const item = await storage.createItem(req.body);  // No validation!
```

**Fix:**
```typescript
import { insertItemSchema } from '../shared/schema';

app.post('/api/items', async (req, res) => {
  const result = insertItemSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() });
  }
  const item = await storage.createItem(result.data);
  res.json(item);
});
```

### Issue: Missing error handling

**Detection:**
```typescript
// Async function without try/catch
app.get('/api/users/:id', async (req, res) => {
  const user = await storage.getUser(req.params.id);
  res.json(user);
});
```

**Fix:**
```typescript
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Issue: No RLS on tables

**Detection:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

**Fix:**
```sql
-- Enable RLS and add basic policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

## WAIVER.md Usage

Only use WAIVER.md for issues that **CANNOT** be fixed, not for laziness.

Valid waiver reasons:
- "2FA not implemented - prototype scope"
- "IP allowlisting not configured - internal tool"
- "Encryption at rest not enabled - Supabase free tier limitation"

Invalid waiver reasons:
- "No time to add validation" (fix it!)
- "Error handling seemed complex" (fix it!)

---

## Summary

This skill ensures generated apps are production-ready by:

1. **Analyzing** the codebase for security/operational issues
2. **Fixing** issues directly in the code
3. **Documenting** what was fixed and what requires waivers
4. **Creating** a tamper-evident evidence pack for CTOs

Run `/operational-readiness` before any production deployment to ensure the app meets security and operational standards.
