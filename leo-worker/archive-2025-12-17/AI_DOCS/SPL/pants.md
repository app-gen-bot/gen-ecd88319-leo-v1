# Pants Build System Essentials

## What is Pants?

**Pants** is a build orchestrator for Python-first monorepos that provides:

- Fine-grained dependency tracking
- Incremental builds (only rebuild what changed)
- Hermetic execution (reproducible)
- Remote caching (optional)
- Multi-language support (Python, Docker, Shell, Go, JVM)

## Why Pants for Your Use Case

### Problem: UV Builds Only Current Checkout

- `uv run pipeline` → builds whatever's in front of you
- Can't compose "agent_v1 from commit A + prompt_v2 from commit B"
- No caching across experiments

### Solution: Target-Based Composition

Pants builds **targets** (addressable units) with labels like:

- `//alex/stages/rank:base`
- `//alex/agents/retriever:dense_v2`
- `//shared/prompts:answer_v3`

**Manifests select targets**, not branches:

```yaml
pipeline: "//alex/pipelines/foo:run"
select:
  stage.rank: "//alex/stages/rank:dense_v2"
  agent.retriever: "//shared/agents/retriever:faiss"
  prompt: "//shared/prompts:answer_v3"
```

## Core Concepts

### Targets

**Smallest buildable/testable unit**

Common types:

- `python_sources` - Python modules
- `resources` - Data files (YAML, configs, prompts)
- `pex_binary` - Executable Python archive
- `python_distribution` - Wheel package

Example:

```python
# alex/stages/rank/BUILD
python_sources(name="base", sources=["base/**/*.py"])
python_sources(name="dense_v2", sources=["dense_v2/**/*.py"])

# alex/prompts/BUILD
resources(name="all", sources=["*.yaml"])
```

### Dependencies

Pants infers deps automatically (reads imports), but you can declare explicitly:

```python
pex_binary(
    name="run",
    entry_point="alex.pipelines.foo.run:main",
    dependencies=[
        "//alex/stages/rank:dense_v2",
        "//shared/agents/retriever:lib",
        "//shared/prompts:all",
    ],
)
```

### Resolves (Multiple Dependency Sets)

Different parts of monorepo can use different dependency versions:

```toml
# pants.toml
[python]
enable_resolves = true
resolves = {
python-default = "requirements.lock",
training = "training-requirements.lock",
}
```

Target declares which resolve:

```python
python_sources(name="lib", resolve="training")
```

## How Pants Works with Your Workflow

### Current: UV-Based

```bash
cd /path/to/experiment
uv run python -m app_factory.main --user-prompt "..."
```

### With Pants: Target-Based

```bash
# From anywhere in repo
pants run //alex/pipelines/foo:run -- --manifest configs/exp_001.yaml

# Only rebuilds changed targets
pants run //alex/pipelines/foo:run -- --manifest configs/exp_002.yaml
```

### Caching Benefits

**Scenario**: Change only `prompts/answer_v3.yaml`

Without Pants:

- Full rebuild/rerun

With Pants:

- Only `//shared/prompts:all` invalidates
- Everything else served from cache
- **10-100x faster** for iterative prompt tuning

## Pants + Agentic Development

### Challenge: Agents Need Full Repo Context

Pants runs in hermetic sandboxes (only explicit deps visible).

### Solution: Repo-Wide Context Target

```python
# tools/BUILD
files(
    name="repo_ctx",
    sources=["**/*"],
    exclude=[
        ".git/**", ".pants.d/**", "**/__pycache__/**",
        "dist/**", ".venv/**", "apps/**",  # generated apps
    ],
)

pex_binary(
    name="agent_runner",
    entry_point="tools.agent_dev:main",
    dependencies=[
        ":repo_ctx",  # whole repo available
        "//alex:lib",
        "//jordan:lib",
        "//shared:lib",
    ],
)
```

Agent sees everything but execution is still hermetic.

### Alternative: Run Agents Outside Pants

```bash
# Agent development (full context, not hermetic)
python tools/agent_dev.py --root .

# Experiments (hermetic, cached)
pants run //alex/pipelines/foo:run -- --manifest configs/exp.yaml

# Tests (hermetic, cached)
pants test ::
```

## Essential Pants Commands

```bash
# Generate BUILD files from existing code
pants tailor --check  # preview
pants tailor          # write

# Run a binary
pants run //alex/pipelines/foo:run -- <args>

# Test everything
pants test ::

# Test only changed since main
pants test --changed-since=origin/main

# Package binary (hermetic .pex file)
pants package //alex/pipelines/foo:run

# Lock dependencies
pants generate-lockfiles

# Check dependencies
pants dependencies //alex/pipelines/foo:run
pants dependents //shared/prompts:all
```

## Minimal Pants Setup

### 1. Install Pants

```bash
# One-time setup
curl -L -o ./pants https://pantsbuild.github.io/setup/pants
chmod +x ./pants
```

### 2. Basic `pants.toml`

```toml
[GLOBAL]
backend_packages = [
    "pants.backend.python",
    "pants.backend.python.lint.ruff",
    "pants.backend.python.typecheck.mypy",
]

[python]
interpreter_constraints = ["==3.11.*"]
enable_resolves = true
resolves = { python-default = "requirements.lock" }
```

### 3. Generate BUILD Files

```bash
./pants tailor
```

### 4. Run

```bash
./pants run //alex/pipelines/foo:run
```

## Integration with Your Current Setup

### Keep Using UV for Development

```bash
# Dev environment
uv venv
source .venv/bin/activate
uv pip install -e .

# Experiments use Pants
pants run //alex/pipelines/foo:run -- --manifest configs/exp.yaml
```

### Gradual Migration Path

1. **Phase 1**: Add Pants, generate BUILD files, verify `pants run` works
2. **Phase 2**: Use Pants for experiments, keep UV for dev
3. **Phase 3**: Add remote caching for speed
4. **Phase 4**: Move CI to Pants for hermetic builds

## When Pants Might Not Be Worth It

- **Team size < 3**: Overhead may exceed benefits
- **Few variants**: If you're not actually doing matrix composition
- **Stable codebase**: If changes are infrequent

## When Pants IS Worth It

- **Many experiments**: 10+ manifests/week
- **Slow builds**: Caching would save hours
- **Reproducibility critical**: Need deterministic builds for papers/results
- **Growing team**: Adding people soon

## Pants + SPL Summary

**SPL defines WHAT to compose** (variation points, feature models, manifests)

**Pants defines HOW to build it** (targets, cache, hermetic execution)

Together:

- Manifest specifies feature selections → Pants labels
- Assembler (optional) materializes source view
- Pants builds/runs only what changed
- Experiments are reproducible from `git_sha + manifest + lockfile`