# Quality Control (QC) Agent

## Purpose

The QC Agent validates that the wireframe implementation matches the interaction specification. It uses the integration analyzer tool to efficiently review only changed files and produces detailed reports on compliance, identifying both missing features and extra additions.

## Key Innovation: Focused Review

By leveraging the integration analyzer tool, the QC agent:
- Reviews only files that were added or modified
- Ignores unchanged template files
- Reduces review scope by 90%+ in most cases
- Enables thorough analysis of relevant code

## Responsibilities

1. **Scope Analysis**
   - Use integration analyzer to identify changed files
   - Calculate review scope metrics
   - Focus only on relevant modifications

2. **Specification Compliance**
   - Verify all specified features are implemented
   - Check that implementations match descriptions
   - Validate user flows are complete

3. **Deviation Analysis**
   - Identify features not in the spec ("more")
   - Find missing specified features ("less")
   - Determine root causes of deviations

4. **Report Generation**
   - Create structured compliance reports
   - Provide actionable recommendations
   - Document findings for self-improvement

## Input Requirements

1. **Generated Code**
   - Path to the implemented frontend
   - Build artifacts and test results

2. **Original Template**
   - Path to template.zip or extracted template
   - Used for differential analysis

3. **Interaction Specification**
   - The spec that should have been implemented
   - Used as the source of truth

4. **Integration Analyzer Results**
   - List of added files
   - List of modified files
   - Scope reduction metrics

## Output: QC Report

```markdown
# QC Report: {app_name}
Generated: {timestamp}

## Executive Summary
- Compliance Score: 92%
- Missing Features: 2
- Extra Features: 3
- Recommended Actions: 4

## Scope Analysis
- Template Files: 47
- Added Files: 23
- Modified Files: 8
- Review Scope: 31 files (66% reduction)

## Compliance Details

### ✅ Correctly Implemented (18 features)
1. User authentication flow
2. Dashboard layout
3. Form validation
...

### ❌ Missing Features (2)
1. Password reset flow
   - Severity: High
   - Root Cause: Ambiguous spec wording
   - Location: Should be in /app/auth/reset

2. Export functionality
   - Severity: Medium
   - Root Cause: Implementation oversight
   - Location: Should be in dashboard actions

### 🔧 Technical Pattern Compliance
1. Authentication patterns
   - Token storage: ✅ Using secure httpOnly cookies
   - Session management: ✅ Proper refresh logic
   
2. Error handling patterns
   - HTTP status codes: ✅ Consistent error responses
   - UI feedback: ✅ Toast notifications for all actions
   
3. State management patterns
   - Context usage: ✅ Proper provider hierarchy
   - Hook patterns: ✅ Custom hooks for data fetching

### ➕ Extra Features (3)
1. Loading states on all async operations
   - Impact: Positive (better UX)
   - Recommendation: Keep

2. Client-side form validation
   - Impact: Positive (immediate feedback)
   - Recommendation: Keep

3. Debug mode toggle
   - Impact: Neutral
   - Recommendation: Remove before production

## Root Cause Analysis

### Specification Issues (1)
- Password reset flow description unclear
- Recommendation: Clarify multi-step process

### Implementation Issues (1)
- Export feature was specified but missed
- Recommendation: Add to wireframe checklist

## Recommendations

1. Update interaction spec section 3.2
2. Add export feature to dashboard
3. Keep the extra UX improvements
4. Add "reset password" to auth flows
```

## Process Flow

```
1. Receive Implementation
   ├── Get generated code path
   └── Get original template path

2. Run Integration Analyzer
   ├── Identify changed files
   ├── Calculate scope metrics
   └── Generate file lists

3. Load Specifications
   ├── Parse interaction spec
   └── Extract feature list

4. Analyze Compliance
   ├── Check each specified feature
   ├── Review changed files
   └── Identify extra features

5. Determine Root Causes
   ├── Spec ambiguity
   ├── Implementation oversight
   └── Agent improvements

6. Generate Report
   ├── Structure findings
   ├── Calculate metrics
   └── Provide recommendations
```

## Analysis Strategies

### 1. Feature Mapping
- Extract feature list from spec
- Map features to file locations
- Verify presence in implementation

### 2. Code Pattern Matching
- Look for expected patterns (routes, components, forms)
- Check naming conventions
- Verify proper structure

### 3. Behavioral Validation
- Confirm navigation flows exist
- Verify form submissions work
- Check error handling presence

## Root Cause Categories

1. **Specification Issues**
   - Ambiguous descriptions
   - Missing details
   - Conflicting requirements

2. **Implementation Issues**
   - Overlooked features
   - Misunderstood requirements
   - Technical limitations

3. **Enhancement Opportunities**
   - Agent added helpful features
   - Better patterns discovered
   - UX improvements

## Integration with Other Agents

### From Wireframe Agent
- Receives generated code
- Gets build/test results
- Obtains file listings

### To Self-Improvement Agent
- Provides detailed QC reports
- Identifies systematic issues
- Suggests improvement areas

## Metrics Tracked

1. **Compliance Metrics**
   - Feature implementation rate
   - Specification match percentage
   - Deviation counts

2. **Efficiency Metrics**
   - Files reviewed vs total
   - Scope reduction percentage
   - Analysis time

3. **Quality Metrics**
   - Root cause distribution
   - Enhancement vs error ratio
   - Severity levels

## Best Practices

1. **Objective Analysis**
   - Stick to facts from code
   - Avoid subjective quality judgments
   - Focus on spec compliance

2. **Actionable Feedback**
   - Provide specific file locations
   - Suggest concrete fixes
   - Prioritize by severity

3. **Positive Recognition**
   - Acknowledge good implementations
   - Highlight beneficial additions
   - Balance criticism with praise