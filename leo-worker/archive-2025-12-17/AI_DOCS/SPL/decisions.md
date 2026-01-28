# Key Architectural Decisions

## Decision 1: Repository Structure

### Options

1. **Monorepo with top-level sandboxes** (RECOMMENDED)
    - `/alex/` - Alex's complete pipeline workspace
    - `/jordan/` - Jordan's complete pipeline workspace
    - `/shared/` - Components both use

2. **Two separate repos**
    - Share via published packages or VCS requirements
    - More overhead, harder to experiment across boundaries

3. **Monorepo with fork-by-target**
    - `/stages/rank/base/`, `/stages/rank/alex/`, `/stages/rank/jordan/`
    - More granular, but harder to diff complete pipelines

### Decision Factors

- **Sharing frequency**: How often do you need each other's work?
- **Divergence level**: Are visions completely different or overlapping?
- **Agent visibility**: Can agents see enough context?

### Recommendation for Your Case

**Monorepo with top-level sandboxes** (`/alex/`, `/jordan/`, `/shared/`)

- Easy to diff complete pipeline implementations
- Clear ownership boundaries
- Agents can see full context when needed
- Simple manual inspection and copying

---

## Decision 2: Build System

### Options

1. **Pants** (Python-first)
    - Excellent Python support with dep inference
    - Multiple resolves for different dependency sets
    - Fast incremental builds
    - Remote caching available

2. **Bazel** (Polyglot)
    - Best for multi-language monorepos
    - Steeper learning curve
    - Powerful remote execution

3. **No build system** (status quo)
    - Use uv for dependency management
    - Manual variant composition
    - No caching benefits

### Decision Factors

- **Current stack**: Python-first (Pants advantage)
- **Team size**: 2 people (either works)
- **Complexity**: Need variant management (Pants helps)
- **Learning curve**: Time to adopt vs productivity gain

### Recommendation for Your Case

**Pants for experiment orchestration**

- Python-first matches your stack
- Target-based variants solve matrix problem
- Can still use `uv` for dev environments
- Remote caching helps with compute costs

---

## Decision 3: Variant Management Strategy

### Options

1. **Branches** (current approach)
    - Familiar Git workflow
    - Branch explosion problem

2. **Fork-by-target** (Pants labels)
    - `//stages/rank:base`, `//stages/rank:alex_v2`
    - Composition via manifest
    - No branch sprawl

3. **Git commit per path** (SPL materialization)
    - Manifest specifies SHA per directory
    - Materialize with worktree + `git restore`
    - Full source visibility for agents

### Decision Factors

- **Agent needs**: Must see complete coherent source
- **Reproducibility**: Need exact repro of experiments
- **Sharing**: Source-level, not package-level
- **Tooling familiarity**: Git over exotic tools

### Recommendation for Your Case

**Hybrid approach**:

- Use **fork-by-target** inside personal sandboxes (`/alex/pipelines/foo_v1/`, `/alex/pipelines/foo_v2/`)
- Use **SPL materialization** when composing cross-person experiments
- Manifest captures both target labels AND optional path→SHA overrides

---

## Decision 4: Agent Context Strategy

### Options

1. **Run agents outside Pants** (on working tree)
    - Agent sees everything
    - Not hermetic
    - Simplest to adopt

2. **Pants repo_ctx target** (hermetic)
    - `files(sources=["**/*"])` includes whole repo
    - Agents run in sandbox but see everything
    - Deterministic & cacheable

3. **Code index** (index-first)
    - Maintain symbol index + embeddings
    - Agents query index, load files lazily
    - Most scalable

### Decision Factors

- **Agent tooling**: What do your agents support?
- **Performance**: How big is the repo?
- **Determinism**: Need hermetic builds?

### Recommendation for Your Case

**Start with Option 1** (agents outside Pants)

- Your agents already work this way
- Can add Option 2 later for CI/reproducibility
- Option 3 if repo grows huge

---

## Decision 5: Cross-Person Sharing Pattern

### Options

1. **Manual diff and copy**
    - Simple, explicit
    - Feels primitive

2. **Git cherry-pick**
    - Selective commit adoption
    - Standard Git workflow
    - Can be surgical with path specs

3. **Git subtree**
    - Pull subdirectory from other sandbox with history
    - Better for ongoing sharing

4. **Manifest-driven materialization**
    - Specify exact commits per path
    - Assembler creates unified view
    - Most SPL-aligned

### Decision Factors

- **Frequency**: Daily collaboration vs occasional?
- **Granularity**: Whole pipelines or individual files?
- **History preservation**: Need attribution?

### Recommendation for Your Case

**Cherry-pick for selective adoption**

- Standard Git, familiar to Claude Code
- Can specify paths: `git cherry-pick -n <commit> -- stages/rank/**`
- Works well with top-level sandbox structure

**Plus manifest materialization for complex experiments**

- When you need Jordan's agent v1 + Alex's prompt v3 + shared stage v2
- Use worktree + `git restore` assembler

---

## Next Steps

1. Decide on repo structure (top-level sandboxes?)
2. Evaluate if Pants adoption is worth effort now or later
3. Create manifest schema for experiments
4. Build assembler script for source materialization
5. Test workflow with one real experiment