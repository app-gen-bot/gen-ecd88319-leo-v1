# Leonardo Pipeline Scripts

## Phase 1: Backend Generation

Generate schema, contracts, and backend:
```bash
./run-timeless-weddings-phase1.sh [OPTIONS]
```

**Clean Options:**
- `--clean` - Full regeneration (removes everything except logs)
- `--clean-contracts` - Regenerate contracts + API client only
- `--clean-specs` - Regenerate FIS specs only
- `--clean-pages` - Regenerate pages only
- `--yes` - Skip confirmation
- `--help` - Show usage

**Examples:**
```bash
./run-timeless-weddings-phase1.sh --clean-contracts --yes
./run-timeless-weddings-phase1.sh --clean
```

## FIS Generation

Regenerate FIS specs:
```bash
./run-modular-fis-timeless-weddings.sh
```

Generates:
- `frontend-interaction-spec-master.md` - Master FIS spec
- `specs/pages/*.md` - Individual page specs

### Full FIS Regeneration Test

Test condensed FIS generators with complete regeneration for coliving-marketplace_v2:
```bash
./run-full-regeneration-coliving.sh
```

**Purpose:** Regenerates all FIS specs (master + 34 pages) using condensed generator prompts.

**Features:**
- Automatic backup before deletion (timestamped tar.gz)
- Parallel generation (10 concurrent pages)
- Before/after size comparison
- Expected: 72% reduction (631KB → 175KB)

**Analysis:**
```bash
python analyze-regeneration-results.py
```

Validates size targets, categorization, and condensation rule compliance.

**Guide:** See `.docs/full-regeneration-guide.md` for complete instructions and troubleshooting.

## Parallel Frontend Generation

Generate all pages in parallel with Writer-Critic loop:
```bash
./run-parallel-frontend.sh
```

Features:
- 10 concurrent pages (default), 600s timeout per page
- Max 5 Writer-Critic iterations per page
- UI consistency validation
- Logs to `logs/parallel-frontend-TIMESTAMP.log`

### Command Line Options

```bash
./run-parallel-frontend.sh [OPTIONS] [app_directory] [max_concurrency] [timeout]
```

**Options:**
- `-c, --clean` - Delete existing pages before regenerating
- `-f, --force` - Skip confirmation prompt (with --clean)
- `-d, --dry-run` - Preview changes without executing
- `-h, --help` - Show help message

**Examples:**
```bash
# Clean regeneration with confirmation
./run-parallel-frontend.sh --clean

# Force clean regeneration (no prompt)
./run-parallel-frontend.sh --clean --force

# Preview what would be deleted/generated
./run-parallel-frontend.sh --clean --dry-run

# Custom app with clean mode
./run-parallel-frontend.sh --clean apps/my-app/app 5 300
```

## Complete Pipeline

Test API Registry System end-to-end:
```bash
# 1. Regenerate contracts with metadata
./run-timeless-weddings-phase1.sh --clean-contracts --yes

# 2. Regenerate FIS specs (uses api-registry.md)
./run-modular-fis-timeless-weddings.sh

# 3. Regenerate pages (validates against registry)
./test-phase1.sh
```
