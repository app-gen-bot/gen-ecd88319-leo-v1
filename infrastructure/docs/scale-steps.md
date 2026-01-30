# Scale Deployment Steps (Separated Pattern)

**When to use:** > 100 concurrent users, > 500 WebSocket connections, or multi-region

**Pattern:** Frontend (CloudFront + S3) + Backend (ECS Fargate)

---

## Step 1: Deploy Frontend to S3 + CloudFront

```bash
# Build with API URL
VITE_API_URL=https://api.yourdomain.com npm run build

# Upload to S3
aws s3 sync dist/ s3://launch-platform-frontend/

# Create CloudFront distribution (via CDK)
# See infrastructure/lib/cloudfront-stack.ts
```

## Step 2: Update Backend - Remove Static Serving

```typescript
// server/index.ts
// REMOVE these lines:
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(...));  // DELETE
  app.get('*', ...);              // DELETE
}

// KEEP only API routes
```

## Step 3: Update CORS for CloudFront

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,  // CloudFront URL
  credentials: true
}));
```

## Step 4: Deploy Backend

```bash
docker build -t launch-platform-api .
docker push <ECR_URI>/launch-platform-api:latest
aws ecs update-service --cluster launch-platform --service api --force-new-deployment
```

## Step 5: Configure Auto-Scaling

```typescript
// CDK: Add auto-scaling to API service
const scalableTarget = service.autoScaleTaskCount({
  minCapacity: 1,
  maxCapacity: 10
});

scalableTarget.scaleOnCpuUtilization('CpuScaling', {
  targetUtilizationPercent: 70
});
```

## Step 6: Verify

```bash
# Frontend
curl https://launch.yourdomain.com

# API
curl https://api.yourdomain.com/health
```
