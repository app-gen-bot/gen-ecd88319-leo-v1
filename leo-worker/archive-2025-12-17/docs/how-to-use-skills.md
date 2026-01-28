# How to Create and Use Claude Agent Skills

## Table of Contents
1. [Quick Start](#quick-start)
2. [What Are Skills?](#what-are-skills)
3. [Creating Your First Skill](#creating-your-first-skill)
4. [SKILL.md File Format](#skillmd-file-format)
5. [Auto-Invocation](#auto-invocation)
6. [Validation Scripts](#validation-scripts)
7. [Templates](#templates)
8. [Complete Examples](#complete-examples)
9. [Testing Your Skill](#testing-your-skill)
10. [Integration with Pipeline](#integration-with-pipeline)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Quick Start

**5-Minute Skill Creation**:

```bash
# 1. Create skill directory
cd /path/to/app-factory
mkdir -p .claude/skills/my-skill/{scripts,templates}

# 2. Create SKILL.md
cat > .claude/skills/my-skill/SKILL.md << 'EOF'
---
name: My Skill Name
description: >
  Use this skill when doing X. This description determines auto-invocation.
---

# My Skill Name

## When to Use This Skill
- Bullet points of when to invoke

## Instructions
Step-by-step guidance...
EOF

# 3. Test it
# Ask Claude: "Invoke the my-skill skill"
```

---

## What Are Skills?

**Skills are self-contained knowledge modules** that Claude automatically loads when needed.

### Key Concepts

**Auto-Invocation**: Claude loads skills based on matching task context to skill description

**Progressive Disclosure**: Skills provide deep expertise only when relevant (not all at once)

**Composable**: Multiple skills can be active simultaneously

**Maintainable**: Update one skill without affecting others

### Anatomy of a Skill

```
skill-name/
├── SKILL.md              # Required: Instructions with YAML frontmatter
├── scripts/              # Optional: Validation/helper scripts
│   └── validate.sh
└── templates/            # Optional: Code templates
    └── example.ts
```

---

## Creating Your First Skill

### Step 1: Choose a Name

Pick a descriptive, kebab-case name:
- ✅ `drizzle-orm-setup`
- ✅ `api-error-handling`
- ✅ `react-component-patterns`
- ❌ `MySkill` (not kebab-case)
- ❌ `skill1` (not descriptive)

### Step 2: Create Directory Structure

```bash
cd /path/to/app-factory

# Create directories
mkdir -p .claude/skills/your-skill-name/{scripts,templates}

# Verify structure
tree .claude/skills/your-skill-name
# Expected output:
# your-skill-name/
# ├── scripts/
# └── templates/
```

### Step 3: Create SKILL.md

This is the **most important file**. Claude reads this to learn what to do.

```bash
cat > .claude/skills/your-skill-name/SKILL.md << 'EOF'
---
name: Your Skill Name (Human Readable)
description: >
  Clear description of WHEN to use this skill. Be specific!
  This determines auto-invocation. Include keywords that match
  the tasks this skill should handle.
---

# Your Skill Name

## When to Use This Skill

**MANDATORY** when:
- Specific condition 1
- Specific condition 2

**AUTO-INVOKE** on these patterns:
- User mentions "keyword X"
- Creating file Y
- Implementing pattern Z

## Core Instructions

### Step 1: First Thing to Do

Explain clearly with code examples:

```typescript
// Show concrete code
const example = "like this";
```

### Step 2: Second Thing to Do

More instructions...

## Validation Checklist

- [ ] Requirement 1 met
- [ ] Requirement 2 met
- [ ] No anti-patterns used

## Anti-Patterns (DO NOT DO THIS)

❌ **Bad Pattern Name**:
```typescript
// Show what NOT to do
const bad = "example";
```

✅ **Correct Pattern**:
```typescript
// Show the right way
const good = "example";
```

## See Also

- Related skill: `other-skill-name`
- Documentation: `docs/reference.md`
EOF
```

---

## SKILL.md File Format

### Required YAML Frontmatter

**Every SKILL.md must start with YAML frontmatter**:

```markdown
---
name: Human Readable Skill Name
description: >
  Multi-line description that determines auto-invocation.
  Be specific about when this skill applies.
  Include keywords and patterns.
---
```

### Required Sections

#### 1. When to Use This Skill

```markdown
## When to Use This Skill

**MANDATORY** when:
- List specific conditions

**AUTO-INVOKE** on these patterns:
- Patterns that should trigger this skill
```

**Why**: Helps Claude (and humans) know when to invoke

#### 2. Core Instructions

```markdown
## Core Instructions

### Step 1: First Action

Clear, actionable instructions with code examples.

### Step 2: Next Action

Continue with step-by-step guidance.
```

**Why**: The actual "how-to" content

#### 3. Validation Checklist

```markdown
## Validation Checklist

- [ ] First requirement
- [ ] Second requirement
- [ ] Third requirement
```

**Why**: Ensures completeness before considering task done

### Optional but Recommended Sections

#### Anti-Patterns

```markdown
## Anti-Patterns (DO NOT DO THIS)

❌ **Pattern Name**:
```typescript
// Bad code
```

✅ **Correct Pattern**:
```typescript
// Good code
```
```

**Why**: Shows what NOT to do (often as important as what to do)

#### Common Issues & Solutions

```markdown
## Common Issues & Solutions

### Issue: "Error message or symptom"

**Diagnosis**: Why this happens

**Solution**: How to fix it
```

**Why**: Troubleshooting guide for predictable problems

#### See Also

```markdown
## See Also

- Related skill: `skill-name`
- Documentation: `docs/file.md`
- External docs: [Link](https://example.com)
```

**Why**: Connects related resources

---

## Auto-Invocation

### How It Works

Claude matches the task context to skill descriptions:

1. User gives a task: "Set up database storage"
2. Claude scans skill descriptions for matches
3. Finds skill with description: "Use this skill when setting up database storage..."
4. Loads that skill automatically
5. Follows skill instructions

### Writing Good Descriptions

**✅ GOOD** (Specific, includes keywords):
```yaml
description: >
  Use this skill when setting up Drizzle ORM for a Node.js/TypeScript backend
  with PostgreSQL or Supabase. This skill ensures Drizzle is used for runtime
  queries (not just schema definition) and handles snake_case conversion.
```

**❌ BAD** (Too vague):
```yaml
description: Use this for database stuff
```

**❌ BAD** (Too narrow):
```yaml
description: Use exactly when user says "setup drizzle"
```

### Keywords Matter

Include keywords that users might mention:

```yaml
description: >
  Use this skill when creating React components with TypeScript, shadcn/ui,
  Tailwind CSS, or implementing dark mode. Handles component composition,
  prop typing, and accessibility patterns.
```

Keywords: React, TypeScript, shadcn/ui, Tailwind, dark mode, components, accessibility

---

## Validation Scripts

### Why Validation Scripts?

**Problem**: Claude generates code that looks right but has subtle bugs

**Solution**: Automated scripts that verify correctness

### Creating a Validation Script

#### Bash Script Example

```bash
#!/bin/bash
# File: .claude/skills/my-skill/scripts/validate.sh

echo "🔍 Validating My Feature Setup..."

# Check 1: File exists
if [ ! -f "path/to/required/file.ts" ]; then
  echo "❌ Required file not found: path/to/required/file.ts"
  exit 1
fi

echo "✅ Required file exists"

# Check 2: Contains required import
if ! grep -q "import.*requiredThing" path/to/required/file.ts; then
  echo "❌ Missing required import in path/to/required/file.ts"
  echo "   Add: import { requiredThing } from 'package';"
  exit 1
fi

echo "✅ Required import found"

# Check 3: Pattern exists
if ! grep -q "specificPattern" path/to/required/file.ts; then
  echo "⚠️  Recommended pattern not found"
  echo "   Consider adding: specificPattern"
fi

echo ""
echo "✅ Validation passed!"
exit 0
```

**Key points**:
- Exit 0 = success, Exit 1 = failure (CI/CD compatible)
- Clear error messages with fix suggestions
- Use ✅ and ❌ for visual clarity

#### TypeScript Script Example

```typescript
#!/usr/bin/env tsx
// File: .claude/skills/my-skill/scripts/validate.ts

import { readFileSync, existsSync } from 'fs';

async function validate() {
  console.log('🔍 Validating My Feature Setup\n');

  // Check 1: File exists
  if (!existsSync('path/to/file.ts')) {
    console.error('❌ Required file not found');
    process.exit(1);
  }
  console.log('✅ Required file exists');

  // Check 2: File content
  const content = readFileSync('path/to/file.ts', 'utf-8');
  if (!content.includes('requiredPattern')) {
    console.error('❌ Required pattern not found');
    console.error('   Add: requiredPattern');
    process.exit(1);
  }
  console.log('✅ Required pattern found');

  console.log('\n✅ Validation passed!');
  process.exit(0);
}

validate().catch((err) => {
  console.error('❌ Validation error:', err);
  process.exit(1);
});
```

**Key points**:
- Use `#!/usr/bin/env tsx` shebang for TypeScript
- Import standard libraries only (no dependencies)
- Clear console output

### Make Scripts Executable

```bash
chmod +x .claude/skills/my-skill/scripts/validate.sh
chmod +x .claude/skills/my-skill/scripts/validate.ts
```

### Documenting Validation in SKILL.md

```markdown
## Validation

Run the validation script to verify setup:

```bash
cd /path/to/your/app
/path/to/app-factory/.claude/skills/my-skill/scripts/validate.sh
```

**Expected output**:
```
🔍 Validating My Feature Setup...
✅ Required file exists
✅ Required import found
✅ Validation passed!
```

**If validation fails**:
- Read error messages carefully
- Fix issues one by one
- Re-run validation
```

---

## Templates

### Why Templates?

**Problem**: Boilerplate code is tedious and error-prone

**Solution**: Copy-paste ready templates

### Creating a Template

#### Example: TypeScript File Template

```typescript
// File: .claude/skills/my-skill/templates/feature.ts.template

import { required } from 'package';
import type { TypeImport } from '@types';

/**
 * Feature description
 *
 * Usage:
 * ```typescript
 * const instance = createFeature({ option: value });
 * ```
 */
export function createFeature(config: FeatureConfig) {
  // Validate config
  if (!config.requiredField) {
    throw new Error('requiredField is required');
  }

  // Implementation
  return {
    method1() {
      // TODO: Implement method1
    },

    method2() {
      // TODO: Implement method2
    },
  };
}

// Type definitions
export interface FeatureConfig {
  requiredField: string;
  optionalField?: number;
}
```

**Template best practices**:
- Include helpful comments
- Show usage examples in JSDoc
- Add `TODO:` markers for customization points
- Include type definitions
- Validate inputs

### Documenting Templates in SKILL.md

```markdown
## Quick Start Template

Copy this template to get started quickly:

**File**: `path/to/your/file.ts`

```typescript
// Paste template content here
// or reference the template file:
```

See: `.claude/skills/my-skill/templates/feature.ts.template` for complete template

**Customization needed**:
1. Replace `TODO` markers with actual implementation
2. Update `FeatureConfig` with your specific fields
3. Implement `method1` and `method2`
```

---

## Complete Examples

### Example 1: Simple Skill (No Scripts/Templates)

**Use case**: Style guide enforcement

```bash
mkdir -p .claude/skills/style-guide
```

**File**: `.claude/skills/style-guide/SKILL.md`

```markdown
---
name: TypeScript Style Guide
description: >
  Use this skill when writing TypeScript code. Enforces consistent
  style, naming conventions, and code organization patterns.
---

# TypeScript Style Guide

## When to Use This Skill

**ALWAYS** when writing TypeScript code in this project.

## Naming Conventions

### Variables and Functions

✅ **Use camelCase**:
```typescript
const userName = 'John';
function getUserById(id: number) { }
```

❌ **Don't use snake_case or PascalCase**:
```typescript
const user_name = 'John';  // ❌
const UserName = 'John';   // ❌
```

### Types and Interfaces

✅ **Use PascalCase**:
```typescript
interface UserProfile { }
type ApiResponse = { };
```

### Constants

✅ **Use UPPER_SNAKE_CASE for true constants**:
```typescript
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRIES = 3;
```

## File Organization

✅ **Order imports**:
```typescript
// 1. External packages
import { useState } from 'react';
import express from 'express';

// 2. Internal absolute imports
import { apiClient } from '@/lib/api-client';
import type { User } from '@shared/types';

// 3. Relative imports
import { helper } from './helper';
import type { LocalType } from './types';
```

## Validation Checklist

- [ ] All variables use camelCase
- [ ] All types use PascalCase
- [ ] Imports are organized correctly
- [ ] No `any` types (use `unknown` or proper types)
- [ ] Functions have return type annotations

## See Also

- ESLint config: `.eslintrc.js`
- TypeScript config: `tsconfig.json`
```

### Example 2: Skill with Validation Script

**Use case**: Environment variable setup

```bash
mkdir -p .claude/skills/env-setup/{scripts,templates}
```

**File**: `.claude/skills/env-setup/SKILL.md`

```markdown
---
name: Environment Variable Setup
description: >
  Use this skill when setting up environment variables for a Node.js
  application. Ensures .env file structure, validation, and type safety.
---

# Environment Variable Setup

## When to Use This Skill

**MANDATORY** when:
- Creating new Node.js/TypeScript project
- Adding new environment variables
- Setting up deployment configuration

## Required Setup

### Step 1: Create .env File

**File**: `.env`

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# API Keys (get from respective dashboards)
API_KEY=your-api-key-here

# Optional Features
FEATURE_FLAG_X=true
```

### Step 2: Create .env.example

**File**: `.env.example`

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# API Keys
API_KEY=

# Optional Features
FEATURE_FLAG_X=false
```

**Why**: Committed to git, shows required variables without secrets

### Step 3: Add to .gitignore

**File**: `.gitignore`

```
.env
.env.local
.env.*.local
```

### Step 4: Type-Safe Access

**File**: `server/lib/env.ts`

```typescript
import 'dotenv/config';

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export const env = {
  PORT: parseInt(getEnv('PORT'), 10),
  NODE_ENV: getEnv('NODE_ENV'),
  DATABASE_URL: getEnv('DATABASE_URL'),
  API_KEY: getEnv('API_KEY'),
  FEATURE_FLAG_X: getEnv('FEATURE_FLAG_X', false) === 'true',
} as const;

// Validate on startup
if (env.PORT < 1 || env.PORT > 65535) {
  throw new Error('PORT must be between 1 and 65535');
}
```

## Validation

Run validation script:

```bash
.claude/skills/env-setup/scripts/validate-env.sh
```

## Validation Checklist

- [ ] `.env` file exists
- [ ] `.env.example` exists
- [ ] `.env` is in `.gitignore`
- [ ] Type-safe env access via `server/lib/env.ts`
- [ ] No hardcoded secrets in code

## Anti-Patterns

❌ **Direct process.env access**:
```typescript
const port = process.env.PORT;  // ❌ No validation, no types
```

✅ **Type-safe access**:
```typescript
import { env } from './lib/env';
const port = env.PORT;  // ✅ Validated, typed
```
```

**File**: `.claude/skills/env-setup/scripts/validate-env.sh`

```bash
#!/bin/bash

echo "🔍 Validating Environment Setup..."

# Check 1: .env exists
if [ ! -f ".env" ]; then
  echo "❌ .env file not found"
  echo "   Create it with: cp .env.example .env"
  exit 1
fi
echo "✅ .env file exists"

# Check 2: .env.example exists
if [ ! -f ".env.example" ]; then
  echo "❌ .env.example file not found"
  echo "   Create it as a template (without secrets)"
  exit 1
fi
echo "✅ .env.example exists"

# Check 3: .env is in .gitignore
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo "❌ .env not in .gitignore"
  echo "   Add: echo '.env' >> .gitignore"
  exit 1
fi
echo "✅ .env is in .gitignore"

# Check 4: Type-safe env access
if [ ! -f "server/lib/env.ts" ]; then
  echo "⚠️  No type-safe env access found"
  echo "   Consider creating server/lib/env.ts"
else
  echo "✅ Type-safe env access exists"
fi

echo ""
echo "✅ Environment setup validated!"
```

### Example 3: Skill with Template

**Use case**: API route creation

```bash
mkdir -p .claude/skills/api-routes/{scripts,templates}
```

**File**: `.claude/skills/api-routes/SKILL.md`

```markdown
---
name: API Route Creation
description: >
  Use this skill when creating new API routes in Express.js.
  Enforces consistent error handling, validation, and response patterns.
---

# API Route Creation

## When to Use This Skill

**MANDATORY** when:
- Creating new API endpoints
- Adding routes to Express router

## Standard Route Template

Use this template for all API routes:

**File**: `server/routes/resource.ts`

```typescript
import express from 'express';
import { z } from 'zod';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().optional(),
});

// GET /api/resources - List all
router.get('/api/resources', async (req, res) => {
  try {
    const items = await storage.getResources();
    res.json(items);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// GET /api/resources/:id - Get one
router.get('/api/resources/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const item = await storage.getResource(id);
    if (!item) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// POST /api/resources - Create (protected)
router.post('/api/resources', authMiddleware(), async (req, res) => {
  try {
    // Validate request body
    const result = createSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
      });
    }

    // Create resource
    const item = await storage.createResource({
      ...result.data,
      userId: req.user.id,  // From authMiddleware
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

export default router;
```

See: `.claude/skills/api-routes/templates/route.ts.template`

## Customization Steps

1. Replace `resource`/`Resource` with your entity name
2. Update `createSchema` with your validation rules
3. Implement storage methods
4. Add to `server/index.ts`:
   ```typescript
   import resourceRoutes from './routes/resource';
   app.use(resourceRoutes);
   ```

## Required Patterns

### ✅ Always Use Try-Catch

```typescript
router.get('/api/path', async (req, res) => {
  try {
    // Route logic
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error message' });
  }
});
```

### ✅ Validate Input with Zod

```typescript
const schema = z.object({ field: z.string() });
const result = schema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: 'Validation failed', details: result.error.issues });
}
```

### ✅ Use Appropriate Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid auth)
- `403` - Forbidden (valid auth, insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Anti-Patterns

❌ **No error handling**:
```typescript
router.get('/api/path', async (req, res) => {
  const data = await storage.getData();  // ❌ Unhandled promise rejection
  res.json(data);
});
```

❌ **No validation**:
```typescript
router.post('/api/path', async (req, res) => {
  const item = await storage.create(req.body);  // ❌ No validation!
  res.json(item);
});
```
```

---

## Testing Your Skill

### Manual Testing

1. **Create a test scenario**:
   ```
   Ask Claude: "Invoke the my-skill skill and show me what it does"
   ```

2. **Verify auto-invocation**:
   ```
   Ask Claude: "Create a new API route for users"
   # Should automatically invoke api-routes skill
   ```

3. **Check output**:
   - Does Claude follow the skill instructions?
   - Does generated code match patterns?
   - Are validation scripts run?

### Validation Script Testing

```bash
# Test validation passes
cd /path/to/test/app
/path/to/app-factory/.claude/skills/my-skill/scripts/validate.sh
# Should exit 0

# Test validation catches errors
# (Temporarily break something)
rm required-file.ts
/path/to/app-factory/.claude/skills/my-skill/scripts/validate.sh
# Should exit 1 with clear error message
```

### Template Testing

```bash
# Copy template
cp .claude/skills/my-skill/templates/file.ts.template test-file.ts

# Verify it's valid TypeScript
npx tsc --noEmit test-file.ts

# Clean up
rm test-file.ts
```

---

## Integration with Pipeline

### Where to Add Skill Invocation

Find the relevant section in `docs/pipeline-prompt.md` and add:

```markdown
**🔧 SKILLS INTEGRATION**: When [condition], invoke the **`skill-name` skill**
to ensure [benefit].

See: `.claude/skills/skill-name/SKILL.md`
```

### Example Integration

**Before**:
```markdown
#### 2.4.1 Create API Routes

Create Express routes for all endpoints...
```

**After**:
```markdown
#### 2.4.1 Create API Routes

**🔧 SKILLS INTEGRATION**: When creating API routes, invoke the **`api-routes` skill**
to ensure consistent error handling, validation, and response patterns.

See: `.claude/skills/api-routes/SKILL.md`

Create Express routes for all endpoints...
```

---

## Best Practices

### 1. Be Specific in Descriptions

**❌ Vague**:
```yaml
description: Use for database things
```

**✅ Specific**:
```yaml
description: >
  Use this skill when setting up Drizzle ORM for PostgreSQL or Supabase.
  Ensures proper client configuration, type-safe queries, and automatic
  snake_case conversion. Auto-invoke when creating database storage layer.
```

### 2. Show Code, Don't Just Describe

**❌ Abstract**:
```markdown
Create a function that validates input.
```

**✅ Concrete**:
```markdown
Create a validation function:

```typescript
function validate(input: unknown) {
  const schema = z.object({ field: z.string() });
  return schema.safeParse(input);
}
```
```

### 3. Include Anti-Patterns

Show what NOT to do:

```markdown
## Anti-Patterns

❌ **Don't do this**:
```typescript
const bad = example;
```

✅ **Do this instead**:
```typescript
const good = example;
```
```

### 4. Make Validation Scripts Helpful

**❌ Cryptic**:
```bash
echo "Error 123"
exit 1
```

**✅ Helpful**:
```bash
echo "❌ Configuration file missing"
echo "   Create it with: cp config.example.json config.json"
echo "   Then update with your settings"
exit 1
```

### 5. Keep Skills Focused

**One skill = One concern**

- ✅ `drizzle-orm-setup` - Drizzle configuration only
- ✅ `api-error-handling` - Error handling only
- ❌ `backend-everything` - Too broad!

### 6. Link Related Resources

```markdown
## See Also

- Related skill: `other-skill`
- Documentation: `docs/guide.md`
- External: [Drizzle Docs](https://orm.drizzle.team/)
```

---

## Troubleshooting

### Skill Not Auto-Invoking

**Problem**: Skill doesn't load automatically

**Solutions**:

1. **Check description is specific**:
   ```yaml
   description: >
     Must include keywords that match the task context
   ```

2. **Test manually first**:
   ```
   Ask Claude: "Invoke the skill-name skill"
   ```

3. **Check file location**:
   ```
   Must be: .claude/skills/skill-name/SKILL.md
   Not: .claude/skill-name/SKILL.md
   ```

### Validation Script Not Executable

**Problem**: Permission denied

**Solution**:
```bash
chmod +x .claude/skills/skill-name/scripts/validate.sh
```

### Validation Script Not Found

**Problem**: `command not found: tsx`

**Solution**:
```bash
# Install tsx globally
npm install -g tsx

# Or use npx
npx tsx .claude/skills/skill-name/scripts/validate.ts
```

### YAML Frontmatter Error

**Problem**: Skill doesn't load

**Check**:
1. Frontmatter starts with `---` (three dashes)
2. Frontmatter ends with `---` (three dashes)
3. Valid YAML syntax (proper indentation)
4. Description uses `>` for multi-line

**Correct**:
```yaml
---
name: Skill Name
description: >
  Multi-line description
  continues here
---
```

---

## Quick Reference

### Skill Directory Structure

```
.claude/skills/skill-name/
├── SKILL.md              # Required
├── scripts/              # Optional
│   ├── validate.sh       # Bash validation
│   └── validate.ts       # TypeScript validation
└── templates/            # Optional
    └── template.ts       # Code template
```

### SKILL.md Template

```markdown
---
name: Skill Name
description: >
  When to use this skill. Include keywords.
---

# Skill Name

## When to Use This Skill
- Condition 1
- Condition 2

## Instructions
Step-by-step with code examples

## Validation Checklist
- [ ] Requirement 1
- [ ] Requirement 2

## Anti-Patterns
❌ Don't do this
✅ Do this instead

## See Also
- Links to related resources
```

### Validation Script Template

```bash
#!/bin/bash
echo "🔍 Validating..."

if [ ! -f "required-file" ]; then
  echo "❌ File missing"
  exit 1
fi

echo "✅ Validation passed!"
exit 0
```

### Integration Template

```markdown
**🔧 SKILLS INTEGRATION**: When [condition], invoke the **`skill-name` skill**.

See: `.claude/skills/skill-name/SKILL.md`
```

---

## Next Steps

1. **Study existing skills**:
   ```bash
   ls -la .claude/skills/
   cat .claude/skills/drizzle-orm-setup/SKILL.md
   ```

2. **Create your first skill**:
   - Start simple (just SKILL.md, no scripts)
   - Test with manual invocation
   - Add validation script
   - Test auto-invocation

3. **Integrate with pipeline**:
   - Find relevant section in `docs/pipeline-prompt.md`
   - Add skill invocation point
   - Test with new app generation

4. **Iterate and improve**:
   - Get feedback on skill effectiveness
   - Add more examples
   - Improve validation
   - Create more skills

---

## Additional Resources

- **Existing Skills**: `.claude/skills/` - Learn from examples
- **Skills Overview**: `.claude/skills/README.md` - Architecture guide
- **Implementation Summary**: `docs/skills-implementation-summary.md` - What was built
- **Original Plan**: `docs/supabase-skills.md` - Comprehensive design doc

---

**Remember**: Skills are about **preventing bugs before they happen** through validation and clear patterns, not just documentation.

Good luck creating your skills! 🚀
