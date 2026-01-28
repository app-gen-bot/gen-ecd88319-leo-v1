# Leo Container Agent/Skill Inventory

Reference document for all agents, subagents, and skills in Leo Container.

## Main Agents

| Agent | Location | Status |
|-------|----------|--------|
| `app_generator` | `src/leo/agents/app_generator/` | Active |
| `reprompter` | `src/leo/agents/reprompter/` | Active |

## Subagents (under app_generator)

| Subagent | Python Definition | `.claude/agents/*.md` | Status |
|----------|------------------|----------------------|--------|
| `research_agent` | `subagents/research_agent.py` | `research_agent.md` | Active (both) |
| `code_writer` | `subagents/code_writer/agent.py` | `code_writer.md` | Active (both) + Skill |
| `quality_assurer` | `subagents/quality_assurer/agent.py` | `quality_assurer.md` | Active (both) |
| `error_fixer` | `subagents/error_fixer/agent.py` | `error_fixer.md` | Active (both) |
| `ai_integration` | `subagents/ai_integration/agent.py` | `ai_integration.md` | Active (both) |
| `schema_designer` | Removed | `schema_designer.md` | Deprecated → Skill |
| `api_architect` | Removed | `api_architect.md` | Deprecated → Skill |
| `ui_designer` | Removed | `ui_designer.md` | Deprecated → Skill |

## Skills (`~/.claude/skills/`)

| Skill | Container Path | Notes |
|-------|---------------|-------|
| `schema-designer` | `~/.claude/skills/schema-designer/` | Was subagent |
| `api-architect` | `~/.claude/skills/api-architect/` | Was subagent |
| `ui-designer` | `~/.claude/skills/ui-designer/` | Was subagent |
| `code-writer` | `~/.claude/skills/code-writer/` | Hybrid (also subagent) |
| `drizzle-orm-setup` | `~/.claude/skills/drizzle-orm-setup/` | |
| `supabase-project-setup` | `~/.claude/skills/supabase-project-setup/` | |
| `supabase-auth-setup` | `~/.claude/skills/supabase-auth-setup/` | |
| `supabase-auth` | `~/.claude/skills/supabase-auth/` | |
| `supabase-storage` | `~/.claude/skills/supabase-storage/` | |
| `production-smoke-test` | `~/.claude/skills/production-smoke-test/` | |
| `schema-query-validator` | `~/.claude/skills/schema-query-validator/` | |
| `factory-lazy-init` | `~/.claude/skills/factory-lazy-init/` | |
| `storage-factory-validation` | `~/.claude/skills/storage-factory-validation/` | |
| `type-safe-queries` | `~/.claude/skills/type-safe-queries/` | |
| `readme-generator` | `~/.claude/skills/readme-generator/` | |

## Known Issues

### `.claude/agents/*.md` files
- Have **wrong paths** (`/Users/labheshpatel/...` instead of `/factory/leo/...`)
- **Not used** by Leo (uses Python `AgentDefinition` instead)
- Need review: fix paths or remove

## Anthropic Standard Reference

### Subagents (`.claude/agents/`)
```
Project: .claude/agents/my-subagent.md    # Project-level
User:    ~/.claude/agents/my-subagent.md  # User-level (global)
```

### Skills (`.claude/skills/`)
```
Project: .claude/skills/my-skill/         # Project-level
User:    ~/.claude/skills/my-skill/       # User-level (global)
```

### Subagent File Format
```markdown
---
name: my-subagent
description: When to use this subagent
tools: Read, Write, Edit
model: sonnet
skills: skill-1, skill-2
---

System prompt here...
```
