# Tree-sitter MCP Server

This server provides deep code intelligence through AST (Abstract Syntax Tree) analysis, integrated with the mem0 memory system and Neo4j graph database.

## Features

### 1. Code Structure Analysis
- Extract functions, classes, methods, and imports
- Track code entity relationships
- Store meaningful descriptions in memory
- Create graph nodes for code navigation

### 2. Pattern Detection
- Identify design patterns (Singleton, Factory, etc.)
- Detect anti-patterns and code smells
- Store patterns in knowledge graph

### 3. Dependency Tracking
- Map import relationships
- Track function calls (coming soon)
- Visualize dependency graphs

### 4. API Call Detection
- Find external service integrations
- Track HTTP client usage
- Identify integration points

## Tools

### analyze_code_structure
Analyzes a single file to extract code entities.

```python
result = await analyze_code_structure(
    file_path="/path/to/file.py",
    include_complexity=False  # Future: cyclomatic complexity
)
```

**Returns:**
- File metrics (lines, size)
- List of entities (functions, classes)
- Import statements
- Storage status (memories created, graph nodes)

### find_code_patterns
Searches a directory for design patterns.

```python
result = await find_code_patterns(
    directory="/path/to/project",
    pattern_types=["singleton", "factory"]  # Optional filter
)
```

**Returns:**
- Files analyzed count
- Patterns found by type
- Pattern locations with confidence scores

### track_dependencies
Analyzes import dependencies for a file.

```python
result = await track_dependencies(
    file_path="/path/to/file.py",
    depth=1  # How deep to follow dependencies
)
```

**Returns:**
- Direct imports
- Dependency tree
- Unique module count

### detect_api_calls
Finds API calls and external service usage.

```python
result = await detect_api_calls(
    directory="/path/to/project",
    api_patterns=["fetch", "axios", "requests"]  # Optional
)
```

**Returns:**
- API calls found
- Grouped by pattern
- Context around each call

## Integration with Memory System

### Automatic Memory Storage
When analyzing code, the server automatically:

1. **Transforms code into descriptions**:
   - Functions → "Function 'name' provides functionality..."
   - Classes → "Class 'name' provides object-oriented structure..."
   - Methods → "Method 'name' implements behavior..."

2. **Adds contextual metadata**:
   - File location
   - Line numbers
   - Entity type
   - Signatures

3. **Creates graph relationships**:
   - File CONTAINS Function/Class
   - Class CONTAINS Method
   - File IMPORTS Module
   - Entity IMPLEMENTS Pattern

### Graph Schema

#### Node Types
- `File`: Source code files
- `Function`: Function definitions
- `Class`: Class definitions
- `Import`: Import statements
- `Pattern`: Detected design patterns

#### Relationship Types
- `CONTAINS`: File contains entities
- `IMPORTS`: File imports modules
- `METHOD_OF`: Function is method of class
- `IMPLEMENTS_PATTERN`: Entity implements pattern
- `CALLS`: Function calls function (coming soon)

## Current Limitations

1. **Language Support**: Currently simplified parsing for Python, JavaScript, TypeScript
2. **AST Parsing**: Using basic pattern matching (full tree-sitter integration coming)
3. **Pattern Detection**: Limited to name-based detection
4. **Call Graph**: Function call tracking not yet implemented

## Future Enhancements

1. **Full Tree-sitter Integration**
   - Proper AST parsing with tree-sitter grammars
   - Support for more languages
   - Accurate scope analysis

2. **Enhanced Pattern Detection**
   - AST-based pattern matching
   - More pattern types
   - Machine learning-based detection

3. **Call Graph Analysis**
   - Track function calls
   - Data flow analysis
   - Type inference

4. **Refactoring Support**
   - Suggest improvements
   - Track code evolution
   - Impact analysis

## Usage Example

```python
from cc_agent.context import ContextAwareAgent

agent = ContextAwareAgent(
    name="Code Analyzer",
    system_prompt="Analyze code structure and patterns",
    cwd="/workspace/project"
)

# Analyze project
result = await agent.run(
    """Analyze all Python files in this project:
    1. Extract code structure
    2. Find design patterns
    3. Track dependencies
    Store findings for future reference.""",
    mcp_servers=agent.mcp_config
)
```

## Configuration

The server uses environment variables from `docker/.env`:

```bash
# Required for memory storage
OPENAI_API_KEY=your-api-key

# Neo4j for graph storage
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password

# Qdrant for vector search
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=cc_core_memories
```

## Development

### Adding New Language Support

1. Add language mapping in `parse_file()`
2. Implement entity extraction for the language
3. Add import parsing patterns
4. Update pattern detection rules

### Testing

Run the schema update to ensure Neo4j is configured:
```bash
python cc-tools/src/cc_tools/tree_sitter/schema_update.py
```

Test the server functionality:
```bash
# The server is tested through the MCP protocol
mcp-tree-sitter --help
```