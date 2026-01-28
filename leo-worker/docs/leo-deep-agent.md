# Deep Agent Architecture - File Mapping

This document maps the "deep agent" architecture of the app-factory codebase. The system follows a nested agent pattern with multiple entity types working together.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OUTER LOOP (Reprompter)                        │
│  Invokes AppGeneratorAgent per iteration, reads changelogs/summaries   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    ITERATION LOOP (AppGenerator)                 │   │
│  │  Instantiated by Python code (run_app_generator.py)             │   │
│  │  Uses cc_agent.Agent with SDK agents passed to constructor      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐│   │
│  │  │                    SUBAGENTS (via Task tool)                ││   │
│  │  │  Defined as AgentDefinition dataclasses in Python           ││   │
│  │  │  Passed to cc_agent.Agent(agents=sdk_agents)                ││   │
│  │  │  Spawned by Claude Code when Task tool is called            ││   │
│  │  │                                                             ││   │
│  │  │  • research_agent    • quality_assurer                      ││   │
│  │  │  • code_writer*      • error_fixer                          ││   │
│  │  │  • ai_integration    (* = hybrid, also has skill)           ││   │
│  │  └─────────────────────────────────────────────────────────────┘│   │
│  │                              ↑                                   │   │
│  │                         [reads]                                  │   │
│  │                              ↓                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐│   │
│  │  │                    SKILLS (knowledge packages)              ││   │
│  │  │  Markdown files read BEFORE writing code                    ││   │
│  │  │  Loaded via setting_sources=["user", "project"]             ││   │
│  │  │                                                             ││   │
│  │  │  FORMER SUBAGENTS (converted to skills 2025-11):            ││   │
│  │  │  • schema-designer      • api-architect                     ││   │
│  │  │  • ui-designer          • code-writer*                      ││   │
│  │  │                                                             ││   │
│  │  │  INFRASTRUCTURE SKILLS:                                     ││   │
│  │  │  • supabase-project-setup   • drizzle-orm-setup             ││   │
│  │  │  • supabase-auth-setup      • type-safe-queries             ││   │
│  │  └─────────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              ↑
                         [uses]
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         MCP TOOLS (external capabilities)              │
│  Configured in config.py and passed to cc_agent.Agent(mcp_tools=[])    │
│  • chrome_devtools    • build_test       • package_manager             │
│  • dev_server         • shadcn           • cwd_reporter                │
│  • supabase           • supabase_setup   • integration_analyzer        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Instantiation Flow

```
Python Entry Point (run_app_generator.py)
        │
        ▼
AppGeneratorAgent.__init__()
        │
        ├─► _initialize_subagents()
        │        └─► get_all_subagents() → Dict[str, AgentDefinition]
        │
        ├─► _convert_subagents_to_sdk_format()
        │        └─► Transforms AgentDefinition → SDK agent format
        │
        └─► cc_agent.Agent(
                system_prompt=pipeline_prompt,
                agents=sdk_agents,           # ← Subagents go here
                mcp_tools=[...],             # ← MCP tools go here
                setting_sources=["user", "project"],  # ← Enables Skills
            )
```

**When the running agent uses Task tool**:
```
LLM outputs: Task(subagent_type="code_writer", prompt="...")
        │
        ▼
Claude Code spawns subagent with:
  - The prompt/tools defined in AgentDefinition
  - Fresh context (isolated from parent)
  - Returns result to parent agent
```

---

## Entity Types

### 1. Agents (Python Classes)

Primary orchestrators that manage LLM calls with specific tools and prompts. These are **instantiated by Python code**.

| Agent | Purpose | Model | Location |
|-------|---------|-------|----------|
| **AppGeneratorAgent** | Main orchestrator for app generation | claude-opus-4-5 | `leo-container/src/leo/agents/app_generator/` |
| **ReprompterAgent** | Outer loop controller for autonomous iteration | claude-opus-4-5 | `leo-container/src/leo/agents/reprompter/` |
| **RetrospectiveAgent** | Post-generation analysis and learnings | N/A | `leo-container/src/leo/agents/retrospective/` |

**File Structure Pattern** (each agent directory):
```
agents/{agent_name}/
├── agent.py           # Agent class implementation (wraps cc_agent.Agent)
├── config.py          # Tools, model, max_turns configuration
├── prompt.py          # System/user prompts (optional)
└── subagents/         # Nested agent definitions (AppGenerator only)
```

**How Python Agents Are Instantiated**:
```python
# Entry point (run_app_generator.py)
agent = AppGeneratorAgent()  # Python instantiation
result = await agent.generate_app("Create a todo app")
```

---

### 2. Subagents (Task Tool Delegation)

Subagents are **NOT Python objects** that get instantiated. They are `AgentDefinition` dataclasses that describe:
- A prompt (system instructions)
- A list of tools
- A model preference

These definitions are passed to `cc_agent.Agent(agents=...)` at construction time. When the running LLM calls the `Task` tool with a `subagent_type`, Claude Code spawns a fresh agent process using that definition.

**Current Subagents** (as of 2025-11):

| Subagent | Purpose | Status |
|----------|---------|--------|
| **research_agent** | Research requirements, APIs, best practices | Active |
| **code_writer** | Write production TypeScript/React code | **Hybrid** (also skill) |
| **quality_assurer** | Test, validate, ensure code quality | Active |
| **error_fixer** | Fix errors and resolve issues | Active |
| **ai_integration** | AI features, chat interfaces, ML integration | Active |

**Deprecated Subagents** (converted to Skills 2025-11):

| Former Subagent | Replaced By | Date |
|-----------------|-------------|------|
| schema_designer | `schema-designer` skill | 2025-11-18 |
| api_architect | `api-architect` skill | 2025-11-18 |
| ui_designer | `ui-designer` skill | 2025-11-21 |

**Location**: `leo-container/src/leo/agents/app_generator/subagents/`

```
subagents/
├── __init__.py           # Exports get_all_subagents(), documents deprecations
├── research_agent.py     # Defines AgentDefinition dataclass + research_agent
├── code_writer.py        # Hybrid: subagent + skill
├── quality_assurer.py
├── error_fixer.py
└── ai_integration.py
```

**AgentDefinition Structure** (from research_agent.py):
```python
@dataclass
class AgentDefinition:
    """Definition for a specialized subagent."""
    description: str                                    # Short description for Task tool
    prompt: str                                         # System prompt for the subagent
    tools: Optional[List[str]] = None                   # Tools this subagent can use
    model: Optional[Literal["sonnet", "opus", "haiku", "inherit"]] = None
```

**Subagent vs Skill - Key Distinction**:
- **Subagent** = Delegated execution (Task tool spawns fresh agent, runs autonomously, returns result)
- **Skill** = Knowledge injection (agent reads patterns into context, then writes code with that knowledge)

---

### 3. Skills (Knowledge Packages)

Markdown files containing battle-tested patterns, configurations, and step-by-step instructions. Skills are **read by agents** before writing code in specific domains.

**Location**: `/apps/.claude/skills/` (relative to app-factory root)

| Skill | Domain | Key Patterns |
|-------|--------|--------------|
| **schema-designer** | Database schema design | Zod schemas, Drizzle tables |
| **api-architect** | RESTful API design | ts-rest contracts, auth |
| **code-writer** | TypeScript/React code | Component patterns |
| **ui-designer** | UI/UX design | Dark mode, shadcn/ui |
| **supabase-project-setup** | Supabase provisioning | Project creation, pooler config |
| **drizzle-orm-setup** | Drizzle ORM configuration | db.ts, migrations |
| **supabase-auth-setup** | Authentication setup | Auth adapters, JWT |
| **supabase-auth** | Auth implementation | Login/signup flows |
| **supabase-storage** | File storage | Bucket configuration |
| **type-safe-queries** | Type-safe DB queries | Drizzle query patterns |
| **storage-factory-validation** | Storage pattern validation | IStorage interface |

**File Structure**:
```
skills/{skill-name}/
├── SKILL.md              # Main skill documentation (REQUIRED)
├── examples/             # Code examples (optional)
└── templates/            # Starter templates (optional)
```

**How Skills are Used**:
1. Pipeline prompt specifies skill paths: `../../.claude/skills/schema-designer/SKILL.md`
2. Agent reads SKILL.md BEFORE writing any code in that domain
3. Agent follows patterns exactly as documented
4. If SKILL.md not found → **FATAL ERROR** (no guessing allowed)

---

### 4. MCP Tools (External Capabilities)

Model Context Protocol tools that provide external capabilities beyond file operations.

**Configuration**: `agents/app_generator/config.py` (AGENT_CONFIG.allowed_tools)

| Category | Tools | Purpose |
|----------|-------|---------|
| **Browser Automation** | `mcp__chrome_devtools__*` | Page navigation, clicks, screenshots |
| **Build/Test** | `mcp__build_test__verify_project` | TypeScript compilation checks |
| **Package Management** | `mcp__package_manager__*` | npm operations |
| **Dev Server** | `mcp__dev_server__*` | Start/stop dev servers |
| **Components** | `mcp__shadcn__*` | shadcn/ui component installation |
| **CWD** | `mcp__cwd_reporter__*` | Path resolution utilities |
| **Integration** | `mcp__integration_analyzer__*` | Template comparison |
| **Database** | `mcp__supabase__*` | Supabase management |
| **DB Setup** | `mcp__supabase_setup__*` | Supabase project creation |

**Archived** (in `leo-container/src/archive/cc_tools/`): mem0, graphiti, context_manager, tree_sitter

---

### 5. Prompts (System Instructions)

Define agent behavior and capabilities.

| Prompt | Location | Used By |
|--------|----------|---------|
| **Pipeline Prompt v2** | `leo-container/src/leo/resources/agents/orchestrator/pipeline-prompt-v2.md` | AppGeneratorAgent |
| **Prompting Guide** | `leo-container/src/leo/resources/agents/orchestrator/PROMPTING-GUIDE.md` | Prompt expansion |

**Pipeline Prompt Structure**:
- Mandatory skill reading rules
- Database connection rules (pooler vs direct)
- Incremental execution (skip if exists)
- Phase-by-phase instructions

---

### 6. Templates (Application Scaffolding)

Pre-built application structure extracted at generation start.

**Location**: `~/.mcp-tools/templates/`
**Current**: `vite-express-template-v2.1.0.tar.gz`

**Contents**:
- React + Vite frontend scaffold
- Express backend scaffold
- Shared types directory
- Package.json with dependencies
- Tailwind + shadcn/ui configuration

---

## Relationships

### Agent → Skills (reads)

```
AppGeneratorAgent
    ├── reads: schema-designer/SKILL.md
    ├── reads: api-architect/SKILL.md
    ├── reads: supabase-project-setup/SKILL.md
    ├── reads: drizzle-orm-setup/SKILL.md
    └── reads: supabase-auth-setup/SKILL.md
```

### Agent → Subagents (delegates)

```
AppGeneratorAgent
    └── Task tool →
        ├── research_agent (prompt exploration)
        ├── code_writer (file generation)
        ├── quality_assurer (validation)
        ├── error_fixer (iteration)
        └── ai_integration (AI features)
```

### Reprompter → AppGenerator (orchestrates)

```
ReprompterAgent (outer loop)
    └── invokes AppGeneratorAgent per iteration
        └── iteration produces:
            ├── changelog/summary files
            ├── generated app files
            └── error logs (if any)
```

### Skills → MCP Tools (references)

Skills may reference MCP tools that should be available:

```
supabase-project-setup/SKILL.md
    └── references: mcp__supabase_setup__create_supabase_project
        (Note: This tool doesn't exist in container - fallback to manual steps)
```

---

## File Locations Summary

```
app-factory/                                      # Repository root
│
├── leo-container/src/                            # Container source code
│   ├── main.py                                   # Entry point (WSI connection)
│   ├── leo/                                      # Leo agent package
│   │   ├── run_app_generator.py                  # CLI entry point (reference impl)
│   │   ├── agents/
│   │   │   ├── app_generator/
│   │   │   │   ├── agent.py                      # AppGeneratorAgent class
│   │   │   │   ├── config.py                     # AGENT_CONFIG, tool lists, paths
│   │   │   │   ├── prompt_expander.py            # LLM-based prompt expansion
│   │   │   │   ├── git_helper.py                 # Git integration utilities
│   │   │   │   └── subagents/                    # AgentDefinition dataclasses
│   │   │   │       ├── research_agent.py
│   │   │   │       ├── code_writer.py            # HYBRID: subagent + skill
│   │   │   │       ├── quality_assurer.py
│   │   │   │       ├── error_fixer.py
│   │   │   │       └── ai_integration.py
│   │   │   └── reprompter/
│   │   │       ├── agent.py                      # ReprompterAgent (outer loop)
│   │   │       └── config.py
│   │   └── resources/
│   │       ├── agents/orchestrator/
│   │       │   ├── pipeline-prompt-v2.md         # Main system prompt
│   │       │   └── PROMPTING-GUIDE.md            # Prompt expansion guide
│   │       ├── agents/subagents/                 # Subagent patterns
│   │       │   └── {subagent}/patterns/*.md
│   │       └── skills/                           # Skills (knowledge packages)
│   │           ├── schema-designer/SKILL.md
│   │           ├── api-architect/SKILL.md
│   │           ├── code-writer/SKILL.md
│   │           ├── ui-designer/SKILL.md
│   │           └── ...
│   ├── runtime/                                  # WSI + managers
│   │   ├── wsi/                                  # WebSocket Interface
│   │   └── managers/                             # Git, DB reset
│   ├── cc_agent/                                 # Agent base class
│   └── cc_tools/                                 # MCP tool servers
│
├── docs/                                         # Documentation
│   ├── leo-container-code-walkthrough.md         # Code tour
│   ├── wsi-cli-parity-analysis.md                # WSI vs CLI comparison
│   └── BACKLOG.md                                # Technical debt
│
└── specs/
    └── wsi-protocol.md                           # WSI Protocol v2.1 spec
```

---

## Key Insights

1. **Subagents are NOT Python objects** - They're `AgentDefinition` dataclasses describing what Task tool should spawn. The Python files define these dataclasses, not executable agents.

2. **Evolution: Subagents → Skills** - Several subagents were converted to skills (2025-11) because knowledge injection (read before code) was more effective than delegation (spawn separate agent).

3. **Hybrid pattern exists** - `code_writer` is both a subagent (for Task delegation) AND a skill (for pattern teaching). This allows both use cases.

4. **Three instantiation levels**:
   - **Python level**: `run_app_generator.py` instantiates `AppGeneratorAgent`
   - **SDK level**: `cc_agent.Agent(agents=...)` receives subagent definitions
   - **Runtime level**: Task tool spawns subagents when LLM requests delegation

5. **Skills vs Patterns** - Skills are in `apps/.claude/skills/`, while code_writer has additional patterns in `docs/patterns/code_writer/` (16 pattern files).

6. **MCP tools may be missing in containers** - Skills should document manual fallback steps when MCP tools (e.g., `supabase_setup`) aren't available.

7. **setting_sources enables Skills** - `cc_agent.Agent(setting_sources=["user", "project"])` is required for the agent to discover and use skills from the filesystem.
