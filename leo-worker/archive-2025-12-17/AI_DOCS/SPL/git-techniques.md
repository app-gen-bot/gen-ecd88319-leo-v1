# Git Techniques for Source Materialization

## The Problem

You need to materialize a working directory where:

- `stages/rank/` comes from commit `abc123`
- `agents/retriever/` comes from commit `def456`
- `prompts/answer.yaml` comes from commit `789abc`
- Everything else from base commit `main`

So AI agents can see a **complete, coherent codebase** composed from different versions.

## Core Git Techniques

### 1. Git Worktree (Isolated Workspace)

**What it does**: Creates separate working directory from your repo, at any commit, without affecting main checkout.

**Basic usage**:

```bash
# Create worktree at specific commit
git worktree add /tmp/exp-view 3b5e8f7

# Create worktree with new branch
git worktree add -b exp-branch /tmp/exp-view main

# List worktrees
git worktree list

# Remove when done
git worktree remove /tmp/exp-view
```

**Why it's useful**:

- Isolates experiments without touching main workspace
- Multiple people can work on different commits simultaneously
- Agent operates in clean environment
- Can have 10+ worktrees active

### 2. Git Restore (Cherry-Pick Files, Not Commits)

**What it does**: Pull specific files/directories from any commit into current working tree.

**Basic usage**:

```bash
# Restore path from specific commit
git restore --source abc123 -- stages/rank/

# Restore multiple paths
git restore --source def456 -- agents/retriever/ prompts/answer.yaml

# Restore from different commits
git restore --source abc123 -- stages/rank/
git restore --source def456 -- agents/retriever/
```

**Why it's useful**:

- Compose working tree from multiple commits
- No need to merge or cherry-pick entire commits
- Can mix versions at directory/file granularity
- Changes appear as unstaged modifications (ready for agent)

### 3. Cherry-Pick with Path Specs

**What it does**: Apply specific commit changes, but only for certain paths.

**Basic usage**:

```bash
# Cherry-pick commit, but only for specific paths
git cherry-pick -n abc123 -- stages/rank/**

# -n means "no commit" (staged changes only)
# Then review, modify, commit

# Cherry-pick range
git cherry-pick -n commit1..commit5 -- agents/retriever/
```

**Why it's useful**:

- Selectively adopt collaborator's changes
- Surgical merging (just the parts you want)
- Standard Git, familiar to Claude Code
- Can preview before committing

### 4. Sparse-Checkout (Scale Optimization)

**What it does**: Only materialize subset of repo files (for huge repos).

**Basic usage**:

```bash
# Enable sparse-checkout
git sparse-checkout init --cone

# Specify paths to include
git sparse-checkout set alex/ shared/ tools/

# Add more paths
git sparse-checkout add jordan/stages/rank/

# Disable
git sparse-checkout disable
```

**Why it's useful**:

- Keeps worktree small when repo is huge
- Faster filesystem operations
- Agent doesn't load irrelevant files
- Still have full Git history access

## SPL Source Materialization Pattern

### Manifest Format

```yaml
# configs/experiments/exp_001.yaml
name: "Dense retrieval with answer_v3"
base_sha: "3b5e8f7"
overrides:
  "stages/rank": "abc123"
  "agents/retriever": "def456"
  "prompts/answer_v3.yaml": "789ghi"
select:
  pipeline: "//alex/pipelines/foo:run"
  stage.rank: "//stages/rank:dense"
```

### Assembler Script (Conceptual)

```bash
#!/usr/bin/env bash
# tools/materialize_view.sh

MANIFEST="$1"
WORKDIR="$2"  # e.g., /tmp/exp_001

# Parse manifest (use yq or Python)
BASE_SHA=$(yq '.base_sha' "$MANIFEST")

# 1. Create clean worktree at base
git worktree add --detach "$WORKDIR" "$BASE_SHA"

# 2. Apply overrides
cd "$WORKDIR"
yq -r '.overrides | to_entries[] | "\(.key) \(.value)"' "$MANIFEST" | \
while read -r PATH SHA; do
  git restore --source "$SHA" -- "$PATH"
done

# 3. Record provenance
cat > .spl_manifest <<EOF
Materialized from: $MANIFEST
Base: $BASE_SHA
Overrides applied: $(date -Iseconds)
EOF

echo "View ready at: $WORKDIR"
```

### Usage Flow

```bash
# 1. Materialize view
./tools/materialize_view.sh configs/exp_001.yaml /tmp/exp_001

# 2. Agent works there
cd /tmp/exp_001
python tools/agent_runner.py

# 3. Run experiment with Pants
cd /tmp/exp_001
pants run //alex/pipelines/foo:run -- --manifest <path-to-exp_001.yaml>

# 4. Capture results
git switch -c exp-001-results
git add -A
git commit -m "Results from exp_001"

# 5. Cherry-pick valuable changes back
cd /original/repo
git cherry-pick -n exp-001-results -- stages/rank/improvements.py
git commit -m "Adopt rank improvements from exp_001"

# 6. Cleanup
git worktree remove /tmp/exp_001
```

## Applying to Your Case

### Scenario 1: Jordan Starts from Alex's Working Pipeline

**Alex's state**: Branch `alex-dense-working` at commit `aaa111`

```bash
# Jordan creates worktree at Alex's commit
git worktree add -b jordan-exp /tmp/jordan-exp aaa111

# Jordan works there
cd /tmp/jordan-exp
# Make changes to stages/rank/, agents/retriever/, etc.

# Commit Jordan's changes
git add -A
git commit -m "Jordan's modifications to dense pipeline"

# Jordan pushes branch
git push origin jordan-exp

# Cleanup
cd /original/repo
git worktree remove /tmp/jordan-exp
```

**Alex later cherry-picks Jordan's good ideas**:

```bash
git cherry-pick -n jordan-exp -- agents/retriever/jordan_improvements.py
git commit -m "Adopt retriever improvements from Jordan"
```

### Scenario 2: Compose Multi-Version Experiment

**Goal**: Test `alex/rank_v2` + `jordan/retriever_v1` + `shared/prompt_v3`

Manifest:

```yaml
base_sha: "main"  # or specific SHA
overrides:
  "alex/stages/rank": "alex-commit-for-v2"
  "jordan/agents/retriever": "jordan-commit-for-v1"
  "shared/prompts/answer_v3.yaml": "shared-commit"
```

Run assembler → creates `/tmp/exp_mixed` with exactly those versions.

### Scenario 3: Personal Sandbox Experiments

**Inside `/alex/`**, you have many pipeline variants:

```
alex/
  pipelines/
    foo_base/
    foo_dense/  
    foo_hybrid/
```

No manifest needed—just Pants targets:

```bash
pants run //alex/pipelines/foo_dense:run
pants run //alex/pipelines/foo_hybrid:run
```

Use manifest + worktree only when crossing personal boundaries or composing from history.

## Git Techniques Summary

| Technique               | Use Case                                 | Command                                 |
|-------------------------|------------------------------------------|-----------------------------------------|
| **Worktree**            | Isolated workspace at specific commit    | `git worktree add <dir> <sha>`          |
| **Restore**             | Pull files from commit into working tree | `git restore --source <sha> -- <path>`  |
| **Cherry-pick + paths** | Adopt specific changes surgically        | `git cherry-pick -n <commit> -- <path>` |
| **Sparse-checkout**     | Only materialize subset of repo          | `git sparse-checkout set <paths>`       |

## Advantages for Agentic Development

### AI Agents Work with Standard Git

- Claude Code understands Git worktrees
- `git restore` is standard, documented command
- Cherry-pick is familiar pattern
- No exotic VCS (Jujutsu) needed

### Full Context Visibility

- Worktree = complete directory for agent to analyze
- No hidden dependencies or partial views
- Agent can grep, read, edit normally

### Reproducibility

- Manifest + base SHA = exact source state
- Can recreate experiment months later
- Provenance tracked in `.spl_manifest` file

### Clean Separation

- Experiments don't pollute main workspace
- Can run multiple experiments in parallel (different worktrees)
- Easy cleanup with `git worktree remove`

## Comparison to Alternatives

| Approach                   | Pros                            | Cons                           |
|----------------------------|---------------------------------|--------------------------------|
| **Long-lived branches**    | Familiar                        | Branch explosion, merge hell   |
| **Copy/paste directories** | Simple                          | No history, drift, duplication |
| **Git submodules**         | Standard                        | Brittle, detached HEAD pain    |
| **Git subtree**            | History preserved               | Merge conflicts, complexity    |
| **Worktree + restore**     | Composable, clean, standard Git | Requires assembler script      |

## Recommendation

**Use worktree + restore for SPL materialization**:

- Aligns with your manifest-driven approach
- Standard Git techniques (Claude Code compatible)
- Enables path-granular version composition
- Clean isolation for agent work
- Surgical adoption with cherry-pick

**Start simple**:

1. Manual worktree creation for now
2. Manual `git restore` commands
3. Build assembler script once pattern is validated
4. Add manifest validation later