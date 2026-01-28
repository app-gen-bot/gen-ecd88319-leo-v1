# Static Validation Guide

## Problem

Runtime errors like `TypeError: Agent.__init__() got an unexpected keyword argument 'compliance_threshold'` only appear when the code actually runs, wasting time and breaking the pipeline.

## Solution: Static Validation Scripts

We've created validation scripts that catch these errors **before runtime**.

### Available Scripts

#### 1. `scripts/validate_agent_configs.py`

**What it does:** Validates all `AGENT_CONFIG` dictionaries against `cc_agent.Agent.__init__` signature

**Checks:**
- Invalid parameter names (like `compliance_threshold`, `verbose`)
- Ensures all config parameters are valid for `Agent` class

**Usage:**
```bash
python3 scripts/validate_agent_configs.py
```

**Example output:**
```
✅ Valid cc_agent.Agent parameters: ['allowed_tools', 'cwd', 'max_turns', ...]

❌ agents/storage_generator/critic/config.py
   - Invalid parameter: 'compliance_threshold'

💡 Remove these parameters or update cc_agent.Agent to support them
```

#### 2. `scripts/validate_imports.py`

**What it does:** Validates all Python files can be compiled and imported

**Checks:**
- Syntax errors
- Import resolution errors
- Basic type compatibility

**Usage:**
```bash
python3 scripts/validate_imports.py
```

**Example output:**
```
✅ src/app_factory_leonardo_replit/agents/storage_generator/agent.py
❌ src/app_factory_leonardo_replit/agents/schema_designer/agent.py
   SyntaxError: invalid syntax (line 42)
```

#### 3. `scripts/run_all_validations.sh`

**What it does:** Runs ALL validation checks in one command

**Includes:**
1. Agent config validation
2. Import validation
3. Type checking (if mypy installed)

**Usage:**
```bash
./scripts/run_all_validations.sh
```

**Exit codes:**
- `0` = All validations passed (safe to commit)
- `1` = Some validations failed (fix before committing)

## Recommended Workflow

### Before Every Commit

```bash
# Run all validations
./scripts/run_all_validations.sh

# If all pass, commit
git add .
git commit -m "Your message"
```

### During Development

```bash
# Quick check after changing configs
python3 scripts/validate_agent_configs.py

# Quick check after changing imports
python3 scripts/validate_imports.py
```

## Pre-Commit Hook (Optional)

To **automatically** run validations before every commit:

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running pre-commit validations..."
./scripts/run_all_validations.sh
EOF

# Make it executable
chmod +x .git/hooks/pre-commit
```

Now validations run automatically before every commit!

## What Gets Validated

### Agent Configs ✅

**Valid parameters:**
- `name` - Agent name
- `system_prompt` - System instructions
- `allowed_tools` - List of tool names
- `max_turns` - Maximum conversation turns
- `permission_mode` - Permission handling
- `mcp_tools` - MCP tool list (e.g., `["oxc", "tree_sitter"]`)
- `mcp_servers` - MCP server configurations
- `cwd` - Working directory
- `model` - Model to use (e.g., "sonnet", "opus")

**Invalid parameters (will cause runtime errors):**
- ❌ `compliance_threshold` - Not supported by Agent
- ❌ `verbose` - Not supported by Agent
- ❌ Any other custom parameters

### Import Errors ✅

- Missing imports
- Circular imports
- Syntax errors
- Undefined variables in module scope

## Current Issues Found

As of the last run:

```
❌ 3 config files with invalid parameters:
  - agents/api_client_generator/config.py: 'verbose'
  - agents/layout_generator/config.py: 'verbose'
  - agents/page_generator/config.py: 'verbose'
```

These need to be fixed by removing the `verbose` parameter.

## Type Checking (Advanced)

For even stricter validation, install mypy:

```bash
uv pip install mypy
```

Then run:

```bash
mypy src/app_factory_leonardo_replit --ignore-missing-imports
```

This catches type mismatches and incorrect function signatures at coding time.

## Benefits

### Before (Runtime Errors)
```
❌ Run pipeline → Wait 5 minutes → Error at runtime → Fix → Repeat
```

### After (Static Validation)
```
✅ Run validation → Fix errors in 30 seconds → Commit → Pipeline works
```

**Time saved:** Hours per day during development

## Integration with CI/CD (Future)

Add to GitHub Actions:

```yaml
name: Validate Code
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run validations
        run: ./scripts/run_all_validations.sh
```

This prevents invalid code from being merged.

## Summary

**Run before every commit:**
```bash
./scripts/run_all_validations.sh
```

**Catches:**
- Invalid agent config parameters
- Import errors
- Syntax errors
- Type mismatches (with mypy)

**Saves:**
- Hours of debugging time
- Failed pipeline runs
- Runtime surprises
