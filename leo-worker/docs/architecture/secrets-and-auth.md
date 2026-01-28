# Leo Remote - Secrets & Authentication

## Overview

Leo Remote separates secrets into two categories:

| Category | Examples | Storage | Who Provides |
|----------|----------|---------|--------------|
| **User Secrets** | `CLAUDE_CODE_OAUTH_TOKEN` | `.env` file | Each developer |
| **Platform Secrets** | `GITHUB_BOT_TOKEN`, `FLY_API_TOKEN` | AWS Secrets Manager | Platform team |

## User Secrets

User secrets are personal credentials that each developer must provide.

### Setup

```bash
# 1. Copy the template
cp leo-container/.env.example leo-container/.env

# 2. Get your Claude Code OAuth token
claude config get oauthToken
# Or: claude /settings → OAuth Token

# 3. Add to .env
echo "CLAUDE_CODE_OAUTH_TOKEN=your-token-here" >> leo-container/.env
```

### How It Works

1. `.env` file is copied into Docker image at build time (via `COPY .env* ./`)
2. Container loads `.env` at startup using `python-dotenv`
3. No fallback - if token missing, container exits with error

### Security

- `.env` is gitignored - never committed
- Each developer has their own token
- Tokens are personal OAuth credentials tied to Claude Code account

## Platform Secrets

Platform secrets are shared across all users and managed centrally.

### Storage

AWS Secrets Manager with `leo/` prefix:

| Secret Name | Environment Variable | Purpose |
|-------------|---------------------|---------|
| `leo/github-bot-token` | `GITHUB_BOT_TOKEN` | Push to GitHub repos |
| `leo/fly-api-token` | `FLY_API_TOKEN` | Deploy to Fly.io |

### Access

Container loads platform secrets if AWS credentials are available:
- Local dev: Mounts `~/.aws` directory
- Fargate: Uses task execution role

### Failure Handling

Platform secrets are **optional** - if unavailable:
- GitHub push is skipped (non-fatal)
- Fly.io deployment is skipped (non-fatal)
- Generation still completes successfully

## Container Startup Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Load User Secrets from .env                         │
│   - CLAUDE_CODE_OAUTH_TOKEN (REQUIRED)                      │
│   - If missing: EXIT with error                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Load Platform Secrets from AWS Secrets Manager      │
│   - GITHUB_BOT_TOKEN (optional)                             │
│   - FLY_API_TOKEN (optional)                                │
│   - If AWS unavailable: WARN and continue                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Validate & Start Generation                         │
│   - User credentials: Must have CLAUDE_CODE_OAUTH_TOKEN     │
│   - Platform credentials: Optional (features disabled)      │
└─────────────────────────────────────────────────────────────┘
```

## SaaS Architecture (Future)

For production SaaS with many users:

```
User Secrets:
  - Stored in Supabase (encrypted column in users table)
  - Application-level encryption (AES-256)
  - Decrypted only when container starts
  - Or: User provides token at generation time (never stored)

Platform Secrets:
  - Stay in AWS Secrets Manager
  - Accessed via ECS task execution role
```

## Scripts

### View OAuth Token from Secrets

```bash
# View your token from AWS Secrets Manager
./leo-container/scripts/get-oauth-token.sh
```

### Create/Update Secrets

```bash
# Create a new secret
aws secretsmanager create-secret \
  --name leo/github-bot-token \
  --secret-string "ghp_xxxx"

# Update existing secret
aws secretsmanager put-secret-value \
  --secret-id leo/github-bot-token \
  --secret-string "ghp_yyyy"
```

## Environment Variables Reference

### Required (User)

| Variable | Description | Source |
|----------|-------------|--------|
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Code authentication | `.env` file |

### Optional (Platform)

| Variable | Description | Source |
|----------|-------------|--------|
| `GITHUB_BOT_TOKEN` | GitHub API token for bot account | AWS Secrets Manager |
| `FLY_API_TOKEN` | Fly.io deployment token | AWS Secrets Manager |

### Container Config (Passed by CLI)

| Variable | Description | Default |
|----------|-------------|---------|
| `USER_ID` | OS username of developer | `os.userInfo().username` |
| `APP_ID` | UUID for this app | Generated |
| `GENERATION_ID` | UUID for this generation run | Generated |
| `GITHUB_OWNER` | GitHub repo owner | `app-gen-saas-bot` |
| `IS_RESUME` | Whether resuming existing app | `false` |
| `AWS_PROFILE` | AWS profile for secrets | `jake-dev` |
