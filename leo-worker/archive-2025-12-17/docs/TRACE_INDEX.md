# App Generator Call Chain Trace - Complete Index

## Overview

This documentation provides a **comprehensive trace of the entire App Generator codebase**, from entry point to complete application generation. It includes:

- **973 lines** of detailed technical explanation
- **790 lines** of architecture diagrams and flowcharts  
- **510 lines** of quick reference and summary
- **2,273 lines total** of complete documentation

---

## The Three Documents

### 1. APP_GENERATOR_CALL_CHAIN_TRACE.md (973 lines)
**Complete Technical Reference**

This is the primary document with exhaustive detail on every component:

**Contents:**
- Layer 1: Agent Initialization
- Layer 2: App Generation Entry Points
- Layer 3: The Pipeline System Prompt
- Layer 4: Build Stage Orchestration
- Layer 5: Writer-Critic Loop Pattern
- Layer 6: Agent Hierarchy
- Layer 7: Data Flow Between Stages
- Layer 8: Orchestration Patterns
- Layer 9: Session Management
- Example Trace: "Create a Todo App"
- Key Design Patterns
- Critical Success Factors
- Performance Characteristics
- Error Handling
- Testing & Validation
- Complete Summary

**Best For:** Deep understanding, implementation details, troubleshooting

**Read Time:** 45-60 minutes for complete understanding

---

### 2. APP_GENERATOR_ARCHITECTURE_DIAGRAM.md (790 lines)
**Visual Architecture & Flow**

Comprehensive ASCII diagrams showing how everything connects:

**Contents:**
- High-Level Pipeline Flow
- Writer-Critic Loop Pattern (simplified)
- Agent Dependency Graph
- Data Flow Through Pipeline
- File Dependencies
- Parallel Execution Timeline
- Session Management Flow
- MCP Tools Ecosystem
- Error Recovery & Resilience
- Agent Lifecycle

**Best For:** Visual learners, understanding connections, presentations

**Read Time:** 20-30 minutes to understand all diagrams

---

### 3. TRACE_SUMMARY.md (510 lines)
**Quick Reference Guide**

Executive summary with tables and quick lookups:

**Contents:**
- What is App Generator?
- Three Entry Modes
- The Pipeline: 9 Stages (with timing)
- Writer-Critic Pattern (explained simply)
- Data Flow Architecture
- Parallel Execution Details
- Agent Hierarchy Overview
- Session Management Details
- Error Handling & Resilience
- MCP Tools Table
- Performance Characteristics Table
- Critical Success Factors
- Known Limitations
- Debugging & Development Tips
- Code Entry Points
- Key Concepts Glossary
- Statistics Summary

**Best For:** Quick answers, status updates, reference during development

**Read Time:** 10-15 minutes for complete overview

---

## Quick Navigation Guide

### I want to understand...

**The overall system**
→ Start with: TRACE_SUMMARY.md "What is App Generator?"
→ Then view: APP_GENERATOR_ARCHITECTURE_DIAGRAM.md "High-Level Pipeline Flow"

**How to run the system**
→ Start with: TRACE_SUMMARY.md "Three Entry Modes"
→ Reference: Code Entry Points section
→ Then read: TRACE.md "Layer 2: App Generation Entry Points"

**The Writer-Critic pattern**
→ Start with: TRACE_SUMMARY.md "Writer-Critic Pattern"
→ Visualize: APP_GENERATOR_ARCHITECTURE_DIAGRAM.md "Writer-Critic Loop Pattern"
→ Deep dive: TRACE.md "Layer 5: Writer-Critic Loop Pattern"

**Agent architecture**
→ Start with: TRACE_SUMMARY.md "Agent Hierarchy"
→ Visualize: APP_GENERATOR_ARCHITECTURE_DIAGRAM.md "Agent Dependency Graph"
→ Deep dive: TRACE.md "Layer 6: Agent Hierarchy"

**Data flow**
→ Start with: TRACE_SUMMARY.md "Data Flow Architecture"
→ Visualize: APP_GENERATOR_ARCHITECTURE_DIAGRAM.md "File Dependencies"
→ Deep dive: TRACE.md "Layer 7: Data Flow Between Stages"

**Schema-first development**
→ Start with: TRACE_SUMMARY.md "Data Flow Architecture"
→ Deep dive: TRACE.md "Critical Success Factors"

**Parallel execution**
→ Start with: TRACE_SUMMARY.md "Parallel Execution"
→ Visualize: APP_GENERATOR_ARCHITECTURE_DIAGRAM.md "Parallel Execution Timeline"
→ Deep dive: TRACE.md "Layer 8: Orchestration Patterns"

**Session management**
→ Start with: TRACE_SUMMARY.md "Session Management"
→ Visualize: APP_GENERATOR_ARCHITECTURE_DIAGRAM.md "Session Management Flow"
→ Deep dive: TRACE.md "Layer 9: Session Management"

**Error handling**
→ Start with: TRACE_SUMMARY.md "Error Handling & Resilience"
→ Visualize: APP_GENERATOR_ARCHITECTURE_DIAGRAM.md "Error Recovery & Resilience"
→ Deep dive: TRACE.md "Error Handling" section

**Performance benchmarks**
→ Start with: TRACE_SUMMARY.md "Performance Characteristics"
→ Deep dive: TRACE.md "Performance Characteristics"

**Debugging issues**
→ Start with: TRACE_SUMMARY.md "Debugging & Development"
→ Reference: "Common Issues" table

---

## Entry Points to Code

### New App Generation
**File:** `/run-app-generator.py` (lines 293-434)
**Function:** `main()`
**Then:** `AppGeneratorAgent.generate_app()`

### Resume/Modify App
**File:** `/run-app-generator.py` (lines 531-839)
**Function:** `main()` with `--resume`
**Then:** `AppGeneratorAgent.resume_generation()` → `resume_with_session()`

### Build Stage Orchestration
**File:** `src/app_factory_leonardo_replit/stages/build_stage.py` (line 808+)
**Function:** `run_stage()`
**Implements:** All Writer-Critic loops

### Writer-Critic Loop
**File:** `src/app_factory_leonardo_replit/stages/build_stage.py` (line 73+)
**Function:** `run_writer_critic_loop()`
**Pattern:** Writer → Critic → Decision

### Agent Base Class
**File:** `agents/app_generator/agent.py` (line 32+)
**Class:** `AppGeneratorAgent`
**Methods:** `__init__()`, `generate_app()`, `resume_generation()`, `resume_with_session()`

---

## Key Concepts

### Writer-Critic Pattern
- Writer generates code + self-tests
- Critic validates independently
- Feedback passed as raw XML
- Max 3 iterations per agent
- "Complete" → move to next agent
- "Continue" → iterate again
- Critical failure → stop pipeline

### Schema-First Development
- Database schema (schema.zod.ts) is the source of truth
- All backend agents depend on schema
- Frontend relies on schema + contracts for types
- Enables type-safe full-stack

### Never-Broken Pipeline
- Critical agents must succeed
- Non-critical can fail gracefully
- No rollback of previous stages
- Early failure detection
- Clear error messages

### Parallel Execution
- FIS Page Specs: 5 concurrent
- Frontend Pages: 5-10 concurrent
- Significant time savings (50-80%)
- Independent timeout and retry

### Session Management
- Auto-saved to {app_path}/.agent_session.json
- Enables resume with context
- Reprompter suggests improvements
- 3 interactive modes

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Agents | 25+ |
| Backend Agents | 5 |
| Frontend Agents | 5+ |
| Optional Subagents | 8 |
| MCP Tools | 11+ |
| Pipeline Stages | 3 |
| Build Sub-Stages | 9 |
| Writer-Critic Loops | 9 |
| Max Parallel Pages | 10 |
| System Prompt Size | 50K+ chars |
| Max Agent Turns | 50+ |
| Max Iterations/Agent | 3 |

---

## Performance Timeline

| Stage | Duration | Notes |
|-------|----------|-------|
| Plan Creation | 2-3 min | User prompt → plan.md |
| Backend Spec | 3-5 min | Schema + contracts |
| Schema Generator | 1-2 min | W-C loop, usually 1 iteration |
| Storage Generator | 1-2 min | W-C loop, usually 1 iteration |
| Routes Generator | 1-2 min | W-C loop, usually 1 iteration |
| API Client Gen | 1 min | W-C loop, usually 1 iteration |
| App Shell Gen | 1 min | W-C loop, usually 1 iteration |
| FIS Master | 1 min | No critic, single generation |
| FIS Pages (parallel) | 30 min | 5 concurrent, 3 attempts |
| Layout Generator | 1 min | W-C loop, non-critical |
| Frontend Pages (parallel) | 10-15 min | 10 concurrent, self-tested |
| Validation | 2-3 min | Type check, lint, build |
| **New App Total** | **20-40 min** | Typical application |
| **Resume/Modify** | **5-15 min** | Partial regeneration |

---

## How Documents Reference Each Other

```
TRACE_SUMMARY.md (Quick start)
  │
  ├─→ Want diagrams? → APP_GENERATOR_ARCHITECTURE_DIAGRAM.md
  │
  ├─→ Want details? → APP_GENERATOR_CALL_CHAIN_TRACE.md
  │
  └─→ Want code? → Check "Code Entry Points" section


APP_GENERATOR_CALL_CHAIN_TRACE.md (Complete reference)
  │
  ├─→ "See diagram" → APP_GENERATOR_ARCHITECTURE_DIAGRAM.md
  │
  ├─→ "See table" → TRACE_SUMMARY.md
  │
  └─→ "See code" → {actual files}


APP_GENERATOR_ARCHITECTURE_DIAGRAM.md (Visual guide)
  │
  ├─→ "See explanation" → APP_GENERATOR_CALL_CHAIN_TRACE.md
  │
  └─→ "See summary" → TRACE_SUMMARY.md
```

---

## Reading Recommendations

### For Developers
1. Start: TRACE_SUMMARY.md "Code Entry Points"
2. Read: TRACE_SUMMARY.md "The Pipeline: 9 Stages"
3. Deep dive: TRACE.md "Layer 4: Build Stage Orchestration"
4. Explore: TRACE.md "Layer 5: Writer-Critic Loop Pattern"
5. Reference: ARCHITECTURE_DIAGRAM.md as needed

### For Architects
1. Start: ARCHITECTURE_DIAGRAM.md "High-Level Pipeline Flow"
2. Read: TRACE_SUMMARY.md "What is App Generator?"
3. Study: TRACE_SUMMARY.md "Data Flow Architecture"
4. Deep dive: TRACE.md "Layer 7: Data Flow Between Stages"
5. Reference: TRACE.md "Key Design Patterns"

### For DevOps/Infrastructure
1. Start: TRACE_SUMMARY.md "Performance Characteristics"
2. Read: TRACE_SUMMARY.md "Session Management"
3. Study: TRACE.md "Error Handling & Resilience"
4. Reference: TRACE_SUMMARY.md "Common Issues"

### For Project Managers
1. Start: TRACE_SUMMARY.md "Performance Timeline"
2. Read: TRACE_SUMMARY.md "Three Entry Modes"
3. Reference: TRACE_SUMMARY.md "Known Limitations & Edge Cases"

---

## Updating This Documentation

If you modify the codebase:

1. **New Agent?** → Update TRACE.md "Layer 6: Agent Hierarchy"
2. **New Stage?** → Update TRACE_SUMMARY.md "The Pipeline: 9 Stages"
3. **New Tool?** → Update TRACE_SUMMARY.md "MCP Tools"
4. **Changed Flow?** → Update ARCHITECTURE_DIAGRAM.md diagrams
5. **Performance Change?** → Update TRACE_SUMMARY.md tables

---

## Version Information

- **Documentation Created:** November 8, 2025
- **Coverage:** Complete App Generator pipeline
- **Accuracy:** Based on source code exploration and analysis
- **Last Updated:** November 8, 2025

---

## Questions or Clarifications?

If you need clarification on any part:

1. **Quick answer?** → Check TRACE_SUMMARY.md
2. **Visual explanation?** → Check ARCHITECTURE_DIAGRAM.md
3. **Complete details?** → Check TRACE.md
4. **Code reference?** → Check "Code Entry Points" sections

---

**Total Documentation: 2,273 lines across 3 files**

Happy exploring! 🚀
