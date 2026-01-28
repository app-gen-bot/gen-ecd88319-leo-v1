# CodeArtifact Setup for cc-tools

This document describes how to set up and use AWS CodeArtifact for publishing and consuming the cc-tools library.

## Overview

cc-tools is published to a private AWS CodeArtifact repository for internal use. This ensures:
- Private package hosting for MCP tools
- Version control and management
- Secure distribution within the organization
- Integration with standard Python package managers (pip, uv)

## Architecture

```
GitHub Repository (cc-tools)
    ↓ (push tag)
GitHub Actions with OIDC
    ↓ (authenticate)
AWS CodeArtifact
    ↓ (publish)
Repository: cc-internal/python-internal
    ↓ (install)
Consumer Projects
```

## Initial Setup (One-time)

### 1. AWS CodeArtifact Domain and Repository

The CodeArtifact domain and repository should already exist. If not, create them:

```bash
# Create domain (if not exists)
aws codeartifact create-domain \
  --domain cc-internal \
  --encryption-key alias/aws/codeartifact

# Create repository (if not exists)  
aws codeartifact create-repository \
  --domain cc-internal \
  --repository python-internal \
  --description "Private Python packages for cc-* libraries"
```

### 2. GitHub Actions OIDC Setup

Create an IAM role for GitHub Actions with OIDC authentication:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/cc-tools:*"
        }
      }
    }
  ]
}
```

Attach the following policy to the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codeartifact:GetAuthorizationToken",
        "codeartifact:PublishPackageVersion",
        "codeartifact:PutPackageMetadata",
        "codeartifact:ListPackageVersions",
        "codeartifact:DescribePackageVersion"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "sts:GetServiceBearerToken",
      "Resource": "*"
    }
  ]
}
```

### 3. GitHub Repository Secrets

Add the following secret to your GitHub repository:

- `AWS_CODEARTIFACT_ROLE_ARN`: The ARN of the IAM role created above

## Publishing a New Version

### Automated Publishing (Recommended)

1. **Update version** in `pyproject.toml`
2. **Commit changes**: `git commit -am "Bump version to X.Y.Z"`
3. **Create and push tag**: 
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
4. GitHub Actions will automatically build and publish to CodeArtifact

### Manual Publishing

For local/debugging purposes:

```bash
# From cc-tools directory
./scripts/publish-to-codeartifact.sh
```

## Consuming the Package

### 1. Authenticate with CodeArtifact

In your consumer project (e.g., app-factory), run:

```bash
# Source the authentication script
source auth-codeartifact.sh
```

This sets up environment variables for uv/pip to authenticate with CodeArtifact.

### 2. Install the Package

#### Using uv (Recommended)

```bash
# Install specific version
uv pip install cc-tools==1.7.0

# Install latest
uv pip install cc-tools

# Add to pyproject.toml
uv add cc-tools
```

#### Using pip

```bash
# Install with pip
pip install cc-tools \
  --index-url $UV_INDEX_INTERNAL_URL \
  --extra-index-url https://pypi.org/simple
```

### 3. Configure pyproject.toml

In your project's `pyproject.toml`:

```toml
[project]
dependencies = [
    "cc-tools>=1.7.0",
    # other dependencies...
]

[tool.uv.sources]
cc-tools = { index = "internal" }

[[tool.uv.index]]
name = "internal"
url = "${UV_INDEX_INTERNAL_URL}"  # Set by auth-codeartifact.sh
explicit = true
```

## MCP Tools Included

cc-tools provides the following MCP (Model Context Protocol) servers:

- **browser** - Browser automation with Playwright
- **build_test** - Build and test verification
- **context_manager** - Context and session management
- **cwd_reporter** - Working directory reporting
- **dalle** - DALL-E image generation
- **dev_server** - Development server management
- **graphiti** - Knowledge graph with FalkorDB
- **heroicons** - React icon components
- **integration_analyzer** - Template comparison
- **mem0** - Memory system with vector search
- **oxc** - Ultra-fast JS/TS linting
- **package_manager** - Secure package management
- **route_testing** - API route testing
- **ruff** - Ultra-fast Python linting
- **shadcn** - UI component management
- **tree_sitter** - AST code analysis
- **unsplash** - Stock photo integration

## Version Mapping

See `VERSION_MAPPING.md` for the mapping between app-factory branches and cc-tools versions.

## Troubleshooting

### Authentication Issues

```bash
# Check AWS credentials
aws sts get-caller-identity

# Manually test authentication
aws codeartifact get-authorization-token \
  --domain cc-internal \
  --query authorizationToken \
  --output text
```

### Package Not Found

```bash
# List available versions
aws codeartifact list-package-versions \
  --domain cc-internal \
  --repository python-internal \
  --package cc-tools \
  --format pypi
```

### GitHub Actions Failures

1. Check the role ARN in secrets
2. Verify OIDC trust relationship
3. Check IAM permissions
4. Review action logs for specific errors

## Security Considerations

1. **Never commit tokens** - They expire in 12 hours
2. **Use OIDC for CI/CD** - More secure than long-lived credentials
3. **Rotate tokens regularly** - Re-run auth script every work session
4. **Restrict IAM permissions** - Principle of least privilege

## Support

For issues with:
- **Package content**: Open issue in cc-tools repository
- **Publishing/CI**: Check GitHub Actions logs
- **CodeArtifact**: Contact AWS support or DevOps team

---

*Last updated: 2025-01-25*