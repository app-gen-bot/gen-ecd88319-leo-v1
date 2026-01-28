# How to Use Skills - Quick Summary

## Overview

**File**: `docs/how-to-use-skills.md` (1337 lines)

A comprehensive, AI-agent-friendly guide to creating and using Claude Agent Skills.

## What's Inside

### 12 Main Sections

1. **Quick Start** - 5-minute skill creation
2. **What Are Skills?** - Core concepts
3. **Creating Your First Skill** - Step-by-step
4. **SKILL.md File Format** - Required structure
5. **Auto-Invocation** - How skills load automatically
6. **Validation Scripts** - Automated verification
7. **Templates** - Boilerplate code
8. **Complete Examples** - 3 full working examples
9. **Testing Your Skill** - Validation methods
10. **Integration with Pipeline** - Where to add invocations
11. **Best Practices** - Do's and don'ts
12. **Troubleshooting** - Common issues & fixes

## Key Features

### ✅ Step-by-Step Instructions

Every step clearly explained:
```bash
# 1. Create directory
mkdir -p .claude/skills/my-skill/{scripts,templates}

# 2. Create SKILL.md
cat > .claude/skills/my-skill/SKILL.md << 'EOF'
...
EOF

# 3. Test it
# Ask Claude: "Invoke the my-skill skill"
```

### ✅ Complete Working Examples

**3 Full Examples**:

1. **Simple Skill** (Style Guide) - No scripts, just guidance
2. **Skill with Validation** (Environment Setup) - Includes bash validation script
3. **Skill with Template** (API Routes) - Includes TypeScript template

Each example includes:
- Complete SKILL.md content
- Validation scripts (if applicable)
- Templates (if applicable)
- Integration instructions

### ✅ Copy-Paste Ready Templates

**SKILL.md Template**:
```markdown
---
name: Skill Name
description: >
  When to use this skill. Include keywords.
---

# Skill Name

## When to Use This Skill
...
```

**Validation Script Template**:
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

### ✅ Best Practices Section

Clear guidance on:
- Writing specific descriptions
- Showing code, not just describing
- Including anti-patterns
- Making validation scripts helpful
- Keeping skills focused
- Linking related resources

### ✅ Troubleshooting Guide

Common issues with solutions:
- Skill not auto-invoking
- Validation script not executable
- YAML frontmatter errors
- Script dependencies missing

## How AI Agents Should Use This

### For Creating New Skills

1. **Read**: `docs/how-to-use-skills.md`
2. **Follow**: Step-by-step instructions in "Creating Your First Skill"
3. **Copy**: Templates provided
4. **Validate**: Use testing section
5. **Integrate**: Follow integration section

### For Understanding Skills

1. **Read**: "What Are Skills?" section
2. **Study**: Complete examples (3 working examples)
3. **Review**: Best practices
4. **Reference**: Quick reference section

### For Troubleshooting

1. **Check**: Troubleshooting section
2. **Verify**: Validation checklist
3. **Test**: Testing methods

## Document Structure

```
how-to-use-skills.md (1337 lines)
├── Table of Contents (12 sections)
├── Quick Start (5-minute creation)
├── Core Concepts
│   ├── What Are Skills?
│   ├── Anatomy of a Skill
│   └── Key Concepts
├── Creating Skills
│   ├── Step-by-Step Guide
│   ├── SKILL.md Format
│   ├── Auto-Invocation
│   ├── Validation Scripts
│   └── Templates
├── Examples (3 complete examples)
│   ├── Simple Skill
│   ├── Skill with Validation
│   └── Skill with Template
├── Testing & Integration
│   ├── Manual Testing
│   ├── Validation Testing
│   └── Pipeline Integration
├── Best Practices (6 key practices)
├── Troubleshooting (4 common issues)
└── Quick Reference (templates & checklists)
```

## Key Sections to Reference

### For Quick Creation
→ **Section 1: Quick Start** (line 15)

### For Understanding Format
→ **Section 4: SKILL.md File Format** (line 85)

### For Examples
→ **Section 8: Complete Examples** (line 365)

### For Validation
→ **Section 6: Validation Scripts** (line 220)

### For Integration
→ **Section 10: Integration with Pipeline** (line 820)

### For Problems
→ **Section 12: Troubleshooting** (line 1150)

## Usage Examples

### Example 1: AI Agent Creating Database Skill

**Agent reads**: `docs/how-to-use-skills.md`

**Agent follows**:
1. Section 3: Creating Your First Skill
2. Section 4: SKILL.md File Format
3. Section 8, Example 2: Skill with Validation
4. Section 10: Integration with Pipeline

**Result**: Complete database skill with validation

### Example 2: AI Agent Troubleshooting

**Agent encounters**: Skill not auto-invoking

**Agent checks**:
1. Section 12: Troubleshooting → "Skill Not Auto-Invoking"
2. Follows solutions listed
3. Tests with manual invocation first

**Result**: Issue resolved

## Strengths of This Guide

### ✅ Comprehensive
- Covers everything from basics to advanced
- 1337 lines of detailed guidance
- 12 major sections

### ✅ Practical
- 3 complete working examples
- Copy-paste ready templates
- Step-by-step instructions

### ✅ AI-Friendly
- Clear structure
- Code examples throughout
- No ambiguity

### ✅ Actionable
- "Do this" not "you could"
- Concrete examples
- Validation methods

## Comparison with Other Docs

| Document | Lines | Purpose | Best For |
|----------|-------|---------|----------|
| **how-to-use-skills.md** | 1337 | Step-by-step creation guide | AI agents creating skills |
| skills-implementation-summary.md | 720 | What was built this session | Understanding implementation |
| supabase-skills.md | 1164 | Original comprehensive plan | Design decisions |
| .claude/skills/README.md | 401 | Usage guide for existing skills | Using skills |

## Recommended Reading Order

### For AI Agents Creating Skills
1. **how-to-use-skills.md** (THIS DOC) - Complete guide
2. Existing skill examples in `.claude/skills/`
3. `skills-implementation-summary.md` - See what was built

### For Understanding Architecture
1. `.claude/skills/README.md` - Overview
2. `supabase-skills.md` - Design decisions
3. **how-to-use-skills.md** - Implementation details

## Next Actions

### For AI Agents

**To create a skill**:
```
1. Read docs/how-to-use-skills.md
2. Follow Section 3: Creating Your First Skill
3. Use templates from Section 4
4. Test using Section 9
```

**To understand existing skills**:
```
1. Read Section 2: What Are Skills?
2. Study examples in Section 8
3. Read actual skills in .claude/skills/
```

**To troubleshoot**:
```
1. Check Section 12: Troubleshooting
2. Verify using checklists
3. Test with manual invocation
```

## Success Metrics

After reading this guide, AI agents should be able to:
- ✅ Create a basic skill in 15 minutes
- ✅ Add validation scripts
- ✅ Create templates
- ✅ Integrate with pipeline
- ✅ Test and troubleshoot skills

---

**Document**: `docs/how-to-use-skills.md`
**Length**: 1337 lines
**Sections**: 12 main sections
**Examples**: 3 complete working examples
**Templates**: 3 copy-paste ready templates
**Status**: ✅ Complete and ready for AI agent use

---

**Quick Access**:
- **Creating**: Section 3 (Creating Your First Skill)
- **Format**: Section 4 (SKILL.md File Format)
- **Examples**: Section 8 (Complete Examples)
- **Testing**: Section 9 (Testing Your Skill)
- **Troubleshooting**: Section 12 (Troubleshooting)
