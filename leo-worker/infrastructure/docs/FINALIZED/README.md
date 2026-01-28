# App-Gen SaaS Infrastructure

AWS CDK infrastructure for the App-Gen SaaS platform.

## Environment Configuration

This repo uses a **sibling reference pattern** for secrets:

### Files in THIS repo
- **`.env.defaults`** - AWS config only (AWS_PROFILE, AWS_REGION) - committed

### Files in SIBLING repo (app-gen-saas)
- **`.env`** - Secrets (DATABASE_URL, API keys) - NOT committed
- **`.env.defaults`** - App defaults (ports, modes) - committed
- **`.env.secrets.template`** - Template for .env - committed

### Convention
Scripts in this repo reference `../app-gen-saas/.env` by convention.

Override with: `export SAAS_ROOT=/custom/path/app-gen-saas`

## Setup (First Time)

```bash
# 1. Clone repos as siblings
mkdir ~/WORK/APP_GEN_SAAS
cd ~/WORK/APP_GEN_SAAS
git clone <url> app-gen-infra
git clone <url> app-gen-saas

# 2. Create secrets in app-gen-saas (not here!)
cd app-gen-saas
cp .env.secrets.template .env
vim .env  # Fill in your secrets

# 3. Deploy from infra repo
cd ../app-gen-infra
npm install
npx cdk deploy --profile jake-dev
```

## Scripts

All scripts load from `../app-gen-saas/.env`:

- `scripts/setup-aws-secrets.sh` - Sync .env to AWS Secrets Manager
- `scripts/dev.sh` - Run local development (loads saas .env)
- `scripts/deploy.sh` - Deploy to AWS (loads saas .env)

## AWS Secrets Manager

Secrets are stored in AWS Secrets Manager for production:
- `app-gen-saas/supabase-url`
- `app-gen-saas/supabase-anon-key`
- `app-gen-saas/supabase-service-role-key`
- `app-gen-saas/database-url`
- `app-gen-saas/claude-oauth-token`

## Documentation

See `docs/` directory for detailed documentation:
- `docs/deployment.md` - Full deployment guide
- `docs/architecture.md` - System architecture
- `docs/environment-configuration.md` - Environment variable pattern

## For More Info

See `DEPLOYMENT_AGENT_SKILL.md` and `DEPLOYMENT_AGENT_PLAN.md` for current deployment status.
