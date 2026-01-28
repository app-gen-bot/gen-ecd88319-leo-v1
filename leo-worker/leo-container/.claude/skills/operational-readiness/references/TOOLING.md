# Security Tooling Guide

## Overview

This guide documents the security scanning tools that SHOULD be used to analyze generated apps. The operational-readiness skill will document whether these tools are available and what gaps exist.

## Recommended Tools

### Static Analysis (SAST)

#### Semgrep
**Purpose**: Find bugs, security vulnerabilities, and enforce code standards

```bash
# Install
pip install semgrep

# Run on TypeScript/JavaScript
semgrep --config auto server/ client/src/

# Run security-focused rules only
semgrep --config "p/security-audit" --config "p/owasp-top-ten" .
```

**What it detects:**
- SQL injection patterns
- XSS vulnerabilities
- Hardcoded secrets
- Insecure crypto usage
- Path traversal

**Leo Stack Coverage:**
- TypeScript/JavaScript: Excellent
- React patterns: Good
- Express routes: Good

---

#### OXC Lint (oxlint)
**Purpose**: Fast linting for JavaScript/TypeScript (already in Leo container)

```bash
# Run on project
oxlint .

# Security-focused
oxlint --deny-warnings .
```

**What it detects:**
- Unused variables (potential logic bugs)
- Type mismatches
- Accessibility issues
- React hook violations

---

### Secrets Detection

#### Gitleaks
**Purpose**: Find secrets and credentials in git history

```bash
# Install
brew install gitleaks  # or via docker

# Scan current directory
gitleaks detect --source . --verbose

# Scan git history
gitleaks detect --source . --verbose --log-opts="--all"
```

**What it detects:**
- API keys
- AWS credentials
- Database passwords
- JWT secrets
- Private keys

**Configuration** (.gitleaks.toml):
```toml
[allowlist]
paths = [
  '''\.env\.example''',
  '''\.env\.sample''',
]
```

---

### Dependency Scanning

#### Trivy
**Purpose**: Comprehensive vulnerability scanner for dependencies and containers

```bash
# Install
brew install trivy  # or via docker

# Scan filesystem (package.json)
trivy fs --security-checks vuln .

# Scan Docker image
trivy image my-app:latest

# Output as JSON for processing
trivy fs --format json --output trivy-report.json .
```

**What it detects:**
- Known CVEs in npm packages
- Vulnerable transitive dependencies
- Container vulnerabilities
- Misconfigurations

---

#### OSV Scanner
**Purpose**: Google's open-source vulnerability scanner

```bash
# Install
go install github.com/google/osv-scanner/cmd/osv-scanner@latest

# Scan lockfile
osv-scanner --lockfile package-lock.json

# Scan entire project
osv-scanner -r .
```

**What it detects:**
- CVEs from OSV database
- Vulnerabilities in npm, PyPI, Go modules

---

### Runtime Analysis (DAST)

#### OWASP ZAP
**Purpose**: Dynamic application security testing

```bash
# Run via Docker
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://myapp.fly.dev

# For API scanning
docker run -t owasp/zap2docker-stable zap-api-scan.py -t https://myapp.fly.dev/api -f openapi
```

**When to use:**
- After deployment to staging
- Before production release
- Part of CI/CD pipeline

---

## Leo Container Tool Availability

The Leo container includes:

| Tool | Installed | Notes |
|------|-----------|-------|
| Node.js | Yes | v20+ |
| npm | Yes | For running npm audit |
| Python | Yes | For running scripts |
| oxlint | Yes | Fast TS/JS linting |
| git | Yes | For gitleaks scanning |
| semgrep | No | Add if needed |
| gitleaks | No | Add if needed |
| trivy | No | Add if needed |

### Adding Tools to Container (Optional)

To add security tools to the Leo container, modify the Dockerfile:

```dockerfile
# Add semgrep
RUN pip install semgrep

# Add gitleaks
RUN curl -sSfL https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz \
    | tar -xz -C /usr/local/bin gitleaks

# Add trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

---

## Manual Checks (When Tools Not Available)

If scanning tools are not installed, perform manual checks:

### 1. Secrets Check
```bash
# Look for common secret patterns
grep -rn "password\s*=" . --include="*.ts" --include="*.tsx" --include="*.js"
grep -rn "api_key\s*=" . --include="*.ts" --include="*.tsx"
grep -rn "sk-" . --include="*.ts" --include="*.tsx"  # OpenAI keys
grep -rn "ghp_" . --include="*.ts" --include="*.tsx"  # GitHub tokens
```

### 2. Dependency Audit
```bash
# npm built-in audit
npm audit

# Check for outdated packages
npm outdated
```

### 3. Code Review Checklist

- [ ] All user input validated with Zod schemas
- [ ] No `eval()` or `Function()` with user input
- [ ] No `dangerouslySetInnerHTML` with user content
- [ ] SQL queries use parameterized queries (Drizzle ORM does this)
- [ ] File uploads validated for type and size
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured with specific origins (not `*`)
- [ ] Authentication required on sensitive routes

---

## Evidence Documentation

When documenting tool results in the evidence pack:

### If Tool Was Run

```markdown
## Semgrep Scan Results

**Date**: 2025-01-23
**Version**: semgrep 1.60.0
**Config**: p/security-audit, p/owasp-top-ten

### Summary
- Findings: 3 (2 high, 1 medium)
- All issues fixed

### Fixed Issues
1. **HIGH**: Hardcoded API key in config.ts (line 15) → Moved to env var
2. **HIGH**: Missing input validation on /api/users POST → Added Zod schema
3. **MEDIUM**: Console.log with sensitive data → Removed
```

### If Tool Not Available

```markdown
## Semgrep Scan Results

**Status**: Not available in build environment

### Alternative Measures
1. Manual code review performed (see THREAT_MODEL.md)
2. npm audit run (0 vulnerabilities)
3. Code review checklist completed

### Recommendation
Add semgrep to CI/CD pipeline for automated scanning.
```

---

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2

      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: npm audit
        run: npm audit --audit-level=high
```
