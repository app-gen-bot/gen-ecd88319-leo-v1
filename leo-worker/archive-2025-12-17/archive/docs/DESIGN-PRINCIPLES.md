# AI App Factory Design Principles

This document captures core design principles and architectural decisions for the AI App Factory project. 
**IMPORTANT**: These principles override any default AI behavior and must be followed consistently.

## 1. Tool Usage - Determinism Over Flexibility

### Principle
Use specialized MCP tools for all operations. Never use general-purpose shell commands.

### DO ✅
```python
# In agent configs:
"allowed_tools": [
    "shadcn",           # For UI components
    "package_manager",  # For npm packages
    "build_test",       # For build verification
    "browser",          # For runtime testing
    "dev_server",       # For development server
]

# In prompts:
"Use `shadcn(action='add_component', component='button')`"
"Use `package_manager(action='add', packages='lodash')`"
```

### DON'T ❌
```python
# Never use:
"allowed_tools": ["Bash"]  # Too flexible, non-deterministic

# Never suggest:
"Run `npm install lodash`"
"Execute `npx shadcn-ui add button`"
```

### Why
- **Determinism**: Same inputs always produce same outputs
- **Safety**: No arbitrary command execution
- **Consistency**: AI uses the same patterns every time
- **Constraints**: Limited options reduce hallucination

## 2. Opinionated Architecture

### Principle
Make choices for the user. Don't ask for preferences or offer options.

### DO ✅
- Next.js 14 with App Router (always)
- ShadCN UI for components (exclusively)
- Dark mode by default
- TypeScript (no JavaScript option)
- Tailwind CSS (no other CSS frameworks)

### DON'T ❌
- "Would you prefer Material UI or ShadCN?"
- "Should we use Pages or App Router?"
- "What color scheme would you like?"

### Why
- **Faster Development**: No decision paralysis
- **Consistency**: All apps follow same patterns
- **Quality**: Curated best practices
- **Simplicity**: Reduced cognitive load

## 3. Stage Separation

### Principle
Each stage has clear boundaries. No stage reaches into another's domain.

### Stage Responsibilities
1. **Stage 0 (PRD)**: User requirements → Structured PRD
2. **Stage 1 (Interaction)**: PRD → Detailed interaction flows
3. **Stage 2 (Wireframe)**: Interactions → Working Next.js app
4. **Stage 3 (Technical)**: Wireframe → API specs & architecture
5. **Stage 4 (Backend)**: Tech specs → FastAPI implementation
6. **Stage 5 (Deploy)**: Full app → AWS deployment

### DO ✅
```python
# Stage 2 reads from Stage 1:
interaction_spec = read_file("specs/interaction-spec.md")
# Stage 2 writes to frontend/:
write_file("frontend/app/page.tsx", content)
```

### DON'T ❌
```python
# Stage 2 should never:
write_file("backend/main.py", content)  # That's Stage 4's job
modify_file("specs/prd.md", content)    # Don't modify earlier stages
```

## 4. Critic-Writer-Judge Pattern (Stage 2+)

### Principle
Iterative improvement through structured evaluation.

### Flow
```
Specifications → Critic → Evaluation Report
                   ↓
Report + Specs → Writer → Implementation
                   ↓
Report + Code → Judge → Continue/Complete
```

### Key Points
- **Critic**: Evaluates specs/code, identifies issues
- **Writer**: Implements/fixes based on evaluation
- **Judge**: Decides if quality is sufficient
- **Iteration**: Max 3 rounds typically

## 5. Strategic Validation

### Principle
Validate at milestones, not constantly.

### DO ✅
```python
# After major implementation:
"Completed user authentication. Running build_test..."

# When addressing specific issues:
"Critic identified TypeScript errors. Running build_test after fixes..."

# Before completion:
"Implementation complete. Starting browser testing..."
```

### DON'T ❌
```python
# Not after every file:
"Created header.tsx. Running build test..."  # Too frequent

# Not during styling:
"Changed button color. Validating..."  # Unnecessary
```

## 6. Error Handling Philosophy

### Principle
Fix errors immediately when found, but don't go looking for them constantly.

### Approach
1. **Build Phase**: Fix compilation errors immediately
2. **Runtime Phase**: Fix critical path errors only
3. **Optimization**: Leave for production phase (not wireframe)

## 7. Mock Data Strategy

### Principle
Always use comprehensive mock data in wireframes.

### Requirements
- Show all states: empty, loading, populated, error
- Use realistic data (not "Lorem ipsum")
- Include edge cases (long names, missing data)
- Demonstrate all features work

## 8. File Organization

### Principle
Consistent structure across all projects.

### Standard Structure
```
apps/{app-name}/
├── specs/                 # All specifications
│   ├── prd.md
│   ├── interaction-spec.md
│   └── wireframe.md
├── frontend/             # Next.js application
│   ├── app/             # App Router pages
│   ├── components/      # React components
│   └── lib/            # Utilities
└── backend/             # FastAPI application (Stage 4)
```

## Quick Reference Checklist

When implementing any agent:

- [ ] Using MCP tools, not Bash?
- [ ] Following opinionated choices (Next.js 14, ShadCN)?
- [ ] Respecting stage boundaries?
- [ ] Implementing Critic-Writer-Judge if Stage 2+?
- [ ] Validating strategically, not constantly?
- [ ] Fixing errors immediately when found?
- [ ] Using comprehensive mock data?
- [ ] Following standard file structure?

## Common Mistakes to Avoid

1. **Using Bash instead of MCP tools**
   - Wrong: `bash("npm install react-query")`
   - Right: `package_manager(action="add", packages="react-query")`

2. **Offering choices instead of being opinionated**
   - Wrong: "Would you like to use Redux or Context?"
   - Right: Always use React Context for state management

3. **Over-validating during development**
   - Wrong: Build test after every component
   - Right: Build test after major features

4. **Incomplete mock data**
   - Wrong: Hardcode one user
   - Right: Array of users showing various states

5. **Cross-stage contamination**
   - Wrong: Stage 2 creating backend files
   - Right: Stage 2 only creates frontend files

## Updating These Principles

These principles evolve through:
1. Team discussion and consensus
2. Documented in ADRs (Architectural Decision Records)
3. Updated in this file
4. Communicated in PR reviews

Remember: Consistency > Perfection. Following these principles ensures predictable, high-quality output across all generated applications.