# AI App Factory Dashboard

## Common Commands Reference

### Critic Restart Commands

#### Example: Resume at Critic Iteration 1
```bash
uv run python -m app_factory.main_v2 --start-at-critic --app-name identfy_20250723_212714 --critic-iteration 1
```

This command is useful when:
- The Writer has generated code but the pipeline was interrupted
- You want to re-evaluate existing code with the Critic
- You need to continue a Writer-Critic loop from a specific point

### General Critic Restart Syntax
```bash
uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name <app_name> \
    --critic-iteration <iteration_number>
```

**Parameters:**
- `--start-at-critic`: Enable critic restart mode
- `--app-name`: The existing app to evaluate
- `--critic-iteration`: Which iteration to evaluate (1-4)

### Additional Options
```bash
# With previous feedback file (for iterations > 1)
uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name <app_name> \
    --critic-iteration 2 \
    --critic-feedback-file apps/<app_name>/specs/critic_evaluation_result.json
```

## Quick Status Checks

### Check Current Iteration
```bash
# Count critic analysis files
ls apps/<app_name>/specs/critic_analysis_iteration_*.md | wc -l

# View all critic files
ls -la apps/<app_name>/specs/critic_analysis_iteration_*.md
```

### Check for User Feedback
```bash
# See if user feedback exists
ls -la apps/<app_name>/specs/user_feedback.md

# View archived feedback
ls -la apps/<app_name>/specs/user_feedback_archive/
```

## Common Workflows

### 1. Resume Interrupted Pipeline
```bash
# Check where it stopped
ls apps/<app_name>/specs/critic_analysis_iteration_*.md

# Resume at the next iteration
uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name <app_name> \
    --critic-iteration <next_number>
```

### 2. Add User Feedback Mid-Pipeline

**To inject user feedback, put your tasks in `user_feedback.md` in the specs folder. The Writer will read this and prioritize these tasks before doing anything else.**

```bash
# Create feedback file
cp resources/templates/user_feedback_template.md apps/<app_name>/specs/user_feedback.md

# Edit feedback
nano apps/<app_name>/specs/user_feedback.md

# Resume pipeline - Writer will pick up feedback
uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name <app_name> \
    --critic-iteration <current_iteration>
```

**Note**: The Writer automatically archives `user_feedback.md` to `user_feedback_archive/` after reading it.

### 3. Full Pipeline Run
```bash
# Standard run with all optimizations
uv run python -m app_factory.main_v2 \
    --user-prompt "Your app description here" \
    --skip-questions \
    --iterative-stage-1

# With custom app name
uv run python -m app_factory.main_v2 \
    --user-prompt "Your app description here" \
    --app-name "my-custom-app" \
    --skip-questions \
    --iterative-stage-1
```

## Troubleshooting

### Pipeline Errors
- If you see `UnboundLocalError` with `AgentResult`, the fix has been applied
- Check logs in the app-factory root directory
- Verify all dependencies with `uv pip list`

### Build Failures
- Writer must fix all build errors before completing
- Critic can fix build-blocking issues to continue testing
- Check `build_test` output for specific errors

### Missing Features
- Check critic analysis files for detailed feedback
- Use user feedback system to prioritize specific fixes
- Ensure interaction spec has complete navigation map