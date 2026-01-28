# Environment Configuration Pattern

**Date:** 2025-10-20

---

## Two-File Pattern

We use a two-file environment configuration to separate AI-maintained infrastructure values from user secrets.

### Files

**`.env.defaults`** - Committed to git, AI can read and maintain
- Real infrastructure values (ARNs, cluster names, subnet IDs)
- Non-secret configuration shared by all developers
- Maintained by AI as infrastructure evolves

**`.env`** - NOT in git, NOT readable by AI
- Your personal secrets (API keys, tokens, passwords)
- Created from `.env.template`
- Never committed, never shared with AI

**`.env.template`** - Committed to git, AI can read
- Template showing what secrets are needed
- Placeholder values, no real credentials

### Load Order

Application loads in this order:
```typescript
config({ path: '.env.defaults' }); // Load defaults first
config({ path: '.env', override: true }); // Then override with secrets
```

**Result:** `.env` values override `.env.defaults`

---

## Setup

### First Time Setup

1. Copy template to create your secrets file:
   ```bash
   cp .env.template .env
   ```

2. Edit `.env` and fill in your actual secrets:
   ```bash
   vim .env
   ```

3. `.env.defaults` is already configured - no action needed

### What Goes Where?

**Put in `.env.defaults` (AI maintains):**
- `ECS_CLUSTER=app-gen-saas-cluster`
- `S3_BUCKET=app-gen-saas-generated-apps-855235011337`
- `AWS_REGION=us-east-1`
- `PORT=5013`
- Any value that changes when infrastructure is updated

**Put in `.env` (you maintain):**
- `SUPABASE_ANON_KEY=eyJ...`
- `SUPABASE_SERVICE_ROLE_KEY=eyJ...`
- `CLAUDE_CODE_OAUTH_TOKEN=sk-ant-...`
- `SUPABASE_DB_PASSWORD=...`
- Any credential or secret value

---

## Why This Pattern?

**Problem:** Old `.env` file mixed secrets with infrastructure values
- Hard for AI to maintain (can't read secrets)
- Hard for you to maintain (infrastructure values change)
- Error-prone to keep in sync

**Solution:** Separate concerns
- AI maintains infrastructure values in `.env.defaults`
- You maintain secrets in `.env`
- Application merges them automatically

---

## Security

**`.gitignore`** excludes `.env`
- Never committed to git
- Never shared

**`.claudeignore`** excludes `.env`
- Never read by AI
- Never sent to Claude API

**Only you** see `.env` contents

---

## Example

**`.env.defaults`** (committed, AI reads):
```bash
ECS_CLUSTER=app-gen-saas-cluster
S3_BUCKET=app-gen-saas-generated-apps-855235011337
PORT=5013
```

**`.env`** (not committed, AI never sees):
```bash
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
```

**Result at runtime:**
```javascript
process.env.ECS_CLUSTER // "app-gen-saas-cluster" (from .env.defaults)
process.env.SUPABASE_ANON_KEY // "eyJ..." (from .env)
process.env.PORT // "5013" (from .env.defaults)
```

---

## Updating Values

### When Infrastructure Changes

AI updates `.env.defaults` automatically:
```bash
# After CDK deploy, AI updates:
ECS_CLUSTER=new-cluster-name
S3_BUCKET=new-bucket-name
```

You don't need to do anything - values are already correct.

### When Secrets Change

You update `.env` manually:
```bash
vim .env
# Update CLAUDE_CODE_OAUTH_TOKEN=new-token
```

AI never sees this file.

---

## For New Developers

1. Clone repo
2. Copy `.env.template` → `.env`
3. Ask team lead for secret values
4. Fill in `.env`
5. `.env.defaults` already has correct infrastructure values

Done! Application works immediately.

---

**Status:** Active pattern for all app-gen-saas repositories
