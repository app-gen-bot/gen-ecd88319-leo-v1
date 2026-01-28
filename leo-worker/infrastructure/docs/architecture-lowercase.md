# AWS Deployment Architecture (Canonical)

**Last Updated:** October 19, 2025
**Status:** Authoritative Reference

---

## Decision: AWS ECS Fargate with Application Load Balancer

**Pattern:** Containerized deployment on AWS ECS Fargate with infrastructure-as-code (CDK)

HTTPS is handled at the Application Load Balancer level using AWS Certificate Manager. The application runs HTTP internally behind the load balancer.

---

## Architecture Diagram

```
┌──────────┐
│ Internet │
└─────┬────┘
      │ HTTPS (443)
      ▼
┌─────────────────────────────────────┐
│   Application Load Balancer (ALB)   │
│   - SSL/TLS Termination (ACM Cert)  │
│   - Health Checks                    │
│   - Target Group Routing             │
└─────────────┬───────────────────────┘
              │ HTTP (5013)
              ▼
┌─────────────────────────────────────┐
│      ECS Fargate - launch-platform   │
│      - Frontend (React/Vite)         │
│      - Backend (Express)             │
│      - Single Container (HTTP)       │
└──────────┬────────────┬──────────────┘
           │            │
           │            └──────────────┐
           ▼                           ▼
    ┌──────────────┐         ┌──────────────────┐
    │   Supabase   │         │  ECS Fargate     │
    │   - Auth     │         │  app-generator   │
    │   - Database │         │  (spawned tasks) │
    └──────────────┘         └────────┬─────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │  S3 Bucket   │
                               │ Generated    │
                               │ Apps         │
                               └──────────────┘
```

---

## Why This Pattern

### Infrastructure Benefits
- **Fully managed**: No server management, AWS handles patching and scaling
- **Auto-scaling**: Fargate scales containers based on load
- **Infrastructure as Code**: CDK ensures repeatable, version-controlled deployments
- **Immutable deployments**: Each deploy creates new tasks, zero-downtime rollouts
- **Cost-effective**: Pay only for compute time used (no idle server costs)

### Security Benefits
- **SSL/TLS at edge**: ALB terminates HTTPS with AWS Certificate Manager certificates
- **No certificate management in code**: AWS handles cert renewal automatically
- **VPC isolation**: Containers run in private subnets (ALB in public subnet)
- **Secrets managed securely**: AWS Secrets Manager, never in code or env files
- **IAM roles**: Fine-grained permissions for container actions

### Operational Benefits
- **One-command deployment**: `cdk deploy` updates entire stack
- **Easy rollback**: CloudFormation handles rollback on failure
- **Centralized logging**: CloudWatch Logs for all containers
- **Health monitoring**: ALB health checks with automatic restart
- **Easy cleanup**: `cdk destroy` removes all resources

---

## Deployment Patterns

### Pattern 1: Combined Frontend + Backend (Current)

**Use When:**
- < 100 concurrent users
- < 500 WebSocket connections
- Single region deployment
- Early stage / MVP / testing

**Architecture:**
```
┌─────────────────────────────────────┐
│   ECS Fargate - launch-platform     │
│   - Express serves API (port 5013)  │
│   - Serves static React build        │
│   - WebSocket connections            │
│   - 2GB RAM, 1 vCPU                  │
└─────────────────────────────────────┘
```

**Benefits:**
- ✅ Simple deployment (one Dockerfile, one task definition)
- ✅ Fewer moving parts to debug
- ✅ Lower operational overhead
- ✅ Single ALB target group

**Limitations:**
- ⚠️ Can't scale frontend and API independently
- ⚠️ Serving static files uses API container resources
- ⚠️ Single region (no CDN)

**Current Implementation:**
```typescript
// server/index.ts
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}
```

---

### Pattern 2: Separated Frontend + Backend (Scale)

**Use When:**
- > 100 concurrent users
- > 500 WebSocket connections
- Multi-region users (CDN benefits)
- Production SaaS offering

**Architecture:**
```
┌──────────────────┐
│  CloudFront CDN  │
│  + S3 Bucket     │
│  (Static React)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ ECS Fargate (Auto-scale) │   │  ECS Fargate (On-demand) │
│ launch-platform API      │   │  app-generator tasks     │
│ - Express API only       │   │  - Spawned per job       │
│ - WebSocket server       │   │  - 2 vCPU, 4GB RAM       │
│ - 1-10 tasks (scale)     │   └──────────────────────────┘
└──────────────────────────┘
```

**Benefits:**
- ✅ Independent scaling (frontend traffic doesn't affect API)
- ✅ Global CDN (faster worldwide, <50ms latency)
- ✅ Cost efficient at scale (CloudFront $0.085/GB vs ECS compute)
- ✅ API tasks only handle business logic

**Scaling Comparison:**

| Metric | Combined | Separated |
|--------|----------|-----------|
| **1,000 concurrent users** | 1 large task (16GB RAM) | 10 small tasks (2GB each) + CloudFront |
| **Static asset serving** | ECS compute ($) | CloudFront (cheaper) |
| **Global latency** | Single region (200ms+) | CDN edge (50ms) |
| **WebSocket limit** | ~1,000 connections | 10,000+ (load balanced) |
| **Monthly cost** | ~$200 (single large task) | ~$200 (10 × $15 API + $50 CDN) |

**Migration Steps (No Code Changes):**

```bash
# 1. Build frontend with API URL
VITE_API_URL=https://api.yourdomain.com npm run build

# 2. Deploy to S3
aws s3 sync dist/ s3://launch-platform-frontend/

# 3. Create CloudFront (CDK)
new cloudfront.Distribution(this, 'Frontend', {
  defaultBehavior: {
    origin: new origins.S3Origin(frontendBucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
  },
  defaultRootObject: 'index.html',
  errorResponses: [
    { httpStatus: 404, responsePagePath: '/index.html', responseHttpStatus: 200 }
  ]
});

# 4. Update backend - Remove static serving
# Environment variable: SERVE_STATIC=false

# 5. Update CORS
app.use(cors({
  origin: process.env.FRONTEND_URL, // CloudFront URL
  credentials: true
}));
```

---

## HTTPS Setup (AWS Certificate Manager + ALB)

### Why ALB Handles HTTPS (Not the Application)

**Industry Best Practice:**
- ✅ Load balancer terminates SSL/TLS (SSL offloading)
- ✅ Application runs HTTP internally (simpler, faster)
- ✅ Certificates managed by cloud provider (auto-renewal)
- ✅ No private keys in application code (security)

**AWS-Specific Benefits:**
- Free SSL certificates via AWS Certificate Manager (ACM)
- Automatic renewal before expiration (no downtime)
- Integrated with ALB (zero config after setup)
- Supports wildcard certificates (*.yourdomain.com)

---

### Step 1: Request ACM Certificate

**Option A: DNS Validation (Recommended)**

```bash
# Request certificate
aws acm request-certificate \
  --domain-name launch.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Output:
{
  "CertificateArn": "arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID"
}
```

**Option B: Email Validation (if no Route 53)**

```bash
aws acm request-certificate \
  --domain-name launch.yourdomain.com \
  --validation-method EMAIL \
  --region us-east-1
```

**Wildcard Certificate (for subdomains):**

```bash
aws acm request-certificate \
  --domain-name "*.yourdomain.com" \
  --subject-alternative-names "yourdomain.com" \
  --validation-method DNS \
  --region us-east-1
```

---

### Step 2: Validate Certificate

**DNS Validation (if using Route 53 - Automated):**

```typescript
// CDK automatically creates validation records
const certificate = new acm.Certificate(this, 'Certificate', {
  domainName: 'launch.yourdomain.com',
  validation: acm.CertificateValidation.fromDns(hostedZone),
});
// AWS handles validation automatically
```

**DNS Validation (Manual):**

```bash
# Get validation CNAME record
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord'

# Output:
{
  "Name": "_abc123.launch.yourdomain.com",
  "Type": "CNAME",
  "Value": "_xyz456.acm-validations.aws."
}

# Add CNAME record to your DNS provider
# Wait for validation (5-30 minutes)

# Check status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID \
  --query 'Certificate.Status'
# Output: "ISSUED"
```

---

### Step 3: Configure ALB with Certificate

**CDK Configuration:**

```typescript
// lib/launch-platform-stack.ts

// Import existing certificate (if already created)
const certificate = acm.Certificate.fromCertificateArn(
  this,
  'Certificate',
  'arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID'
);

// Or create new certificate (recommended)
const certificate = new acm.Certificate(this, 'Certificate', {
  domainName: 'launch.yourdomain.com',
  validation: acm.CertificateValidation.fromDns(hostedZone),
});

// Create ALB
const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
  vpc,
  internetFacing: true,
  loadBalancerName: 'launch-platform-alb',
});

// Add HTTPS listener (port 443)
const httpsListener = alb.addListener('HttpsListener', {
  port: 443,
  protocol: elbv2.ApplicationProtocol.HTTPS,
  certificates: [certificate],  // Attach ACM certificate
  defaultAction: elbv2.ListenerAction.fixedResponse(404, {
    contentType: 'text/plain',
    messageBody: 'Not found',
  }),
});

// Add target group pointing to ECS service
httpsListener.addTargets('LaunchPlatformTarget', {
  port: 5013,  // Container port (HTTP)
  protocol: elbv2.ApplicationProtocol.HTTP,  // Internal HTTP
  targets: [ecsService],
  healthCheck: {
    path: '/health',
    interval: cdk.Duration.seconds(30),
    timeout: cdk.Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 3,
  },
});

// Optional: Redirect HTTP → HTTPS
alb.addListener('HttpListener', {
  port: 80,
  protocol: elbv2.ApplicationProtocol.HTTP,
  defaultAction: elbv2.ListenerAction.redirect({
    protocol: 'HTTPS',
    port: '443',
    permanent: true,
  }),
});
```

---

### Step 4: Point Domain to ALB

**Get ALB DNS Name:**

```bash
aws elbv2 describe-load-balancers \
  --names launch-platform-alb \
  --query 'LoadBalancers[0].[DNSName,CanonicalHostedZoneId]' \
  --output table

# Output:
# |  launch-platform-alb-123456.us-east-1.elb.amazonaws.com  |  Z35SXDOTRQ7X7K  |
```

**Create Route 53 Alias Record (CDK):**

```typescript
// Create A record pointing to ALB
new route53.ARecord(this, 'AliasRecord', {
  zone: hostedZone,
  recordName: 'launch',  // launch.yourdomain.com
  target: route53.RecordTarget.fromAlias(
    new route53Targets.LoadBalancerTarget(alb)
  ),
});
```

**Or Manual DNS (any provider):**

```
Type: CNAME
Name: launch
Value: launch-platform-alb-123456.us-east-1.elb.amazonaws.com
TTL: 300
```

---

### Step 5: Verify HTTPS

```bash
# Test HTTPS connection
curl -v https://launch.yourdomain.com/health

# Verify certificate
openssl s_client -connect launch.yourdomain.com:443 -servername launch.yourdomain.com

# Check certificate expiration
echo | openssl s_client -connect launch.yourdomain.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

**Expected Output:**
```
* SSL connection using TLSv1.3 / TLS_AES_128_GCM_SHA256
* Server certificate:
*  subject: CN=launch.yourdomain.com
*  issuer: C=US; O=Amazon; CN=Amazon RSA 2048 M02
*  SSL certificate verify ok.
```

---

### Certificate Auto-Renewal

**ACM automatically renews certificates:**
- Renewal starts 60 days before expiration
- AWS validates domain ownership via DNS/email
- New certificate deployed with zero downtime
- No manual intervention required

**Monitor expiration (optional):**

```typescript
// CloudWatch alarm for certificate expiration
new cloudwatch.Alarm(this, 'CertificateExpiryAlarm', {
  metric: new cloudwatch.Metric({
    namespace: 'AWS/CertificateManager',
    metricName: 'DaysToExpiry',
    dimensionsMap: {
      CertificateArn: certificate.certificateArn,
    },
  }),
  threshold: 30,  // Alert 30 days before expiry
  evaluationPeriods: 1,
  comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
});
```

---

### What Your Application Does NOT Do

```typescript
// ❌ WRONG - Don't do this in application code:
import https from 'https';
import fs from 'fs';

const server = https.createServer({
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
}, app);

// ✅ CORRECT - Just HTTP, ALB handles HTTPS:
import http from 'http';

const server = http.createServer(app);
server.listen(5013);  // HTTP only, behind ALB
```

**Application Code Requirements:**
- ✅ Listen on HTTP (port 5013)
- ✅ Respond to health checks (`GET /health`)
- ✅ Trust `X-Forwarded-Proto` header (to detect original HTTPS)
- ✅ Trust `X-Forwarded-For` header (to get real client IP)

**Trust Proxy Headers:**

```typescript
// server/index.ts
app.set('trust proxy', true);  // Trust ALB headers

// Now req.protocol will be 'https' (from X-Forwarded-Proto)
// And req.ip will be real client IP (from X-Forwarded-For)
```

---

## Component Details

### Application Load Balancer (ALB)

**Purpose:** Entry point for all HTTP/HTTPS traffic, SSL termination

**Configuration:**
- **Listens on:** Port 443 (HTTPS) with ACM certificate
- **Routes to:** ECS Fargate tasks on port 5013 (HTTP)
- **Health check:** `GET /health` endpoint
- **Timeout:** 60 seconds (for long-running generation requests)
- **Stickiness:** Session-based for WebSocket connections

**Why ALB not the application handles SSL:**
- ✅ AWS manages certificate renewal (auto-renews before expiration)
- ✅ Better performance (SSL offloading)
- ✅ No private keys in application code
- ✅ Simpler application (just HTTP)
- ✅ Standard AWS best practice

### ECS Fargate - launch-platform

**Purpose:** Run the combined frontend + backend application

**Container Configuration:**
- **Image:** Built from `Dockerfile` in application root
- **CPU:** 1 vCPU (1024 units)
- **Memory:** 2 GB
- **Port:** 5013 (HTTP only - behind ALB)
- **Environment:** Injected from AWS Secrets Manager

**Environment Variables (from Secrets Manager):**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from secrets manager>
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<from secrets manager>
DATABASE_URL=<from Supabase>
CLAUDE_API_KEY=<from secrets manager>
ECS_CLUSTER=launch-poc
TASK_SUBNETS=<from CDK outputs>
TASK_SECURITY_GROUP=<from CDK outputs>
S3_BUCKET=<from CDK outputs>
```

**Why single container:**
- Frontend and backend already share code structure
- Simpler deployment (one image, one task definition)
- No inter-service networking needed
- Reduced cost (one Fargate task vs. two)

### ECS Fargate - app-generator

**Purpose:** Dynamically spawned tasks for generating user apps

**Container Configuration:**
- **Image:** App generator Docker image
- **CPU:** 2 vCPU (2048 units)
- **Memory:** 4 GB (LLM operations are memory-intensive)
- **Lifecycle:** Spawned on-demand, terminates when generation completes
- **Concurrency:** Multiple tasks can run in parallel

**How tasks are spawned:**
```typescript
// Backend spawns ECS tasks via AWS SDK
const params = {
  cluster: process.env.ECS_CLUSTER,
  taskDefinition: 'app-generator',
  launchType: 'FARGATE',
  networkConfiguration: {
    awsvpcConfiguration: {
      subnets: process.env.TASK_SUBNETS.split(','),
      securityGroups: [process.env.TASK_SECURITY_GROUP],
      assignPublicIp: 'ENABLED'
    }
  }
};

await ecs.runTask(params).promise();
```

### AWS Certificate Manager (ACM)

**Purpose:** Free SSL/TLS certificates with auto-renewal

**Setup:**
```bash
# Request certificate (one-time)
aws acm request-certificate \
  --domain-name launch.yourdomain.com \
  --validation-method DNS

# Validate via Route 53 (automated if using Route 53)
# Certificate auto-renews before expiration
```

**Why ACM:**
- ✅ Free SSL certificates
- ✅ Automatic renewal (no expiration downtime)
- ✅ Integrated with ALB
- ✅ Wildcard certificate support (*.yourdomain.com)

### AWS Secrets Manager

**Purpose:** Secure storage for sensitive credentials

**Secrets stored:**
- `launch-platform/supabase-url`
- `launch-platform/supabase-service-role-key`
- `launch-platform/supabase-anon-key`
- `launch-platform/claude-api-key`
- `launch-platform/database-url`

**Access pattern:**
```typescript
// Secrets injected as environment variables at container start
// No SDK calls needed - AWS handles injection
const supabaseUrl = process.env.SUPABASE_URL;
```

### S3 Bucket

**Purpose:** Store generated applications with pre-signed URLs

**Configuration:**
- **Lifecycle:** Auto-delete after 7 days (optional)
- **Versioning:** Disabled
- **Public access:** Blocked (pre-signed URLs only)
- **Encryption:** AES-256 (at rest)

**Access pattern:**
```typescript
// Generate pre-signed download URL (expires in 1 hour)
const s3 = new AWS.S3();
const url = await s3.getSignedUrlPromise('getObject', {
  Bucket: process.env.S3_BUCKET,
  Key: `generations/${requestId}/app.tar.gz`,
  Expires: 3600
});
```

---

## Infrastructure as Code (CDK)

### Why CDK not Manual AWS CLI

**CDK Benefits:**
- ✅ Repeatable: `cdk deploy` creates entire stack identically every time
- ✅ Version controlled: Infrastructure changes tracked in git
- ✅ Type-safe: TypeScript catches errors before deployment
- ✅ Automatic dependency management: CDK handles resource creation order
- ✅ Rollback on failure: CloudFormation auto-rollbacks failed deployments
- ✅ Easy cleanup: `cdk destroy` removes all resources
- ✅ Reusable: Create multiple environments (dev, staging, prod) from same code

### CDK Stack Location

Infrastructure code: `/home/jake/apps/app-factory/apps/launch-platform/app/infrastructure/`

**Key files:**
- `/home/jake/apps/app-factory/apps/launch-platform/app/infrastructure/lib/fargate-poc-stack.ts` - Main CDK stack definition
- `/home/jake/apps/app-factory/apps/launch-platform/app/infrastructure/bin/fargate-poc.ts` - CDK app entry point
- `/home/jake/apps/app-factory/apps/launch-platform/app/infrastructure/cdk.json` - CDK configuration

### Deployment Commands

```bash
# Navigate to infrastructure directory
cd /home/jake/apps/app-factory/apps/launch-platform/app/infrastructure

# Install dependencies (first time only)
npm install

# Bootstrap CDK in AWS account (first time only)
cdk bootstrap aws://ACCOUNT-ID/REGION

# Review changes before deploying
cdk diff

# Deploy stack
cdk deploy

# Destroy entire stack
cdk destroy
```

### What CDK Creates

The stack automatically provisions:
- ✅ VPC with public subnets
- ✅ Application Load Balancer
- ✅ ECS Fargate cluster
- ✅ Task definitions (launch-platform, app-generator)
- ✅ ECS service (launch-platform)
- ✅ ECR repositories (Docker image storage)
- ✅ S3 bucket (generated apps)
- ✅ IAM roles and policies
- ✅ Security groups
- ✅ CloudWatch log groups
- ✅ Secrets Manager placeholders

**Total resources created:** ~30 AWS resources from one `cdk deploy`

---

## Deployment Workflow

### Step 1: Configure Secrets

```bash
# One-time secret creation
aws secretsmanager create-secret \
  --name launch-platform/supabase-url \
  --secret-string "https://your-project.supabase.co"

aws secretsmanager create-secret \
  --name launch-platform/supabase-service-role-key \
  --secret-string "your-service-role-key"

aws secretsmanager create-secret \
  --name launch-platform/supabase-anon-key \
  --secret-string "your-anon-key"

aws secretsmanager create-secret \
  --name launch-platform/claude-api-key \
  --secret-string "sk-ant-..."

# Secrets are injected into containers automatically
```

### Step 2: Deploy Infrastructure

```bash
cd /home/jake/apps/app-factory/apps/launch-platform/app/infrastructure
cdk deploy

# Outputs:
# - ALBDnsName: xxx.us-east-1.elb.amazonaws.com
# - ECRRepository: xxx.dkr.ecr.us-east-1.amazonaws.com/launch-platform
# - ECSCluster: launch-poc
# - S3Bucket: launch-platform-apps-xxx
```

### Step 3: Build and Push Docker Image

```bash
# Build production image
docker build -t launch-platform .

# Tag for ECR
docker tag launch-platform:latest <ECR_URI>/launch-platform:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ECR_URI>

# Push image
docker push <ECR_URI>/launch-platform:latest
```

### Step 4: Deploy Application

```bash
# ECS automatically pulls latest image and deploys
# If service already exists:
aws ecs update-service \
  --cluster launch-poc \
  --service launch-platform \
  --force-new-deployment

# Wait for deployment to complete (2-5 minutes)
aws ecs wait services-stable \
  --cluster launch-poc \
  --services launch-platform
```

### Step 5: Configure Custom Domain (Optional)

```bash
# 1. Request ACM certificate
aws acm request-certificate \
  --domain-name launch.yourdomain.com \
  --validation-method DNS

# 2. Create Route 53 record pointing to ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "launch.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<ALB-ZONE-ID>",
          "DNSName": "<ALB-DNS-NAME>",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'

# 3. Update ALB listener to use ACM certificate (via CDK or console)
```

---

## Application Code Requirements

### What the Application Should NOT Do

❌ **Handle SSL/TLS:** ALB handles this
❌ **Load certificates:** No cert files in code
❌ **Listen on port 443:** Use port 5013 (HTTP)
❌ **Manage secrets:** Use environment variables (from Secrets Manager)

### What the Application SHOULD Do

✅ **Listen on HTTP port 5013:** ALB forwards traffic here
✅ **Respond to health checks:** `GET /health` returns 200 OK
✅ **Read secrets from environment variables:** Already injected by AWS
✅ **Trust ALB headers:** `X-Forwarded-Proto`, `X-Forwarded-For`

### Example Server Configuration

```typescript
// server/index.ts
import express from 'express';
import { createServer } from 'http';  // HTTP only, not HTTPS

const app = express();
const PORT = process.env.PORT || 5013;

// Health check endpoint (required for ALB)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Create HTTP server (ALB handles HTTPS)
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('🔒 HTTPS handled by AWS Application Load Balancer');
});
```

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build frontend (includes Vite build)
RUN npm run build

# Expose HTTP port (ALB handles HTTPS)
EXPOSE 5013

# Start server
CMD ["node", "server/index.js"]
```

---

## Local Development

### Development Server (No Docker)

```bash
# Standard development workflow
npm install
npm run dev

# Runs on http://localhost:5173 (Vite)
# Backend on http://localhost:5013 (Express)
```

**Local development uses:**
- Mock authentication (no Supabase credentials needed)
- Memory storage (no database needed)
- Local Docker for app-generator (docker-compose)
- HTTP only (no SSL needed locally)

### Testing Production Build Locally

```bash
# Build Docker image
docker build -t launch-platform:local .

# Run with environment variables
docker run -p 5013:5013 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  launch-platform:local

# Access at http://localhost:5013
```

---

## Monitoring and Operations

### CloudWatch Logs

All container logs go to CloudWatch:

```bash
# View launch-platform logs
aws logs tail /ecs/launch-platform --follow

# View app-generator logs
aws logs tail /ecs/app-generator --follow

# Filter for errors
aws logs filter-log-events \
  --log-group-name /ecs/launch-platform \
  --filter-pattern ERROR
```

### Health Checks

ALB performs health checks every 30 seconds:

```bash
# Check ALB target health
aws elbv2 describe-target-health \
  --target-group-arn <TARGET-GROUP-ARN>
```

**Healthy:** Target responds 200 OK to `GET /health`
**Unhealthy:** Target fails 3 consecutive health checks → ALB stops routing traffic → ECS restarts task

### Metrics

Key CloudWatch metrics (auto-configured):
- **Target Response Time:** Request latency
- **Healthy Host Count:** Number of healthy tasks
- **Request Count:** Total requests
- **HTTP 5xx Errors:** Backend errors
- **ECS CPU/Memory:** Task resource usage

---

## Cost Estimate

**Monthly cost for POC/low-traffic deployment:**

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| ALB | Always-on | $16 |
| ECS Fargate (launch-platform) | 1 task, 1 vCPU, 2 GB | $15 |
| ECS Fargate (app-generator) | 50 generations @ 15 min each | $25 |
| CloudWatch Logs | 5 GB/month | $5 |
| S3 Storage | 10 GB with 7-day lifecycle | $3 |
| **Total** | | **~$64/month** |

**Cost optimizations:**
- Use Fargate Spot for app-generator tasks (70% discount)
- Configure S3 lifecycle rules (auto-delete after 7 days)
- Use CloudWatch log retention (delete after 30 days)
- Scale down to 0 tasks during off-hours (if acceptable)

---

## Security Checklist

- ✅ **HTTPS only:** ALB listener on port 443 with ACM certificate
- ✅ **No public container access:** Containers in private subnets, ALB in public
- ✅ **Secrets in Secrets Manager:** Never in code or environment files
- ✅ **IAM roles:** Least-privilege permissions for each service
- ✅ **Security groups:** Restrictive rules (ALB → containers only)
- ✅ **Supabase RLS:** Row-level security enabled on database
- ✅ **S3 private:** Pre-signed URLs only, no public access
- ✅ **CloudWatch logs:** All requests logged for auditing

---

## Troubleshooting

### Container won't start

```bash
# Check task status
aws ecs describe-tasks --cluster launch-poc --tasks <TASK-ARN>

# Check container logs
aws logs tail /ecs/launch-platform --follow

# Common issues:
# - Missing secrets: Check Secrets Manager
# - Wrong environment variables: Check task definition
# - Image pull errors: Verify ECR permissions
```

### ALB returns 502 Bad Gateway

```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn <ARN>

# Common causes:
# - Container not listening on port 5013
# - Health check endpoint not responding 200 OK
# - Container crashed (check logs)
```

### Deployment fails

```bash
# Check CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name LaunchPlatformStack \
  --max-items 20

# Common issues:
# - Resource limit exceeded: Request quota increase
# - IAM permissions: Check CDK execution role
# - Resource name conflicts: Destroy old stack first
```

---

## References

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Application Load Balancer Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [AWS Certificate Manager](https://docs.aws.amazon.com/acm/)

---

**This document is the authoritative reference for AWS deployment. All other deployment documentation should defer to this file.**
