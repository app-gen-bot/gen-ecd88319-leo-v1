# Buffer Overflow Fixes for Stage 2 Agents

## Problem
The Claude SDK has a maximum JSON buffer size of 1048576 bytes (1MB). When agents try to return detailed analysis with code snippets, the JSON response exceeds this limit and causes a crash.

## Solution
Agents must write detailed analysis to files and return minimal JSON responses.

## Fixed Agents

### 1. Critic Agent ✅
- **File**: `src/app_factory/agents/stage_2_wireframe/critic/system_prompt.py`
- **Status**: ALREADY FIXED
- Writes to: `../specs/critic_analysis_iteration_{N}.md`
- Returns minimal JSON with `detailed_report_path`

### 2. QC Agent ✅
- **File**: `src/app_factory/agents/stage_2_wireframe/qc/system_prompt.py`
- **Status**: FIXED (enhanced emphasis added)
- Writes to: `../specs/qc_analysis_report.md`
- Returns minimal JSON with `detailed_report_path`

### 3. Integration Analyzer ✅
- **File**: `src/app_factory/agents/stage_2_wireframe/integration_analyzer/system_prompt.py`
- **Status**: FIXED (new requirement added)
- Writes to: `../specs/integration_analysis_detailed.md`
- Returns minimal summary

### 4. Retrospective Agent ✅
- **File**: `src/app_factory/agents/retrospective/system_prompt.py`
- **Status**: NO FIX NEEDED
- This agent outputs markdown directly, not JSON
- The output is saved to file by the calling code

## Key Implementation Points

1. **First Action**: Create the report file immediately
2. **Write Throughout**: Update the file during analysis, not just at the end
3. **Minimal JSON**: Keep JSON response under 10KB
4. **Include Path**: Always include `detailed_report_path` in JSON

## Example Pattern

```python
# In system prompt:
🚨 CRITICAL: ALWAYS WRITE DETAILED ANALYSIS TO FILE! 🚨
To avoid buffer overflow errors:
1. Create ../specs/[agent]_analysis_report.md FIRST
2. Write ALL findings to that file
3. Return minimal JSON (<10KB) with "detailed_report_path"
```

## Testing
After these fixes, agents should no longer crash with buffer overflow errors when analyzing large codebases.