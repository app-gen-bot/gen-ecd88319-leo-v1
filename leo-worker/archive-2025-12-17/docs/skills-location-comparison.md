# Skills Location: Comparison of Approaches

**Goal**: Enable Skills discovery for AppGeneratorAgent

---

## Option 1: Change CWD to Project Root

**Change**: `cwd = /Users/labheshpatel/apps/app-factory`

**Skills Location**: `/Users/labheshpatel/apps/app-factory/.claude/skills/` ✅

### Pros
- ✅ **Semantically Correct** - Skills at project/factory level (where they belong conceptually)
- ✅ **Scalable** - If you have multiple output directories, skills are centralized
- ✅ **Clean Architecture** - Skills for app generation at generation level, not output level
- ✅ **Follows Best Practices** - `.claude/` at project root is standard pattern

### Cons
- ❌ **1 Critical Fix Required** - Subagent write location must change (line 147)
- ❌ **2 Medium-Risk Areas** - MCP tools and file generation need testing/verification
- ❌ **Migration Steps** - Must move subagents AND update code
- ❌ **Rollback Complexity** - If anything breaks, need to revert code + move files back
- ❌ **Testing Burden** - Must verify 13 different impact areas

### Risk Assessment
- **Before Fixes**: 🔴 HIGH (subagents break, MCP tools uncertain)
- **After Fixes**: 🟡 MEDIUM (still need testing, rollback plan)
- **Confidence**: 60% (needs extensive testing)

### Required Changes
1. Move subagents: `apps/.claude/agents/` → `.claude/agents/`
2. Update code: `agent.py` lines 99, 147 (2 changes)
3. Test all 13 impact areas
4. Prepare rollback plan

---

## Option 2: Move Skills to apps/.claude/skills/

**Change**: None (just move files)

**Skills Location**: `/Users/labheshpatel/apps/app-factory/apps/.claude/skills/` ✅

### Pros
- ✅ **ZERO Code Changes** - No Python code modifications needed
- ✅ **ZERO Risk** - CWD stays the same, everything else unchanged
- ✅ **Simple Migration** - Just `mv` command
- ✅ **Instant Rollback** - Just `mv` files back if needed
- ✅ **No Testing Burden** - Skills either work or don't, nothing else affected
- ✅ **Subagents Unchanged** - Already at `apps/.claude/agents/`, no move needed
- ✅ **Same Discovery Pattern** - Skills and subagents both discovered from `{cwd}/.claude/`

### Cons
- ❌ **Semantically Weird** - Skills inside "apps output" directory (conceptually odd)
- ❌ **Not Standard** - `.claude/` usually at project root, not workspace level
- ⚠️ **Skills Apply to Factory** - These skills are for generating apps, not for individual apps
- ⚠️ **If apps/ Deleted** - Skills lost (but why would you delete workspace?)

### Risk Assessment
- **Risk Level**: 🟢 NEAR-ZERO
- **Confidence**: 95% (only risk is SDK not discovering, but same pattern as subagents)

### Required Changes
1. Move skills: `.claude/skills/` → `apps/.claude/skills/`
2. That's it!

---

## Option 3: Global Skills (~/.claude/skills/)

**Change**: Copy to global location

**Skills Location**: `~/.claude/skills/` ✅

### Pros
- ✅ **Available Everywhere** - Skills work in any project/directory
- ✅ **No Project Changes** - No files moved within project
- ✅ **Standard Location** - `~/.claude/skills/` is documented pattern

### Cons
- ❌ **Pollutes Global Namespace** - Skills available in ALL projects, not just app-factory
- ❌ **Not Project-Specific** - Can't version control skills with project
- ❌ **Duplication** - Must sync between projects if you have multiple
- ❌ **Unclear Ownership** - Are these "my skills" or "app-factory skills"?

### Risk Assessment
- **Risk Level**: 🟢 LOW
- **Confidence**: 90%

### Required Changes
1. Copy skills: `cp -r .claude/skills/* ~/.claude/skills/`
2. Keep project copy as backup

---

## Semantic Analysis

### What Are These Skills For?

Current skills in `.claude/skills/`:
- **drizzle-orm-setup** - Setting up Drizzle ORM for generated apps
- **storage-factory-validation** - Validating storage implementations
- **supabase-storage** - Supabase integration setup
- **type-safe-queries** - Query method decision helpers
- **supabase-full-stack** - Complete Supabase stack setup

**Purpose**: These skills are for the **AppGeneratorAgent** to use when **GENERATING** apps.
**NOT for**: Working on individual apps after generation.

### Directory Structure Context

```
app-factory/                         # Project root
├── .claude/
│   ├── skills/                      # ← Option 1: Factory-level skills (semantically correct)
│   └── agents/                      # Subagents (if moved here)
│
├── apps/                            # Agent workspace (current cwd)
│   ├── .claude/
│   │   ├── agents/                  # ← Current: Subagents for app generation
│   │   └── skills/                  # ← Option 2: Skills for app generation (pragmatic)
│   │
│   ├── todo-app/
│   │   └── app/
│   │       ├── client/
│   │       ├── server/
│   │       └── .claude/             # ← Future: Skills for working ON todo-app
│   │           └── skills/          #   (different purpose than factory skills)
│   │
│   └── marketplace/
│       └── app/
│           └── .claude/
│               └── skills/
```

### Semantic Question

**Where should "app generation" skills live?**

**Argument for Project Root (.claude/skills/)**:
- App generation is a project-level concern
- Skills are part of the factory's capabilities
- Factory code is at root, skills should be too
- Standard pattern: `.claude/` at project root

**Argument for Workspace (apps/.claude/skills/)**:
- Agent operates in `apps/` workspace
- Skills are tools available in that workspace
- Subagents are already at `apps/.claude/agents/`
- Pragmatic: "where the agent works"

**Verdict**: **Semantically, Option 1 is correct**. But pragmatically, Option 2 works fine.

---

## Practical Considerations

### Developer Experience

**Option 1** (Project Root):
```bash
# To add a skill:
cd /Users/labheshpatel/apps/app-factory
mkdir -p .claude/skills/my-new-skill
vim .claude/skills/my-new-skill/skill.md

# To see skills:
ls .claude/skills/
```

**Option 2** (Workspace):
```bash
# To add a skill:
cd /Users/labheshpatel/apps/app-factory
mkdir -p apps/.claude/skills/my-new-skill
vim apps/.claude/skills/my-new-skill/skill.md

# To see skills:
ls apps/.claude/skills/
```

**Difference**: Negligible. Just one extra `apps/` in the path.

### Version Control

Both options version control the same way:
```bash
# .gitignore doesn't exclude .claude/
git add .claude/skills/  # Option 1
git add apps/.claude/skills/  # Option 2
```

### CI/CD

If you deploy the factory:
- Option 1: Skills at root (clearly part of factory)
- Option 2: Skills in apps/ (less obvious, but works)

### Multi-Workspace Scenario

If you later add `templates/` or `examples/` workspaces:

**Option 1**:
```
.claude/skills/  # ← Shared across all workspaces
apps/
templates/
examples/
```

**Option 2**:
```
apps/.claude/skills/       # ← Only for apps/ workspace
templates/.claude/skills/  # ← Need separate copy?
examples/.claude/skills/   # ← Need separate copy?
```

**Winner**: Option 1 for multi-workspace scenarios.

But currently you only have `apps/` workspace, so not a concern.

---

## Recommendation Matrix

| Criterion | Option 1 (Project Root) | Option 2 (Workspace) | Option 3 (Global) |
|-----------|------------------------|---------------------|-------------------|
| **Simplicity** | 🔴 Complex (code + files) | 🟢 Simple (just files) | 🟢 Simple (just copy) |
| **Risk** | 🟡 Medium (needs testing) | 🟢 Near-zero | 🟢 Low |
| **Semantic Correctness** | 🟢 Correct | 🟡 Acceptable | 🔴 Wrong (too global) |
| **Rollback** | 🔴 Complex | 🟢 Trivial | 🟢 Easy |
| **Scalability** | 🟢 Best | 🟡 OK (single workspace) | 🔴 Poor (global pollution) |
| **Testing Burden** | 🔴 High (13 areas) | 🟢 None (just verify discovery) | 🟢 Low |
| **Long-term Maintainability** | 🟢 Best | 🟡 OK | 🔴 Confusing ownership |

---

## Decision Framework

### Choose Option 1 (Project Root) if:
- ✅ You value architectural correctness
- ✅ You plan to add more workspaces (templates/, examples/)
- ✅ You have time to test thoroughly
- ✅ You're comfortable with medium-risk changes
- ✅ You want the "right" solution

### Choose Option 2 (Workspace) if:
- ✅ You want the fastest, safest solution
- ✅ You're risk-averse
- ✅ You only have one workspace (apps/)
- ✅ You want zero code changes
- ✅ You can accept "good enough" over "perfect"
- ✅ **You want to ship today instead of next week**

### Choose Option 3 (Global) if:
- ✅ You want skills available in all projects
- ⚠️ But: Probably NOT what you want for project-specific skills

---

## Recommendation

**For Your Situation: Choose Option 2 (Workspace)**

### Why?

1. **Risk/Benefit Analysis**
   - Option 1 benefit: Semantic correctness
   - Option 1 cost: Testing burden, rollback complexity, medium risk
   - Option 2 benefit: Skills work immediately, zero risk
   - Option 2 cost: Slightly weird semantically
   - **Verdict**: Option 2's benefits outweigh costs

2. **Pragmatic Engineering**
   - "Perfect is the enemy of good"
   - Skills at `apps/.claude/skills/` works perfectly fine
   - Subagents are already at `apps/.claude/agents/` (precedent exists)
   - No user-facing difference

3. **Time to Value**
   - Option 1: 2-4 hours (changes + testing + potential debugging)
   - Option 2: 2 minutes (just move files)

4. **Reversibility**
   - If you later decide Option 1 is better, you can migrate
   - But once you have working skills, the motivation to change decreases

5. **Current Needs**
   - You only have one workspace (apps/)
   - No immediate need for multi-workspace support
   - YAGNI principle applies

### Implementation

```bash
# Simple 2-minute solution:
mkdir -p /Users/labheshpatel/apps/app-factory/apps/.claude/skills
mv /Users/labheshpatel/apps/app-factory/.claude/skills/* \
   /Users/labheshpatel/apps/app-factory/apps/.claude/skills/

# Verify structure
ls -la /Users/labheshpatel/apps/app-factory/apps/.claude/
# Should show:
# - agents/
# - skills/

# Test
uv run python run-app-generator.py "Create a test app" --app-name test-skills
# Check logs for skills discovery
```

**If it doesn't work** (unlikely, but possible):
```bash
# Rollback in 10 seconds:
mv /Users/labheshpatel/apps/app-factory/apps/.claude/skills/* \
   /Users/labheshpatel/apps/app-factory/.claude/skills/
```

---

## Future Migration Path

If you later want to move to Option 1 (project root):

1. Already have the impact analysis document
2. Already know the required fixes
3. Can schedule it for low-priority time
4. Skills will work in both locations during migration

This means **Option 2 doesn't lock you in** - it's a stepping stone.

---

## Final Answer

**Move skills to `apps/.claude/skills/`** ✅

**Reasoning**:
- 🟢 Zero risk
- 🟢 Zero code changes
- 🟢 2-minute implementation
- 🟢 Trivial rollback
- 🟡 Semantically acceptable (precedent: subagents already there)
- 🟢 Gets you working skills TODAY

**Long-term**: If you add more workspaces or want cleaner architecture, migrate to project root later. But for now, this is the **smart, pragmatic choice**.
