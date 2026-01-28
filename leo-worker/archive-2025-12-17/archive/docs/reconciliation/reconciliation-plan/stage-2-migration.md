# Stage 2 Migration Plan: V2 to Critic-Writer-Judge

## Overview

This document outlines how to evolve V2's Frontend Developer Agent to implement the Critic-Writer-Judge pattern while preserving its strengths.

## Current V2 Structure

```
Frontend Developer Agent v2
├── Development Phase (Writer-like)
├── Build Validation Phase (Post-validation)
└── Browser Testing Phase (Runtime validation)
```

## Target Structure

```
Frontend Developer Agent v3
├── Critic Phase (NEW)
│   ├── Evaluate specifications
│   ├── Identify potential issues  
│   └── Generate evaluation report
├── Writer Phase (Enhanced Development Phase)
│   ├── Implement based on critique
│   ├── Address identified issues
│   └── Generate implementation
├── Judge Phase (NEW)
│   ├── Evaluate both report and code
│   ├── Decide continue/complete
│   └── Track iteration count
└── Validation Phases (Keep existing)
    ├── Build Validation
    └── Browser Testing
```

## Implementation Steps

### Step 1: Add Critic Agent

```python
class CriticAgent:
    def __init__(self, workspace, spec):
        self.workspace = workspace
        self.spec = spec
        self.evaluation_criteria = [
            "specification_clarity",
            "technical_feasibility",
            "missing_dependencies",
            "potential_issues",
            "implementation_complexity"
        ]
    
    def evaluate(self, chunk, foundation_context):
        """Evaluate a specification chunk before implementation"""
        report = {
            "chunk": chunk.name,
            "issues": [],
            "recommendations": [],
            "complexity_score": 0,
            "feasibility_score": 0
        }
        
        # Analyze specification
        report["issues"] = self.identify_issues(chunk, foundation_context)
        report["recommendations"] = self.suggest_improvements(chunk)
        
        return report
```

### Step 2: Enhance Writer with Critic Awareness

```python
class WriterAgent(FrontendDeveloperAgent):
    def __init__(self, workspace, critic_report):
        super().__init__(workspace)
        self.critic_report = critic_report
    
    def implement_chunk(self, chunk, foundation_context):
        """Implement chunk considering critic's feedback"""
        # Address critic's concerns
        for issue in self.critic_report["issues"]:
            self.address_issue(issue)
        
        # Follow critic's recommendations
        for rec in self.critic_report["recommendations"]:
            self.apply_recommendation(rec)
        
        # Original implementation logic
        return super().implement_chunk(chunk, foundation_context)
```

### Step 3: Add Judge Agent

```python
class JudgeAgent:
    def __init__(self, max_iterations=3):
        self.max_iterations = max_iterations
        self.quality_threshold = 0.85
    
    def evaluate(self, critic_report, implementation, iteration):
        """Decide whether to continue or complete"""
        decision = {
            "action": "continue",  # or "complete"
            "reasoning": "",
            "quality_score": 0,
            "issues_remaining": []
        }
        
        # Evaluate quality
        quality_score = self.calculate_quality(critic_report, implementation)
        
        # Make decision
        if quality_score >= self.quality_threshold:
            decision["action"] = "complete"
        elif iteration >= self.max_iterations:
            decision["action"] = "complete"
            decision["reasoning"] = "Max iterations reached"
        else:
            decision["action"] = "continue"
            decision["issues_remaining"] = self.identify_remaining_issues()
        
        return decision
```

### Step 4: Orchestrate the Loop

```python
class StageOrchestrator:
    def __init__(self):
        self.critic = CriticAgent()
        self.writer = WriterAgent()
        self.judge = JudgeAgent()
    
    async def process_chunk(self, chunk, foundation_context):
        iteration = 0
        
        while iteration < self.judge.max_iterations:
            # Critic evaluates
            critic_report = await self.critic.evaluate(chunk, foundation_context)
            
            # Writer implements
            implementation = await self.writer.implement_chunk(
                chunk, 
                foundation_context,
                critic_report
            )
            
            # Judge decides
            decision = await self.judge.evaluate(
                critic_report,
                implementation, 
                iteration
            )
            
            if decision["action"] == "complete":
                break
            
            iteration += 1
        
        # Run existing validation phases
        await self.run_build_validation(implementation)
        await self.run_browser_testing(implementation)
        
        return implementation
```

## Integration Plan

### Phase 1: Parallel Implementation (Week 1)
- Implement Critic, Writer, Judge as separate modules
- Keep existing V2 agent functional
- Test new components in isolation

### Phase 2: Integration Testing (Week 2)
- Wire up orchestrator
- Test on simple chunks first
- Compare output quality with V2

### Phase 3: Migration (Week 3)
- Replace V2 agent with V3 in main pipeline
- Run side-by-side comparison
- Tune quality thresholds

### Phase 4: Optimization (Week 4)
- Optimize context usage
- Tune iteration limits
- Add metrics collection

## Configuration Changes

### New Configuration Parameters
```yaml
critic:
  enabled: true
  evaluation_criteria:
    - specification_clarity
    - technical_feasibility
    - missing_dependencies
  
judge:
  enabled: true
  max_iterations: 3
  quality_threshold: 0.85
  
iteration:
  track_history: true
  save_intermediate: false
```

## Backward Compatibility

### Compatibility Mode
```python
if config.get("v2_compatibility_mode"):
    # Run original V2 logic
    return run_v2_agent()
else:
    # Run new V3 logic
    return run_v3_agent()
```

### Migration Path for Existing Projects
1. Projects started with V2 can continue using V2
2. New projects use V3 by default
3. V2 projects can opt-in to V3 with flag

## Success Metrics

### Quality Metrics
- Specification compliance: Target 95%+ (up from 85%)
- Missing features: Target <5 (down from 12)
- Code quality score: Target 90%+

### Performance Metrics
- Average iterations per chunk: 1.5-2
- Total execution time: <2x V2 time
- Context usage: <1.5x V2 usage

### Business Metrics
- User satisfaction: Reduce "missing feature" reports by 75%
- Development time: Reduce manual fixes by 60%
- Success rate: Increase first-time success to 90%

## Risk Mitigation

### Risk 1: Infinite Loops
- Mitigation: Hard iteration limit
- Fallback: Return best attempt

### Risk 2: Context Explosion
- Mitigation: Selective context loading
- Fallback: Chunk splitting

### Risk 3: Quality Regression
- Mitigation: Extensive testing
- Fallback: V2 compatibility mode

## Conclusion

This migration plan preserves V2's strengths (MCP integration, multi-phase validation, chunk processing) while adding the iterative improvement capabilities of the Critic-Writer-Judge pattern. The phased approach ensures smooth transition with minimal disruption.