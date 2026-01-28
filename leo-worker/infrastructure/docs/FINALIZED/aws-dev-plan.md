# AWS Development Plan for App-Gen SaaS

**Date**: 2024-10-24
**Status**: Recommendation Document
**Objective**: Enable ultra-fast, autonomous AI-assisted development and deployment cycles

---

## Executive Summary

This document provides a comprehensive plan to optimize the development workflow for the App-Gen SaaS platform (ECS Fargate-based AI application generator). The recommendation implements **Option #1: Persistent EC2 Cloud Dev Box** from the architect evaluation, which best meets the requirements for speed, AWS parity, AI autonomy, and cost constraints.

### Key Benefits
- **Speed**: Phase 1 iteration ≤ 120s, Phase 2 rebuild ≤ 5 min
- **Autonomy**: AI agent (Claude Code) can plan→build→deploy with no console clicks
- **Parity**: Development environment matches production (Fargate) patterns
- **Cost**: ≤ $50/month baseline (well within budget)
- **Security**: Least-privilege IAM, Secrets Manager only, no exposed ports

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Recommended Architecture](#recommended-architecture)
3. [Implementation Plan](#implementation-plan)
4. [Tooling & Environment](#tooling--environment)
5. [Phase Workflows](#phase-workflows)
6. [Automation Scripts](#automation-scripts)
7. [Cost Analysis](#cost-analysis)
8. [Risk Mitigation](#risk-mitigation)
9. [Acceptance Criteria](#acceptance-criteria)
10. [Alternative Options](#alternative-options)

---

## 1. Current State Analysis

### Current Architecture (Production)
```
app-gen-infra (CDK)     →  Defines infrastructure
app-gen-saas (TS)       →  Orchestrator (ECS Service, 2GB/1vCPU)
app-gen (Python)        →  Generator (ECS Task, 8GB/4vCPU)

ECS Fargate Cluster
├─ Orchestrator Service (always running)
│  ├─ Serves React UI
│  ├─ WebSocket streaming
│  ├─ Job queue
│  └─ Spawns generator tasks via RunTask API
└─ Generator Tasks (ephemeral)
   ├─ Claude Code agent
   ├─ Generates app code
   └─ Uploads to S3/GitHub/Fly.io
```

### Current Development Workflow (Pain Points)

**Level 1: Local npm run dev**
- ✅ Fast HMR for UI changes
- ❌ Limited by laptop network bandwidth for npm installs
- ❌ Local environment differs from Fargate (env vars, IAM patterns)
- ❌ Generator mocked, can't test full flow

**Level 2: Local Docker Compose**
- ✅ Tests container interactions
- ❌ Slow builds on laptop (no layer cache)
- ❌ Docker Desktop limitations (memory, network)
- ❌ Secrets management via .env files (parity issue)

**Level 3: Fargate Deployment**
- ✅ Full production parity
- ❌ Slow iteration cycle (build → push ECR → deploy → test = 10-20 min)
- ❌ Manual console steps for debugging
- ❌ Expensive to keep running for development

### Key Problems Identified

1. **Speed**: Container builds take 5-15 minutes locally due to network constraints
2. **Parity**: Local .env files don't match Secrets Manager patterns
3. **Autonomy**: AI agent can't deploy without manual intervention
4. **GitHub Friction**: Changes require PR process, slowing iteration
5. **Cost**: Running dev Fargate cluster continuously = $50-100/month extra

---

## 2. Recommended Architecture

### Solution: Persistent EC2 Cloud Dev Box

**High-Level Design**:
```
┌─────────────────────────────────────────────────────────────┐
│ EC2 Dev Box (t3a.small, us-east-1)                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Development Environment                                  │ │
│ │ - VS Code Remote (SSH over SSM)                         │ │
│ │ - Claude Code CLI (w/ instance IAM role)                │ │
│ │ - Docker + Buildx + ECR cache                           │ │
│ │ - Node 20.x, Python 3.11, AWS CDK                       │ │
│ │ - Three repos: app-gen-infra, app-gen-saas, app-gen     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Three-Phase Development Flow                             │ │
│ │                                                          │ │
│ │ Phase 1: npm run dev (app-gen-saas)                     │ │
│ │   ├─ Vite dev server (HMR)                              │ │
│ │   ├─ Express API server                                 │ │
│ │   ├─ Port-forward via SSM → localhost:5173              │ │
│ │   └─ Iteration: < 120s                                  │ │
│ │                                                          │ │
│ │ Phase 2: Docker build + local test                      │ │
│ │   ├─ docker buildx build (w/ ECR cache)                 │ │
│ │   ├─ Push to ECR :dev tags                              │ │
│ │   ├─ docker compose up (local validation)               │ │
│ │   └─ Rebuild: < 5 min                                   │ │
│ │                                                          │ │
│ │ Phase 3: CDK deploy to Fargate                          │ │
│ │   ├─ cdk deploy --profile dev                           │ │
│ │   ├─ ECS updates to new :dev images                     │ │
│ │   ├─ Test via ALB URL                                   │ │
│ │   └─ Full deploy: < 10 min                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ↓
    AWS Services
    ├─ ECR (container images w/ cache)
    ├─ Secrets Manager (credentials)
    ├─ ECS Fargate (dev/staging/prod)
    ├─ S3 (generated apps)
    └─ CloudWatch Logs
```

### Why This Solution?

| Criterion | Laptop Dev | EC2 Dev Box ⭐ | Ephemeral EC2 | Laptop + CodeBuild |
|-----------|-----------|---------------|---------------|-------------------|
| **Phase 1 Speed** | Variable (network) | **Excellent** (<60s) | Good after warmup | Variable |
| **Phase 2 Speed** | 5-15 min | **2-4 min** (cache) | 3-6 min | 3-7 min |
| **AI Autonomy** | Medium (split) | **Highest** (full IAM) | High | Medium |
| **AWS Parity** | Low (.env files) | **High** (Secrets Mgr) | High | Medium |
| **Baseline Cost** | ~$0 | **$25-45/mo** | ~$5/mo | ~$10/mo |
| **Complexity** | Low | **Low** (1 box) | Medium (orchestration) | Medium (build jobs) |
| **GitHub Loop** | Required | **Optional** | Optional | Required |

### Network Architecture

```
VPC: app-gen-saas-vpc
├─ Public Subnets (2 AZs)
│  ├─ EC2 Dev Box (public IP, no inbound SG rules)
│  ├─ ECS Fargate Tasks (public IPs)
│  └─ ALB (internet-facing)
└─ No NAT Gateway (cost optimization)

Access Pattern:
Developer → SSM Session Manager → EC2 Dev Box
          └─ Port Forward: localhost:5173 → EC2:5173
          └─ No SSH keys, no open ports
```

### IAM Architecture

**EC2 Instance Profile** (dev-box-role):
```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": [
        "arn:aws:ecr:*:${ACCOUNT}:repository/app-gen-saas-app",
        "arn:aws:ecr:*:${ACCOUNT}:repository/app-gen-saas-generator"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:Describe*",
        "ecs:List*",
        "ecs:RunTask",
        "ecs:StopTask"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ecs:cluster": "arn:aws:ecs:*:${ACCOUNT}:cluster/app-gen-saas-cluster"
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::${ACCOUNT}:role/app-gen-saas-task-role",
        "arn:aws:iam::${ACCOUNT}:role/app-generator-task-role"
      ],
      "Condition": {
        "StringLike": {
          "iam:PassedToService": "ecs-tasks.amazonaws.com"
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "logs:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/project": "app-gen-saas"
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:${ACCOUNT}:secret:app-gen-saas/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:UpdateInstanceInformation",
        "ssmmessages:*",
        "ec2messages:*"
      ],
      "Resource": "*"
    }
  ]
}
```

**Guardrails**:
- Scoped to specific resources (ECR repos, ECS cluster, S3 buckets)
- PassRole limited to ECS task roles only
- Secrets Manager access limited to app-gen-saas/* prefix
- No EC2 launch/terminate permissions (prevents runaway instances)
- CloudWatch Logs write for dev box logging

---

## 3. Implementation Plan

### Phase 1: Infrastructure Setup (2-4 hours)

**Step 1.1: Create CDK Construct for Dev Box**

Create new file: `lib/dev-box-stack.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface DevBoxStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  ecrRepositories: {
    app: string;
    generator: string;
  };
  ecsClusterArn: string;
  secretsPrefix: string;
}

export class DevBoxStack extends cdk.Stack {
  public readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: DevBoxStackProps) {
    super(scope, id, props);

    // IAM Role for dev box
    const role = new iam.Role(this, 'DevBoxRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'Role for App-Gen SaaS development EC2 instance',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // ECR permissions
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchGetImage',
        'ecr:PutImage',
        'ecr:InitiateLayerUpload',
        'ecr:UploadLayerPart',
        'ecr:CompleteLayerUpload',
      ],
      resources: [
        `arn:aws:ecr:${this.region}:${this.account}:repository/${props.ecrRepositories.app}`,
        `arn:aws:ecr:${this.region}:${this.account}:repository/${props.ecrRepositories.generator}`,
      ],
    }));

    // ECR GetAuthorizationToken requires * resource
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ecr:GetAuthorizationToken'],
      resources: ['*'],
    }));

    // ECS permissions (scoped to cluster)
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ecs:Describe*',
        'ecs:List*',
        'ecs:RunTask',
        'ecs:StopTask',
      ],
      resources: ['*'],
      conditions: {
        'StringEquals': {
          'ecs:cluster': props.ecsClusterArn,
        },
      },
    }));

    // IAM PassRole (scoped to task roles)
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['iam:PassRole'],
      resources: [
        `arn:aws:iam::${this.account}:role/AppGenSaasTaskRole*`,
        `arn:aws:iam::${this.account}:role/AppGeneratorTaskRole*`,
      ],
      conditions: {
        'StringLike': {
          'iam:PassedToService': 'ecs-tasks.amazonaws.com',
        },
      },
    }));

    // CloudFormation for CDK deploys
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['cloudformation:*'],
      resources: [`arn:aws:cloudformation:${this.region}:${this.account}:stack/FargatePocStack/*`],
    }));

    // S3 for CDK assets and generated apps
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:*'],
      resources: [
        `arn:aws:s3:::cdk-*-assets-${this.account}-${this.region}`,
        `arn:aws:s3:::cdk-*-assets-${this.account}-${this.region}/*`,
        `arn:aws:s3:::app-gen-saas-generated-apps-${this.account}`,
        `arn:aws:s3:::app-gen-saas-generated-apps-${this.account}/*`,
      ],
    }));

    // Secrets Manager (read-only, scoped)
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
      ],
      resources: [`arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.secretsPrefix}/*`],
    }));

    // CloudWatch Logs
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'logs:DescribeLogStreams',
      ],
      resources: [`arn:aws:logs:${this.region}:${this.account}:log-group:/dev-box/*`],
    }));

    // Security Group (no inbound, all outbound)
    const securityGroup = new ec2.SecurityGroup(this, 'DevBoxSG', {
      vpc: props.vpc,
      description: 'Security group for App-Gen SaaS dev box',
      allowAllOutbound: true,
    });

    // User data script
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -e',
      '',
      '# Update system',
      'yum update -y',
      '',
      '# Install Docker',
      'yum install -y docker',
      'systemctl enable docker',
      'systemctl start docker',
      'usermod -aG docker ec2-user',
      '',
      '# Install Docker Buildx',
      'mkdir -p /usr/local/lib/docker/cli-plugins',
      'curl -SL https://github.com/docker/buildx/releases/download/v0.12.0/buildx-v0.12.0.linux-amd64 -o /usr/local/lib/docker/cli-plugins/docker-buildx',
      'chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx',
      '',
      '# Install Node.js 20.x',
      'curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -',
      'yum install -y nodejs',
      '',
      '# Install Python 3.11',
      'yum install -y python3.11 python3.11-pip',
      '',
      '# Install Git',
      'yum install -y git',
      '',
      '# Install AWS CLI v2',
      'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"',
      'unzip awscliv2.zip',
      './aws/install',
      'rm -rf aws awscliv2.zip',
      '',
      '# Install AWS CDK',
      'npm install -g aws-cdk',
      '',
      '# Create workspace directory',
      'mkdir -p /home/ec2-user/workspace',
      'chown ec2-user:ec2-user /home/ec2-user/workspace',
      '',
      '# Setup complete marker',
      'touch /home/ec2-user/.dev-box-ready',
      'chown ec2-user:ec2-user /home/ec2-user/.dev-box-ready',
    );

    // EC2 Instance
    this.instance = new ec2.Instance(this, 'DevBox', {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3A,
        ec2.InstanceSize.SMALL,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup,
      role,
      userData,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(80, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
      ssmSessionPermissions: true,
    });

    // Tags for cost tracking
    cdk.Tags.of(this.instance).add('project', 'app-gen-saas');
    cdk.Tags.of(this.instance).add('env', 'dev');
    cdk.Tags.of(this.instance).add('managed-by', 'cdk');

    // Outputs
    new cdk.CfnOutput(this, 'InstanceId', {
      value: this.instance.instanceId,
      description: 'Dev box instance ID (for SSM connection)',
      exportName: 'DevBoxInstanceId',
    });

    new cdk.CfnOutput(this, 'ConnectCommand', {
      value: `aws ssm start-session --target ${this.instance.instanceId} --region ${this.region}`,
      description: 'Command to connect to dev box via SSM',
    });
  }
}
```

**Step 1.2: Update Main CDK App**

Modify `bin/fargate-poc.ts` to include dev box:

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FargatePocStack } from '../lib/fargate-poc-stack';
import { DevBoxStack } from '../lib/dev-box-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Main infrastructure stack
const mainStack = new FargatePocStack(app, 'FargatePocStack', { env });

// Optional: Dev box stack (deploy separately)
const enableDevBox = app.node.tryGetContext('enableDevBox');
if (enableDevBox) {
  new DevBoxStack(app, 'AppGenDevBoxStack', {
    env,
    vpc: mainStack.vpc, // Export vpc from main stack
    ecrRepositories: {
      app: 'app-gen-saas-app',
      generator: 'app-gen-saas-generator',
    },
    ecsClusterArn: mainStack.cluster.clusterArn, // Export cluster from main stack
    secretsPrefix: 'app-gen-saas',
  });
}

app.synth();
```

**Step 1.3: Deploy Dev Box**

```bash
cd ~/NEW/WORK/APP_GEN/app-gen-infra
npm install
npx cdk deploy FargatePocStack  # Deploy main stack first
npx cdk deploy AppGenDevBoxStack -c enableDevBox=true
```

### Phase 2: Dev Box Configuration (1-2 hours)

**Step 2.1: Connect to Dev Box**

```bash
# Get instance ID from CDK output
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name AppGenDevBoxStack \
  --query 'Stacks[0].Outputs[?OutputKey==`InstanceId`].OutputValue' \
  --output text)

# Connect via SSM
aws ssm start-session --target $INSTANCE_ID
```

**Step 2.2: Clone Repositories**

```bash
# On dev box
cd ~/workspace

# Clone three repos (use SSH if you have keys, HTTPS otherwise)
git clone git@github.com:YOUR_ORG/app-gen-infra.git
git clone git@github.com:YOUR_ORG/app-gen-saas.git
git clone git@github.com:YOUR_ORG/app-gen.git

# Checkout correct branches
cd app-gen-infra && git checkout leonardo
cd ../app-gen-saas && git checkout leonardo
cd ../app-gen && git checkout leonardo-saas
```

**Step 2.3: Configure Docker Buildx**

```bash
# Create buildx builder with ECR cache
docker buildx create --use --name appgen-builder --driver docker-container

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
```

**Step 2.4: Install Dependencies**

```bash
# app-gen-saas
cd ~/workspace/app-gen-saas
npm ci

# app-gen-infra
cd ~/workspace/app-gen-infra
npm ci

# app-gen (Python)
cd ~/workspace/app-gen
python3.11 -m pip install --user -r requirements.txt
```

### Phase 3: Automation Scripts (2-3 hours)

**Step 3.1: Create devctl CLI**

Create `app-gen-infra/scripts/devctl`:

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$(cd "$PROJECT_ROOT/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[devctl]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[devctl]${NC} $1"; }
log_error() { echo -e "${RED}[devctl]${NC} $1"; }

# Commands

cmd_preflight() {
  log_info "Running preflight checks..."

  # Check AWS credentials
  if ! aws sts get-caller-identity &>/dev/null; then
    log_error "AWS credentials not configured"
    exit 1
  fi

  # Check Docker
  if ! docker info &>/dev/null; then
    log_error "Docker not running"
    exit 1
  fi

  # Check ECR login
  if ! docker buildx ls | grep -q appgen-builder; then
    log_warn "Buildx builder not found, creating..."
    docker buildx create --use --name appgen-builder
  fi

  # Check repos
  for repo in app-gen-infra app-gen-saas app-gen; do
    if [ ! -d "$WORKSPACE_ROOT/$repo" ]; then
      log_error "Repository $repo not found in $WORKSPACE_ROOT"
      exit 1
    fi
  done

  log_info "✅ Preflight checks passed"
}

cmd_secrets_materialize() {
  log_info "Materializing secrets from AWS Secrets Manager..."

  local ENV_FILE="$WORKSPACE_ROOT/app-gen-saas/.env.runtime"

  # Remove existing file
  rm -f "$ENV_FILE"

  # Fetch secrets
  SUPABASE_URL=$(aws secretsmanager get-secret-value \
    --secret-id app-gen-saas/supabase-url \
    --query SecretString --output text)

  SUPABASE_ANON_KEY=$(aws secretsmanager get-secret-value \
    --secret-id app-gen-saas/supabase-anon-key \
    --query SecretString --output text)

  SUPABASE_SERVICE_ROLE_KEY=$(aws secretsmanager get-secret-value \
    --secret-id app-gen-saas/supabase-service-role-key \
    --query SecretString --output text)

  DATABASE_URL=$(aws secretsmanager get-secret-value \
    --secret-id app-gen-saas/database-url \
    --query SecretString --output text)

  CLAUDE_TOKEN=$(aws secretsmanager get-secret-value \
    --secret-id app-gen-saas/claude-oauth-token \
    --query SecretString --output text)

  GITHUB_TOKEN=$(aws secretsmanager get-secret-value \
    --secret-id app-gen-saas/github-bot-token \
    --query SecretString --output text)

  # Write to file
  cat > "$ENV_FILE" <<EOF
# Auto-generated from AWS Secrets Manager
# DO NOT COMMIT THIS FILE

SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL=$DATABASE_URL
CLAUDE_CODE_OAUTH_TOKEN=$CLAUDE_TOKEN
GITHUB_BOT_TOKEN=$GITHUB_TOKEN

# Development mode
NODE_ENV=development
AUTH_MODE=supabase
STORAGE_MODE=database
PORT=5013
EOF

  chmod 600 "$ENV_FILE"
  log_info "✅ Secrets written to $ENV_FILE"

  # Auto-cleanup on exit
  trap "rm -f $ENV_FILE" EXIT
}

cmd_dev() {
  log_info "Starting development server..."

  cmd_secrets_materialize

  cd "$WORKSPACE_ROOT/app-gen-saas"

  # Load runtime env
  export $(cat .env.runtime | xargs)

  npm run dev
}

cmd_validate() {
  log_info "Building and validating containers..."

  cmd_preflight

  local ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
  local REGION=$(aws configure get region)
  local ECR_BASE="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"

  # Login to ECR
  aws ecr get-login-password --region $REGION | \
    docker login --username AWS --password-stdin $ECR_BASE

  log_info "Building app-gen-saas..."
  docker buildx build "$WORKSPACE_ROOT/app-gen-saas" \
    --platform linux/amd64 \
    --tag $ECR_BASE/app-gen-saas-app:dev \
    --cache-from type=registry,ref=$ECR_BASE/app-gen-saas-app:cache \
    --cache-to type=registry,ref=$ECR_BASE/app-gen-saas-app:cache,mode=max \
    --push

  log_info "Building app-gen..."
  docker buildx build "$WORKSPACE_ROOT/app-gen" \
    --platform linux/amd64 \
    --tag $ECR_BASE/app-gen-saas-generator:dev \
    --cache-from type=registry,ref=$ECR_BASE/app-gen-saas-generator:cache \
    --cache-to type=registry,ref=$ECR_BASE/app-gen-saas-generator:cache,mode=max \
    --push

  log_info "✅ Images pushed to ECR with :dev tags"

  # Optional: Local compose test
  log_info "Starting local docker compose test..."
  cd "$WORKSPACE_ROOT/app-gen-saas"

  cmd_secrets_materialize

  docker compose -f compose.dev.yml up -d

  log_info "✅ Containers running. Test with: curl http://localhost:5013/health"
  log_info "Stop with: docker compose -f compose.dev.yml down"
}

cmd_deploy() {
  log_info "Deploying to AWS Fargate..."

  cmd_preflight

  cd "$WORKSPACE_ROOT/app-gen-infra"

  # Update task definitions to use :dev tags
  log_info "Updating ECS task definitions..."

  # Deploy via CDK
  npx cdk deploy FargatePocStack --require-approval never

  log_info "✅ Deployed to Fargate"

  # Get ALB URL
  ALB_URL=$(aws cloudformation describe-stacks \
    --stack-name FargatePocStack \
    --query 'Stacks[0].Outputs[?OutputKey==`URL`].OutputValue' \
    --output text)

  log_info "Application URL: $ALB_URL"
}

cmd_run_generator() {
  log_info "Running generator task manually..."

  local CLUSTER="app-gen-saas-cluster"
  local TASK_DEF=$(aws ecs list-task-definitions \
    --family-prefix AppGeneratorTaskDef \
    --query 'taskDefinitionArns[0]' \
    --output text)

  local SUBNETS=$(aws cloudformation describe-stacks \
    --stack-name FargatePocStack \
    --query 'Stacks[0].Outputs[?OutputKey==`TaskSubnetIds`].OutputValue' \
    --output text)

  local SG=$(aws cloudformation describe-stacks \
    --stack-name FargatePocStack \
    --query 'Stacks[0].Outputs[?OutputKey==`TaskSecurityGroupId`].OutputValue' \
    --output text)

  aws ecs run-task \
    --cluster $CLUSTER \
    --task-definition $TASK_DEF \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG],assignPublicIp=ENABLED}" \
    --overrides '{
      "containerOverrides": [{
        "name": "app-generator",
        "environment": [
          {"name": "REQUEST_ID", "value": "test-'$(date +%s)'"},
          {"name": "APP_DESCRIPTION", "value": "Simple counter app"}
        ]
      }]
    }'

  log_info "✅ Generator task started"
}

cmd_logs_orchestrator() {
  log_info "Tailing orchestrator logs from CloudWatch..."

  aws logs tail /ecs/app-gen-saas-app --follow
}

cmd_logs_generator() {
  log_info "Tailing generator logs from CloudWatch..."

  aws logs tail /ecs/app-generator --follow
}

cmd_cleanup() {
  log_info "Cleaning up development environment..."

  # Stop local containers
  cd "$WORKSPACE_ROOT/app-gen-saas"
  docker compose -f compose.dev.yml down 2>/dev/null || true

  # Remove runtime env files
  rm -f "$WORKSPACE_ROOT/app-gen-saas/.env.runtime"

  # Prune Docker
  docker system prune -f

  log_info "✅ Cleanup complete"
}

# Main command dispatcher
case "${1:-}" in
  preflight)
    cmd_preflight
    ;;
  secrets:materialize)
    cmd_secrets_materialize
    ;;
  dev)
    cmd_dev
    ;;
  validate)
    cmd_validate
    ;;
  deploy)
    cmd_deploy
    ;;
  run:generator)
    cmd_run_generator
    ;;
  logs:orchestrator)
    cmd_logs_orchestrator
    ;;
  logs:generator)
    cmd_logs_generator
    ;;
  cleanup)
    cmd_cleanup
    ;;
  *)
    echo "Usage: devctl <command>"
    echo ""
    echo "Commands:"
    echo "  preflight            - Check prerequisites"
    echo "  secrets:materialize  - Fetch secrets from AWS Secrets Manager"
    echo "  dev                  - Run npm dev server with secrets"
    echo "  validate             - Build containers, push to ECR, test locally"
    echo "  deploy               - Deploy to Fargate via CDK"
    echo "  run:generator        - Manually run generator task"
    echo "  logs:orchestrator    - Tail orchestrator CloudWatch logs"
    echo "  logs:generator       - Tail generator CloudWatch logs"
    echo "  cleanup              - Stop containers, remove temp files"
    exit 1
    ;;
esac
```

Make it executable:
```bash
chmod +x scripts/devctl
```

**Step 3.2: Add VS Code Remote Configuration**

Create `.vscode/settings.json` in workspace root:

```json
{
  "remote.SSH.remotePlatform": {
    "dev-box": "linux"
  },
  "remote.SSH.useLocalServer": false,
  "remote.SSH.enableDynamicForwarding": true,
  "editor.formatOnSave": true,
  "files.watcherExclude": {
    "**/node_modules": true,
    "**/.git": true
  }
}
```

### Phase 4: VS Code Remote Setup (30 minutes)

**Step 4.1: Install VS Code Remote Extension**

Install "Remote - SSH" extension in VS Code.

**Step 4.2: Configure SSH over SSM**

Add to `~/.ssh/config` on your laptop:

```
Host dev-box
  HostName <instance-id>
  User ec2-user
  ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
  ServerAliveInterval 60
  TCPKeepAlive yes
```

**Step 4.3: Connect**

1. Open VS Code
2. Press `Cmd+Shift+P` → "Remote-SSH: Connect to Host"
3. Select `dev-box`
4. Open folder: `/home/ec2-user/workspace`

**Step 4.4: Install Claude Code CLI on Dev Box**

```bash
# On dev box
curl -fsSL https://claude.ai/install-cli.sh | sh

# Configure with OAuth token
claude code auth
```

---

## 4. Tooling & Environment

### Development Tools Matrix

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Node.js 20.x** | App-gen-saas runtime | `yum install -y nodejs` |
| **Python 3.11** | App-gen runtime | `yum install -y python3.11` |
| **Docker + Buildx** | Container builds | `yum install -y docker` + buildx plugin |
| **AWS CLI v2** | AWS operations | Official installer |
| **AWS CDK** | Infrastructure deployment | `npm install -g aws-cdk` |
| **Git** | Version control | `yum install -y git` |
| **Claude Code CLI** | AI agent | Install script from Claude |
| **VS Code Remote** | IDE | Local install + Remote-SSH extension |

### Environment Variables Pattern

**Development (.env.runtime - ephemeral)**:
```bash
# Fetched from Secrets Manager via devctl
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
DATABASE_URL=postgresql://...
CLAUDE_CODE_OAUTH_TOKEN=sk-ant-...
GITHUB_BOT_TOKEN=ghp_...

# Local overrides
NODE_ENV=development
AUTH_MODE=supabase
STORAGE_MODE=database
PORT=5013
```

**Production (ECS Task Definition)**:
```typescript
secrets: {
  SUPABASE_URL: ecs.Secret.fromSecretsManager(supabaseUrlSecret),
  SUPABASE_ANON_KEY: ecs.Secret.fromSecretsManager(supabaseAnonKeySecret),
  // ... etc
}
```

**Parity**: Both environments use AWS Secrets Manager as source of truth. Dev box materializes temporarily, Fargate injects at runtime.

### Docker Build Strategy

**Buildx with ECR Cache**:

```bash
# Build with cache
docker buildx build . \
  --platform linux/amd64 \
  --tag ${ECR}/app-gen-saas-app:dev \
  --cache-from type=registry,ref=${ECR}/app-gen-saas-app:cache \
  --cache-to type=registry,ref=${ECR}/app-gen-saas-app:cache,mode=max \
  --push

# Result:
# - First build: 5-10 min
# - Incremental: 30-120 sec (cache hit)
```

**Cache Strategy**:
- `:cache` tag stores all layers (mode=max)
- `:dev` tag for testing
- `:latest` tag for production
- `:stable` tag for rollback

---

## 5. Phase Workflows

### Phase 1: Rapid npm run dev (Target: ≤ 120s)

**Use Case**: UI changes, API endpoint development, auth flow testing

**What Runs**:
```
EC2 Dev Box
├─ Vite Dev Server (port 5173) - React HMR
├─ Express API (port 5013) - Backend
└─ Secrets from AWS Secrets Manager
```

**Access**:
```bash
# On laptop
aws ssm start-session --target <instance-id> \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["5173"],"localPortNumber":["5173"]}'

# Open browser
open http://localhost:5173
```

**Iteration Loop**:
1. Edit code in VS Code Remote
2. Vite HMR auto-reloads (< 1 sec)
3. Test in browser
4. Repeat

**Performance**:
- ✅ Hot reload: < 1 second
- ✅ Full restart: < 10 seconds
- ✅ npm install: < 30 seconds (AWS network)

**Limitations**:
- Generator not available (mocked)
- No ECS RunTask testing
- Single developer (no concurrent access)

### Phase 2: Container Validation (Target: ≤ 5 min)

**Use Case**: Testing container interactions, generator spawning, integration tests

**What Runs**:
```
Docker on EC2
├─ Orchestrator Container (built from source)
├─ Generator Container (built from source)
└─ docker-compose.yml orchestrates both
```

**Build Process**:
```bash
# Run validation
cd ~/workspace/app-gen-infra
./scripts/devctl validate

# What happens:
# 1. docker buildx build app-gen-saas → push to ECR :dev
# 2. docker buildx build app-gen → push to ECR :dev
# 3. docker compose up -d (using :dev images)
# 4. Smoke tests
```

**Performance** (with cache):
- ✅ Build + push: 2-4 min
- ✅ Compose up: 10-30 sec
- ✅ Total: < 5 min

**Testing**:
```bash
# Health check
curl http://localhost:5013/health

# Test generator spawn (mocked locally)
curl -X POST http://localhost:5013/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"description": "Test app"}'

# View logs
docker compose logs -f
```

### Phase 3: Fargate Deploy (Target: ≤ 10 min)

**Use Case**: Full AWS testing, production validation, load testing

**What Runs**:
```
ECS Fargate Cluster
├─ Orchestrator Service (pulls from ECR :dev or :latest)
├─ Generator Task Definition (pulls from ECR :dev or :latest)
├─ ALB routes traffic
├─ Secrets from AWS Secrets Manager
└─ Real ECS RunTask spawning
```

**Deploy Process**:
```bash
# Deploy infrastructure changes
cd ~/workspace/app-gen-infra
./scripts/devctl deploy

# What happens:
# 1. CDK synth (generates CloudFormation)
# 2. CDK deploy (updates stack)
# 3. ECS updates service (rolling deployment)
# 4. Health checks pass
# 5. ALB routes traffic to new tasks
```

**Performance**:
- ✅ CDK synth: 10-30 sec
- ✅ CloudFormation update: 3-8 min
- ✅ ECS rolling deployment: 2-5 min
- ✅ Total: 5-10 min

**Verification**:
```bash
# Get ALB URL
ALB_URL=$(aws cloudformation describe-stacks \
  --stack-name FargatePocStack \
  --query 'Stacks[0].Outputs[?OutputKey==`URL`].OutputValue' \
  --output text)

# Test health
curl $ALB_URL/health

# Test generation (real generator spawned)
curl -X POST $ALB_URL/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"description": "Production test app"}'

# Monitor logs
aws logs tail /ecs/app-gen-saas-app --follow
```

---

## 6. Automation Scripts

### devctl Command Reference

```bash
# Setup & validation
devctl preflight                  # Check AWS creds, Docker, repos
devctl secrets:materialize        # Fetch secrets from AWS

# Development workflows
devctl dev                        # Phase 1: npm run dev
devctl validate                   # Phase 2: Build, push, test locally
devctl deploy                     # Phase 3: Deploy to Fargate

# Operations
devctl run:generator              # Manual generator test
devctl logs:orchestrator          # Tail CloudWatch logs
devctl logs:generator             # Tail generator logs
devctl cleanup                    # Stop containers, remove temp files
```

### CI/CD Integration (Future)

When ready to add GitHub Actions:

```yaml
# .github/workflows/dev-deploy.yml
name: Dev Deploy

on:
  push:
    branches: [leonardo]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::ACCOUNT:role/GitHubActionsRole
          aws-region: us-east-1

      - name: Build and push
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR
          docker buildx build . --push --tag $ECR/app-gen-saas-app:${{ github.sha }}

      - name: Deploy via CDK
        run: |
          cd ../app-gen-infra
          npm ci
          npx cdk deploy --require-approval never
```

**Note**: For now, skip GitHub integration to maximize iteration speed. Add later when stabilizing for production.

---

## 7. Cost Analysis

### Monthly Cost Breakdown

**EC2 Dev Box** (persistent):
- Instance: t3a.small (2 vCPU, 2GB RAM)
  - On-Demand: $0.0188/hour × 730 hours = **$13.72/month**
  - Spot (optional): ~$5/month (70% savings, may be interrupted)
- EBS: 80 GB gp3
  - $0.08/GB/month × 80 = **$6.40/month**
- Data Transfer: Minimal (within AWS)
  - ~$1/month

**Subtotal Dev Box**: **~$21/month** (on-demand) or **~$12/month** (spot)

**Supporting Services** (shared with prod):
- ECR Storage: ~$1/month (compressed images)
- CloudWatch Logs: ~$2/month (1-week retention)
- S3: ~$1/month (generated apps, 30-day lifecycle)
- Secrets Manager: ~$2/month (6 secrets × $0.40)

**Subtotal Supporting**: **~$6/month**

**Production Fargate** (baseline):
- Orchestrator: ~$17/month (always running)
- Generator: $0.05/generation × usage
- ALB: ~$16/month (base + LCU)

**Subtotal Production**: **~$33/month + usage**

### Total Cost Profile

| Scenario | Monthly Cost | Notes |
|----------|-------------|-------|
| **Dev Only** | **$27** | Dev box + supporting services |
| **Dev + Prod (low traffic)** | **$60** | Within budget |
| **Dev + Prod (10 gens/day)** | **$75** | $0.50/day for generations |
| **Spot Dev + Prod** | **$51** | 30% savings on dev box |

**Budget Compliance**: ✅ **Well under $50/month for dev infrastructure**

### Cost Optimization Strategies

1. **Use Spot for Dev Box**: Save 60-70% ($13 → $5/month)
   - Trade-off: May be interrupted (< 5% chance historically)
   - Mitigation: User data script auto-configures on restart

2. **Stop Dev Box After Hours**: Save ~60%
   - Script: `aws ec2 stop-instances` at 6pm
   - Script: `aws ec2 start-instances` at 9am
   - Save: ~$13/month

3. **ECR Lifecycle Policy**: Keep only last 10 images
   - Current: Unlimited :dev tags
   - With policy: Auto-delete old tags after 30 days

4. **CloudWatch Logs Retention**: 3 days instead of 7
   - Save: ~$1/month

**Recommended**: Start with on-demand for stability, move to spot after 2 weeks if satisfied.

---

## 8. Risk Mitigation

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Spot instance interruption** | Low (5%) | Medium | Use on-demand initially; add spot later |
| **IAM permission issues** | Medium | High | Preflight checks; comprehensive policy testing |
| **Docker build cache miss** | Medium | Low | First build takes 10 min; subsequent builds fast |
| **Secrets leak** | Low | Critical | Auto-delete .env.runtime; audit IAM logs |
| **EBS disk full** | Low | Medium | Monitor disk usage; 80 GB generous for dev |
| **Network latency** | Very Low | Low | EC2 in us-east-1 (same as ECS) |
| **VS Code Remote disconnect** | Low | Low | SSM auto-reconnects; work saved on dev box |
| **CDK drift** | Medium | Medium | Regular `cdk diff`; tag all resources |

### Rollback Procedures

**If Dev Box Becomes Unstable**:
```bash
# 1. Terminate instance
aws ec2 terminate-instances --instance-ids <id>

# 2. Redeploy stack
npx cdk deploy AppGenDevBoxStack -c enableDevBox=true

# 3. Reconnect and re-clone repos (10-15 min)
```

**If Fargate Deployment Fails**:
```bash
# 1. ECS circuit breaker auto-reverts on health check failure
# 2. Manual rollback:
aws ecs update-service \
  --cluster app-gen-saas-cluster \
  --service AppGenSaasService \
  --task-definition <previous-arn>

# 3. CDK rollback:
npx cdk deploy --rollback
```

**If Secrets Compromised**:
```bash
# 1. Rotate in Secrets Manager (console or CLI)
aws secretsmanager rotate-secret \
  --secret-id app-gen-saas/supabase-url

# 2. Restart ECS tasks to pick up new values
aws ecs update-service --force-new-deployment \
  --cluster app-gen-saas-cluster \
  --service AppGenSaasService

# 3. Re-materialize on dev box
./scripts/devctl secrets:materialize
```

### Security Best Practices

1. **No Inbound SSH**: Use SSM Session Manager only
2. **Secrets Never in Code**: Secrets Manager + ephemeral .env files
3. **IAM Least Privilege**: Scoped to specific resources
4. **Audit Logging**: CloudTrail enabled for all API calls
5. **EBS Encryption**: Enabled by default in CDK
6. **Regular Updates**: Auto-update via user data on restart

---

## 9. Acceptance Criteria

### Functional Requirements

✅ **FR1**: Developer can connect to dev box via SSM in < 30 seconds
✅ **FR2**: `devctl dev` starts npm server with hot reload in < 2 minutes
✅ **FR3**: `devctl validate` builds and pushes containers in < 5 minutes (with cache)
✅ **FR4**: `devctl deploy` updates Fargate in < 10 minutes
✅ **FR5**: AI agent (Claude Code) can run all phases autonomously
✅ **FR6**: Secrets fetched from AWS Secrets Manager (no .env files committed)
✅ **FR7**: Docker builds use ECR cache (incremental builds < 2 min)

### Performance Requirements

✅ **PR1**: Phase 1 iteration latency ≤ 120 seconds (target: 60s)
✅ **PR2**: Phase 2 rebuild ≤ 5 minutes (target: 3min)
✅ **PR3**: Phase 3 deploy ≤ 10 minutes (target: 7min)
✅ **PR4**: npm install ≤ 60 seconds (AWS network bandwidth)
✅ **PR5**: Cold start (EC2 boot → ready) ≤ 5 minutes

### Parity Requirements

✅ **PAR1**: Dev environment uses Secrets Manager (not .env files)
✅ **PAR2**: Container builds target linux/amd64 (same as Fargate)
✅ **PAR3**: Environment variables match Fargate task definition
✅ **PAR4**: IAM patterns match production (task roles, not local creds)
✅ **PAR5**: Logs go to CloudWatch (same as production)

### Cost Requirements

✅ **CR1**: Baseline dev infrastructure ≤ $50/month
✅ **CR2**: No NAT gateway ($30/month savings)
✅ **CR3**: Spot instance option available (60-70% savings)
✅ **CR4**: EBS volume right-sized (80 GB sufficient)

### Security Requirements

✅ **SR1**: No SSH keys required (SSM only)
✅ **SR2**: No inbound security group rules
✅ **SR3**: IAM follows least-privilege principle
✅ **SR4**: Secrets never committed to Git
✅ **SR5**: EBS volume encrypted
✅ **SR6**: CloudTrail audit logging enabled

### Acceptance Tests

**Test 1: Cold Start to Deployed Canary**
```bash
# Start: Fresh EC2 instance
# Action: Boot → clone → build → deploy
# Expected: Fargate ALB returns 200 OK in < 10 minutes
# Result: ✅ Pass / ❌ Fail
```

**Test 2: Phase 1 Hot Reload**
```bash
# Start: npm run dev running
# Action: Edit React component, save
# Expected: Browser shows change in < 5 seconds
# Result: ✅ Pass / ❌ Fail
```

**Test 3: Phase 2 Incremental Build**
```bash
# Start: Previous build in ECR cache
# Action: Change one line of code, rebuild
# Expected: Build completes in < 2 minutes
# Result: ✅ Pass / ❌ Fail
```

**Test 4: Phase 3 ECS RunTask**
```bash
# Start: Deployed orchestrator
# Action: Submit generation job via UI
# Expected: Generator task starts, completes, uploads to S3
# Result: ✅ Pass / ❌ Fail
```

**Test 5: Secrets Parity**
```bash
# Start: Dev box + Fargate both running
# Action: Fetch secret from Secrets Manager
# Expected: Both environments read same value
# Result: ✅ Pass / ❌ Fail
```

**Test 6: AI Autonomy**
```bash
# Start: Claude Code CLI on dev box
# Action: AI agent runs "devctl deploy" via bash
# Expected: Deployment succeeds without human intervention
# Result: ✅ Pass / ❌ Fail
```

---

## 10. Alternative Options

### Option 2: Ephemeral EC2 Dev Boxes (On-Demand)

**Architecture**:
- Pre-baked AMI with all tools installed
- Spin up on demand, shut down after session
- Snapshot EBS for persistence

**Pros**:
- ✅ Near-zero idle cost ($5/month for AMI storage)
- ✅ Same tooling as Option 1
- ✅ Fresh environment each session

**Cons**:
- ❌ 1-3 minute cold start per session
- ❌ Cache warm-up adds latency to first build
- ❌ More complex orchestration (CloudFormation or Terraform)
- ❌ EBS snapshot/restore overhead

**When to Consider**:
- Budget is very tight (< $20/month total)
- Development is sporadic (< 10 hours/week)
- Willing to wait 2-3 min at start of each session

**Implementation Sketch**:
```bash
# Create AMI from configured instance
aws ec2 create-image --instance-id <id> --name app-gen-dev-box-v1

# Start script
devctl up    # Launches EC2 from AMI, attaches EBS
devctl down  # Snapshots EBS, terminates instance
```

### Option 3: Laptop + CodeBuild (Remote Builds)

**Architecture**:
- Keep `npm run dev` on laptop
- Container builds run in AWS CodeBuild
- CDK deploys from laptop (or CodeBuild)

**Pros**:
- ✅ Lowest steady-state cost (~$10/month)
- ✅ Familiar local development
- ✅ Scalable builds (parallel jobs)

**Cons**:
- ❌ Laptop network still a bottleneck (npm install)
- ❌ Lower parity (local OS vs Fargate)
- ❌ CodeBuild spin-up adds 30-60 sec per build
- ❌ AI agent split between laptop and AWS
- ❌ Requires zipping/uploading source to S3

**When to Consider**:
- Cannot use EC2 (organizational policy)
- Need to support multiple developers (shared CodeBuild)
- Want to minimize cloud footprint

**Implementation Sketch**:
```bash
# Local development
npm run dev    # Runs on laptop

# Build trigger
devctl build   # Zips source → S3 → triggers CodeBuild

# CodeBuild project
aws codebuild start-build \
  --project-name app-gen-builder \
  --source-location s3://bucket/source.zip
```

### Comparison Matrix

| Feature | **Option 1: Persistent EC2** ⭐ | Option 2: Ephemeral EC2 | Option 3: Laptop + CodeBuild |
|---------|------------------------------|------------------------|------------------------------|
| **Phase 1 Speed** | Excellent (< 60s) | Good after warmup | Variable (laptop network) |
| **Phase 2 Speed** | Excellent (2-4 min) | Good (3-6 min) | Good (3-7 min) |
| **AI Autonomy** | Highest (full IAM) | High | Medium (split) |
| **AWS Parity** | High (Secrets Mgr) | High | Medium (.env files) |
| **Idle Cost** | $21/month | $5/month | $0 |
| **Usage Cost** | $0 | $0.02/hour | $0.005/min (CodeBuild) |
| **Cold Start** | None | 1-3 min | N/A |
| **Complexity** | Low (1 box) | Medium (orchestration) | Medium (build jobs) |
| **Multi-Developer** | No (1 box) | Yes (multiple AMIs) | Yes (parallel builds) |

---

## Conclusion & Next Steps

### Recommendation

**Implement Option 1: Persistent EC2 Cloud Dev Box**

This option best meets all requirements:
- ✅ Speed: Phase 1 < 60s, Phase 2 < 5 min, Phase 3 < 10 min
- ✅ Autonomy: AI agent can run entire workflow without console clicks
- ✅ Parity: Same Secrets Manager, IAM, and networking patterns as Fargate
- ✅ Cost: $21-27/month (well under $50 budget)
- ✅ Simplicity: Single EC2 instance, minimal orchestration

### Implementation Timeline

**Week 1: Infrastructure Setup**
- Day 1-2: Create CDK stack for dev box
- Day 3: Deploy and verify connectivity (SSM)
- Day 4-5: Configure Docker, Buildx, VS Code Remote

**Week 2: Automation & Testing**
- Day 1-2: Build `devctl` CLI and test all commands
- Day 3: Test Phase 1 workflow (npm run dev)
- Day 4: Test Phase 2 workflow (container builds)
- Day 5: Test Phase 3 workflow (Fargate deploy)

**Week 3: Documentation & Handoff**
- Day 1-2: Document workflows and troubleshooting
- Day 3: Train AI agent on devctl commands
- Day 4-5: Run acceptance tests, optimize performance

### Quick Start (30-Minute Version)

If you want to test the concept immediately:

```bash
# 1. Launch EC2 manually (Console or CLI)
aws ec2 run-instances \
  --image-id ami-0c02fb55dcd0e42ab \
  --instance-type t3a.small \
  --iam-instance-profile Name=DevBoxProfile \
  --user-data file://bootstrap.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=app-gen-dev-box}]'

# 2. Connect via SSM
aws ssm start-session --target <instance-id>

# 3. Clone repos
cd ~
git clone <repos>

# 4. Run dev server
cd app-gen-saas
npm ci
npm run dev

# 5. Test port forwarding from laptop
aws ssm start-session --target <instance-id> \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["5173"],"localPortNumber":["5173"]}'

# 6. Open browser
open http://localhost:5173
```

### Success Metrics

After 3 weeks, evaluate:

1. **Speed**: Are all phase targets met? (< 120s, < 5 min, < 10 min)
2. **Autonomy**: Can AI agent run full cycle without manual intervention?
3. **Reliability**: Are builds consistent? Any cache misses?
4. **Cost**: Is monthly spend under $50?
5. **Developer Satisfaction**: Is workflow faster than laptop?

If all metrics pass → **Production-ready for main development workflow**

### Future Enhancements

**Phase 4: Optional Additions (Post-MVP)**

1. **Multi-Developer Support**: Create multiple dev boxes or time-share
2. **GitHub Actions Integration**: Add CI/CD pipeline for automated deploys
3. **CodeArtifact**: Add NPM/PIP proxy for faster package installs
4. **Monitoring Dashboard**: CloudWatch dashboard for dev box metrics
5. **Auto-Shutdown**: Lambda to stop dev box after hours (cost savings)
6. **Spot Instance**: Switch to spot for 60% cost reduction

---

## Appendix

### A. Useful Commands

```bash
# Connect to dev box
aws ssm start-session --target <instance-id>

# Port forward for local browser access
aws ssm start-session --target <instance-id> \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["5173"],"localPortNumber":["5173"]}'

# Check instance status
aws ec2 describe-instances \
  --instance-ids <instance-id> \
  --query 'Reservations[0].Instances[0].State.Name'

# View user data logs
sudo cat /var/log/cloud-init-output.log

# ECR login
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# List ECS tasks
aws ecs list-tasks --cluster app-gen-saas-cluster

# Tail CloudWatch logs
aws logs tail /ecs/app-gen-saas-app --follow --since 1h

# Check CDK diff before deploy
npx cdk diff

# Force ECS service update
aws ecs update-service \
  --cluster app-gen-saas-cluster \
  --service AppGenSaasService \
  --force-new-deployment
```

### B. Troubleshooting

**Issue**: Cannot connect via SSM
**Solution**: Check IAM instance profile has SSM permissions, verify instance is in public subnet

**Issue**: Docker build fails with "no space left on device"
**Solution**: Increase EBS volume size or run `docker system prune -a`

**Issue**: ECR push fails with authentication error
**Solution**: Re-run `aws ecr get-login-password | docker login ...`

**Issue**: npm install slow on dev box
**Solution**: Consider adding CodeArtifact as NPM proxy

**Issue**: CDK deploy fails with permission error
**Solution**: Check IAM role has CloudFormation and service permissions

**Issue**: Port forward disconnects frequently
**Solution**: Add ServerAliveInterval to SSH config, check network stability

### C. References

- AWS CDK Documentation: https://docs.aws.amazon.com/cdk/
- ECS Task Definitions: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html
- Docker Buildx Cache: https://docs.docker.com/build/cache/backends/registry/
- SSM Session Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html
- VS Code Remote SSH: https://code.visualstudio.com/docs/remote/ssh

---

**Document Version**: 1.0
**Last Updated**: 2024-10-24
**Author**: AI Architecture Team
**Status**: Ready for Implementation
