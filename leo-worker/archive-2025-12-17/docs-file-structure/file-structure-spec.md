# Leo File Structure Specification

> **Purpose**: Definitive file structure for the Leo monorepo
> **Status**: Draft
> **Companion**: `leo-target-container-file-structure.md` (working analysis)

---

## Overview

Two containers, one contracts directory:

```
app-factory/
├── leo-saas/              # SaaS platform (TypeScript)
├── leo-container/         # Leo agent (Python)
├── contracts/             # Interface specifications
└── docs/                  # Documentation
```

| Directory | Language | Container | Purpose |
|-----------|----------|-----------|---------|
| `leo-saas/` | TypeScript | Leo SaaS | Web app, WSI server, container manager |
| `leo-container/` | Python | Leo Container | Leo agent, WSI client, workspace |
| `contracts/` | Markdown | N/A | Shared specs (WSI protocol, etc.) |

---

## Top Level

```
app-factory/
│
├── leo-saas/                        # SAAS CONTAINER (TypeScript)
│   ├── apps/                        # Deployable applications
│   ├── lib/                         # Shared libraries
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── leo-container/                   # LEO CONTAINER (Python)
│   ├── leo/                         # Leo agent resources
│   ├── elon/                        # Elon agent resources (future)
│   ├── src/                         # Python source code
│   ├── pyproject.toml
│   └── Dockerfile
│
├── contracts/                       # INTERFACE SPECS
│   ├── wsi-protocol.md
│   ├── container-manager.md
│   └── deep-agent-pattern.md
│
├── docs/                            # DOCUMENTATION
│
└── PLAN.md                          # Migration plan
```

---

## leo-saas/ (TypeScript)

SaaS platform container. Runs Express server, React frontend, WSI server.

```
leo-saas/
├── apps/
│   └── web/                         # Main SaaS web application
├── lib/
│   ├── wsi-server/                  # WSI protocol server
│   └── container-manager/           # Container lifecycle management
├── package.json
├── tsconfig.json
└── Dockerfile
```

### leo-saas/apps/

Deployable applications within the SaaS.

```
leo-saas/apps/
└── web/                             # Main web app (from apps/leo-saas/)
    ├── client/                      # React frontend
    │   ├── src/
    │   │   ├── pages/               # Route pages
    │   │   ├── components/          # UI components
    │   │   ├── hooks/               # Custom hooks
    │   │   ├── contexts/            # React contexts
    │   │   └── lib/                 # Utilities
    │   └── index.html
    ├── server/                      # Express backend
    │   ├── routes/                  # API routes
    │   ├── lib/                     # Server utilities
    │   └── index.ts                 # Entry point
    └── shared/                      # Shared types/contracts
        └── schema.ts
```

### leo-saas/lib/

Shared TypeScript libraries used by apps.

```
leo-saas/lib/
├── wsi-server/                      # WSI protocol implementation
│   ├── server.ts                    # WebSocket server
│   ├── types.ts                     # Message types
│   └── index.ts
└── container-manager/               # Container lifecycle
    ├── manager.ts                   # Spawn, health, shutdown
    ├── docker.ts                    # Docker implementation
    └── index.ts
```

---

## leo-container/ (Python)

Leo agent container. Runs the AI app generator.

```
leo-container/
├── leo/                             # Leo agent resources
├── elon/                            # Elon agent resources (future)
├── src/                             # Python source code
├── pyproject.toml
└── Dockerfile
```

### leo-container/leo/

Leo agent resources (prompts, skills, patterns). NOT code.

```
leo-container/leo/
├── agents/                          # Agent prompts and patterns
│   ├── reprompter/                  # Outer loop agent
│   │   ├── system-prompt.md
│   │   └── master-plan.md
│   ├── orchestrator/                # Main pipeline agent
│   │   └── pipeline-prompt.md
│   └── subagents/                   # Task-scoped agents
│       ├── code_writer/
│       │   ├── prompt.md
│       │   └── patterns/
│       ├── error_fixer/
│       ├── quality_assurer/
│       └── ...
├── skills/                          # Domain knowledge
│   ├── schema-designer/
│   │   └── SKILL.md
│   ├── api-architect/
│   ├── supabase-auth/
│   └── ...
└── config/
    └── mcp.json                     # MCP server config
```

### leo-container/elon/

Elon agent resources (future). Same structure as leo/, different content.

```
leo-container/elon/
├── agents/                          # Elon-specific prompts
├── skills/                          # Meta-development skills
└── config/
```

### leo-container/src/

Python source code.

```
leo-container/src/
├── leo/                             # Leo agent code
│   ├── agents/
│   │   ├── app_generator/           # Orchestrator implementation
│   │   │   ├── agent.py
│   │   │   ├── config.py
│   │   │   └── subagents/           # AgentDefinition classes
│   │   └── reprompter/              # Outer loop implementation
│   │       ├── agent.py
│   │       └── config.py
│   └── run_app_generator.py         # Entry point
├── runtime/                         # Container runtime
│   ├── wsi_client/                  # WSI protocol client
│   ├── workspace/                   # Workspace management
│   └── git_manager/                 # Git operations
└── vendor/                          # Dependencies as source
    ├── cc_agent/                    # Claude Code agent SDK
    └── cc_tools/                    # MCP tools
```

---

## contracts/

Interface specifications. Human-readable, implementation-agnostic.

```
contracts/
├── wsi-protocol.md                  # Message format, lifecycle
├── container-manager.md             # Spawn, env vars, health
└── deep-agent-pattern.md            # Agent structure spec
```

Both `leo-saas/` and `leo-container/` implement these specs independently.

---

## Container Layouts

### Leo SaaS Container

```
/app/                                # Working directory
├── apps/
├── lib/
├── node_modules/
└── dist/                            # Built output
```

### Leo Container

```
/leo/                                # Leo installation
├── leo/                             # Leo agent resources
│   ├── agents/
│   ├── skills/
│   └── config/
├── src/                             # Python code
│   ├── leo/
│   ├── runtime/
│   └── vendor/
└── pyproject.toml

/workspace/                          # Generated app workspace
├── .claude/
│   ├── mcp.json
│   └── skills/ → /leo/leo/skills/   # Symlink
└── {generated files}
```

---

## Migration Mapping

| Current Location | New Location |
|------------------|--------------|
| `apps/leo-saas/` | `leo-saas/apps/web/` |
| `remote/` (WSI, ContainerMgr) | `leo-saas/lib/` |
| `src/app_factory_leonardo_replit/` | `leo-container/src/leo/` |
| `leo_container/` or `remote/container/` | `leo-container/src/runtime/` |
| `vendor/` | `leo-container/src/vendor/` |
| `docs/pipeline-prompt-v2.md` | `leo-container/leo/agents/orchestrator/` |
| `apps/.claude/skills/` | `leo-container/leo/skills/` |
| `docs/patterns/` | `leo-container/leo/agents/subagents/*/patterns/` |
| `.claude/mcp.json` | `leo-container/leo/config/` |
