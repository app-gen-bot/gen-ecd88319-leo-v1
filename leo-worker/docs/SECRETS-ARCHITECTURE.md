# Secrets Architecture for App Factory SaaS

> Security-first approach to handling user secrets
>
> **Status**: APPROVED
> **Date**: 2025-12-13
> **Principle**: Store minimal secrets, never persist app-specific credentials

## Executive Summary

**Key Decisions:**
1. **OAuth tokens only** - Store Supabase/GitHub/Fly OAuth tokens, never raw credentials
2. **Fetch on-demand** - Actual credentials fetched via API at runtime, never persisted
3. **Pass-through for app secrets** - Stripe, email keys, etc. go directly to deployment platform
4. **DB + KMS** - User tokens encrypted in PostgreSQL with AWS KMS (not Secrets Manager per-user)

**Inspired by**: Lovable's approach - they store OAuth tokens and fetch credentials on-demand from Supabase Management API.

---

## Secrets Taxonomy

### Category 1: Platform Secrets (We Own)

Stored in **AWS Secrets Manager** - these are App Factory's own service accounts:

| Secret | Purpose | Example |
|--------|---------|---------|
| `leo/supabase-pool-01` | Free tier database pool | Connection strings, keys |
| `leo/supabase-pool-02` | Free tier database pool | Connection strings, keys |
| `leo/github-bot-token` | Platform GitHub bot | `ghp_xxx` |
| `leo/stripe-secret-key` | Our billing | `sk_live_xxx` |
| `leo/resend-api-key` | Our transactional email | `re_xxx` |

**Cost**: ~$5/month for 10-15 secrets

---

### Category 2: User Integration Tokens (We Store Encrypted)

Stored in **PostgreSQL + KMS encryption** - enables App Factory to act on user's behalf:

| Token | Purpose | How Obtained |
|-------|---------|--------------|
| Supabase OAuth | Create/manage their DB projects | OAuth flow |
| GitHub OAuth | Push code to their repos | OAuth flow |
| Fly.io API token | Deploy to their Fly account | User pastes or OAuth |
| Vercel token | Deploy to their Vercel account | OAuth flow |

**Key principle**: We store **OAuth tokens**, not credentials. Actual credentials are fetched on-demand via Management APIs and never persisted.

**Cost**: ~$1-5/month (KMS key + API calls)

---

### Category 3: App-Specific Secrets (Never Stored)

These belong to the **generated app**, not to App Factory:

| Secret | Used By | Our Role |
|--------|---------|----------|
| Stripe API keys | User's generated app | Pass-through to deployment |
| SendGrid/Resend key | User's generated app | Pass-through to deployment |
| OpenAI API key | User's generated app | Pass-through to deployment |
| Twilio credentials | User's generated app | Pass-through to deployment |
| Google OAuth creds | User's generated app | Pass-through to deployment |
| Any custom API keys | User's generated app | Pass-through to deployment |

**Key principle**: These go directly to the deployment platform (Fly, Vercel). We are a **conduit**, never a **vault** for app secrets.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Secrets Architecture                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   AWS SECRETS MANAGER (Platform-owned)                                  │
│   ├── leo/supabase-pool-01         ← Free tier pool credentials        │
│   ├── leo/supabase-pool-02                                              │
│   ├── leo/supabase-pool-03                                              │
│   ├── leo/github-bot-token         ← Platform service accounts         │
│   └── leo/stripe-key               ← Our billing                       │
│                                                                          │
│   POSTGRESQL + KMS (User tokens)                                        │
│   └── user_integration_tokens                                           │
│       ├── user_id (PK)                                                  │
│       ├── supabase_access_token    ← KMS encrypted                     │
│       ├── supabase_refresh_token   ← KMS encrypted                     │
│       ├── supabase_org_id          ← Not secret                        │
│       ├── github_access_token      ← KMS encrypted (optional)          │
│       ├── flyio_api_token          ← KMS encrypted (optional)          │
│       └── vercel_token             ← KMS encrypted (optional)          │
│                                                                          │
│   NEVER STORED (Pass-through)                                           │
│   └── App secrets (Stripe, email, etc.)                                │
│       → Entered at deploy time                                          │
│       → Sent directly to Fly/Vercel                                    │
│       → Never touch our database                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## The Lovable Model: Why OAuth Tokens, Not Credentials

### Traditional (Bad) Approach
```
User gives us Supabase URL + anon key + service role key
    ↓
We store them encrypted
    ↓
If breached → attacker has their database credentials
    ↓
User must rotate all credentials manually
```

### Lovable (Good) Approach
```
User authorizes us via OAuth
    ↓
We store only OAuth access + refresh tokens
    ↓
At runtime: Call Supabase Management API → get credentials
    ↓
Credentials exist only in memory during generation
    ↓
If breached → attacker has tokens (revocable, not credentials)
    ↓
User clicks "Revoke" in Supabase → we lose access instantly
```

### Benefits

| Aspect | Traditional | OAuth Model |
|--------|-------------|-------------|
| What we store | Raw credentials | Revocable tokens |
| Breach impact | Full DB access | Limited, revocable |
| User control | Must rotate manually | One-click revoke |
| Credential rotation | We must update | Automatic via API |
| Liability | High | Low |

---

## Implementation Details

### Database Schema

```sql
-- User integration tokens (encrypted with KMS)
CREATE TABLE user_integration_tokens (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Supabase (Connected tier)
    supabase_access_token BYTEA,          -- KMS encrypted
    supabase_refresh_token BYTEA,         -- KMS encrypted
    supabase_org_id TEXT,                 -- Not secret
    supabase_token_expires_at TIMESTAMPTZ,
    supabase_connected_at TIMESTAMPTZ,

    -- GitHub (optional)
    github_access_token BYTEA,            -- KMS encrypted
    github_username TEXT,                 -- Not secret
    github_connected_at TIMESTAMPTZ,

    -- Fly.io (optional)
    flyio_api_token BYTEA,                -- KMS encrypted
    flyio_connected_at TIMESTAMPTZ,

    -- Vercel (optional)
    vercel_token BYTEA,                   -- KMS encrypted
    vercel_team_id TEXT,                  -- Not secret
    vercel_connected_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_user_tokens_supabase ON user_integration_tokens(user_id)
    WHERE supabase_access_token IS NOT NULL;
```

### KMS Encryption

```typescript
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

const kms = new KMSClient({ region: 'us-east-1' });
const KEY_ALIAS = 'alias/app-factory-user-tokens';

export async function encryptToken(plaintext: string): Promise<Buffer> {
    const { CiphertextBlob } = await kms.send(new EncryptCommand({
        KeyId: KEY_ALIAS,
        Plaintext: Buffer.from(plaintext),
    }));
    return Buffer.from(CiphertextBlob!);
}

export async function decryptToken(ciphertext: Buffer): Promise<string> {
    const { Plaintext } = await kms.send(new DecryptCommand({
        CiphertextBlob: ciphertext,
    }));
    return Buffer.from(Plaintext!).toString();
}
```

### Fetching Credentials On-Demand

```typescript
// Called at generation time - credentials NEVER stored
export async function getSupabaseCredentials(
    userId: string,
    projectId: string
): Promise<SupabaseCredentials> {
    // 1. Get encrypted token from database
    const record = await db.userIntegrationTokens.findUnique({
        where: { userId }
    });

    if (!record?.supabaseAccessToken) {
        throw new Error('User has not connected Supabase');
    }

    // 2. Decrypt token
    let accessToken = await decryptToken(record.supabaseAccessToken);

    // 3. Refresh if expired
    if (record.supabaseTokenExpiresAt < new Date()) {
        const refreshToken = await decryptToken(record.supabaseRefreshToken);
        const newTokens = await supabaseOAuth.refreshToken(refreshToken);

        // Save new encrypted tokens
        await db.userIntegrationTokens.update({
            where: { userId },
            data: {
                supabaseAccessToken: await encryptToken(newTokens.accessToken),
                supabaseRefreshToken: await encryptToken(newTokens.refreshToken),
                supabaseTokenExpiresAt: newTokens.expiresAt,
            }
        });

        accessToken = newTokens.accessToken;
    }

    // 4. Fetch credentials from Supabase Management API (NEVER STORED)
    const project = await supabaseManagementApi.getProject(projectId, accessToken);

    // 5. Return for this session only
    return {
        supabaseUrl: `https://${project.ref}.supabase.co`,
        anonKey: project.anon_key,
        serviceRoleKey: project.service_role_key,
        databaseUrl: `postgresql://postgres.${project.ref}:${project.db_pass}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    };
}
```

### Pass-Through for App Secrets

```typescript
// Deploy flow - app secrets never touch our database
export async function deployToFly(
    userId: string,
    appPath: string,
    appSecrets: Record<string, string>  // { STRIPE_KEY: 'sk_xxx', ... }
): Promise<DeployResult> {
    // 1. Get user's Fly token (stored encrypted)
    const record = await db.userIntegrationTokens.findUnique({
        where: { userId }
    });
    const flyToken = await decryptToken(record.flyioApiToken);

    // 2. Deploy the app
    await flyctl.deploy(appPath, { token: flyToken });

    // 3. Set app secrets DIRECTLY on Fly (we don't store them)
    for (const [key, value] of Object.entries(appSecrets)) {
        await flyctl.secretsSet(key, value, { token: flyToken });
        // Value goes to Fly, never to our database
    }

    return { success: true };
}
```

---

## User Flows

### Flow 1: Connect Supabase

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Connect Supabase"                                       │
│ 2. Redirect to Supabase OAuth                                           │
│ 3. User authorizes App Factory                                          │
│ 4. Callback with authorization code                                     │
│ 5. Exchange code for access + refresh tokens                            │
│ 6. Encrypt tokens with KMS                                              │
│ 7. Store encrypted tokens in PostgreSQL                                 │
│ 8. User sees "Supabase Connected ✓"                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Generation with Connected Supabase

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User starts generation                                               │
│ 2. Orchestrator fetches user's encrypted token from DB                  │
│ 3. Decrypt token with KMS                                               │
│ 4. Call Supabase Management API → get project credentials               │
│ 5. Pass credentials to container as env vars                            │
│ 6. Container uses credentials for generation                            │
│ 7. Credentials discarded when container exits                           │
│ 8. Nothing new stored in database                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: Deploy with App Secrets

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Deploy to Fly"                                          │
│ 2. UI prompts: "Enter secrets for your app"                             │
│    ├── STRIPE_KEY: [____________]                                       │
│    ├── RESEND_API_KEY: [____________]                                   │
│    └── (detected from app's .env.example)                               │
│ 3. User enters secrets                                                  │
│ 4. Secrets sent to backend via HTTPS                                    │
│ 5. Backend runs: fly secrets set STRIPE_KEY=xxx                         │
│ 6. Secrets go directly to Fly                                           │
│ 7. Backend discards secrets from memory                                 │
│ 8. User manages secrets in Fly dashboard going forward                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

### What We Store (Attack Surface)

| Data | Storage | Breach Impact | Mitigation |
|------|---------|---------------|------------|
| OAuth tokens | DB + KMS | Revocable access | User can revoke anytime |
| Org/team IDs | DB (plaintext) | No direct access | Not sensitive |
| Encrypted blobs | DB | Useless without KMS | KMS access required |

### What We Never Store

- Supabase connection strings
- Database passwords
- Stripe API keys
- Email service keys
- Any app-specific secrets

### Breach Scenarios

| Scenario | Impact | Recovery |
|----------|--------|----------|
| Database breach | Attacker gets encrypted blobs | Useless without KMS keys |
| KMS compromise | Attacker can decrypt tokens | Users revoke OAuth access |
| Both DB + KMS | Attacker has OAuth tokens | Tokens are revocable, not credentials |
| Our code compromised | Attacker could intercept runtime credentials | Monitoring, rotation, incident response |

### Compliance Notes

- **No PCI DSS scope**: We never store payment credentials
- **SOC 2 friendly**: Minimal data retention, encryption at rest
- **GDPR**: User can revoke access and we lose all ability to access their data

---

## Cost Analysis

| Approach | 100 users | 10K users | 100K users |
|----------|-----------|-----------|------------|
| Secrets Manager per-user | $40/mo | $4,000/mo | $40,000/mo |
| **DB + KMS (chosen)** | **~$2/mo** | **~$5/mo** | **~$20/mo** |

### Cost Breakdown

- KMS key: $1/month
- KMS API calls: ~$0.03 per 10K requests
- Database storage: Negligible (few KB per user)
- Secrets Manager (platform only): ~$5/month for 10-15 secrets

---

## Implementation Phases

### Phase 1: MVP Monday (Platform Secrets Only)

- [x] AWS Secrets Manager for pool credentials
- [x] Container loads secrets at startup
- [ ] Pre-create Supabase pool projects
- [ ] Store pool credentials in Secrets Manager

### Phase 2: Week 2 (User OAuth Tokens)

- [ ] Create KMS key `alias/app-factory-user-tokens`
- [ ] Database migration for `user_integration_tokens` table
- [ ] Supabase OAuth flow implementation
- [ ] Token encryption/decryption utilities
- [ ] On-demand credential fetching

### Phase 3: Week 3 (Deployment Integration)

- [ ] GitHub OAuth integration
- [ ] Fly.io token storage
- [ ] Pass-through app secrets flow
- [ ] Vercel integration (optional)

---

## References

- [AWS KMS Encryption SDK](https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/introduction.html)
- [Supabase Management API](https://supabase.com/docs/reference/api/introduction)
- [Supabase OAuth Apps](https://supabase.com/docs/guides/platform/oauth-apps)
- [Lovable Supabase Integration](https://docs.lovable.dev/integrations/supabase) (inspiration)
