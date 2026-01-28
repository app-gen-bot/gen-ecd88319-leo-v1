# MVP Deployment Steps (Combined Pattern)

**When to use:** MVP/POC with < 100 concurrent users

**Pattern:** Frontend + Backend in single ECS Fargate task

---

## Step 1: Configure Secrets

```bash
aws secretsmanager create-secret --name launch-platform/supabase-url --secret-string "https://project.supabase.co"
aws secretsmanager create-secret --name launch-platform/supabase-service-role-key --secret-string "YOUR_KEY"
aws secretsmanager create-secret --name launch-platform/supabase-anon-key --secret-string "YOUR_ANON_KEY"
aws secretsmanager create-secret --name launch-platform/claude-api-key --secret-string "sk-ant-..."
```

## Step 2: Deploy CDK Stack

```bash
cd infrastructure
npm install
cdk bootstrap  # First time only
cdk deploy
```

## Step 3: Build and Push Docker Image

```bash
docker build -t launch-platform .
docker tag launch-platform:latest <ECR_URI>/launch-platform:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ECR_URI>
docker push <ECR_URI>/launch-platform:latest
```

## Step 4: Update ECS Service

```bash
aws ecs update-service --cluster launch-platform --service launch-platform --force-new-deployment
```

## Step 5: Verify Deployment

```bash
curl https://launch.yourdomain.com/health
```

**Expected:** `{"status":"healthy"}`
