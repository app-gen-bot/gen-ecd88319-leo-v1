# Agent Optimization Notes

**Created**: 2025-12-18
**Purpose**: Track findings and optimization opportunities for Leo agents

---

## Generation Analysis: Todo App (2025-12-18)

### Test Configuration
- **App**: Simple todo app
- **Iterations**: 10
- **Model**: Claude Opus 4.5
- **Result**: Success (deployed to https://todo-app-teal.fly.dev/)

### Issues Observed

#### 1. PostgREST Schema Cache Stale
**Frequency**: Common
**Impact**: Causes seed script failures until agent works around it

**Current Behavior**: Agent encounters error, then modifies seed script to use Drizzle directly instead of Supabase client/PostgREST.

**Potential Optimization**:
- Add to agent prompts: "For database seeding, prefer Drizzle ORM direct inserts over Supabase client to avoid PostgREST cache issues"
- Or: Include cache refresh command in seed script template

#### 2. Iteration Count
**Observation**: 10 iterations for a simple todo app seems high

**Breakdown** (estimated from logs):
- BUILD phase: 3-4 iterations
- UI_QUALITY_GATE: 2-3 iterations (OKLCH color application)
- MVP_DEPLOY: 1-2 iterations
- TEST: 1-2 iterations

**Potential Optimization**: Review if UI Quality Gate prompts are clear enough about OKLCH requirements upfront

---

## Agents to Review

### 1. AppGeneratorAgent
**Location**: `leo-container/src/leo/agents/app_generator/`
**Config**: `config.py`
**Prompt**: `leo-container/src/leo/resources/agents/orchestrator/pipeline-prompt-v2.md`

**Review Items**:
- [ ] Model selection (currently Opus 4.5)
- [ ] Max turns (currently 1000)
- [ ] Allowed tools list
- [ ] Pipeline prompt clarity
- [ ] Phase transition logic

### 2. Subagents
**Location**: `leo-container/src/leo/agents/app_generator/subagents/`

**Review Items**:
- [ ] Identify all subagents
- [ ] Review each subagent's purpose
- [ ] Check for redundancy
- [ ] Validate tool access per subagent

### 3. Skills
**Location**: `~/.claude/skills/` (on container)

**Review Items**:
- [ ] List all skills available to agents
- [ ] Map skills to agent phases
- [ ] Identify unused skills
- [ ] Check for skill conflicts

### 4. MCP Tools
**Location**: Various MCP servers

**Current Tools** (from config.py):
- Chrome DevTools (browser automation)
- Build/Test verification
- Package management
- Dev server control
- CWD reporter
- Integration analyzer

**Review Items**:
- [ ] Tool usage patterns in logs
- [ ] Tools that cause issues (e.g., `take_snapshot` removed for buffer overflow)
- [ ] Missing tools that would help

---

## Path/Config Fixes Applied (2025-12-18)

### Fix 1: App Path Structure
**Problem**: Apps were being created at `/workspace/app/{app_name}/app/` instead of `/workspace/app/`
**Files Changed**:
- `leo-container/src/leo/agents/app_generator/agent.py`
- `leo-container/src/runtime/wsi/client.py`
- `leo-container/src/leo/agents/app_generator/README.md`
- `leo-container/src/leo/CLAUDE.md`
- `leo-container/src/runtime/managers/git_manager.py`
- `leo-container/src/leo/agents/app_generator/config.py`

### Fix 2: AWS Credentials Mount Path
**Problem**: Container user is `leo-user` (hyphen) but mount targeted `/home/leouser/.aws` (no hyphen)
**Files Changed**:
- `leo-saas/app/server/lib/wsi/container-manager.ts`
- `leo-saas/app/server/lib/orchestrator/docker-manager.ts`

---

## Tomorrow's Agenda

1. **Map the Agent Ecosystem**
   - Document all agents and their relationships
   - Create flow diagram of agent interactions

2. **Review Pipeline Prompt**
   - Read `pipeline-prompt-v2.md` thoroughly
   - Identify unclear instructions
   - Note any missing guidance (e.g., PostgREST workaround)

3. **Analyze Skills**
   - List all skills in `~/.claude/skills/`
   - Understand when each is invoked
   - Check for optimization opportunities

4. **Review MCP Tool Usage**
   - Which tools are used most?
   - Which tools cause problems?
   - What tools are missing?

5. **Identify Quick Wins**
   - Low-effort changes with high impact
   - Documentation improvements
   - Prompt clarifications

---

## Questions to Answer

1. Why does a simple todo app need 10 iterations?
2. Is the UI Quality Gate too strict or unclear?
3. Are there redundant validation steps?
4. Could any phases run in parallel?
5. What's the token cost per generation?
6. Which agent decisions slow things down most?
