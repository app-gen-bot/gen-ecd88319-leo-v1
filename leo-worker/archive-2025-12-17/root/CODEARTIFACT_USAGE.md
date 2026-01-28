# Using cc-agent and cc-tools from CodeArtifact

This document explains how to consume the cc-agent and cc-tools libraries from AWS CodeArtifact in the app-factory project.

## Quick Start

### 1. Authenticate (Every 12 Hours)

```bash
# From app-factory directory
source auth-codeartifact.sh
```

This script:
- Uses the `jake-dev` AWS profile
- Sets up authentication environment variables
- Token expires after 12 hours
- You'll need to re-run this every work session

### 2. Install Libraries

```bash
# Install both libraries
uv pip install cc-agent cc-tools

# Or add to project
uv add cc-agent cc-tools

# Install specific versions
uv pip install cc-agent==1.9.0 cc-tools==1.7.0
```

## Configuration in pyproject.toml

The project should be configured to use CodeArtifact as an additional index:

```toml
[project]
dependencies = [
    "cc-agent>=1.9.0",
    "cc-tools>=1.7.0",
    # ... other dependencies
]

[tool.uv.sources]
cc-agent = { index = "internal" }
cc-tools = { index = "internal" }

[[tool.uv.index]]
name = "internal"
url = "${UV_INDEX_INTERNAL_URL}"  # Set by auth-codeartifact.sh
explicit = true
```

## Version Compatibility

### Current Branch Versions

Based on the library extraction, use these versions for the `leonardo/timeless-weddings-enhanced-docs` branch:

- **cc-agent**: 1.9.0
- **cc-tools**: 1.7.0

### Other Branches

Check the `VERSION_MAPPING.md` files in the cc-agent and cc-tools repositories for the correct versions to use with other branches.

## Development Workflow

### Daily Workflow

1. **Start of day**: Run `source auth-codeartifact.sh`
2. **Install/Update**: Use `uv sync` or `uv pip install`
3. **Develop**: Work normally with the libraries
4. **After 12 hours**: Re-authenticate if needed

### Updating Library Versions

When you need a newer version of a library:

1. Check available versions:
   ```bash
   aws codeartifact list-package-versions \
     --domain cc-internal \
     --repository python-internal \
     --package cc-agent \
     --format pypi \
     --profile jake-dev
   ```

2. Update `pyproject.toml` with the new version

3. Run `uv sync` to update

## Local Development (Alternative)

If you need to develop against local versions of the libraries:

```bash
# Use local development versions
uv add --editable ../cc-agent
uv add --editable ../cc-tools
```

To switch back to CodeArtifact versions:

```bash
# Remove local versions
uv remove cc-agent cc-tools

# Re-add from CodeArtifact
source auth-codeartifact.sh
uv add cc-agent cc-tools
```

## Troubleshooting

### "Package not found" Error

1. Ensure you've authenticated:
   ```bash
   source auth-codeartifact.sh
   ```

2. Check environment variables are set:
   ```bash
   echo $UV_INDEX_INTERNAL_URL
   echo $UV_INDEX_INTERNAL_USERNAME
   ```

3. Verify the package exists:
   ```bash
   aws codeartifact list-packages \
     --domain cc-internal \
     --repository python-internal \
     --profile jake-dev
   ```

### Authentication Expired

If you see authentication errors after 12 hours:

```bash
# Re-authenticate
source auth-codeartifact.sh

# Retry your command
uv sync
```

### Wrong Version Installed

If you're getting an unexpected version:

1. Clear uv cache:
   ```bash
   uv cache clean
   ```

2. Re-authenticate and reinstall:
   ```bash
   source auth-codeartifact.sh
   uv pip uninstall cc-agent cc-tools
   uv pip install cc-agent==1.9.0 cc-tools==1.7.0
   ```

## Publishing Updates

To publish new versions of the libraries, see the `CODEARTIFACT_SETUP.md` files in the respective library repositories:
- [cc-agent/CODEARTIFACT_SETUP.md](../cc-agent/CODEARTIFACT_SETUP.md)
- [cc-tools/CODEARTIFACT_SETUP.md](../cc-tools/CODEARTIFACT_SETUP.md)

## Security Notes

- **Never commit the auth token** - It's set as an environment variable
- **Tokens expire** - After 12 hours, you must re-authenticate
- **Use jake-dev profile** - The script uses this AWS profile by default
- **Private repository** - These packages are confidential and should not be shared publicly

## Support

- **Authentication issues**: Check AWS credentials and profile
- **Package issues**: Contact the library maintainers
- **CodeArtifact issues**: Contact DevOps team

---

*Last updated: 2025-01-25*