# Stage 2: Wireframe Generation (v2 - 3 Sub-Agents)

(very concise! human input, ai-aided)

## Sub-Agent 1: Wireframe Agent
Pattern: Writer

Step Type: Writer
Purpose: Implement all interactions and create UI
Inputs: Frontend Interaction Spec, Technical Implementation Spec
Outputs: Next.js Application
Tools: shadcn_components, file_write, build_test_verify, browser_tool

## Sub-Agent 2: QC Agent
Pattern: Critic

Step Type: Critic
Purpose: Check compliance and identify discrepancies
Inputs: Frontend Interaction Spec, Technical Implementation Spec, Next.js Application
Outputs: QC Compliance Report
Tools: integration_analyzer, interaction_coverage_checker, pattern_validator, responsive_design_checker

## Sub-Agent 3: Self-Improvement Agent
Pattern: Retrospective

Step Type: Critic
Purpose: Analyze patterns and suggest improvements
Inputs: QC Reports, Generation History
Outputs: Improvement Suggestions
Tools: pattern_analyzer, prompt_optimizer, config_recommender, learning_storage

## Implementation Details
- Beautiful dark mode UI
- ShadCN components
- Proper auth flow
- Error handling
- Runtime error checking
- Focus on changed files only
- Identify missing/extra features
- Root cause analysis
- Acts like neural network backpropagation