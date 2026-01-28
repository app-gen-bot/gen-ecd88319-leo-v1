# 🤖 Recipe: How to Add Subagents to AppGeneratorAgent

**Purpose**: Step-by-step guide for AI agents to add new specialized subagents to the app-factory pipeline.

**Prerequisites**:
- Working app-factory installation
- Understanding of Task tool delegation
- Subagent integration fix applied (see `subagent-integration-fix.md`)

---

## 📋 Quick Checklist

- [ ] Create subagent Python file in `src/app_factory_leonardo_replit/agents/app_generator/subagents/`
- [ ] Import and register in `__init__.py`
- [ ] Add to pipeline-prompt.md documentation
- [ ] Test with test-subagent-integration.py
- [ ] Use Task tool to delegate

---

## 🎯 When to Create a New Subagent

Create a subagent when you need:
- **Specialized expertise** for a specific domain (e.g., database optimization, security auditing)
- **Isolated context** to prevent information overflow
- **Parallel execution** of independent tasks
- **Different model** requirements (opus for complex, haiku for simple)
- **Restricted tools** for safety or efficiency

**DO NOT** create subagents for:
- Simple tasks that main agent can handle
- Tasks requiring full application context
- One-off operations

---

## 📝 Step 1: Define Your Subagent

### 1.1 Choose a Name
- Use lowercase with underscores: `database_optimizer`, `security_auditor`, `performance_tuner`
- Be specific about the subagent's purpose
- Avoid generic names like `helper` or `assistant`

### 1.2 Select Model
- `"opus"` - Complex reasoning, research, problem-solving ($$$ expensive)
- `"sonnet"` - Standard coding, design, implementation ($ balanced)
- `"haiku"` - Simple validation, testing, formatting (¢ cheap)
- `"inherit"` - Use parent agent's model

### 1.3 Choose Tools
Only include necessary tools for the task:
```python
# Good: Focused tool selection
tools = ["Read", "Write", "Edit", "TodoWrite"]

# Bad: Kitchen sink approach
tools = ["Read", "Write", "Edit", "Bash", "WebSearch", "WebFetch", ...]
```

---

## 🛠️ Step 2: Create Subagent File

**Location**: `src/app_factory_leonardo_replit/agents/app_generator/subagents/your_subagent.py`

### Complete Template:

```python
"""
YourSubagentName - Brief description of purpose.

This agent specializes in [specific domain/task].
"""

from dataclasses import dataclass
from typing import Literal, Optional, List

@dataclass
class AgentDefinition:
    """Definition for a specialized subagent."""
    description: str
    prompt: str
    tools: Optional[List[str]] = None
    model: Optional[Literal["sonnet", "opus", "haiku", "inherit"]] = None

# Define your subagent
your_subagent_name = AgentDefinition(
    description="One-line description shown in logs (max 60 chars)",
    prompt="""You are a specialized agent focused on [specific task].

## Your Responsibilities

1. **Primary Task**
   - Specific requirement 1
   - Specific requirement 2
   - Specific requirement 3

2. **Constraints**
   - What you MUST do
   - What you MUST NOT do
   - Quality standards to maintain

3. **Technical Context**
   - Tech stack: Node.js, Express, PostgreSQL, React, TypeScript
   - Architecture: Schema-first, RESTful APIs, Factory pattern
   - Standards: Type-safe, no mock data, production-ready

## Expected Input

You will receive:
- Clear task description
- Relevant context (file paths, requirements, etc.)
- Success criteria

## Expected Output

You must return:
- Completed task artifacts (code, documentation, etc.)
- Summary of changes made
- Any issues encountered
- Next steps if applicable

## Critical Requirements

- ALWAYS use TodoWrite to track progress
- NEVER modify files outside your scope
- ENSURE all code is production-ready
- TEST your changes before completing
- RETURN clear status of task completion

## Example Task

Input: "Optimize database queries in user routes"
Process:
1. Read existing route files
2. Analyze query patterns
3. Implement optimizations
4. Test changes
5. Document improvements
Output: Optimized code with performance metrics
""",
    tools=[
        "TodoWrite",      # Always include for task tracking
        "Read",           # For reading existing code
        "Write",          # For creating new files
        "Edit",           # For modifying files
        # Add other tools as needed
    ],
    model="sonnet"  # or "opus" for complex, "haiku" for simple
)
```

---

## 📦 Step 3: Register Subagent

**File**: `src/app_factory_leonardo_replit/agents/app_generator/subagents/__init__.py`

### 3.1 Import Your Subagent

```python
# Add import at the top
from .your_subagent_name import your_subagent_name

# Add to __all__ list
__all__ = [
    "research_agent",
    "schema_designer",
    # ... existing subagents ...
    "your_subagent_name",  # ADD THIS
    "get_all_subagents",
    "get_subagent",
]
```

### 3.2 Add to Registry

```python
def get_all_subagents():
    """Get all available subagents as a dictionary."""
    return {
        "research_agent": research_agent,
        "schema_designer": schema_designer,
        # ... existing subagents ...
        "your_subagent_name": your_subagent_name,  # ADD THIS
    }
```

---

## 📖 Step 4: Document in Pipeline Prompt

**File**: `docs/pipeline-prompt.md`

Find the "Available Subagents" section and add:

```markdown
- **your_subagent_name**: Brief description of what it does
  - Model: sonnet/opus/haiku
  - Tools: List main tools
  - Use when: Specific scenarios
```

---

## 🧪 Step 5: Test Your Subagent

### 5.1 Verify Registration

Run the test suite:
```bash
uv run python test-subagent-integration.py
```

Should see your subagent in output:
```
✅ Loaded 9 subagents:  # Was 8, now 9
   - your_subagent_name: One-line description...
     Model: sonnet, Tools: 4
```

### 5.2 Create Specific Test

Add to `test-subagent-integration.py`:

```python
def test_your_subagent():
    """Test your specific subagent."""
    from app_factory_leonardo_replit.agents.app_generator.subagents import (
        get_all_subagents,
        your_subagent_name
    )

    # Verify it exists
    assert your_subagent_name is not None

    # Check configuration
    assert your_subagent_name.model == "sonnet"
    assert "TodoWrite" in your_subagent_name.tools
    assert len(your_subagent_name.prompt) > 100

    # Verify in registry
    all_agents = get_all_subagents()
    assert "your_subagent_name" in all_agents

    print("✅ Your subagent properly configured")
    return True
```

---

## 🚀 Step 6: Use Your Subagent

### 6.1 In Pipeline Prompt

Add delegation instructions:

```markdown
When user needs [specific task]:
Task("Brief description", "Detailed requirements...", "your_subagent_name")
```

### 6.2 In Code

```python
# In AppGeneratorAgent or pipeline execution
await agent.run("""
Use Task tool to delegate database optimization to your_subagent_name:
- Analyze all database queries
- Optimize slow queries
- Add proper indexes
""")
```

### 6.3 Parallel Execution

```python
# Multiple subagents in parallel
await agent.run("""
Run these tasks in parallel:
1. Task("Optimize DB", "...", "database_optimizer")
2. Task("Audit security", "...", "security_auditor")
3. Task("Profile performance", "...", "performance_tuner")
""")
```

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Subagent Not Found
```
Error: Subagent 'your_subagent' not found
```
**Solution**: Check exact name matches in __init__.py registry

### Pitfall 2: Import Error
```
ImportError: cannot import name 'your_subagent'
```
**Solution**: Ensure file name matches import statement

### Pitfall 3: Task Tool Not Working
```
Task tool not in allowed_tools
```
**Solution**: Verify AppGeneratorAgent includes Task in AGENT_CONFIG

### Pitfall 4: Subagent Gets No Context
```
Subagent completes but produces wrong result
```
**Solution**: Provide complete context in Task delegation prompt

### Pitfall 5: Model Confusion
```
Using expensive opus for simple tasks
```
**Solution**: Choose appropriate model for task complexity

---

## 🎯 Real-World Examples

### Example 1: Database Migration Subagent

```python
database_migrator = AgentDefinition(
    description="Handles database schema migrations and updates",
    prompt="""You are a database migration specialist.

You handle:
- Schema changes
- Data migrations
- Rollback scripts
- Migration testing

Never drop tables without backup.
Always test migrations on sample data.
""",
    tools=["Read", "Write", "Edit", "Bash", "TodoWrite"],
    model="sonnet"
)
```

### Example 2: API Documentation Subagent

```python
api_documenter = AgentDefinition(
    description="Generates comprehensive API documentation",
    prompt="""You generate OpenAPI/Swagger documentation.

You create:
- Endpoint descriptions
- Request/response schemas
- Authentication details
- Example payloads

Use JSDoc comments in code.
Generate both JSON and Markdown formats.
""",
    tools=["Read", "Write", "Grep", "TodoWrite"],
    model="haiku"  # Simple task, cheap model
)
```

### Example 3: Security Auditor Subagent

```python
security_auditor = AgentDefinition(
    description="Performs security audits and fixes vulnerabilities",
    prompt="""You are a security expert auditing code.

You check for:
- SQL injection
- XSS vulnerabilities
- Authentication bypasses
- Sensitive data exposure

Fix issues immediately.
Document all findings.
""",
    tools=["Read", "Edit", "Grep", "WebSearch", "TodoWrite"],
    model="opus"  # Complex analysis, expensive model
)
```

---

## 📊 Verification Checklist

After adding your subagent, verify:

1. **File Structure**
   - [ ] Python file in correct location
   - [ ] Follows naming convention
   - [ ] Has module docstring

2. **Registration**
   - [ ] Imported in __init__.py
   - [ ] Added to __all__ list
   - [ ] Added to get_all_subagents()

3. **Configuration**
   - [ ] Description under 60 chars
   - [ ] Prompt is comprehensive
   - [ ] Appropriate model selected
   - [ ] Minimal necessary tools

4. **Testing**
   - [ ] Appears in test output
   - [ ] Count increases by 1
   - [ ] Specific test passes

5. **Documentation**
   - [ ] Added to pipeline-prompt.md
   - [ ] Usage examples provided
   - [ ] Clear when to use

---

## 🎉 Success Indicators

You know your subagent is working when:

1. ✅ Test suite shows it loaded: `✅ Loaded 9 subagents` (was 8)
2. ✅ Task tool can delegate to it without errors
3. ✅ Subagent completes tasks successfully
4. ✅ Logs show: `🤖 Delegating to your_subagent_name`
5. ✅ Results match expected output quality

---

## 📚 Additional Resources

- `subagent-integration-fix.md` - How the integration works
- `test-subagent-integration.py` - Test examples
- `pipeline-prompt.md` - Main system prompt
- `agents/app_generator/subagents/` - Existing subagent examples

---

## 🆘 Troubleshooting Commands

```bash
# Test all subagents
uv run python test-subagent-integration.py

# Check if subagent files exist
ls -la src/app_factory_leonardo_replit/agents/app_generator/subagents/

# Verify import works
uv run python -c "from app_factory_leonardo_replit.agents.app_generator.subagents import get_all_subagents; print(list(get_all_subagents().keys()))"

# Test Task delegation (requires API key)
uv run python -c "from app_factory_leonardo_replit.agents.app_generator import AppGeneratorAgent; import asyncio; agent = AppGeneratorAgent(); asyncio.run(agent.delegate_to_subagent('your_subagent_name', 'Test task'))"
```

---

## 💡 Pro Tips

1. **Start Simple**: Begin with haiku model and few tools, upgrade if needed
2. **Test Locally**: Use delegate_to_subagent() method for quick testing
3. **Log Everything**: Add logging to understand what subagent receives/returns
4. **Version Control**: Commit after each successful subagent addition
5. **Document Decisions**: Explain why specific model/tools were chosen

---

**Remember**: Subagents are powerful but add complexity. Only create them when the benefits (isolation, parallelization, specialization) outweigh the coordination overhead.

---

*Last Updated: January 2025*
*Tested With: claude-agent-sdk v0.1.4+*