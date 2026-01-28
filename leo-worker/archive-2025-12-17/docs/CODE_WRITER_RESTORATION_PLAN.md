# code_writer Subagent Restoration Plan

**Date**: 2025-11-23
**Status**: 📋 PLAN READY - Awaiting Execution
**Approach**: Hybrid (Subagent + Skill)

---

## Executive Summary

Restore code_writer as a **subagent** while keeping the **skill**, creating a hybrid approach where:
- **Subagent**: For AppGeneratorAgent to delegate code implementation tasks
- **Skill**: For teaching patterns before generation (agent reads and learns)

### The Problem

AppGeneratorAgent has enormous tasks and prefers delegation. Without a code_writer **subagent**, it may delegate to inappropriate agents (research_agent, quality_assurer) or fail to find a suitable delegate for code implementation.

### The Solution

Restore code_writer.py from commit **e7f47b46** (right before migration) and re-register it as an available subagent while keeping the skill for pattern teaching.

---

## Migration History

### Timeline

| Date | Commit | Action | Status |
|------|--------|--------|--------|
| Nov 18, 10:12 AM | e7f47b46 | Analysis document (recommended KEEP as subagent) | Superseded |
| Nov 18, 11:01 AM | 9a96bca0 | Migrated to skill | To be partially reverted |
| Nov 21 | 54c8a9a2 | ui_designer also migrated to skill | Related |
| Nov 23 | Current | Investigation complete | Restoration needed |

### What Was Changed in 9a96bca0

**Files Removed/Deprecated**:
- `src/.../subagents/code_writer.py` → moved to `deprecated/code_writer.py.deprecated`
- Deregistered from `__init__.py`

**Files Created**:
- `~/.claude/skills/code-writer/SKILL.md` (536 lines)
- `apps/.claude/skills/code-writer/SKILL.md` (copy)

**Documentation**:
- `docs/CODE_WRITER_DEEP_ANALYSIS.md`
- `docs/CODE_WRITER_TO_SKILL_MIGRATION_SUMMARY.md`

**Pipeline Changes**:
- Updated `docs/pipeline-prompt.md` (5 locations)

---

## Restoration Steps

### Phase 1: Restore Subagent File (5 min)

**Step 1.1**: Extract code_writer.py from pre-migration commit
```bash
# Get the file from commit e7f47b46 (right before migration)
git show e7f47b46:src/app_factory_leonardo_replit/agents/app_generator/subagents/code_writer.py > /tmp/code_writer_restored.py

# Verify it's complete
wc -l /tmp/code_writer_restored.py
# Expected: ~1,100 lines

# Check it has AgentDefinition
grep "AgentDefinition" /tmp/code_writer_restored.py
# Expected: code_writer = AgentDefinition(...)
```

**Step 1.2**: Copy to subagents directory
```bash
# Copy restored file
cp /tmp/code_writer_restored.py \
   src/app_factory_leonardo_replit/agents/app_generator/subagents/code_writer.py

# Verify it's in place
ls -lh src/app_factory_leonardo_replit/agents/app_generator/subagents/code_writer.py
```

**Step 1.3**: Keep backup for reference
```bash
# The existing backup remains for history
ls -lh src/app_factory_leonardo_replit/agents/app_generator/subagents/code_writer.py.backup
# This shows we have both restored version and original backup
```

---

### Phase 2: Re-register Subagent (3 min)

**Step 2.1**: Update `__init__.py` to import code_writer
```python
# File: src/app_factory_leonardo_replit/agents/app_generator/subagents/__init__.py

# CHANGE THIS:
# DEPRECATED: code_writer converted to skill (2025-11-18)
# See: ~/.claude/skills/code-writer/SKILL.md
# from .code_writer import code_writer

# TO THIS:
from .code_writer import code_writer

# And update the deprecation comment:
"""
DEPRECATED SUBAGENTS:
- schema_designer (2025-11-18): Converted to skill (schema-designer)
  See: ~/.claude/skills/schema-designer/SKILL.md
- api_architect (2025-11-18): Converted to skill (api-architect)
  See: ~/.claude/skills/api-architect/SKILL.md
- ui_designer (2025-11-21): Converted to skill (ui-designer)
  See: ~/.claude/skills/ui-designer/SKILL.md

HYBRID (SUBAGENT + SKILL):
- code_writer (2025-11-23): Restored as subagent, kept skill
  Subagent: For delegation from AppGeneratorAgent
  Skill: For pattern teaching (code-writer)
  See: docs/CODE_WRITER_RESTORATION_PLAN.md
"""
```

**Step 2.2**: Re-add to __all__ exports
```python
__all__ = [
    "research_agent",
    "code_writer",      # ✅ RESTORED - Hybrid approach
    "quality_assurer",
    "error_fixer",
    "ai_integration",
    "get_all_subagents",
    "get_subagent",
]
```

**Step 2.3**: Re-add to get_all_subagents()
```python
def get_all_subagents():
    """Get all available subagents as a dictionary."""
    return {
        "research_agent": research_agent,
        "code_writer": code_writer,          # ✅ RESTORED
        "quality_assurer": quality_assurer,
        "error_fixer": error_fixer,
        "ai_integration": ai_integration,
    }
```

---

### Phase 3: Update Pipeline Documentation (5 min)

**Step 3.1**: Update docs/pipeline-prompt.md

**Location 1**: Subagents description (around line 376)
```markdown
# CHANGE FROM:
Skills teach patterns before generation

# TO:
Subagents handle specialized tasks with isolated context.
Skills teach patterns before generation.
```

**Location 2**: Available subagents list (around lines 1595-1605)
```markdown
Available Subagents:
1. **research_agent**: Research and planning
2. **code_writer**: Write production code (backend routes, frontend pages)
3. **quality_assurer**: Validate code quality and correctness
4. **error_fixer**: Fix errors and resolve issues
5. **ai_integration**: AI features and intelligent behaviors

Available Skills:
1. **schema-designer**: Design type-safe schemas
2. **api-architect**: Design RESTful APIs
3. **code-writer**: Teach code patterns and best practices
4. **ui-designer**: Design beautiful dark mode UIs
5. ...
```

**Location 3**: When to use code_writer (around lines 1684-1689)
```markdown
# CHANGE FROM:
Invoke code-writer skill for production code implementation

# TO:
**For Code Implementation**: Use code_writer subagent
- Task("Write backend routes for users", ..., subagent="code_writer")
- Task("Create UsersPage component", ..., subagent="code_writer")
- Handles: Backend routes, frontend pages, storage methods

**For Pattern Teaching**: Invoke code-writer skill before generation
- Skill("code-writer") - Teaches storage completeness, ESM imports, etc.
- Agent learns patterns, then implements using subagent
```

**Location 4**: Delegation examples (around line 1781)
```markdown
# CHANGE FROM:
Skill("code-writer")

# TO:
Task("Implement backend routes", ..., subagent="code_writer")
# OR
Skill("code-writer")  # Teach patterns first, then Task() for implementation
```

**Location 5**: Delegation mandate (around lines 1720-1724)
```markdown
When delegating code implementation:
1. Invoke code-writer skill FIRST (teach patterns)
2. Then Task() to code_writer subagent (implement with learned patterns)
3. Ensures code follows all 8 critical patterns

Example workflow:
Skill("code-writer")  # Learn patterns
Task("Implement UsersPage", ..., subagent="code_writer")  # Apply patterns
```

---

### Phase 4: Create Hybrid Documentation (5 min)

**Step 4.1**: Update CODE_WRITER_RESTORATION_PLAN.md (this file)

Mark as "✅ EXECUTED" when complete.

**Step 4.2**: Create docs/CODE_WRITER_HYBRID_APPROACH.md
```markdown
# code_writer Hybrid Approach

## Why Both Subagent and Skill?

**Problem**: AppGeneratorAgent needs to delegate code implementation but was
delegating to inappropriate agents (research_agent, quality_assurer) when
code_writer subagent wasn't available.

**Solution**: Hybrid approach with both subagent and skill.

### Subagent (For Delegation)

**Purpose**: Handle delegated code implementation tasks from AppGeneratorAgent

**When AppGeneratorAgent Uses**:
- User asks to implement backend routes
- User asks to create frontend pages
- User asks to add storage methods
- Task requires actual code writing (not just planning)

**Usage**:
Task("Write UsersPage component", ..., subagent="code_writer")

**Benefits**:
- Isolated context for focused implementation
- Specialized tools (Write, Edit, Bash, TodoWrite)
- Can iterate independently
- AppGeneratorAgent can delegate cleanly

### Skill (For Pattern Teaching)

**Purpose**: Teach code patterns before generation

**When AppGeneratorAgent Invokes**:
- Before starting code implementation
- When agent needs to learn patterns
- To ensure consistent code quality

**Usage**:
Skill("code-writer")  # Agent reads and learns patterns

**Benefits**:
- Agent learns 8 critical patterns
- Templates and workflows embedded
- Common mistakes list
- Time-saving best practices

### Recommended Workflow

1. **Teach Patterns** (Skill):
   ```
   Skill("code-writer")
   ```
   Agent learns: Storage completeness, ESM imports, auth helpers, etc.

2. **Implement Code** (Subagent):
   ```
   Task("Implement backend routes for users", ..., subagent="code_writer")
   ```
   Subagent applies learned patterns in isolated context.

3. **Validate** (Subagent):
   ```
   Task("Validate generated code", ..., subagent="quality_assurer")
   ```

### Pattern Files (Shared Resource)

Both subagent and skill reference:
```
docs/patterns/code_writer/
├── STORAGE_COMPLETENESS.md
├── INTERACTIVE_STATE.md
├── ESM_IMPORTS.md
├── AUTH_HELPERS.md
├── WOUTER_ROUTING.md
├── ID_FLEXIBILITY.md
├── TS_REST_V3_API.md
├── REACT_QUERY_PROVIDER.md
└── ... (16 files total, ~107KB)
```

### No Conflict

**Subagent**: Longer prompt (1,041 lines) with all 16 pattern files inlined
**Skill**: Shorter prompt (536 lines) with 8 core patterns + templates

Both valid for their respective use cases. No duplication concerns.
```

---

### Phase 5: Verification (5 min)

**Step 5.1**: Verify Python imports work
```bash
cd src/app_factory_leonardo_replit
python3 -c "
from agents.app_generator.subagents import code_writer
print('✅ code_writer import successful')
print(f'Type: {type(code_writer)}')
print(f'Description: {code_writer.description}')
"

# Expected output:
# ✅ code_writer import successful
# Type: <class 'agents.app_generator.subagents.research_agent.AgentDefinition'>
# Description: Write production-ready TypeScript/React code
```

**Step 5.2**: Verify subagent registry
```bash
python3 -c "
from agents.app_generator.subagents import get_all_subagents
subagents = get_all_subagents()
print('Available subagents:')
for name in subagents.keys():
    print(f'  - {name}')
print(f'✅ Total: {len(subagents)} subagents')
print(f'✅ code_writer present: {\"code_writer\" in subagents}')
"

# Expected output:
# Available subagents:
#   - research_agent
#   - code_writer
#   - quality_assurer
#   - error_fixer
#   - ai_integration
# ✅ Total: 5 subagents
# ✅ code_writer present: True
```

**Step 5.3**: Verify skill still exists
```bash
# Check skill files
test -f ~/.claude/skills/code-writer/SKILL.md && echo "✅ Skill exists in ~/.claude/skills"
test -f apps/.claude/skills/code-writer/SKILL.md && echo "✅ Skill exists in apps/.claude/skills"

# Check skill size
wc -l ~/.claude/skills/code-writer/SKILL.md
# Expected: 536 lines
```

**Step 5.4**: Test AppGeneratorAgent can access both
```bash
cd src/app_factory_leonardo_replit
python3 << 'EOF'
from agents.app_generator import AppGeneratorAgent

# Create agent instance
agent = AppGeneratorAgent()

# Check subagent access
print("Testing subagent access...")
subagents = agent._get_subagents()  # Internal method
if "code_writer" in subagents:
    print("✅ code_writer subagent accessible")
else:
    print("❌ code_writer subagent NOT accessible")

# Check skill access
print("\nTesting skill access...")
# Skills are in ~/.claude/skills/code-writer/SKILL.md
import os
skill_path = os.path.expanduser("~/.claude/skills/code-writer/SKILL.md")
if os.path.exists(skill_path):
    print("✅ code-writer skill accessible")
else:
    print("❌ code-writer skill NOT accessible")

print("\n✅ Hybrid approach verified!")
EOF
```

---

### Phase 6: Testing (10 min)

**Step 6.1**: Test subagent delegation
```bash
# Create test script
cat > /tmp/test_code_writer_delegation.py << 'EOF'
from agents.app_generator import AppGeneratorAgent
import asyncio

async def test_delegation():
    agent = AppGeneratorAgent()

    # Test that code_writer is available for delegation
    subagents = agent._get_subagents()

    assert "code_writer" in subagents, "code_writer not in subagents!"

    print("✅ code_writer subagent available for delegation")
    print(f"   Description: {subagents['code_writer'].description}")

    # Don't actually run generation (too expensive)
    # Just verify delegation target exists

asyncio.run(test_delegation())
EOF

uv run python /tmp/test_code_writer_delegation.py
```

**Step 6.2**: Test skill invocation
```bash
# Verify skill can be read
test -f ~/.claude/skills/code-writer/SKILL.md && \
  head -20 ~/.claude/skills/code-writer/SKILL.md && \
  echo "✅ Skill file readable"
```

**Step 6.3**: Test pattern files still accessible
```bash
# Verify pattern files exist
ls -lh docs/patterns/code_writer/ | tail -10
echo "✅ Pattern files accessible: $(ls docs/patterns/code_writer/ | wc -l) files"
```

---

### Phase 7: Git Commit (2 min)

**Step 7.1**: Stage changes
```bash
git add src/app_factory_leonardo_replit/agents/app_generator/subagents/code_writer.py
git add src/app_factory_leonardo_replit/agents/app_generator/subagents/__init__.py
git add docs/pipeline-prompt.md
git add docs/CODE_WRITER_RESTORATION_PLAN.md
git add docs/CODE_WRITER_HYBRID_APPROACH.md
```

**Step 7.2**: Commit with detailed message
```bash
git commit -m "restore: Bring back code_writer subagent (hybrid with skill)

Restore code_writer as subagent while keeping skill, creating hybrid approach
for optimal delegation and pattern teaching.

## Problem

AppGeneratorAgent needs to delegate code implementation tasks but was unable
to find appropriate subagent when code_writer was converted to skill-only.
Without code_writer subagent, agent might delegate to inappropriate targets
(research_agent, quality_assurer) or fail to delegate cleanly.

## Solution: Hybrid Approach

**Subagent** (For Delegation):
- Handles delegated code implementation from AppGeneratorAgent
- Task(\"Write backend routes\", ..., subagent=\"code_writer\")
- Isolated context, specialized tools, can iterate independently

**Skill** (For Pattern Teaching):
- Teaches 8 critical patterns before generation
- Skill(\"code-writer\") - Agent reads and learns
- Templates, workflows, common mistakes

## Changes

### Subagent Restoration
- Restored code_writer.py from commit e7f47b46 (pre-migration)
- Re-registered in subagents/__init__.py
- Re-added to get_all_subagents() registry
- Updated deprecation comments to document hybrid approach

### Pipeline Updates
- Updated docs/pipeline-prompt.md (5 locations)
- Clarified when to use subagent vs skill
- Added recommended workflow (Skill → Task → Validate)

### Documentation
- docs/CODE_WRITER_RESTORATION_PLAN.md: Complete restoration plan
- docs/CODE_WRITER_HYBRID_APPROACH.md: Hybrid usage guide
- Updated deprecation notices with hybrid explanation

## Benefits

- ✅ Clean delegation from AppGeneratorAgent
- ✅ Isolated context for code implementation
- ✅ Pattern teaching via skill (agent learns before coding)
- ✅ No conflicts (both serve different purposes)
- ✅ Consistent with other subagents (quality_assurer, error_fixer)

## Verification

- [x] code_writer imports successfully
- [x] Registered in get_all_subagents()
- [x] Skill still accessible
- [x] Pattern files preserved
- [x] AppGeneratorAgent can delegate to code_writer

## Related

- Original migration: 9a96bca0 (2025-11-18)
- Investigation: docs/CODE_WRITER_INVESTIGATION_FINDINGS.md
- Reversion plan: docs/CODE_WRITER_REVERSION_PLAN.md (superseded by this)
"
```

---

## Summary of Approach

### Current State (After Migration)
- code_writer: ❌ Subagent (deprecated)
- code_writer: ✅ Skill (active)
- Problem: No delegation target for code implementation

### Target State (After Restoration)
- code_writer: ✅ Subagent (restored) - For delegation
- code_writer: ✅ Skill (kept) - For pattern teaching
- Solution: Hybrid approach serving both needs

### Key Files

| File | Status | Purpose |
|------|--------|---------|
| `subagents/code_writer.py` | ✅ Restored | Subagent implementation |
| `subagents/__init__.py` | ✅ Updated | Registry with code_writer |
| `~/.claude/skills/code-writer/SKILL.md` | ✅ Kept | Pattern teaching |
| `apps/.claude/skills/code-writer/SKILL.md` | ✅ Kept | Copy for apps |
| `docs/patterns/code_writer/*.md` | ✅ Kept | 16 pattern files |
| `docs/pipeline-prompt.md` | ✅ Updated | Usage guidelines |

---

## Rollback Plan (If Needed)

If hybrid approach causes issues:

```bash
# 1. Remove subagent
mv src/.../subagents/code_writer.py \
   src/.../subagents/code_writer.py.backup

# 2. Revert __init__.py
git checkout HEAD~1 src/.../subagents/__init__.py

# 3. Revert pipeline-prompt.md
git checkout HEAD~1 docs/pipeline-prompt.md

# 4. Commit rollback
git commit -m "revert: Remove code_writer subagent (skill-only approach)"

# Skill remains intact, back to skill-only approach
```

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Restore subagent file | 5 min | Pending |
| 2. Re-register subagent | 3 min | Pending |
| 3. Update pipeline docs | 5 min | Pending |
| 4. Create hybrid docs | 5 min | Pending |
| 5. Verification | 5 min | Pending |
| 6. Testing | 10 min | Pending |
| 7. Git commit | 2 min | Pending |
| **TOTAL** | **35 min** | **0% Complete** |

---

## Risk Assessment

### Low Risk
- ✅ Original code_writer.py preserved in git history (commit e7f47b46)
- ✅ Pattern files already exist and working
- ✅ Skill continues to work independently
- ✅ No conflicts (subagent and skill serve different purposes)
- ✅ Easy rollback if needed

### Potential Issues
- ⚠️ Import errors if code_writer.py has dependencies that changed
- ⚠️ Pipeline might need prompt adjustments if agent behavior changes
- ⚠️ Need to verify APP_FACTORY_ROOT path still works

### Mitigation
- Test imports immediately after restoration
- Verify pattern file paths resolve correctly
- Run verification scripts before committing
- Keep detailed rollback instructions

---

## Success Criteria

- [ ] code_writer.py restored from commit e7f47b46
- [ ] Imports successfully from subagents/__init__.py
- [ ] Appears in get_all_subagents() registry
- [ ] AppGeneratorAgent can access for delegation
- [ ] Skill still works independently
- [ ] Pattern files still accessible
- [ ] Pipeline documentation updated
- [ ] Verification tests pass
- [ ] Git committed with detailed message

---

## Next Steps

1. **Review this plan** - Ensure approach makes sense
2. **Execute Phase 1** - Restore subagent file
3. **Execute Phase 2** - Re-register subagent
4. **Execute Phase 3** - Update pipeline docs
5. **Execute Phase 4** - Create hybrid docs
6. **Execute Phase 5** - Verification
7. **Execute Phase 6** - Testing
8. **Execute Phase 7** - Git commit
9. **Monitor** - Watch for delegation behavior in next app generation

---

**Document Status**: 📋 PLAN READY - Awaiting Execution
**Author**: Claude Code Analysis
**Date**: 2025-11-23
**Estimated Time**: 35 minutes
**Risk Level**: Low
**Rollback Available**: Yes
