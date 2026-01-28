# Checkpoint Resume and Buffer Issues Documentation

## Issue 1: Checkpoint Resume Requires --user-prompt

### Problem
When resuming from a checkpoint, the CLI still requires the `--user-prompt` argument even though the checkpoint contains the user prompt. This is because argparse validates required arguments before the code can load the checkpoint.

### Current Workaround
Pass an empty string for `--user-prompt` when using `--checkpoint`:

```bash
# Resume from checkpoint with empty user prompt
uv run python -m app_factory.main_v2 --checkpoint pipeline_20250714_021612 --user-prompt ""
```

The empty string satisfies argparse validation, and the actual user prompt is loaded from the checkpoint file.

### Planned Fix
Remove `required=True` from the `--user-prompt` argument and add custom validation after parsing to ensure either `--user-prompt` or `--checkpoint` is provided.

## Issue 2: JSON Buffer Exceeded (1MB)

### Problem
When the Critic agent analyzes large codebases (e.g., 4,864 files in the LoveyTasks app), the response exceeds the 1MB buffer limit in `claude_code_sdk`:

```python
# In claude_code_sdk/_internal/transport/subprocess_cli.py
_MAX_BUFFER_SIZE = 1024 * 1024  # 1MB limit
```

This causes the error:
```
JSONDecodeError: ('line 1 column 1048577 (char 1048576)', 'Unterminated string starting at', 1048576)
```

### Solution: File-Based Communication

Instead of returning large JSON responses, the Critic should:

1. **Write detailed analysis to a file**:
   - Location: `apps/{app_name}/specs/critic_analysis_iteration_{N}.md`
   - Contains: Full list of issues, detailed feedback, code snippets

2. **Return concise JSON summary**:
   ```json
   {
     "evaluation": {
       "compliance_score": 75,
       "summary": "Found 127 issues across 45 files",
       "detailed_report_path": "specs/critic_analysis_iteration_2.md",
       "file_count_analyzed": 4864,
       "critical_issues_count": 15
     },
     "decision": "continue",
     "reasoning": "Multiple navigation issues and missing features require iteration",
     "priority_fixes": [
       "Fix broken link: User menu -> Settings returns 404",
       "Implement missing route: /projects/:id/analytics",
       "Add 404 page for undefined routes",
       "Fix TypeScript errors in TaskCard component",
       "Implement missing 'Surprise Me' feature"
     ]
   }
   ```

3. **Writer reads the detailed analysis**:
   - The Writer agent will be instructed to read the detailed report file
   - This allows unlimited analysis detail without buffer constraints

### Implementation Guidelines

#### For Critic Agent:
- When analyzing > 1000 files, always use file-based reporting
- Keep JSON response under 100KB
- Include only top 5-10 priority fixes in JSON
- Save full analysis with code snippets to markdown file

#### For Writer Agent:
- Check for `detailed_report_path` in critic feedback
- Read the detailed report file if present
- Use full analysis to guide improvements

### Benefits
- No buffer size limitations
- More detailed analysis possible
- Better tracking of large-scale issues
- Preserved analysis history in specs folder

## Issue 3: Checkpoint Granularity

### Problem
The current checkpoint system only tracks stage-level progress (e.g., "wireframe": "in_progress"). When a crash occurs during the Critic phase of an iteration, the system restarts from the beginning of the Writer phase, causing duplicate work.

### Planned Enhancement
Add sub-stage tracking to checkpoints:
- Track current Writer/Critic iteration
- Save iteration-specific data (e.g., critic feedback)
- Resume from exact sub-stage where crash occurred

This will prevent re-running successful Writer iterations when only the Critic failed.