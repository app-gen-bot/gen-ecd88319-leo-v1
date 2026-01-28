# Leo Container File Structure - Working Analysis

**Purpose**: Analyze current file structure, identify duplication, plan rationalization.

> **Status**: Working document. Final design will be merged into `target-container-file-structure.md`.

---

## Terminology: Leo vs Claude Code

**CRITICAL**: We use terms inconsistently. This causes confusion.

| Leo Term | Claude Code Term | Definition |
|----------|------------------|------------|
| **Orchestrator** | Main Agent | AppGeneratorAgent - the main agent running the pipeline |
| **Outer Loop** | N/A | ReprompterAgent - decides what task to do next across iterations |
| **Subagent** (Python) | **Subagent** (SDK) | `AgentDefinition` passed to `query(options: { agents: {...} })` |
| **Subagent** (Markdown) | **Agent** (filesystem) | `.claude/agents/{name}.md` - filesystem-based definition |
| **Skill** (Leo usage) | N/A | SKILL.md file we manually read via prompt instructions |
| **Skill** (Claude formal) | **Skill** | Model-invoked capability from `.claude/skills/` (auto-discovered) |
| **Pattern** | N/A | `docs/patterns/{agent}/*.md` - detailed implementation guides |
| **Pipeline Prompt** | System Prompt | `docs/pipeline-prompt-v2.md` - main orchestration instructions |
| **Master Plan** | N/A | `docs/reprompter-master-plan.md` - strategic guidance for reprompter |
| **MCP Tool** | **MCP Tool** | External capability via Model Context Protocol |

---

## Claude Agent SDK - Subagent Mechanism (CRITICAL)

> Source: [Claude Agent SDK Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents)

### Two Ways to Define Subagents

The Claude Agent SDK supports **TWO** subagent definition methods:

| Method | Location | Leo Uses? | Priority |
|--------|----------|-----------|----------|
| **Programmatic** | `query(options: { agents: {...} })` | Yes (Python) | **Higher** |
| **Filesystem** | `.claude/agents/*.md` | Yes (also) | Lower |

**CRITICAL**: Programmatically defined agents **TAKE PRECEDENCE** over filesystem-based agents with the same name.

### AgentDefinition Type (SDK Official)

```typescript
interface AgentDefinition {
  description: string;  // Required - when to use this agent
  prompt: string;       // Required - system prompt for the agent
  tools?: string[];     // Optional - tool restrictions
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';  // Optional
}
```

### What Leo Does

Leo defines subagents in Python using `AgentDefinition` dataclass:

```python
# src/.../subagents/code_writer.py
code_writer = AgentDefinition(
    description="Write production-ready TypeScript/React code",
    prompt="You MUST complete the code implementation task...",
    tools=["Read", "Write", "Edit", "TodoWrite", "Bash", ...],
    model="claude-opus-4-5"
)
```

These are passed to `cc_agent.Agent(agents=...)` which uses the SDK's programmatic mechanism.

### Redundancy Issue

Leo ALSO has `.claude/agents/code_writer.md` (filesystem). Since programmatic takes precedence, **the markdown files may be ignored** when Python definitions exist!

**Verification needed**: Are the markdown files even being used?

---

## Key Insight: Two Different "Skill" Mechanisms

**Claude Code Skills (Formal)**:
- Location: `.claude/skills/{name}/SKILL.md`
- Discovery: **Model-invoked** - Claude autonomously decides when to use based on `description`
- Loading: Auto-discovered and read when task matches
- Requirement: YAML frontmatter with `name`, `description`

**Leo's Skill Usage (Manual)**:
- Location: Same directory structure
- Discovery: **Prompt-directed** - we explicitly say "Read SKILL.md BEFORE..."
- Loading: Manual file read via `Read` tool
- Reality: We're NOT using Claude's auto-discovery, just file storage

**Implication**: We could put skill files ANYWHERE since we read them manually. The `.claude/skills/` location is coincidental, not leveraging Claude's discovery.

---

## Claude Skills: Directory Structure & Dual-Mode Compatibility

### Claude's Formal Skill Directory Structure

```
.claude/skills/
└── skill-name/
    ├── SKILL.md              # Required - main instructions (always in context metadata)
    ├── reference.md          # Optional - loaded on-demand via progressive disclosure
    ├── examples/             # Optional - loaded on-demand
    │   └── example1.md
    ├── scripts/              # Optional - executed on-demand
    │   └── helper.py
    └── templates/            # Optional - loaded on-demand
        └── template.txt
```

### Progressive Disclosure Token Usage

| Stage | What Loads | Tokens | When |
|-------|------------|--------|------|
| **Discovery** | name + description (frontmatter only) | ~100-200 | Always in system prompt |
| **Invocation** | Full SKILL.md content | ~1,500-5,000 | When Claude decides skill is relevant |
| **Supporting files** | reference.md, scripts/, etc. | Variable | Only when explicitly referenced |

### Designing Skills for Dual-Mode Compatibility

To switch between **formal Claude Skills** and **manual reading**, use this structure:

```
leo/skills/
└── schema-designer/
    ├── SKILL.md              # Main content - works both ways
    │   # Frontmatter for Claude auto-discovery:
    │   # ---
    │   # name: schema-designer
    │   # description: Design database schemas. Use when creating schema.ts,
    │   #              schema.zod.ts, or when user mentions "database", "tables".
    │   # ---
    │   #
    │   # Main content follows...
    │
    ├── advanced-patterns.md  # Supporting file (progressive disclosure)
    └── examples/
        └── multi-tenant.md   # Example loaded on-demand
```

### Switching Between Modes

**Mode A: Formal Claude Skills (auto-discovery)**
```python
# In pipeline prompt - NO explicit Read instructions
# Claude auto-loads based on description match

# Phase 2: Schema Design
# Just describe the task - Claude will load schema-designer skill if description matches
"Design the database schema based on the plan..."
```

**Mode B: Manual Reading (explicit control)**
```python
# In pipeline prompt - explicit Read instructions
"Read /app/leo/skills/schema-designer/SKILL.md BEFORE writing schema.ts"
```

**Configuration flag** (proposed):
```python
# In config.py
SKILL_MODE = "formal"  # or "manual"

# Pipeline prompt template conditionally includes Read instructions
if SKILL_MODE == "manual":
    prompt += "Read /app/leo/skills/schema-designer/SKILL.md BEFORE..."
```

### What We Lose/Gain Per Mode

| Aspect | Formal Skills | Manual Reading |
|--------|---------------|----------------|
| **Token efficiency** | Progressive (~100 tokens until needed) | Immediate (~3k tokens) |
| **Context persistence** | Temporary, scoped to skill | Persists in conversation |
| **Control** | Claude decides when to load | We decide explicitly |
| **Predictability** | May miss activating | Always activates when told |
| **Supporting files** | Auto-loaded on reference | Must explicitly Read each |

---

## Organization Philosophy: By Type vs By Agent

### The Core Question

Should Leo resources be organized by:
- **Type**: All skills together, all prompts together, all patterns together
- **Agent**: Each agent has its own skills, prompts, patterns

### Analysis: Resource Composability

| Resource Type | Composability | Natural Grouping |
|---------------|---------------|------------------|
| **Skills** | HIGH - any agent can use any skill | By domain (schema, API, auth) |
| **Patterns** | LOW - specific to one subagent | By subagent |
| **Prompts** | NONE - defines one agent's identity | By agent |
| **MCP Config** | HIGH - shared infrastructure | Global |

### Skills are Like Tools (Agent-Agnostic)

Skills represent **domain knowledge**, not agent identity:
- `schema-designer` - knowledge about Drizzle/Zod patterns
- `api-architect` - knowledge about ts-rest contracts
- `supabase-auth` - knowledge about Supabase auth flows

Any agent that needs this knowledge can read the skill. The orchestrator reads skills during phases. A subagent could also read a skill if needed.

**Conclusion**: Skills should be grouped by DOMAIN, not by agent.

### Patterns are Agent-Specific

Patterns capture **agent-specific gotchas and workflows**:
- `code_writer/FORM_STATE_MANAGEMENT.md` - only code_writer needs this
- `error_fixer/DIAGNOSTIC_WORKFLOWS.md` - only error_fixer needs this

These are tightly coupled to the subagent's prompt and behavior.

**Conclusion**: Patterns should be grouped WITH their subagent.

### Prompts Define Agent Identity

Each prompt is the **soul** of one agent:
- `pipeline-prompt-v2.md` → AppGeneratorAgent
- `reprompter-master-plan.md` → ReprompterAgent
- Subagent prompts → embedded in Python AgentDefinition

**Conclusion**: Prompts should be WITH their agent, but can be in a shared prompts/ dir since there are few.

---

## Leo's Agent Hierarchy & Context Scopes

### The Three-Level Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ REPROMPTER (Application Scope)                                          │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Context: App history, changelogs, session, plan files               │ │
│ │ Lifespan: Entire generation (all iterations)                        │ │
│ │ Token budget: ~30% (must leave room for orchestrator)               │ │
│ │ Reads: Session context, compressed changelogs, current plan         │ │
│ │ Does NOT read: Skills, patterns (doesn't write code)                │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                              ↓ prompts                                  │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ORCHESTRATOR / AppGeneratorAgent (Phase Scope)                      │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Context: Pipeline prompt, current phase skill, code changes     │ │ │
│ │ │ Lifespan: One iteration (one reprompter cycle)                  │ │ │
│ │ │ Token budget: ~40% (must leave room for subagents)              │ │ │
│ │ │ Reads: Pipeline prompt (~10k), phase skill (~3k)                │ │ │
│ │ │ Does NOT read: All skills at once, full app history             │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ │                            ↓ delegates                              │ │
│ │ ┌─────────────────────────────────────────────────────────────────┐ │ │
│ │ │ SUBAGENTS (Task Scope)                                          │ │ │
│ │ │ ┌─────────────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Context: Task prompt, agent patterns, focused code          │ │ │ │
│ │ │ │ Lifespan: Single task (pop in, do work, pop out)            │ │ │ │
│ │ │ │ Token budget: ~30% (fresh context each invocation)          │ │ │ │
│ │ │ │ Reads: Patterns (~5k), specific files for task              │ │ │ │
│ │ │ │ Benefit: Isolated context, doesn't pollute parent           │ │ │ │
│ │ │ └─────────────────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Context Scope Summary

| Agent | Scope | Sees | Doesn't See | Token Target |
|-------|-------|------|-------------|--------------|
| **Reprompter** | Application | History, session, plan | Skills, patterns, code details | ~30% |
| **Orchestrator** | Phase | Pipeline prompt, current skill | All skills, full history | ~40% |
| **Subagent** | Task | Task prompt, patterns | Parent context, other tasks | ~30% |

### The 40% Rule

**Goal**: Keep context utilization at ~40% to leave headroom for:
- Response generation
- Tool outputs
- Unexpected complexity

**How each level achieves this**:

1. **Reprompter**:
   - Compresses older changelogs (last 200 lines only)
   - Only reads last 5 tasks for loop detection
   - Never loads skills or patterns

2. **Orchestrator**:
   - Loads ONE skill per phase (not all 12)
   - Skills should use progressive disclosure
   - Delegates complex work to subagents

3. **Subagents**:
   - Fresh context each invocation
   - Patterns embedded in prompt (not read dynamically)
   - Returns only relevant findings to parent

### What Should Persist vs Load On-Demand

| Resource | Persistence | Rationale |
|----------|-------------|-----------|
| Session context (app name, features) | Reprompter → Orchestrator | Core identity |
| Current plan | Reprompter | Strategic direction |
| Pipeline prompt | Orchestrator (full session) | Agent identity |
| Skills | On-demand per phase | Only need one at a time |
| Patterns | Embedded in subagent | Part of subagent identity |
| Code files | On-demand | Read when needed |
| Changelogs | Compressed in Reprompter | Historical context |

---

## Revised File Organization (Agent-Centric with Shared Skills)

Based on the above analysis:

```
leo/
├── agents/                           # Agent-specific resources
│   ├── reprompter/                   # Outer loop agent
│   │   ├── prompt.py                 # System prompt (Python)
│   │   ├── master-plan.md            # Strategic guidance
│   │   ├── config.py                 # Model, tools, max_turns
│   │   └── context_gatherer.py       # Session/changelog reading
│   │
│   ├── orchestrator/                 # Main pipeline agent
│   │   ├── pipeline-prompt.md        # System prompt (loaded by Python)
│   │   └── config.py                 # Model, tools, subagent list
│   │
│   └── subagents/                    # Task-scoped agents
│       ├── code_writer/
│       │   ├── definition.py         # AgentDefinition dataclass
│       │   └── patterns/             # Agent-specific patterns
│       │       ├── CORE_IDENTITY.md
│       │       ├── FORM_STATE.md
│       │       └── ... (19 files)
│       ├── error_fixer/
│       │   ├── definition.py
│       │   └── patterns/
│       └── ... (8 subagents)
│
├── skills/                           # Domain knowledge (agent-agnostic)
│   ├── schema-designer/              # Claude-compatible structure
│   │   ├── SKILL.md                  # Main content
│   │   └── examples/                 # Progressive disclosure
│   ├── api-architect/
│   ├── supabase-auth/
│   └── ... (12 skills)
│
└── config/
    └── mcp.json                      # MCP server definitions
```

### Why This Structure

1. **Agents have their own directories** - prompts, patterns, config all together
2. **Skills are shared** - any agent can read any skill
3. **Patterns are WITH subagents** - tightly coupled to agent identity
4. **Skills remain Claude-compatible** - can switch to formal mode

---

## Claude Skills Compatibility Analysis

### The Problem

Claude's formal Skills require files in `.claude/skills/` for auto-discovery:
```
.claude/skills/skill-name/SKILL.md  ← Claude looks here
```

Our proposed `leo/skills/` location would **NOT** be auto-discovered:
```
leo/skills/skill-name/SKILL.md  ← Claude ignores this
```

### Solution: Dockerfile Symlinks

Keep clean `leo/` organization on host, but create symlinks in container:

```dockerfile
# Copy Leo resources
COPY leo/ /app/leo/

# Create .claude directory structure for Claude Code
RUN mkdir -p /workspace/app/.claude && \
    ln -s /app/leo/skills /workspace/app/.claude/skills
```

**Result in container**:
```
/app/leo/skills/                      # Actual files
/workspace/app/.claude/skills/ → /app/leo/skills/  # Symlink for Claude
```

### How This Enables Both Modes

| Mode | How It Works |
|------|--------------|
| **Formal Skills** | Claude discovers via `/workspace/app/.claude/skills/` symlink |
| **Manual Reading** | Agent reads `/app/leo/skills/schema-designer/SKILL.md` directly |

**Same files, two access patterns**.

---

## Final Layout Design

### Design Principles

1. **Host and container mirror each other** (different root paths)
2. **`leo/` contains ALL Leo resources** (not scattered across repo)
3. **`.claude/` is for Claude Code config only** (mcp.json + symlinks)
4. **Python code stays in `src/`** (separate from resources)
5. **Absolute paths in container** for CWD-independence

### FINAL: Leo Repository Layout (Host)

```
app-factory/                          # Repository root
│
├── leo/                              # ALL LEO RESOURCES
│   │
│   ├── agents/                       # Agent definitions and prompts
│   │   │
│   │   ├── reprompter/               # Outer loop agent
│   │   │   ├── system-prompt.md      # Main system prompt
│   │   │   └── master-plan.md        # Strategic guidance
│   │   │
│   │   ├── orchestrator/             # Main pipeline agent
│   │   │   └── pipeline-prompt.md    # Pipeline system prompt
│   │   │
│   │   └── subagents/                # Task-scoped agents
│   │       ├── code_writer/
│   │       │   ├── prompt.md         # Subagent system prompt
│   │       │   └── patterns/         # Agent-specific patterns
│   │       │       ├── CORE_IDENTITY.md
│   │       │       ├── FORM_STATE.md
│   │       │       └── ... (17 more)
│   │       ├── error_fixer/
│   │       │   ├── prompt.md
│   │       │   └── patterns/
│   │       ├── quality_assurer/
│   │       │   ├── prompt.md
│   │       │   └── patterns/
│   │       ├── research_agent/
│   │       │   └── prompt.md         # No patterns
│   │       └── ai_integration/
│   │           ├── prompt.md
│   │           └── patterns/
│   │
│   ├── skills/                       # Domain knowledge (Claude-compatible)
│   │   ├── schema-designer/
│   │   │   ├── SKILL.md              # Main skill content
│   │   │   └── examples/             # Progressive disclosure
│   │   ├── api-architect/
│   │   │   └── SKILL.md
│   │   ├── supabase-project-setup/
│   │   │   └── SKILL.md
│   │   ├── drizzle-orm-setup/
│   │   │   └── SKILL.md
│   │   ├── supabase-auth-setup/
│   │   │   └── SKILL.md
│   │   ├── supabase-auth/
│   │   │   └── SKILL.md
│   │   ├── supabase-storage/
│   │   │   └── SKILL.md
│   │   ├── type-safe-queries/
│   │   │   └── SKILL.md
│   │   ├── storage-factory-validation/
│   │   │   └── SKILL.md
│   │   ├── ui-designer/
│   │   │   └── SKILL.md
│   │   ├── code-writer/
│   │   │   └── SKILL.md
│   │   └── readme-generator/
│   │       └── SKILL.md
│   │
│   └── config/                       # Leo configuration
│       ├── mcp.json                  # MCP server definitions
│       └── settings.json             # Leo-specific settings (future)
│
├── src/                              # Python source code
│   └── app_factory_leonardo_replit/
│       ├── agents/
│       │   ├── app_generator/
│       │   │   ├── agent.py          # Loads leo/agents/orchestrator/
│       │   │   ├── config.py
│       │   │   └── subagents/        # AgentDefinition classes
│       │   │       └── *.py          # Reference leo/agents/subagents/
│       │   └── reprompter/
│       │       ├── agent.py          # Loads leo/agents/reprompter/
│       │       ├── config.py
│       │       └── context_gatherer.py
│       └── ...
│
├── vendor/                           # Dependencies (cc-agent, cc-tools)
│
├── .claude/                          # Claude Code config (MINIMAL)
│   └── mcp.json                      # For local development
│
├── docs/                             # Documentation only (no prompts!)
│   ├── architecture/
│   └── file-structure/
│
└── apps/                             # Generated apps (output)
    └── {app-name}/
```

### FINAL: Leo Container Layout

```
/app/                                 # Leo installation (read-only)
│
├── leo/                              # Mirror of host leo/
│   ├── agents/
│   │   ├── reprompter/
│   │   │   ├── system-prompt.md
│   │   │   └── master-plan.md
│   │   ├── orchestrator/
│   │   │   └── pipeline-prompt.md
│   │   └── subagents/
│   │       ├── code_writer/
│   │       │   ├── prompt.md
│   │       │   └── patterns/
│   │       └── ...
│   │
│   ├── skills/                       # Domain knowledge
│   │   ├── schema-designer/SKILL.md
│   │   └── ...
│   │
│   └── config/
│       └── mcp.json
│
├── src/                              # Python code
│   └── app_factory_leonardo_replit/
│
└── vendor/                           # Dependencies

/workspace/                           # Generation workspace (read-write)
└── app/                              # Single app workspace
    ├── .claude/                      # Claude Code config for workspace
    │   ├── mcp.json                  # Copy from /app/leo/config/
    │   └── skills/                   # SYMLINK → /app/leo/skills/
    │
    ├── .agent_session.json           # Leo session tracking
    └── {generated app files}
```

### Path Mapping: Host → Container

| Host Path | Container Path | Notes |
|-----------|----------------|-------|
| `leo/` | `/app/leo/` | Direct copy |
| `leo/agents/` | `/app/leo/agents/` | Prompts and patterns |
| `leo/skills/` | `/app/leo/skills/` | Actual skill files |
| N/A | `/workspace/app/.claude/skills/` | Symlink to `/app/leo/skills/` |
| `src/` | `/app/src/` | Python code |
| `vendor/` | `/app/vendor/` | Dependencies |
| `.claude/mcp.json` | `/workspace/app/.claude/mcp.json` | Copied for workspace |

---

## Dockerfile Updates

### Current Dockerfile (Problematic)

```dockerfile
# Current: Scattered copies, duplication
COPY .claude/ ./.claude/
COPY apps/.claude/ ./apps/.claude/
COPY apps/.claude/ /workspace/app/.claude/  # DUPLICATE
COPY docs/ ./docs/
```

### New Dockerfile (Clean)

```dockerfile
# ============================================
# Leo Resources
# ============================================

# Copy Leo resources (single source of truth)
COPY leo/ /app/leo/

# Copy Python code
COPY src/ /app/src/
COPY vendor/ /app/vendor/
COPY pyproject.toml /app/

# ============================================
# Workspace Setup
# ============================================

# Create workspace with Claude Code config
RUN mkdir -p /workspace/app/.claude && \
    # Copy MCP config for Claude Code
    cp /app/leo/config/mcp.json /workspace/app/.claude/mcp.json && \
    # Symlink skills for Claude auto-discovery (formal Skills mode)
    ln -s /app/leo/skills /workspace/app/.claude/skills

# ============================================
# NO MORE:
# - COPY .claude/agents/ (redundant with Python AgentDefinition)
# - COPY apps/.claude/ (moved to leo/)
# - Multiple copies of skills (one copy + symlink)
# ============================================
```

### Verification Commands

```bash
# In container, verify structure:
ls -la /app/leo/
ls -la /app/leo/agents/
ls -la /app/leo/skills/
ls -la /workspace/app/.claude/
ls -la /workspace/app/.claude/skills/  # Should show symlink

# Verify symlink works:
cat /workspace/app/.claude/skills/schema-designer/SKILL.md
```

---

## Migration Plan

### Phase 1: Create leo/ Directory on Host

```bash
# From app-factory root:

# 1. Create structure
mkdir -p leo/agents/reprompter
mkdir -p leo/agents/orchestrator
mkdir -p leo/agents/subagents
mkdir -p leo/skills
mkdir -p leo/config

# 2. Move prompts
mv docs/pipeline-prompt-v2.md leo/agents/orchestrator/pipeline-prompt.md
mv docs/reprompter-master-plan.md leo/agents/reprompter/master-plan.md
cp src/.../reprompter/prompts.py leo/agents/reprompter/system-prompt.md  # Extract

# 3. Move skills
mv apps/.claude/skills/* leo/skills/

# 4. Move patterns (per subagent)
for agent in code_writer error_fixer quality_assurer ai_integration ui_designer schema_designer api_architect; do
  mkdir -p leo/agents/subagents/$agent/patterns
  mv docs/patterns/$agent/* leo/agents/subagents/$agent/patterns/
done

# 5. Move config
mv .claude/mcp.json leo/config/mcp.json

# 6. Delete redundant directories
rm -rf .claude/agents/
rm -rf apps/.claude/agents/
rm -rf apps/.claude/skills/
rm -rf docs/patterns/
```

### Phase 2: Update Python Code

```python
# src/.../app_generator/config.py
LEO_ROOT = Path("/app/leo")  # Container path
PIPELINE_PROMPT = LEO_ROOT / "agents/orchestrator/pipeline-prompt.md"

# src/.../reprompter/agent.py
MASTER_PLAN = LEO_ROOT / "agents/reprompter/master-plan.md"

# src/.../subagents/code_writer.py
PATTERNS_DIR = LEO_ROOT / "agents/subagents/code_writer/patterns"
```

### Phase 3: Update Dockerfile

See "New Dockerfile" section above.

### Phase 4: Update Pipeline Prompt

```markdown
# FROM (old relative paths):
Read ../../.claude/skills/schema-designer/SKILL.md

# TO (new absolute paths):
Read /app/leo/skills/schema-designer/SKILL.md
```

### Phase 5: Test Both Skill Modes

```bash
# Test manual mode:
# Verify agent reads /app/leo/skills/schema-designer/SKILL.md

# Test formal mode:
# Verify Claude discovers /workspace/app/.claude/skills/schema-designer/SKILL.md
# (via symlink to /app/leo/skills/)
```

---

## Summary: What Changes

| Current | New | Reason |
|---------|-----|--------|
| `docs/pipeline-prompt-v2.md` | `leo/agents/orchestrator/pipeline-prompt.md` | With agent |
| `docs/reprompter-master-plan.md` | `leo/agents/reprompter/master-plan.md` | With agent |
| `docs/patterns/{agent}/` | `leo/agents/subagents/{agent}/patterns/` | With subagent |
| `apps/.claude/skills/` | `leo/skills/` | Centralized |
| `.claude/agents/` | DELETED | Redundant (Python defs) |
| `.claude/mcp.json` | `leo/config/mcp.json` | Centralized |
| Multiple skill copies | One copy + symlink | No duplication |

---

## Complete Leo Resource Inventory

### Primary Agents

| Agent | Role | System Prompt | Config |
|-------|------|---------------|--------|
| **AppGeneratorAgent** | Orchestrator - runs pipeline | `docs/pipeline-prompt-v2.md` | `src/.../app_generator/config.py` |
| **ReprompterAgent** | Outer loop - decides next task | `src/.../reprompter/prompts.py` + `docs/reprompter-master-plan.md` | `src/.../reprompter/config.py` |

### Subagents (8 total)

| Subagent | Python Definition | Markdown File | Patterns |
|----------|-------------------|---------------|----------|
| `research_agent` | `subagents/research_agent.py` | `.claude/agents/research_agent.md` | None |
| `code_writer` | `subagents/code_writer.py` | `.claude/agents/code_writer.md` | 19 files in `docs/patterns/code_writer/` |
| `schema_designer` | (deprecated→skill) | `.claude/agents/schema_designer.md` | 8 files |
| `api_architect` | (deprecated→skill) | `.claude/agents/api_architect.md` | 8 files |
| `ui_designer` | (deprecated→skill) | `.claude/agents/ui_designer.md` | 9 files |
| `quality_assurer` | `subagents/quality_assurer.py` | `.claude/agents/quality_assurer.md` | 6 files |
| `error_fixer` | `subagents/error_fixer.py` | `.claude/agents/error_fixer.md` | 6 files |
| `ai_integration` | `subagents/ai_integration.py` | `.claude/agents/ai_integration.md` | 8 files |

### Nine Dimensions of Leo Resources

| # | Dimension | Location | Loaded By | Purpose |
|---|-----------|----------|-----------|---------|
| 1 | **Pipeline Prompt** | `docs/pipeline-prompt-v2.md` | Python code → AppGeneratorAgent | Main orchestration instructions |
| 2 | **Reprompter Master Plan** | `docs/reprompter-master-plan.md` | Python code → ReprompterAgent | Strategic guidance for outer loop |
| 3 | **Subagent Defs (Python)** | `src/.../subagents/*.py` | `cc_agent.Agent(agents=...)` | SDK programmatic subagents |
| 4 | **Subagent Defs (Markdown)** | `.claude/agents/*.md` | Claude Code CLI (if no Python def) | Filesystem-based subagents |
| 5 | **Skills** | `apps/.claude/skills/*/SKILL.md` | Manual Read (prompt-directed) | Domain knowledge |
| 6 | **Patterns** | `docs/patterns/{agent}/*.md` | Embedded in subagent prompt | Agent-specific gotchas |
| 7 | **MCP Config** | `.claude/mcp.json` | Claude Code CLI | Server definitions |
| 8 | **Templates** | `~/.mcp-tools/templates/` | Extract tool | App scaffolding |
| 9 | **Context Gatherer** | `src/.../reprompter/context_gatherer.py` | ReprompterAgent | Reads session/changelog for state |

### Overlap/Redundancy Analysis

**Subagents**: Two parallel definitions exist!
1. Python `AgentDefinition` in `src/.../subagents/code_writer.py` → **TAKES PRECEDENCE**
2. Markdown `.claude/agents/code_writer.md` → **MAY BE IGNORED**

**Skills vs Patterns**: Different purposes but confusing naming
- **Skills** = Domain knowledge (schema design, API patterns)
- **Patterns** = Agent-specific fixes (wouter routing, form state)
- `code_writer` has BOTH skill AND 19 pattern files - patterns embedded in Python prompt

**Deprecated Subagents → Skills**:
- `schema_designer`, `api_architect`, `ui_designer` were converted to skills in Nov 2025
- But markdown files still exist in `.claude/agents/` - orphaned?

---

## BUG FOUND: Hardcoded Local Paths

In `.claude/agents/code_writer.md`:
```markdown
1. **Core Identity & Workflow**: /Users/labheshpatel/apps/app-factory/docs/patterns/code_writer/CORE_IDENTITY.md
```

**Problem**: This is a developer's local machine path. Will NOT work in container.

**Affected files**:
- `.claude/agents/code_writer.md` (16+ hardcoded paths)
- `apps/.claude/agents/code_writer.md` (duplicate, same issue)

---

## Claude Code Formal Requirements

### Skills (from official docs)

```yaml
---
name: lowercase-with-hyphens     # Required, max 64 chars
description: What and when       # Required, max 1024 chars - CRITICAL for discovery
allowed-tools: Tool1, Tool2      # Optional - limits tools
---
```

**Our skills** have `name` and `description` but also non-standard fields (`category`, `priority`). These are ignored by Claude but don't break anything.

### Agents (from official docs)

```yaml
---
name: agent-name                 # Required
description: What and when       # Required
tools: Tool1, Tool2              # Optional
model: sonnet|opus|haiku         # Optional
permissionMode: default          # Optional
skills: skill1, skill2           # Optional - auto-loads skills
---
```

**Our agents** match this format correctly.

### Path Resolution

- Claude resolves `.claude/` relative to cwd where Claude Code is invoked
- Project `.claude/` takes priority over user `~/.claude/`
- Settings precedence: managed > CLI args > local project > shared project > user

---

## Current Host Structure (Before Docker Build)

```
app-factory/                              # Repository root
│
├── .claude/                              # ROOT LEVEL - Claude config
│   ├── agents/                           # 8 agent markdown files
│   │   ├── ai_integration.md
│   │   ├── api_architect.md
│   │   ├── code_writer.md
│   │   ├── error_fixer.md
│   │   ├── quality_assurer.md
│   │   ├── research_agent.md
│   │   ├── schema_designer.md
│   │   └── ui_designer.md
│   └── mcp.json                          # MCP server configuration
│
├── apps/                                 # Generated apps directory
│   └── .claude/                          # APPS LEVEL - Claude config
│       ├── agents/                       # DUPLICATE: Same 8 agent files
│       │   └── [same 8 .md files]
│       └── skills/                       # 12 skill directories
│           ├── api-architect/SKILL.md
│           ├── code-writer/SKILL.md
│           ├── drizzle-orm-setup/SKILL.md
│           ├── readme-generator/SKILL.md
│           ├── schema-designer/SKILL.md
│           ├── storage-factory-validation/SKILL.md
│           ├── supabase-auth/SKILL.md
│           ├── supabase-auth-setup/SKILL.md
│           ├── supabase-project-setup/SKILL.md
│           ├── supabase-storage/SKILL.md
│           ├── type-safe-queries/SKILL.md
│           └── ui-designer/SKILL.md
│
├── docs/
│   ├── pipeline-prompt-v2.md             # Main system prompt
│   ├── PROMPTING-GUIDE.md
│   └── patterns/                         # Pattern files per agent
│       ├── ai_integration/               # 8 pattern files
│       ├── api_architect/                # 8 pattern files
│       ├── code_writer/                  # 19 pattern files
│       ├── error_fixer/                  # 6 pattern files
│       ├── quality_assurer/              # 6 pattern files
│       ├── schema_designer/              # 8 pattern files
│       └── ui_designer/                  # 9 pattern files
│
├── src/app_factory_leonardo_replit/
│   └── agents/app_generator/
│       ├── config.py                     # AGENT_CONFIG, tool lists
│       └── subagents/                    # AgentDefinition dataclasses
│           ├── ai_integration.py
│           ├── code_writer.py
│           ├── error_fixer.py
│           ├── quality_assurer.py
│           └── research_agent.py
│
└── vendor/                               # cc-agent, cc-tools
```

---

## Container Structure After Docker Build

Dockerfile performs these COPYs:

```dockerfile
COPY .claude/       /app/.claude/              # Root .claude
COPY apps/.claude/  /app/apps/.claude/         # Apps .claude
COPY apps/.claude/  /workspace/app/.claude/    # DUPLICATE for workspace
COPY docs/          /app/docs/
COPY src/           /app/src/
COPY vendor/        /app/vendor/
```

**Result in container:**

```
/app/                                     # Leo installation
├── .claude/                              # COPY 1: Root config
│   ├── agents/                           # 8 agent .md files
│   └── mcp.json
├── apps/
│   └── .claude/                          # COPY 2: Apps config
│       ├── agents/                       # DUPLICATE agents
│       └── skills/                       # 12 skills
├── docs/
│   ├── pipeline-prompt-v2.md
│   └── patterns/                         # ~64 pattern files
├── src/
│   └── app_factory_leonardo_replit/
│       └── agents/app_generator/
│           └── subagents/                # Python definitions
└── vendor/

/workspace/app/                           # Generation workspace
└── .claude/                              # COPY 3: Workspace config
    ├── agents/                           # TRIPLE-DUPLICATE agents
    └── skills/                           # DUPLICATE skills
```

---

## Duplication Analysis

### Issue 1: Agents Directory - 3 Copies

| Location | Source | Purpose |
|----------|--------|---------|
| `/app/.claude/agents/` | `COPY .claude/` | For cwd=/app |
| `/app/apps/.claude/agents/` | `COPY apps/.claude/` | For cwd=/app/apps |
| `/workspace/app/.claude/agents/` | `COPY apps/.claude/` | For cwd=/workspace/app |

**Why duplication exists**: Claude Code resolves `.claude/` relative to cwd. Different operations use different cwd values.

**Impact**:
- 8 files x 3 locations = 24 agent files
- Changes require updating 2 source directories on host (.claude/agents + apps/.claude/agents)

### Issue 2: Skills Directory - 2 Copies

| Location | Source | Purpose |
|----------|--------|---------|
| `/app/apps/.claude/skills/` | `COPY apps/.claude/` | For cwd=/app/apps |
| `/workspace/app/.claude/skills/` | `COPY apps/.claude/` | For cwd=/workspace/app |

**Why duplication exists**: Pipeline prompt references skills via relative paths like `../../.claude/skills/schema-designer/SKILL.md`. Resolution depends on cwd.

**Impact**:
- 12 skills x 2 locations = 24 skill copies
- At least changes are from single source (apps/.claude/skills)

### Issue 3: Patterns vs Skills Overlap

Some agents have BOTH:
- A skill file in `apps/.claude/skills/{name}/SKILL.md`
- Pattern files in `docs/patterns/{name}/*.md`

| Agent | Has Skill? | Has Patterns? |
|-------|------------|---------------|
| schema_designer | Yes | Yes (8 files) |
| api_architect | Yes | Yes (8 files) |
| code_writer | Yes | Yes (19 files) |
| ui_designer | Yes | Yes (9 files) |
| ai_integration | No | Yes (8 files) |
| error_fixer | No | Yes (6 files) |
| quality_assurer | No | Yes (6 files) |
| research_agent | No | No |

**Confusion**: When should agent read skill vs patterns? Who reads what?

---

## Resource Loading Mechanism

### 1. Agent Definitions (Python)

**Location**: `src/.../subagents/*.py`
**Loaded by**: Python code at agent initialization
**Contains**: `AgentDefinition` dataclass with description, prompt, tools, model

### 2. Agent Markdown Files (.claude/agents/)

**Location**: `.claude/agents/{name}.md`
**Loaded by**: Claude Code CLI via `setting_sources=["user", "project"]`
**Contains**: Instructions for Task tool subagent spawning

### 3. Skills (.claude/skills/)

**Location**: `apps/.claude/skills/{name}/SKILL.md`
**Loaded by**: Agent reads explicitly when prompted
**Contains**: Battle-tested patterns for specific domains

### 4. Patterns (docs/patterns/)

**Location**: `docs/patterns/{agent_name}/*.md`
**Loaded by**: Subagent definition prompt references them
**Contains**: Detailed implementation patterns, validation checklists

### 5. Pipeline Prompt

**Location**: `docs/pipeline-prompt-v2.md`
**Loaded by**: AppGeneratorAgent at initialization
**Contains**: Main orchestration instructions, phase definitions

---

## Path Resolution in Pipeline Prompt

The pipeline prompt (v2) references skills with relative paths:

```markdown
Read ../../.claude/skills/schema-designer/SKILL.md BEFORE writing schema.ts
```

**Resolution depends on cwd:**

| cwd | Relative Path | Resolves To |
|-----|--------------|-------------|
| `/workspace/app/{app_name}/app` | `../../.claude/skills/...` | `/workspace/app/.claude/skills/...` |
| `/app/apps` | `.claude/skills/...` | `/app/apps/.claude/skills/...` |

This is WHY we have duplicate skills directories.

---

## Root Cause: Variable CWD

Different operations use different cwd:

| Operation | Current CWD | Why |
|-----------|-------------|-----|
| Agent spawn | `/app/apps` | Where cc_agent.Agent is initialized |
| Code generation | `/workspace/app/{app_name}/app` | Where generated files go |
| Skill loading | Depends on caller | Relative paths resolve differently |

**Core problem**: Relative paths to `.claude/` directories need to resolve correctly regardless of cwd.

---

## Proposed Rationalization

### Option A: Single .claude/ at /workspace/app

```
/app/                                     # Leo (read-only)
├── docs/
│   ├── pipeline-prompt-v2.md
│   └── patterns/                         # Keep patterns here
└── src/                                  # Python code

/workspace/                               # Generation (read-write)
└── app/
    ├── .claude/                          # SINGLE CONFIG LOCATION
    │   ├── agents/                       # Agent markdown files
    │   ├── skills/                       # All skills
    │   └── settings.json                 # CWD-independent config
    └── {generated app files}
```

**Requires**:
- Remove app_name from paths (already planned)
- Update Dockerfile to COPY only once
- Update pipeline prompt to use absolute paths or consistent relative paths
- Ensure cwd is always `/workspace/app` during generation

### Option B: Absolute Paths Everywhere

Keep current structure but use absolute paths in prompts:

```markdown
Read /workspace/app/.claude/skills/schema-designer/SKILL.md BEFORE writing schema.ts
```

**Pros**: Minimal change
**Cons**: Still have duplication, just works around it

### Option C: Symlinks

```dockerfile
RUN ln -s /app/apps/.claude /workspace/app/.claude
```

**Pros**: Single source of truth
**Cons**: Symlink complexity, may not work in all environments

---

## Recommended Approach

**Phase 1: Remove app_name** (already planned)
- Change `/workspace/app/{app_name}/app/` to `/workspace/app/`
- Fixes session alignment issue too

**Phase 2: Consolidate .claude/**
- Single location: `/workspace/app/.claude/`
- Remove `/app/.claude/` and `/app/apps/.claude/`
- Update Dockerfile to COPY directly to workspace

**Phase 3: Standardize Paths**
- Pipeline prompt uses absolute paths: `/workspace/app/.claude/skills/...`
- Agent definitions reference patterns absolutely: `/app/docs/patterns/...`
- Ensure cwd is `/workspace/app` for all generation operations

---

## Files to Change

### Dockerfile
```dockerfile
# REMOVE these:
# COPY .claude/ ./.claude/
# COPY apps/.claude/ ./apps/.claude/

# ADD this single COPY:
COPY apps/.claude/ /workspace/app/.claude/
```

### Host Structure
```bash
# DELETE (redundant):
rm -rf .claude/agents/  # Use apps/.claude/agents/ only

# Keep single source:
# - apps/.claude/agents/
# - apps/.claude/skills/
```

### Pipeline Prompt
Change all relative skill paths to absolute:
```markdown
# FROM:
Read ../../.claude/skills/schema-designer/SKILL.md

# TO:
Read /workspace/app/.claude/skills/schema-designer/SKILL.md
```

### Agent Config
Ensure `cwd=/workspace/app` when spawning agents.

---

## Questions Answered

### Q1: Do we need `.claude/agents/` markdown files?

**Yes**, but they serve a different purpose than Python `AgentDefinition`:

| Mechanism | What It Does | When Used |
|-----------|--------------|-----------|
| Python `AgentDefinition` | Passed to `cc_agent.Agent(agents=...)` | SDK initialization |
| Markdown `.claude/agents/*.md` | Claude Code reads for Task tool | Runtime delegation |

**Insight**: Both are needed. The Python defines the agent for SDK. The markdown provides Claude Code with the system prompt when Task tool spawns the subagent.

### Q2: Skills vs Patterns - what's the difference?

| Type | Scope | When Read | By Whom |
|------|-------|-----------|---------|
| **Skill** | Domain knowledge | Before writing code in that domain | Orchestrator (prompted) |
| **Pattern** | Agent-specific fixes | Before agent starts work | Subagent (embedded in prompt) |

**Skills**: General domain patterns (e.g., "how to write Drizzle schemas")
**Patterns**: Agent-specific gotchas (e.g., "code_writer must use individual useState")

**Recommendation**: Keep separate. Skills = what to build. Patterns = how this agent builds it.

### Q3: Why two locations for skills/agents on host?

**Historical accident**. Both `.claude/` and `apps/.claude/` exist because:
- `.claude/` was created for local development (cwd = repo root)
- `apps/.claude/` was created for generated apps (cwd = apps dir)

**Fix**: Single source at `apps/.claude/`, delete root `.claude/agents/`

### Q4: mcp.json location?

Currently at `.claude/mcp.json`. Needs to be accessible from wherever Claude Code runs.

**In container**: Should be at `/workspace/app/.claude/mcp.json` if cwd is `/workspace/app`.

---

## Rationalized Target Structure

### Design Principles

1. **Python subagents are authoritative** - Markdown `.claude/agents/` files are redundant
2. **Skills are manually read** - Don't need to be in `.claude/skills/` for auto-discovery
3. **Patterns are embedded** - Referenced by absolute path in Python subagent prompts
4. **Single cwd** - All generation happens with cwd = `/workspace/app`
5. **Leo resources separate from .claude** - Leo's prompts/skills ≠ Claude Code's config

### Host (Single Source of Truth)

```
app-factory/
├── .claude/
│   └── mcp.json                          # MCP server config (local dev)
│
├── leo/                                  # Leo-specific resources
│   ├── prompts/                          # System prompts for agents
│   │   ├── pipeline-prompt-v2.md         # AppGeneratorAgent system prompt
│   │   └── reprompter-master-plan.md     # ReprompterAgent strategic plan
│   ├── skills/                           # Domain knowledge (manually read)
│   │   ├── schema-designer/SKILL.md
│   │   ├── api-architect/SKILL.md
│   │   └── ... (12 skills)
│   └── patterns/                         # Agent-specific patterns (moved from docs/)
│       ├── code_writer/                  # 19 pattern files
│       ├── error_fixer/                  # 6 pattern files
│       └── ... (per agent)
│
├── docs/                                 # Documentation only (not prompts!)
│   └── architecture/
│
└── src/app_factory_leonardo_replit/
    └── agents/
        ├── app_generator/
        │   ├── agent.py                  # Loads leo/prompts/pipeline-prompt-v2.md
        │   ├── config.py
        │   └── subagents/                # Python AgentDefinition (AUTHORITATIVE)
        │       └── *.py
        └── reprompter/
            ├── agent.py                  # Loads leo/prompts/reprompter-master-plan.md
            ├── config.py
            └── prompts.py
```

**DELETE** (redundant):
- `.claude/agents/*.md` - Python definitions take precedence
- `apps/.claude/agents/*.md` - Same duplication

### Container (Consolidated)

```
/app/                                     # Leo installation (read-only)
├── leo/                                  # Leo resources
│   ├── prompts/
│   │   ├── pipeline-prompt-v2.md
│   │   └── reprompter-master-plan.md
│   ├── skills/                           # Domain knowledge
│   └── patterns/                         # Agent-specific patterns
├── src/                                  # Python code (includes subagent defs)
└── vendor/

/workspace/app/                           # Generation workspace (read-write)
├── .claude/                              # Claude Code config (MINIMAL)
│   └── mcp.json                          # Only MCP config needed
└── {generated files}
```

**Key insight**: We don't need `.claude/agents/` or `.claude/skills/` in container because:
- Subagents are defined programmatically in Python → SDK loads them
- Skills are read manually via absolute paths → No auto-discovery needed

### Path Resolution (All Absolute)

```python
# In Python subagent definitions:
SKILL_PATH = "/app/leo/skills/schema-designer/SKILL.md"
PATTERN_PATH = "/app/leo/patterns/code_writer/CORE_IDENTITY.md"

# In pipeline-prompt-v2.md:
Read /app/leo/skills/schema-designer/SKILL.md BEFORE writing schema.ts
```

**No more relative paths** = No more cwd-dependent resolution = No more duplication

---

## Implementation Plan

### Phase 0: Verify Redundancy (INVESTIGATION)
- [ ] Confirm Python subagent definitions take precedence over markdown files
- [ ] Test: Remove `.claude/agents/code_writer.md`, verify subagent still works
- [ ] If confirmed: Delete all `.claude/agents/*.md` files (8 files x 2 locations = 16 files)

### Phase 1: Remove app_name from paths (ALREADY PLANNED)
- [ ] Change `/workspace/app/{app_name}/app/` → `/workspace/app/`
- [ ] Update `wsi_client/client.py` (lines 664, 955)
- [ ] Fixes session alignment issue

### Phase 2: Create leo/ Directory Structure
```bash
# Create new structure
mkdir -p leo/prompts leo/skills leo/patterns

# Move prompts
mv docs/pipeline-prompt-v2.md leo/prompts/
mv docs/reprompter-master-plan.md leo/prompts/

# Move skills (from apps/.claude/skills/)
mv apps/.claude/skills/* leo/skills/

# Move patterns (from docs/patterns/)
mv docs/patterns/* leo/patterns/

# Delete redundant .claude/agents/ directories
rm -rf .claude/agents/
rm -rf apps/.claude/agents/
```

### Phase 3: Update Python Code
```python
# src/.../app_generator/config.py
PIPELINE_PROMPT_PATH = "/app/leo/prompts/pipeline-prompt-v2.md"

# src/.../reprompter/agent.py
MASTER_PLAN_PATH = "/app/leo/prompts/reprompter-master-plan.md"

# src/.../subagents/code_writer.py
PATTERNS_DIR = Path("/app/leo/patterns/code_writer")
```

### Phase 4: Update Pipeline Prompt
Change all skill references:
```markdown
# FROM (relative):
Read ../../.claude/skills/schema-designer/SKILL.md

# TO (absolute):
Read /app/leo/skills/schema-designer/SKILL.md
```

### Phase 5: Update Dockerfile
```dockerfile
# Leo resources
COPY leo/ /app/leo/

# MCP config for Claude Code
RUN mkdir -p /workspace/app/.claude && \
    cp /app/.claude/mcp.json /workspace/app/.claude/mcp.json

# NO symlinks needed for agents/skills - Python loads them directly
```

### Phase 6: Verification
- [ ] Container builds successfully
- [ ] AppGeneratorAgent loads pipeline prompt
- [ ] Subagents spawn correctly via Task tool
- [ ] Skills are read when prompted
- [ ] Patterns are read by subagents
- [ ] No path resolution errors

---

## Summary of Problems Found

| Problem | Severity | Fix |
|---------|----------|-----|
| **Markdown agents redundant** - Python defs take precedence | **HIGH** | Phase 0: Delete 16 files |
| Hardcoded `/Users/labheshpatel/...` paths | **HIGH** | Phase 3: Use container paths |
| Triple duplication of `.claude/agents/` | Medium | Phase 0: Delete markdown files |
| Double duplication of `.claude/skills/` | Medium | Phase 2: Move to `leo/skills/` |
| Pipeline prompt in `docs/` (polluted dir) | Medium | Phase 2: Move to `leo/prompts/` |
| Patterns scattered in `docs/patterns/` | Low | Phase 2: Move to `leo/patterns/` |
| Relative paths cause cwd issues | Medium | Phase 4: Absolute paths |
| app_name in workspace paths | Medium | Phase 1: Remove |
| Confusing terminology | Low | This doc establishes terms |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| **DELETE markdown agent files** | Python AgentDefinition takes precedence per SDK docs |
| Keep Skills AND Patterns separate | Skills = domain knowledge, Patterns = agent-specific gotchas |
| Create `leo/` directory | Separates Leo resources from Claude Code config (`.claude/`) |
| Use absolute paths | CWD-independent, no duplication needed |
| Minimal `.claude/` in container | Only MCP config needed - subagents/skills loaded programmatically |
| Include reprompter in planning | Critical component - outer loop with its own master plan |

---

---

## Src Directory Structure Analysis

Understanding the `src/` directory to plan the `app_factory_leonardo_replit` → `leo` rename and identify other components.

### Current src/ Contents

```
src/
├── agent_server/                    # FastAPI server - older "Happy Llama" integration
│   ├── log_streamer.py              # WebSocket log streaming
│   └── main.py                      # FastAPI app entry point
│
├── app_factory_leonardo_replit/     # MAIN LEO CODE (to rename to src/leo)
│   ├── agents/                      # Agent implementations
│   │   ├── app_generator/           # Main orchestrator (AppGeneratorAgent)
│   │   │   ├── agent.py
│   │   │   ├── config.py
│   │   │   ├── subagents/           # 8 subagent definitions
│   │   │   └── ...
│   │   └── reprompter/              # Outer loop agent (ReprompterAgent)
│   │       ├── agent.py
│   │       ├── config.py
│   │       └── prompts.py
│   ├── run_app_generator.py         # CLI entry point
│   └── ...
│
├── wcl_local/                       # Writer-Critic Loop local implementation
│   └── ...                          # Placeholder for cc_agent when running locally
│
├── react_preview_system/            # React → static HTML conversion
│   └── ...                          # Used for preview generation
│
└── archive/                         # Old/deprecated code
    └── ...
```

### Component Analysis

| Directory | Purpose | Status | After Refactor |
|-----------|---------|--------|----------------|
| `agent_server/` | FastAPI for "Happy Llama" log streaming | Older, may be deprecated | Keep or move to `legacy/` |
| `app_factory_leonardo_replit/` | Main Leo agent code | **ACTIVE** | Rename to `src/leo/` |
| `wcl_local/` | Local Writer-Critic Loop impl | Active for local dev | Keep |
| `react_preview_system/` | Preview HTML generation | Active | Keep |
| `archive/` | Deprecated code | Archived | Keep or delete |

### src/leo/ Target Structure (After Rename)

```
src/
├── leo/                             # Renamed from app_factory_leonardo_replit
│   ├── agents/
│   │   ├── app_generator/           # Orchestrator
│   │   └── reprompter/              # Outer loop
│   ├── run_app_generator.py         # Entry point
│   └── ...
│
├── elon/                            # FUTURE: Meta-agent for Leo/SaaS development
│   └── ...
│
├── wcl_local/                       # Keep
├── react_preview_system/            # Keep
└── archive/                         # Keep or delete
```

### Rename Plan: `app_factory_leonardo_replit` → `leo`

**Files to update**:

1. **Directory rename**: `src/app_factory_leonardo_replit/` → `src/leo/`

2. **Python imports** (search and replace):
   ```python
   # FROM:
   from app_factory_leonardo_replit.agents.app_generator import AppGeneratorAgent

   # TO:
   from leo.agents.app_generator import AppGeneratorAgent
   ```

3. **pyproject.toml**:
   ```toml
   # Update package name and entry points
   [project]
   name = "leo"  # was "app-factory-leonardo-replit"
   ```

4. **Dockerfile**:
   ```dockerfile
   COPY src/leo/ /app/src/leo/  # was app_factory_leonardo_replit
   ```

5. **Container imports**:
   ```python
   # All Python files in leo_container/ that import from the package
   ```

---

## Container Naming: /app/ vs /workspace/app/

### Current Naming Confusion

The names `/app/` and `/workspace/app/` are non-intuitive because:

1. **Both have "app" in them** but mean completely different things
2. **`/app/` is NOT an app** - it's the Leo installation
3. **`/workspace/app/` IS the generated app** - but "app" appears twice

### Current Meaning

| Path | Contains | Read/Write | Lifecycle |
|------|----------|------------|-----------|
| `/app/` | Leo code, prompts, skills | Read-only | Permanent (container image) |
| `/workspace/app/` | Generated application | Read-write | Per-generation |

### Alternative Naming Schemes

**Option A: Installation vs Workspace**
```
/leo/                    # Leo installation (was /app/)
/workspace/              # Generated app (was /workspace/app/)
└── .claude/
└── {generated files}
```

**Option B: System vs Project**
```
/system/leo/             # Leo installation
/project/                # Generated app
```

**Option C: Keep but Rename**
```
/app/leo/                # Leo installation - adds "leo" for clarity
/workspace/generated/    # Generated app - more explicit
```

### Recommendation: Option A

```
/leo/                              # Leo installation (clear: this is Leo)
├── agents/
├── skills/
├── config/
└── src/

/workspace/                        # Generation workspace (clear: no "app" confusion)
├── .claude/
│   ├── mcp.json
│   └── skills/ → /leo/skills/     # Symlink
└── {generated app files}
```

**Benefits**:
1. `/leo/` clearly identifies Leo resources
2. `/workspace/` is the work area - simple
3. No more "app" appearing in two unrelated paths
4. Mirrors host structure more intuitively: `leo/` → `/leo/`

### Migration Impact

If we change container paths:

1. **Dockerfile** - Update all COPY destinations
2. **Python code** - Update LEO_ROOT constant
3. **Pipeline prompt** - Update skill paths
4. **WSI client** - Update workspace paths
5. **Documentation** - Update all path references

**Decision**: This is a larger refactor. Can be Phase 2 after the initial consolidation works.

---

## Future: Elon Agent

The user mentioned a future `elon` agent at the same level as `leo`:

```
src/
├── leo/                 # Generates arbitrary apps
└── elon/                # FUTURE: Generates/enhances Leo and Leo SaaS
```

**Elon's Role** (speculative):
- Meta-development agent focused on Leo ecosystem
- Can modify Leo's own code
- Can enhance Leo SaaS features
- Self-improvement loop for the app factory itself

**Design Consideration**:
- Keep `leo/` and `elon/` as peers under `src/`
- Both can share `vendor/` (cc-agent, cc-tools)
- Skills might be shared or separate
- Different system prompts and patterns

---

---

## Monorepo Architecture: Two Containers + Contracts

### The Two Dimensions

**Dimension 1: Agent Structure (Leo & Elon)**

Both follow the same "deep agent pattern":
- Reprompter (outer loop, application scope)
- Orchestrator (pipeline, phase scope)
- Subagents (task scope)
- Skills (domain knowledge)
- Patterns (agent-specific)

Leo generates arbitrary apps. Elon generates/modifies Leo, Leo SaaS, and eventually itself.

**Dimension 2: Infrastructure (Two Containers)**

```
┌─────────────────────────┐       ┌─────────────────────────┐
│  ORCHESTRATOR CONTAINER │       │    AGENT CONTAINER      │
│  (Leo SaaS / CLI)       │       │    (Leo / Elon)         │
│                         │       │                         │
│  Express Server         │       │  WSI Client             │
│  WSI Server            ◄├───────┤► (WebSocket)            │
│  Container Manager      │  WSI  │  Deep Agent             │
│  Supabase Pool          │ Proto │  (Reprompter→Orch→Sub)  │
│                         │       │  Workspace              │
└─────────────────────────┘       └─────────────────────────┘
        TypeScript                        Python
```

### Contracts Between Containers

| Contract | Purpose | Location |
|----------|---------|----------|
| **WSI Protocol** | Message format, lifecycle, streaming | `contracts/wsi-protocol.md` |
| **Container Manager Spec** | Spawn, env vars, health, shutdown | `contracts/container-manager.md` |
| **Deep Agent Pattern** | Agent structure specification | `contracts/deep-agent-pattern.md` |

### Meta-Generation: Elon's View

For Elon to modify Leo, it treats app-factory as an "app":
- Understands the deep agent pattern
- Understands WSI protocol
- Understands container boundaries
- Can invoke Leo as a subagent for testing

### Monorepo Principle: Container-First Organization

Organize by **which container the code runs in**:

```
app-factory/
├── orchestrator/              # ORCHESTRATOR CONTAINER (TypeScript)
│   ├── leo-saas/              # SaaS web app
│   ├── leo-remote/            # CLI tool
│   └── shared/                # WSI server, container manager
│
├── agent/                     # AGENT CONTAINER (Python)
│   ├── leo/                   # Leo deep agent
│   ├── elon/                  # Elon deep agent (future)
│   └── runtime/               # WSI client, workspace management
│
├── contracts/                 # Human + machine readable specs
│   ├── wsi-protocol.md
│   ├── container-manager.md
│   └── deep-agent-pattern.md
│
└── vendor/                    # Source dependencies (not package managed)
```

**Benefits**:
1. Clear language boundary: orchestrator = TS, agent = Python
2. Each container is self-contained
3. Contracts define the interface between them
4. No cross-language package management pain

### Elon Bootstrap Strategy

1. **Phase 1**: Repackage Leo with clean structure
2. **Phase 2**: Copy Leo → Elon skeleton
3. **Phase 3**: Modify Elon for meta-development skills
4. **Future**: Elon can modify itself (recursive self-improvement)

---

## Design Constraints (User Requirements)

### No Package Managers

**Constraint**: No npm workspaces, no pip/uv workspaces, no Turborepo/Nx.

**Rationale**: "Long history of nothing but trouble" - package managers add complexity without sufficient benefit for this project.

**Implication**:
- vendor/ (cc-agent, cc-tools) becomes source code under src/
- Each container is self-contained, no cross-container imports
- Dependencies are just directories of source files

### Type Sharing: Contracts Only

**Current mechanism** (working, don't change):
- TypeScript defines interfaces in `wsi-server.ts`
- Python defines Pydantic models in `protocol.py`
- Both manually kept in sync with WSI Protocol spec

**This IS the contracts pattern**:
- Human-readable spec is the source of truth (`wsi-protocol.md`)
- Each language implements the spec independently
- No code generation, no shared packages

### Container-First Organization

**Principle**: Top-level organization by which container the code runs in.

**Benefits**:
1. Clear language boundary: orchestrator = TypeScript, agent = Python
2. Each container is self-contained for Docker builds
3. No confusion about what belongs where
4. vendor/ is just source code under agent/src/vendor/

---

## ULTRATHINK: Container-First Monorepo Analysis

### The Question

Is organizing by container at the top level a good idea?

### Current Structure (Mixed)

```
app-factory/
├── apps/leo-saas/          # TS (but under apps/)
├── remote/                 # TS (CLI + libs mixed)
├── src/                    # Python (Leo agent code)
├── leo_container/          # Python (container runtime)
├── vendor/                 # Python (cc-agent, cc-tools - external)
└── docs/, .claude/, etc.
```

**Problems**:
1. TypeScript split across apps/, remote/
2. Python split across src/, leo_container/, vendor/
3. No clear "what goes in which container?" answer
4. vendor/ is external packages, not source

### Proposed Structure (Container-First)

```
app-factory/
│
├── orchestrator/                    # ORCHESTRATOR CONTAINER (TypeScript)
│   │
│   ├── apps/
│   │   └── leo-saas/                # SaaS web app
│   │       ├── client/              # React frontend
│   │       ├── server/              # Express backend
│   │       └── shared/              # Contracts, types
│   │
│   ├── cli/
│   │   └── leo-remote/              # CLI tool
│   │
│   ├── lib/                         # Shared TypeScript libraries
│   │   ├── wsi-server/              # WSI server implementation
│   │   └── container-manager/       # Container lifecycle
│   │
│   ├── package.json                 # Single package, no workspaces
│   ├── tsconfig.json
│   └── Dockerfile
│
├── agent/                           # AGENT CONTAINER (Python)
│   │
│   ├── leo/                         # Leo deep agent RESOURCES
│   │   ├── agents/
│   │   │   ├── reprompter/          # Outer loop prompts
│   │   │   ├── orchestrator/        # Pipeline prompt
│   │   │   └── subagents/           # Subagent prompts + patterns
│   │   ├── skills/                  # Domain knowledge
│   │   └── config/                  # mcp.json
│   │
│   ├── elon/                        # Elon deep agent (future)
│   │   └── (copy of leo/, modified)
│   │
│   ├── src/                         # Python SOURCE CODE
│   │   ├── leo/                     # Leo agent code
│   │   │   ├── agents/              # Python implementations
│   │   │   │   ├── app_generator/
│   │   │   │   └── reprompter/
│   │   │   └── run_app_generator.py
│   │   │
│   │   ├── runtime/                 # Container runtime
│   │   │   ├── wsi_client/          # WSI client implementation
│   │   │   ├── workspace/           # Workspace management
│   │   │   └── git_manager/         # Git operations
│   │   │
│   │   └── vendor/                  # Dependencies AS SOURCE
│   │       ├── cc_agent/            # Claude Code agent SDK
│   │       └── cc_tools/            # MCP tools
│   │
│   ├── pyproject.toml               # Single project, no workspaces
│   └── Dockerfile
│
├── contracts/                       # SHARED INTERFACE SPECS
│   ├── wsi-protocol.md              # Message format, lifecycle
│   ├── container-manager.md         # Spawn, env vars, health
│   └── deep-agent-pattern.md        # Agent structure spec
│
├── docs/                            # Documentation (not code)
│
└── PLAN.md
```

### Analysis: Why Container-First Works

**1. Language Boundary is Crystal Clear**

```
orchestrator/  →  TypeScript ONLY
agent/         →  Python ONLY
contracts/     →  Markdown ONLY (human-readable specs)
```

No mixed directories. No confusion about "is this Python or TypeScript?"

**2. Docker Builds are Self-Contained**

```dockerfile
# orchestrator/Dockerfile
FROM node:20
COPY . /app
RUN npm install && npm run build

# agent/Dockerfile
FROM python:3.12
COPY . /app
RUN pip install -e .
```

Each Dockerfile can just `COPY . /app` - everything needed is in that directory.

**3. vendor/ Becomes Real Source Code**

Current: `vendor/cc_agent/` is an external package we install
Proposed: `agent/src/vendor/cc_agent/` is source code we own

**Implication**:
- We can modify cc_agent if needed
- No pip install from external source
- PYTHONPATH just needs `agent/src/` and it finds everything

**4. Migration Path for Elon**

```bash
# When Leo is clean and working:
cp -r agent/leo agent/elon
# Then modify elon/ for meta-development
```

Both agents live under `agent/` with identical structure.

**5. Contracts are the ONLY Shared Thing**

```
orchestrator/ ──┐
                ├── contracts/wsi-protocol.md
agent/ ─────────┘
```

No code is shared. Each side implements the spec. This is already how it works - just making it explicit.

### Migration Mapping

| Current | Container-First |
|---------|-----------------|
| `apps/leo-saas/` | `orchestrator/apps/leo-saas/` |
| `remote/` (CLI parts) | `orchestrator/cli/leo-remote/` |
| `remote/` (WSI/ContainerMgr) | `orchestrator/lib/` |
| `src/app_factory_leonardo_replit/` | `agent/src/leo/` |
| `leo_container/` | `agent/src/runtime/` |
| `vendor/` | `agent/src/vendor/` |
| `docs/pipeline-prompt-v2.md` | `agent/leo/agents/orchestrator/pipeline-prompt.md` |
| `apps/.claude/skills/` | `agent/leo/skills/` |
| `docs/patterns/` | `agent/leo/agents/subagents/*/patterns/` |
| `.claude/mcp.json` | `agent/leo/config/mcp.json` |

### Recommendation

**YES, container-first is a good idea.**

It aligns with:
1. The physical reality (two containers)
2. The language reality (TS vs Python)
3. The "no package managers" constraint
4. The contracts-based type sharing approach
5. The Elon bootstrap strategy

### Potential Concerns Addressed

**Q: What about shared utilities?**
A: There are none. Each container implements what it needs based on contracts.

**Q: What about local development?**
A: Each side has its own dev server. They communicate via WebSocket same as production.

**Q: What about CI/CD?**
A: Better! Can build/test each container independently: `docker build orchestrator/`

**Q: What about git history?**
A: Use `git mv` to preserve history. Some disruption is acceptable for cleaner structure.

---

## References

- [Claude Agent SDK Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents) - Official SDK docs
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) - CLI docs
- [Task Tool vs Subagents](https://www.icodewith.ai/blog/task-tool-vs-subagents-how-agents-work-in-claude-code/) - Explanation article
- [Building Agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) - Anthropic blog
