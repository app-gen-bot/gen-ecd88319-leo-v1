# Local vs AWS Environment Design

**Last Updated:** 2025-10-21
**Philosophy:** "Local and AWS must use SAME approach (no separate logic that could introduce AWS bugs)"

## Environment Variable Strategy

### Build-Time vs Runtime

**Build-Time Variables** (VITE_*)
- Set during `docker build` as `--build-arg`
- Baked into JavaScript bundle by Vite
- Cannot be changed at container runtime
- Used ONLY by frontend code

**Runtime Variables**
- Set as container environment variables (in .env or ECS task definition)
- Used by backend (Express server)
- Can be different for each deployment

## Frontend Configuration (VITE_*)

### Local Development (npm run dev)
```bash
VITE_SUPABASE_URL=https://flhrcbbdmgflzgicgeua.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_API_URL=http://localhost:5013  # Vite dev server proxies /api to backend
```

### Docker/AWS Production
```bash
# Set as build args during docker build:
VITE_SUPABASE_URL=https://flhrcbbdmgflzgicgeua.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_API_URL=""  # Empty string = relative URLs (frontend and backend same origin)
```

**Why empty string in production?**
- Frontend is served from Express server at `http://alb-dns-name`
- Backend APIs are at `http://alb-dns-name/api/*`
- Same origin = relative URLs work perfectly
- No CORS issues
- Same behavior in local Docker container

## Backend Configuration

### Secrets (from .env or AWS Secrets Manager)
```bash
SUPABASE_URL=https://flhrcbbdmgflzgicgeua.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
CLAUDE_CODE_OAUTH_TOKEN=secret-token
```

### Non-Secrets (from .env.defaults or ECS environment)
```bash
NODE_ENV=production
PORT=5013
AUTH_MODE=supabase
STORAGE_MODE=database
AWS_REGION=us-east-1
ECS_CLUSTER=app-gen-saas-cluster
S3_BUCKET=app-gen-saas-generated-apps-ACCOUNT_ID
```

## Docker Build Process

### Build Command
```bash
docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  --build-arg VITE_API_URL="" \
  -t app-gen-saas:TAG \
  .
```

### Image Tagging Strategy
- **Specific Tag:** Git commit hash (e.g., `abc1234`) or timestamp
- **Latest Tag:** Always pushed alongside specific tag
- CDK references `latest`, but we can trace back via git hash

## Local Testing (Same as AWS)

### Run Locally Built Docker Image
```bash
# Build with production settings (same as AWS)
./scripts/build-and-push.sh

# Run locally
docker run -p 5013:5013 \
  -e SUPABASE_URL="$SUPABASE_URL" \
  -e SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  -e DATABASE_URL="$DATABASE_URL" \
  app-gen-saas:latest

# Access at http://localhost:5013
# Frontend makes API calls to /api/* (relative, same as AWS)
```

### Benefits
- Exact same Docker image runs locally and on AWS
- No environment-specific code paths
- Bugs found locally will exist in AWS (and vice versa)
- "Work out bugs locally, then deploy to AWS without inducing new bugs"

## AWS Deployment

### CDK Stack
- References ECR image with `latest` tag
- Sets runtime environment variables for backend
- Does NOT set VITE_ variables (they're already in the image)

### ECS Task Definition
```typescript
secrets: {
  SUPABASE_URL: ecs.Secret.fromSecretsManager(supabaseUrlSecret),
  SUPABASE_ANON_KEY: ecs.Secret.fromSecretsManager(supabaseAnonKeySecret),
  DATABASE_URL: ecs.Secret.fromSecretsManager(databaseUrlSecret),
},
environment: {
  NODE_ENV: 'production',
  PORT: '5013',
  AUTH_MODE: 'supabase',
  STORAGE_MODE: 'database',
  AWS_REGION: this.region,
  ECS_CLUSTER: cluster.clusterName,
  S3_BUCKET: appBucket.bucketName,
}
```

## Key Differences (Intentional)

| Aspect | Local (npm run dev) | Local (Docker) | AWS (ECS) |
|--------|---------------------|----------------|-----------|
| **Frontend Build** | Vite dev server (HMR) | Production build | Production build (same image) |
| **VITE_API_URL** | `http://localhost:5013` | `""` (relative) | `""` (relative) |
| **Backend Secrets** | From `.env` file | From `.env` or env vars | From AWS Secrets Manager |
| **Storage** | Local filesystem | Local filesystem or S3 | S3 |
| **Task Execution** | Docker (local) | Docker (local) | ECS Fargate |

## Troubleshooting

### Frontend can't reach backend
- **Local dev**: Check Vite proxy in `vite.config.ts`
- **Docker/AWS**: Frontend uses relative URLs - check container logs for port binding

### Different behavior in AWS vs Local Docker
- This should NOT happen! If it does:
  1. Verify same Docker image used (check image digest)
  2. Compare environment variables
  3. Check AWS Secrets Manager values match local .env

### Build args not applied
- VITE_ variables are build-time only
- Must rebuild image if changing VITE_ values
- Can't change via ECS task definition environment variables

## Related Files

- `/home/jake/WORK/APP_GEN_SAAS/app-gen-saas/Dockerfile` - Multi-stage build with VITE_ args
- `/home/jake/WORK/APP_GEN_SAAS/app-gen-saas/.env.defaults` - Non-secret configuration
- `/home/jake/WORK/APP_GEN_SAAS/app-gen-saas/scripts/build-and-push.sh` - Image build script
- `/home/jake/WORK/APP_GEN_SAAS/app-gen-infra/lib/fargate-poc-stack.ts` - ECS configuration
