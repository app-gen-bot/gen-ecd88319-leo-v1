# DESIGN SYSTEM FILE ANALYSIS 2025-01-15

## Design System File Analysis

### What Preview Generator Actually Needs

**From tailwind.config.js**:
- Color tokens (chapel.rose, booking.available, etc.)
- Font families
- Animation definitions
- BUT: These are already in CSS classes, not directly used

**From globals.css**:
- CSS variables (--chapel-rose, --booking-available)
- Utility classes (.chapel-romantic-gradient, .chapel-display)
- These ARE directly used as className values

**From design-tokens.ts**:
- Component patterns (THE MAGIC!)
- Rich semantic classes
- Domain-specific combinations
- THIS is what was missing

## Optimization Question Raised

**Do we need all three files?**
Currently the agent reads:
1. tailwind.config.js (100+ lines)
2. globals.css (170+ lines)
3. design-tokens.ts (140+ lines)

Total: 400+ lines of design system to parse

**Potential optimization**: Create an index/summary at the top of design-tokens.ts:
```typescript
/**
 * AVAILABLE DESIGN PATTERNS:
 * - chapel.chapelCard: default, featured, premium
 * - chapel.bookingStatus: available, pending, confirmed
 * - chapel.buttons: romantic, elegant, celebration
 * - chapel.calendar: dayAvailable, daySelected
 * ... etc
 */
```

This would help the agent quickly see what's available without parsing everything.