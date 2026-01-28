# Slack Clone Implementation Plan

This plan reflects the streamlined "prompt to URL" approach for manually building the Slack clone as an example 
implementation for AppFactory.

## Overview

The Slack clone serves as the first manual implementation to discover patterns and workflows that AppFactory will 
eventually automate. We're building it to learn how the factory should work.

## Phase 1: Orchestrator Conversation ✓ COMPLETE

- Created streamlined single-exchange conversation
- User provides only team size (50 people)
- System infers all common Slack features
- Feature specifications reference documents hidden implementation details

## Phase 2: Automatic Spec Generation

From the orchestrator output, generate:

### Product Requirements Document (PRD)
- Based on the feature checkboxes from orchestrator
- User personas inferred from "company" mention
- Acceptance criteria derived from feature specs reference
- No user input needed

### Technical Design Document (TDD)
- API endpoints auto-generated from features
- Data models derived from Slack patterns
- Architecture follows mandated stack
- Uses feature specifications reference as guide

## Phase 3: Rapid Wireframe Creation

Build working Next.js application with:
- Complete UI shell (sidebar, main chat, header)
- Stubbed but interactive data
- All checked features visible in UI
- Dark mode by default
- Deploy to temporary URL for testing
- Target: Under 5 minutes from specs to wireframe

## Phase 4: Full Implementation

Using the wireframe as base:
- Implement FastAPI backend following TDD
- Connect real-time WebSocket features
- Add authentication (Google OAuth + local)
- Implement data persistence
- Deploy to AWS using CDK
- All guided by feature specifications reference

## Phase 5: Pattern Documentation

Document for AppFactory automation:

### Inference Patterns
- How "Slack" → channels, DMs, files, search
- How team size → performance requirements
- How "company" → Google OAuth preference
- Default feature selections

### Code Generation Templates
- Frontend component patterns
- Backend endpoint patterns
- WebSocket implementation patterns
- Authentication flows

### Deployment Patterns
- CDK construct compositions
- Environment configurations
- Monitoring setup

## Success Metrics

1. **Speed**: Orchestrator to wireframe in <5 minutes
2. **Inference Accuracy**: 80% of features correctly assumed
3. **User Satisfaction**: Minimal back-and-forth required
4. **Pattern Discovery**: Clear templates for automation

## Key Differences from Traditional Approach

- No lengthy requirements gathering
- No technical decision points for users
- Specs generated FROM conversation, not before
- Wireframe is real code, not mockups
- Implementation follows inference patterns

This approach validates the "prompt to URL" philosophy while building a real, useful application.