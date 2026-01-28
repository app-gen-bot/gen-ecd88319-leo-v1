# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the AWS CDK infrastructure repository for the App-Gen SaaS platform. It defines and deploys the complete AWS infrastructure for a containerized application that generates apps using AI.

**Sibling Repository Pattern**: This repo works alongside `app-gen-saas` (the application code). Scripts reference `../app-gen-saas/.env` by convention, configurable via `SAAS_ROOT` environment variable.

## Multi-Repository Architecture

This is **one of three interconnected repositories** that make up the Happy Llama AI App Generator SaaS:

### The Three Repositories

1. **app-gen** (Python - Generator Agent)
   - Location: `/home/jake/WORK/APP_GEN_SAAS/V1/gen`
   - Branch: `leonardo-saas`
   - Role: The AI agent that actually generates applications using Claude Code
   - Output: Packaged as Docker container `app-gen-saas-generator:latest`
   - Tech: Python, cc-agent framework, FastAPI server for orchestration

2. **app-gen-saas** (TypeScript - Application Server)
   - Location: `/home/jake/WORK/APP_GEN_SAAS/V1/saas`
   - Branch: `v1`
   - Role: Web application that provides UI, orchestrates generation jobs, handles auth
   - Output: Packaged as Docker container `app-gen-saas-app:latest`
   - Tech: React + Express, WebSocket streaming, Supabase auth, GitHub integration

3. **app-gen-infra** (TypeScript - Infrastructure) **← YOU ARE HERE**
   - Location: `/home/jake/WORK/APP_GEN_SAAS/V1/infra`
   - Branch: `v1`
   - Role: AWS CDK definitions that deploy both containers to ECS Fargate
   - Output: CloudFormation templates → deployed AWS infrastructure
   - Tech: AWS CDK, ECS, S3, Secrets Manager, ALB, VPC

### Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│ Local Development                                               │
├─────────────────────────────────────────────────────────────────┤
│ 1. app-gen: Build generator agent container                     │
│    cd ../app-gen && docker build -t app-gen-saas-generator .    │
│                                                                  │
│ 2. app-gen-saas: Build application container                    │
│    cd ../app-gen-saas && ./scripts/build-and-push.sh            │
│                                                                  │
│ 3. app-gen-infra: Deploy infrastructure                         │
│    npx cdk deploy                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Production Runtime Flow                                         │
├─────────────────────────────────────────────────────────────────┤
│ User → ALB → app-gen-saas-app (orchestrator)                    │
│                     ↓                                            │
│              Spawns on-demand                                    │
│                     ↓                                            │
│           app-gen-saas-generator (task)                          │
│                     ↓                                            │
│           Generated app → S3 + GitHub                            │
└─────────────────────────────────────────────────────────────────┘
```

### Branch Coordination

These repos use coordinated experimental branches:
- **app-gen-saas**: `leonardo` branch
- **app-gen-infra**: `leonardo` branch
- **app-gen**: `leonardo-saas` branch (naming conflict with old leonardo/* branches)

**Safe rollback point**: Tag `working_20251023_1030` exists on all three repos marking the last known-good state before leonardo experiments.

### VS Code Workspace

All three repositories are managed in a single workspace:
```
/home/jake/NEW/WORK/APP_GEN/APP_GEN_SAAS.code-workspace
```

Open this file in VS Code to see all three repos as folders in one window.

## Build and Deployment Commands

### CDK Operations

```bash
# Install dependencies (first time)
npm install

# Build TypeScript
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Synthesize CloudFormation
npm run synth
# or: npx cdk synth

# Show infrastructure diff before deploying
npm run diff
# or: npx cdk diff

# Deploy infrastructure to AWS
npm run deploy
# or: npx cdk deploy

# Deploy with HTTPS (requires ACM certificate ARN)
npx cdk deploy -c certificateArn=arn:aws:acm:region:account:certificate/id

# Bootstrap CDK in AWS account (first time only)
npm run bootstrap
# or: cdk bootstrap

# Destroy entire stack
npm run destroy
# or: npx cdk destroy
```

### Infrastructure Scripts

```bash
# Sync secrets from ../app-gen-saas/.env to AWS Secrets Manager
./scripts/setup-aws-secrets.sh

# Scale service down to zero (cost savings)
./scripts/scale-down.sh

# Scale service back up to 1 task
./scripts/scale-up.sh

# Check memory usage statistics for right-sizing
./scripts/check-memory-stats.sh [hours]  # default: 24 hours
```

## High-Level Architecture

### Deployment Pattern: Two-Service ECS Fargate

**Main Service (app-gen-saas-app):**
- Always-running orchestrator service (1 task)
- Handles web requests, WebSocket connections, and job orchestration
- Spawns generator tasks on-demand via ECS RunTask API
- Serves combined frontend + backend (Express serving React static build)
- 2GB RAM, 1 vCPU

**Generator Service (app-generator):**
- Dynamically spawned tasks for app generation jobs
- Each task runs independently and terminates when complete
- Multiple tasks run in parallel for concurrent generations
- 8GB RAM, 4 vCPU (memory-intensive AI operations)

### Infrastructure Components

**Networking:**
- VPC with 2 AZs, public subnets only (no NAT gateways for cost)
- IPv6 dual-stack support
- Application Load Balancer (ALB) for SSL termination and routing
- Security groups: ALB → orchestrator, orchestrator → generator

**Container Infrastructure:**
- ECS Fargate cluster (no EC2 instances to manage)
- Two ECR repositories: `app-gen-saas-app` and `app-gen-saas-generator`
- Two task definitions with separate IAM roles
- CloudWatch Logs with 1-week retention

**Data & Secrets:**
- S3 bucket for generated apps (30-day lifecycle, auto-delete)
- AWS Secrets Manager for all sensitive credentials
- Secrets: supabase-url, supabase-anon-key, supabase-service-role-key, database-url, claude-oauth-token, github-bot-token

**HTTPS/TLS:**
- Optional ACM certificate integration (context parameter)
- ALB handles SSL termination (application runs HTTP internally)
- HTTP→HTTPS redirect when certificate configured

### Key Architecture Decisions

1. **Single container for orchestrator**: Frontend and backend combined in one container for simplicity at MVP scale. Migration path to CloudFront + S3 documented in `docs/architecture.md` for scaling.

2. **On-demand generator tasks**: Generator containers are not a service (no desired count). Orchestrator spawns them dynamically using `ecs.runTask()`, reducing costs by only paying for generation time.

3. **Public subnets + NAT-less**: Both orchestrator and generator run in public subnets with public IPs. Eliminates $30+/month NAT gateway costs. Acceptable for MVP security posture with proper security groups.

4. **Environment variable cascading**: Orchestrator passes context to generator tasks (S3_BUCKET, task definition ARN, subnets, security group). Generator tasks receive this via environment variables.

## Code Structure

```
bin/
  fargate-poc.ts          # CDK app entry point - instantiates stack
lib/
  fargate-poc-stack.ts    # Main CDK stack - all infrastructure definitions
scripts/
  setup-aws-secrets.sh    # Secrets management
  scale-down.sh           # Cost-saving shutdown
  scale-up.sh             # Service startup
  check-memory-stats.sh   # Memory monitoring for right-sizing
docs/
  architecture.md         # Canonical architecture reference
  deployment.md           # Deployment procedures
  environment-configuration.md  # Environment variable patterns
.env.defaults             # AWS-only config (committed)
cdk.json                  # CDK configuration
package.json              # Dependencies and npm scripts
```

## Critical Implementation Details

### Task Orchestration Pattern

The orchestrator service spawns generator tasks using AWS SDK:

```typescript
// Orchestrator grants itself ecs:RunTask permission
appGenSaasTaskRole.addToPolicy(new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['ecs:RunTask', 'ecs:StopTask', 'ecs:DescribeTasks'],
  resources: ['*'],
  conditions: {
    'ArnEquals': { 'ecs:cluster': cluster.clusterArn }
  }
}));

// Pass execution context via environment variables
appGenSaasContainer.addEnvironment('APP_GENERATOR_TASK_DEF', appGeneratorTaskDef.taskDefinitionArn);
appGenSaasContainer.addEnvironment('TASK_SECURITY_GROUP', appGeneratorSecurityGroup.securityGroupId);
appGenSaasContainer.addEnvironment('TASK_SUBNETS', vpc.publicSubnets.map(s => s.subnetId).join(','));
```

### Secret Management Pattern

Secrets are loaded from AWS Secrets Manager at container startup (no application code needed):

```typescript
secrets: {
  SUPABASE_URL: ecs.Secret.fromSecretsManager(supabaseUrlSecret),
  CLAUDE_CODE_OAUTH_TOKEN: ecs.Secret.fromSecretsManager(claudeTokenSecret),
  // ... etc
}
```

Application code simply reads `process.env.SUPABASE_URL` - AWS injects secrets automatically.

### Health Check Requirements

ALB requires `/health` endpoint returning 200 OK:
- Path: `GET /health`
- Interval: 30 seconds
- Healthy threshold: 2 consecutive successes
- Unhealthy threshold: 3 consecutive failures
- Timeout: 5 seconds

If health checks fail, ECS automatically restarts the task.

### Container Memory Sizing

Current allocation based on empirical testing:
- **Orchestrator**: 2GB (handles WebSocket connections + job management)
- **Generator**: 8GB (AI model operations are memory-intensive)

Use `./scripts/check-memory-stats.sh` to collect P99 percentiles and right-size:
- P99 > 90%: increase memory (risk of OOM kill)
- P95 < 50%: can reduce memory (cost optimization)

Generator is intentionally over-provisioned for MVP ($0.05 per 15-minute generation) to prevent user-facing failures.

## Environment Configuration

### Files and Locations

This repo (app-gen-infra):
- `.env.defaults` - AWS config (AWS_PROFILE, AWS_REGION, ECS_CLUSTER, etc.) - COMMITTED

Sibling repo (app-gen-saas):
- `.env` - Secrets (DATABASE_URL, API keys, OAuth tokens) - NOT COMMITTED
- `.env.defaults` - App defaults (ports, modes) - COMMITTED

### Secrets Setup Workflow

```bash
# 1. Create secrets in sibling repo
cd ../app-gen-saas
cp .env.secrets.template .env
vim .env  # Fill in actual secrets

# 2. Push secrets to AWS Secrets Manager (one-time)
cd ../app-gen-infra
./scripts/setup-aws-secrets.sh

# 3. Deploy infrastructure (references secrets by name)
npx cdk deploy --profile jake-dev
```

Secrets are never committed to git. CDK references them by name, AWS injects them at container runtime.

## Deployment Workflow

1. **Set AWS credentials**: Configure `AWS_PROFILE` in `.env.defaults` or use environment variables
2. **Bootstrap CDK** (first time): `cdk bootstrap aws://ACCOUNT-ID/REGION`
3. **Setup secrets**: Run `./scripts/setup-aws-secrets.sh` to sync secrets from sibling repo
4. **Build**: `npm run build` (TypeScript → JavaScript)
5. **Review changes**: `npm run diff` to see what will change
6. **Deploy**: `npm run deploy` (creates/updates entire stack)
7. **Get outputs**: ALB DNS, ECR URIs, task definition ARNs printed after deployment

### Updating Application Code

Infrastructure deployment (CDK) is separate from application deployment (Docker):

1. Build and push Docker images to ECR (done from app-gen-saas repo)
2. ECS automatically pulls latest images on next task start
3. For orchestrator: `aws ecs update-service --force-new-deployment` to restart with new image
4. For generator: New tasks automatically use latest image (no action needed)

## Common Operations

### Viewing Logs

```bash
# Orchestrator logs
aws logs tail /aws/ecs/app-gen-saas-app --follow

# Generator logs
aws logs tail /aws/ecs/app-generator --follow

# Filter for errors
aws logs filter-log-events \
  --log-group-name /aws/ecs/app-gen-saas-app \
  --filter-pattern ERROR
```

### Checking Service Health

```bash
# ECS service status
aws ecs describe-services \
  --cluster app-gen-saas-cluster \
  --services AppGenSaasService

# Target group health
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups \
    --names OrchestratorTargetGroup \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)
```

### Cost Management

Scale down when not in use to save ~$17/month:

```bash
# Before leaving for the day/weekend
./scripts/scale-down.sh

# When you need it again
./scripts/scale-up.sh
```

Service scales to zero in 1-2 minutes, scales back up in 60-90 seconds.

## Stack Outputs and References

After deployment, CDK outputs critical values:

- `URL` - Application URL (HTTP or HTTPS depending on certificate)
- `ALBDnsName` - Load balancer DNS name
- `AppGenSaasRepositoryUri` - ECR URI for orchestrator image
- `AppGeneratorRepositoryUri` - ECR URI for generator image
- `AppGeneratorTaskDefArn` - Task definition ARN (used by orchestrator)
- `TaskSecurityGroupId` - Security group for generator tasks
- `TaskSubnetIds` - Subnets for generator tasks
- `S3BucketName` - Generated apps bucket

These values are automatically set as environment variables in the orchestrator container. Application code reads them from `process.env`.

## Troubleshooting

**Container won't start**: Check CloudWatch logs for errors. Common causes: missing secrets, wrong IAM permissions, image pull failures.

**ALB returns 502**: Target is unhealthy. Check `/health` endpoint is responding 200 OK. Verify container is listening on port 5013.

**CDK deploy fails**: Check CloudFormation events for details. Common causes: resource limits (request quota increase), IAM permissions, resource name conflicts.

**Generator tasks fail**: Check CloudWatch logs in `/aws/ecs/app-generator`. Verify task has access to S3 bucket and secrets. Check memory isn't hitting limits (use `check-memory-stats.sh`).

## Important Files to Check

- `docs/architecture.md` - Canonical architecture reference, includes HTTPS setup, scaling patterns
- `docs/deployment.md` - Detailed deployment procedures
- `lib/fargate-poc-stack.ts:165-201` - Orchestrator task definition
- `lib/fargate-poc-stack.ts:203-224` - Generator task definition
- `lib/fargate-poc-stack.ts:102-142` - IAM roles and permissions
- `lib/fargate-poc-stack.ts:311-350` - HTTPS configuration (conditional on certificate)
