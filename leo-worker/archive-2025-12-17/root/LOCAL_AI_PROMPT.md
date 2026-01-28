# Local AI Testing Prompt - Git Fix Verification

## Your Task

Verify the git fix (`leo-container:587498c`) works correctly by testing locally, then proceed to apply the skills fix.

## Context Hydration - Read These Files IN ORDER

### 1. Start Here (Overview)
```
HANDOFF_LOCAL_TESTING.md
```
This gives you:
- What was done on EC2
- Current state of both fixes (git ✅, skills ⏳)
- Step-by-step testing instructions
- What to do after testing

### 2. Detailed Context (Optional - if you need more background)
```
~/path/to/leo-saas/jake/USER_ISSUES_REFINED.md
~/path/to/leo-saas/jake/P0_ISSUES_INVESTIGATION_REPORT.md
```

## Quick Start Commands

```bash
# 1. Pull latest code
cd ~/path/to/leo-container && git pull origin ec2
cd ~/path/to/leo-saas && git pull origin ec2

# 2. Read handoff document
cd ~/path/to/app-factory  # or leo repo
cat HANDOFF_LOCAL_TESTING.md

# 3. Follow the Step-by-Step Testing section
```

## Your Goals

### Verify BOTH P0 Fixes
1. Build `leo-container:e72a0a3` locally (includes BOTH fixes)
2. Verify git and skills in the image
3. Update leo-saas manager.ts to use `e72a0a3`
4. Start leo-saas locally
5. Run test generation
6. Verify BOTH: git commands work AND skills load (check logs)
7. If successful, commit the manager.ts change
8. Optionally: Deploy to EC2 production

## Key Principles

- **Both fixes already committed** - Git (`587498c`) and Skills (`e72a0a3`)
- **Each fix was separate commit** - For rollback capability ✅
- **Use commit hashes as image tags** - Final image: `leo-container:e72a0a3`
- **No runtime mounts** - Everything baked into image (Fargate requirement) ✅

## Success Criteria

✅ Git commands execute without `[Errno 2] No such file or directory: 'git'` errors
✅ Generated app has `.git/` directory
✅ Skills available in container at `/app/.claude/skills/`
✅ Skills load during generation without errors
✅ Both fixes work together in `e72a0a3` image

---

**Context Source**: EC2 investigation completed 2025-11-10
**Ready to Test**: Yes - all code committed and pushed
**Branch**: `ec2` (leo-container, leo-saas), `forensics-migration` (app-factory/leo)
