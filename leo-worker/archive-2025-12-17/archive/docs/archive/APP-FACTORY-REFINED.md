# AppFactory: Automated Web Application Generation System

## Overview

AppFactory is an intelligent system that generates full-stack enterprise-grade web applications from user ideas through
an automated, conversational process.

## Core Philosophy: "Prompt to URL"

The fundamental principle of AppFactory is to minimize the distance between a user's idea and a working application. 
Users should go from their initial prompt to a deployed URL in the shortest time possible, with minimal input required.

## Core Workflow

### 1. Idea Submission

Users submit their application idea through the AppFactory web interface. For example: "I'd like to create an open
source version of Slack for my company."

### 2. Orchestrator Refinement

An intelligent orchestrator engages in a streamlined conversation with the user to:

- Display real-time understanding via concise summaries (Twitter-style)
- Ask only essential questions (typically just team size)
- Present pre-selected features based on intelligent inference
- Show the most commonly-used features with opt-out checkboxes
- Complete refinement in a single exchange when possible

### 3. Specification Generation

Based on the refined user description, the system agentically creates:

- Detailed product specifications
- Technical design documents
- Research on unknown aspects of the requirements

### 4. Interactive Wireframe Creation

#### Key Innovation: WYSIWYG Approach

- Generates a working, high-level wireframe application rapidly
- Users can interact with actual functionality using stubbed data
- Wireframe is a real Next.js application, not just mockups
- Changes made to the wireframe propagate back to specifications

#### Technical Evolution

- **Initial approach**: Single React component (example: Zenith project)
- **Current approach**: Full Next.js application from the start
- **Implementation**: Frontend init script/tool that generates default application in seconds via unzipping

#### User Interface Design

- **Left pane (75%)**: Interactive wireframe display
- **Right pane (25%)**: Feedback and editing interface
- Users can click through, experience behavior, and request modifications

### 5. Implementation Generation

Once the user approves the wireframe ("make it so" button):

- AppFactory generates the complete implementation from product specs
- Code is created following mandated patterns and tech stacks
- Application is deployed to AWS
- User receives a URL to their working application

## Architecture Principles

### Convention over Configuration

- Users never see technical choices
- All applications use the mandated stack
- Deployment is automatic and opaque
- Smart defaults eliminate decision fatigue

### Top-Down Modular Decomposition

- Maintains manageable context
- Creates focused, specific tasks
- Breaks down specs, design, and implementation along natural domain boundaries

### Mandated Technology Stacks

#### Frontend Stack

- Next.js 14 with app router
- React 18
- ShadCN UI components
- Tailwind CSS
- *Note: Tech stack documentation maintained separately to prevent rewriting*

#### Backend Stack

- Python 3.12
- FastAPI framework
- Containerized architecture
- Deployable on AWS Fargate or any container platform

#### Deployment Stack

- AWS CDK (Cloud Development Kit)
- L3 constructs preferred (highest abstraction)
- L2 constructs as fallback
- Custom L3 patterns for reusable components
- Benefits: Deterministic LLM behavior, focused decision space
- Black-box deployment: Users only receive the final URL

### Natural Domain Separation

Web applications are decomposed into:

- Frontend (user interface and interactions)
- Backend (business logic and data management)
- Infrastructure (deployment and operations)

## Self-Healing Capabilities

### Error Correction System

- Lambda functions monitor application logs via CloudWatch
- Automated detection of backend errors
- Potential frontend error streaming via WebSocket connection
- Automated code corrections on separate branches
- Generates pull requests or bug reports for fixes
- Provides users with updated URLs for corrected versions

## Implementation Strategy

### Manual Phase (Current)

1. Create Slack clone application manually
2. Document all prompts, processes, and workflows
3. Use Zenith application as reference (without bias)
4. Track patterns and best practices

### Automation Phase (Future)

- Convert documented processes into fully automatic agentic system
- Enable complete hands-off application generation
- Maintain quality and consistency through proven patterns

## Key Features Summary

1. **Minimal Input Required**: Single question conversations with smart inference
2. **Real-time Understanding**: Live Twitter-style summaries show system comprehension
3. **Conversational Requirements Gathering**: Natural language interaction with intelligent refinement
4. **Rapid Prototyping**: Working wireframes in seconds, not static mockups
5. **WYSIWYG Development**: What users see and modify is what they get
6. **Bi-directional Sync**: Wireframe changes update specifications automatically
7. **Full-Stack Generation**: Complete frontend, backend, and infrastructure code
8. **Automated Deployment**: One-click deployment to production AWS environment
9. **Self-Healing**: Automatic error detection and correction
10. **Standardized Stack**: Consistent, modern technology choices for reliability
11. **Zero Configuration**: No technical decisions exposed to end users

## Future Enhancements

- Enhanced frontend error capture and streaming
- More sophisticated error correction strategies
- Expanded deployment options beyond AWS
- Additional framework support while maintaining standardization