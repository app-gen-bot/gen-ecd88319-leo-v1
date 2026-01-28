# Security Waivers

## Overview

This document records security controls that are NOT implemented, along with justification and compensating controls.

| Field | Value |
|-------|-------|
| **App Name** | [TODO: App name] |
| **Version** | [TODO: Version] |
| **Date** | [TODO: Date] |
| **Risk Tier** | [low/med/high] |

## Waiver Policy

### Valid Waiver Reasons

Waivers are acceptable ONLY for:
- **Scope limitations**: Feature intentionally excluded from MVP
- **Technical constraints**: Platform limitation that cannot be resolved
- **Cost/benefit**: Control cost exceeds risk for this tier
- **Timeline**: Documented remediation plan with deadline

### Invalid Waiver Reasons

Waivers are NOT acceptable for:
- "Not enough time" (fix it)
- "Too complex" (simplify or defer launch)
- "Didn't know about this" (educate and fix)
- Any critical or high-severity vulnerability

## Active Waivers

### Waiver 1: [TODO: Title]

| Field | Value |
|-------|-------|
| **ID** | W-001 |
| **Control** | [Control that is not implemented] |
| **Severity** | [Low/Medium/High] |
| **Status** | Active |

**Description**:
[What security control is missing or incomplete]

**Justification**:
[Why this cannot be fixed now]

**Risk Assessment**:
[What is the actual risk of not having this control]

**Compensating Controls**:
[What other controls reduce the risk]

**Remediation Plan**:
| Milestone | Date | Owner |
|-----------|------|-------|
| [Action 1] | [Date] | [Name] |
| [Action 2] | [Date] | [Name] |
| Complete | [Date] | [Name] |

**Approval**:
| Role | Name | Date |
|------|------|------|
| Risk Owner | | |
| Security Review | | |
| Executive Sponsor | | |

---

### Waiver 2: [TODO: Title]

| Field | Value |
|-------|-------|
| **ID** | W-002 |
| **Control** | [Control that is not implemented] |
| **Severity** | [Low/Medium/High] |
| **Status** | Active |

**Description**:
[What security control is missing or incomplete]

**Justification**:
[Why this cannot be fixed now]

**Risk Assessment**:
[What is the actual risk of not having this control]

**Compensating Controls**:
[What other controls reduce the risk]

**Remediation Plan**:
| Milestone | Date | Owner |
|-----------|------|-------|
| [Action 1] | [Date] | [Name] |

---

## Closed Waivers

| ID | Control | Closed Date | Resolution |
|----|---------|-------------|------------|
| [ID] | [Control] | [Date] | [How it was resolved] |

## Common Prototype Waivers

These waivers are typical for **low tier (prototype)** apps:

### WAI-PROTO-001: No Multi-Factor Authentication

**Standard Text**:
> MFA is not implemented for this prototype. Authentication is handled by Supabase with email/password only. For production deployment, MFA should be enabled via Supabase Auth settings.

**Compensating Controls**:
- Strong password requirements enforced
- Session timeout configured
- Rate limiting on auth endpoints

---

### WAI-PROTO-002: No IP Allowlisting

**Standard Text**:
> IP-based access restrictions are not implemented. The application is accessible from any IP address. For internal tools, consider implementing IP allowlisting via Fly.io or a WAF.

**Compensating Controls**:
- Authentication required for all endpoints
- Rate limiting enabled
- Fly.io DDoS protection

---

### WAI-PROTO-003: Limited Audit Logging

**Standard Text**:
> Comprehensive audit logging is not implemented. Basic application logs are available via Fly.io. For production, implement detailed audit trails for sensitive operations.

**Compensating Controls**:
- Application error logging enabled
- Database timestamps on all records
- User ID tracked on mutations

---

### WAI-PROTO-004: No Encryption at Rest Configuration

**Standard Text**:
> Application-level encryption at rest is not configured. Supabase provides default PostgreSQL encryption. For high-sensitivity data, implement column-level encryption.

**Compensating Controls**:
- Supabase default encryption
- TLS for data in transit
- RLS policies for access control

## Waiver Register Summary

| Total Active | Low Severity | Medium Severity | High Severity |
|--------------|--------------|-----------------|---------------|
| [N] | [N] | [N] | [N] |

**Note**: High severity waivers require executive approval and should not exceed 30 days.

---

*This document is part of the Release Assurance Evidence Pack. See EVIDENCE_MANIFEST.json for integrity verification.*
