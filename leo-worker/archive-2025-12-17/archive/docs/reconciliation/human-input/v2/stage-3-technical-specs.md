# Stage 3: Technical Specifications Extraction

(very concise! human input, ai-aided)

## Phase 1: Frontend Extraction
Pattern: Writer

Step Type: Writer
Purpose: Extract frontend specifications from wireframe
Inputs: Next.js Wireframe
Outputs: Frontend Specification
Tools: component_analyzer, state_extractor, feature_documenter

## Phase 2: API Contract Generation
Pattern: Writer

Step Type: Writer
Purpose: Derive API endpoints from UI needs
Inputs: Next.js Wireframe, Frontend Specification
Outputs: API Contract, WebSocket Events
Tools: endpoint_generator, request_response_formatter, websocket_analyzer

## Phase 3: Reconciliation
Pattern: Critic / Judge

Step Type: Critic
Purpose: Ensure consistency between specs
Inputs: Frontend Specification, API Contract
Outputs: Consistency Report
Tools: spec_validator, mismatch_detector

Step Type: Judge
Purpose: Validate completeness and flag issues
Inputs: Consistency Report, All Specifications
Outputs: Final Technical Specs, Data Models
Tools: completeness_checker, data_model_generator

## Specifications Include
- All components documented
- State management patterns
- Required features list
- Endpoint definitions
- Request/response formats
- Data model schemas