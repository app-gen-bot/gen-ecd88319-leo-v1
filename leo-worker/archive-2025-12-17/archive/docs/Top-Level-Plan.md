Top Level Plan 2025-07-06 doc

Continue designing and implementing V2 (src/app_factory)
using the new designs and patterns from the docs/2025-07-06

We want to review V1 (v1_appfactory/app-factory/src/app_factory/top_down_modular) and use all good ideas from its
prompts, tools, workflow, docs, and
implementation patterns/structures.

V1 was created with MCP-Agent and it required more agents and more tools. CC-Agent in V2 provides us with much more
capability per agent and per tool and simplified tools and more built-in (Claude Code) tools that just come with CC-
Agent already.

We have already done this end-to-end, and implemented everything, and created all the spec documents, and output
documents, in examples/slack-clone . we can use them as input for each stage and as a comparison output for each stage.
That will help us develop each stage independently.

===============================================================================

top_down_modular has the latest changes. Here's the evidence:

1. Timestamps:
   - frontend_developer/main.py: May 31
   - top_down_modular/main.py: June 15 (newer)
2. Content:
   - top_down_modular has extensive documentation including:
    - A detailed CLAUDE.md describing a multi-agent workflow
    - Status tracking in JAKE-Left-Off.md showing active development
    - IMPLEMENTATION_STATUS.md showing a "Frontend Spec v2.0" architecture
      - It implements a more sophisticated multi-agent system with spec analyzer, init project, and frontend developer
      agents
3. Architecture:
   - top_down_modular uses a "Frontend Spec v2.0" with a two-layer architecture:
    - Shared foundation files (00-shared/)
    - Implementation chunks (01-, 02-, etc.)
      - Has a chunk-based processing system with template resolution
4. Current Issue:
   - The JAKE-Left-Off.md shows they were debugging a YAML parsing error in tech-stack.yaml
   - There's a discussion about simplifying the approach to just pass all spec files to the LLM instead of complex
   template resolution

The top_down_modular directory represents a more evolved version of the system with a multi-agent architecture and a
sophisticated specification system, while frontend_developer appears to be an earlier, simpler
implementation.

===============================================================================
v1_appfactory/app-factory/src/app_factory/top_down_modular
v1_appfactory/app-factory/src/app_factory/top_down_modular/agents/frontend_developer_v2

