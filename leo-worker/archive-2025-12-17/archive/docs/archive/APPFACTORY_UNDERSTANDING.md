# Understanding of AppFactory

Based on my review of `app-factory.md` and subsequent refinements, I understand that AppFactory is an automated system 
for generating full-stack web applications from user ideas. Here's my understanding:

## Core Philosophy: "Prompt to URL"

The fundamental principle is minimizing the distance between a user's idea and a working application. Users go from 
initial prompt to deployed URL with minimal friction.

## Core Concept

- Users submit an idea (e.g., "open source version of Slack")
- An orchestrator refines the idea through a single, streamlined conversation
- System intelligently infers the most commonly used features
- Specs are generated agentically from minimal input
- A working wireframe is created in under 60 seconds
- The wireframe evolves into the final implementation
- The app is deployed automatically to AWS (black-box to users)

## Key Design Principles

1. **Convention over Configuration**: Users never see technical choices; all decisions are pre-made
2. **Smart Inference**: System assumes common features based on app type (e.g., Slack = channels, DMs, files)
3. **WYSIWYG Approach**: Wireframes are actual Next.js apps, not just mockups
4. **Top-down Modular Decomposition**: Breaking down by natural domain boundaries (frontend/backend)
5. **Mandated Tech Stacks**:
    - Frontend: Next.js 14, React 18, ShadCN, Tailwind
    - Backend: Python 3.12, FastAPI, containerized
    - Deployment: AWS CDK with L3/L2 constructs
6. **Self-healing**: Error correction lambdas monitor logs and auto-fix issues
7. **Real-time Understanding**: Twitter-style summaries show what system comprehends

## Streamlined Orchestrator

The orchestrator has evolved from multi-round conversations to:
- Single-exchange interactions (one question: team size)
- Pre-selected feature sets with opt-out checkboxes
- Immediate understanding display
- No technical questions exposed to users
- Complete refinement in under 60 seconds

## Current State

- The repository contains the Zenith app (a project management tool like Asana) 
- The slack-clone directory now has:
  - Streamlined orchestrator conversation example
  - Feature specifications reference (developer guide)
- This is the manual implementation phase before full automation
- AppFactory is the platform; Slack clone is the example implementation