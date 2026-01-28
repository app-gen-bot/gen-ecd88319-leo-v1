# Step Details Template

Use this template to document each step in the agentic workflow. Copy and fill out for each step.

---

## Step: [Step Name]

### Overview
**Purpose**: [What problem does this step solve?]  
**Phase**: [Which phase does this belong to? Initial Creation / Spec Fidelity / Code Quality / Retrospective]  
**Step Type**: [Writer / Critic / Judge]

### Agent Details
**Agent/Role**: [Specific agent name and primary responsibility]  
**Capabilities Required**: [List key capabilities the agent needs]

### Inputs
**Primary Inputs**:
- **[Input Name]**: [Description]
  - Format: [JSON/Markdown/Code/etc.]
  - Source: [Where does this come from?]
  - Required: [Yes/No]

**Context Inputs**:
- **[Context Item]**: [Description]
  - Usage: [How is this used?]

**Example Input Structure**:
```json
{
  "example": "structure here"
}
```

### Outputs
**Primary Outputs**:
- **[Output Name]**: [Description]
  - Format: [JSON/Markdown/Code/etc.]
  - Destination: [Where does this go?]
  - Schema/Structure: [Define structure]

**Example Output Structure**:
```json
{
  "example": "structure here"
}
```

### Tools

#### Original Tools
| Tool Name | Description | Usage Pattern |
|-----------|-------------|---------------|
| [Tool 1] | [What it does] | [When/how to use] |
| [Tool 2] | [What it does] | [When/how to use] |

#### New Tools
| Tool Name | Description | Usage Pattern | Difference from Original |
|-----------|-------------|---------------|-------------------------|
| [Tool 1] | [What it does] | [When/how to use] | [What changed] |
| [Tool 2] | [What it does] | [When/how to use] | [What changed] |

### Prompts

#### Original Prompt
- **Location**: `[path/to/original/prompt.md]`
- **Key Elements**: [List main prompt components]
- **Approach**: [Describe the prompting strategy]

#### New Prompt
- **Location**: `[path/to/new/prompt.md]`
- **Key Changes**: [What was modified and why]
- **Improvements**: [Expected benefits]

### Success Criteria
**Objective Criteria**:
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Measurable criterion 3]

**Quality Thresholds**:
- **Minimum**: [Minimum acceptable quality]
- **Target**: [Desired quality level]
- **Exceptional**: [Best case outcome]

### Common Patterns

#### Successful Patterns
- **[Pattern Name]**: [Description of what works well]
- **[Pattern Name]**: [Description of what works well]

#### Failure Modes
| Failure Mode | Symptoms | Mitigation |
|--------------|----------|------------|
| [Mode 1] | [How to recognize] | [How to handle] |
| [Mode 2] | [How to recognize] | [How to handle] |

### Iteration Guidelines

**When to Continue Iterating**:
- [Condition 1]
- [Condition 2]

**When to Stop**:
- [Termination condition 1]
- [Termination condition 2]
- Maximum iterations: [Number]

### Integration Notes

**Dependencies**:
- Requires completion of: [Previous steps]
- Blocks: [Subsequent steps]

**State Management**:
- State preserved: [What carries forward]
- State reset: [What doesn't carry forward]

### Performance Considerations

**Time Estimates**:
- Typical duration: [Time]
- Timeout: [Maximum time]

**Resource Usage**:
- Compute intensity: [Low/Medium/High]
- Memory requirements: [Estimate]
- API calls: [Estimate]

### Monitoring and Debugging

**Key Metrics**:
- [Metric 1]: [What it measures]
- [Metric 2]: [What it measures]

**Debug Checklist**:
- [ ] Check input format matches expected schema
- [ ] Verify all required tools are available
- [ ] Confirm agent has necessary permissions
- [ ] Review recent changes to prompts
- [ ] Check for timeout issues

### Example Execution

**Sample Run**:
```
Input: [Show example input]
Process: [Describe what happens]
Output: [Show example output]
```

### Notes and Observations
[Any additional context, learnings, or observations about this step]

---

## Template Usage Guidelines

1. **Be Specific**: Avoid vague descriptions. Each field should provide actionable information.

2. **Include Examples**: Wherever possible, show concrete examples of inputs, outputs, and execution.

3. **Focus on Interfaces**: Clearly define what comes in and what goes out.

4. **Document Failures**: Understanding failure modes is as important as success paths.

5. **Keep Updated**: As the workflow evolves, update these specifications.

6. **Link to Code**: Reference actual implementation files where applicable.