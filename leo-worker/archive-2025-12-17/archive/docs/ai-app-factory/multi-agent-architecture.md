# Multi-Agent Architecture

## Overview

The AI App Factory uses a sophisticated multi-agent system where specialized AI agents work together to transform ideas into applications. Each agent has a specific role, tools, and expertise, creating a production line for software development.

## Core Architecture

### Agent Types

1. **Orchestrator Agents**: Guide conversations and extract requirements
2. **Generator Agents**: Create specifications and code
3. **QC (Quality Control) Agents**: Validate and verify implementations
4. **Self-Improvement Agents**: Learn from outputs to optimize the system

### Agent Framework

All agents inherit from the `cc_agent.Agent` base class with these key properties:

```python
class Agent:
    system_prompt: str      # Defines the agent's role and expertise
    allowed_tools: list     # Tools the agent can use
    max_turns: int         # Maximum interactions allowed
    permission_mode: str   # Security and access controls
    cwd: str              # Working directory context
```

## Stage 2: Three-Agent System (Most Mature)

Stage 2 represents our most sophisticated implementation with three specialized agents working in sequence.

### 1. Wireframe Agent

**Purpose**: Transform interaction specifications into working frontend applications

**System Prompt**:
```
You are a Next.js and ShadCN UI expert developer.
Your role is to transform interaction specifications into beautiful, functional wireframes.
```

**Key Characteristics**:
- **Max Turns**: 300 (high limit for complex generation)
- **Working Directory**: Set to output directory for relative paths
- **Tools**: Read, Write, MultiEdit, build_test, browser, shadcn
- **Output**: Complete Next.js application with 30-50 files

**Process**:
1. Parse interaction specification
2. Generate Next.js pages and components
3. Implement all specified interactions
4. Apply ShadCN UI components and dark mode
5. Run build verification
6. Test in browser for runtime errors
7. Fix any issues and re-verify

**Quality Features**:
- Mock-first development (UI works without backend)
- Comprehensive error handling
- Loading states and optimistic updates
- Responsive design
- Professional code structure

### 2. QC (Quality Control) Agent

**Purpose**: Validate that implementations match specifications exactly

**System Prompt**:
```
You are a quality control specialist.
CRITICAL: Always start by using the integration_analyzer tool to identify changed files.
Focus your review ONLY on these changed files.
```

**Key Innovation - Integration Analyzer**:
- **Problem**: Reviewing 100+ files is inefficient and exceeds token limits
- **Solution**: Tool that identifies only changed/added files vs base template
- **Impact**: 90%+ scope reduction (review 10 files instead of 100)
- **Benefit**: Enables thorough analysis within token constraints

**QC Process**:
1. **Scope Analysis**
   ```bash
   integration_analyzer --compare-with base_template/
   # Returns: List of modified/added files only
   ```

2. **Feature Extraction**
   - Parse interaction specification
   - Create checklist of required features
   - Map features to expected locations

3. **Implementation Review**
   - Read only changed files
   - Verify each feature is implemented
   - Check technical pattern compliance
   - Identify missing features
   - Note extra features (often helpful)

4. **Root Cause Analysis**
   - **Specification Issues**: Ambiguous or missing details
   - **Implementation Issues**: Overlooked or misunderstood features
   - **Enhancement Opportunities**: Useful additions by the agent

5. **Report Generation**
   ```markdown
   # QC Report: [App Name]
   
   ## Executive Summary
   - Compliance Score: 85%
   - Missing Features: 12
   - Extra Features: 2
   - Build Status: ✅ Pass
   
   ## Scope Analysis
   - Total Files: 105
   - Files Reviewed: 10
   - Scope Reduction: 90.5%
   
   ## Compliance Details
   ### ✅ Correctly Implemented (45/53)
   - User authentication with JWT
   - Channel creation and management
   - Direct messaging interface
   ...
   
   ### ❌ Missing Features (12)
   1. Thread replies in channels
      - Root Cause: Implementation complexity
      - Location: Should be in MessageList component
      - Impact: Users cannot reply to specific messages
   
   ### ➕ Extra Features (2)
   1. Loading animations on all async operations
      - Rationale: Better user experience
      - Implementation: LoadingSpinner component
   ```

**Tools**: Read, Write, MultiEdit, build_test, browser, integration_analyzer
**Max Turns**: 100 (less than wireframe since analyzing, not creating)

### 3. Self-Improvement Agent (Designed, Not Yet Implemented)

**Purpose**: Analyze QC reports to identify patterns and generate system improvements

**Conceptual Design - "Neural Network Backpropagation"**:
```
Training Example = Each app generation
Loss Function = QC report (errors and deviations)
Weight Updates = Prompt and configuration improvements
Learning Rate = Conservative (require multiple occurrences)
Overfitting = Desirable (app-specific optimizations)
```

**System Prompt** (Planned):
```
You are a learning specialist who analyzes QC reports to improve the app factory.
Your goal is to identify patterns and generate specific improvements.
Think of yourself as implementing backpropagation in a neural network.
```

**Learning Process**:

1. **Input Analysis**
   - QC report with compliance scores
   - Missing/extra features
   - Root cause analysis
   - Success metrics

2. **Pattern Recognition**
   - Common missing features across apps
   - Recurring implementation issues
   - Frequent specification ambiguities
   - Successful patterns to reinforce

3. **Improvement Generation**
   ```json
   {
     "prompt_improvements": {
       "system_prompt": {
         "additions": [
           "Always implement password reset flows when authentication is required"
         ],
         "modifications": []
       },
       "user_prompt": {
         "additions": [
           "Requirement 11: Include form validation for all user inputs"
         ]
       }
     },
     "config_improvements": {
       "max_completion_tokens": {
         "current": 100000,
         "recommended": 120000,
         "reason": "Complex apps need more tokens"
       }
     },
     "process_improvements": [
       {
         "type": "validation_step",
         "description": "Check all forms have validation",
         "when": "after_component_generation"
       }
     ]
   }
   ```

**Learning Storage Structure**:
```
learnings/
├── app_specific/
│   └── slack-clone/
│       ├── prompt_improvements.json
│       ├── config_changes.json
│       ├── success_metrics.json
│       └── qc_history.json
├── patterns/
│   ├── common_missing_features.json
│   ├── successful_patterns.json
│   └── root_cause_analysis.json
└── general_improvements/
    ├── system_prompts.json
    ├── user_prompts.json
    └── tool_improvements.json
```

## Inter-Agent Communication

### Data Flow

```
Wireframe Agent → Generated Code → QC Agent → QC Report → Self-Improvement Agent
                                                              ↓
                                                     System Improvements
```

### Communication Patterns

1. **Sequential Pipeline**: Each agent completes before the next begins
2. **Shared Context**: Output directory and specifications
3. **Structured Outputs**: Each agent produces well-defined artifacts
4. **No Direct Communication**: Agents communicate through artifacts only

### Error Handling

- Each agent handles its own errors
- Failed agents return structured error reports
- Pipeline halts on critical failures
- Partial outputs are preserved for debugging

## Agent Design Patterns

### 1. Modular Agent Structure

```
agents/stage_2_wireframe/wireframe/
├── __init__.py
├── agent.py          # Agent initialization and execution
├── system_prompt.py  # Role definition
├── user_prompt.py    # Dynamic prompt generation
└── config.py         # Tools and settings
```

### 2. Prompt Engineering

**System Prompts**: Static role definitions
```python
SYSTEM_PROMPT = """You are an expert in [domain].
Your role is to [specific task].
You must [constraints and requirements]."""
```

**User Prompts**: Dynamic with context injection
```python
def create_prompt(spec: str, output_dir: str) -> str:
    return f"""
    Working Directory: {output_dir}
    
    Specification:
    {spec}
    
    Requirements:
    1. [Specific requirement]
    2. [Another requirement]
    ...
    """
```

### 3. Tool Configuration

```python
AGENT_CONFIG = {
    "allowed_tools": [
        "Read",
        "Write", 
        "MultiEdit",
        "build_test",
        "browser"
    ],
    "max_turns": 300,
    "permission_mode": "relaxed",
    "environment_variables": {}
}
```

## Future Multi-Agent Patterns

### Critic-Writer-Judge Pattern (Planned Evolution)

**Current (V2)**: Sequential generation
```
Generator → Output → QC → Report
```

**Future**: Iterative refinement
```
Critic → Requirements → Writer → Output → Judge → Decision
  ↑                                               ↓
  ←────────────── If not satisfied ←─────────────
```

**Benefits**:
- Catch issues before expensive generation
- Iterative improvement
- Clear termination criteria
- Better quality through refinement

### Parallel Agent Execution (Future)

For independent tasks, agents could work in parallel:
```
                  ┌→ Frontend Spec Extractor
Wireframe Output →├→ API Contract Extractor
                  └→ Data Model Extractor
                            ↓
                        Reconciler
```

## Best Practices

### 1. Agent Specialization
- Each agent should have one clear responsibility
- Avoid multi-purpose agents
- Deep expertise over broad capabilities

### 2. Structured Communication
- Use well-defined output formats
- Version artifacts for compatibility
- Include metadata (timestamps, versions)

### 3. Error Recovery
- Agents should be idempotent
- Save progress incrementally
- Provide clear error messages

### 4. Performance Optimization
- Use tools like integration_analyzer to reduce scope
- Batch operations when possible
- Cache expensive computations

### 5. Continuous Learning
- Track success metrics
- Implement feedback loops
- Update based on patterns, not one-offs

## Metrics and Monitoring

### Agent Performance Metrics
- **Success Rate**: Percentage of successful completions
- **Token Usage**: Average tokens per run
- **Execution Time**: Time to complete
- **Error Rate**: Failures and their causes

### Quality Metrics
- **Compliance Score**: Features implemented correctly
- **Code Quality**: Linting, type checking results
- **User Satisfaction**: Would the generated app be useful?

### Learning Metrics
- **Improvement Rate**: How much better over time
- **Pattern Discovery**: New patterns identified
- **Error Reduction**: Fewer missing features

## Conclusion

The multi-agent architecture enables complex software generation through specialization and collaboration. By breaking down the problem into focused tasks and giving each agent deep expertise, we achieve better results than a single generalist agent could provide.

The key innovations—integration analyzer for efficient review, structured QC reports, and the planned self-improvement system—create a foundation for continuous improvement and scaling to more complex applications.