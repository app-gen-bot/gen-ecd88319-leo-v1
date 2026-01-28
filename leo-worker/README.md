# AI App Factory

AI App Factory transforms user prompts into fully deployed applications using a multi-stage pipeline of specialized AI agents.

## Library Dependencies

This project uses **PRIVATE** libraries hosted on AWS CodeArtifact:
- `cc-agent` (v1.9.0) - Claude Code Agent Framework
- `cc-tools` (v1.7.0) - MCP development tools

Both libraries are extracted from this repository and maintained separately for modularity.

## ⚠️ Authentication Required

**You MUST authenticate with CodeArtifact before running `uv sync`:**

```bash
# Authenticate (valid for 12 hours)
source auth-codeartifact.sh

# Then sync dependencies
uv sync
```

## First Time Setup

1. **Configure AWS Credentials** for `jake-dev` profile:
   ```bash
   aws configure --profile jake-dev
   ```

2. **Authenticate with CodeArtifact**:
   ```bash
   source auth-codeartifact.sh
   ```

3. **Install dependencies**:
   ```bash
   uv sync
   ```

## Daily Workflow

The authentication token expires after 12 hours. Start each work session with:

```bash
# Morning authentication
source auth-codeartifact.sh

# Sync dependencies
uv sync

# You're ready to work!
```

## Troubleshooting

### Authentication Errors
If you get 401 or 403 errors:

1. **Check AWS credentials**:
   ```bash
   aws sts get-caller-identity --profile jake-dev
   ```

2. **Re-authenticate**:
   ```bash
   source auth-codeartifact.sh
   ```

3. **Clear uv cache if needed**:
   ```bash
   uv cache clean
   ```

### Missing Libraries
If cc-agent or cc-tools are not found:

1. Ensure you're authenticated: `source auth-codeartifact.sh`
2. Check the CodeArtifact URL is correct in `pyproject.toml`
3. Verify packages are published: 
   ```bash
   aws codeartifact list-packages --domain cc-internal --repository python-internal --profile jake-dev
   ```

## Library Repositories

The extracted libraries are maintained in separate PRIVATE repositories:
- **cc-agent**: https://github.com/fastdev-ai/cc-agent (PRIVATE)
- **cc-tools**: https://github.com/fastdev-ai/cc-tools (PRIVATE)

See `BACKLOG/DONE/library-extraction-results-2025-01-24.md` for extraction details.

## Version Mapping

For library version compatibility across branches, see:
- `/home/jake/LEAPFROG/MICHAELANGELO/cc-agent/VERSION_MAPPING.md`
- `/home/jake/LEAPFROG/MICHAELANGELO/cc-tools/VERSION_MAPPING.md`

## Project Documentation

- **Workflow**: `docs/ai-app-factory/workflow.md` - Complete pipeline details
- **Library Extraction**: `BACKLOG/DONE/library-extraction-2025-01-24.md` - Extraction plan
- **Claude.md**: `CLAUDE.md` - AI assistant instructions

## Security Notes

- All libraries are **PRIVATE** and **CONFIDENTIAL**
- CodeArtifact repository is private to our AWS account
- GitHub repositories are set to private visibility
- Authentication tokens expire after 12 hours for security

## Quick Reference

- **AWS Profile**: jake-dev
- **CodeArtifact Domain**: cc-internal (PRIVATE)
- **Repository**: python-internal (CONFIDENTIAL)
- **Token Duration**: 12 hours
- **Libraries**: cc-agent v1.9.0, cc-tools v1.7.0

---

*Last updated: 2025-01-24*