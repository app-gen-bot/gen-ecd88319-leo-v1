# Subagent Architecture Design for AppGeneratorAgent

## Executive Summary

This document outlines the integration of specialized subagents into the AppGeneratorAgent to enable parallel processing, domain expertise, and enhanced research capabilities for generating arbitrary applications. The design follows the orchestrator-worker pattern with complete context isolation.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│             AppGeneratorAgent (Orchestrator)              │
│                                                           │
│  • Maintains global state and conversation context       │
│  • Reads pipeline-prompt.md as system prompt             │
│  • Delegates specialized tasks to subagents              │
│  • Synthesizes results into cohesive application         │
│  • Maximum 1000 turns for complex apps                   │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ Task Tool Delegation
                 │
    ┌────────────┴─────────────┬──────────────┬────────────────┬──────────────┬──────────────┐
    │                          │              │                │              │              │
┌───▼────────────┐    ┌───────▼────────┐ ┌──▼────────────┐ ┌▼─────────────┐ ┌▼─────────────┐ ┌─────────────┐
│ ResearchAgent  │    │ SchemaDesigner │ │ APIArchitect  │ │ UIDesigner   │ │ CodeWriter   │ │ ErrorFixer  │
│                │    │                │ │               │ │              │ │              │ │             │
│ WebSearch      │    │ Schema-First   │ │ REST/GraphQL  │ │ Dark Mode    │ │ React/Next   │ │ Debug/Fix   │
│ WebFetch       │    │ Zod + Drizzle  │ │ Contracts     │ │ Tailwind     │ │ TypeScript   │ │ Validation  │
│ Analysis       │    │ Relations      │ │ Auth Patterns │ │ shadcn/ui    │ │ Testing      │ │ Retry Logic │
└────────────────┘    └────────────────┘ └───────────────┘ └──────────────┘ └──────────────┘ └─────────────┘
```

## Core Design Principles

### 1. **Stateless Isolation**
- Each subagent receives ONLY the specific task and required context
- No shared memory between subagents
- No conversation history access
- Results are returned as pure data structures

### 2. **Single Responsibility**
- Each subagent has ONE specialized job
- Clear boundaries between responsibilities
- No overlap in expertise domains

### 3. **Pipeline Alignment**
- Subagents map directly to pipeline-prompt.md stages
- Output format matches expected pipeline inputs
- Consistent naming and structure

## Subagent Definitions

### 1. ResearchAgent - Complex Requirement Analysis

```python
research_agent = AgentDefinition(
    description="Research complex app requirements and create implementation strategy",
    prompt="""You are a senior software architect and researcher specializing in understanding complex application requirements and translating them into concrete implementation strategies.

Your responsibilities:
1. **Requirement Analysis**
   - Parse user requirements for technical implications
   - Identify potential architectural challenges
   - Determine necessary technologies and libraries

2. **Online Research** (when needed)
   - Search for best practices for specific domains
   - Find relevant libraries and frameworks
   - Research API documentation and integration patterns
   - Investigate similar existing solutions

3. **Strategy Documentation**
   - Create implementation roadmap aligned with pipeline-prompt.md
   - List specific technologies and versions
   - Identify potential challenges and solutions
   - Provide code snippets and architecture diagrams

4. **Output Format**
   Return a structured research document:
   ```markdown
   # Research Report: [App Name]

   ## Executive Summary
   [2-3 sentence overview of findings]

   ## Core Technologies Required
   - Technology 1: [version] - [why needed]
   - Technology 2: [version] - [why needed]

   ## Architecture Recommendations
   ### Backend
   - [Specific patterns and libraries]

   ### Frontend
   - [UI frameworks and components]

   ### Data Storage
   - [Database choices and schema patterns]

   ## Implementation Challenges
   1. Challenge: [description]
      Solution: [recommended approach]

   ## Code Patterns
   ```[language]
   // Example implementation patterns
   ```

   ## External APIs/Services
   - Service 1: [documentation link]
   - Service 2: [integration guide]

   ## Timeline Estimate
   - Stage 1 (Plan): [complexity rating 1-5]
   - Stage 2 (Build): [complexity rating 1-5]

   ## Risk Assessment
   - High Risk: [areas needing careful attention]
   - Medium Risk: [areas with some complexity]
   ```

IMPORTANT: Your research must align with the pipeline stages in pipeline-prompt.md.
Focus on practical, implementable solutions using the tech stack:
- Backend: Node.js, Express, PostgreSQL, Drizzle ORM
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Auth: Factory pattern (mock/Supabase)
""",
    tools=[
        "WebSearch",      # Search for solutions
        "WebFetch",       # Read documentation
        "Read",           # Read existing files
        "Write",          # Create research documents
        "mcp__mem0__add_memory",  # Store research findings
        "mcp__context_manager__analyze_query"  # Analyze complexity
    ],
    model="opus"  # Use most powerful model for research
)
```

### 2. SchemaDesigner - Database Architecture

```python
schema_designer = AgentDefinition(
    description="Design type-safe database schemas with Zod and Drizzle ORM",
    prompt="""You are a database architect specializing in type-safe schema design.

Your expertise:
1. **Zod Schema Design** (schema.zod.ts)
   - Create validation schemas as single source of truth
   - Define proper types and constraints
   - Add meaningful validation rules

2. **Drizzle ORM Conversion** (schema.ts)
   - Convert Zod schemas to Drizzle format
   - Maintain exact field parity
   - Add indexes and relationships

3. **Best Practices**
   - ALWAYS include users table with auth fields
   - Use proper foreign key relationships
   - Add created_at/updated_at timestamps
   - Create both table and insert schemas

Output files:
- shared/schema.zod.ts
- shared/schema.ts

CRITICAL: Field names must match EXACTLY between Zod and Drizzle schemas.
""",
    tools=["Read", "Write", "Edit"],
    model="sonnet"
)
```

### 3. APIArchitect - Backend Design

```python
api_architect = AgentDefinition(
    description="Design RESTful APIs with proper contracts and authentication",
    prompt="""You are a backend architect specializing in RESTful API design.

Your responsibilities:
1. **Contract Design** (shared/contracts/*.contract.ts)
   - Create ts-rest contracts for type safety
   - Define all CRUD operations
   - Add query parameters for filtering

2. **Route Architecture**
   - Design logical endpoint structure
   - Implement proper HTTP methods
   - Add authentication middleware

3. **Auth Patterns**
   - Use factory pattern for auth adapters
   - Implement mock and production modes
   - Add proper JWT handling

Output:
- Detailed route specifications
- Contract definitions
- Auth flow documentation
""",
    tools=["Read", "Write", "Edit", "Grep"],
    model="sonnet"
)
```

### 4. UIDesigner - Frontend Architecture

```python
ui_designer = AgentDefinition(
    description="Design amazing dark mode UI with modern minimalist aesthetic",
    prompt="""You are a UI/UX designer specializing in modern, minimalist dark mode interfaces.

Your expertise:
1. **Design System**
   - Create cohesive dark color palette
   - Design component hierarchy
   - Plan responsive layouts

2. **Component Architecture**
   - shadcn/ui component selection
   - Custom component requirements
   - Animation and interaction patterns

3. **User Experience**
   - Information architecture
   - User flow optimization
   - Accessibility considerations

Following pipeline-prompt.md section 2.4.1:
- Amazing dark mode with excellent contrast
- Modern minimalist aesthetic
- Tailwind CSS + shadcn/ui
- Unsplash images for visual appeal

Output:
- Component specifications
- Color palette and design tokens
- Page layout wireframes
- Interaction patterns
""",
    tools=["Read", "Write", "WebSearch"],
    model="sonnet"
)
```

### 5. CodeWriter - Implementation

```python
code_writer = AgentDefinition(
    description="Write production-ready TypeScript/React code",
    prompt="""You are a senior full-stack developer writing production code.

Your responsibilities:
1. **Code Generation**
   - Write clean, typed TypeScript
   - Create React components with hooks
   - Implement proper error handling

2. **Quality Standards**
   - Follow ESLint rules
   - Add proper TypeScript types
   - Include loading and error states

3. **Integration**
   - Use apiClient for all API calls
   - NO mock data in frontend
   - Proper auth context usage

CRITICAL: All code must work on first run. Test with type checking.
""",
    tools=["Read", "Write", "Edit", "Bash", "mcp__build_test__verify_project"],
    model="sonnet"
)
```

### 6. QualityAssurer - Testing & Validation

```python
quality_assurer = AgentDefinition(
    description="Test, validate, and ensure code quality",
    prompt="""You are a QA engineer ensuring application quality.

Your responsibilities:
1. **Testing**
   - Run type checking (tsc --noEmit)
   - Execute linting (OXC)
   - Build verification

2. **Validation**
   - Schema consistency checks
   - API endpoint testing
   - Frontend integration verification

3. **Browser Testing**
   - Use browser automation
   - Verify user flows
   - Check responsive design

Report all issues found and suggest fixes.
""",
    tools=[
        "Bash",
        "mcp__build_test__verify_project",
        "mcp__browser__open_browser",
        "mcp__browser__navigate_browser",
        "mcp__browser__interact_browser"
    ],
    model="sonnet"
)
```

### 7. ErrorFixer - Debug & Repair

```python
error_fixer = AgentDefinition(
    description="Fix errors and resolve issues in generated code",
    prompt="""You are a debugging specialist who fixes code issues.

Your expertise:
1. **Error Analysis**
   - Parse error messages
   - Identify root causes
   - Find related issues

2. **Fix Implementation**
   - Apply minimal, targeted fixes
   - Maintain existing architecture
   - Preserve working code

3. **Verification**
   - Test fixes thoroughly
   - Ensure no regressions
   - Document changes made

IMPORTANT: Make minimal changes. Don't refactor unless necessary.
""",
    tools=["Read", "Edit", "Bash", "Grep"],
    model="opus"  # Use powerful model for complex debugging
)
```

## Implementation Strategy

### Phase 1: Core Integration (Week 1)

1. **Update AppGeneratorAgent**

```python
# In agent.py
class AppGeneratorAgent:
    def __init__(self, output_dir: Optional[str] = None):
        # ... existing code ...

        # Define subagents
        self.subagents = self._initialize_subagents()

        # Update agent initialization
        self.agent = Agent(
            system_prompt=self.pipeline_prompt + self._get_subagent_instructions(),
            agents=self.subagents,
            mcp_tools=[...],
            cwd=self.output_dir,
            **AGENT_CONFIG
        )

    def _initialize_subagents(self) -> dict:
        """Initialize all specialized subagents."""
        return {
            "research_agent": research_agent,
            "schema_designer": schema_designer,
            "api_architect": api_architect,
            "ui_designer": ui_designer,
            "code_writer": code_writer,
            "quality_assurer": quality_assurer,
            "error_fixer": error_fixer,
        }

    def _get_subagent_instructions(self) -> str:
        """Add subagent usage instructions to system prompt."""
        return """

## SUBAGENT DELEGATION

You have access to specialized subagents via the Task tool. Use them to parallelize work and leverage expertise:

### Available Subagents:

1. **research_agent** - Research complex requirements
   - Use when: App has domain-specific requirements, needs external APIs, or involves unfamiliar technologies
   - Returns: Implementation strategy document

2. **schema_designer** - Design database schemas
   - Use when: Creating schema.zod.ts and schema.ts
   - Returns: Complete schema files

3. **api_architect** - Design API structure
   - Use when: Planning routes and contracts
   - Returns: API specifications

4. **ui_designer** - Design UI/UX
   - Use when: Planning frontend architecture
   - Returns: Design specifications

5. **code_writer** - Write implementation code
   - Use when: Implementing specific features
   - Returns: Working code files

6. **quality_assurer** - Test and validate
   - Use when: After code generation, before completion
   - Returns: Test results and issues

7. **error_fixer** - Fix errors
   - Use when: Errors occur during generation or testing
   - Returns: Fixed code

### Delegation Strategy:

1. **Research Phase** (for complex apps):
   ```
   Task("Research implementation strategy",
        "Analyze requirements for [specific domain] and create implementation plan",
        "research_agent")
   ```

2. **Parallel Execution** (when possible):
   ```
   // These can run in parallel after research:
   Task("Design database schema", "...", "schema_designer")
   Task("Design API structure", "...", "api_architect")
   Task("Design UI components", "...", "ui_designer")
   ```

3. **Sequential Execution** (when dependencies exist):
   ```
   // Must wait for schema before routes:
   schema_result = Task("Create schemas", "...", "schema_designer")
   routes_result = Task("Create routes using schema", "...", "code_writer")
   ```

### Best Practices:

- Delegate complex research EARLY (before Stage 1 Plan if needed)
- Use parallel execution for independent tasks
- Keep task descriptions specific and actionable
- Include relevant context in prompts
- Let subagents handle their domain entirely

IMPORTANT: Track all subagent tasks with TodoWrite.
"""
```

### Phase 2: Research Agent Testing (Week 2)

Test scenarios for ResearchAgent:

1. **ML/AI App**: "Create an app for fine-tuning open source models"
   - Should research Hugging Face, training pipelines, GPU requirements
   - Output implementation strategy for model management UI

2. **Real-time App**: "Create a collaborative whiteboard app"
   - Should research WebSocket/WebRTC, canvas APIs, conflict resolution
   - Output architecture for real-time synchronization

3. **Domain-Specific**: "Create a HIPAA-compliant medical records system"
   - Should research compliance requirements, encryption, audit logging
   - Output security architecture and compliance checklist

4. **Integration-Heavy**: "Create a multi-platform social media scheduler"
   - Should research various social APIs, OAuth flows, rate limits
   - Output integration patterns and API limitations

### Phase 3: Optimization (Week 3)

1. **Performance Metrics**
   - Track subagent invocation patterns
   - Measure token usage per subagent
   - Identify parallelization opportunities

2. **Context Optimization**
   - Compress context passed to subagents
   - Cache research results in mcp__mem0
   - Reuse subagent outputs across iterations

3. **Error Recovery**
   - Implement retry logic for failed subagents
   - Fallback strategies when subagents timeout
   - Graceful degradation patterns

## Usage Examples

### Example 1: Complex Domain App

```python
# User prompt: "Create a real-time stock trading platform with ML predictions"

# AppGeneratorAgent orchestration:
1. Invoke research_agent:
   - Research trading APIs (Alpha Vantage, Yahoo Finance)
   - Research ML libraries (TensorFlow.js, Brain.js)
   - Research real-time patterns (WebSocket, SSE)
   - Output: Complete architecture document

2. Based on research, invoke parallel subagents:
   - schema_designer: Design trades, portfolios, predictions tables
   - api_architect: Design REST + WebSocket endpoints
   - ui_designer: Design dashboard with real-time charts

3. Sequential implementation:
   - code_writer: Implement backend with research findings
   - code_writer: Implement frontend with real-time updates
   - quality_assurer: Test all components

4. If errors:
   - error_fixer: Debug and fix issues
```

### Example 2: Simple CRUD App

```python
# User prompt: "Create a todo app"

# AppGeneratorAgent orchestration (no research needed):
1. Directly invoke:
   - schema_designer: Create todos and users tables
   - api_architect: Standard CRUD routes

2. Parallel implementation:
   - code_writer: Backend routes
   - code_writer: Frontend pages

3. Validation:
   - quality_assurer: Run tests
```

## Monitoring and Logging

```python
# Add to agent.py
def log_subagent_invocation(self, subagent_type: str, task: str, result: dict):
    """Log subagent usage for monitoring."""
    logger.info(f"🤖 Subagent: {subagent_type}")
    logger.info(f"📋 Task: {task[:100]}...")
    logger.info(f"⏱️  Duration: {result.get('duration_ms', 0)}ms")
    logger.info(f"💰 Cost: ${result.get('total_cost_usd', 0):.4f}")
    logger.info(f"📊 Tokens: {result.get('usage', {})}")

    # Store in memory for analysis
    if self.enable_metrics:
        self.metrics.record_subagent_usage(
            subagent_type=subagent_type,
            duration_ms=result.get('duration_ms', 0),
            cost_usd=result.get('total_cost_usd', 0),
            tokens=result.get('usage', {})
        )
```

## Configuration Updates

```python
# In config.py
SUBAGENT_CONFIG = {
    "enabled": True,
    "parallel_execution": True,
    "max_parallel_tasks": 3,
    "timeout_ms": 60000,  # 1 minute per subagent
    "retry_on_failure": True,
    "max_retries": 2,

    # Model selection per subagent type
    "model_overrides": {
        "research_agent": "opus",     # Complex reasoning
        "schema_designer": "sonnet",  # Balanced
        "api_architect": "sonnet",    # Balanced
        "ui_designer": "sonnet",      # Creative
        "code_writer": "sonnet",      # Fast generation
        "quality_assurer": "haiku",   # Simple validation
        "error_fixer": "opus",        # Complex debugging
    },

    # Research agent specific
    "research": {
        "max_search_queries": 10,
        "max_fetch_pages": 5,
        "cache_research": True,
        "cache_ttl_hours": 24,
    }
}
```

## Success Metrics

### Performance Targets
- **Token Reduction**: 40-60% fewer tokens vs single agent
- **Parallel Speedup**: 2-3x faster for complex apps
- **Error Rate**: <5% subagent failures
- **Quality Score**: 90%+ first-run success rate

### Quality Metrics
- **Research Accuracy**: Correct technology recommendations
- **Schema Consistency**: 100% field matching
- **Code Quality**: Passes all linting and type checks
- **UI Excellence**: Follows dark mode aesthetic guidelines

## Risk Mitigation

### Potential Issues and Solutions

1. **Subagent Timeout**
   - Solution: Implement aggressive timeouts with fallback to main agent

2. **Context Size Explosion**
   - Solution: Compress research results, store in mem0

3. **Conflicting Outputs**
   - Solution: Main agent validates and reconciles differences

4. **Cost Overrun**
   - Solution: Track costs per subagent, implement budgets

5. **Research Hallucination**
   - Solution: Verify research with WebFetch, check documentation

## Future Enhancements

### Phase 4: Advanced Features
- **Dynamic Subagent Creation**: Generate custom subagents based on domain
- **Learning System**: Store successful patterns in knowledge graph
- **Team Simulation**: Multiple subagents collaborating on components
- **Progressive Enhancement**: Start simple, add complexity based on feedback

### Phase 5: Intelligence Layer
- **Pattern Recognition**: Identify similar apps, reuse strategies
- **Automated Optimization**: Learn optimal delegation patterns
- **Cross-Project Learning**: Share knowledge between projects
- **Predictive Assistance**: Anticipate user needs based on patterns

## Conclusion

This subagent architecture transforms AppGeneratorAgent from a monolithic system into a sophisticated orchestrator that can:
- Research any complex domain
- Parallelize independent work
- Leverage specialized expertise
- Maintain high quality standards
- Generate truly arbitrary applications

The Research subagent is the key innovation, allowing the system to tackle unfamiliar domains by gathering knowledge before implementation, ensuring the generated apps are not just functional but follow best practices for their specific domain.