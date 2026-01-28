# Stage 2: Wireframe Generation Workflow

(very concise! human input, ai-aided)

## Phase 1: Initial Creation
Pattern: Writer

Step Type: Writer
Purpose: Create baseline Next.js wireframe from specs
Inputs: Interaction Spec, Technical Impl Spec
Outputs: Initial Frontend Code, Test Results, Implementation Notes
Tools: shadcn:add_components, file_write, bash

## Phase 2: Spec Fidelity Loop
Pattern: Critic / Writer / Judge

Step Type: Critic
Purpose: Evaluate code against interaction spec
Inputs: Frontend Code, Interaction Spec, Technical Impl Spec
Outputs: Fidelity Report
Tools: integration_analyzer:compare_template, file_read, ast_analysis

Step Type: Writer
Purpose: Fix spec compliance issues
Inputs: Interaction Spec, Technical Impl Spec, Fidelity Report, Frontend Code
Outputs: Updated Frontend Code
Tools: shadcn:add_components, file_edit, bash

Step Type: Judge
Purpose: Decide if spec compliance sufficient
Inputs: Interaction Spec, Technical Impl Spec, Fidelity Report, Updated Frontend Code
Outputs: Continue/Exit Decision
Tools: file_read, code_search

## Phase 3: Code Quality Loop
Pattern: Critic / Writer / Judge

Step Type: Critic
Purpose: Evaluate code quality and patterns
Inputs: Frontend Code
Outputs: Quality Report
Tools: linter, type_checker, code_search

Step Type: Writer
Purpose: Refactor for quality improvements
Inputs: Frontend Code, Quality Report
Outputs: Refactored Frontend Code
Tools: file_edit, prettier, bash

Step Type: Judge
Purpose: Decide if quality standards met
Inputs: Quality Report, Refactored Frontend Code
Outputs: Continue/Exit Decision
Tools: file_read, linter

## Phase 4: Retrospective
Pattern: Critic

Step Type: Critic
Purpose: Analyze workflow effectiveness
Inputs: Process Logs, Final Code, Time Metrics
Outputs: Retrospective Report, Improvement Recommendations
Tools: file_read, log_analyzer 