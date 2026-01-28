# V1 Mono-Repo - Claude Context

## Structure

```
gen-ecd88319-leo-v1/
├── leo-web/           # SaaS frontend + orchestrator (from V0's gen-219eda6b)
│   └── Dockerfile
├── leo-worker/        # Python agent (from V0's app-factory/leo-container)
│   └── Dockerfile
├── scripts/           # Build/run/deploy (from saas-dev-agent, adapted)
│   ├── build.sh       # Local build (native arch)
│   ├── run-leo.sh     # Local run
│   └── deploy-ecs.sh  # ECR push + ECS deploy (prod only)
└── .build-state       # Written by build.sh, read by run-leo.sh
```

## Scripts

### build.sh - Local Build

```bash
./scripts/build.sh              # Build both (dev database - default)
./scripts/build.sh --prod       # Build with production database
./scripts/build.sh --container  # Only leo-worker
./scripts/build.sh --saas       # Only leo-web
./scripts/build.sh --no-cache   # Force rebuild
```

### run-leo.sh - Local Run

```bash
./scripts/run-leo.sh            # Run with dev database (default)
./scripts/run-leo.sh --prod     # Run with production database
./scripts/run-leo.sh --detach   # Run in background
```

### deploy-ecs.sh - Production Deploy

```bash
./scripts/deploy-ecs.sh         # Build AMD64, push ECR, deploy ECS (always prod)
```

## Image Names

| Image | Source | Purpose |
|-------|--------|---------|
| `leo-container:{commit}-{arch}` | `leo-worker/` | Generator container |
| `leo-saas-generated:{commit}-{arch}` | `leo-web/` | SaaS web app |

Local tags: `{commit}-arm64` or `{commit}-amd64`
ECR tags: `leo:{commit}`, `leo-saas-app:{commit}`

## Databases

| Prefix | Project ID | Usage |
|--------|------------|-------|
| `leo-dev/*` | `vkzbhsuzsowpdebvupyx` | Default for local dev |
| `leo/*` | `fwhwbmjwbdvmnrpszirc` | Production + `--prod` flag |

Scripts read Supabase credentials from AWS Secrets Manager using these prefixes.

## AWS Resources

- **ECR Registry**: `855235011337.dkr.ecr.us-east-1.amazonaws.com`
- **ECS Cluster**: `leo-saas-cluster`
- **CloudFront**: `d386l1mt30903c.cloudfront.net`
- **AWS Profile**: `jake-dev`

## Source Mapping

| V1 Directory | Original Source |
|--------------|-----------------|
| `leo-web/` | V0's `gen-219eda6b-032862af/` |
| `leo-worker/` | V0's `app-factory/leo-container/` |
| `scripts/` | `saas-dev-agent/scripts/` (adapted for mono-repo) |

## Credentials

Scripts fetch secrets from AWS Secrets Manager at build/run time. Source credentials:

| Location | Contains |
|----------|----------|
| `~/.secrets/supabase-credentials.md` | Master reference for all Supabase projects |
| `~/.secrets/dev.env` | Claude token, pool credentials |
| `/Users/jake/WORK/SAAS/repos-v2/gen-ecd88319-leo-v2/leo-web/.env.local` | V2 dev database (vkzbhsuzsowpdebvupyx) |
| `/Users/jake/WORK/SAAS/deployments/.env.leo-stack-old-*` | Production credentials |

AWS secrets created from these sources:
- `leo-dev/supabase-url`, `leo-dev/supabase-anon-key` → dev database
- `leo/supabase-url`, `leo/supabase-anon-key` → prod database

## Key Differences from Multi-Repo (V0)

1. Single git commit for both components
2. No git fetch/checkout in build scripts (mono-repo)
3. Relative paths from script location (not hardcoded `$HOME/...`)
4. `.build-state` stores commit + arch for run-leo.sh to use

## Prod Leo Self-Improvement Setup

This repo is configured for prod Leo to work on (Leo-on-Leo):

| Setting | Value |
|---------|-------|
| **App ID** | 101 |
| **App Name** | `leo-v1` |
| **User** | `jake@happyllama.ai` |
| **GitHub Repo** | https://github.com/app-gen-bot/gen-ecd88319-leo-v1 |
| **Console URL** | https://d386l1mt30903c.cloudfront.net/console/101 |

**Database records** (in prod Supabase `fwhwbmjwbdvmnrpszirc`):
- `apps` table: id=101, app_name='leo-v1'
- `generation_requests` table: created as Leo generates

**To have prod Leo work on this repo:**
1. Go to https://d386l1mt30903c.cloudfront.net/console/101
2. Login as jake@happyllama.ai
3. Enter prompts (see `V1/docs/PROMPTS.md` for sequential prompts)

## See Also

- `/Users/jake/WORK/SAAS/CLAUDE.md` - Overall SAAS workspace structure, V0/V1/V2 context
- `/Users/jake/WORK/SAAS/V1/CLAUDE.md` - V1 quick reference
