# Supabase Connection Types & Configuration

This document explains Supabase connection types, when to use each, and our specific configuration decisions for the Leo platform.

---

## Connection Types Overview

Supabase provides three ways to connect to your PostgreSQL database:

### 1. Direct Connection (Port 5432 on `db.*.supabase.co`)

```
postgresql://postgres.{ref}:{pass}@db.{ref}.supabase.co:5432/postgres
```

| Aspect | Details |
|--------|---------|
| **Endpoint** | `db.{project-ref}.supabase.co:5432` |
| **IPv4/IPv6** | **IPv6 only** (unless IPv4 add-on purchased) |
| **Pooling** | None (direct to Postgres) |
| **Prepared Statements** | Supported |
| **Multi-statement Transactions** | Supported |
| **Best For** | Maximum performance when IPv6 available |

### 2. Session Pooler (Port 5432 on `pooler.supabase.com`)

```
postgresql://postgres.{ref}:{pass}@aws-0-{region}.pooler.supabase.com:5432/postgres
```

| Aspect | Details |
|--------|---------|
| **Endpoint** | `aws-0-{region}.pooler.supabase.com:5432` |
| **IPv4/IPv6** | **Both supported** |
| **Pooling** | Session mode (exclusive connection per client) |
| **Prepared Statements** | Supported |
| **Multi-statement Transactions** | Supported |
| **Best For** | Migrations, DDL, when IPv6 unavailable |

### 3. Transaction Pooler (Port 6543 on `pooler.supabase.com`)

```
postgresql://postgres.{ref}:{pass}@aws-0-{region}.pooler.supabase.com:6543/postgres?pgbouncer=true
```

| Aspect | Details |
|--------|---------|
| **Endpoint** | `aws-0-{region}.pooler.supabase.com:6543` |
| **IPv4/IPv6** | **Both supported** |
| **Pooling** | Transaction mode (connection shared between clients) |
| **Prepared Statements** | **NOT supported** (use `prepare: false`) |
| **Multi-statement Transactions** | **NOT supported** |
| **Best For** | Runtime queries, serverless, high concurrency |

---

## Comparison Matrix

| Feature | Direct | Session Pooler | Transaction Pooler |
|---------|--------|----------------|-------------------|
| Port | 5432 (db.*) | 5432 (pooler.*) | 6543 (pooler.*) |
| IPv4 Support | No | Yes | Yes |
| IPv6 Support | Yes | Yes | Yes |
| Prepared Statements | Yes | Yes | No |
| Multi-statement TX | Yes | Yes | No |
| Connection Sharing | No | No | Yes |
| Scalability | Limited | Limited | High |
| Migrations | Yes | Yes | No |
| Runtime Queries | Yes | Yes | Yes |

---

## IPv4/IPv6 by Environment

| Environment | IPv6 Outbound | Recommended Connection |
|-------------|---------------|------------------------|
| **Docker Desktop (macOS)** | No | Session/Transaction Pooler |
| **Docker (Linux)** | Configurable | Session/Transaction Pooler |
| **AWS Fargate** | Yes (dual-stack) | Any (pooler recommended) |
| **Fly.io** | Yes | Any (pooler recommended) |
| **Native macOS** | ISP dependent | Session/Transaction Pooler |

---

## Our Configuration Decisions

### Environment Variable Naming (3-Tier with Aliases)

We use explicit connection type variables with semantic aliases for compatibility:

```bash
# ============================================================
# EXPLICIT CONNECTION TYPES
# ============================================================

# Session Pooler - IPv4 compatible, supports migrations
DATABASE_URL_SESSION=postgresql://postgres.{ref}:{pass}@aws-0-{region}.pooler.supabase.com:5432/postgres

# Transaction Pooler - IPv4 compatible, high concurrency
DATABASE_URL_TRANSACTION=postgresql://postgres.{ref}:{pass}@aws-0-{region}.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct - NOT used in dev (requires IPv6)
# DATABASE_URL_DIRECT=postgresql://postgres.{ref}:{pass}@db.{ref}.supabase.co:5432/postgres

# ============================================================
# SEMANTIC ALIASES (what code references)
# ============================================================

# For migrations (drizzle.config.ts) - needs multi-statement TX support
DATABASE_URL=${DATABASE_URL_SESSION}

# For runtime queries (server/lib/db.ts) - needs high concurrency
DATABASE_URL_POOLING=${DATABASE_URL_TRANSACTION}
```

### Why These Choices

| Decision | Rationale |
|----------|-----------|
| **Session pooler for migrations** | Supports prepared statements and multi-statement transactions required by Drizzle |
| **Transaction pooler for runtime** | Handles high concurrency, connection sharing, scales with autoscaling |
| **No direct in dev** | Docker on Mac doesn't support IPv6 outbound |
| **Aliases preserve compatibility** | `DATABASE_URL` and `DATABASE_URL_POOLING` continue to work - no prompt/skill changes needed |

### Usage by Component

| Component | Variable | Connection Type | Why |
|-----------|----------|-----------------|-----|
| `drizzle.config.ts` | `DATABASE_URL` | Session Pooler | Multi-statement migrations |
| `server/lib/db.ts` | `DATABASE_URL_POOLING` | Transaction Pooler | Runtime query scalability |
| `db_reset_manager.py` | `DATABASE_URL_POOLING` | Transaction Pooler | Single-statement DDL works fine |

---

## Configuration Requirements

### Transaction Pooler (Runtime)

When using transaction pooler, you MUST disable prepared statements:

**Node.js (postgres.js):**
```typescript
const client = postgres(process.env.DATABASE_URL_POOLING, {
  ssl: 'require',
  prepare: false,  // REQUIRED for transaction pooler
});
```

**Python (asyncpg):**
```python
conn = await asyncpg.connect(
    os.environ['DATABASE_URL_POOLING'],
    statement_cache_size=0  # REQUIRED for transaction pooler
)
```

### Session Pooler (Migrations)

Session pooler works with default settings - no special configuration needed.

```typescript
// drizzle.config.ts
export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL,  // Points to session pooler
  },
});
```

---

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `prepared statement "X" does not exist` | Using transaction pooler without disabling prepared statements | Add `prepare: false` (Node) or `statement_cache_size=0` (Python) |
| `ENOTFOUND db.*.supabase.co` | IPv6 not available | Use session or transaction pooler instead |
| `password authentication failed` | Wrong username format | Use `postgres.{project-ref}` not just `postgres` |
| `connection timeout` on port 5432 | IPv6 issues or wrong endpoint | Verify using `pooler.supabase.com` not `db.*.supabase.co` |
| Migration fails with transaction pooler | Multi-statement TX not supported | Use session pooler (`DATABASE_URL`) for migrations |

---

## References

- [Supabase: Connect to Your Database](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase: Connection Terminology Explained](https://supabase.com/docs/guides/troubleshooting/supavisor-and-connection-terminology-explained-9pr_ZO)
- [Supabase: Supavisor FAQ](https://supabase.com/docs/guides/troubleshooting/supavisor-faq-YyP5tI)
- [Prisma: Supabase Configuration](https://www.prisma.io/docs/orm/overview/databases/supabase)
