# Pattern 9: Wouter Link Component Usage

**Source:** EdVisor Issues #6 & #7
**Impact:** Prevents nested anchor tags and React key warnings

---

## Problem 1: Nested Anchor Tags

Wouter's Link component renders AS an anchor tag - NEVER wrap with `<a>`:

```tsx
// ❌ WRONG: Nested anchor tags (invalid HTML, console warnings)
import { Link } from 'wouter';

<Link href="/login"><a>Login</a></Link>
// Renders: <a href="/login"><a>Login</a></a> ← Invalid HTML!

<Link href="/dashboard">
  <a className="nav-link">Dashboard</a>
</Link>
// Renders nested anchors, triggers React hydration warnings
```

### Solution: Link IS the anchor

```tsx
// ✅ CORRECT: Link renders as anchor internally
import { Link } from 'wouter';

<Link href="/login">Login</Link>
// Renders: <a href="/login">Login</a> ← Valid HTML

<Link href="/dashboard" className="nav-link">
  Dashboard
</Link>
// Renders: <a href="/dashboard" class="nav-link">Dashboard</a>
```

---

## Problem 2: React Key Warnings

Non-unique keys cause React warnings:

```tsx
// ❌ WRONG: Non-unique keys
{breadcrumbs.map(crumb => (
  <Link key={crumb.href} href={crumb.href}>  {/* Multiple items can have same href! */}
    {crumb.label}
  </Link>
))}
```

### Solution: Use unique keys

```tsx
// ✅ CORRECT: Use index or unique ID
{breadcrumbs.map((crumb, index) => (
  <Link key={index} href={crumb.href}>
    {crumb.label}
  </Link>
))}

// ✅ BETTER: Use unique ID if available
{navItems.map(item => (
  <Link key={item.id} href={item.href}>  {/* item.id is unique */}
    {item.label}
  </Link>
))}
```

---

## Validation Check

```bash
# Check for nested anchors in Link components
grep -r "<Link.*><a" client/src && echo "❌ ERROR: Nested anchors found" || echo "✅ No nested anchors"

# Check for duplicate keys using href
grep -r "key={.*\.href}" client/src && echo "⚠️  WARNING: Potential duplicate keys using href"
```

---

## Why This Matters

- Nested anchors violate HTML spec, cause browser inconsistencies
- React hydration warnings flood console
- Non-unique keys cause React to lose component state incorrectly

---

**EdVisor Evidence**: Issues #6 & #7 - Nested anchors and key warnings
