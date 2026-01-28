# LEONARDO PIPELINE FIXES - 2025-01-17

## Issues Fixed Today

### 1. API Client Generator Critic Infinite Loop (FIXED)
**Problem**: Critic was getting stuck in 18-20 iteration loops without returning proper XML format.

**Root Causes**:
1. The user_prompt.py was instructing agents to "Start your evaluation by reading and analyzing all relevant files" which caused conversational output instead of XML
2. The max_turns limit was set to only 4, not enough for the Critic to read all files and return XML

**Fixes Applied**:
- Simplified user prompt to just trigger evaluation without procedural instructions
- Increased max_turns from 4 to 30 for all agents with low limits
- Result: API Client Generator now completes in 1 iteration instead of 18-20

### 2. OXC Integration Not Working (FIXED)
**Problem**: OXC MCP tool was configured but `oxlint` binary wasn't installed.

**Fix**: 
```bash
sudo npm install -g oxlint
```
- OXC version 1.16.0 now installed and working
- Ultra-fast TypeScript validation restored (50-100x faster than ESLint)

### 3. Model Speed Optimization (COMPLETED)
**Change**: Updated all agents from "opus" to "sonnet" model for speed testing.

**Files Updated**:
- 9 agent configs switched to "sonnet" model
- Significant speed improvement observed

### 4. IndexError in Page Generation Logic (FIXED)
**Problem**: IndexError at line 896 in build_stage.py when pipeline completed.

**Root Cause**: 
- pipeline_results had 8 entries (7 main stages + 1 page generator orchestrator)
- agent_pairs only had 7 entries
- Loop tried to access agent_pairs[7] which doesn't exist

**Fix**: Added bounds check in build_stage.py:
```python
if i <= len(agent_pairs):
    agent_name = agent_pairs[i-1]["name"]
else:
    agent_name = result.get("agent", "Page Generator Orchestrator")
```

### 5. Missing Supabase Package (IDENTIFIED - NOT FIXED)
**Problem**: App fails to start with error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@supabase/supabase-js'
```

**Root Cause**: The generated app includes SupabaseStorage class but package.json is missing the dependency.

**Solution (To Apply Tomorrow)**:
```bash
cd /home/jake/LEAPFROG/MICHAELANGELO/app-factory/apps/timeless-weddings/app
npm install @supabase/supabase-js
```

**Note**: App will use MemStorage by default since no .env file exists with Supabase credentials.

## Key Improvements Achieved

1. **Never Broken Principle Restored**: OXC validation ensures TypeScript correctness
2. **Writer-Critic Pattern Working**: Critics properly validating and returning XML  
3. **Pipeline Performance**: API Client Generator reduced from ~20 iterations to 1
4. **All max_turns limits increased**: Prevents premature agent timeouts

## Files Modified

1. `/src/app_factory_leonardo_replit/agents/api_client_generator/critic/user_prompt.py`
2. `/src/app_factory_leonardo_replit/agents/api_client_generator/critic/config.py` 
3. `/src/app_factory_leonardo_replit/agents/api_client_generator/config.py`
4. Multiple agent configs for max_turns increases
5. `/src/app_factory_leonardo_replit/stages/build_stage.py` (IndexError fix)
6. `CLAUDE.md` updated with Never Broken principle and Writer-Critic pattern

## Pipeline Status

- Successfully ran full pipeline with all fixes
- All 7 main stages completed with 100% compliance
- HomePage Generator completed successfully
- Only remaining issue: Missing @supabase/supabase-js package

## Tomorrow's Tasks

1. Fix the missing Supabase package dependency
2. Test full app functionality after package installation
3. Consider adding package dependency validation to the pipeline
4. Potentially update template to include all required packages