# Agentic Workflow Principles

## Core Patterns

### 1. Writer-Critic-Judge Pattern
The fundamental pattern for iterative improvement through specialized roles:

- **Writer (Developer)**: Creates and modifies artifacts
- **Critic (QC)**: Evaluates artifacts against specific criteria
- **Judge**: Decides when iteration should stop

**Why it works**:
- Separation of concerns prevents cognitive overload
- Specialized evaluation leads to better outcomes
- Clear decision points prevent infinite loops

### 2. Context Accumulation
The writer must create sufficient context before the critic can provide meaningful feedback.

**Implementation**:
- Initial creation phase precedes critique
- Each iteration builds on previous context
- Reports accumulate insights over iterations

### 3. Focused Criticism
Critics should evaluate one aspect at a time to provide actionable feedback.

**Examples**:
- Spec fidelity critic ignores code style
- Code quality critic assumes specs are met
- Each critic has a single, clear mandate

### 4. Convergence Through Constraints
Iteration must have clear termination conditions:

- **Hard limits**: Maximum iteration count
- **Quality thresholds**: Minimum acceptable scores
- **Diminishing returns**: Stop when improvements are marginal
- **Time bounds**: Respect resource constraints

## General Principles

### 1. Conciseness is Key
- Documentation should be scannable
- Each artifact should have a clear purpose
- Avoid redundancy across documents
- Use structured formats over prose

### 2. Problem-First Design
- Start with the problem statement
- Decompose into logical phases
- Define success criteria upfront
- Map solutions to specific problems

### 3. Explicit Over Implicit
- All assumptions must be documented
- Decision criteria must be clear
- Tool capabilities must be known
- Success metrics must be measurable

### 4. Iterative Refinement
- Perfect is the enemy of good
- Early iterations establish baseline
- Later iterations polish and optimize
- Know when to stop

## Best Practices

### 1. Agent Design
- **Single Responsibility**: Each agent should do one thing well
- **Clear Interfaces**: Well-defined inputs and outputs
- **Error Handling**: Graceful degradation and clear error messages
- **Observability**: Log decisions and reasoning

### 2. Prompt Engineering
- **Context Setting**: Provide sufficient background
- **Clear Instructions**: Unambiguous directives
- **Examples**: Show desired outcomes
- **Constraints**: Define boundaries explicitly

### 3. Tool Selection
- **Right Tool for the Job**: Match tools to tasks
- **Tool Awareness**: Agents must know available tools
- **Fallback Options**: Have alternatives ready
- **Tool Documentation**: Keep tool descriptions current

### 4. Workflow Orchestration
- **Phase Transitions**: Clear handoffs between phases
- **State Management**: Track progress and context
- **Rollback Capability**: Handle failures gracefully
- **Monitoring**: Track metrics and performance

## Architecture Decisions

### 1. Why Writer-Critic Pairs?
- **Cognitive Separation**: Different mindsets for creation vs evaluation
- **Specialization**: Each role can be optimized independently
- **Parallelization**: Multiple critics can evaluate simultaneously
- **Quality Gates**: Natural checkpoints for quality control

### 2. Why Multiple Iteration Loops?
- **Progressive Refinement**: Each loop addresses different concerns
- **Risk Mitigation**: Catch different types of issues
- **Efficiency**: Avoid mixing concerns in single loop
- **Flexibility**: Can skip loops if not needed

### 3. Why Explicit Judgment?
- **Convergence Guarantee**: Prevents infinite loops
- **Resource Management**: Controls computational costs
- **Quality Control**: Ensures minimum standards
- **Adaptability**: Can adjust criteria based on context

## Anti-Patterns to Avoid

### 1. Endless Iteration
- Missing clear termination criteria
- Judges that always say "continue"
- No diminishing returns detection

### 2. Mixed Concerns
- Critics evaluating multiple aspects
- Writers trying to anticipate all feedback
- Phases doing too much at once

### 3. Implicit Assumptions
- Undocumented tool requirements
- Hidden success criteria
- Assumed agent capabilities

### 4. Over-Engineering
- Too many iteration loops
- Excessive quality thresholds
- Premature optimization

## Continuous Improvement

### 1. Retrospective Analysis
- What worked well?
- What caused delays?
- Which prompts need refinement?
- Which tools were missing?

### 2. Metric Tracking
- Iteration counts per phase
- Time to completion
- Quality scores over time
- Success rates

### 3. Prompt Evolution
- A/B testing different prompts
- Incorporating learned patterns
- Removing ineffective instructions
- Adding discovered best practices

### 4. Tool Development
- Identify missing capabilities
- Improve existing tools
- Remove unused tools
- Document tool patterns