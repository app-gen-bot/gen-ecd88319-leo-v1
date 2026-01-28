# Risk Tiering Guide

## Overview

Risk tiering determines the depth of security controls and evidence required. Higher tiers require more comprehensive documentation and stricter security measures.

## Tier Definitions

### Low Tier (Prototype/MVP)

**Use Cases:**
- Internal prototypes and demos
- Hackathon projects
- Personal side projects
- Tools with no sensitive data

**Data Classification:**
- No PII or sensitive data
- Public information only
- No financial data

**User Base:**
- Internal team only
- Single organization
- Less than 100 users

**Security Requirements:**
- Basic authentication
- HTTPS enabled
- Input validation on user-facing forms
- Error handling (no stack traces in production)

**Required Evidence:**
- EXECUTIVE_SUMMARY.md (1 page)
- THREAT_MODEL.md (basic, top 3 threats)
- SUPABASE_RLS.md (basic policies)
- BACKUP_RESTORE.md (basic procedure)
- FLYIO_ROLLBACK.md (rollback command)
- WAIVER.md (acceptable for non-critical gaps)

---

### Medium Tier (Internal App)

**Use Cases:**
- Internal tools with user data
- Customer-facing beta products
- B2B applications
- Data processing pipelines

**Data Classification:**
- Contains PII (names, emails)
- Internal business data
- No payment/financial data

**User Base:**
- Multiple organizations
- 100 - 10,000 users
- External users with accounts

**Security Requirements:**
- All Low tier requirements, plus:
- Role-based access control (RBAC)
- Rate limiting on all endpoints
- Audit logging for sensitive actions
- Session management (timeout, revocation)
- Secure password policies

**Required Evidence:**
- All Low tier documents, plus:
- RUNBOOK.md (incident response)
- THREAT_MODEL.md (full STRIDE analysis)
- SOC2_MAPPING.md (optional but recommended)

**WAIVER Restrictions:**
- Must justify each waiver with timeline for remediation
- No waivers for authentication bypasses
- No waivers for unencrypted PII

---

### High Tier (Production SaaS)

**Use Cases:**
- Production SaaS products
- Healthcare applications (HIPAA)
- Financial applications
- Government systems
- Any system processing payments

**Data Classification:**
- Contains sensitive PII (SSN, health records)
- Financial data (payment info, bank accounts)
- Regulated data (HIPAA, PCI-DSS, GDPR)

**User Base:**
- 10,000+ users
- Multiple geographic regions
- Enterprise customers

**Security Requirements:**
- All Medium tier requirements, plus:
- Multi-factor authentication (MFA)
- Encryption at rest and in transit
- Regular security scanning (SAST, DAST)
- Penetration testing (annual minimum)
- Incident response team
- 24/7 monitoring
- Data retention policies
- GDPR/CCPA compliance controls

**Required Evidence:**
- All Medium tier documents
- SOC2_MAPPING.md (required, comprehensive)
- THREAT_MODEL.md (full STRIDE + data flow diagrams)
- Third-party security audit report
- Penetration test results

**WAIVER Restrictions:**
- Waivers require executive sign-off
- Must include compensating controls
- Maximum 30-day waiver period
- No waivers for critical vulnerabilities

---

## Tier Selection Checklist

Use this checklist to determine the appropriate tier:

```
[ ] Does the app process PII (names, emails, addresses)?
    Yes → At least Medium tier

[ ] Does the app process sensitive PII (SSN, health, financial)?
    Yes → High tier

[ ] Are there more than 10,000 users?
    Yes → High tier

[ ] Is the app customer-facing (external users)?
    Yes → At least Medium tier

[ ] Does the app handle payments?
    Yes → High tier

[ ] Is the app subject to compliance requirements (SOC2, HIPAA, PCI)?
    Yes → High tier

[ ] Is this a prototype or demo only?
    Yes → Low tier acceptable
```

## Escalation Path

Tier can be escalated (but not reduced) based on:

1. **Business request**: Customer requires SOC2 report → upgrade to High
2. **Audit finding**: Security review identifies critical gaps → upgrade tier
3. **Incident**: Security incident reveals higher risk → upgrade tier
4. **Regulatory change**: New compliance requirement → upgrade tier

## Evidence Depth by Tier

| Evidence Area | Low | Medium | High |
|---------------|-----|--------|------|
| Threat Model Depth | Top 3 threats | Full STRIDE | STRIDE + DFD |
| RLS Policies | Basic | Per-role | Per-action, per-role |
| Backup Frequency | Daily | Daily + PITR | Real-time replication |
| Incident Response | Basic runbook | Full runbook | Runbook + IR team |
| Compliance Mapping | None | SOC2 optional | SOC2 + others required |
| Security Scanning | Manual review | CI/CD scanning | CI/CD + regular pen tests |
| WAIVER Limits | Flexible | Justified | Executive approval |
