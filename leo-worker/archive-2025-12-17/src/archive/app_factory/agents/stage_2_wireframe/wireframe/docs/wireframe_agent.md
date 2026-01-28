# Wireframe Implementation Agent

## Purpose

The Wireframe Agent is responsible for transforming frontend interaction specifications into a complete, working NextJS/React application. It generates production-quality code that serves as an interactive wireframe with full functionality.

## Responsibilities

1. **Code Generation**
   - Parse interaction specifications
   - Generate all required React components
   - Create page routes and navigation
   - Implement forms with validation
   - Add state management where needed

2. **Quality Verification**
   - Run build process to ensure compilation
   - Execute tests to verify functionality
   - Use browser tool to check for runtime errors
   - Ensure all specified features are implemented

3. **Integration**
   - Build upon the existing NextJS template
   - Respect existing dependencies and configuration
   - Follow established coding patterns
   - Maintain consistent styling with Shadcn UI

## Input Requirements

1. **Interaction Specification** (`frontend-interaction-spec.md`)
   - Screen descriptions and layouts
   - User flows and navigation
   - Form fields and validation rules
   - Component interactions and behaviors

2. **Technical Specification** (`technical-implementation-spec.md`)
   - Coding standards and patterns
   - Component structure guidelines
   - State management approach
   - Error handling requirements

## Output

A complete frontend application in `apps/{app_name}/frontend/` containing:
- All specified pages and routes
- Interactive components and forms
- Proper TypeScript types
- Consistent styling
- Working navigation
- Form validation
- Error handling

## Process Flow

```
1. Load Specifications
   ├── Read interaction spec
   └── Read technical spec

2. Plan Implementation
   ├── Map screens to routes
   ├── Identify shared components
   └── Plan state management

3. Generate Code
   ├── Create page components
   ├── Build shared components
   ├── Implement navigation
   ├── Add forms and validation
   └── Apply consistent styling

4. Verify Implementation
   ├── Run build process
   ├── Execute type checking
   ├── Test in browser
   └── Check for console errors

5. Report Results
   ├── List generated files
   ├── Report any issues
   └── Calculate costs
```

## Key Features

### 1. Smart Code Generation
- Understands React best practices
- Uses TypeScript for type safety
- Implements proper component composition
- Follows NextJS App Router patterns

### 2. Complete Implementation
- Not just mockups - fully functional code
- All interactions work as specified
- Forms validate and submit
- Navigation is fully connected

### 3. Quality Assurance
- Build verification ensures no compile errors
- Browser testing catches runtime issues
- Type checking prevents type errors

### 4. Specification Fidelity
- The interaction specification is the contract
- Every interaction, flow, and state must be implemented exactly as specified
- Creativity applies to visual design, not functionality
- This approach ensures 100% feature coverage

### 5. Visual Excellence
- Consistent spacing and typography
- Smooth animations and transitions
- Dark mode by default (#1a1d21 background)
- ShadCN UI components for polished appearance
- Beautiful empty states and loading states

## Configuration

The agent uses configuration from `config.py`:
- Model selection (Claude 3.5 Sonnet)
- Token limits for generation
- Temperature settings for creativity
- System prompts for guidance

## Integration Points

1. **With Frontend Template**
   - Extends existing NextJS setup
   - Uses pre-installed dependencies
   - Follows established patterns

2. **With MCP Build Tools**
   - Uses `build_test("verify")` for comprehensive checks
   - Automatically handles type-check, build, and lint
   - Uses browser tool for runtime error detection

3. **With Other Agents**
   - Provides generated code for QC review
   - Receives feedback for improvements
   - Adapts based on self-improvement suggestions

## Error Handling

1. **Missing Specifications**
   - Clear error if interaction spec not found
   - Graceful handling of missing technical spec

2. **Build Failures**
   - Capture and report compilation errors
   - Suggest fixes for common issues

3. **Runtime Errors**
   - Browser tool catches console errors
   - Reports issues for manual review

## Best Practices

1. **Incremental Generation**
   - Start with core pages
   - Add complex features progressively
   - Verify each major addition

2. **Consistent Patterns**
   - Use same component structure throughout
   - Maintain consistent naming conventions
   - Follow established state patterns

3. **Performance Considerations**
   - Implement code splitting where appropriate
   - Use React.memo for expensive components
   - Optimize re-renders with proper dependencies

## Quality Checklist

Before considering the wireframe complete:

- [ ] All interactions from spec implemented
- [ ] Visual design polished and consistent
- [ ] Dark mode working perfectly
- [ ] All ShadCN components used properly
- [ ] Mock data demonstrates all states
- [ ] Responsive on all screen sizes
- [ ] Navigation smooth and intuitive
- [ ] Loading states for async operations
- [ ] Error states handled gracefully
- [ ] Empty states helpful and actionable
- [ ] Forms validate as specified
- [ ] Modals and dropdowns behave correctly
- [ ] Keyboard navigation functional
- [ ] Performance optimizations applied
- [ ] Code well-organized and clean

## Future Enhancements

1. **Test Generation**
   - Generate unit tests for components
   - Create integration tests for flows
   - Add accessibility tests

2. **Performance Optimization**
   - Implement lazy loading
   - Add loading states
   - Optimize bundle size

3. **Enhanced Error Handling**
   - Add error boundaries
   - Implement fallback UI
   - Add retry mechanisms