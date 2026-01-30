# Leo Infrastructure - Implementation Plan

## Objective

Deploy complete AWS infrastructure for Leo SaaS platform using CDK, enabling orchestrator/generator container pattern on ECS Fargate with cost-optimized networking and secure secrets management.

## Why CDK Infrastructure

- **Infrastructure as Code**: Version-controlled, reviewable, repeatable deployments
- **Type Safety**: TypeScript definitions catch configuration errors at build time
- **AWS Best Practices**: CDK L2 constructs encode AWS recommendations
- **Cost Optimization**: No NAT gateways, ephemeral generators, lifecycle policies
- **Security First**: Secrets Manager only, least-privilege IAM, no hardcoded credentials

## High-Level Phases

### 1. Core Networking
VPC with 2 AZs, public subnets only, security groups for ALB/orchestrator/generator

### 2. Container Infrastructure
ECS Fargate cluster, task definitions, ECR repositories, execution/task IAM roles

### 3. Load Balancing
ALB with optional ACM certificate (HTTPS), sticky sessions for WebSocket support

### 4. Data & Secrets
S3 bucket with lifecycle rules, Secrets Manager integration for all credentials

### 5. Observability
CloudWatch Logs groups with 1-week retention, ECS task metrics

## Success Criteria

- Orchestrator runs as always-on ECS Service (1 task)
- Generator spawnable on-demand via ECS RunTask
- All secrets from Secrets Manager (zero hardcoded credentials)
- Cost profile: ~$17/month orchestrator + ~$0.05/15min per generation
- WebSocket support via ALB sticky sessions
- Optional HTTPS via ACM certificate context parameter
