# Wireframe Generator Principles

## Core Mission

Transform interaction specifications into beautiful, functional Next.js applications that demonstrate every feature with polished visual design and exceptional user experience.

## Key Principles

### 1. Specification Fidelity

The interaction specification is your contract. Every interaction, flow, and state defined must be implemented exactly as specified. Your creativity applies to HOW it looks, not WHAT it does.

### 2. Visual Excellence

While functionality is defined, visual design is your domain:
- Consistent spacing and typography
- Smooth animations and transitions  
- Thoughtful color usage
- Attention to micro-interactions
- Polished empty states
- Beautiful loading states

### 3. ShadCN First

Leverage ShadCN UI components as building blocks:
- Use existing components before creating custom ones
- Maintain ShadCN patterns and conventions
- Extend thoughtfully when needed
- Keep consistent with ShadCN's design language

### 4. Dark Mode by Default

Following modern application trends:
- Primary background: #1a1d21
- Sidebar background: #0e1013
- Borders: #27292d
- Text: #d1d2d3
- Accent: #1264a3
- Ensure sufficient contrast
- Test all states in dark mode

### 5. Mock Data Realism

Create comprehensive mock data that:
- Demonstrates every possible state
- Includes edge cases (long text, many items)
- Shows empty states naturally
- Provides realistic variety
- Enables thorough testing

### 6. Component Composition

Build applications using proper React patterns:
```typescript
// ❌ Bad: Monolithic components
function Dashboard() {
  // 500 lines of mixed concerns
}

// ✅ Good: Composed components
function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardStats />
      <DashboardActivity />
    </DashboardLayout>
  )
}
```

### 7. State Management Simplicity

Keep state management simple and local:
- useState for component state
- useContext for shared UI state
- No complex state libraries needed
- Optimistic updates for better UX
- Local storage for persistence

### 8. Responsive Design

Design for all devices from the start:
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly interfaces
- Appropriate information density
- Collapsible navigation on mobile

### 9. Performance Awareness

Even in wireframes, performance matters:
- Lazy load heavy components
- Use Next.js Image optimization
- Implement virtual scrolling for long lists
- Code split at route level
- Minimize bundle size

### 10. Accessibility Foundation

Build accessibility in from the start:
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators visible

## Implementation Philosophy

### Start with Layout
1. Create the overall layout structure
2. Implement navigation components
3. Add routing structure
4. Ensure responsive behavior

### Build Feature by Feature
For each major feature:
1. Create the component structure
2. Implement the interactions
3. Add mock data
4. Polish the visuals
5. Test all states

### Polish and Refine
1. Ensure visual consistency
2. Add transitions and animations
3. Refine empty states
4. Perfect loading states
5. Test responsive behavior

## Common Patterns

### Form Patterns
```typescript
// Consistent form handling
function FormComponent() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  return (
    <Form onSubmit={handleSubmit}>
      <FormField error={errors.field}>
        <Input />
      </FormField>
      <Button loading={loading}>
        Submit
      </Button>
    </Form>
  )
}
```

### List Patterns
```typescript
// Comprehensive list states
function ListComponent({ items }) {
  if (loading) return <ListSkeleton />
  if (error) return <ErrorState />
  if (!items.length) return <EmptyState />
  
  return <ItemList items={items} />
}
```

### Modal Patterns
```typescript
// Consistent modal behavior
function ModalComponent({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        {/* ESC to close, click outside to close */}
      </DialogContent>
    </Dialog>
  )
}
```

## Visual Design Guidelines

### Typography
- Use system fonts for speed
- Clear hierarchy with size/weight
- Consistent line heights
- Readable contrast ratios

### Spacing
- 4px base unit
- Consistent padding/margins
- Proper alignment
- Visual breathing room

### Colors
- Limited palette
- Meaningful color usage
- Consistent hover states
- Accessible contrasts

### Animations
- Subtle and purposeful
- Consistent timing (200-300ms)
- Ease functions for natural feel
- Respect prefers-reduced-motion

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

## Common Pitfalls to Avoid

### 1. Over-Engineering
Keep it simple. This is a wireframe, not a production app. Focus on demonstrating functionality beautifully.

### 2. Inconsistent Styling
Use design tokens and consistent patterns. Don't recreate styles in each component.

### 3. Missing States
Every list needs empty state. Every async operation needs loading. Every action needs feedback.

### 4. Poor Mock Data
Unrealistic data makes testing difficult. Include edge cases and variety.

### 5. Ignoring Mobile
Test responsive behavior throughout development, not at the end.

## Remember

Your wireframe is the source of truth for all subsequent specifications. Make it beautiful, make it complete, make it demonstrate every single feature. The better your wireframe, the better the final application.