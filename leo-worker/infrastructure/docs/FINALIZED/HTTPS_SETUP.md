# HTTPS Setup Guide

## Prerequisites
- A domain name (e.g., `app-gen-saas.com`)
- AWS Route 53 hosting the domain (or ability to add DNS records)

## Step 1: Request ACM Certificate

### Option A: Using AWS Console
1. Go to AWS Certificate Manager (ACM) in `us-east-1` region
2. Click "Request certificate"
3. Choose "Request a public certificate"
4. Add domain names:
   - `app-gen-saas.com`
   - `*.app-gen-saas.com` (for subdomains)
5. Choose DNS validation
6. Add the CNAME records to Route 53 (click "Create records in Route 53")
7. Wait for validation (usually 5-10 minutes)

### Option B: Using AWS CLI
```bash
# Request certificate
aws acm request-certificate \
  --domain-name app-gen-saas.com \
  --subject-alternative-names "*.app-gen-saas.com" \
  --validation-method DNS \
  --profile jake-dev \
  --region us-east-1

# Note the CertificateArn from output
# Then add the validation CNAME to Route 53 (shown in console)
```

## Step 2: Get Certificate ARN

After validation completes, get your certificate ARN:

```bash
aws acm list-certificates \
  --profile jake-dev \
  --region us-east-1 \
  --query 'CertificateSummaryList[?DomainName==`app-gen-saas.com`].CertificateArn' \
  --output text
```

Example output: `arn:aws:acm:us-east-1:123456789012:certificate/abcd1234-...`

## Step 3: Deploy CDK Stack with HTTPS

```bash
cd /home/jake/WORK/APP_GEN_SAAS/app-gen-infra

# Deploy with certificate ARN
npx cdk deploy \
  --profile jake-dev \
  --context certificateArn=arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID
```

This will:
- ✅ Enable HTTPS listener on port 443
- ✅ Redirect all HTTP (port 80) traffic to HTTPS
- ✅ Use AWS-managed certificate (auto-renewal)
- ✅ TLS termination at the ALB (best practice)

## Step 4: Point Domain to ALB

Get your ALB DNS name:
```bash
aws cloudformation describe-stacks \
  --stack-name FargatePocStack \
  --profile jake-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ALBDnsName`].OutputValue' \
  --output text
```

### Option A: Route 53 Alias Record (Recommended)
1. Go to Route 53 console
2. Select your hosted zone
3. Create A record:
   - Name: `app-gen-saas.com` (or subdomain like `app`)
   - Type: A record
   - Alias: Yes
   - Target: Your ALB (appears in dropdown)

### Option B: CNAME Record
Create CNAME record pointing `app.app-gen-saas.com` to your ALB DNS name.

## Step 5: Update Frontend Configuration

Update your frontend to use the new domain:

**For local development:**
```bash
# .env.local
VITE_API_URL=https://app-gen-saas.com
```

**For production (Vite config):**
The frontend will automatically use relative URLs in production, so no change needed if frontend is served from same domain.

## Architecture Overview

```
User Browser
    ↓ (HTTPS)
Application Load Balancer (ALB)
    ↓ (TLS Termination)
    ↓ (HTTP - internal AWS network)
ECS Fargate Tasks (Port 5013)
```

## Security Features

✅ **TLS 1.2/1.3 only** (AWS managed)
✅ **Auto certificate renewal** (ACM handles it)
✅ **HTTP → HTTPS redirect** (automatic)
✅ **Perfect Forward Secrecy** (AWS default)
✅ **Strong cipher suites** (AWS managed)

## Cost

- ACM Certificate: **FREE** (when used with AWS services)
- ALB: Already deployed (~$16-20/month)
- Route 53 Hosted Zone: ~$0.50/month
- Domain: ~$12/year (varies)

## Verify HTTPS is Working

```bash
# Test HTTPS endpoint
curl -I https://app-gen-saas.com

# Verify HTTP redirects to HTTPS
curl -I http://app-gen-saas.com
# Should see: HTTP/1.1 301 Moved Permanently
```

## Troubleshooting

### Certificate validation stuck
- Check Route 53 has the CNAME records
- Validation can take up to 30 minutes (usually 5-10)

### 502 Bad Gateway
- Check ECS tasks are healthy
- Verify security group allows ALB → ECS on port 5013
- Check health check endpoint: `/health`

### Certificate not found
- Ensure certificate is in the same region as ALB
- Verify certificate status is "Issued"

## Persistent Configuration

To avoid passing context every time, add to `cdk.json`:

```json
{
  "context": {
    "certificateArn": "arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID"
  }
}
```

Then deploy without context flag:
```bash
npx cdk deploy --profile jake-dev
```
