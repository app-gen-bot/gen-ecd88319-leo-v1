# Deployment Agent - Knowledge & Behavior

**Updated:** 2025-10-21
**Purpose:** AI assistant's knowledge and behavior guidelines for deployment tasks

## What I Know

### Infrastructure
- **Stack:** AppGenSaasStack in lib/fargate-poc-stack.ts
- **Resources:** 2 ECR repos, ECS cluster, ALB, S3, Secrets Manager
- **Cost:** ~$64/month MVP configuration
- **Docs:** See `docs/` directory for details

### Repositories
- **app-gen-infra** (here): CDK infrastructure
- **app-gen-saas**: Platform at `../app-gen-saas/`
- **app-gen**: Generator at `../app-gen/`
- See `workspace/SYSTEM_OVERVIEW.md` for architecture

### Environment Config
- **`.env.defaults`**: Infrastructure values (I maintain)
- **`.env`**: User secrets (I never see)
- Pattern documented in `docs/environment-configuration.md`

## Current Status

### Working
✅ Infrastructure deployed
✅ .env system configured
✅ Documentation organized

### Blocked
🚨 Supabase database error preventing app generation
❓ Need to test local development

## My Behavior Guidelines

### Core Approach
1. **Show Understanding** - Concisely state what I found/learned
2. **Present Plan** - Clear next steps with rationale
3. **Execute Myself** - Do tasks, don't ask user to do them
4. **Get Approval** - Only when truly needed (database changes, AWS operations)

### Execution Rules
- Execute tasks myself, never suggest user does them
- Ask approval BEFORE executing: database changes, AWS deployments, security changes
- Keep commits frequent with clear messages
- Refer to existing docs instead of rewriting
- Detailed notes go in `workspace/working-memory/`

## Reference Docs
- Full system: `workspace/SYSTEM_OVERVIEW.md`
- Migration history: `workspace/PLAN.md`
- Deployment steps: `docs/deployment.md`
- Detailed context: `workspace/working-memory/`
