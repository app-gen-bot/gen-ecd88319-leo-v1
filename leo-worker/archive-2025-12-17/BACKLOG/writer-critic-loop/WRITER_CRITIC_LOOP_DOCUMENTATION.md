# Writer-Critic Loop (WCL) Implementation Documentation

## Overview
The Writer-Critic Loop is an iterative agent pattern implemented in the AI App Factory pipeline that ensures high-quality code generation through systematic evaluation and refinement. Found primarily in the `lpatel/micro-sprints-enhanced` branch with the most recent and complete implementation.

## Core Pattern

### Agent Communication Flow
```
Writer (generates) → Implementation Files → Critic (evaluates) → Analysis File → Writer (improves) → ...
```

### File Naming Conventions

#### Critic Output Files
- **Location:** `apps/{app_name}/specs/`
- **Pattern:** `critic_analysis_iteration_{N}.md` where N = 1-4
- **Example:** `apps/ai-lawyer-sprints2/specs/critic_analysis_iteration_1.md`

#### Phase Documents (Backend Partitioning)
- **Location:** `apps/{app_name}/specs/phase_docs/`
- **Patterns:** 
  - `phase_{N}_api_contract.md` - API endpoints for phase N
  - `phase_{N}_data_models.md` - Data models for phase N
- **Created by:** Stage 3.5 Backend Partitioning

#### Other Artifacts
- **QC Report:** `specs/qc_analysis_report.md`
- **Integration Analysis:** `specs/integration-analysis.md` 
- **Retrospective:** `specs/stage-2-retrospective.md`

## Implementation Details

### Stage 2: Wireframe Generation v2
**File:** `src/micro_sprints/stages/stage_2_wireframe_v2.py`

#### Key Components:
1. **Writer Agent:** Generates/modifies React components and Next.js pages
2. **Critic Agent:** Evaluates compliance, completeness, and quality
3. **QC Agent:** Final validation after iterations complete
4. **Integration Analyzer:** Checks component integration
5. **Retrospective Agent:** Generates final report

#### Iteration Logic:
```python
# Maximum 4 iterations
for iteration in range(max_iterations):
    # Writer creates/improves implementation
    writer_result = await writer_agent.run(user_prompt)
    
    # Critic evaluates
    critic_result = await critic_agent.run(critic_prompt)
    
    # Parse critic decision
    if critic_decision == "complete" or compliance_score >= threshold:
        break
    
    # Pass critic feedback to next iteration
    critic_result.metadata['evaluation'] = critic_feedback
```

#### Compliance Threshold
- Default: 85%
- Configurable via `AGENT_CONFIG["compliance_threshold"]`
- Critic evaluates against interaction spec requirements

### Communication Pattern

#### 1. Initial Writer Execution
- Receives interaction spec and technical spec
- Generates complete implementation
- Creates all required files (components, pages, API routes)

#### 2. Critic Evaluation
- Reads generated files
- Compares against specifications
- Calculates compliance score
- Generates detailed analysis with:
  - Missing features list
  - Critical issues
  - Code quality problems
  - Priority fixes

#### 3. Feedback Transmission
For large codebases (>1000 files):
- Critic writes detailed analysis to `critic_analysis_iteration_{N}.md`
- Writer prompt includes path to analysis file
- Writer must read file before making changes

For smaller codebases:
- Critic feedback embedded directly in prompt
- JSON structure with evaluation details

#### 4. Writer Improvement
- Reads critic feedback (file or inline)
- Addresses priority fixes first
- Implements missing features
- Fixes code quality issues
- Preserves working functionality

### Example Critic Analysis Structure

```markdown
# Sprint 1 Wireframe Implementation - Critic Analysis (Iteration 1)

## Executive Summary
**Compliance Score: 65/100**
[Summary of major findings]

## Tech Stack Compliance Analysis
### ✅ Correct Stack Implementation
- [List of correctly implemented technologies]

### ❌ Stack Deviations  
- [List of deviations from required stack]

## Feature Implementation Status
### 1. [Feature Name] ❌/✅ Status
**Implemented:**
- [What works]

**Missing:**
- [What's missing]

**Critical Issues:**
- [Blocking problems]

## Code Quality Analysis
- [Linting results]
- [Type errors]
- [Build issues]

## Priority Fixes for Next Iteration
1. [Most critical fix]
2. [Second priority]
3. [Third priority]
```

### Stage 4: Backend Implementation v2
**File:** `src/micro_sprints/stages/stage_4_backend_v2.py`

Similar pattern to Stage 2 but for backend:
- Writer generates FastAPI routes, models, repositories
- Critic evaluates API compliance, data models, business logic
- Uses phased approach with phase documents from Stage 3.5

## Key Features

### 1. Iterative Refinement
- Up to 4 iterations allowed
- Each iteration improves based on specific feedback
- Compliance score tracked across iterations
- Automatic completion when threshold met

### 2. Detailed Feedback Mechanism
- Large codebases: Separate analysis files
- Small codebases: Inline JSON feedback
- Priority fixes highlighted
- Specific code snippets provided

### 3. Context Preservation
- Previous iteration feedback passed forward
- Writer maintains working features while fixing issues
- Incremental improvements without regression

### 4. Cost and Performance Tracking
- Cost per iteration tracked
- Total cost aggregated
- Duration measured
- Files generated counted

## Typical Iteration Pattern

Based on `ai-lawyer-sprints2` execution:

1. **Iteration 1:** Basic structure (65% compliance)
   - Core file structure created
   - Basic components implemented
   - Major features missing

2. **Iteration 2:** Core features added (78% compliance)
   - Main functionality implemented
   - Authentication integrated
   - API connections established

3. **Iteration 3:** Refinements (85% compliance)
   - Bug fixes applied
   - Missing features added
   - Code quality improved

4. **Iteration 4:** Final polish (92% compliance)
   - Edge cases handled
   - Testing features added
   - Documentation completed

## Critic Restart Mode

Allows resuming Writer-Critic loop from any iteration:

```bash
# Start at Critic iteration 2 with previous feedback
uv run python -m app_factory.main_v2 \
    --start-at-critic \
    --app-name app_20250716_074453 \
    --critic-iteration 2 \
    --critic-feedback-file apps/app_20250716_074453/specs/critic_evaluation_result.json
```

Use cases:
- Pipeline interrupted during execution
- Re-evaluate existing code
- Continue from specific iteration
- Debug specific iteration issues

## Success Metrics

From retrospective analysis:
- **Average Compliance:** 85-92% after 4 iterations
- **Feature Completion:** 95-100% of sprint requirements
- **Build Success:** 90% (minor fixes may be needed)
- **Cost per Stage:** $150-200 for full iterations
- **Duration:** 2-3 hours for complete execution

## Best Practices

1. **Clear Specifications:** Better specs lead to fewer iterations
2. **Compliance Threshold:** 85% is optimal balance
3. **Iteration Limit:** 4 iterations prevent infinite loops
4. **Feedback Detail:** More detail in critic analysis improves writer fixes
5. **Phase Documents:** Backend partitioning improves incremental development

## Branch Variations

### lpatel/micro-sprints-enhanced (Most Recent)
- Contract-first pipeline architecture
- Optimized Writer prompts
- Critical type safety requirements
- LLM-first architecture guidance
- Comprehensive testing infrastructure

### lpatel/micro-sprints
- Original micro-sprints implementation
- Better Auth integration
- Browser testing requirements
- AWS services testing

### lpatel/contract-first
- Stage 1.95 improvements
- Orval annotation system
- MSW handlers generation
- AppShell navigation fixes

## Future Enhancements

Based on retrospective reports:
1. Build verification before completion
2. Automatic linting enforcement
3. Cost optimization (reduce iterations)
4. Parallel critic evaluation for different aspects
5. Incremental file updates vs full regeneration