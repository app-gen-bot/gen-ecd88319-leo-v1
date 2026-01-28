# MCP-Jumio Suite: Identity Verification MCP Servers

You are building the "MCP‑Jumio suite": a set of Model Context Protocol (MCP) servers that make Jumio's KYX Identity Verification flows instantly usable from any MCP‑compatible client (Claude Desktop, OpenAI Apps SDK, VS Code agents, etc.).

## AUTHORITATIVE SOURCES

Use these for endpoints, payloads, and behavior; mirror examples without copying PII:

- **OAuth2 & regional endpoints:**
  - amer-1: `https://auth.amer-1.jumio.ai/oauth2/token`
  - emea-1: `https://auth.emea-1.jumio.ai/oauth2/token`
  - apac-1: `https://auth.apac-1.jumio.ai/oauth2/token`
  - Reference: Jumio docs "Quickstart: Authentication"

- **Account + workflow creation/update:** "Authentication Quickstart" and "API Endpoints" (Account, Credentials, Retrieval, Status)
- **Credential uploads + finalization:** "API Endpoints" → Credentials API (upload parts) + finalization, including PREPARED_DATA
- **Retrieval API:** "Workflow Retrieval API" for workflow results/artifacts
- **Callbacks:** "Callback / Callbacks (KYX)" — callbacks carry status/metadata; fetch details via Retrieval
- **Web SDK:** @jumio/websdk on npm
- **MCP SDK:** Use TypeScript or Python official SDK

## WHAT TO DELIVER (Monorepo Structure)

### servers/jumio-core
Tools:
- `get_oauth_token`
- `create_or_update_account`
- `finalize_workflow`

### servers/jumio-credentials
Tools:
- `upload_id_image`
- `upload_selfie`
- `upload_prepared_data`

### servers/jumio-retrieval
Tools:
- `get_workflow_execution`
- `get_artifact`
- `get_status`

### servers/jumio-webhooks
Tool:
- `start_webhook_server` - opens HTTP listener for callbacks, emits normalized events; on receipt call Retrieval

### servers/jumio-frontend
Resource:
- `web_client_embed_snippet` - returns HTML <iframe> using account response's web.href

### servers/jumio-admin
Tools:
- `validate_env`
- `set_region`
- `healthcheck`

## TOOL CONTRACTS (JSON Schemas)

### get_oauth_token
**Input:**
```json
{
  "region": "amer-1" | "emea-1" | "apac-1"
}
```
**Output:**
```json
{
  "access_token": "string",
  "expires_at": "ISO8601"
}
```

### create_or_update_account
**Input:**
```json
{
  "region": "string",
  "account_id": "string (optional)",
  "customerInternalReference": "string",
  "workflowDefinition": {
    "key": "number"
  },
  "overrides": "object (optional)"
}
```
**Output:**
```json
{
  "account": "object",
  "workflowExecution": "object",
  "web": "object",
  "sdk": "object"
}
```

### upload_id_image
**Input:**
```json
{
  "part_url": "string",
  "file_path": "string (optional)",
  "bytes_b64": "string (optional)",
  "side": "front" | "back"
}
```
**Output:**
```json
{
  "ok": true,
  "part": "front" | "back"
}
```

### upload_selfie
**Input:**
```json
{
  "part_url": "string",
  "file_path": "string (optional)",
  "bytes_b64": "string (optional)"
}
```
**Output:**
```json
{
  "ok": true,
  "part": "face"
}
```

### upload_prepared_data
**Input:**
```json
{
  "part_url": "string",
  "payload": "object"
}
```
**Output:**
```json
{
  "ok": true,
  "part": "prepared_data"
}
```

### finalize_workflow
**Input:**
```json
{
  "region": "string",
  "account_id": "string",
  "workflow_execution_id": "string"
}
```
**Output:**
```json
{
  "ok": true
}
```

### get_workflow_execution
**Input:**
```json
{
  "region": "string",
  "workflow_execution_id": "string"
}
```
**Output:**
```json
{
  "status": "string",
  "decision": {
    "type": "string",
    "risk": {
      "score": "number (optional)"
    }
  },
  "artifacts": [
    {
      "type": "string",
      "url": "string"
    }
  ],
  "raw": "object"
}
```

### get_artifact
**Input:**
```json
{
  "url": "string",
  "redact": "boolean (optional)"
}
```
**Output:**
```json
{
  "content_type": "string",
  "bytes_b64": "string"
}
```

### get_status
**Input:**
```json
{}
```
**Output:**
```json
{
  "status": "string",
  "timestamp": "ISO8601"
}
```

### start_webhook_server
**Input:**
```json
{
  "public_url": "string",
  "secret": "string (optional)",
  "allowlist": ["string (optional)"]
}
```
**Output:**
```json
{
  "listening": true,
  "path": "/jumio/callback"
}
```

### web_client_embed_snippet (Resource)
Returns HTML using the URL from account response (web.href)

## RUNTIME & SDK

- **Preferred:** TypeScript + official MCP TypeScript SDK
- **Secondary:** Python server using Python SDK (if time allows)
- **Transport:** stdio for local use, HTTP(S)/Streamable for remote
- **Docker:** Provide Dockerfiles for both TypeScript and Python implementations
- **HTTP Client:** Robust retries with exponential backoff; structured logging; never log PII

## SECURITY & PRIVACY

### OAuth Token Management
- Cache tokens until expiry (60 min)
- Reuse tokens as per docs
- Rotate on 401 responses

### Privacy Controls
- No PII in logs
- Redact artifacts by default unless caller sets `redact=false`

### Region Configuration
- Allow env-based region selection: `JUMIO_REGION=amer-1|emea-1|apac-1`
- Derive base URLs accordingly

### Environment Variables
Provide `.env.sample` with:
- `JUMIO_CLIENT_ID`
- `JUMIO_CLIENT_SECRET`
- `JUMIO_ACCOUNT_ID`
- `JUMIO_REGION`
- `WEBHOOK_PUBLIC_URL`

## END-TO-END FLOWS

### 1. SDK/Web Flow
1. Call `create_or_update_account`
2. Return `web.href` (for browser) or `sdk.token`
3. Server exposes resource that returns iframe snippet for embedding

### 2. API-Only Flow
1. Call `create_or_update_account`
2. Upload images/selfie or PREPARED_DATA to part URLs
3. Call `finalize_workflow` (if required)
4. Poll Retrieval until PROCESSED
5. Return decision + risk

### 3. Webhook Flow
1. Call `start_webhook_server`
2. On callback, normalize event `{workflow_execution_id, status}`
3. Call Retrieval for details
4. Ensure idempotency & replay protection

## TESTS

### Test Coverage
- Unit tests per tool
- Integration tests hitting Jumio sandbox/mock service
- Region matrix tests for amer-1/emea-1/apac-1
- Contract tests asserting inputs/outputs match JSON schemas

## DX & DISTRIBUTION

### Documentation
- README with quickstart
- `examples/` directory with end-to-end demos (CLI + minimal web)

### Discovery
- MCP metadata for discovery
- Registry manifest for GitHub MCP Registry

### CI/CD
- Lint, test, build pipeline
- Container image publish
- SBOM generation

## CITATION-LOCKED BEHAVIOR (Do Not Invent Endpoints)

- **Token:** POST `/oauth2/token` with `grant_type=client_credentials` (per regional hosts)
- **Account update/create:** Returns `web.href` and `sdk.token`; `credentials[].api.parts` contain upload URLs and JWTs
- **Retrieval:** Returns decision + risk + artifacts
- **Callbacks:** Deliver status/metadata only
- **Status endpoint:** Passthrough for health

## OUTPUT REQUIREMENTS

Deliver a working monorepo with:
- All servers as specified above
- Zip/tarball artifact
- Root README with "how to run" instructions

**IMPORTANT:** Make sure to use the research agent to figure out the detailed plan and also use subagents liberally.
