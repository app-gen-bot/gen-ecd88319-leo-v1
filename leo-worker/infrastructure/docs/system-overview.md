# System Overview

## Application Architecture

### Purpose
SaaS platform that generates React/Vite/Express web applications using AI (Claude Code). Users submit app requirements through a web interface, the system generates the application, and delivers it via S3 download, GitHub repository creation, or automatic deployment to Fly.io hosting ("Idea to URL").

### Three-Repository System

**app-gen** (Python - Generator Agent)
- AI agent that performs actual application generation using Claude Code
- Runs as isolated, on-demand container tasks
- Output: Packaged as Docker image `app-gen-saas-generator:latest`
- Branch: `leonardo-saas`

**app-gen-saas** (TypeScript - Application Server)
- Web UI, authentication, job orchestration, WebSocket streaming
- Runs as always-on service container
- Spawns generator tasks via ECS RunTask API
- Output: Packaged as Docker image `app-gen-saas-app:latest`
- Branch: `leonardo`

**app-gen-infra** (TypeScript - Infrastructure as Code)
- AWS CDK definitions for complete cloud infrastructure
- Deploys both containers to ECS Fargate with supporting services
- Branch: `leonardo`

### Runtime Flow

```
User Browser
    ↓ HTTPS
Application Load Balancer
    ↓ HTTP (internal)
Orchestrator Container (app-gen-saas-app)(app-gen-saas)
    ├─ Serves React UI
    ├─ Handles WebSocket connections
    ├─ Manages job queue
    └─ Spawns → Generator Container (app-gen-saas-generator)(app-gen)
                      ↓
                 Generates app using Claude Code
                      ↓
                 Uploads to S3 + GitHub + Fly.io deployment
                      ↓
                 Terminates
```

**Key Pattern**: Orchestrator is persistent (1 task always running). Generator tasks are ephemeral (spawned per job, terminate on completion). Multiple generators can run concurrently for parallel job processing.

## AWS Deployment Architecture

### Infrastructure Components

**Compute**
- ECS Fargate cluster (serverless containers)
- Orchestrator: ECS Service with 1 desired task (2GB RAM, 1 vCPU)
- Generator: Task definition only, no service (8GB RAM, 4 vCPU)
- Orchestrator spawns generator tasks dynamically using ECS RunTask API

**Networking**
- VPC with 2 availability zones, public subnets only
- Application Load Balancer with optional ACM certificate for HTTPS
- Security Groups: ALB → Orchestrator, Orchestrator → Generator
- No NAT gateways (public IPs + security groups for cost optimization)

**Container Registry**
- Two ECR repositories: `app-gen-saas-app` and `app-gen-saas-generator` (aspirational: shorter names `app-gen-saas` and `app-gen`)
- Images built in sibling repos, pushed to ECR, pulled by ECS

**Data & Secrets**
- S3 bucket for generated applications (30-day lifecycle deletion)
- Secrets Manager stores all credentials (Supabase auth and database, Claude OAuth, GitHub)
- Secrets injected as environment variables at container runtime

**Observability**
- CloudWatch Logs with 1-week retention per service
- ECS task metrics (CPU, memory) for right-sizing

### Security Model
- IAM task roles with least-privilege permissions
- Orchestrator can: RunTask (generator), write S3, read secrets
- Generator can: read/write S3, read secrets
- Secrets never in code or environment files, only Secrets Manager
- ALB handles SSL termination, internal traffic is HTTP

### Cost Profile
- Orchestrator: ~$17/month (always running)
- Generator: ~$0.05 per 15-minute generation (on-demand)
- S3/ALB/Secrets: ~$2-5/month
- Total: ~$20/month base + per-generation costs

## Development Workflows

### Level 1: npm run dev (Local Development)
**Purpose**: Fast iteration on UI and API logic without containerization overhead.

**What runs**:
- `app-gen-saas`: Local Node.js process (React dev server + Express API)
- `app-gen`: Not involved (mocked or skipped for frontend work)

**Characteristics**:
- Hot module reload for instant feedback
- Direct access to debugger
- Connects to remote Supabase (or local if configured)
- No generator task spawning (mocked responses)

**When to use**: UI changes, API endpoint development, auth flow testing

### Level 2: Local Docker (Integration Testing)
**Purpose**: Test multi-container interactions and task spawning logic without AWS deployment.

**What runs**: Both services as local Docker containers via Docker Compose. Simulates orchestrator→generator spawn pattern with local secrets.

**When to use**: Testing generator spawning, validating container interactions, debugging container-specific issues

### Level 3: Fargate (Production/Staging)
**Purpose**: Full AWS deployment with real infrastructure.

**What runs**: Complete CDK-defined infrastructure with containers from ECR, real ECS task spawning, production networking, secrets from AWS Secrets Manager.

**When to use**: Final validation before release, load testing, production deployments, debugging AWS-specific issues

### Workflow Progression
Typical development cycle:
1. **npm run dev**: Implement feature, verify UI/logic
2. **Local Docker**: Validate container behavior and service interactions
3. **Fargate**: Final smoke test, then production release

Critical changes (IAM, networking, task spawning) may skip Level 1 and start at Level 2 or 3.
