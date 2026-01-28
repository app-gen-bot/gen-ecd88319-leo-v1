# ShadCN Tool Docker to Native Migration - Lessons Learned

**Date**: 2025-06-08  
**Issue**: ShadCN tool hung after Docker removal migration  
**Root Cause**: Unnecessary command changes during migration

## What Went Wrong

### Original Working State (Docker)
The ShadCN tool was working perfectly in Docker using these commands:
```python
# Dependencies
self.run_in_container([package_manager, "add", dep])

# ShadCN components  
self.run_in_container([package_manager, "dlx", "shadcn@latest", "add", component, "-y"])
```

Where `package_manager` defaulted to `"pnpm"`, so actual commands were:
```bash
pnpm add clsx
pnpm dlx shadcn@latest add button -y
```

**Status**: ✅ Worked perfectly, no hangs, no issues

### Migration Mistake
When removing Docker, instead of keeping the working commands and just replacing `self.run_in_container()` with native subprocess, multiple unnecessary changes were made:

1. **Changed package manager**: `pnpm` → `npm` (broke working commands)
2. **Changed command structure**: `pnpm dlx` → `npx` (different behavior)
3. **Added unnecessary flags**: `--overwrite`, `--yes` (could cause hangs)
4. **Removed package_manager parameter** (lost flexibility)

**Result**: ❌ Tool hung for 5-10 minutes, requiring Ctrl+C to kill

### The Correct Migration
Should have been a simple 1:1 replacement:

```python
# Before (Docker)
success, stdout, stderr = self.run_in_container(
    [package_manager, "dlx", "shadcn@latest", "add", component, "-y"]
)

# After (Native) - CORRECT approach
success, stdout, stderr = await self._run_native_command(
    [package_manager, "dlx", "shadcn@latest", "add", component, "-y"]
)
```

Only change needed: execution method, not the commands themselves.

## Key Lessons

### 1. "If it ain't broke, don't fix it"
- Original commands were working perfectly
- Migration should preserve working functionality
- Don't optimize during migration - migrate first, optimize later

### 2. Minimal Change Principle
- Change only what's necessary (execution method)
- Keep working commands identical
- Add safety features (timeouts) without changing core logic

### 3. Environment Issues vs Command Issues
- The corepack signature errors were **environment** problems
- Solution: Fix environment variables, not commands
- Original commands work fine with proper environment setup

### 4. Docker Removal Strategy
For any Docker-based tool migration:

1. ✅ **Identify working commands** in Docker version
2. ✅ **Replace execution method only** (`run_in_container` → `subprocess`)  
3. ✅ **Keep exact same commands**
4. ✅ **Add timeout/safety features**
5. ✅ **Fix environment issues separately**

❌ **Don't change**: Command structure, package managers, flags, parameters

## The Fix

Revert to original working commands:
```python
# Use original working commands with native execution
cmd = ["pnpm", "dlx", "shadcn@latest", "add", component, "-y"]
success, stdout, stderr = await self._run_native_command_with_timeout(
    cmd, 
    cwd=str(self.workspace_path),
    timeout=120
)
```

With proper corepack environment handling:
```python
env = os.environ.copy()
env['COREPACK_ENABLE_STRICT'] = '0'
```

## Prevention

Before making changes to working tools:
1. **Document current working state**
2. **Identify minimum required changes**  
3. **Test each change incrementally**
4. **Preserve working command patterns**
5. **Separate environment fixes from logic changes**

## Summary

The ShadCN hang was caused by unnecessary command modifications during Docker removal, not by the Docker removal itself. The original `pnpm dlx` commands were working perfectly and should have been preserved during migration.

**Migration Rule**: Change the execution method, not the commands.