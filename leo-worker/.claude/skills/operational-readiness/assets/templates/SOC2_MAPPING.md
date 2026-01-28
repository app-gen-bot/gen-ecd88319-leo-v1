# SOC2 Control Mapping

## Overview

This document maps application security controls to SOC2 Trust Service Criteria.

| Field | Value |
|-------|-------|
| **App Name** | [TODO: App name] |
| **Version** | [TODO: Version] |
| **Date** | [TODO: Date] |
| **Audit Period** | [TODO: Period] |

## Trust Service Criteria Coverage

| Category | Controls Mapped | Coverage |
|----------|-----------------|----------|
| Security (CC) | [N]/[Total] | [%] |
| Availability (A) | [N]/[Total] | [%] |
| Processing Integrity (PI) | [N]/[Total] | [%] |
| Confidentiality (C) | [N]/[Total] | [%] |
| Privacy (P) | [N]/[Total] | [%] |

## Security (Common Criteria)

### CC1 - Control Environment

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC1.1 | COSO Principle 1: Integrity and ethical values | Code of conduct, security policies | [TODO: Link to policy] |
| CC1.2 | COSO Principle 2: Board oversight | Security governance structure | [TODO: Link to org chart] |

### CC2 - Communication and Information

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC2.1 | Information for internal control | Logging and monitoring enabled | Application logs in Fly.io |
| CC2.2 | Internal communication | Incident response procedures | RUNBOOK.md |
| CC2.3 | External communication | Security contact, disclosure policy | [TODO: Link] |

### CC3 - Risk Assessment

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC3.1 | Risk identification | STRIDE threat model | THREAT_MODEL.md |
| CC3.2 | Risk analysis | Risk tiering and prioritization | RISK_TIERING.md |
| CC3.3 | Fraud risk | Authentication controls | Supabase Auth, authMiddleware |

### CC4 - Monitoring Activities

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC4.1 | Ongoing monitoring | Health checks, log monitoring | Fly.io dashboards |
| CC4.2 | Deficiency evaluation | Error tracking and alerting | [TODO: Alerting config] |

### CC5 - Control Activities

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC5.1 | Control selection | Security controls based on risk | This document |
| CC5.2 | Technology controls | See CC6 (Logical Access) | See below |
| CC5.3 | Policies and procedures | Documented in runbook | RUNBOOK.md |

### CC6 - Logical and Physical Access Controls

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC6.1 | Logical access security | Supabase Auth, JWT tokens | Auth implementation |
| CC6.2 | Access provisioning | User registration flow | /api/auth/signup |
| CC6.3 | Access modification | User management | Admin functionality |
| CC6.4 | Access removal | Session logout, token expiry | /api/auth/logout |
| CC6.6 | Access restrictions | RLS policies, authMiddleware | SUPABASE_RLS.md |
| CC6.7 | Transmission security | HTTPS/TLS encryption | Fly.io TLS termination |
| CC6.8 | Malicious software prevention | Input validation, XSS prevention | Zod schemas, React escaping |

### CC7 - System Operations

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC7.1 | Vulnerability detection | Dependency scanning | npm audit, [TODO: SAST] |
| CC7.2 | Infrastructure monitoring | Fly.io metrics and logs | Fly.io dashboard |
| CC7.3 | Change management | Git version control | GitHub repository |
| CC7.4 | Incident response | Documented procedures | RUNBOOK.md |
| CC7.5 | Incident recovery | Rollback procedures | FLYIO_ROLLBACK.md |

### CC8 - Change Management

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC8.1 | Change authorization | PR review process | GitHub PRs |

### CC9 - Risk Mitigation

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| CC9.1 | Vendor management | Supabase, Fly.io compliance | Vendor SOC2 reports |
| CC9.2 | Vendor risk assessment | Platform security review | [TODO: Link] |

## Availability (A)

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| A1.1 | Availability objectives | SLA/uptime targets | [TODO: SLA document] |
| A1.2 | System capacity | Fly.io auto-scaling | fly.toml config |
| A1.3 | Recovery procedures | Documented recovery | RUNBOOK.md, BACKUP_RESTORE.md |

## Processing Integrity (PI)

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| PI1.1 | Data accuracy | Input validation | Zod schemas |
| PI1.2 | Processing completeness | Transaction handling | Database transactions |
| PI1.3 | Error handling | Try/catch, error responses | Error handling in routes |

## Confidentiality (C)

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| C1.1 | Data classification | PII identification | [TODO: Data inventory] |
| C1.2 | Confidential data protection | RLS, encryption | SUPABASE_RLS.md |

## Privacy (P)

| Control | Criteria | Implementation | Evidence |
|---------|----------|----------------|----------|
| P1.0 | Privacy notice | Privacy policy | [TODO: Link] |
| P2.0 | Choice and consent | Consent mechanisms | [TODO: Implementation] |
| P3.0 | Collection | Minimal data collection | Schema design |
| P4.0 | Use and retention | Data retention policy | [TODO: Policy] |
| P5.0 | Access | User data access | User profile endpoints |
| P6.0 | Disclosure | Third-party sharing policy | [TODO: Policy] |
| P7.0 | Quality | Data accuracy controls | Input validation |
| P8.0 | Security for privacy | See CC6 controls | See above |

## Gaps and Remediation

| Control | Gap Description | Remediation Plan | Timeline |
|---------|-----------------|------------------|----------|
| [TODO] | [Gap description] | [How to fix] | [When] |

## Evidence Repository

| Document | Location | Last Updated |
|----------|----------|--------------|
| EXECUTIVE_SUMMARY.md | release-assurance/v1.0.0/ | [Date] |
| THREAT_MODEL.md | release-assurance/v1.0.0/ | [Date] |
| RUNBOOK.md | release-assurance/v1.0.0/ | [Date] |
| SUPABASE_RLS.md | release-assurance/v1.0.0/ | [Date] |
| BACKUP_RESTORE.md | release-assurance/v1.0.0/ | [Date] |

---

*This document is part of the Release Assurance Evidence Pack. See EVIDENCE_MANIFEST.json for integrity verification.*
