# DIRECTORY STRUCTURE

## Key Principle
**Planning artifacts** vs **Runtime code** must be separated.

## Directory Layout
```
apps/my-app/
├── plan/                 # Planning artifacts (NOT code)
│   ├── plan.md          # App specification
│   └── ui-component-spec.md
├── design-system/        # Design tokens (consumed by build)
│   ├── tailwind.config.js
│   └── globals.css
├── preview-html/         # Static preview
│   └── preview.html
├── preview-react/        # React preview
│   └── App.tsx
└── app/                  # RUNTIME CODE ONLY
    ├── client/          # Frontend application
    ├── server/          # Backend application  
    └── shared/          # Shared between client/server
        ├── schema.zod.ts        # Zod schemas (Stage 2)
        └── contracts/           # ts-rest contracts (Stage 2)
            ├── users.contract.ts
            └── index.ts
```

## Rules

### ✅ Runtime Code Goes in `app/`
- `app/shared/schema.zod.ts` - Zod schemas
- `app/shared/contracts/*.ts` - API contracts
- `app/client/` - React components
- `app/server/` - Express routes

### ❌ Planning Artifacts Stay Out of `app/`
- `plan/plan.md` - Specifications
- `plan/ui-component-spec.md` - Design docs
- Never mix documentation with code

## Common Mistakes

❌ **WRONG**: `specs/schema.zod.ts` (runtime code in planning dir)
✅ **RIGHT**: `app/shared/schema.zod.ts`

❌ **WRONG**: `app/specs/plan.md` (planning doc in code dir)
✅ **RIGHT**: `plan/plan.md`

## Stage Outputs

| Stage | Output Location | Type |
|-------|----------------|------|
| Plan | `plan/` | Planning |
| UI Component Spec | `plan/` | Planning |
| Backend Spec | `app/shared/` | Runtime |
| Design System | `design-system/` | Config |
| Preview | `preview-html/`, `preview-react/` | Preview |
| Build | `app/` | Runtime |