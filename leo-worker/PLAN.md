# Leo File Structure Refactoring Plan

> **Purpose**: Context-resilient plan for end-to-end refactoring
> **Status**: Planning - finalizing file structure
> **Branch**: jake/leo-remote-v2

---

## Goal

Rationalize Leo's file structure to eliminate duplication, fix path issues, and prepare for production deployment.

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `remote/docs/file-structure/file-structure-spec.md` | **Target file structure** |
| `remote/docs/file-structure/leo-target-container-file-structure.md` | Working analysis |
| `remote/docs/app-generator-saas-spec.md` | SaaS specification |

---

## Architecture

Two containers, one contracts directory:

```
app-factory/
├── leo-saas/              # SaaS platform (TypeScript)
├── leo-container/         # Leo agent (Python)
├── contracts/             # Interface specifications
└── docs/                  # Documentation
```

```
┌─────────────────────────┐       ┌─────────────────────────┐
│      LEO-SAAS           │       │     LEO-CONTAINER       │
│      (TypeScript)       │       │     (Python)            │
│                         │       │                         │
│  Web App                │       │  Leo Agent              │
│  WSI Server            ◄├───────┤► WSI Client             │
│  Container Manager      │  WSI  │  Workspace              │
└─────────────────────────┘ Proto └─────────────────────────┘
```

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Container-first naming** | `leo-saas/` and `leo-container/` - clear, not agent terminology |
| **No package managers** | Historical pain; vendor/ becomes source code |
| **Contracts-only sharing** | TS/Python implement specs independently |
| **vendor/ as source** | cc-agent, cc-tools become `leo-container/src/vendor/` |
| **Elon = copy of Leo** | Bootstrap strategy for meta-development agent |

---

## Phases (High Level)

1. **Finalize structure** - Agree on file-structure-spec.md
2. **Create directories** - Set up new structure (additive, safe)
3. **Move TypeScript** - leo-saas/ contents
4. **Move Python** - leo-container/ contents
5. **Create contracts** - Extract from existing docs
6. **Update imports** - Python and TypeScript paths
7. **Update Dockerfiles** - New structure
8. **Cleanup** - Delete redundant files
9. **Bootstrap Elon** - Copy Leo, modify for meta-development

---

## Elon Strategy

1. Repackage Leo with clean structure (this plan)
2. Copy `leo-container/leo/` → `leo-container/elon/`
3. Modify Elon skills for meta-development
4. Future: Elon modifies itself

---

## Next Action

Review and finalize `file-structure-spec.md`
