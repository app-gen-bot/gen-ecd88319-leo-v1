# Leo SaaS Config Architecture

> **Goal**: Containerize Leo SaaS with database-driven config, eliminating env file dependency

## Current State

Leo SaaS runs outside a container with config in `.env.local` files:
- Vite reads `VITE_*` vars at **build time** → baked into JS bundle
- Express reads `process.env` at **runtime** → could be env vars, but currently files

**Problem**: Config scattered across files, must rebuild for different environments.

---

## Target Architecture

### Two-Tier Config Model

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1: Bootstrap (Env Vars - Injected at Container Start)  │
├─────────────────────────────────────────────────────────────┤
│ DATABASE_URL          → Connect to Leo SaaS database        │
│ KMS_KEY_ID            → Decrypt secrets stored in DB        │
│ NODE_ENV              → production / development            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ TIER 2: Application Config (Loaded from Database)           │
├─────────────────────────────────────────────────────────────┤
│ Supabase pool credentials                                   │
│ GitHub bot token                                            │
│ Fly.io API token                                            │
│ Stripe keys                                                 │
│ Feature flags                                               │
│ Rate limits                                                 │
│ Any config that might change without redeploy               │
└─────────────────────────────────────────────────────────────┘
```

### Startup Flow

```
1. Container starts with bootstrap env vars (DATABASE_URL, KMS_KEY_ID)
2. Express connects to database
3. Load config from `deployment_config` table
4. Decrypt any encrypted values using KMS
5. Populate runtime config object (not process.env)
6. Start HTTP server
7. Client requests GET /api/config (public subset)
8. Client renders with runtime config
```

---

## Client Config (Runtime, Not Build-Time)

### Current (Vite Build-Time)
```typescript
// Baked into bundle at build time - BAD
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

### Target (Runtime Fetch)
```typescript
// client/src/lib/config.ts
let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (config) return config;
  const res = await fetch('/api/config');
  config = await res.json();
  return config;
}

// Usage in App.tsx
const config = await loadConfig();
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
```

### Server Endpoint
```typescript
// server/routes/config.ts
app.get('/api/config', (req, res) => {
  // Return only PUBLIC config - no secrets
  res.json({
    supabaseUrl: runtimeConfig.supabaseUrl,
    supabaseAnonKey: runtimeConfig.supabaseAnonKey, // anon key is public
    features: runtimeConfig.features,
  });
});
```

---

## Database Schema

```sql
-- Per-deployment config (Leo SaaS platform settings)
CREATE TABLE deployment_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Example rows
INSERT INTO deployment_config (key, value, encrypted, description) VALUES
  ('supabase_pool_url', 'https://lzyrnppmvuuxlozvlnsu.supabase.co', false, 'Pool project URL'),
  ('supabase_pool_service_key', 'encrypted:abc123...', true, 'Pool service role key'),
  ('github_bot_token', 'encrypted:def456...', true, 'GitHub bot PAT'),
  ('max_concurrent_generations', '5', false, 'Rate limit'),
  ('feature_voice_to_text', 'false', false, 'Feature flag');
```

---

## Container Injection

### Local Development (Docker)
```bash
docker run -e DATABASE_URL="postgresql://..." \
           -e KMS_KEY_ID="alias/leo-config" \
           -e NODE_ENV="development" \
           leo-saas:latest
```

### Production (AWS Fargate)
```json
{
  "containerDefinitions": [{
    "secrets": [
      { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:...leo/database-url" },
      { "name": "KMS_KEY_ID", "valueFrom": "arn:aws:secretsmanager:...leo/kms-key-id" }
    ],
    "environment": [
      { "name": "NODE_ENV", "value": "production" }
    ]
  }]
}
```

---

## Migration Path

### Phase 1: Add Runtime Config Loader
- [ ] Create `deployment_config` table
- [ ] Add config loader to Express startup
- [ ] Create `/api/config` endpoint
- [ ] Refactor client to use `loadConfig()` instead of `import.meta.env`

### Phase 2: Containerize
- [ ] Create Dockerfile for Leo SaaS
- [ ] Remove all `VITE_*` variables from build
- [ ] Test with injected env vars only

### Phase 3: Database-Driven Config
- [ ] Migrate existing env vars to `deployment_config` table
- [ ] Add KMS encryption for sensitive values
- [ ] Admin UI to edit config without redeploy

---

## Benefits

1. **Single artifact**: Same container image for dev/staging/prod
2. **No rebuild for config changes**: Update DB, restart container
3. **Audit trail**: Config changes tracked in database
4. **Dynamic config**: Feature flags, rate limits changeable at runtime
5. **Secrets in DB**: Encrypted, not in files or env vars at rest
