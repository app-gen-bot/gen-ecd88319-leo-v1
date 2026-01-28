# AI App Factory CLI Reference

## Command Line Usage

```bash
uv run python -m app_factory.main_v2 [OPTIONS]
```

## Core Arguments

### `--user-prompt` (string)
The description of the app to create. Required unless using `--checkpoint`.

Example:
```bash
--user-prompt "Create a task management app with user authentication"
```

### `--skip-questions` (flag)
Skip interactive questions and generate PRD directly. Useful for automated runs.

### `--iterative-stage-1` (flag)
**IMPORTANT**: Enable Writer-Critic iterative mode for Stage 1 (Interaction Spec).
- Ensures validation passes before proceeding to Stage 2
- Without this flag, Stage 1 runs in single-pass mode which may fail validation
- Recommended for production use

## Sprint Mode Arguments

### Sprint Breakdown Generation (NEW)

### `--sprint-breakdown-only` (flag)
Generate only the sprint breakdown document without building the app.
- Creates a comprehensive `sprints_breakdown.md` file
- Agent determines optimal number of sprints (2-6)
- Includes sprint roadmap, features, and dependencies
- Useful for planning before implementation

### `--sprint-breakdown` (string)
Path to an existing sprint breakdown document.
- Use when building specific sprints
- Required when using `--sprint` > 1
- Ensures consistency across sprint builds

Example:
```bash
--sprint-breakdown apps/my-app/specs/sprints_breakdown.md
```

### Legacy Sprint Mode (Deprecated)

### `--enable-sprints` (flag)
**[DEPRECATED - Use --sprint-breakdown-only instead]**
Break down PRD into sprint-based deliverables:
- Runs Stage 0.5 after PRD generation
- Sprint 1 focuses on absolute MVP
- Each sprint is fully functional and deployable

### `--num-sprints` (int)
**[DEPRECATED - Agent now determines optimal sprint count]**
Number of sprints to create.
- Choices: 1, 2, 3, 4
- Default: 3

### Sprint Building

### `--sprint` (int)
Which sprint to build.
- Choices: 1, 2, 3, 4, 5, 6
- Default: 1
- Sprint 1: Core MVP - minimum features for immediate value
- Sprint 2: Enhanced Core - most requested secondary features
- Sprint 3: Extended Features - additional roles, integrations
- Sprint 4: Polish & Scale - UI polish, analytics, enterprise features
- Sprint 5-6: Additional features as determined by sprint breakdown

### `--previous-sprint-path` (string)
Path to previous sprint's app directory (for Sprint 2+).
- Required when building Sprint 2 or higher
- Ensures new features don't break existing functionality
- Example: `--previous-sprint-path apps/app_sprint_1/`

### `--app-name` (string)
Specify app name instead of auto-generated timestamp.

Example:
```bash
--app-name "my-awesome-app"
```

### `--use-existing-specs` (string)
Path to directory containing existing PRD and interaction specs. Skips Stage 0 (PRD generation) and Stage 1 (Interaction Spec generation), jumping directly to Stage 2 (Wireframe/Code generation).

Requirements:
- Directory must contain `business_prd.md`
- Directory must contain `frontend-interaction-spec.md`
- Optionally can contain `technical-implementation-spec.md`
- Must be used with `--app-name`

Example:
```bash
--use-existing-specs apps/identfy/specs --app-name identfy
```

This reads specs from the provided directory and generates code in `apps/<app-name>/`.

## Checkpoint Arguments

### `--checkpoint` (string)
Resume from a previous checkpoint ID.

Example:
```bash
--checkpoint "app_20250716_123456_checkpoint_1"
```

### `--list-checkpoints` (flag)
List all available checkpoints and exit.

## Critic Restart Arguments

### `--start-at-critic` (flag)
Start pipeline at the Critic evaluation stage.

### `--critic-iteration` (int)
Which iteration the Critic should evaluate.
- Choices: 1, 2, 3, 4
- Default: 1

### `--critic-feedback-file` (string)
Path to previous critic feedback JSON (for iterations > 1).

## Usage Examples

### Basic App Generation
```bash
uv run python -m app_factory.main_v2 \
    --user-prompt "Create a simple blog platform"
```

### Production-Ready Generation
```bash
uv run python -m app_factory.main_v2 \
    --user-prompt "Create a project management tool" \
    --skip-questions \
    --iterative-stage-1
```

### Using Existing PRD as User Prompt
```bash
# Read PRD from file and use as user prompt (runs entire pipeline)
uv run python -m app_factory.main_v2 \
    --user-prompt "$(cat apps/identfy/specs/business_prd.md)" \
    --app-name identfy \
    --skip-questions \
    --iterative-stage-1
```

This command:
- Reads the PRD content and uses it as the user prompt
- Runs Stage 0 (which essentially recreates the same PRD)
- Runs Stage 1 with iterative Writer-Critic mode
- Runs Stage 2 with Writer-Critic iterations
- Useful when you want to regenerate everything from a PRD

### Sprint Workflow Examples

#### Step 1: Generate Sprint Breakdown
```bash
# Generate sprint breakdown document only
uv run python -m app_factory.main_v2 \
    --user-prompt "Create a veterinary practice management system" \
    --skip-questions \
    --sprint-breakdown-only \
    --app-name "pawsflow"
```

This creates `apps/pawsflow/specs/sprints_breakdown.md` with complete sprint plan.

#### Step 2: Build Sprint 1 (MVP)
```bash
uv run python -m app_factory.main_v2 \
    --sprint-breakdown apps/pawsflow/specs/sprints_breakdown.md \
    --sprint 1 \
    --app-name "pawsflow-sprint1" \
    --iterative-stage-1
```

#### Step 3: Build Sprint 2 (Enhanced)
```bash
uv run python -m app_factory.main_v2 \
    --sprint-breakdown apps/pawsflow/specs/sprints_breakdown.md \
    --sprint 2 \
    --app-name "pawsflow-sprint2" \
    --previous-sprint-path apps/pawsflow-sprint1/ \
    --iterative-stage-1
```

### Using Existing Specs

#### Skip PRD and Interaction Spec Generation
```bash
uv run python -m app_factory.main_v2 \
    --use-existing-specs apps/identfy/specs \
    --app-name identfy-v2
```

This command:
- Reads specs from `apps/identfy/specs/`
- Generates code in `apps/identfy-v2/`
- Starts directly at Stage 2 (Wireframe) with Writer iteration 1
- No need for `--iterative-stage-1` since Stage 1 is already complete

### Standalone Stage Execution

#### Generate Interaction Spec Only
```bash
uv run python -m app_factory.stages.stage_1_interaction_spec \
    --prd-file apps/my-app/specs/business_prd.md \
    --output-dir output/specs/
```

#### Generate Wireframe from Existing Specs
```bash
uv run python -m app_factory.stages.stage_2_wireframe \
    --interaction-spec apps/my-app/specs/frontend-interaction-spec.md \
    --technical-spec apps/my-app/specs/technical-implementation-spec.md \
    --app-name my-app
```

### Resume from Checkpoint
```bash
# List available checkpoints
uv run python -m app_factory.main_v2 --list-checkpoints

# Resume specific checkpoint
uv run python -m app_factory.main_v2 --checkpoint app_20250716_123456_checkpoint_1
```

### Critic Restart
```bash
# Re-evaluate existing code
uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name app_20250716_074453 \
    --critic-iteration 1

# Continue from iteration 2 with feedback
uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name app_20250716_074453 \
    --critic-iteration 2 \
    --critic-feedback-file apps/app_20250716_074453/specs/critic_evaluation_result.json
```

## Helper Scripts

### Generic Sprint Runner
```bash
./run-sprint.sh <prompt-file> <app-name> <sprint-number>

# Example
./run-sprint.sh prompts/slack-clone.md slack-mvp 1
```

### Specific App Sprint Mode
```bash
./run-planetscale-website-sprints.sh
```

## Exit Codes

- 0: Success
- 1: Error (check logs for details)

## Environment Variables

While not command line arguments, these affect behavior:

- `BROWSER_HEADLESS`: Set to "true" for headless browser mode
- `MCP_LOG_LEVEL`: Logging level for MCP servers
- `OPENAI_API_KEY`: Required for some MCP features

See `.env.example` for full list.

## Sprint Breakdown Document

The sprint breakdown document (`sprints_breakdown.md`) is a comprehensive plan that includes:

### Document Structure
- **Executive Summary**: Total sprints, timeline, key milestones
- **Sprint Details**: For each sprint:
  - Duration and theme
  - Goals and objectives
  - Features & deliverables with user stories
  - Technical requirements
  - Success metrics
  - Out of scope items
- **Sprint Roadmap**: Timeline and dependencies
- **Risk Analysis**: Per-sprint risks and mitigations
- **Success Criteria**: Overall and per-sprint checkpoints

### Tips for Sprint-Based Development

1. **Always Generate Sprint Breakdown First**
   - Provides clear roadmap before implementation
   - Ensures consistent feature allocation
   - Helps estimate timeline and resources

2. **Sprint 1 is Sacred**
   - Must be true MVP with immediate value
   - No nice-to-have features
   - Fully functional and deployable

3. **Incremental Building**
   - Each sprint builds on previous work
   - Never break existing functionality
   - Test thoroughly between sprints

4. **Use Checkpoints**
   - Natural checkpoint at sprint boundaries
   - Easy to resume if issues arise
   - Track progress and costs per sprint