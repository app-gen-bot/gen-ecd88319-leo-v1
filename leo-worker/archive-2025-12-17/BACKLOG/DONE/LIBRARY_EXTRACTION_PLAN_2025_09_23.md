# LIBRARY EXTRACTION AND BRANCH COMPRESSION PLAN - 2025-09-23

## CRITICAL: NO CODE LOSS STRATEGY

This document outlines the extraction of `cc-agent` and `cc-tools` libraries from the app-factory monorepo while **preserving ALL code changes** through intelligent branch analysis and compression.

---

## OVERVIEW

### Current State
- **Monorepo**: app-factory with embedded libraries (cc-agent, cc-tools)
- **Branches**: 33 remote branches, most for app-factory experiments
- **Problem**: Libraries rarely change across branches, creating unnecessary complexity

### Target State
- **Separate Repos**: Private repos for cc-agent and cc-tools
- **Clean History**: Compressed branches with ALL code changes preserved
- **Private Package Hosting**: AWS CodeArtifact with dynamic configuration
- **Main Repo**: app-factory consumes libraries as external dependencies

---

## PHASE 1: BRANCH ANALYSIS AND PRESERVATION

### Intelligent Branch Compression Strategy

**PRINCIPLE: Never lose code - only remove truly duplicate branches**

1. **Analyze Each Branch for Library Changes**
   ```bash
   # Script: analyze-library-changes.sh
   #!/bin/bash
   
   echo "=== BRANCH ANALYSIS FOR LIBRARY CHANGES ==="
   echo "Branch,CC-Agent Changes,CC-Tools Changes" > branch_analysis.csv
   
   for branch in $(git branch -r | grep -v HEAD); do
     branch_name=${branch#origin/}
     
     # Check cc-agent changes
     agent_changes=$(git diff --stat main..$branch -- src/cc_agent 2>/dev/null | tail -1)
     agent_count=$(echo "$agent_changes" | grep -oE '[0-9]+ file' | grep -oE '[0-9]+' || echo "0")
     
     # Check cc-tools changes  
     tools_changes=$(git diff --stat main..$branch -- src/cc_tools 2>/dev/null | tail -1)
     tools_count=$(echo "$tools_changes" | grep -oE '[0-9]+ file' | grep -oE '[0-9]+' || echo "0")
     
     echo "$branch_name,$agent_count,$tools_count" >> branch_analysis.csv
     
     if [[ "$agent_count" != "0" ]] || [[ "$tools_count" != "0" ]]; then
       echo "✓ $branch_name: CHANGES DETECTED (agent: $agent_count, tools: $tools_count)"
     else
       echo "  $branch_name: no library changes"
     fi
   done
   ```

2. **Build Branch Dependency Graph**
   ```bash
   # Script: branch-dependency-graph.sh
   #!/bin/bash
   
   echo "=== BUILDING BRANCH DEPENDENCY GRAPH ==="
   
   # For each branch, find its parent and check for changes
   for branch in $(git branch -r | grep -v HEAD); do
     branch_name=${branch#origin/}
     
     # Find merge base with main
     merge_base=$(git merge-base main $branch)
     
     # Find closest parent branch
     parent_branch=$(git show-branch | grep $branch_name | head -1)
     
     # Check if this branch has unique library commits
     unique_commits=$(git log $merge_base..$branch --oneline -- src/cc_agent src/cc_tools | wc -l)
     
     if [[ $unique_commits -gt 0 ]]; then
       echo "KEEP: $branch_name (unique library commits: $unique_commits)"
       echo "  Tag as: lib-$branch_name-v1.0.$unique_commits"
     else
       echo "SAFE TO REMOVE: $branch_name (no unique library changes)"
     fi
   done > branch_dependency.txt
   ```

3. **Create Preservation Tags Before Compression**
   ```bash
   # Script: tag-library-versions.sh
   #!/bin/bash
   
   echo "=== TAGGING LIBRARY VERSIONS IN BRANCHES ==="
   
   # Read branches with changes from analysis
   while IFS=, read -r branch agent_changes tools_changes; do
     if [[ "$agent_changes" != "0" ]] || [[ "$tools_changes" != "0" ]]; then
       # Checkout branch
       git checkout $branch
       
       # Create semantic version tag
       version="1.0.0-${branch//\//-}"
       
       if [[ "$agent_changes" != "0" ]]; then
         git tag -a "cc-agent-$version" -m "cc-agent changes from branch $branch"
         echo "Tagged: cc-agent-$version"
       fi
       
       if [[ "$tools_changes" != "0" ]]; then  
         git tag -a "cc-tools-$version" -m "cc-tools changes from branch $branch"
         echo "Tagged: cc-tools-$version"
       fi
     fi
   done < branch_analysis.csv
   ```

---

## PHASE 2: LIBRARY EXTRACTION WITH HISTORY PRESERVATION

### Extract cc-agent Library

```bash
# Script: extract-cc-agent.sh
#!/bin/bash

echo "=== EXTRACTING CC-AGENT WITH FULL HISTORY ==="

# Clone for extraction
git clone . /tmp/cc-agent-extract
cd /tmp/cc-agent-extract

# Extract with ALL branches that have cc-agent changes
BRANCHES_TO_KEEP=$(grep -v ",0," branch_analysis.csv | cut -d, -f1)

# Use git-filter-repo to extract cc-agent with selected branches
git filter-repo \
  --path src/cc_agent \
  --path-rename src/cc_agent/: \
  --refs $(echo $BRANCHES_TO_KEEP | tr ' ' ',') \
  --force

# Create new private repo
gh repo create cc-agent --private --description "Claude Code Agent Framework"

# Push with all branches and tags
git remote add origin git@github.com:$(gh api user -q .login)/cc-agent.git
git push origin --all
git push origin --tags

echo "✓ cc-agent extracted with all relevant history"
```

### Extract cc-tools Library

```bash
# Script: extract-cc-tools.sh
#!/bin/bash

echo "=== EXTRACTING CC-TOOLS WITH FULL HISTORY ==="

# Similar process for cc-tools
git clone . /tmp/cc-tools-extract
cd /tmp/cc-tools-extract

# Extract with branches that have cc-tools changes
BRANCHES_TO_KEEP=$(grep ",[^0]" branch_analysis.csv | tail -c +2 | cut -d, -f1)

git filter-repo \
  --path src/cc_tools \
  --path-rename src/cc_tools/: \
  --refs $(echo $BRANCHES_TO_KEEP | tr ' ' ',') \
  --force

# Create private repo and push
gh repo create cc-tools --private --description "Claude Code Tools - MCP Servers"
git remote add origin git@github.com:$(gh api user -q .login)/cc-tools.git
git push origin --all
git push origin --tags

echo "✓ cc-tools extracted with all relevant history"
```

---

## PHASE 3: POST-EXTRACTION BRANCH COMPRESSION

### Compress Branches in Extracted Libraries

```bash
# Script: compress-library-branches.sh
#!/bin/bash

echo "=== COMPRESSING LIBRARY BRANCHES ==="

# In extracted library repo
cd ~/repos/cc-agent  # or cc-tools

# 1. Identify duplicate branches (same tree hash)
declare -A tree_hashes
for branch in $(git branch -r | grep -v HEAD); do
  branch_name=${branch#origin/}
  tree_hash=$(git rev-parse $branch^{tree})
  
  if [[ -n "${tree_hashes[$tree_hash]}" ]]; then
    echo "DUPLICATE: $branch_name same as ${tree_hashes[$tree_hash]}"
    git push origin --delete $branch_name
  else
    tree_hashes[$tree_hash]=$branch_name
    echo "UNIQUE: $branch_name (tree: $tree_hash)"
  fi
done

# 2. Convert remaining branches to tags if they're not actively developed
for branch in $(git branch -r | grep -v -E "HEAD|main|develop"); do
  branch_name=${branch#origin/}
  
  # Check last commit date
  last_commit=$(git log -1 --format=%ai $branch)
  days_old=$(( ($(date +%s) - $(date -d "$last_commit" +%s)) / 86400 ))
  
  if [[ $days_old -gt 30 ]]; then
    echo "Converting old branch to tag: $branch_name"
    git tag -a "archive/$branch_name" -m "Archived branch $branch_name"
    git push origin --delete $branch_name
  fi
done

# 3. Final structure
echo "=== FINAL BRANCH STRUCTURE ==="
git branch -r
echo "=== TAGS ==="
git tag -l
```

---

## PHASE 4: AWS CODEARTIFACT SETUP (DYNAMIC CONFIGURATION)

### No Hardcoded AWS Account IDs

```bash
# Script: setup-codeartifact-dynamic.sh
#!/bin/bash

echo "=== SETTING UP CODEARTIFACT WITH DYNAMIC CONFIGURATION ==="

# Dynamic resolution - NO HARDCODED ACCOUNT IDS!
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=${AWS_REGION:-us-east-1}

echo "Using AWS Account: $AWS_ACCOUNT_ID"
echo "Using AWS Region: $AWS_REGION"

# Create domain
aws codeartifact create-domain \
  --domain cc-internal \
  --encryption-key alias/aws/codeartifact

# Create repository
aws codeartifact create-repository \
  --domain cc-internal \
  --domain-owner $AWS_ACCOUNT_ID \
  --repository python-internal \
  --description "Private Python packages for cc-* libraries"

# Associate with public PyPI (optional - for public dependencies)
aws codeartifact associate-external-connection \
  --domain cc-internal \
  --domain-owner $AWS_ACCOUNT_ID \
  --repository python-internal \
  --external-connection public:pypi

echo "✓ CodeArtifact setup complete"
```

### Developer Authentication Helper

```bash
# Script: auth-codeartifact.sh
#!/bin/bash

# Dynamic account resolution
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")
DOMAIN="cc-internal"

# Get auth token
export UV_INDEX_INTERNAL_USERNAME=aws
export UV_INDEX_INTERNAL_PASSWORD=$(
  aws codeartifact get-authorization-token \
    --domain $DOMAIN \
    --domain-owner $ACCOUNT_ID \
    --query authorizationToken \
    --output text
)

# Build dynamic URL
export UV_INDEX_INTERNAL_URL="https://${DOMAIN}-${ACCOUNT_ID}.d.codeartifact.${REGION}.amazonaws.com/pypi/python-internal/simple/"

echo "✅ Authenticated to CodeArtifact"
echo "   Account: $ACCOUNT_ID"
echo "   Region: $REGION"
echo "   Domain: $DOMAIN"
echo "   Token valid for: 12 hours"
```

---

## PHASE 5: GITHUB ACTIONS WITH DYNAMIC AWS RESOLUTION

### Publishing Workflow (No Hardcoded IDs)

```yaml
# .github/workflows/publish.yml in cc-agent and cc-tools repos
name: Publish to CodeArtifact
on:
  push:
    tags:
      - 'v*'
      - '*-v*'  # Support branch version tags

permissions:
  id-token: write
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install uv
        uses: astral-sh/setup-uv@v4
      
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT }}:role/GitHubCodeArtifactPublisher
          aws-region: us-east-1
      
      - name: Get AWS Account Dynamically
        id: aws-account
        run: |
          ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
          echo "account_id=$ACCOUNT" >> $GITHUB_OUTPUT
          echo "domain=cc-internal" >> $GITHUB_OUTPUT
      
      - name: Build package
        run: uv build
      
      - name: Publish to CodeArtifact
        env:
          UV_PUBLISH_USERNAME: aws
          UV_PUBLISH_PASSWORD: ${{ steps.codeartifact.outputs.token }}
        run: |
          # Dynamic URL construction
          ACCOUNT="${{ steps.aws-account.outputs.account_id }}"
          DOMAIN="${{ steps.aws-account.outputs.domain }}"
          REGION="${{ env.AWS_REGION }}"
          
          TOKEN=$(aws codeartifact get-authorization-token \
            --domain $DOMAIN \
            --domain-owner $ACCOUNT \
            --query authorizationToken \
            --output text)
          
          UV_PUBLISH_PASSWORD=$TOKEN uv publish \
            --publish-url "https://${DOMAIN}-${ACCOUNT}.d.codeartifact.${REGION}.amazonaws.com/pypi/python-internal/"
```

---

## PHASE 6: UPDATE APP-FACTORY TO USE LIBRARIES

### Remove Library Code from app-factory

```bash
# Script: remove-libraries-from-app-factory.sh
#!/bin/bash

echo "=== REMOVING LIBRARIES FROM APP-FACTORY ==="

# Create backup branch
git checkout -b pre-extraction-backup
git push origin pre-extraction-backup

# Switch to main
git checkout main

# Remove library directories
git rm -r src/cc_agent
git rm -r src/cc_tools

# Update pyproject.toml to use external dependencies
cat > pyproject.toml.new << 'EOF'
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "app-factory"
version = "0.1.0"
description = "AI App Factory - Generate full-stack applications from prompts"
requires-python = ">=3.12"
dependencies = [
    "cc-agent>=1.0.0",
    "cc-tools>=1.0.0",
    # ... other dependencies
]

[tool.uv.sources]
cc-agent = { index = "internal" }
cc-tools = { index = "internal" }

[[tool.uv.index]]
name = "internal"
# URL will be set by environment variable or auth script
url = "${UV_INDEX_INTERNAL_URL}"
explicit = true
EOF

mv pyproject.toml.new pyproject.toml

git add -A
git commit -m "Extract cc-agent and cc-tools to separate repositories"
```

---

## PHASE 7: VERIFICATION AND ROLLBACK PLAN

### Verification Checklist

```bash
# Script: verify-extraction.sh
#!/bin/bash

echo "=== EXTRACTION VERIFICATION ==="

# 1. Check all branches were analyzed
echo "✓ Checking branch analysis..."
test -f branch_analysis.csv || echo "❌ Missing branch analysis"

# 2. Verify no code was lost
echo "✓ Verifying code preservation..."
for branch in $(cat branch_analysis.csv | grep -v ",0,0" | cut -d, -f1); do
  echo "  Checking $branch..."
  # Compare old monorepo with extracted library
done

# 3. Test package installation
echo "✓ Testing package installation..."
source auth-codeartifact.sh
uv pip install cc-agent cc-tools

# 4. Run tests
echo "✓ Running tests..."
pytest tests/

echo "=== VERIFICATION COMPLETE ==="
```

### Rollback Plan

If issues arise:

1. **Immediate Rollback**
   ```bash
   git checkout pre-extraction-backup
   git revert HEAD  # Revert the removal commit
   ```

2. **Re-add as Local Packages**
   ```bash
   # Temporarily use local development
   git clone git@github.com:yourorg/cc-agent.git ../cc-agent
   git clone git@github.com:yourorg/cc-tools.git ../cc-tools
   
   # Update pyproject.toml
   uv add --editable ../cc-agent
   uv add --editable ../cc-tools
   ```

---

## MIGRATION TIMELINE

### Week 1: Analysis and Preparation
- [ ] Run branch analysis scripts
- [ ] Review branches with library changes
- [ ] Create preservation tags
- [ ] Set up AWS CodeArtifact

### Week 2: Extraction and Testing
- [ ] Extract cc-agent with history
- [ ] Extract cc-tools with history  
- [ ] Compress branches intelligently
- [ ] Test installations

### Week 3: Integration and Deployment
- [ ] Update app-factory dependencies
- [ ] Set up GitHub Actions
- [ ] Publish initial versions
- [ ] Team training

---

## KEY PRINCIPLES

1. **NO CODE LOSS**: Every line of code in every branch is preserved
2. **INTELLIGENT COMPRESSION**: Only remove truly duplicate branches
3. **DYNAMIC CONFIGURATION**: Never hardcode AWS account IDs
4. **SEMANTIC VERSIONING**: Clear version history with tags
5. **REVERSIBLE**: Can rollback at any stage

---

## TEAM NOTES

- All scripts are idempotent - safe to run multiple times
- Branch analysis creates CSV for review before action
- Tags preserve branch points even after deletion
- CodeArtifact tokens expire after 12 hours
- Use `auth-codeartifact.sh` at start of each work session

---

## APPENDIX: QUICK COMMAND REFERENCE

```bash
# Authenticate to CodeArtifact
source scripts/auth-codeartifact.sh

# Install libraries
uv sync

# Local development
uv add --editable ../cc-agent

# Publish new version
git tag v1.0.1 && git push --tags

# Check branch differences
git diff main..branch -- src/cc_agent

# List branches with changes
grep -v ",0,0" branch_analysis.csv
```

---

*Document created: 2025-09-23*
*Author: AI App Factory Team*
*Status: READY FOR REVIEW*