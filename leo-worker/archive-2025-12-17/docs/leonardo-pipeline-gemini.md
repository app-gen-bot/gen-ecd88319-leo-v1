# Leonardo Pipeline Analysis: Timeless Weddings (Corrected)

This document provides a corrected, deep analysis of the agent-based pipeline used to generate the "Timeless Weddings" application, as triggered by the `run-timeless-weddings-phase1.sh` script.

## Overview

The pipeline is a multi-stage process that transforms a user prompt into a full-stack web application. It uses a series of specialized agents, many of which operate in a "Writer-Critic" loop to ensure the quality and correctness of the generated code. The pipeline is designed to be resumable, skipping stages for which artifacts already exist.

## Execution Flow

The process is initiated by the `run-timeless-weddings-phase1.sh` script, which sets up the environment and then calls into the core Python application.

1.  **Shell Script (`run-timeless-weddings-phase1.sh`):**
    *   **Action:** Configures the environment (prompt, workspace name, ports) and executes the main Python runner script.
    *   **Entry Point:** `uv run python src/app_factory_leonardo_replit/run.py ...`

2.  **Python Runner (`.../run.py`):**
    *   **Action:** Parses command-line arguments, sets up logging, and calls the `run_pipeline` function.
    *   **Entry Point:** `run_pipeline(...)` in `.../main.py`

3.  **Main Pipeline (`.../main.py`):**
    *   **Action:** Orchestrates the high-level stages of the application generation process.

## Agent Pipeline Stages

The pipeline is divided into three main stages. The "Build Stage" is a meta-stage that contains the core agent-driven generation logic, including the crucial `backend_spec_stage`.

### 1. Plan Stage

This initial stage is responsible for interpreting the user's prompt and creating a foundational plan for the application.

*   **Module:** `plan_stage`
*   **Agent:** `OrchestratorAgent`
*   **Input:** User Prompt (e.g., "Create a wedding chapel booking platform...")
*   **Output:** `plan/plan.md`: A markdown file outlining the application's features, data models, and user flows.

### 2. Build Stage

This is the most complex stage, where the application's code is generated. It begins by calling the `backend_spec_stage` and then proceeds with a series of writer-critic agent pairs.

#### 2.1. Backend Spec Generation (Sub-Stage)

This is the first critical step within the build process, responsible for creating the data schemas and API contracts.

*   **Module:** `backend_spec_stage`
*   **Agent Pairs (Writer / Critic):**

    1.  **Schema Design:**
        *   **Writer:** `SchemaDesignerAgent`
        *   **Critic:** `SchemaDesignerCritic`
        *   **Input:** `plan.md`
        *   **Output:** `app/shared/schema.zod.ts` (The single source of truth for data models)

    2.  **Contracts Design:**
        *   **Writer:** `ContractsDesignerAgent`
        *   **Critic:** `ContractsDesignerCritic`
        *   **Inputs:** `app/shared/schema.zod.ts`, `plan.md`
        *   **Output:** `app/shared/contracts/*.contract.ts` (A set of ts-rest API contract files)

#### 2.2. Main Build Agent Pipeline

After the backend specs are created, the build stage continues with the following agent pairs:

1.  **Schema Generation:**
    *   **Writer:** `SchemaGeneratorAgent`
    *   **Critic:** `SchemaGeneratorCritic`
    *   **Inputs:** `app/shared/schema.zod.ts`, `specs/plan.md`
    *   **Output:** `app/shared/schema.ts` (Drizzle ORM schema, derived from the Zod schema)

2.  **Storage Generation:**
    *   **Writer:** `StorageGeneratorAgent`
    *   **Critic:** `StorageGeneratorCritic`
    *   **Inputs:** `app/shared/schema.ts`, `specs/plan.md`
    *   **Output:** `app/server/storage.ts` (Database access and storage logic)

3.  **Routes Generation:**
    *   **Writer:** `RoutesGeneratorAgent`
    *   **Critic:** `RoutesGeneratorCritic`
    *   **Inputs:** `app/shared/schema.ts`, `server/storage.ts`, `shared/contracts/`, `specs/plan.md`
    *   **Output:** `app/server/routes.ts` (API endpoint definitions)

4.  **API Client Generation:**
    *   **Writer:** `TsRestApiClientGeneratorAgent`
    *   **Critic:** `TsRestApiClientGeneratorCritic`
    *   **Inputs:** `shared/contracts/`, `specs/plan.md`
    *   **Outputs:**
        *   `client/src/lib/api-client.ts`: The type-safe frontend API client.
        *   `client/src/lib/api-registry.md`: A human-readable markdown document describing all available API endpoints.

5.  **App Shell Generation:**
    *   **Writer:** `AppShellGeneratorAgent`
    *   **Critic:** `AppShellGeneratorCritic`
    *   **Inputs:**
        *   **`cwd` (Current Working Directory):** The absolute path to the generated application's root directory. The agent uses this to read other generated files, such as `specs/pages-and-routes.md`, to build the routing logic.
        *   **`previous_critic_response`:** (Inside the writer-critic loop) The XML feedback from the `AppShellGeneratorCritic` from the previous iteration.
    *   **Output:** `client/src/App.tsx` (Main React application shell with routing)

6.  **FIS Master Spec Generation:**
    *   **Writer:** `FrontendInteractionSpecMasterAgent`
    *   **Critic:** None
    *   **Inputs:** `api-registry.md`, `schema.zod.ts`, `contracts/`, `pages-and-routes.md`
    *   **Output:** `specs/frontend-interaction-spec-master.md`

7.  **Layout Generation:**
    *   **Writer:** `LayoutGeneratorAgent`
    *   **Critic:** `LayoutGeneratorCritic`
    *   **Input:** `specs/frontend-interaction-spec-master.md`
    *   **Output:** `client/src/components/layout/AppLayout.tsx`

8.  **Frontend Implementation:**
    *   **Writer:** `FrontendImplementationAgent`
    *   **Critic:** `BrowserVisualCriticAgent`
    *   **Inputs:** `frontend-interaction-spec-master.md`, all page specs, `schema.zod.ts`, `contracts/`
    *   **Output:** The complete set of frontend pages and components.

### 3. Validator Stage

After the build is complete, this stage runs a final validation to ensure the application is functional and attempts to fix any detected issues.

*   **Module:** `validator_stage`
*   **Agents:**
    *   `AppFixerAgent`: Attempts to automatically fix issues found by the critic.
    *   `AppValidatorCritic`: Performs `oxc` and `build` checks, and browser-based smoke tests to validate the application.
*   **Input:** The generated `app/` directory.
*   **Output:** A validation summary and, if necessary, a repaired application.