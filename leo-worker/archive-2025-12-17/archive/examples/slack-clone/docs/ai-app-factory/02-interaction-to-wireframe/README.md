# Step 2: Frontend Interaction Spec to Wireframe

## Overview

This step transforms the comprehensive interaction specification into a beautiful, functional wireframe using Next.js and ShadCN UI. The generator can focus purely on visual design and implementation, knowing all behaviors are already defined.

## Why This Step Works

By separating interaction design from visual design:
- **Generator focuses on**: Making it beautiful and usable
- **Not worried about**: Missing features or incomplete flows
- **Result**: High-quality UI with 100% feature coverage

## Input

**Frontend Interaction Specification** containing:
- Complete interaction definitions
- All user flows mapped
- Navigation structure
- States and error handling
- Validation rules

## Output

**Next.js Application** featuring:
- Beautiful dark mode UI (#1a1d21)
- All interactions implemented
- ShadCN components
- Mock data for demonstration
- Responsive design
- Working navigation

## Success Criteria

✓ Every interaction from spec is implemented  
✓ Visual design is polished and consistent  
✓ All ShadCN components used appropriately  
✓ Navigation works as specified  
✓ Mock data demonstrates all states  
✓ Responsive on mobile/tablet/desktop  

## Process

1. **Generator Agent** creates the Next.js application
2. **Validator Agent** checks interaction coverage
3. If gaps found, generator fills them
4. Process repeats until validation passes

## Technology Stack

### Required
- Next.js 14 (App Router)
- React 18
- TypeScript
- ShadCN UI
- Tailwind CSS
- Lucide Icons

### Conventions
- Dark mode by default
- File-based routing
- Server components where possible
- Client components for interactivity
- Proper component composition

## Example Transformation

**Interaction Spec**:
```yaml
MessageInput:
  Type: Rich text input
  Location: Bottom of main area
  Features:
    - Textarea: Grows with content
    - Formatting toolbar: Bold, Italic, Code
    - Emoji picker: Smiley icon
  Actions:
    - Enter: Send message
    - Shift+Enter: New line
```

**Wireframe Output**:
```tsx
// components/message-input.tsx
export function MessageInput() {
  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          placeholder="Message #general"
          className="min-h-[40px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
        />
        <Button variant="ghost" size="icon">
          <Smile className="h-4 w-4" />
        </Button>
        <Button>Send</Button>
      </div>
    </div>
  )
}
```

## Key Implementation Patterns

### 1. Component Structure
```
app/
├── layout.tsx          # Root layout with theme
├── page.tsx           # Home/redirect
├── (auth)/
│   └── login/
│       └── page.tsx   # Login page
└── (app)/
    ├── layout.tsx     # App layout with sidebar
    ├── channel/[id]/
    │   └── page.tsx   # Channel view
    └── settings/
        └── page.tsx   # Settings

components/
├── ui/               # ShadCN components
├── layout/           # Layout components
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── navigation.tsx
└── features/         # Feature components
    ├── message-list.tsx
    ├── message-input.tsx
    └── user-profile.tsx
```

### 2. State Management
- Use React hooks for local state
- Context for global UI state
- Mock data in separate files
- Optimistic UI updates

### 3. Mock Data Strategy
```typescript
// lib/mock-data.ts
export const mockUsers = [
  { id: '1', name: 'John Doe', avatar: '...', status: 'online' },
  // ... comprehensive mock data
]

// Demonstrates all states:
// - Empty states
// - Loading states  
// - Error states
// - Populated states
// - Edge cases (long names, many items)
```

### 4. Visual Design System
```typescript
// Dark mode colors (Slack-like)
const colors = {
  background: '#1a1d21',
  sidebar: '#0e1013',
  border: '#27292d',
  text: '#d1d2d3',
  accent: '#1264a3',
  online: '#2ea664',
  hover: 'rgba(255,255,255,0.1)'
}
```

## Common Implementation Requirements

### Navigation
- Sidebar always visible on desktop
- Collapsible on mobile
- Active state indicators
- Smooth transitions

### Forms
- Proper validation states
- Loading spinners on submit
- Success toast messages
- Error handling

### Lists
- Empty state messages
- Loading skeletons
- Hover states
- Selection feedback

### Modals
- ESC to close
- Click outside to close
- Focus management
- Smooth animations

## Validation Focus

The validator for this step ensures:
1. **Interaction Coverage**: Every spec interaction works
2. **Visual Quality**: Consistent, polished design
3. **Component Usage**: Proper ShadCN implementation
4. **Responsive Design**: Works on all devices
5. **State Demonstration**: Mock data shows all states

## Next Step

Once validated, the wireframe becomes the source of truth for extracting technical specifications (Step 3), ensuring all downstream documentation matches the actual implementation.