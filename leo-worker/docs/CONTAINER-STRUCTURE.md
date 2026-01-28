# Leo Container Structure

> Definitive file structure for the Leo container.

---

## Top-Level Directories

```
/
├── factory/            # Platform code (WORKDIR)
├── workspace/          # Generated apps & artifacts
└── home/leo-user/      # User home
```

---

## /factory/ (Platform Code)

```
/factory/
├── cc_agent/                 # Agent SDK
├── cc_tools/                 # MCP tools
├── leo/                      # Leo agent
│   ├── agents/
│   │   ├── app_generator/    # Main orchestrator
│   │   └── reprompter/       # Outer loop
│   └── resources/
│       ├── agents/           # Prompts & patterns
│       │   ├── orchestrator/
│       │   ├── reprompter/
│       │   └── subagents/
│       ├── skills/           # Domain knowledge
│       └── config/           # MCP config
├── runtime/                  # Container runtime
│   ├── managers/             # Git, artifacts, db reset
│   ├── utils/                # AWS secrets, config, logging
│   └── wsi/                  # WebSocket interface
└── main.py                   # Entry point
```

---

## /workspace/ (Output)

```
/workspace/
├── app/                      # Generated app
│   └── .git/
└── leo-artifacts/            # Logs & artifacts
    └── .git/
```

Both directories have independent git repos for pushing to GitHub.

---

## Repo → Container Mapping

| Repo (leo-container/) | Container |
|-----------------------|-----------|
| `src/` | `/factory/` |
| `src/main.py` | `/factory/main.py` |
| `src/leo/` | `/factory/leo/` |
| `src/runtime/` | `/factory/runtime/` |
| `src/cc_agent/` | `/factory/cc_agent/` |
| `src/cc_tools/` | `/factory/cc_tools/` |

---

## Environment

| Variable | Value |
|----------|-------|
| `WORKDIR` | `/factory` |
| `PYTHONPATH` | `/factory` |
| `USER` | `leo-user` |
| `HOME` | `/home/leo-user` |
