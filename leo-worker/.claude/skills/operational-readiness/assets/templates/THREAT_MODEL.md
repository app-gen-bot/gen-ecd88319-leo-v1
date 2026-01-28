# Threat Model

## Overview

This document provides a STRIDE-based threat analysis of the application.

| Field | Value |
|-------|-------|
| **App Name** | [TODO: App name] |
| **Version** | [TODO: Version] |
| **Date** | [TODO: Date] |
| **Risk Tier** | [low/med/high] |

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Internet                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Fly.io Edge (HTTPS)                        │
│                    - SSL/TLS termination                      │
│                    - DDoS protection                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Application Container                      │
│  ┌─────────────────┐        ┌─────────────────────────────┐  │
│  │  React Frontend │◄──────►│     Express Backend         │  │
│  │  (Static files) │        │  - API routes               │  │
│  │  - Vite build   │        │  - Auth middleware          │  │
│  │  - SPA routing  │        │  - Rate limiting            │  │
│  └─────────────────┘        └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Supabase (External)                        │
│  ┌─────────────────┐        ┌─────────────────────────────┐  │
│  │  PostgreSQL DB  │        │     Supabase Auth           │  │
│  │  - RLS enabled  │        │  - JWT tokens               │  │
│  │  - Drizzle ORM  │        │  - Session management       │  │
│  └─────────────────┘        └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Trust Boundaries

1. **Internet ↔ Fly.io Edge**: Untrusted → Semi-trusted
2. **Fly.io Edge ↔ Container**: Semi-trusted → Trusted
3. **Container ↔ Supabase**: Trusted → Trusted (via connection pooler)

## STRIDE Analysis

### S - Spoofing

| Threat | Description | Mitigation | Status |
|--------|-------------|------------|--------|
| Credential theft | Attacker steals user credentials | Supabase Auth with secure password policies | [Mitigated/Partial/Open] |
| Session hijacking | Attacker steals session token | HTTPS only, httpOnly cookies, token expiry | [Mitigated/Partial/Open] |
| API key exposure | Backend API keys exposed in client | Keys stored in env vars, not client code | [Mitigated/Partial/Open] |

### T - Tampering

| Threat | Description | Mitigation | Status |
|--------|-------------|------------|--------|
| Request tampering | Attacker modifies API requests | Input validation with Zod schemas | [Mitigated/Partial/Open] |
| Database tampering | Direct database modification | RLS policies, no direct DB access from client | [Mitigated/Partial/Open] |
| Code injection | XSS attacks via user input | React auto-escaping, no dangerouslySetInnerHTML | [Mitigated/Partial/Open] |

### R - Repudiation

| Threat | Description | Mitigation | Status |
|--------|-------------|------------|--------|
| Denied actions | User denies performing action | Audit logging for sensitive operations | [Mitigated/Partial/Open] |
| Missing audit trail | No record of changes | Database timestamps, user tracking | [Mitigated/Partial/Open] |

### I - Information Disclosure

| Threat | Description | Mitigation | Status |
|--------|-------------|------------|--------|
| Error leakage | Stack traces in production | Error handling returns generic messages | [Mitigated/Partial/Open] |
| Data exposure | Unauthorized data access | RLS policies, authMiddleware on routes | [Mitigated/Partial/Open] |
| Sensitive data in logs | PII logged accidentally | Log sanitization, no sensitive data logged | [Mitigated/Partial/Open] |

### D - Denial of Service

| Threat | Description | Mitigation | Status |
|--------|-------------|------------|--------|
| Resource exhaustion | API flooded with requests | Rate limiting on sensitive endpoints | [Mitigated/Partial/Open] |
| Large payload | Oversized requests crash server | Request size limits, validation | [Mitigated/Partial/Open] |
| Slow loris | Connection exhaustion | Fly.io edge protection, timeouts | [Mitigated/Partial/Open] |

### E - Elevation of Privilege

| Threat | Description | Mitigation | Status |
|--------|-------------|------------|--------|
| Privilege escalation | User accesses admin functions | Role-based access control, authMiddleware | [Mitigated/Partial/Open] |
| Broken access control | Access other users' data | RLS policies, ownership checks in queries | [Mitigated/Partial/Open] |
| JWT manipulation | Forged or modified tokens | Supabase handles JWT validation | [Mitigated/Partial/Open] |

## Data Flow Analysis

### User Authentication Flow

```
User                    Frontend                Backend                 Supabase
  │                        │                       │                       │
  │──── Login request ────►│                       │                       │
  │                        │──── POST /api/auth ──►│                       │
  │                        │                       │──── signInWithPassword ──►│
  │                        │                       │◄──── JWT token ───────│
  │                        │◄──── Set cookie ─────│                       │
  │◄──── Redirect ────────│                       │                       │
```

### Data Access Flow

```
User                    Frontend                Backend                 Supabase
  │                        │                       │                       │
  │──── Request data ─────►│                       │                       │
  │                        │──── GET /api/items ──►│                       │
  │                        │                       │──── authMiddleware ───│
  │                        │                       │──── Drizzle query ────►│
  │                        │                       │◄──── Filtered by RLS ─│
  │                        │◄──── JSON response ──│                       │
  │◄──── Render data ─────│                       │                       │
```

## Attack Scenarios

### Scenario 1: Unauthenticated API Access

**Attack**: Attacker tries to access protected endpoints without authentication

**Test**:
```bash
curl -X GET https://app.fly.dev/api/items
# Expected: 401 Unauthorized
```

**Mitigation**: authMiddleware on all protected routes

---

### Scenario 2: SQL Injection

**Attack**: Attacker submits malicious input to manipulate database queries

**Test**:
```bash
curl -X POST https://app.fly.dev/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "test'; DROP TABLE items; --"}'
# Expected: 400 Bad Request (validation error)
```

**Mitigation**: Drizzle ORM parameterized queries, Zod input validation

---

### Scenario 3: Cross-Site Scripting (XSS)

**Attack**: Attacker injects script into user-generated content

**Test**: Submit content with `<script>alert('xss')</script>`

**Mitigation**: React auto-escaping, Content Security Policy headers

---

## Recommendations

### Immediate

1. [TODO: List critical security improvements]

### Short-term

1. [TODO: List important security improvements]

### Long-term

1. [TODO: List security enhancements for roadmap]

---

*This document is part of the Release Assurance Evidence Pack. See EVIDENCE_MANIFEST.json for integrity verification.*
