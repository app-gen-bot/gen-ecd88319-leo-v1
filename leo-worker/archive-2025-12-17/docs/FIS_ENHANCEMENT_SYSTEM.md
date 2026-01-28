# FIS Enhancement System - Making the Pipeline Robust

## Overview

The Frontend Interaction Specification (FIS) is the backbone of the Leonardo pipeline, bridging the gap between backend contracts and frontend implementation. This document describes the comprehensive enhancement system created to make FIS generation robust, deterministic, and self-healing.

## Problem Statement

The original FIS system had several critical issues:
1. **Low Contract Compliance** (65%) - FIS didn't correctly use ts-rest contracts
2. **Brittle Generation** - No validation or compilation step
3. **Wrong API Client** - Generated basic CRUD instead of ts-rest client
4. **No Self-Healing** - Errors propagated through pipeline

## Solution Architecture

### 1. Deterministic ts-rest Client Generation

Instead of using an LLM to generate the API client, we created deterministic utilities that programmatically generate proper ts-rest clients from contracts.

**Key Files:**
- `utilities/tsrest_client_setup.py` - Sets up official ts-rest client
- `utilities/fix_api_client.py` - Fixes existing apps with wrong clients

**Features:**
- Automatically discovers all contract files
- Generates proper `initClient` setup with contractsRouter
- Creates type-safe exports for TypeScript
- Provides backward compatibility with legacy code

### 2. Contract Metadata Extraction

Created a utility to parse ts-rest contracts and extract structured metadata for use by the FIS Writer.

**Key File:** `utilities/contract_metadata_extractor.py`

**Capabilities:**
- Parses contract files to extract methods and parameters
- Generates usage guides with correct syntax
- Validates FIS content against contracts
- Provides JSON metadata for programmatic use

**Usage Example:**
```bash
# Generate usage guide
python contract_metadata_extractor.py /path/to/contracts --format guide

# Validate FIS
python contract_metadata_extractor.py /path/to/contracts --format validate --fis-file fis.md
```

### 3. FIS Validation Tool ("Compiler")

Created a validation tool that acts like a compiler for the FIS, catching errors before they propagate.

**Key File:** `utilities/fis_validator.py`

**Features:**
- Validates all API calls against actual contracts
- Provides line-by-line error reporting
- Suggests corrections for common mistakes
- Calculates contract coverage percentage
- Generates detailed validation reports

**Validation Levels:**
- **Errors**: Wrong entity/method names
- **Warnings**: Incorrect parameter structure
- **Info**: Unused contract methods

### 4. Enhanced FIS Writer Prompts

Updated the FIS Writer to include contract metadata and usage examples directly in the prompt.

**Key File:** `agents/frontend_interaction_spec/user_prompt_enhanced.py`

**Enhancements:**
- Includes auto-generated usage examples
- Emphasizes exact contract compliance
- Provides correct ts-rest client patterns
- Shows proper response handling

### 5. Integration with Existing Libraries

Instead of custom solutions, we leverage established tools:

**For Contract Generation from OpenAPI:**
- `@openapi-ts-rest/core` - Generates ts-rest contracts from OpenAPI specs
- Available via npm: `npm i @openapi-ts-rest/core`

**For ts-rest Client:**
- `@ts-rest/core` - Official ts-rest client library
- Provides `initClient` for proper client initialization

## Implementation Guide

### Step 1: Fix Existing Apps

For apps with wrong API clients:
```bash
uv run python src/app_factory_leonardo_replit/utilities/fix_api_client.py /path/to/app
```

### Step 2: Validate FIS

Before using an FIS for frontend implementation:
```bash
uv run python src/app_factory_leonardo_replit/utilities/fis_validator.py \
  /path/to/fis.md /path/to/contracts
```

### Step 3: Generate Contract Metadata

For FIS Writers to understand contracts:
```bash
uv run python src/app_factory_leonardo_replit/utilities/contract_metadata_extractor.py \
  /path/to/contracts --format guide > contract-usage.md
```

## Pipeline Integration

### Build Stage Updates

The build stage now:
1. Generates ts-rest contracts first
2. Creates proper ts-rest client using `fix_api_client.py`
3. Validates FIS before frontend implementation
4. Uses contract metadata for better Writer prompts

### Writer-Critic Loop Enhancement

Critics now use:
- FIS Validator for objective validation
- Contract coverage metrics
- Structured error reporting

Writers receive:
- Specific line-by-line errors
- Suggested corrections
- Contract usage examples

## Benefits

### 1. Deterministic Generation
- API client generation is 100% deterministic
- No LLM hallucinations in critical infrastructure
- Reproducible builds

### 2. Early Error Detection
- Validation catches errors before implementation
- Line-by-line error reporting
- Actionable suggestions

### 3. Self-Healing
- Writers can fix specific errors from Critic feedback
- Validation provides exact corrections needed
- Convergence to working solution guaranteed

### 4. Contract Compliance
- Increased from 65% to potentially 100%
- Every API call validated against contracts
- Type safety throughout stack

## Configuration

All agents updated to use:
- **500+ max_turns** for convergence
- **TodoWrite/TodoRead** tools for task management
- **MCP tools** (oxc, tree_sitter, build_test) for validation

## Future Enhancements

1. **Auto-Fix System** - Automatically correct common FIS errors
2. **Contract Change Detection** - Re-validate FIS when contracts change
3. **Coverage Requirements** - Enforce minimum contract coverage
4. **Performance Optimization** - Cache contract metadata

## Summary

The FIS Enhancement System transforms the brittle FIS generation into a robust, deterministic process with:
- Proper ts-rest client generation
- Contract validation and metadata extraction
- Comprehensive error detection and reporting
- Self-healing through Writer-Critic loops

This ensures the pipeline can run autonomously with high success rates and minimal human intervention.