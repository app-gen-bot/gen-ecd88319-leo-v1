# Pipeline Design Methodology

## Purpose

This document defines the top-down modular design approach for human-AI collaboration on Leonardo App Factory pipeline
development.

**Goal**: Enable clear, concise pipeline design at the top level that both humans can scan and AI can implement.

---

## Core Principles

### 1. Artifact Dependencies Drive Design

**Artifacts are the foundation**, not agents or stages.

- **Artifacts**: Files, data structures, specifications (e.g., `schema.zod.ts`, `plan.md`, `routes/*`)
- **Stages**: Groups of agents that transform input artifacts into output artifacts
- **Dependencies**: What feeds into what - this determines execution order and parallelization

**Why it matters**: Artifact dependencies reveal:

- Which stages must run sequentially
- Which stages can run in parallel
- What the contract/interface is between stages

### 2. Parallelization via Dependency Analysis

**Key insight**: Once certain artifacts exist, independent work streams can proceed in parallel.

**Example from Holy Grail Pipeline**:

```
Stage 1: Plan → plan.md
Stage 2: Backend Spec → schema.zod.ts + contracts/*.ts

[PARALLELIZATION POINT]
Stage 3a: Backend Implementation (uses schema + contracts)
Stage 3b: Frontend Spec (uses plan + contracts)
```

After `schema.zod.ts` and `contracts/*.ts` exist, backend implementation and frontend spec generation have zero
dependencies on each other.

**Representation**: Use multiple tables to show sequential → parallel splits:

- Table 1: Sequential stages leading to parallelization point
- Table 2: Backend parallel track
- Table 3: Frontend parallel track

### 3. Documentation Layers

Pipeline documentation follows a three-layer hierarchy:

#### Layer 1: Pipeline Overview (Top Level)

**File**: `pipeline_*.md` (main tables)
**Audience**: Human designer + AI implementer
**Content**:

- Artifact flow tables (Stage | Artifacts In | Artifacts Out)
- Concise, scannable format
- NO clutter: No examples, no "NEW/MODIFIED" labels, no verbose explanations

#### Layer 2: Stage Details

**File**: Same `pipeline_*.md` (Stage Details section)
**Audience**: AI implementer
**Content**:

- Agent lists per stage
- Input/Output specifications
- Implementation notes (valuable context)
- NO verbose format examples or code blocks

#### Layer 3: Agent-Specific Documentation

**File**: Agent-specific docs in `src/app_factory_leonardo_replit/agents/*/`
**Audience**: Agent developer
**Content**:

- System prompts
- User prompt builders
- Agent configuration
- Writer-Critic patterns
- Detailed examples and code

---

## Design Process

### Step 1: Define Artifact Dependency Graph

Start by identifying all artifacts and their dependencies:

```
1. What artifacts does the pipeline produce?
2. What are the dependencies between them?
3. Which artifacts unlock parallel work?
```

**Tool**: Draw dependency graph (conceptually or with Mermaid)

### Step 2: Identify Parallelization Points

Find artifacts that unlock independent work streams:

```
1. Which artifacts are consumed by multiple stages?
2. Do those stages depend on each other?
3. If not → parallelization opportunity
```

**Example**: `contracts/*.ts` consumed by both Backend Implementation and Frontend Spec, but those stages don't depend
on each other.

### Step 3: Structure Tables

Organize pipeline tables to show flow:

**Sequential Section**:

```
Stage | Artifacts In | Artifacts Out
------|--------------|---------------
...   | ...          | schema.zod.ts, contracts/*.ts  ← parallelization point
```

**Parallel Sections** (side by side or separate tables):

```
Backend Track               Frontend Track
Stage | In | Out            Stage | In | Out
------|----|-               ------|----|-
```

### Step 4: Iterate at Top Level

**Before drilling down**:

1. Review artifact flow with human
2. Validate parallelization points make sense
3. Confirm stage boundaries are logical
4. Get approval on high-level design

**Then proceed** to Layer 2 (agent details) and Layer 3 (implementation).

---

## Documentation Standards

### Top-Level Table Format

**Good** (concise, artifact-focused):

```
│ Stage           │ Artifacts In      │ Artifacts Out     │
│ Backend Spec    │ • plan.md         │ • schema.zod.ts   │
│                 │                   │ • contracts/*.ts  │
```

**Bad** (cluttered, agent-focused):

```
│ Stage           │ In      │ Agents (NEW!)         │ Out (see example below!) │
│ Backend Spec    │ plan.md │ • schema_designer     │ • schema.zod.ts          │
│                 │         │ • contracts_designer  │ • contracts/*.ts         │
```

### Stage Details Format

**Good** (concise, structured):

```
### Stage: Backend Spec

**Purpose**: Define data models and API contracts

Input:  plan/plan.md
Agents: schema_designer, contracts_designer
Output: specs/schema.zod.ts, specs/contracts/*.contract.ts

**Implementation Notes**:
- Zod schemas become single source of truth
- Contracts reference schemas for type safety
```

**Bad** (verbose with unnecessary examples):

```
### Stage: Backend Spec (NEW!)

**Purpose**: Define data models and API contracts as source of truth

[50 lines of YAML example showing contract format...]
```

---

## Benefits of This Approach

### For Humans

- **Scannable**: See entire pipeline flow at a glance
- **Focus**: Artifact dependencies reveal architecture clearly
- **Efficient**: Approve design before implementation details

### For AI

- **Clarity**: Unambiguous stage boundaries and contracts
- **Modularity**: Can implement one stage at a time
- **Context**: Implementation notes provide just enough guidance

### For Collaboration

- **Shared vocabulary**: Artifacts, stages, dependencies
- **Iterative**: Design → approve → implement → refine
- **Scalable**: Add complexity incrementally (Layer 1 → Layer 2 → Layer 3)

---

## Future Refinements

Topics to explore as we iterate:

1. **Visual representations**: Mermaid graphs for complex dependency trees?
2. **Dependency notation**: Explicit arrows or references in tables?
3. **Stage naming conventions**: Consistent patterns (Spec vs Implementation)?
4. **Parallel execution syntax**: How to show "these N stages run together"?
5. **Artifact versioning**: How to handle evolving specifications?

**This doc is living** - update as we discover better patterns.