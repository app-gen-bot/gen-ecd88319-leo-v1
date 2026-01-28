# Software Product Line (SPL) Engineering

## What is SPL?

**Software Product Line** is a methodology for building families of related systems from shared assets with controlled
variation.

### Core Concepts

**Core Assets / Platform**

- Shared modules, libraries, components that all variants use
- In your case: base pipeline framework, common utilities, shared prompts

**Variation Points**

- Places where variants differ (toggleable "holes" in the architecture)
- Your variation points:
    - Pipeline composition
    - Stage implementations
    - Agent patterns (BM25 vs dense retrieval, etc.)
    - Prompt versions

**Feature Model**

- Enumerates features (capabilities/options) and constraints
- Example: "Dense retrieval requires FAISS; conflicts with BM25"
- A **product** = valid selection of features

**Product Derivation**

- Process of building a specific variant by selecting values for variation points
- In your case: assembling experiment from specific stage/agent/prompt versions

### SPL Approaches

1. **Proactive** - Design product line upfront, build platform first
2. **Reactive** - Refactor existing variants into product line (YOUR CASE)
3. **Extractive** - Analyze existing products, extract reusable components

## How SPL Solves Your Problem

### The Matrix-of-Variants Problem

Instead of:

- Branch for prompt_v1 + agent_a
- Branch for prompt_v1 + agent_b
- Branch for prompt_v2 + agent_a
- Branch for prompt_v2 + agent_b
- (4 branches, exponential growth)

SPL approach:

- Define targets: `prompt_v1`, `prompt_v2`, `agent_a`, `agent_b`
- Manifest selects: `{prompt: v1, agent: a}` → one experiment
- No branches needed, linear target growth

### Variation as Configuration, Not Code Duplication

Move variation from "copy code and tweak" to "select component label":

```yaml
# experiment_a.yaml
select:
  stage.rank: "//stages/rank:dense"
  agent.retriever: "//agents/retriever:faiss_v2"
  prompt.answer: "//prompts:answer_v3"

# experiment_b.yaml  
select:
  stage.rank: "//stages/rank:bm25"        # different
  agent.retriever: "//agents/retriever:faiss_v2"  # same
  prompt.answer: "//prompts:answer_v3"            # same
```

Only `stage.rank` differs; rest is reused.

## Applying SPL to Your AI Pipeline

### Identify Your Product Line Scope

**Product line**: "AI application generation pipeline"

**Products (variants)**:

- Different pipeline configurations
- Different agent combinations
- Different prompt strategies
- Cross-person experiments

### Map Variation Points

| Variation Point     | Variants               | Constraints                   |
|---------------------|------------------------|-------------------------------|
| Pipeline type       | Standard, Sprint-based | -                             |
| Stage 0 (PRD)       | Simple, Detailed       | Detailed requires more tokens |
| Stage 1 (Spec)      | Iterative, Single-pass | Iterative recommended         |
| Stage 2 (Wireframe) | Writer-Critic, Direct  | Writer-Critic for quality     |
| Retriever agent     | Dense, BM25, Hybrid    | Dense requires embeddings     |
| Answer prompt       | v1, v2, v3             | v3 requires retriever v2+     |

### Define Core Assets

What's shared across ALL variants:

- Base agent framework (`cc_agent/`)
- Pipeline orchestration logic
- Shared utilities, schemas
- Base prompts (versioned from here)

### Create Feature Model

Capture valid combinations:

```yaml
# Valid configurations
features:
  pipeline: [ standard, sprint ]
  prd_mode: [ simple, detailed ]
  spec_mode: [ iterative, single ]
  wireframe_mode: [ writer_critic, direct ]

constraints:
  - sprint requires detailed_prd
  - writer_critic requires iterative_spec
  - cannot combine bm25 + dense (pick one)
```

## Benefits for Agentic Development

### 1. Agents See Complete, Coherent View

SPL materialization creates a working directory with:

- All selected components as source code
- No missing dependencies
- Internally consistent versions
- Full codebase context for AI

### 2. Reproducible Agent Runs

```yaml
git_sha: "3b5e8f7"
manifest: "configs/exp_001.yaml"
```

= Exact source view that agent saw

### 3. Systematic Testing

Test valid feature combinations:

- Unit tests per component
- Integration tests per valid product
- Constraint validation (reject invalid combos)

### 4. Evolution Without Duplication

Add new variant → new target, not new branch
Retire old variant → delete target, keep history
Experiment → manifest, not long-lived branch

## Key Takeaway

SPL reframes your problem from:

- "How do I manage branches?"

To:

- "What are my variation points, and how do I compose valid products?"

This mindset shift enables manifest-driven development where variants are **assembled**, not **branched**.