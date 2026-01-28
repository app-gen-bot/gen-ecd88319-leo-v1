# Evidence Pack Specification

## Overview

The **Release Assurance Evidence Pack** is a versioned, tamper-evident collection of documents that prove an application meets security and operational standards.

## Purpose

CTOs and security reviewers use this pack for:
- **Production Release Approval**: Evidence that security controls are in place
- **Security Reviews**: Documentation for penetration testers and auditors
- **Procurement Due Diligence**: Third-party vendor assessment
- **SOC2/ISO Audit Prep**: Control evidence for compliance auditors
- **Incident Postmortems**: Baseline documentation for forensic analysis

## Pack Structure

```
release-assurance/
└── v1.0.0/
    ├── EXECUTIVE_SUMMARY.md      # One-page CTO brief
    ├── THREAT_MODEL.md           # STRIDE analysis
    ├── RUNBOOK.md                # Incident response procedures
    ├── SOC2_MAPPING.md           # Control compliance mapping
    ├── SUPABASE_RLS.md           # Database security policies
    ├── BACKUP_RESTORE.md         # Data protection procedures
    ├── FLYIO_ROLLBACK.md         # Deployment rollback guide
    ├── WAIVER.md                 # Documented exceptions
    └── EVIDENCE_MANIFEST.json    # Tamper-evident file hashes
```

## Version Format

Use semantic versioning: `vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking security changes (new auth system, new data classification)
- **MINOR**: New security controls added
- **PATCH**: Documentation updates, clarifications

## Manifest Format

The `EVIDENCE_MANIFEST.json` provides tamper-evidence:

```json
{
  "version": "v1.0.0",
  "risk_tier": "low",
  "generated_at": "2025-01-23T12:00:00Z",
  "status": "complete",
  "files": {
    "EXECUTIVE_SUMMARY.md": {
      "sha256": "abc123...",
      "size_bytes": 2048,
      "modified": "2025-01-23T11:55:00Z"
    }
  },
  "issues_found": 5,
  "issues_fixed": 5,
  "issues_waived": 0,
  "pack_hash": "def456...",
  "integrity": {
    "total_files": 8,
    "manifest_hash_algorithm": "sha256",
    "verification_command": "python generate_manifest.py release-assurance/v1.0.0/ --verify"
  }
}
```

## Document Requirements by Tier

| Document | Low | Med | High |
|----------|-----|-----|------|
| EXECUTIVE_SUMMARY.md | Required | Required | Required |
| THREAT_MODEL.md | Basic | Full STRIDE | Full STRIDE + DFD |
| RUNBOOK.md | Optional | Required | Required |
| SOC2_MAPPING.md | Optional | Optional | Required |
| SUPABASE_RLS.md | Required | Required | Required |
| BACKUP_RESTORE.md | Required | Required | Required |
| FLYIO_ROLLBACK.md | Required | Required | Required |
| WAIVER.md | As needed | As needed | Minimal |

## Validation

The pack is valid when:

1. **All required files exist** for the declared risk tier
2. **EVIDENCE_MANIFEST.json** contains valid SHA-256 hashes
3. **All hashes match** current file contents
4. **issues_fixed >= issues_found - issues_waived**
5. **WAIVER.md** contains valid justifications for any gaps

## Integration with CI/CD

Add pack generation to deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Generate Evidence Pack
  run: |
    python scripts/operational-readiness/generate-pack.py \
      --tier ${{ vars.RISK_TIER }} \
      --version ${{ github.sha }}

- name: Verify Pack Integrity
  run: |
    python scripts/operational-readiness/verify-pack.py \
      release-assurance/v*/ --strict

- name: Upload Pack as Artifact
  uses: actions/upload-artifact@v3
  with:
    name: evidence-pack-${{ github.sha }}
    path: release-assurance/
```

## Retention Policy

- **Active version**: Always kept with the codebase
- **Previous 3 versions**: Kept for rollback reference
- **Older versions**: Archived to long-term storage (S3, etc.)
- **Audit trail**: All pack generations logged with timestamp and author
