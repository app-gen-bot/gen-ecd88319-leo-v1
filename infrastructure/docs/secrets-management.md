# Secrets Management - App-Gen SaaS

**Date:** 2025-10-20
**Purpose:** Document how to manage AWS Secrets Manager secrets for the platform

---

## Overview

The App-Gen SaaS platform requires several secrets to be stored in AWS Secrets Manager before deployment. These secrets are referenced by the CDK stack and injected into ECS tasks at runtime.

---

## Required Secrets

All secrets use the prefix `app-gen-saas/` to avoid conflicts with previous deployments.

### Secret Names

1. **`app-gen-saas/supabase-url`**
   - Description: Supabase project URL
   - Example: `https://flhrcbbdmgflzgicgeua.supabase.co`
   - Used by: app-gen-saas-app (orchestrator)

2. **`app-gen-saas/supabase-anon-key`**
   - Description: Supabase anonymous (public) key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Used by: app-gen-saas-app (orchestrator)

3. **`app-gen-saas/supabase-service-role-key`**
   - Description: Supabase service role key (SECRET - server only)
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Used by: app-gen-saas-app (orchestrator)

4. **`app-gen-saas/database-url`**
   - Description: PostgreSQL database connection string
   - Example: `postgresql://postgres.flhrcbbdmgflzgicgeua:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - Used by: app-gen-saas-app (orchestrator)

5. **`app-gen-saas/claude-oauth-token`**
   - Description: Claude Code OAuth token for app generation
   - Example: `sess-...`
   - Used by: Both orchestrator and generator containers

---

## Create or Update Secrets

### Prerequisites

1. Create a `.env` file in the root of `app-gen-infra`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your actual credentials

3. Ensure AWS CLI is configured with the correct profile:
   ```bash
   aws configure --profile jake-dev
   ```

### Run the script

```bash
cd app-gen-infra
./scripts/setup-aws-secrets.sh
```

**What it does:**
- Reads credentials from `.env`
- Creates or updates AWS Secrets Manager secrets
- Uses the prefix `app-gen-saas/` for all secret names
- Skips empty values
- Updates existing secrets if they already exist

**Script Location:** `app-gen-infra/scripts/setup-aws-secrets.sh`

---

## Environment Variables in .env

The `.env` file should contain:

```bash
# Supabase Configuration
SUPABASE_URL=https://flhrcbbdmgflzgicgeua.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=your-db-password
SUPABASE_PROJECT_ID=flhrcbbdmgflzgicgeua

# Claude Configuration
CLAUDE_CODE_OAUTH_TOKEN=sess-...

# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=jake-dev
```

---

## How Secrets Are Used in CDK

The CDK stack references these secrets:

```typescript
const supabaseUrlSecret = secretsmanager.Secret.fromSecretNameV2(
  this,
  'SupabaseUrl',
  'app-gen-saas/supabase-url'
);
```

Then they're injected into ECS task definitions:

```typescript
secrets: {
  SUPABASE_URL: ecs.Secret.fromSecretsManager(supabaseUrlSecret),
  CLAUDE_CODE_OAUTH_TOKEN: ecs.Secret.fromSecretsManager(claudeTokenSecret),
  // ...
}
```

At runtime, these become environment variables in the containers.

---

## Security Best Practices

1. **Never hardcode secrets** in code or CDK
2. **Use AWS Secrets Manager** for all credentials
3. **Limit IAM permissions** - only grant read access to secrets needed
4. **Rotate secrets** periodically (especially Claude OAuth token)
5. **Use service role keys** only in backend containers, never expose to frontend
6. **Monitor secret access** via CloudTrail

---

## Reference

- AWS Secrets Manager Docs: https://docs.aws.amazon.com/secretsmanager/
- CDK Secrets: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_secretsmanager-readme.html
- ECS Secrets: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/secrets-envvar.html

---

**Last Updated:** 2025-10-20
**Maintained By:** App-Gen SaaS Infrastructure Team
