# AI App Factory - Quick Reference

Transform prompts into deployed applications using AI agents.

## 🚀 Quick Start

```bash
# Basic usage
uv run python -m app_factory.main_v2 --user-prompt "Create a task management app"

# Recommended usage (with all improvements)
uv run python -m app_factory.main_v2 \
  --user-prompt "Create a task management app with authentication" \
  --iterative-stage-1 \
  --skip-questions
```

## 📋 Prerequisites

1. Create `.env` file:
```env
BROWSER_HEADLESS=false
# Add other optional configs from docs/ai-app-factory/README.md
```

2. Install dependencies:
```bash
uv pip install -e .
```

## 🔧 Key Commands

### Run Pipeline
```bash
# Full pipeline with improvements
uv run python -m app_factory.main_v2 \
  --user-prompt "Your app description" \
  --iterative-stage-1

# Resume from checkpoint
uv run python -m app_factory.main_v2 --checkpoint <checkpoint_id>
```

### Monitor Progress
```bash
# Real-time monitoring (in separate terminal)
uv run python -m app_factory.monitor

# List checkpoints
uv run python -m app_factory.checkpoint_cli list
```

### Test Example
```bash
# Run the LoveyTasks family app example
./test_lovey_tasks.sh
```

## 📁 Output

Apps are generated in:
```
apps/YourAppName/
├── specs/
│   ├── business_prd.md
│   └── frontend-interaction-spec.md
└── frontend/
    └── (Next.js app)
```

## 🎯 Current Features

✅ Stage 0: PRD Generation  
✅ Stage 1: Interaction Specs (with navigation completeness)  
✅ Stage 2: Frontend Generation (with mock data)  
✅ Checkpoint system for resuming  
✅ Real-time progress monitoring  
✅ Browser testing in visible mode  

## 📚 Full Documentation

See `docs/ai-app-factory/README.md` for:
- Complete setup instructions
- All command options
- Troubleshooting guide
- Example prompts
- Development tips

## 💡 Tips

1. Use `--iterative-stage-1` for better specs
2. Browser opens automatically for testing
3. Monitor progress in separate terminal
4. Check navigation completeness in specs
5. Frontend uses mock data (this is normal!)

---
**Note**: Currently generates frontend only. Backend implementation coming soon!