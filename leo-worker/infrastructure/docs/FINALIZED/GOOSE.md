# GOOSE.md - Critical Reminders for AI Agents

## Config Validation and Fast Fail

**CRITICAL**: The generator container has a config validator (`/home/jake/WORK/APP_GEN_SAAS/V1/gen/src/config_validator.py`) that:

1. **Runs FIRST on container startup** (before anything else)
2. **Logs obfuscated values** of all environment variables (ANTHROPIC_API_KEY shows last 4 chars)
3. **Fails fast** (exits with code 1) if any required vars are missing
4. **Prints to stdout** so it appears in CloudWatch logs

**When debugging API key issues:**
- FIRST check the generator logs for config validation output
- Look for: "✅ Configuration validation PASSED" or "❌ Configuration validation FAILED"
- The obfuscated ANTHROPIC_API_KEY value will show if it was set or not
- Example: `ANTHROPIC_API_KEY: ****xyz123` means it was set
- If you see "Missing required environment variables" - the task definition is wrong

## Secret Loading Architecture (CRITICAL - DO NOT CHANGE)

**Design Pattern:** Both orchestrator and generator load secrets from AWS Secrets Manager at runtime via SDK.

**Orchestrator (SAAS app):**
- ✅ Loads secrets from AWS Secrets Manager at startup via SDK (`server/config/aws-config.ts`)
- ✅ Fast-fail validation with obfuscated logging
- ✅ Sets `process.env.CLAUDE_CODE_OAUTH_TOKEN` for internal use

**Generator (MUST DO THE SAME):**
- ❌ Currently expects `ANTHROPIC_API_KEY` as environment variable (WRONG)
- ✅ MUST load from Secrets Manager at startup via SDK (like orchestrator does)
- ✅ MUST have fast-fail validation with obfuscated logging
- ✅ Secret name: `app-gen-saas/claude-oauth-token` (same secret, different env var name)

**WHY:**
1. Commit 9754494 removed ECS secret injection by design
2. Enables identical config loading across EC2, Docker, and Fargate
3. IAM permissions already grant runtime access to secrets
4. DO NOT pass secrets from orchestrator to generator (security + doesn't work with dynamic tasks)
5. DO NOT use ECS container secret injection (removed intentionally)

**Required Environment Variables (Generator - passed from orchestrator):**
- `WS_URL` - WebSocket URL for orchestrator connection
- `S3_BUCKET` - S3 bucket for generated apps
- `GENERATION_ID` - Generation request ID
- `PROMPT` - User prompt for app generation
- `AWS_REGION` - AWS region for SDK calls

**Required Secrets (Generator - loaded from Secrets Manager at runtime):**
- `ANTHROPIC_API_KEY` - From secret: `app-gen-saas/claude-oauth-token`

## Deployment Script - ALWAYS USE THIS

**CRITICAL**: For code-only changes (no infrastructure changes), ALWAYS use the deployment script:

```bash
cd /home/jake/WORK/APP_GEN_SAAS/V1/saas
./scripts/deploy-all.sh
```

**What it does (6 automated steps):**
1. Pre-deployment status (current task, ECR images, git commits)
2. Build & push SAAS container to ECR
3. Build & push Generator container to ECR
4. Force ECS deployment (via `aws ecs update-service --force-new-deployment`)
5. Monitor deployment progress (waits up to 150s)
6. Post-deployment verification (confirms new images are running)

**Options:**
- `--skip-generator` - Only deploy orchestrator (SAAS) changes
- `--skip-saas` - Only deploy generator changes
- `--dry-run` - Show what would be deployed without deploying

**Speed:** ~2-3 minutes total (vs CDK deploy: 5-10 minutes)

**When to use CDK deploy instead:**
- Infrastructure changes (VPC, ALB, security groups, IAM roles)
- Task definition configuration changes (memory, CPU, environment variables)
- First-time stack creation

**When to use deploy-all.sh (most common):**
- Code changes in orchestrator or generator
- Bug fixes, feature additions, OAuth token fixes, etc.
- Any change that only requires new Docker images

## Log Discovery

Use the scripts in `/home/jake/WORK/APP_GEN_SAAS/V1/infra/scripts/` to find and read logs:
- `get-recent-logs.sh` - Finds all log groups and shows recent entries
- `check-deployment-status.sh` - Shows comprehensive deployment status

**Log Group Names:**
- Orchestrator: `AppGenSaasStack-AppGenSaasTaskDefappgensaasappLogGroupE2B575F8-*`
- Generator: `AppGenSaasStack-AppGeneratorTaskDefappgeneratorLogGroupADBA3535-*`

The suffix changes with CDK deployments, so always use the script to find current names.

## Chrome MCP Server Console Tool (CRITICAL - ALWAYS USE FOR DEBUGGING)

**MANDATORY**: When debugging web applications with Chrome MCP server, ALWAYS check the browser console using `mcp__chrome-devtools__list_console_messages`.

**Why**: The console contains REAL-TIME lifecycle information that CloudWatch logs miss:
- WebSocket message payloads (complete JSON objects)
- Client-side errors and warnings
- React component lifecycle events
- API client authentication flow
- Generation status updates

**Example - What you miss by only checking CloudWatch:**
```
CloudWatch: "Agent started, generation complete"
Console:    "[WebSocket Client] Received new log: {timestamp: '...', line: 'Invalid API key'}"
            "[WebSocket Client] Received message: {type: 'completed', ...}"
            "AppGeneratorAgent: ✅ AppGeneratorAgent complete. Turns: 1/1000, Cost: $0.0000"
```

**When to use:**
1. Testing generation requests (see actual WebSocket messages)
2. Debugging API key issues (see real error messages from agent)
3. Investigating WebSocket connection problems (see connection lifecycle)
4. Understanding frontend state updates (see React Query cache updates)

**Pattern:**
```bash
# 1. Submit request via Chrome MCP
mcp__chrome-devtools__click(uid="submit_button")

# 2. Wait for processing
sleep 30

# 3. Check console for lifecycle info
mcp__chrome-devtools__list_console_messages(pageSize=100, pageIdx=1)
mcp__chrome-devtools__list_console_messages(pageSize=100, pageIdx=2)
```

## FoF (Failed on Fargate)

**FoF Definition**: Code that works locally (native or Docker) but fails when deployed to ECS Fargate.

**The Compounding Cost Problem:**
1. Test locally (native Python) - works ✅
2. Test locally (Docker) - works ✅
3. Deploy to Fargate - FAILS ❌
4. Debug via CloudWatch logs (slow feedback loop)
5. Make fix, rebuild container, push to ECR, redeploy (10+ minutes)
6. Check logs again - still fails
7. Repeat 5-6 times = **1 hour wasted**

**Root Causes of FoF:**
- Environment variable differences (works with `.env` locally, missing in ECS)
- Secret injection method differences (env vars vs Secrets Manager)
- IAM permission issues (local uses your AWS profile, ECS uses task role)
- Network/filesystem differences (Docker volumes vs EFS vs ephemeral storage)
- Timing issues (works on fast local machine, times out in constrained ECS task)

**How to Prevent FoF:**

1. **Identical config loading everywhere**: Use AWS SDK to load secrets at runtime
   - Works locally (uses `~/.aws` credentials)
   - Works in Docker (mount `~/.aws` volume)
   - Works in Fargate (uses task IAM role)
   - Same code path = no surprises

2. **Test in Docker FIRST before Fargate**:
   - Local Docker is closer to Fargate than native Python
   - Catches environment issues early (fast feedback)
   - Still has your AWS credentials for Secrets Manager access

3. **Fast-fail validation**:
   - Config validator runs FIRST on startup
   - Logs obfuscated values (proves secrets loaded)
   - Exits immediately if misconfigured (don't waste 10 minutes generating)

4. **Deterministic testing workflow**:
   ```bash
   # 1. Test locally in Docker (2 min feedback loop)
   docker-compose up

   # 2. If works in Docker, will work in Fargate
   # (both use same secret loading, IAM, environment)
   ./scripts/deploy-all.sh
   ```

**Why SDK-based secrets loading prevents FoF:**
- Eliminates env var injection differences (no ECS secrets vs .env confusion)
- Same IAM-based access pattern locally and in Fargate
- Config validator catches permission issues in 5 seconds (not 10 minutes)
