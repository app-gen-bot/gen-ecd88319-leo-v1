# Pattern 2: Interactive Component State Management

**Source:** EdVisor Issues #12 & #17
**Impact:** Prevents components from rendering permanently visible (dropdowns, dialogs, popovers)

---

## The Problem

Components without state render permanently visible:

```tsx
// ❌ WRONG: No state (dropdown always visible!)
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';

export function ActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>  {/* Renders permanently! */}
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Result**: Dropdown menu is always visible on screen, overlapping other content.

---

## The Solution

**ALL interactive components MUST include useState + conditional rendering:**

```tsx
// ✅ CORRECT: State + conditional rendering
import { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';

export function ActionsMenu({ onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger onClick={() => setOpen(!open)}>
        Actions
      </DropdownMenuTrigger>
      {open && (  // ← Conditional rendering required!
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => { onEdit(); setOpen(false); }}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { onDelete(); setOpen(false); }}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
```

---

## Component Types That REQUIRE State

### 1. Dropdowns
```tsx
const [open, setOpen] = useState(false);
<DropdownMenu open={open} onOpenChange={setOpen}>
  <DropdownMenuTrigger onClick={() => setOpen(!open)}>...</DropdownMenuTrigger>
  {open && <DropdownMenuContent>...</DropdownMenuContent>}
</DropdownMenu>
```

### 2. Modals/Dialogs
```tsx
const [isOpen, setIsOpen] = useState(false);
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger onClick={() => setIsOpen(true)}>Open</DialogTrigger>
  {isOpen && (
    <DialogContent>
      <DialogHeader>...</DialogHeader>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </DialogContent>
  )}
</Dialog>
```

### 3. Popovers
```tsx
const [open, setOpen] = useState(false);
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger onClick={() => setOpen(!open)}>...</PopoverTrigger>
  {open && <PopoverContent>...</PopoverContent>}
</Popover>
```

### 4. Accordions
```tsx
const [expanded, setExpanded] = useState<string | null>(null);
<Accordion type="single" value={expanded} onValueChange={setExpanded}>
  <AccordionItem value="item-1">...</AccordionItem>
</Accordion>
```

### 5. Tabs
```tsx
const [activeTab, setActiveTab] = useState('tab1');
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">...</TabsContent>
</Tabs>
```

---

## Validation Check

```bash
# Find interactive components without useState
grep -l "DropdownMenu\|Dialog\|Popover\|Accordion" client/src/pages/*.tsx | \
while read file; do
  if ! grep -q "useState" "$file"; then
    echo "❌ MISSING STATE: $file"
  fi
done

# Expected: ZERO output
```

---

## Why This Matters

Without state:
- Dropdowns remain visible permanently
- Dialogs can't be closed
- Popovers don't toggle
- User experience is broken

---

**EdVisor Evidence**: Issue #12 - DropdownMenu without state rendered permanently visible
