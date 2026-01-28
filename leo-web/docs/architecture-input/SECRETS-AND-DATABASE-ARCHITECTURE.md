# Secrets and Database Architecture for Leo SaaS

> **Status**: DRAFT - Documenting current state and recommended approach
> **Date**: 2025-12-19
> **Context**: After discovering wrong Supabase credentials wiped surveysmith

## Executive Summary

### Problem Discovered
Leo SaaS's `.env.local` had wrong pool credentials (`flhrcbbdmgflzgicgeua` - surveysmith) instead of the correct pool (`lzyrnppmvuuxlozvlnsu` - leo-pool-1). This caused generated apps to use surveysmith's database, wiping it with schema migrations.

### Root Cause
- Architecture doc said pool creds should be in AWS Secrets Manager
- Implementation stored them in `.env.local` files instead
- No single source of truth → wrong values copied → disaster

---

## Supabase Project Allocation

| Project ID | Name | Purpose | Status |
|------------|------|---------|--------|
| `kjtvmenmembniywejhpv` | leo-saas | Leo SaaS platform database | ✅ Correct |
| `lzyrnppmvuuxlozvlnsu` | leo-pool-1 | Ephemeral pool for generated apps | ✅ Correct |
| `flhrcbbdmgflzgicgeua` | surveysmith | Production app (NEVER use as pool) | ❌ Was misconfigured |

---

## Secrets Taxonomy

### Category 1: Platform Secrets (Few, High Value)
**Storage**: AWS Secrets Manager (~$4/month for 10 secrets)

| Secret | Purpose |
|--------|---------|
| `leo/github-bot-token` | Push generated apps to GitHub |
| `leo/fly-api-token` | Deploy apps to Fly.io |
| `leo/supabase-pool-1` | Pool project credentials (THE FIX) |
| `leo/stripe-secret` | Our billing |

### Category 2: User OAuth Tokens (Scales with Users)
**Storage**: PostgreSQL + KMS encryption (~$5/month flat)

| Token | How Obtained |
|-------|--------------|
| Supabase OAuth token | User authorizes via OAuth |
| GitHub OAuth token | User authorizes via OAuth |
| Fly.io API token | User pastes or OAuth |

**Key Principle**: Store OAuth tokens, not credentials. Fetch actual credentials on-demand via Management APIs.

### Category 3: App-Specific Secrets (Never Stored)
**Storage**: Pass-through to deployment platform

- Stripe API keys → Go directly to Fly.io
- SendGrid keys → Go directly to Fly.io
- Any user's app secrets → Never touch our database

---

## Database Tier Strategy

| Tier | Database | Fly Deploy | Persistence | Use Case |
|------|----------|------------|-------------|----------|
| **Preview** | SQLite in-memory | No | None | Quick preview, no account |
| **Free** | Pool project (shared) | Free tier | 7-day TTL | Testing, iteration |
| **Connected** | User's own Supabase | User's Fly | Permanent | Production apps |

### How It Works

```
Preview Mode:
  User prompt → Generate code → SQLite in-memory → Preview in browser
  No external services, no persistence, instant feedback

Free Tier:
  User prompt → Generate code → Pool DB (lzyrnppmvuuxlozvlnsu) → Fly free tier
  Schema wiped between generations, 7-day data TTL

Connected Mode:
  User connects Supabase via OAuth → We fetch their project credentials
  → Generate code → Their Supabase → Their Fly account
  Full persistence, they own everything
```

---

## Credential Flow (Replit-Inspired)

```
┌─────────────────────────────────────────────────────────────────┐
│ OAUTH-FIRST MODEL                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Connect Supabase"                              │
│  2. OAuth redirect → User authorizes Leo                        │
│  3. We receive OAuth access + refresh tokens                    │
│  4. Encrypt tokens with AWS KMS                                 │
│  5. Store encrypted tokens in PostgreSQL                        │
│                                                                  │
│  At Generation Time:                                             │
│  6. Decrypt user's OAuth token                                  │
│  7. Call Supabase Management API → get project credentials      │
│  8. Pass credentials to container as env vars                   │
│  9. Container uses credentials (in memory only)                 │
│  10. Container exits → credentials discarded                    │
│                                                                  │
│  NEVER STORED: Connection strings, database passwords           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cost Comparison

| Approach | 100 users | 1K users | 10K users |
|----------|-----------|----------|-----------|
| AWS Secrets Manager per-user | $40/mo | $400/mo | $4,000/mo |
| **DB + KMS (recommended)** | **$5/mo** | **$5/mo** | **$10/mo** |

---

## Current File Locations

### Developer Credentials Reference (Local Only)
- `~/.secrets/supabase-credentials.md` - **Master reference** for all Supabase project credentials
- `~/.secrets/dev.env` - Centralized dev environment secrets
- **Note**: `~/.secrets/` is outside repos, never committed

### Leo SaaS (Orchestrator)
- `/Users/jake/dev/app-factory/leo-saas/app/.env.local` - Local dev config
- Should read pool creds from AWS Secrets Manager (not implemented)

### Leo Container (Generator)
- `/Users/jake/dev/app-factory/leo-container/.env` - Container env vars
- Gets values passed from container-manager

### The Fix
1. Store `leo/supabase-pool-1` in AWS Secrets Manager
2. Update `supabase-pool.ts` to fetch from AWS (not env vars)
3. Or: Quick fix - correct values in `leo-saas/app/.env.local`

---

## Implementation Phases

### Phase 0: Emergency Fix (Now)
- [ ] Restore surveysmith database from GitHub migrations
- [ ] Correct `.env.local` values in leo-saas
- [ ] Verify pool project is `lzyrnppmvuuxlozvlnsu`

### Phase 1: Single Source of Truth
- [ ] Add `leo/supabase-pool-1` to AWS Secrets Manager
- [ ] Update `supabase-pool.ts` to fetch from AWS
- [ ] Remove pool creds from all `.env` files

### Phase 2: User OAuth Integration
- [ ] Create KMS key `alias/leo-user-tokens`
- [ ] Add `user_integration_tokens` table
- [ ] Implement Supabase OAuth flow
- [ ] On-demand credential fetching

### Phase 3: Tiered Database Access
- [ ] SQLite preview mode (no external DB)
- [ ] Pool mode with 7-day TTL
- [ ] Connected mode with user's Supabase

---

## References

- [Replit Connectors](https://blog.replit.com/connectors) - OAuth-first model
- [Replit Safer Vibe Coding](https://blog.replit.com/introducing-a-safer-way-to-vibe-code-with-replit-databases) - Dev/prod separation
- [Lovable Supabase Integration](https://docs.lovable.dev/integrations/supabase) - OAuth token approach
