# AWS Infrastructure Deployment (AI Guide)

**Last Updated:** 2025-10-19
**For:** Deploying the launch-platform application on AWS ECS Fargate
**Status:** MANDATORY - This is THE deployment pattern

---

## Pattern: ECS Fargate + ALB + ACM

**RULE:** Use AWS ECS Fargate for compute, ALB for HTTPS termination, ACM for certificates.

**DO NOT use:** Lambda, EC2, EKS, Elastic Beanstalk, or any other compute service.

---

## Deployment Decision Tree

```
Is this MVP/POC with < 100 users?
├── YES → Use Combined Deployment (see mvp-steps.md)
└── NO  → Use Separated Deployment (see scale-steps.md)
```

**Scale Trigger:** Migrate when ANY of these conditions are met:
- > 100 concurrent users
- > 500 WebSocket connections
- Multi-region users requiring CDN

**DO NOT** migrate before scale trigger. Unnecessary complexity and cost.

---

## Fixed Infrastructure Components

**These are THE components. Do not substitute.**

| Component | AWS Service | Purpose | DO NOT Use |
|-----------|-------------|---------|------------|
| Compute | ECS Fargate | Container runtime | ❌ Lambda, EC2, EKS |
| Load Balancer | ALB | HTTPS termination | ❌ NLB, CloudFront origin |
| Certificates | ACM | Free SSL/TLS | ❌ Let's Encrypt, self-signed |
| Secrets | Secrets Manager | Credentials storage | ❌ Parameter Store, .env files |
| Storage | S3 | Generated apps | ✅ Required |
| Infrastructure | AWS CDK | IaC (TypeScript) | ❌ Terraform, CloudFormation YAML |
| DNS | Route 53 | Domain management | ✅ Any DNS provider OK |

---

## CDK Stack Requirements

**File:** `/home/jake/apps/app-factory/apps/launch-platform/app/infrastructure/lib/fargate-poc-stack.ts`

### Complete Stack Definition

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class LaunchPlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      natGateways: 0,  // Public subnets only for POC
    });

    // 2. ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: 'launch-platform',
    });

    // 3. ECR Repository
    const repository = new ecr.Repository(this, 'Repository', {
      repositoryName: 'launch-platform',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // 4. Route 53 Hosted Zone (if you manage DNS with Route 53)
    // If using external DNS, skip this and use manual DNS validation
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'yourdomain.com',
    });

    // 5. ACM Certificate (DNS validated)
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: 'launch.yourdomain.com',
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // 6. Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
    });

    // 7. HTTPS Listener (port 443)
    const httpsListener = alb.addListener('HttpsListener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [certificate],
    });

    // 8. HTTP → HTTPS Redirect Listener (port 80)
    alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    // 9. Reference secrets (must be created manually first)
    const supabaseUrlSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SupabaseUrlSecret',
      'launch-platform/supabase-url'
    );
    const supabaseServiceRoleSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SupabaseServiceRoleSecret',
      'launch-platform/supabase-service-role-key'
    );
    const supabaseAnonSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SupabaseAnonSecret',
      'launch-platform/supabase-anon-key'
    );
    const claudeApiSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'ClaudeApiSecret',
      'launch-platform/claude-api-key'
    );

    // 10. Task Definition
    const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 2048,  // 2GB RAM
      cpu: 1024,              // 1 vCPU
    });

    // 11. Container with secrets injection
    taskDef.addContainer('launch-platform', {
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      portMappings: [{ containerPort: 5013 }],  // HTTP port
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'launch-platform',
      }),
      secrets: {
        SUPABASE_URL: ecs.Secret.fromSecretsManager(supabaseUrlSecret),
        SUPABASE_SERVICE_ROLE_KEY: ecs.Secret.fromSecretsManager(supabaseServiceRoleSecret),
        SUPABASE_ANON_KEY: ecs.Secret.fromSecretsManager(supabaseAnonSecret),
        CLAUDE_API_KEY: ecs.Secret.fromSecretsManager(claudeApiSecret),
      },
      environment: {
        NODE_ENV: 'production',
        PORT: '5013',
      },
    });

    // 12. ECS Service
    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
    });

    // 13. Target Group
    httpsListener.addTargets('Target', {
      port: 5013,  // Container HTTP port
      protocol: elbv2.ApplicationProtocol.HTTP,  // Internal HTTP
      targets: [service],
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(30),
      },
    });

    // 14. S3 Bucket
    const bucket = new s3.Bucket(this, 'AppsBucket', {
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(7),  // Auto-delete after 7 days
        },
      ],
    });

    // 15. Route 53 A Record (optional, if using Route 53)
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: 'launch',
      target: route53.RecordTarget.fromAlias(
        new route53Targets.LoadBalancerTarget(alb)
      ),
    });

    // Outputs
    new cdk.CfnOutput(this, 'ALBDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'ALB DNS name',
    });
    new cdk.CfnOutput(this, 'ECRRepositoryUri', {
      value: repository.repositoryUri,
      description: 'ECR repository URI',
    });
    new cdk.CfnOutput(this, 'S3BucketName', {
      value: bucket.bucketName,
      description: 'S3 bucket for generated apps',
    });
  }
}
```

**Verification Checklist:**
- ✅ VPC with public subnets
- ✅ ECS Cluster (Fargate)
- ✅ ECR Repository
- ✅ ACM Certificate (DNS validated)
- ✅ ALB with HTTPS listener (port 443)
- ✅ HTTP→HTTPS redirect (port 80)
- ✅ Task definition (2GB RAM, 1 vCPU)
- ✅ Container listens on port 5013 (HTTP)
- ✅ Target group routes to port 5013 (HTTP)
- ✅ Health check on `/health`
- ✅ S3 bucket for generated apps
- ✅ Secrets Manager integration
- ✅ Route 53 A record (if applicable)

---

## HTTPS Setup: ACM Certificate + ALB

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

### Option 1: DNS Validation with Route 53 (Recommended)

If you manage DNS with Route 53, CDK handles validation automatically:

```typescript
const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
  domainName: 'yourdomain.com',
});

const certificate = new acm.Certificate(this, 'Certificate', {
  domainName: 'launch.yourdomain.com',
  validation: acm.CertificateValidation.fromDns(hostedZone),
});
// AWS creates DNS validation record automatically
```

---

### Option 2: DNS Validation with External DNS Provider

If using external DNS (Cloudflare, Namecheap, etc.):

**Step 1: Request certificate via AWS CLI**

```bash
aws acm request-certificate \
  --domain-name launch.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Output: Certificate ARN
```

**Step 2: Get validation CNAME record**

```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord'

# Output:
# {
#   "Name": "_abc123.launch.yourdomain.com",
#   "Type": "CNAME",
#   "Value": "_xyz456.acm-validations.aws."
# }
```

**Step 3: Add CNAME record to your DNS provider**

```
Type: CNAME
Name: _abc123.launch.yourdomain.com
Value: _xyz456.acm-validations.aws.
TTL: 300
```

**Step 4: Wait for validation (5-30 minutes)**

```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID \
  --query 'Certificate.Status'

# Output: "ISSUED"
```

**Step 5: Import certificate in CDK**

```typescript
const certificate = acm.Certificate.fromCertificateArn(
  this,
  'Certificate',
  'arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID'
);
```

---

### Option 3: Email Validation (Not Recommended)

```bash
aws acm request-certificate \
  --domain-name launch.yourdomain.com \
  --validation-method EMAIL \
  --region us-east-1

# AWS sends validation email to:
# - admin@yourdomain.com
# - administrator@yourdomain.com
# - hostmaster@yourdomain.com
# - postmaster@yourdomain.com
# - webmaster@yourdomain.com
```

Click validation link in email, then import certificate ARN in CDK.

---

### Certificate Auto-Renewal

**ACM automatically renews certificates:**
- Renewal starts 60 days before expiration
- AWS re-validates domain ownership via DNS/email
- New certificate deployed with zero downtime
- No manual intervention required

---

## Environment Variables (from Secrets Manager)

**DO NOT commit secrets to .env files.**

### Step 1: Create Secrets (One-Time)

```bash
# Create secrets before deploying CDK stack
aws secretsmanager create-secret \
  --name launch-platform/supabase-url \
  --secret-string "https://your-project.supabase.co"

aws secretsmanager create-secret \
  --name launch-platform/supabase-service-role-key \
  --secret-string "eyJhbGc..."

aws secretsmanager create-secret \
  --name launch-platform/supabase-anon-key \
  --secret-string "eyJhbGc..."

aws secretsmanager create-secret \
  --name launch-platform/claude-api-key \
  --secret-string "sk-ant-..."
```

### Step 2: CDK Injects Secrets into Container

Secrets are automatically injected as environment variables at container start:

```typescript
secrets: {
  SUPABASE_URL: ecs.Secret.fromSecretsManager(supabaseUrlSecret),
  SUPABASE_SERVICE_ROLE_KEY: ecs.Secret.fromSecretsManager(supabaseServiceRoleSecret),
  SUPABASE_ANON_KEY: ecs.Secret.fromSecretsManager(supabaseAnonSecret),
  CLAUDE_API_KEY: ecs.Secret.fromSecretsManager(claudeApiSecret),
}
```

**REJECT if:**
- ❌ Secrets in .env file committed to repo
- ❌ Secrets hardcoded in CDK code
- ❌ Using Parameter Store instead of Secrets Manager

---

## Deployment Workflow

### Prerequisites

1. AWS CLI installed and configured
2. AWS account with appropriate permissions
3. Domain name (for ACM certificate)
4. Node.js 18+ and npm

---

### Step 1: Bootstrap CDK (First Time Only)

```bash
cd /home/jake/apps/app-factory/apps/launch-platform/app/infrastructure
npm install

# Bootstrap CDK in your AWS account
cdk bootstrap aws://ACCOUNT-ID/us-east-1
```

---

### Step 2: Create Secrets

```bash
# Run the secret creation commands from above
aws secretsmanager create-secret --name launch-platform/supabase-url ...
aws secretsmanager create-secret --name launch-platform/supabase-service-role-key ...
aws secretsmanager create-secret --name launch-platform/supabase-anon-key ...
aws secretsmanager create-secret --name launch-platform/claude-api-key ...
```

---

### Step 3: Deploy Infrastructure

```bash
cd /home/jake/apps/app-factory/apps/launch-platform/app/infrastructure

# Review changes
cdk diff

# Deploy stack
cdk deploy

# Outputs:
# - ALBDnsName: xxx.us-east-1.elb.amazonaws.com
# - ECRRepositoryUri: xxx.dkr.ecr.us-east-1.amazonaws.com/launch-platform
# - S3BucketName: launch-platform-apps-xxx
```

---

### Step 4: Build and Push Docker Image

```bash
# Get ECR URI from CDK output
ECR_URI="xxx.dkr.ecr.us-east-1.amazonaws.com/launch-platform"

# Build production image
docker build -t launch-platform .

# Tag for ECR
docker tag launch-platform:latest ${ECR_URI}:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ${ECR_URI}

# Push image
docker push ${ECR_URI}:latest
```

---

### Step 5: Deploy Application

```bash
# ECS automatically pulls latest image and deploys
aws ecs update-service \
  --cluster launch-platform \
  --service launch-platform \
  --force-new-deployment

# Wait for deployment to complete (2-5 minutes)
aws ecs wait services-stable \
  --cluster launch-platform \
  --services launch-platform
```

---

### Step 6: Configure DNS

**If using Route 53:** Already configured by CDK (A record created automatically)

**If using external DNS provider:**

Get ALB DNS name from CDK output, then create CNAME record:

```
Type: CNAME
Name: launch
Value: launch-platform-alb-123456.us-east-1.elb.amazonaws.com
TTL: 300
```

---

### Step 7: Verify Deployment

```bash
# Test HTTPS connection
curl -v https://launch.yourdomain.com/health

# Expected: {"status":"healthy"}
```

---

## Updating the Application

### Code Changes

```bash
# 1. Build new image
docker build -t launch-platform .

# 2. Tag and push
docker tag launch-platform:latest ${ECR_URI}:latest
docker push ${ECR_URI}:latest

# 3. Force new deployment
aws ecs update-service \
  --cluster launch-platform \
  --service launch-platform \
  --force-new-deployment
```

### Infrastructure Changes

```bash
cd /home/jake/apps/app-factory/apps/launch-platform/app/infrastructure

# Review changes
cdk diff

# Deploy changes
cdk deploy
```

---

## Troubleshooting

### Certificate Validation Stuck

**DNS Validation:**
```bash
# Check DNS record is correct
dig _abc123.launch.yourdomain.com CNAME

# Check certificate status
aws acm describe-certificate --certificate-arn ARN
```

**Email Validation:**
- Check spam folder for validation email
- Ensure email addresses (admin@, webmaster@) are accessible

---

### Container Won't Start

```bash
# Check task status
aws ecs describe-tasks --cluster launch-platform --tasks TASK-ARN

# Check container logs
aws logs tail /ecs/launch-platform --follow

# Common issues:
# - Missing secrets: Check Secrets Manager
# - Wrong environment variables: Check task definition
# - Image pull errors: Verify ECR permissions
```

---

### ALB Returns 502 Bad Gateway

```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn ARN

# Common causes:
# - Container not listening on port 5013
# - Health check endpoint not responding 200 OK
# - Container crashed (check logs)
```

---

### Deployment Fails

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

## Cost Estimate

**Monthly cost for POC/low-traffic deployment:**

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| ALB | Always-on | $16 |
| ECS Fargate | 1 task, 1 vCPU, 2 GB | $15 |
| CloudWatch Logs | 5 GB/month | $5 |
| S3 Storage | 10 GB with 7-day lifecycle | $3 |
| ACM | Certificate | $0 (free) |
| **Total** | | **~$39/month** |

**Cost optimizations:**
- Configure S3 lifecycle rules (auto-delete after 7 days)
- Use CloudWatch log retention (delete after 30 days)
- Scale down to 0 tasks during off-hours (if acceptable)

---

## Cleanup

To remove all resources:

```bash
cd infrastructure
cdk destroy

# Also delete secrets if no longer needed
aws secretsmanager delete-secret --secret-id launch-platform/supabase-url --force-delete-without-recovery
```

---

## References

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Application Load Balancer Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [AWS Certificate Manager](https://docs.aws.amazon.com/acm/)

---

**This is THE ONLY acceptable AWS deployment pattern. Do not deviate.**
