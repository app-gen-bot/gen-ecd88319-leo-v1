# Stage 2: Wireframe Generation - Detailed Workflow

*This document was AI-generated from the concise human input at `../human-input/stage-2-workflow.md`*

## Overview

Stage 2 transforms interaction specifications and technical patterns into a fully functional, tested Next.js wireframe application. This stage employs the Critic-Writer-Judge pattern across multiple phases to ensure both functional correctness and code quality.

## Phase 1: Initial Creation

**Pattern**: Single Writer phase to establish baseline

### Writer Step: Initial Frontend Development

**Purpose**: Create baseline Next.js wireframe from specs

The initial writer creates a complete first implementation of the wireframe based on the provided specifications. This serves as the foundation for iterative refinement.

**Detailed Inputs**:
- **Interaction Spec**: Defines all UI components, layouts, user interactions, and state management requirements
- **Technical Impl Spec**: Provides architectural patterns, component structure guidelines, and technology constraints

**Detailed Outputs**:
- **Initial Frontend Code**: Complete Next.js application with:
  - All specified pages and routes
  - Component hierarchy matching interaction spec
  - Basic styling and layout
  - Initial state management setup
- **Test Results**: Output from initial test runs showing coverage and any failures
- **Implementation Notes**: Developer's notes on decisions made, assumptions, and areas needing clarification

**Tool Usage**:
- `shadcn:add_components`: Rapidly scaffold UI components from the shadcn/ui library
- `file_write`: Create new files for components, pages, and configuration
- `bash`: Run build commands, tests, and development server

**Success Criteria**:
- All pages/routes specified exist
- Components render without errors
- Basic navigation works
- Development server runs successfully

## Phase 2: Spec Fidelity Loop

**Pattern**: Critic / Writer / Judge iterative refinement

### Critic Step: Spec Compliance Evaluation

**Purpose**: Evaluate code against interaction spec

The critic performs a thorough analysis comparing the implemented code against the original interaction specifications, identifying gaps, missing features, or incorrect implementations.

**Detailed Inputs**:
- **Frontend Code**: Current state of the implementation
- **Interaction Spec**: Original requirements to validate against
- **Technical Impl Spec**: Architectural constraints to verify

**Detailed Outputs**:
- **Fidelity Report**: Structured report containing:
  - Missing components or features
  - Incorrect interaction behaviors
  - State management issues
  - Layout/styling deviations
  - Edge cases not handled
  - Severity ratings for each issue

**Tool Usage**:
- `integration_analyzer:compare_template`: Automated comparison against template patterns
- `file_read`: Examine specific implementation files
- `ast_analysis`: Parse component structure and identify patterns

### Writer Step: Spec Compliance Fixes

**Purpose**: Fix spec compliance issues

The writer receives the fidelity report and systematically addresses each identified issue, focusing on bringing the implementation into alignment with specifications.

**Detailed Inputs**:
- **Interaction Spec**: Reference for correct behavior
- **Technical Impl Spec**: Patterns to follow
- **Fidelity Report**: Specific issues to address
- **Frontend Code**: Current implementation to modify

**Detailed Outputs**:
- **Updated Frontend Code**: Modified implementation with:
  - Missing features added
  - Incorrect behaviors fixed
  - Edge cases handled
  - Proper error states implemented

**Tool Usage**:
- `shadcn:add_components`: Add any missing UI components
- `file_edit`: Modify existing files to fix issues
- `bash`: Re-run tests to verify fixes

### Judge Step: Spec Compliance Decision

**Purpose**: Decide if spec compliance sufficient

The judge evaluates both the critic's report and the updated code to determine whether the implementation now meets the specification requirements sufficiently to proceed.

**Detailed Inputs**:
- **Interaction Spec**: Original requirements
- **Technical Impl Spec**: Technical constraints
- **Fidelity Report**: Issues identified by critic
- **Updated Frontend Code**: Writer's fixes

**Detailed Outputs**:
- **Continue/Exit Decision**: 
  - Continue: Specific remaining issues need addressing
  - Exit: Spec compliance is sufficient, proceed to quality phase

**Decision Criteria**:
- All critical features implemented
- Core user flows work correctly
- No blocking issues remain
- Edge cases adequately handled

**Tool Usage**:
- `file_read`: Verify specific fixes in code
- `code_search`: Confirm implementation patterns

## Phase 3: Code Quality Loop

**Pattern**: Critic / Writer / Judge iterative refinement

### Critic Step: Code Quality Evaluation

**Purpose**: Evaluate code quality and patterns

The critic shifts focus from functionality to code quality, examining the implementation for maintainability, performance, and adherence to best practices.

**Detailed Inputs**:
- **Frontend Code**: Current implementation to analyze

**Detailed Outputs**:
- **Quality Report**: Comprehensive analysis including:
  - Code duplication issues
  - Component complexity metrics
  - Performance bottlenecks
  - Accessibility concerns
  - Type safety issues
  - Naming consistency
  - File organization problems

**Tool Usage**:
- `linter`: ESLint analysis for code style and potential bugs
- `type_checker`: TypeScript compilation and type coverage
- `code_search`: Pattern matching for anti-patterns

### Writer Step: Quality Refactoring

**Purpose**: Refactor for quality improvements

The writer improves code quality based on the critic's report, focusing on maintainability, performance, and best practices without changing functionality.

**Detailed Inputs**:
- **Frontend Code**: Implementation to refactor
- **Quality Report**: Specific quality issues to address

**Detailed Outputs**:
- **Refactored Frontend Code**: Improved implementation with:
  - Extracted reusable components
  - Optimized re-renders
  - Consistent naming
  - Proper TypeScript types
  - Clean file structure

**Tool Usage**:
- `file_edit`: Refactor existing code
- `prettier`: Format code consistently
- `bash`: Run linters and type checks

### Judge Step: Quality Standards Decision

**Purpose**: Decide if quality standards met

The judge evaluates whether the code now meets quality standards for production use.

**Detailed Inputs**:
- **Quality Report**: Original quality issues
- **Refactored Frontend Code**: Improved implementation

**Detailed Outputs**:
- **Continue/Exit Decision**:
  - Continue: Significant quality issues remain
  - Exit: Code meets quality thresholds

**Decision Criteria**:
- Linter warnings below threshold
- Type coverage acceptable
- No critical performance issues
- Code is maintainable

**Tool Usage**:
- `file_read`: Review refactored code
- `linter`: Verify improvements

## Phase 4: Retrospective

**Pattern**: Single Critic phase for process improvement

### Critic Step: Workflow Analysis

**Purpose**: Analyze workflow effectiveness

The retrospective critic examines the entire process to identify improvements for future iterations.

**Detailed Inputs**:
- **Process Logs**: Detailed logs from all phases
- **Final Code**: The completed implementation
- **Time Metrics**: Duration of each phase and iteration counts

**Detailed Outputs**:
- **Retrospective Report**: Analysis including:
  - Bottlenecks in the process
  - Common issue patterns
  - Tool effectiveness
  - Prompt improvement suggestions
- **Improvement Recommendations**: Specific actionable improvements for:
  - Agent prompts
  - Tool selection
  - Process flow
  - Success criteria

**Tool Usage**:
- `file_read`: Analyze logs and outputs
- `log_analyzer`: Extract patterns and metrics

**Key Metrics Tracked**:
- Total time per phase
- Number of iterations needed
- Types of issues most common
- Tool usage patterns
- Success rate of fixes

## Process Optimization Notes

### Typical Flow
1. Initial creation takes 10-15 minutes
2. Spec fidelity usually requires 2-3 iterations
3. Code quality typically needs 1-2 iterations
4. Total process completes in 30-45 minutes

### Common Patterns
- Missing error states often caught in spec fidelity
- Component extraction main focus of quality phase
- Type safety issues surface in both phases

### Efficiency Tips
- Comprehensive initial implementation reduces iterations
- Clear spec documents prevent ambiguity
- Automated tools catch issues early