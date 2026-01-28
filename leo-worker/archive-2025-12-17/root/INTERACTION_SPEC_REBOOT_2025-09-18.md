# Interaction Spec Reboot Notes — 2025-09-18

## Current State
- Archived Stage 1 interaction spec pipeline produced exhaustive UX docs (navigation tree, interaction catalog, state handling) directly from the PRD.
- Modern Leonardo flow now generates real implementation artifacts first: technical architecture spec, schema, storage, routes, API client, auth/contexts.
- Build stage executes writer–critic loops for backend and shell, then only the main page ships; other pages are skipped unless the page orchestrator runs without structured instructions.
- Preview stage biases toward a single page and is slated for async execution; removing its artifact requires richer specs upstream.

## Pain Points Observed Earlier
- Old interaction spec lacked awareness of generated backend, so wiring every button/form required manual follow-up.
- Today’s page generator knows about schema and API types but lacks the rich UX choreography → resulting pages feel generic, and multi-page coverage isn’t automatic.

## Proposed Hybrid Approach
1. **Introduce a new “Interaction Wiring” stage after writer/critic loops**
   - Inputs: plan, UI component spec, new structured navigation/component JSONs, technical spec, schema, API client, contexts, routes.
   - Outputs: (a) narrative markdown interaction spec, (b) machine-readable `interaction-wiring.json` detailing queries, mutations, states, and navigation per page.
   - Hard fail if referenced APIs/routes/components do not exist.

2. **Reuse archived template strengths**
   - Keep comprehensive navigation maps and interaction catalogs.
   - Augment each interaction with concrete wiring (API method, context call, route transition) derived from generated code.

3. **Parallel page generation**
   - Update page orchestrator/prompt to consume `interaction-wiring.json` instead of parsing markdown heuristics.
   - Allow each page to be generated independently using its wiring slice, schema, and API client.

4. **Preview alignment**
   - When preview runs asynchronously, have it read the same wiring spec so visual mocks align with real routes and actions.

5. **Validation guardrails**
   - Add automated checks confirming that every declared interaction corresponds to an implemented API/client method or route.
   - Fail fast on missing references to keep the “never broken” contract.

These notes capture why the original interaction spec felt magical, what the current pipeline adds, and how to merge both approaches without reintroducing manual wiring chores.
