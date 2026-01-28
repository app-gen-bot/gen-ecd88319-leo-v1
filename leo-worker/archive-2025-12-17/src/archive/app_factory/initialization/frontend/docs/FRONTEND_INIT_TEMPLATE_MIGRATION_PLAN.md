# Frontend Init Template Migration Plan

## Overview
Migrate frontend_init from complex npm installation workflow to a reliable template-based approach using pre-built, verified project templates stored in AWS S3.

## Current Problem
The npm-based approach has multiple issues:
- Race conditions between create-next-app and dependency installation
- ShadCN installation removing TypeScript modules
- Environment variable conflicts (NODE_ENV=production vs development)
- Complex recovery logic that's hard to maintain
- Inconsistent results across different environments

## Solution: Template-Based Approach
Create a "golden template" once, store it in S3, and reuse by downloading + unzipping instead of running npm commands.

---

## Phase 1: Create Golden Template

### Step 1.1: Generate Perfect Project
Use the current fixed frontend_init to create a project that passes all checks:

```bash
# Create project using current working frontend_init
uv run python debug_step2_build_test.py

# Verify it passes all checks:
# - lint ✅
# - type-check ✅ 
# - test ✅
# - build ✅
# - browser tests ✅
```

### Step 1.2: Manual Verification Commands
Document the exact verification process for future template creation:

```bash
# Navigate to created project
cd /path/to/project

# Verify package.json structure
cat package.json | jq '.dependencies, .devDependencies'

# Verify TypeScript module exists
ls -la node_modules/typescript/

# Verify all npm scripts work
npm run lint
npm run type-check  
npm run build
npm run dev  # Start and check manually

# Verify ShadCN components
ls -la components/ui/
cat components.json

# Verify project structure
tree -I node_modules -a
```

### Step 1.3: Template Preparation
Clean and prepare the template for distribution:

```bash
# Remove unnecessary files
rm -rf .git/
rm -rf .next/
rm -rf *.log
rm -rf coverage/

# Verify template size and structure
du -sh .
find . -name "*.log" -o -name "*.tmp" -o -name "*.cache" | head -20

# Create template archive
zip -r nextjs-shadcn-template-v1.0.0.zip . -x "*.git*" "*.next*" "*.log"
```

### Step 1.3a: Generate Baseline Manifest (v1.3.0+)
**IMPORTANT**: Starting with template v1.3.0, we include a baseline manifest for TypeScript LS integration.

```bash
# Use the template creation script
cd mcp-tools/src/mcp_tools/frontend_init/scripts
python create_template_with_manifest.py \
  --input ~/.mcp-tools/templates/nextjs-shadcn-template-v1.2.0.tar.gz \
  --output ~/.mcp-tools/templates/nextjs-shadcn-template-v1.3.0.tar.gz \
  --version 1.3.0

# The script will:
# 1. Extract the existing template
# 2. Generate .baseline_manifest.json with all file hashes
# 3. Add manifest to the template root
# 4. Create new tar.gz with manifest included
```

**Baseline Manifest Purpose**:
- Enables TypeScript LS to identify custom vs template files
- Dramatically speeds up code analysis (only analyzes custom files)
- Provides consistent baseline across all generated projects
- Required for the TypeScript LS tool in mcp_tools/typescript_ls

### Step 1.4: Template Validation
Before uploading, validate the template works:

```bash
# Test template extraction
cd /tmp
unzip nextjs-shadcn-template-v1.0.0.zip -d test-template
cd test-template

# Verify it still works
npm run lint
npm run build
npm run dev  # Test manually
```

---

## Phase 2: Template Storage & Versioning

### Step 2.1: AWS S3 Setup
Configure S3 bucket for template storage:

```bash
# Create S3 bucket (if needed)
aws s3 mb s3://mcp-frontend-templates --region us-east-1

# Set bucket policy for public read access to templates
aws s3api put-bucket-policy --bucket mcp-frontend-templates --policy file://bucket-policy.json
```

### Step 2.2: Template Upload & Metadata
Upload template with proper versioning:

```bash
# Upload template
aws s3 cp nextjs-shadcn-template-v1.0.0.zip s3://mcp-frontend-templates/

# Create metadata file
cat > template-metadata.json << EOF
{
  "version": "1.0.0",
  "created_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nextjs_version": "14.2.23",
  "typescript_version": "5.8.3",
  "components": ["button"],
  "file_size": $(stat -c%s nextjs-shadcn-template-v1.0.0.zip),
  "sha256": "$(sha256sum nextjs-shadcn-template-v1.0.0.zip | cut -d' ' -f1)"
}
EOF

# Upload metadata
aws s3 cp template-metadata.json s3://mcp-frontend-templates/v1.0.0-metadata.json
```

### Step 2.3: Template Verification URLs
Document the access URLs:

```
Template URL: https://mcp-frontend-templates.s3.amazonaws.com/nextjs-shadcn-template-v1.0.0.zip
Metadata URL: https://mcp-frontend-templates.s3.amazonaws.com/v1.0.0-metadata.json
```

---

## Phase 3: Update Frontend_init

### Step 3.1: New Architecture Design
Replace npm workflow with template-based workflow:

```
OLD: create-next-app → npm install → shadcn setup → recovery logic
NEW: download template → unzip → customize → done
```

### Step 3.2: Implementation Plan
Update `src/mcp_tools/frontend_init/server.py`:

**IMPORTANT for v1.3.0**: Update the template version in server.py:
```python
# Change this line:
self.template_version = "1.2.0"
# To:
self.template_version = "1.3.0"
```

1. **Add template download logic**
   - Download from S3 with retry logic
   - Verify SHA256 checksum
   - Cache locally in `~/.mcp-tools/templates/`

2. **Add template extraction logic**
   - Unzip to target directory
   - Customize project name in package.json
   - Update any hardcoded paths/names

3. **Add template caching**
   - Check local cache first
   - Download only if missing or outdated
   - Configurable cache directory

4. **Add fallback strategy**
   - If S3 unavailable, use bundled template
   - If template corrupted, retry download
   - Log clear error messages

### Step 3.3: Configuration Options
Add environment variables for template management:

```bash
# Template configuration
MCP_TEMPLATE_VERSION=1.0.0
MCP_TEMPLATE_CACHE_DIR=~/.mcp-tools/templates
MCP_TEMPLATE_BASE_URL=https://mcp-frontend-templates.s3.amazonaws.com
MCP_TEMPLATE_FALLBACK_TO_NPM=false  # For development/testing
```

---

## Phase 4: Testing & Validation

### Step 4.1: Integration Testing
Update test suite to work with template approach:

```bash
# Run existing integration tests
uv run pytest tests/test_complete_workflow.py -v

# Test template caching
rm -rf ~/.mcp-tools/templates/
uv run python debug_step2_build_test.py  # Should download
uv run python debug_step2_build_test.py  # Should use cache

# Test different project names
# Test with/without internet connectivity
```

### Step 4.2: Performance Testing
Measure improvement over npm approach:

```bash
# Time npm approach (current)
time uv run python debug_step2_build_test.py

# Time template approach (new)
time uv run python debug_step2_build_test.py

# Expected: 5-10x faster with template approach
```

---

## Phase 5: Future Template Updates

### Step 5.1: Template Recreation Process
When we need to update the template (new Next.js version, etc.):

```bash
# 1. Update the current working frontend_init if needed
# 2. Generate new project using updated frontend_init
uv run python -c "
from src.mcp_tools.frontend_init.server import FrontendInitMCPServer
# ... create new project with latest settings
"

# 3. Run full verification suite
npm run lint && npm run type-check && npm run build && npm run test

# 4. Test with browser integration
uv run pytest tests/test_complete_workflow.py -v

# 5. Clean and package new template
# (Follow Phase 1 steps)

# 6. Upload new version to S3
# (Follow Phase 2 steps with incremented version)
```

### Step 5.2: Version Management
Strategy for handling multiple template versions:

- **Semantic versioning**: `major.minor.patch`
- **Backward compatibility**: Keep old versions available
- **Automatic updates**: Check for newer versions periodically
- **Forced updates**: For critical security fixes

---

## Commands Reference

### Current Working State
These are the exact commands that created our current working frontend_init:

```bash
# The integration test that now passes
uv run pytest tests/test_complete_workflow.py::TestCompleteLLMWorkflow::test_complete_frontend_development_workflow -v

# Debug script that creates working project
uv run python debug_step2_build_test.py

# Key fixes implemented:
# 1. NODE_ENV=development for all npm installs
# 2. Forced npm install after create-next-app
# 3. TypeScript existence check with recovery
# 4. ShadCN environment consistency 
# 5. Final verification after ShadCN installation
# 6. Emergency TypeScript reinstall if removed
```

### Template Validation Commands
Use these to verify any new template:

```bash
cd /path/to/template

# Structure verification
ls -la
cat package.json | jq '.scripts'
test -d node_modules/typescript && echo "TypeScript OK" || echo "TypeScript MISSING"

# Functionality verification  
npm run lint
npm run type-check
npm run build
npm run test

# Integration test
# (Extract template, run through build_test MCP server)
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Golden template created and validated
- [ ] Template passes all lint, type-check, build, test checks
- [ ] Template passes browser integration tests
- [ ] Template is properly cleaned and optimized

### Phase 2 Complete When:
- [ ] Template uploaded to S3 with proper versioning
- [ ] Metadata file created and uploaded
- [ ] Download URLs tested and working
- [ ] Checksum verification working

### Phase 3 Complete When:
- [ ] Frontend_init rewritten to use template approach
- [ ] Local caching implemented
- [ ] Fallback strategies implemented
- [ ] Configuration options working

### Phase 4 Complete When:
- [ ] All integration tests pass with template approach
- [ ] Performance improvement verified (5-10x faster)
- [ ] Edge cases tested (no internet, corrupted template, etc.)

### Overall Success When:
- [ ] Integration test `test_complete_frontend_development_workflow` passes consistently
- [ ] Frontend_init is 5-10x faster than npm approach
- [ ] No more TypeScript installation race conditions
- [ ] Template approach is fully documented and maintainable

---

## Next Steps
1. Start with Phase 1: Create the golden template using our working frontend_init
2. Validate the template thoroughly
3. Proceed through phases systematically
4. Update this document as we learn and adjust the plan