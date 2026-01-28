# Documentation Reorganization Plan

## New Directory Categories Needed -> NO

* [ ] **IMPLEMENTATION\_STATUS/** - Track current state and progress
* [ ] **ARCHITECTURE/** - System design and technical decisions
* [ ] **FIXES/** - Bug fixes and patches (separate from backlog)
* [ ] **LEGACY/** - Obsolete or reference-only docs

---

## File Movements

### To AI\_DOCS/ (AI pipeline and agent documentation)

* [ ] AGENTS.md - Agent architecture overview
* [ ] build-pipeline-agents.md - Pipeline agent details
* [ ] LEONARDO\_REPLIT\_PIPELINE\_ANALYSIS\_2025\_09\_09.md - Pipeline analysis
* [ ] XML\_VS\_JSON\_DECISION.md - AI output format decision

### To BACKLOG/ (active work items)

* [ ] CODEX\_IMPLEMENTATION\_PLAN\_2025-09-16.md - Active implementation plan
* [ ] MULTIPAGE\_APP\_IMPLEMENTATION\_2025\_01\_16.md - Multi-page feature work
* [ ] FIX\_DESIGN\_SYSTEM\_INTEGRATION\_2025-09-16.md - Design system work
* [ ] INTERACTION\_SPEC\_REBOOT\_2025-09-18.md - Spec enhancement work
* [ ] DEPLOYMENT\_AUTOMATION.md - Deployment feature work

### To BACKLOG/DONE/ (completed work)

* [ ] MULTIPAGE\_IMPLEMENTATION\_COMPLETE.md - Completed multi-page work
* [ ] PERMISSION\_FIX\_TASKS.md - Completed permission fixes
* [ ] LEONARDO\_PIPELINE\_FIXES\_2025\_01\_17.md - Completed pipeline fixes
* [ ] CONTEXT\_PROVIDERS\_FIX\_2025\_01\_17.md - Completed context fixes
* [ ] AUTH\_FIX\_REQUIRED\_2025\_01\_18.md - Completed auth fixes

### To IMPLEMENTATION\_STATUS/ (new directory)

* [ ] STATUS\_2025-09-02.md - FastAPI server status
* [ ] CRITICAL\_FIXES\_2025-09-09.md - Critical issues tracking
* [ ] PROGRESS\_BUILD\_AGENTS.md - Build agent progress

### To ARCHITECTURE/ (new directory)

* [ ] TECH\_STACK\_COMPARISON\_AI\_GENERATION\_2025-01-19.md - Stack comparison
* [ ] build-tech-stack.md - Tech stack details
* [ ] FASTAPI\_AGENT\_SPEC.md - FastAPI architecture spec
* [ ] FASTAPI\_MIGRATION\_PLAN.md - Migration architecture

### To LEGACY/ (new directory)

* [ ] ARCHIVE\_PLAN\_2025-09-17.md - Archive planning doc
* [ ] CODEX\_2025-09-17.md - Older codex version

### Keep in Root (essential references)

* [ ] README.md - Main project readme
* [ ] README\_APPFACTORY.md - App factory specific readme
* [ ] CLAUDE.md - Claude AI assistant instructions (critical reference)

---

## Document Splits Needed

* [ ] Split CLAUDE.md (after organizing other docs):

  * [ ] Keep quick reference and current Leonardo info in root CLAUDE.md
  * [ ] Move legacy app factory details to LEGACY/original-app-factory-reference.md
  * [ ] Move MCP configuration to AI\_DOCS/mcp-configuration.md

* [ ] Consolidate Status Docs:

  * [ ] Merge STATUS\_2025-09-02.md and CRITICAL\_FIXES\_2025-09-09.md
  * [ ] Create single IMPLEMENTATION\_STATUS/current-status.md

* [ ] Consolidate Fix Docs:

  * [ ] Group all completed fixes into BACKLOG/DONE/fixes-summary-2025-01.md
  * [ ] Keep individual fix docs for reference

---

## Files to Review for Relevance

* [ ] Some dated docs (2025-09-xx) may be obsolete if work is complete
* [ ] Archive plans from September may have been executed already
* [ ] Consider archiving docs older than 3 months unless actively referenced

---

## Action Summary

* [ ] Create 4 new directories: IMPLEMENTATION\_STATUS/, ARCHITECTURE/, FIXES/, LEGACY/
* [ ] Move 25 files from root to appropriate directories
* [ ] Keep 3 essential files in root
* [ ] Split CLAUDE.md into focused documents
* [ ] Consolidate related status and fix documents
