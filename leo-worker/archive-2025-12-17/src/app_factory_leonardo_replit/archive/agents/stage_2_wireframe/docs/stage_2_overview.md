# Stage 2: Three-Agent Architecture Overview

## Purpose

Stage 2 implements a sophisticated three-agent system that not only generates frontend code but also validates quality and continuously improves itself. This creates a self-optimizing pipeline that gets better with each application it builds.

## The Three Agents

### 1. Wireframe Agent (Implementation)
The implementer that transforms interaction specifications into working frontend code.
- Generates complete NextJS/React application
- Runs build/test/verify to ensure compilation
- Uses browser tool to check for runtime errors
- Produces a fully interactive wireframe

### 2. QC Agent (Quality Control)
The reviewer that validates the implementation matches the specification.
- Uses integration analyzer tool to focus only on changed files
- Compares generated code against interaction spec
- Identifies missing features ("less") and extra features ("more")
- Determines root causes of discrepancies

### 3. Self-Improvement Agent (Optimization)
The learner that analyzes results and improves the system.
- Reviews QC reports to identify patterns
- Suggests prompt improvements, config changes, and process updates
- Stores app-specific learnings that can be aggregated
- Acts like backpropagation in neural networks

## Key Innovation: Integration Analyzer

The QC agent leverages an existing integration analyzer tool that:
- Diffs generated code against the original template
- Identifies only added and modified files
- Dramatically reduces the scope of code review
- Enables focused, efficient quality control

## Learning System Architecture

```
Stage 2 Execution Flow:
1. Wireframe Agent → Generates Code
2. Build/Test/Verify → Ensures Compilation
3. Browser Tool → Checks Runtime
4. QC Agent → Reviews Implementation
5. Self-Improvement Agent → Learns and Adapts

Feedback Loop:
- App-specific improvements (overfitting is good!)
- Cross-app pattern recognition
- Continuous prompt and config optimization
```

## Benefits

1. **Quality Assurance**: Automated verification that implementations match specifications
2. **Continuous Improvement**: System gets better with each app it builds
3. **Efficient Review**: Integration analyzer focuses only on relevant changes
4. **Root Cause Analysis**: Distinguishes between spec issues and implementation issues
5. **Self-Optimization**: Reduces manual prompt engineering through automated learning

## Implementation Strategy

We're implementing these agents incrementally:
1. **Phase 1**: Perfect the wireframe agent with testing tools
2. **Phase 2**: Add QC agent for quality validation
3. **Phase 3**: Implement self-improvement for continuous optimization

This phased approach ensures each component is solid before building the next layer.