# Application Code Implementation (AI Guide)

**Pattern:** HTTP server behind AWS ALB (Application Load Balancer)

---

## Critical Rule

**Application runs HTTP only. ALB handles HTTPS.**

---

## Required Server Configuration (`server/index.ts`)

```typescript
import express from 'express';
import { createServer } from 'http';  // NOT https

const app = express();
const PORT = process.env.PORT || 5013;

// REQUIRED: Trust ALB proxy headers
app.set('trust proxy', true);

// REQUIRED: Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const server = createServer(app);
server.listen(PORT);
```

**Must have:**
- ✅ `http.createServer()` (not https)
- ✅ Port 5013
- ✅ `app.set('trust proxy', true)`
- ✅ `/health` endpoint returning 200 OK

---

## REJECT These Patterns

- ❌ `import https from 'https'`
- ❌ Reading certificate files (.pem, .crt, .key)
- ❌ Listening on port 443 or 8443
- ❌ Any SSL/TLS configuration

**Why:** ALB handles HTTPS. Application stays simple.

---

## Environment Variables

Read from `process.env` (injected by AWS):
```typescript
const supabaseUrl = process.env.SUPABASE_URL;
const claudeKey = process.env.CLAUDE_API_KEY;
```

Never commit secrets to .env files.
