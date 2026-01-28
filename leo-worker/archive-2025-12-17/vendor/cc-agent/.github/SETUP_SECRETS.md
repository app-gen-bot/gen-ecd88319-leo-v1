# GitHub Actions Setup for Automated Publishing

This repository uses GitHub Actions to automatically publish the `cc-agent` package when you push a version tag.

## How It Works

1. When you push a tag starting with `v` (e.g., `v1.10.0`), the workflow automatically:
   - Builds the package
   - Publishes to PyPI (if configured)
   - Creates a GitHub Release with the built artifacts

## Setup Instructions

### Option 1: PyPI Publishing (Recommended)

1. **Create a PyPI account** at https://pypi.org/account/register/

2. **Generate an API token**:
   - Go to https://pypi.org/manage/account/token/
   - Create a new API token (scope: entire account or just this project)
   - Copy the token (starts with `pypi-`)

3. **Add to GitHub Secrets**:
   - Go to your repository settings: https://github.com/fastdev-ai/cc-agent/settings/secrets/actions
   - Click "New repository secret"
   - Name: `PYPI_API_TOKEN`
   - Value: paste your token

4. **(Optional) TestPyPI**:
   - Create account at https://test.pypi.org/
   - Generate token at https://test.pypi.org/manage/account/token/
   - Add as secret: `TEST_PYPI_API_TOKEN`

### Option 2: GitHub Packages (No External Setup)

GitHub Packages works automatically with the `GITHUB_TOKEN` that's already available. No setup needed!

Users can install with:
```bash
pip install cc-agent --index-url https://pypi.org/simple --extra-index-url https://github.com/fastdev-ai/cc-agent/releases/download/
```

### Option 3: AWS CodeArtifact (Enterprise)

If you want to use AWS CodeArtifact instead:

1. Set up CodeArtifact repository in AWS
2. Add these secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `CODEARTIFACT_DOMAIN`
   - `CODEARTIFACT_REPOSITORY`

3. Modify the workflow to use AWS CLI instead of twine

## Usage

After setup, just push a tag:

```bash
# Make your changes
git add .
git commit -m "feat: new feature"

# Update version in pyproject.toml
# Then tag and push
git tag v1.11.0
git push origin main
git push origin v1.11.0
```

The package will be automatically published! 🚀

## Manual Trigger

You can also trigger the workflow manually from the GitHub UI:
1. Go to Actions tab
2. Select "Publish Python Package"
3. Click "Run workflow"

## Checking Status

View the workflow runs at:
https://github.com/fastdev-ai/cc-agent/actions/workflows/publish.yml