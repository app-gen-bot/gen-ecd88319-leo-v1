# Leonardo Pipeline: FIS Regeneration Analysis

This document outlines the agent-based pipeline responsible for regenerating the Frontend Interaction Specs (FIS) for the `coliving-marketplace_v2` application, as triggered by the `run-full-regeneration-coliving.sh` script.

## Overview

The primary goal of this pipeline is to create a modular and consistent set of interaction specifications for the frontend. It achieves this by first generating a master specification containing reusable patterns and then generating individual specifications for each page in parallel.

## Execution Flow

The process is initiated by the `run-full-regeneration-coliving.sh` script, which performs cleanup and then invokes a Python orchestrator.

1.  **Shell Script (`run-full-regeneration-coliving.sh`):**
    *   **Action:** Executes the `run-modular-fis-standalone.py` script.
    *   **Parameters:** Passes the application directory (`apps/coliving-marketplace_v2/app`) and parameters for concurrency, timeout, and retries.

2.  **Python Runner (`run-modular-fis-standalone.py`):**
    *   **Action:** Instantiates and runs the `ParallelFISOrchestrator`.
    *   **Purpose:** Acts as the main entry point for the orchestration logic.

3.  **Orchestrator (`ParallelFISOrchestrator`):**
    *   This is the core of the pipeline, managing the two main phases of FIS generation.

## Agent Pipeline

The `ParallelFISOrchestrator` executes a two-phase process, utilizing two distinct agents.

### Phase 1: Master Spec Generation

This phase is responsible for creating the foundational master spec that all page specs will inherit from.

*   **Agent:** `FrontendInteractionSpecMasterAgent`
*   **Inputs:**
    *   `specs/plan.md`: The high-level project plan.
    *   `client/src/lib/api-registry.md`: (Optional) The API registry document.
*   **Output:**
    *   `specs/frontend-interaction-spec-master.md`: The master FIS document containing reusable patterns, design tokens, and global interaction guidelines.

### Phase 2: Parallel Page Spec Generation

After the master spec is created, this phase generates the individual interaction specifications for each page of the application concurrently.

*   **Agent:** `FrontendInteractionSpecPageAgent` (A new instance is created for each page)
*   **Inputs (for each page):**
    *   `specs/frontend-interaction-spec-master.md`: The master spec generated in Phase 1.
    *   **Page Name & Route:** Extracted from `specs/pages-and-routes.md` by the `FrontendInteractionSpecMasterAgent`.
    *   `client/src/lib/api-registry.md`: (Optional) The API registry document.
*   **Outputs:**
    *   A set of individual markdown files in the `specs/pages/` directory, one for each page (e.g., `home.md`, `about.md`, `profile.md`). Each file details the specific interactions, components, and data requirements for that page, inheriting from the master spec.

## Summary of Artifacts

### Input Artifacts

*   `specs/plan.md`
*   `specs/pages-and-routes.md`
*   `shared/schema.zod.ts`
*   `shared/contracts/*.contract.ts`
*   `client/src/lib/api-registry.md` (Optional)

### Output Artifacts

*   `specs/frontend-interaction-spec-master.md`
*   `specs/pages/*.md` (multiple files)
