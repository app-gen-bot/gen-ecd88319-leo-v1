# Leo Container .claude Directory

## Status: NEEDS VERIFICATION

This directory contains Claude Code agent markdown files whose usage is uncertain.

## Contents

- `agents/*.md` - Subagent definitions (8 files)

## Open Question

Are these markdown files used, or are they redundant?

Per Claude Agent SDK docs, **programmatic AgentDefinition (Python) takes precedence** over filesystem `.claude/agents/*.md` files.

Leo defines subagents BOTH ways:
1. Python: `AgentDefinition` objects in `src/leo/agents/app_generator/subagents/`
2. Markdown: These `.claude/agents/{name}.md` files

**Verification needed:**
- [ ] Check if Python code loads prompts from these files or has them inline
- [ ] Test: Remove one `.md` file, verify subagent still works
- [ ] If redundant: Archive to `archive-2025-12-17/`
- [ ] If used: Move to `leo-container/resources/agents/subagents/{name}/prompt.md`

## References

- `remote/docs/file-structure/leo-target-container-file-structure.md` lines 67-75, 1153-1196
- `remote/docs/file-structure/file-structure-spec.md` - Target structure

## Original Location

These files came from `apps/.claude/agents/` (moved 2025-12-17).
