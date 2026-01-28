# Library Extraction Plan - 2025-01-24

## Executive Summary

Extract `cc-agent` and `cc-tools` libraries from app-factory monorepo into separate private repositories while preserving all code changes through intelligent branch analysis. Create comprehensive version mappings for all branches, but only implement the change in the current branch (leonardo/timeless-weddings-enhanced-docs) as proof of concept.

## Key Decisions

### 1. Scope
- **Current Implementation**: Only leonardo/timeless-weddings-enhanced-docs branch
- **Version Mapping**: Complete mapping for ALL branches with library changes
- **Future Work**: Other branches can be updated later using the version mappings

### 2. Versioning Strategy
- **Version Scheme**: MINOR increments (1.0.0, 1.1.0, 1.2.0, etc.)
- **Rationale**: Most changes add functionality rather than just fixes
- **Starting Point**: 1.0.0 = main branch baseline

### 3. Branch Strategy
- **Extracted Libraries**: Tags only, no development branches
- **Version Tags**: Clean sequential versions (1.0.0, 1.1.0, etc.)
- **History**: Linear, clean history in extracted repos

### 4. Merge Handling
- **Strategy**: Latest-by-date wins
- **Implementation**: Most recent commit timestamp determines version precedence

## Execution Plan

### Phase 1: Branch Analysis
1. Scan all 33 branches for library changes
2. Identify unique changes by tree hash
3. Order changes chronologically
4. Generate version sequence for each library

**Expected Output**:
```
Branch Analysis Report:
- Total branches: 33
- Branches with cc_agent changes: X
- Branches with cc_tools changes: Y
- Unique cc_agent versions needed: Z
- Unique cc_tools versions needed: W
```

### Phase 2: Library Extraction

#### Extract cc-agent
```bash
# Clone for extraction
git clone . /tmp/cc-agent-extract
cd /tmp/cc-agent-extract

# Use git-filter-repo to extract cc-agent
git filter-repo \
  --path src/cc_agent \
  --path-rename src/cc_agent/: \
  --force

# Create repository structure
mkdir -p cc-agent-lib
cd cc-agent-lib
git init
```

#### Extract cc-tools
```bash
# Similar process for cc-tools
git clone . /tmp/cc-tools-extract
cd /tmp/cc-tools-extract

git filter-repo \
  --path src/cc_tools \
  --path-rename src/cc_tools/: \
  --force
```

### Phase 3: Version Tagging

Create tags for each unique version identified in Phase 1:

```bash
# In cc-agent-lib
git tag -a v1.0.0 <commit-hash> -m "main branch baseline"
git tag -a v1.1.0 <commit-hash> -m "feature/context-aware-agent-integration"
git tag -a v1.2.0 <commit-hash> -m "leonardo/timeless-weddings-enhanced-docs"
# ... continue for all versions
```

### Phase 4: Version Mapping Documentation

Create `VERSION_MAPPING.md` in each library:

#### cc-agent-lib/VERSION_MAPPING.md
```markdown
# cc-agent Version Mapping

| Version | App-Factory Branch | Key Changes | Date |
|---------|-------------------|-------------|------|
| 1.0.0 | main | Initial extraction baseline | 2025-01-24 |
| 1.1.0 | feature/context-aware-agent-integration | Added retry_handler.py, context improvements | 2025-01-XX |
| 1.2.0 | leonardo/timeless-weddings-enhanced-docs | Added docs/, MCP registry, CLAUDE.md | 2025-01-XX |
| 1.3.0 | feature/validated-agent-clean | Validation improvements | 2025-01-XX |
| ... | ... | ... | ... |

## Usage
To use a specific version in app-factory branch:
1. Check this mapping for your branch
2. Update pyproject.toml: `cc-agent = "^X.Y.Z"`
```

#### cc-tools-lib/VERSION_MAPPING.md
```markdown
# cc-tools Version Mapping

| Version | App-Factory Branch | Key Changes | Date |
|---------|-------------------|-------------|------|
| 1.0.0 | main | Initial extraction baseline | 2025-01-24 |
| 1.1.0 | feature/context-aware-agent-integration | Added route_testing, dalle servers | 2025-01-XX |
| 1.2.0 | leonardo/timeless-weddings-enhanced-docs | Added unsplash server, registry updates | 2025-01-XX |
| ... | ... | ... | ... |
```

### Phase 5: Update Current Branch Only

Update `leonardo/timeless-weddings-enhanced-docs` branch:

1. Remove library directories:
```bash
git rm -r src/cc_agent
git rm -r src/cc_tools
```

2. Update pyproject.toml:
```toml
[project]
dependencies = [
    "cc-agent==1.2.0",
    "cc-tools==1.2.0",
    # ... other dependencies
]

[tool.uv.sources]
cc-agent = { path = "../cc-agent-lib" }  # Local development initially
cc-tools = { path = "../cc-tools-lib" }  # Will move to CodeArtifact later
```

3. Test thoroughly

### Phase 6: Verification

1. **Code Preservation Check**
   - Diff extracted libraries against original
   - Ensure no code lost

2. **Functionality Test**
   - Run existing tests
   - Manual testing of key features

3. **Documentation**
   - Complete VERSION_MAPPING.md files
   - Document rollback procedure
   - Create migration guide for other branches

## Rollback Plan

If issues arise:

1. **Immediate Rollback**
```bash
git checkout leonardo/timeless-weddings-enhanced-docs
git revert HEAD  # Revert the library removal commit
```

2. **Re-add as Submodules** (Alternative)
```bash
git submodule add ../cc-agent-lib src/cc_agent
git submodule add ../cc-tools-lib src/cc_tools
```

## Success Criteria

- [ ] All library code preserved in extracted repos
- [ ] Complete version mapping for all branches documented
- [ ] Current branch successfully uses external libraries
- [ ] All tests pass
- [ ] Rollback procedure tested and documented

## Timeline

- **Day 1** (Today):
  - Branch analysis
  - Library extraction
  - Version tagging
  - Documentation
  - Current branch update
  - Testing

## Notes

- This is a proof of concept on one branch
- Other branches remain unchanged but have documented version mappings
- Future migration of other branches can use the VERSION_MAPPING.md as reference
- AWS CodeArtifact setup deferred to after successful local validation

---

*Document created: 2025-01-24*
*Status: READY FOR EXECUTION*