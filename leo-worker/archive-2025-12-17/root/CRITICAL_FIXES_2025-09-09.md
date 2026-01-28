## Critical Issues Found in Leonardo Replit Pipeline

### 1. **Missing MCP Tool Configuration (CRITICAL)**
Both `AppValidatorCritic` and `AppFixerAgent` don't configure MCP tools, causing validation failures:
- **App Validator Critic**: No `mcp_tools` parameter → can't run OXC/build tests
- **App Fixer Agent**: No `mcp_tools` parameter → can't fix issues
- Other agents correctly use `mcp_tools=["oxc", "tree_sitter", "build_test"]`

### 2. **Main Page Generator Name Confusion**
The agent creates duplicate files (`home.tsx` and `HomePage.tsx`) due to:
- App.tsx imports from `'./pages/HomePage'`
- Agent creates `home.tsx` but doesn't clean up conflicts
- After 3 iterations, still fails to resolve naming mismatch

### 3. **Architectural Inconsistency**
Mix of base `Agent` and `ContextAwareAgent` classes (user previously flagged)

## Comprehensive Fix Plan

### Phase 1: Fix MCP Tool Configuration
1. **App Validator Critic** (`app_validator/critic/critic.py`):
   - Add `mcp_tools=["oxc", "build_test", "browser"]` to Agent initialization
   - Remove hardcoded MCP tool names from allowed_tools

2. **App Fixer Agent** (`app_fixer/agent.py`):
   - Add `mcp_tools=["oxc", "build_test", "browser"]` to Agent initialization
   - Clean up allowed_tools list

### Phase 2: Fix Main Page Generator
1. **Standardize naming** in Main Page Generator:
   - Always create `HomePage.tsx` (capital H) to match App.tsx import
   - Add cleanup step to remove conflicting `home.tsx` if it exists
   - Fix the agent's logic to handle existing files properly

### Phase 3: Architectural Cleanup (if requested)
1. Standardize all Build Stage agents to use base `Agent` class
2. Remove `ContextAwareAgent` usage for consistency

### Phase 4: Additional Improvements
1. Add better error handling for file conflicts
2. Improve Critic feedback parsing
3. Add validation that MCP tools are actually available

## Files to Modify
1. `/src/app_factory_leonardo_replit/agents/app_validator/critic/critic.py`
2. `/src/app_factory_leonardo_replit/agents/app_fixer/agent.py`
3. `/src/app_factory_leonardo_replit/agents/main_page_generator/agent.py`
4. `/src/app_factory_leonardo_replit/agents/main_page_generator/user_prompt.py`

This will make the pipeline fully functional with proper validation and fixing capabilities.