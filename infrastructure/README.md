# Leo Infrastructure

AWS CDK infrastructure for deploying Leo SaaS platform to ECS Fargate.

## Purpose

Defines complete cloud infrastructure for Leo (App Factory) SaaS deployment:
- ECS Fargate cluster with orchestrator (always-on) and generator (on-demand) containers
- Application Load Balancer with optional HTTPS
- VPC with cost-optimized public subnet architecture (no NAT gateways)
- ECR repositories for container images
- S3 storage for generated applications
- Secrets Manager integration for all credentials
- IAM roles with least-privilege permissions

## Key Concept

This repo deploys the **fixed target architecture** - complete AWS infrastructure defined in CDK that supports the orchestrator/generator pattern from leo-saas.

## Architecture Pattern

**Persistent Orchestrator + Ephemeral Generators**:
- Orchestrator: ECS Service (1 task always running, 2GB RAM, 1 vCPU) ~$17/month
- Generator: Task Definition only (spawned on-demand via ECS RunTask, 8GB RAM, 4 vCPU) ~$0.05/15min
- Multiple generators can run concurrently for parallel job processing

**Cost Optimization**:
- Public subnets only (no NAT gateways)
- Ephemeral generators (pay only when running)
- S3 lifecycle rules (30-day deletion)
- CloudWatch 1-week log retention

## Components

**This Repo Defines**:
- VPC and networking (2 AZs, public subnets, security groups)
- ECS Fargate cluster and task definitions
- Application Load Balancer with sticky sessions (WebSocket support)
- ECR repositories (`leo-saas-app`, `leo`)
- S3 bucket for generated apps
- IAM task roles (orchestrator can RunTask, both can access S3/Secrets)
- CloudWatch Logs groups

**Consumes**:
- Container images pushed from leo-saas and leo-container repos
- Secrets from AWS Secrets Manager (Supabase, Claude OAuth, GitHub, Fly.io)

**Integrates With**:
- leo-saas: Deploys orchestrator container
- leo-container: Deploys generator (WS CLI) container

## Configuration Pattern

**Two-File .env Strategy**:
- `.env.defaults` (committed) - Infrastructure values (cluster name, bucket, ARNs) maintained by AI
- `.env` (NOT committed) - User secrets (API keys, tokens) never seen by AI
- Load order: Defaults first, then secrets override

**Sibling Repository Convention**:
```
~/LEO/
├── leo-infra/         # CDK definitions (this repo)
├── leo-saas/          # Orchestrator code, .env with secrets
└── leo-container/     # Generator (WS CLI) code
```

## Development Workflow

**Recommended: Persistent EC2 Cloud Dev Box**:
- VS Code Remote + Claude Code CLI on EC2 with instance profile IAM
- Docker BuildKit + ECR layer caching for fast container rebuilds
- CDK deploys directly from dev box (no console clicks)
- AWS proximity eliminates network bottlenecks
- Full Fargate parity (same Secrets Manager, same networking)
- Cost: ~$25-45/month (see docs/FINALIZED/recommendation.md for full analysis)

## Documentation

- `docs/system-overview.md` - Complete architecture specification
- `docs/architecture.md` - Detailed infrastructure components
- `docs/environment-configuration.md` - Two-file .env pattern
- `docs/secrets-management.md` - Secrets Manager strategy
- `docs/deployment.md` - Deployment procedures
- `docs/FINALIZED/recommendation.md` - Development workflow evaluation (EC2 Dev Box recommended)

## Status

**Phase**: Planning and specification
