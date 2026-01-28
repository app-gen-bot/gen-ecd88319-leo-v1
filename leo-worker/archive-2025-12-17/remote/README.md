# Leo Remote

Remote CLI and container for running Leo via WSI Protocol.

## Overview

This directory contains everything needed to run Leo remotely:

- **`cli/`** - TypeScript CLI that spawns containers and manages WebSocket communication
- **`container/`** - Python container that runs AppGeneratorAgent via WSI Protocol
- **`docs/`** - Architecture documentation

## Quick Start

### 1. Build the Container

```bash
cd container
./build.sh
```

### 2. Install CLI Dependencies

```bash
cd cli
npm install
```

### 3. Run Leo Remotely

```bash
# Set Claude token
export CLAUDE_CODE_OAUTH_TOKEN=your_token_here

# Generate an app
npx ts-node src/index.ts "Create a todo app with React" --app-name todo

# Or with a prompt file
npx ts-node src/index.ts --prompt-file spec.txt --app-name myapp
```

## Architecture

```
┌─────────────────────┐                    ┌─────────────────────┐
│   leo-remote CLI    │                    │   Leo Container     │
│   (TypeScript)      │◄───────────────────│   (Python)          │
│                     │  Container connects │                     │
│ • Runs WS Server    │  and sends 'ready' │ • WSI Server logic  │
│ • Spawns container  │                    │ • AppGeneratorAgent │
│ • Renders terminal  │  WS messages flow  │ • Claude Code       │
│                     │  bidirectionally   │                     │
└─────────────────────┘                    └─────────────────────┘
      Port 8765                                 Connects to
    (accepts conn)                          ws://host:8765/ws/job_X
```

## WSI Protocol v2.1

Communication uses the WSI (WebSocket Interface) Protocol:

### Container → CLI Messages
- `ready` - Container connected and ready
- `log` - Console output (streamed)
- `progress` - Generation progress
- `iteration_complete` - Single iteration done
- `all_work_complete` - All work finished
- `decision_prompt` - User input needed (interactive modes)
- `error` - Error occurred

### CLI → Container Messages
- `start_generation` - Begin generation with prompt/mode
- `decision_response` - User's decision

## Directory Structure

```
remote/
├── README.md           # This file
├── PLAN_2025-12-10.md  # Implementation plan
│
├── cli/                # TypeScript CLI
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           # CLI entry point
│       ├── protocol.ts        # WSI message types
│       ├── wsi-server.ts      # WebSocket server
│       └── container-manager.ts # Docker management
│
├── container/          # Python container
│   ├── Dockerfile
│   ├── build.sh
│   ├── requirements.txt
│   └── src/
│       ├── main.py            # Container entry point
│       └── wsi_server/        # WSI implementation
│           ├── protocol.py    # Message types
│           ├── server.py      # WebSocket client
│           └── state_machine.py
│
└── docs/               # Documentation
    └── (architecture docs)
```

## Development

### Running Tests

```bash
# CLI tests
cd cli && npm test

# Container tests (TODO)
cd container && python -m pytest
```

### Building for Production

```bash
# Build container with specific tag
cd container
./build.sh abc123  # Uses commit hash as tag
```

## Reuse in leo-saas

The `cli/src/` modules are designed for reuse:

- `container-manager.ts` - Copy to `leo-saas/app/server/docker/`
- `wsi-server.ts` - Copy to `leo-saas/app/server/websocket/`
- `protocol.ts` - Copy to `leo-saas/app/shared/`

These provide the foundation for multi-user, multi-container orchestration.
