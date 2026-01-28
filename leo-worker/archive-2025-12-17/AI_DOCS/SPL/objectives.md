# Objectives: Managing AI Pipeline Variants

## Pain Points

### 1. Branch Hell

- **Problem**: Pipeline composed of stages → agents → prompts, all evolving at different rates
- **Current Issue**: Experimenting with one change (e.g., new prompt) requires a new branch, even when 90% stays the
  same
- **Result**: Proliferation of branches where only one component differs

### 2. Source-Level Sharing Between Collaborators

- **Problem**: Two people with different visions need to share and modify source code
- **Requirements**:
    - Start from collaborator's exact working pipeline state
    - Modify source directly (not just consume as versioned package)
    - Selectively adopt each other's changes back
    - Avoid primitive copy/paste or branch juggling

### 3. Agentic Development Context

- **Problem**: AI agents write all code, need to see the complete picture
- **Requirements**:
    - Agent must see full codebase to understand architecture
    - Can't work with hidden dependencies or partial views
    - Must work with familiar tools (Git, not exotic VCS)
    - Claude Code needs standard Git patterns

### 4. Matrix of Variants

- **Dimensions of Variation**:
    - Pipeline configurations
    - Stage implementations
    - Agent variants (patterns, algorithms)
    - Prompt versions
- **Challenge**: Need to compose experiments from different versions across all dimensions without exponential branching

## Goals

### Primary Goal

**Manifest-driven variant composition** where:

- Single repo with modular components
- Experiments defined as YAML manifests
- Source materialized from specific Git commits per path
- AI agents see coherent, complete codebase view

### Secondary Goals

1. **Fast iteration**: Only rebuild what changed
2. **Reproducibility**: Manifest + Git SHAs = exact repro
3. **Composability**: Mix and match components across experiments
4. **Gradual migration**: Can be shared to `/shared` when ready
5. **Traceability**: Know exactly which versions of what produced each result

## Success Criteria

- [ ] Can run experiments without creating branches
- [ ] Can compose variants from different Git commits per component
- [ ] AI agents can see and edit full codebase context
- [ ] Can selectively adopt collaborator's changes (cherry-pick style)
- [ ] Clear separation of personal vs shared components
- [ ] Reproducible from manifest alone