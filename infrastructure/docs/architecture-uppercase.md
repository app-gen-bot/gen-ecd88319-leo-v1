# Architecture Overview

## System Context

**This Repo (leo-infra)**:
AWS CDK definitions for complete Leo SaaS cloud infrastructure on ECS Fargate

**leo-saas (separate repo)**:
Orchestrator with Web UI, auth, WebSocket streaming - deployed as always-on ECS Service

**leo-container (separate repo)**:
WS CLI generator that wraps AppGeneratorAgent - deployed as on-demand ECS tasks

**leo-mock (separate repo)**:
Fast behavioral mock for development

## Infrastructure Components

### Compute (ECS Fargate)
- **Cluster**: Single ECS cluster for both services
- **Orchestrator Service**: 1 desired task (2GB RAM, 1 vCPU), always running
- **Generator Task Definition**: No service (8GB RAM, 4 vCPU), spawned on-demand
- Pattern: Persistent orchestrator spawns ephemeral generators via ECS RunTask API

### Networking (Cost-Optimized)
- **VPC**: 2 availability zones, public subnets only
- **No NAT Gateways**: Public IPs + security groups for cost savings
- **ALB**: Application Load Balancer with sticky sessions (WebSocket support)
- **Security Groups**:
  - ALB → Orchestrator (port 5013)
  - Orchestrator → Generator (outbound all)
  - IP whitelist on ALB (configurable, currently 187.223.16.15/32)

### Container Registry (ECR)
- Repository: `leo-saas-app` (orchestrator image from leo-saas)
- Repository: `leo` (generator image from leo-container)
- Images built in sibling repos, pushed to ECR, pulled by ECS

### Data Storage
- **S3 Bucket**: Generated applications storage
  - Naming: `leo-saas-generated-apps-{account-id}`
  - Lifecycle: 30-day automatic deletion
  - Encryption: S3-managed
  - Access: Private (orchestrator/generator task roles only)

### Secrets Management
All credentials stored in AWS Secrets Manager:
- `leo-saas/supabase-url`
- `leo-saas/supabase-anon-key`
- `leo-saas/supabase-service-role-key`
- `leo-saas/database-url`
- `leo-saas/github-bot-token`
- `leo-saas/fly-api-token`
- `leo-saas/claude-oauth-token`

Secrets injected as environment variables at container runtime (never in code/files)

### IAM Security Model

**Orchestrator Task Role**:
- ECS RunTask, StopTask, DescribeTasks (generator tasks only)
- PassRole (generator task role only)
- S3 ReadWrite (generated apps bucket)
- Secrets Manager GetSecretValue (all leo-saas/* secrets)

**Generator Task Role**:
- S3 Write (generated apps bucket)
- Secrets Manager GetSecretValue (claude-oauth-token only)

**Execution Role** (both services):
- ECR image pull
- CloudWatch Logs write
- Secrets Manager read (for environment variable injection)

### Observability
- **CloudWatch Logs**: `/ecs/leo-saas-app`, `/ecs/leo`
- **Retention**: 1 week (cost optimization)
- **Metrics**: ECS task CPU/memory for right-sizing

## Deployment Flow

```
Developer Workflow (EC2 Dev Box)
    ↓
Build containers (Docker BuildKit + ECR cache)
    ↓
Push images to ECR (leo-saas-app:latest, leo:latest)
    ↓
CDK Deploy (from leo-infra)
    ↓
CloudFormation creates/updates stack
    ↓
ECS pulls latest images from ECR
    ↓
Orchestrator Service updates (rolling deployment)
Generator Task Definition updated (no service, used for RunTask)
    ↓
ALB health checks pass
    ↓
Deployment complete
```

## Runtime Flow

```
User Browser
    ↓ HTTPS (optional, via ACM certificate)
Application Load Balancer
    ↓ HTTP (internal, port 5013)
Orchestrator Container (ECS Service)
    ├─ Serves React UI
    ├─ Handles WebSocket connections (sticky sessions)
    ├─ Manages job queue
    └─ Spawns → Generator Container (ECS RunTask)
                      ↓
                 Connects via WebSocket to orchestrator
                      ↓
                 Generates app using AppGeneratorAgent
                      ↓
                 Uploads workspace to S3
                      ↓
                 Pushes app to GitHub (optional)
                      ↓
                 Sends all_work_complete message
                      ↓
                 Terminates (ephemeral)
```

## Cost Profile

**Monthly Baseline** (~$20):
- Orchestrator: ~$17/month (always running, 2GB/1vCPU)
- S3: ~$1-2/month (storage + requests)
- ALB: ~$1-2/month (LCU charges)
- Secrets Manager: ~$0.40/month (8 secrets × $0.05)

**Per-Generation** (~$0.05/15min):
- Generator task: 8GB/4vCPU Fargate pricing
- Multiple concurrent generators supported

**Development** (optional, ~$25-45/month):
- EC2 t3a.small Dev Box for fast iteration
- EBS storage for workspace
- See docs/FINALIZED/recommendation.md for full analysis

## Configuration Management

**Two-File Pattern**:
- `.env.defaults` (committed, AI-maintained) - Infrastructure values (cluster name, bucket ARN, etc.)
- `.env` (NOT committed, user-maintained) - Secrets (API keys, tokens)

**Sibling Repository Convention**:
Infrastructure scripts reference `../leo-saas/.env` for secrets by convention

## Deployment Variations

**HTTP Only** (development/testing):
```bash
cdk deploy
```
ALB listens on port 80 only, outputs `http://{alb-dns}`

**HTTPS** (production):
```bash
cdk deploy -c certificateArn=arn:aws:acm:region:account:certificate/id
```
ALB listens on port 443 (HTTPS) + 80 (redirects to HTTPS), outputs `https://{alb-dns}`

## Security Boundaries

- **Network**: Security groups restrict traffic (ALB → Orchestrator only)
- **IAM**: Least-privilege task roles (orchestrator can't access generator-only resources)
- **Secrets**: Zero hardcoded credentials, all from Secrets Manager
- **Data**: S3 private access only, encrypted at rest
- **ALB**: Optional IP whitelist for access control

## See Also

- `system-overview.md` - Complete architecture specification
- `environment-configuration.md` - Two-file .env pattern details
- `secrets-management.md` - Secrets Manager strategy
- `deployment.md` - Deployment procedures and troubleshooting
- `FINALIZED/recommendation.md` - Development workflow evaluation
