---
name: golden-merge
description: >
  Merge files from golden branch (forensics-migration-refactor) into jake/leo-cleanup.
  Use this skill when syncing prompt/skill/pattern updates from the golden branch.
category: maintenance
priority: P2
---

# Golden Branch Merge

## Repository Locations

```
Golden branch:  repos/leo-container-golden/  (forensics-migration-refactor)
Target branch:  repos/app-factory/leo-container/  (jake/leo-cleanup)
```

The golden branch is a git worktree created via:
```bash
cd repos/app-factory
git worktree add ../leo-container-golden forensics-migration-refactor
```

---

## Path Mappings (Golden → Jake)

### Pattern Files
```
docs/patterns/ai_integration/     → src/leo/agents/app_generator/subagents/ai_integration/patterns/
docs/patterns/code_writer/        → src/leo/agents/app_generator/subagents/code_writer/patterns/
docs/patterns/error_fixer/        → src/leo/agents/app_generator/subagents/error_fixer/patterns/
docs/patterns/quality_assurer/    → src/leo/agents/app_generator/subagents/quality_assurer/patterns/
docs/patterns/api_architect/      → src/leo/agents/app_generator/subagents/code_writer/patterns/  (merged)
```

### Skills
```
apps/.claude/skills/              → .claude/skills/
```

### Agents
```
.claude/agents/                   → .claude/agents/  (same path, but content has path transforms)
```

### Prompts
```
prompts/                          → src/leo/agents/reprompter/
docs/pipeline-prompt-v2.md        → src/leo/agents/app_generator/pipeline-prompt-v2.md
```

### Resources
```
src/leo/resources/                → src/leo/resources/  (same)
```

---

## Content Path Transforms

Golden branch has Labhesh's local paths. Jake branch uses container paths.

| Golden (Labhesh's local) | Jake (container) |
|--------------------------|------------------|
| `/Users/labheshpatel/apps/app-factory/docs/patterns/` | `/factory/leo/agents/app_generator/subagents/*/patterns/` |
| `/Users/labheshpatel/apps/app-factory/` | `/factory/` |

When merging files, these path references inside the content need to be transformed.

---

## Merge Process

### Step 1: Run map-and-diff
```bash
cd repos/app-factory/leo-container
python scripts/map-and-diff.py
```

This shows:
- Exact matches (same path)
- Known mappings (restructured paths)
- Similar path matches
- Content differences

### Step 2: Review differences
- **>95% similarity**: Usually just path transforms, safe to skip
- **83-95% similarity**: May have content additions, review diffs
- **<50% similarity**: Likely wrong match, treat as separate files

### Step 3: For each file to merge
```bash
# Show diff
diff golden_file jake_file

# If only path transforms needed, copy and sed
cp golden_file jake_file
sed -i '' 's|/Users/labheshpatel/apps/app-factory/docs/patterns/|/factory/leo/agents/app_generator/subagents/.../patterns/|g' jake_file
```

### Step 4: Validate
```bash
python scripts/validate-paths.py
python scripts/audit-md-files.py
```

---

## Gotchas Discovered

### 1. SUPABASE_SETUP_COMPLETE (Removed from golden)
Golden had a pattern for pre-injecting Supabase pool credentials. Jake branch removed it:
- Skill file had "Step 0: Check for Pre-configured Credentials" - REMOVED
- wsi/client.py wrote `SUPABASE_SETUP_COMPLETE=true` to .env - NEEDS CLEANUP

**Current behavior**: Agent creates Supabase project during generation. For Resume, .env is restored from saved env vars.

### 2. Generic Filenames
Files like `SKILL.md`, `CLAUDE.md`, `README.md` exist in multiple locations. Match by path structure, not filename.

### 3. apps/ Directory
Golden has `apps/` with generated app examples. These are NOT part of leo-container - skip them.

### 4. Archive Files
Both branches have archive directories. Don't merge archive content.

---

## Validation Scripts

### validate-paths.py
Extracts .md references from code, validates they exist. Distinguishes:
- Leo-container references (validate)
- Generated-app references (skip)

### audit-md-files.py
Compares referenced .md files vs actual files. Reports:
- Missing (broken paths)
- Unreferenced (orphaned files)

### map-and-diff.py
Maps jake files to golden counterparts. Shows:
- Match type (exact, mapped, similar-path, filename-only)
- Similarity percentage
- Content differences after path normalization

---

## Remaining Work (as of 2026-01-06)

- [ ] Clean up `wsi/client.py` SUPABASE_SETUP_COMPLETE code
- [ ] Review `.claude/skills/code-writer/SKILL.md` additions (Server Mounting pattern)
- [ ] Review `.claude/skills/api-architect/SKILL.md` additions (relative URLs)
- [ ] Verify path transforms in agent files are correct
- [ ] Update map-and-diff.py for new repo location (repos/leo-container-golden/)
