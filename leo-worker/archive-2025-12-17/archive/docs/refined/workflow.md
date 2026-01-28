# Stage 2: Wireframe Generation Workflow

## Overview

Transform interaction specifications into a fully functional Next.js wireframe using the [Critic-Writer-Judge pattern](./agentic-patterns.md#core-pattern-critic-writer-judge).

## Stage Flow

```mermaid
graph TD
    Spec[Interaction Spec] --> Dev[Initial Development]
    Patterns[Tech Patterns] --> Dev
    Dev --> Code[Initial Code]
    Code --> Fidelity[Spec Fidelity Loop]
    Fidelity --> Quality[Code Quality Loop]
    Quality --> Final[Final Wireframe]
    Final --> Retro[Retrospective]
```

## Phase 1: Initial Creation

Create baseline implementation from specifications.

```mermaid
graph LR
    IS[Interaction Spec] --> Developer
    TP[Tech Patterns] --> Developer
    Developer --> IC[Initial Code]
    Developer --> TR[Test Results]
    Developer --> Notes[Implementation Notes]
```

## Phase 2: Spec Fidelity Loop

Ensure implementation matches specifications exactly.

```mermaid
graph LR
    Code[Current Code] --> Critic
    Critic --> FR[Fidelity Report]
    FR --> Developer
    Developer --> UC[Updated Code]
    UC --> Judge{Judge}
    FR --> Judge
    Judge -->|Issues Found| Code
    Judge -->|Specs Met| Exit[Next Phase]
```

**Focus**: Feature completeness, behavior accuracy, edge case handling

## Phase 3: Code Quality Loop

Ensure code is maintainable and follows best practices.

```mermaid
graph LR
    Code[Current Code] --> Critic
    Critic --> QR[Quality Report]
    QR --> Developer
    Developer --> RC[Refactored Code]
    RC --> Judge{Judge}
    QR --> Judge
    Judge -->|Needs Work| Code
    Judge -->|Quality Met| Exit[Complete]
```

**Focus**: Code patterns, simplicity, maintainability, performance

## Phase 4: Retrospective

Analyze and improve the workflow process.

```mermaid
graph LR
    Process[Workflow Process] --> Analysis
    Analysis --> Report[Retrospective Report]
    Report --> Improvements[Improvement Recommendations]
    Report --> Lessons[Lessons Learned]
```

## Decision Criteria

### Judge Evaluation Points

1. **Spec Fidelity Judge**
   - Inputs: Fidelity report + Updated code
   - Evaluates: Feature implementation, behavior matching, edge cases
   - Decision: Continue iteration or proceed to quality phase

2. **Code Quality Judge**
   - Inputs: Quality report + Refactored code
   - Evaluates: Best practices, maintainability, simplicity
   - Decision: Continue iteration or mark complete

### Exit Conditions

- Maximum iterations reached (configurable)
- All critical requirements met
- Diminishing returns detected
- Resource limits reached

## Artifact Flow Summary

```mermaid
graph TD
    subgraph "Inputs"
        IS[Interaction Spec]
        TP[Tech Patterns]
    end
    
    subgraph "Phase 1"
        IS --> Init[Initial Development]
        TP --> Init
        Init --> IC[Initial Code]
    end
    
    subgraph "Phase 2 & 3"
        IC --> Loops[Iterative Loops]
        Loops --> FC[Final Code]
    end
    
    subgraph "Outputs"
        FC --> FW[Final Wireframe]
        FW --> Tests[Test Suite]
        FW --> Docs[Documentation]
    end
```

## Success Metrics

- Spec compliance: >95%
- Code quality score: >85%
- Test coverage: >80%
- Iteration efficiency: <5 loops per phase
- Time to completion: Within sprint bounds

## See Also

- [Agentic Patterns](./agentic-patterns.md) - Pattern definitions and theory
- [Stage 2 Design Decisions](./stage-2-design-decisions.md) - Rationale for this implementation
- [Step Details Template](./step-details-template.md) - Detailed step documentation