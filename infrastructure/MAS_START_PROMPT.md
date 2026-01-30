# MAS Starting Prompt

Review these documents to understand the project:

1. **README.md** - Project purpose and infrastructure components
2. **PLAN.md** - Objectives and implementation phases
3. **docs/ARCHITECTURE.md** - Infrastructure components and deployment flow
4. **docs/system-overview.md** - Complete architecture specification (fixed target)
5. **docs/environment-configuration.md** - Two-file .env pattern
6. **docs/secrets-management.md** - Secrets Manager strategy
7. **docs/deployment.md** - Deployment procedures

After reviewing, create your implementation plan using the research_agent subagent to design the optimal approach.

## Context

This infrastructure deploys containers built by leo-saas and leo-container repos. The architecture is **fixed** - focus on implementing the CDK definitions, not redesigning the architecture.

Historical implementation docs and test results in `docs/FINALIZED/` are preserved for reference only.

## Key Constraints

- **Cost**: ~$20/month baseline, no NAT gateways (public subnets + security groups)
- **Security**: All secrets via AWS Secrets Manager, least-privilege IAM roles
- **Pattern**: Persistent orchestrator (ECS Service) + ephemeral generators (ECS RunTask)
- **WebSocket Support**: ALB sticky sessions required for real-time streaming

## Development Workflow

Recommended approach: **Persistent EC2 Cloud Dev Box** (see docs/FINALIZED/recommendation.md)
- VS Code Remote + Claude Code CLI on EC2 with instance profile IAM
- Docker BuildKit + ECR layer caching for fast container rebuilds
- Direct CDK deploys without console clicks
- Full AWS parity with Fargate runtime
