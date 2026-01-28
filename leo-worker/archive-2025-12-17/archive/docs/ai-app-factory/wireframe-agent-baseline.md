# Wireframe Agent Baseline Documentation

## Current Implementation (Before Context-Aware Integration)

### Agent Class Structure
- **Base Class**: `Agent` from `cc_agent`
- **Class Name**: `WireframeAgent`
- **Location**: `src/app_factory/agents/stage_2_wireframe/wireframe/agent.py`

### Configuration (AGENT_CONFIG)
```python
{
    "name": "Wireframe Generator",
    "allowed_tools": ["Read", "Write", "MultiEdit", "build_test", "browser"],
    "max_turns": 100,
    "permission_mode": "acceptEdits"
}
```

### Key Features
1. **Allowed Tools**:
   - `Read`: Read files
   - `Write`: Write files
   - `MultiEdit`: Make multiple edits
   - `build_test`: Build and test the application
   - `browser`: Browser automation for testing

2. **Working Directory**: Set dynamically based on output_dir parameter

3. **System Prompt**: Focuses on Next.js 14, ShadCN UI, dark mode, responsive design

### Constructor Parameters
- `output_dir`: Directory where wireframe files will be generated
- `logger`: Optional logger instance

### Inheritance Chain
```
WireframeAgent -> Agent -> (base implementation)
```

### No Context Awareness
- No memory system integration
- No session tracking
- No pattern reuse capability
- No cross-project learning

## Files Backed Up
All files have been backed up to: `src/app_factory/agents/stage_2_wireframe/wireframe/legacy/`
- `__init__.py`
- `agent.py`
- `config.py`
- `system_prompt.py`
- `user_prompt.py`

## Verification Steps Completed
1. ✓ Located all wireframe agent files
2. ✓ Created backup directory
3. ✓ Copied all files to legacy/
4. ✓ Documented current configuration
5. ✓ Ready for context-aware conversion