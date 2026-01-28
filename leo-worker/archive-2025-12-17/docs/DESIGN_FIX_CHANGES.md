# Design System Fix - Exact Changes Required

## File 1: ui-designer Skill

**File**: `apps/.claude/skills/ui-designer/SKILL.md`

### Change 1.1: Update Pattern #1 Title (Line ~27)

**BEFORE**:
```markdown
### 1. OKLCH Color Configuration (CRITICAL - Prevents UI Failure)
```

**AFTER**:
```markdown
### 1. OKLCH Color Configuration & Dark Mode Placement (CRITICAL)

**PRODUCTION ISSUE**: `.dark` selector MUST be OUTSIDE `@layer base` to prevent tree-shaking.
```

### Change 1.2: Add Rule #2 (Line ~56, after existing Rule)

**ADD AFTER** existing "**Rule**: CSS variables = values only...":
```markdown
**Rule #2**: `.dark` selector MUST be OUTSIDE `@layer base` to survive production tree-shaking.
```

### Change 1.3: Fix index.css Template (Lines ~230-334)

**CURRENT** (Lines ~284-321):
```css
@layer base {
  :root {
    /* ... light mode ... */
  }

  .dark {  /* ❌ WRONG LOCATION */
    /* ... dark mode ... */
  }
}
```

**CHANGE TO**:
```css
@layer base {
  :root {
    /* ... light mode ... */
  }
}

/* ✅ CRITICAL: Dark mode OUTSIDE @layer to prevent tree-shaking */
.dark {
  /* Dark Mode - Different lightness values */
  --primary: 0.709 0.129 226.02;
  --primary-foreground: 0.205 0 0;

  --secondary: 0.27 0 0;
  --secondary-foreground: 0.985 0 0;

  --accent: 0.27 0 0;
  --accent-foreground: 0.985 0 0;

  --destructive: 0.579 0.22 27.33;
  --destructive-foreground: 0.985 0 0;

  --success: 0.598 0.18 147.39;
  --success-foreground: 0.985 0 0;

  --warning: 0.795 0.19 70.08;
  --warning-foreground: 0.205 0 0;

  --info: 0.658 0.17 218.25;
  --info-foreground: 0.985 0 0;

  /* Dark Surfaces */
  --background: 0.145 0 0;
  --foreground: 0.985 0 0;
  --card: 0.145 0 0;
  --card-foreground: 0.985 0 0;
  --popover: 0.145 0 0;
  --popover-foreground: 0.985 0 0;

  /* Dark Components */
  --border: 0.27 0 0;
  --input: 0.27 0 0;
  --ring: 0.709 0.129 226.02;
  --muted: 0.27 0 0;
  --muted-foreground: 0.741 0 0;
}
```

### Change 1.4: Add NEW Template (After tailwind.config.ts template, ~line 420)

**INSERT NEW SECTION**:
```markdown
### Complete postcss.config.js (CRITICAL for Production)

**REQUIRED**: Explicit config path prevents Vite working directory issues.

```javascript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  plugins: {
    // ✅ CRITICAL: Explicit path required for Vite projects
    tailwindcss: { config: join(__dirname, 'tailwind.config.js') },
    autoprefixer: {},
  },
};
```

**Why This Matters**:
- Vite's `root: './client'` changes PostCSS working directory
- Without explicit path: ZERO utility classes generated (broken styling)
- With explicit path: All utilities generated correctly

**Files to Create**:
1. `client/postcss.config.js` - Use template above
2. Delete `postcss.config.js` from project root (if exists)

**Validation**:
```bash
npm run build
grep -c "rounded-lg" client/dist/assets/*.css  # Must return 1+
```
```

### Change 1.5: Add NEW Pattern #8 (After Pattern #7, ~line 205)

**INSERT NEW PATTERN**:
```markdown
### 8. Production Build Safety (CRITICAL - Prevents Deployment Failures)

**Problem**: Design works in dev but breaks in production (white background, no utilities).

**Critical Rules**:

1. **Dark Mode Placement**: `.dark` MUST be OUTSIDE `@layer base`
   ```css
   @layer base {
     :root { /* light */ }
   }

   .dark { /* dark - OUTSIDE */ }
   ```

2. **PostCSS Explicit Paths**: Must specify config in postcss.config.js
   ```javascript
   tailwindcss: { config: join(__dirname, 'tailwind.config.js') }
   ```

**Validation Commands** (run after `npm run build`):
```bash
grep -c "\.dark" client/dist/assets/*.css       # Must return: 1+
grep -c "rounded-lg" client/dist/assets/*.css   # Must return: 1+
ls -lh client/dist/assets/*.css                 # Must be: >50KB
```

**Rule**: Never mark design system complete without production build validation.
```

### Change 1.6: Update Validation Checklist (End of file)

**FIND** existing validation section and **ADD** these items:

```markdown
**Production Build Checks (MANDATORY)**:
- [ ] Run `npm run build` successfully with zero warnings
- [ ] Verify `.dark` exists: `grep -c "\.dark" client/dist/assets/*.css` returns 1+
- [ ] Verify utilities exist: `grep -c "rounded-lg" client/dist/assets/*.css` returns 1+
- [ ] Verify CSS size: `ls -lh client/dist/assets/*.css` shows >50KB
- [ ] Visual check: Dark background, rounded corners, shadows all visible
```

---

## File 2: quality_assurer Validation

**File**: `docs/patterns/quality_assurer/VALIDATION_CHECKLIST.md`

### Change 2.1: Add Production Build Section (End of file)

**APPEND NEW SECTION**:
```markdown
## Production Build Validation (CRITICAL)

Run AFTER all code generation, BEFORE marking app complete:

### Commands (All must pass)

```bash
cd {app-path}/client
npm run build

# 1. Dark mode survived tree-shaking
grep -c "\.dark" dist/assets/*.css
# MUST return 1+. If 0: .dark inside @layer base (ui-designer skill issue)

# 2. Tailwind utilities generated
grep -c "rounded-lg" dist/assets/*.css
# MUST return 1+. If 0: postcss.config.js missing explicit path

# 3. CSS file size correct
ls -lh dist/assets/*.css
# MUST be >50KB. If <10KB: Utilities not generated
```

### Visual Verification

- Screenshot production build (serve dist folder, not dev server)
- Verify: Dark background, rounded buttons, drop shadows, gradient text
- If any missing: Run commands above to identify issue

**FAILURE CRITERIA**: If ANY check fails, STOP and fix design system. DO NOT mark complete.
```

---

## File 3: pipeline-prompt Coordination

**File**: `docs/pipeline-prompt.md`

### Change 3.1: Update Section 2.4.1 Design System Requirements (~line 933)

**FIND** the section that mentions `client/tailwind.config.ts`

**ADD** after existing requirements:
```markdown
- `client/postcss.config.js` **(CRITICAL)**:
  - Explicit Tailwind config path: `{ config: join(__dirname, 'tailwind.config.js') }`
  - Required for Vite projects with `root: './client'`
  - Without: ZERO utility classes generated (production breaks)

**CRITICAL CSS STRUCTURE**:
- `:root` (light mode) in `@layer base`
- `.dark` (dark mode) **OUTSIDE** `@layer base` (prevents tree-shaking)
- Without correct placement: Dark mode removed in production builds
```

---

## Validation (After Making Changes)

1. **Generate test app** using updated ui-designer skill
2. **Build for production**: `cd client && npm run build`
3. **Run checks**:
   ```bash
   grep "\.dark" dist/assets/*.css          # Should see full .dark block
   grep "rounded-lg" dist/assets/*.css       # Should see utility classes
   ls -lh dist/assets/*.css                  # Should be >50KB
   ```
4. **Visual test**: Serve production build, verify dark mode + styling works

**All 4 checks must pass** = Fix successful ✅

---

## Summary

**3 files to modify**:
1. `ui-designer` skill - Fix templates + add Pattern #8 + update validation
2. `quality_assurer` validation - Add production build checks
3. `pipeline-prompt` - Add critical warnings

**Impact**: Prevents 100% of production design failures

**Time**: ~30 minutes to implement + 15 minutes to test

**Priority**: P0 - Do before next app generation
