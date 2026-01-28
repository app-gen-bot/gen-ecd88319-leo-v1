# Available Tools Inventory

This document provides a comprehensive list of tools available to agents in the AI App Factory pipeline. Understanding tool capabilities is crucial for effective agent design and implementation.

## File System Tools

### Read Tool
**Purpose**: Read contents of files  
**Capabilities**:
- Read text files of any type
- Support for large files with pagination
- Line number preservation
- UTF-8 encoding support

**Limitations**:
- Binary files return base64 encoded content
- Very large files may need pagination

**Usage Pattern**:
```python
read_tool(file_path="path/to/file.ts", start_line=1, end_line=100)
```

### Write Tool
**Purpose**: Create or overwrite files  
**Capabilities**:
- Create new files with content
- Overwrite existing files completely
- Create directories as needed
- Any text format supported

**Limitations**:
- No append mode (must read-modify-write)
- No partial file updates

**Usage Pattern**:
```python
write_tool(file_path="path/to/file.ts", content="file contents here")
```

### Edit Tool
**Purpose**: Make targeted edits to existing files  
**Capabilities**:
- Find and replace specific content
- Preserve file structure
- Multiple edits in sequence
- Maintains indentation

**Limitations**:
- Exact string matching required
- No regex support
- Must match whitespace exactly

**Usage Pattern**:
```python
edit_tool(
    file_path="path/to/file.ts",
    old_content="exact content to replace",
    new_content="replacement content"
)
```

### List Directory Tool
**Purpose**: List contents of directories  
**Capabilities**:
- Recursive directory listing
- File type identification
- Hidden file support
- Sorting options

**Limitations**:
- Large directories may be truncated
- No file content preview

**Usage Pattern**:
```python
list_directory_tool(path="./src", recursive=True)
```

## Code Execution Tools

### Bash Tool
**Purpose**: Execute shell commands  
**Capabilities**:
- Run any bash command
- Capture stdout and stderr
- Working directory control
- Environment variable access

**Limitations**:
- No interactive commands
- Timeout after 30 seconds
- No sudo access

**Usage Pattern**:
```python
bash_tool(command="npm test", working_dir="./frontend")
```

### NPM Tool
**Purpose**: Manage Node.js packages and run scripts  
**Capabilities**:
- Install/uninstall packages
- Run package.json scripts
- Version management
- Workspace support

**Limitations**:
- Requires package.json
- Network access needed for installs

**Usage Pattern**:
```python
npm_tool(command="install", args=["react", "react-dom"])
npm_tool(command="run", args=["test"])
```

## Testing Tools

### Test Runner Tool
**Purpose**: Execute test suites  
**Capabilities**:
- Jest test execution
- Pytest execution
- Test filtering
- Coverage reporting

**Limitations**:
- Framework must be configured
- Timeout limits apply

**Usage Pattern**:
```python
test_runner_tool(framework="jest", pattern="*.spec.ts")
```

## Analysis Tools

### Code Search Tool
**Purpose**: Search for patterns in code  
**Capabilities**:
- Regex pattern matching
- Multi-file search
- Context lines
- File type filtering

**Limitations**:
- Performance on large codebases
- Complex regex may timeout

**Usage Pattern**:
```python
code_search_tool(
    pattern="useState\\([^)]*\\)",
    file_pattern="*.tsx",
    context_lines=3
)
```

### AST Analysis Tool
**Purpose**: Analyze code structure  
**Capabilities**:
- Extract component definitions
- Find function calls
- Identify imports/exports
- Type information

**Limitations**:
- Language specific (JS/TS)
- May not handle all syntax

**Usage Pattern**:
```python
ast_tool(file_path="component.tsx", query="find_components")
```

## Validation Tools

### Linter Tool
**Purpose**: Check code quality  
**Capabilities**:
- ESLint for JavaScript/TypeScript
- Prettier formatting
- Custom rule support
- Auto-fix capability

**Limitations**:
- Requires configuration
- May have false positives

**Usage Pattern**:
```python
linter_tool(files=["src/**/*.ts"], fix=True)
```

### Type Checker Tool
**Purpose**: Validate TypeScript types  
**Capabilities**:
- Full TypeScript checking
- Project-wide analysis
- Error reporting
- Declaration file generation

**Limitations**:
- TypeScript projects only
- Can be slow on large projects

**Usage Pattern**:
```python
type_checker_tool(project="./tsconfig.json")
```

## Documentation Tools

### API Documentation Tool
**Purpose**: Extract API documentation  
**Capabilities**:
- Parse JSDoc comments
- Generate markdown
- Type extraction
- Example detection

**Limitations**:
- Quality depends on comments
- Format specific

**Usage Pattern**:
```python
api_doc_tool(source_dir="./src/api", output="api-docs.md")
```

## Tool Selection Guidelines

### For File Operations
- **Creating new files**: Use Write Tool
- **Modifying existing files**: Use Edit Tool for small changes, Write Tool for complete rewrites
- **Reading files**: Use Read Tool with pagination for large files
- **Exploring structure**: Use List Directory Tool

### For Code Execution
- **Running tests**: Use Test Runner Tool or NPM Tool
- **Building project**: Use NPM Tool or Bash Tool
- **Installing dependencies**: Use NPM Tool

### For Code Analysis
- **Finding patterns**: Use Code Search Tool
- **Understanding structure**: Use AST Analysis Tool
- **Checking quality**: Use Linter Tool and Type Checker Tool

### For Validation
- **Type safety**: Use Type Checker Tool
- **Code style**: Use Linter Tool
- **Test coverage**: Use Test Runner Tool with coverage

## Best Practices

1. **Tool Chaining**: Combine tools for complex operations
   - Read → Edit → Test → Validate

2. **Error Handling**: Always check tool outputs for errors
   - Tools return success/failure status
   - Error messages provide debugging info

3. **Performance**: Be mindful of tool performance
   - Batch operations when possible
   - Use appropriate tools for file size

4. **Validation**: Verify changes after modifications
   - Run tests after edits
   - Check types after refactoring

## Tool Limitations and Workarounds

### Common Limitations
1. **No Interactive Input**: Tools cannot handle interactive prompts
   - Workaround: Use configuration files or command arguments

2. **Timeout Constraints**: Long operations may timeout
   - Workaround: Break into smaller operations

3. **Memory Limits**: Large file operations may fail
   - Workaround: Use pagination or streaming approaches

4. **Permission Restrictions**: Some system operations restricted
   - Workaround: Work within project directory

### Future Tool Additions
The following tools are planned or under consideration:
- Database migration tool
- API testing tool
- Performance profiling tool
- Security scanning tool
- Dependency analysis tool

---

This inventory should be updated as new tools are added or existing tools are modified. Agents should consult this list when planning their approach to tasks.