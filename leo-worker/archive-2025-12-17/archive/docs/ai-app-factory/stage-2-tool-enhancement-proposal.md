# Stage 2 Tool Enhancement Proposal

## Summary
This document proposes enhanced tool configurations for Stage 2 wireframe agents to improve their efficiency and capabilities.

## Already Implemented
1. **BatchTool & Task** - Added to all agents for parallel operations
2. **Grep** - Added to Writer for pattern searching during development

## Recommended Additional Tools

### Writer Agent Enhancements
```python
"allowed_tools": [
    # Existing tools...
    
    # File discovery and navigation
    "Glob",             # Find files by pattern (e.g., "**/*.tsx")
    "LS",               # List directory contents
    
    # External resources
    "WebFetch",         # Retrieve documentation/examples
    "WebSearch",        # Search for solutions and best practices
    
    # Task management
    "TodoWrite",        # Track implementation progress
    
    # System operations
    "Bash",             # Execute custom scripts (npm scripts, etc.)
]
```

**Benefits:**
- Glob + LS enable better project navigation and component discovery
- WebFetch/WebSearch allow real-time documentation lookup
- TodoWrite helps track complex multi-component implementations
- Bash enables custom build scripts and tooling

### Critic Agent Enhancements
```python
"allowed_tools": [
    # Existing tools...
    
    # Enhanced file analysis
    "Glob",             # Find all files of specific types
    "LS",               # Verify file structure completeness
    
    # Task tracking
    "TodoWrite",        # Track issues and verification progress
]
```

**Benefits:**
- Glob enables comprehensive codebase analysis
- LS helps verify all expected files exist
- TodoWrite tracks evaluation progress systematically

### QC Agent Enhancements
```python
"allowed_tools": [
    # Existing tools...
    
    # Search capabilities
    "Grep",             # Search for compliance patterns
    "Glob",             # Find test files and configs
    
    # Additional validation
    "dev_server",       # Already exists but emphasize usage
    
    # Task management
    "TodoWrite",        # Track QC checklist
]
```

**Benefits:**
- Grep enables pattern-based compliance checking
- Glob helps verify test coverage
- TodoWrite ensures systematic validation

## Implementation Priority

### High Priority (Implement Now)
1. **Glob** for all agents - Essential for file discovery
2. **LS** for Writer and Critic - Project structure understanding
3. **TodoWrite** for all agents - Systematic task tracking

### Medium Priority (Next Iteration)
4. **WebFetch/WebSearch** for Writer - Documentation lookup
5. **Bash** for Writer - Custom tooling support

### Low Priority (Future Enhancement)
6. **NotebookRead/NotebookEdit** - Only if supporting data science apps
7. **exit_plan_mode** - For complex planning scenarios

## Usage Examples with BatchTool

### Writer Agent - Parallel Component Creation
```python
BatchTool(
    Task("Glob", {"pattern": "**/components/*.tsx"}),
    Task("Read", {"file_path": "package.json"}),
    Task("LS", {"path": "src/components"})
)
```

### Critic Agent - Parallel Analysis
```python
BatchTool(
    Task("Glob", {"pattern": "**/*.test.tsx"}),
    Task("Grep", {"pattern": "TODO|FIXME|XXX", "path": "src"}),
    Task("build_test", {"command": "npm run lint"})
)
```

### QC Agent - Comprehensive Validation
```python
BatchTool(
    Task("build_test", {"command": "npm test"}),
    Task("build_test", {"command": "npm run type-check"}),
    Task("integration_analyzer", {"command": "compare_with_template"})
)
```

## Expected Improvements
1. **30-40% faster execution** through parallel operations
2. **Better code quality** through comprehensive analysis
3. **Reduced errors** through systematic discovery
4. **Improved tracking** through TodoWrite usage

## Next Steps
1. Update agent configs with high-priority tools
2. Update agent prompts to leverage BatchTool effectively
3. Test with complex applications
4. Monitor performance improvements