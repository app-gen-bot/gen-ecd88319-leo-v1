# Pattern 11: ShadCN Component Export Checklist

**Source**: asana-clone production failures
**Problem**: Component created but not exported from barrel causes import errors

---

## The Problem

Installing or creating a ShadCN component without updating barrel exports breaks imports:

```typescript
// Component installed: client/src/components/ui/switch.tsx

// ❌ WRONG: Not exported from barrel
// client/src/components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
// Missing: export { Switch } from './switch';

// Error in page when trying to import:
// import { Switch } from '@/components/ui';
// Module not found: Can't resolve '@/components/ui/switch'
```

**Impact**: Import failures block page development, wasted time debugging

---

## The Solution

3-step verification after creating or installing any UI component:

### Step 1: Export from Barrel (if using barrel pattern)

```typescript
// client/src/components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Select } from './select';
export { Switch } from './switch';      // ← Add new component here
export { Checkbox } from './checkbox';  // ← And here
// ... all other components
```

### Step 2: Verify Import Works

```typescript
// Test in a page
import { Switch } from '@/components/ui/switch';  // ← Direct import
// OR from barrel if configured
import { Switch } from '@/components/ui';  // ← Barrel import
```

### Step 3: Test in Actual Page

- Component renders without errors
- Props work as expected
- Styling is correct
- No console warnings

---

## Component Installation Workflow

### Installing ShadCN Components

```bash
# Install component using shadcn CLI
npx shadcn-ui@latest add switch

# This creates: client/src/components/ui/switch.tsx

# ✅ IMMEDIATELY after installation:
# 1. Open client/src/components/ui/index.ts
# 2. Add export line:
#    export { Switch } from './switch';
# 3. Test import in a page
```

### Creating Custom Components

```bash
# Create new component file
touch client/src/components/ui/custom-card.tsx

# Write component code...

# ✅ IMMEDIATELY after creation:
# 1. Add export to index.ts
# 2. Verify import works
# 3. Test in actual page
```

---

## Barrel vs Direct Imports

### Option 1: Barrel Exports (Recommended)

**Pros:**
- Clean imports: `import { Button, Input } from '@/components/ui'`
- Centralized management
- Easy to see all available components

**Cons:**
- Requires index.ts maintenance
- Forgetting export breaks imports
- Slightly larger bundle (imports entire barrel)

**Setup:**
```typescript
// client/src/components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Select } from './select';
export { Switch } from './switch';
export { Checkbox } from './checkbox';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './dialog';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';
// ... all components
```

**Usage:**
```typescript
import { Button, Input, Select } from '@/components/ui';
```

---

### Option 2: Direct Imports (More Reliable)

**Pros:**
- No barrel maintenance required
- Tree-shaking friendly (smaller bundles)
- Can't forget to export
- Explicit dependencies

**Cons:**
- More verbose imports
- Need to know exact file names

**Usage:**
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
```

**Recommendation**: Use direct imports by default. Only use barrel if you prefer cleaner import statements and commit to maintaining index.ts.

---

## Validation Checks

### 1. List All Components

```bash
# List all component files
ls client/src/components/ui/*.tsx | sed 's|.*/||' | sed 's/.tsx//'
```

Expected output:
```
button
checkbox
dialog
dropdown-menu
input
select
switch
...
```

### 2. Check Each is Exported

```bash
# Check each component is exported from barrel
for component in $(ls client/src/components/ui/*.tsx | sed 's|.*/||' | sed 's/.tsx//'); do
  if [ "$component" != "index" ]; then
    grep -q "export.*$component" client/src/components/ui/index.ts || \
      echo "❌ MISSING EXPORT: $component"
  fi
done
```

**Expected**: ZERO output (all components exported)

### 3. Verify Import Resolution

```bash
# Check if barrel export file exists
test -f client/src/components/ui/index.ts && \
  echo "✅ Barrel export file exists" || \
  echo "⚠️  No barrel export file (using direct imports)"
```

### 4. Count Exports vs Components

```bash
# Count component files
component_count=$(ls client/src/components/ui/*.tsx | grep -v index.tsx | wc -l | xargs)

# Count exports in barrel
export_count=$(grep -c "^export" client/src/components/ui/index.ts 2>/dev/null || echo 0)

echo "Components: $component_count"
echo "Exports: $export_count"

if [ "$component_count" -eq "$export_count" ]; then
  echo "✅ All components exported"
else
  echo "❌ Mismatch: $((component_count - export_count)) components not exported"
fi
```

---

## Component Export Patterns

### Simple Component Export

```typescript
// Component with single export
export { Button } from './button';
```

### Component with Sub-components

```typescript
// Dialog has multiple exports
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './dialog';
```

### Component with Type Exports

```typescript
// Export component and its types
export { Select, SelectTrigger, SelectContent, SelectItem } from './select';
export type { SelectProps } from './select';
```

---

## Common Import Errors

### Error 1: Module Not Found

```
Error: Module not found: Can't resolve '@/components/ui/switch'
```

**Cause**: Component file doesn't exist or barrel export missing

**Fix**:
1. Check file exists: `ls client/src/components/ui/switch.tsx`
2. Check barrel export: `grep Switch client/src/components/ui/index.ts`
3. Add missing export if needed

---

### Error 2: Named Export Not Found

```
Error: 'Switch' is not exported from '@/components/ui'
```

**Cause**: Barrel export missing or incorrect export name

**Fix**:
1. Check component's actual export: `grep "export" client/src/components/ui/switch.tsx`
2. Match barrel export to actual export name
3. Update barrel if needed

---

### Error 3: Duplicate Exports

```
Error: Duplicate identifier 'Button'
```

**Cause**: Component exported multiple times in barrel

**Fix**:
1. Search for duplicates: `grep Button client/src/components/ui/index.ts`
2. Remove duplicate export lines

---

## Automated Export Generation

### Generate Barrel File

```bash
#!/bin/bash
# generate-barrel.sh - Auto-generate barrel exports

COMPONENTS_DIR="client/src/components/ui"
INDEX_FILE="$COMPONENTS_DIR/index.ts"

# Clear existing file
> "$INDEX_FILE"

# Generate exports for all .tsx files
for file in "$COMPONENTS_DIR"/*.tsx; do
  if [ "$(basename $file)" != "index.tsx" ]; then
    component=$(basename "$file" .tsx)
    echo "export * from './$component';" >> "$INDEX_FILE"
  fi
done

echo "✅ Generated barrel exports in $INDEX_FILE"
```

**Usage:**
```bash
chmod +x generate-barrel.sh
./generate-barrel.sh
```

**Note**: This generates `export *` which exports everything. You may need to manually refine to specific named exports.

---

## Best Practices

### 1. Prefer Direct Imports

Unless you're committed to barrel maintenance:

```typescript
// ✅ PREFERRED: Direct imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
```

Why: No barrel sync issues, better tree-shaking, explicit dependencies

---

### 2. Update Barrel Immediately After Installing

If using barrel pattern:

```bash
# Install component
npx shadcn-ui@latest add switch

# IMMEDIATELY add export
echo "export { Switch } from './switch';" >> client/src/components/ui/index.ts
```

---

### 3. Document Custom Components

For non-ShadCN components, add JSDoc:

```typescript
/**
 * Custom card component with enhanced styling
 * @example
 * <CustomCard title="Hello" description="World">
 *   Content here
 * </CustomCard>
 */
export function CustomCard({ ... }) { ... }
```

---

### 4. Validate After Installing Multiple Components

```bash
# Install multiple components
npx shadcn-ui@latest add switch checkbox radio-group

# Validate all exports
for component in switch checkbox radio-group; do
  grep -q "export.*$component" client/src/components/ui/index.ts || \
    echo "❌ MISSING: $component"
done
```

---

## Component File Naming Conventions

Follow ShadCN conventions:

| Component | File Name | Export Name |
|-----------|-----------|-------------|
| Button | `button.tsx` | `Button` |
| Checkbox | `checkbox.tsx` | `Checkbox` |
| Dialog | `dialog.tsx` | `Dialog`, `DialogContent`, etc. |
| Dropdown Menu | `dropdown-menu.tsx` | `DropdownMenu`, `DropdownMenuItem`, etc. |
| Select | `select.tsx` | `Select`, `SelectTrigger`, etc. |

**Rule**: Kebab-case file names, PascalCase component names

---

## Why This Matters

**asana-clone Evidence**: Switch and Select missing from barrel exports caused 5 import failures

**Symptoms**:
- ✅ Component files exist
- ❌ Imports fail with "Module not found"
- ❌ Pages can't be developed
- ❌ Console shows import errors

**Time Lost**: 30+ minutes per missing export (search, debug, discover it's just missing export)

---

## Related Patterns

- **INTERACTIVE_STATE.md**: State management for UI components
- **CODE_PATTERNS.md**: Component usage patterns

---

## Final Checklist

After creating or installing ANY UI component:

- [ ] Component file exists in `client/src/components/ui/`
- [ ] Component exports match naming convention (PascalCase)
- [ ] Barrel export added to `index.ts` (if using barrel pattern)
- [ ] Import tested from page (no errors)
- [ ] Component renders correctly
- [ ] Props work as expected
- [ ] No console warnings about missing modules

---

**Remember**: Creating a component without updating barrel exports is like building a feature and forgetting to ship it. The component exists but can't be used!
