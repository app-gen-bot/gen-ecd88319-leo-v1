#!/bin/bash

# Script to run The Plug music registration platform through AI App Factory

echo "🎵 Starting AI App Factory for The Plug - Music Registration Platform"
echo "=================================================================="

# The PRD content with proper escaping
PROMPT_CONTENT='Please use the following PRD as the Business PRD for this project. Save it as needed and proceed with generating the interaction specification and subsequent stages.

===== BUSINESS PRD =====
# Product Requirements Document: The Plug
## Autonomous Music Registration Platform

**Version:** 1.1  
**Date:** July 18, 2025  
**Status:** Draft (Revised - API-First Approach)  
**Author:** Product Team  

---

## 1. Executive Summary

### Product Vision
The Plug is an autonomous music registration platform that enables independent artists to register their music across all major rights organizations, distribution platforms, and copyright offices through a single upload. Starting with API-based integrations for reliability and speed, the platform will progressively add AI-powered browser automation to cover platforms without APIs.

### Problem Statement
Independent musicians must currently register their music across 7+ different platforms to properly protect their rights and collect all available royalties. This process typically takes 4-6 hours per song and requires understanding complex legal and technical requirements. Many artists miss out on significant revenue by failing to complete all necessary registrations.

### Solution
An intelligent platform that starts with reliable API integrations where available, then progressively adds browser automation for comprehensive coverage. Artists upload once, and The Plug handles all registrations automatically through the most efficient method available.

### Success Criteria
- Phase 1: Achieve 99% successful registration rate for API-based platforms
- Phase 2: Achieve 90% successful autonomous registration rate for browser-automated platforms
- Reduce total registration time from 4-6 hours to under 10 minutes of artist effort
- Register music across all 7 critical platforms within 24 hours

---

## 2. Platform Integration Strategy (Revised)

### 2.1 API-First Platforms (Phase 1 Priority)

**Tier 1: Direct API Access**
1. **The MLC (Mechanical Licensing Collective)**
   - Beta API available
   - Bulk data feeds via DDEX BWARM
   - CSV upload capabilities
   - Most developer-friendly platform

2. **Distribution Partners with APIs**
   - Partner with aggregators that provide APIs
   - FUGA, Symphonic Distribution, STEM
   - These give indirect access to Spotify, Apple Music, etc.

3. **SoundExchange**
   - MDX API (requires approval)
   - Repertoire search capabilities
   - Limited but functional

**Tier 2: Semi-Automated (Bulk Upload)**
1. **MusicMark** (for PRO registrations)
   - Bulk CWR file upload
   - Requires publisher account
   - Covers ASCAP, BMI registration

### 2.2 Browser Automation Platforms (Phase 2)

**High Priority (No API Alternative)**
1. **US Copyright Office**
   - Zero API access
   - Critical for legal protection
   - Complex multi-page forms

2. **PRO Direct Registration**
   - ASCAP web portal
   - BMI web portal  
   - SESAC web portal

**Distribution Platforms (if no partner API)**
- DistroKid
- TuneCore
- CD Baby
- UnitedMasters

---

## 3. Core Features & User Stories (Revised Priority)

### 3.1 Phase 1: API-Based Features (MVP - Months 1-3)

#### Feature 1: MLC Integration
**User Story:** As an artist, I want my mechanical rights automatically registered with the MLC so I can collect streaming royalties.

**Technical Implementation:**
```javascript
// MLC API Integration
class MLCService {
  async registerWork(workData) {
    const mlcWork = {
      title: workData.title,
      iswc: workData.iswc,
      creators: this.formatCreators(workData.writers),
      publishers: this.formatPublishers(workData.publishers)
    };
    
    return await this.mlcClient.works.create(mlcWork);
  }
}
```

**Acceptance Criteria:**
- Automatic ISWC generation if not provided
- Bulk upload for catalogs
- Real-time registration status
- Match sound recordings to musical works

#### Feature 2: Distribution Partner Integration
**User Story:** As an artist, I want my music distributed to all major platforms through reliable API connections.

**Technical Implementation:**
- OAuth2 integration with distribution partners
- Standardized metadata mapping
- DDEX format compliance
- Automated ISRC assignment

#### Feature 3: SoundExchange Integration
**User Story:** As an artist, I want my recordings registered with SoundExchange for digital performance royalties.

**Implementation:**
- MDX API integration (post-approval)
- Repertoire data submission
- Rights owner designation

#### Feature 4: Bulk PRO Registration via MusicMark
**User Story:** As an artist, I want my compositions registered with my PRO without manual form filling.

**Implementation:**
- CWR 2.2 format generation
- Automated file submission
- Registration tracking

### 3.2 Phase 2: Browser Automation Features (Months 4-6)

#### Feature 5: Copyright Office Automation
**User Story:** As an artist, I want my copyright registrations filed automatically without navigating the eCO portal.

**Browser Automation Requirements:**
- Form PA/SR navigation logic
- Multi-file upload handling
- Payment processing integration
- Certificate retrieval

#### Feature 6: Direct PRO Portal Automation
**User Story:** As an artist without publisher access, I want direct PRO registration through web portals.

**Implementation:**
- Playwright-based form filling
- Session management
- Error recovery workflows

### 3.3 Core Features (All Phases)

#### Intelligent Upload System
**User Story:** As an artist, I want to upload my song once with smart metadata extraction and validation.

**Technical Requirements:**
- Audio fingerprinting for duplicate detection
- Metadata extraction and enrichment
- Format validation and conversion
- Conditional fields based on work type

#### Unified Dashboard
**User Story:** As an artist, I want to see all my registrations across platforms in one place.

**Components:**
- Registration status matrix
- Platform-specific deep links
- Revenue tracking projections
- Missing registration alerts

#### Human-in-the-Loop System
**User Story:** As a support agent, I want to handle edge cases when automation fails.

**Implementation:**
- Automatic escalation rules
- Context preservation
- Resolution tracking
- Feedback loop for improvement

---

## 4. Technical Architecture (Revised)

### 4.1 API-First Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Portal    │     │   Mobile Apps   │     │   Public API    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     API Gateway         │
                    │  (Rate Limiting, Auth)  │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐  ┌──────────▼──────────┐  ┌────────▼────────┐
│  User Service   │  │  Upload Service     │  │ Metadata Service │
│   (Cognito)     │  │  (S3 + Lambda)      │  │  (Enrichment)    │
└─────────────────┘  └───────────────────────┘  └─────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Registration Service   │
                    │    (Orchestrator)       │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐  ┌──────────▼──────────┐  ┌────────▼────────┐
│   API Manager   │  │  Browser Manager    │  │  Human Queue     │
│  (Direct APIs)  │  │ (Playwright Cluster)│  │   Manager        │
└────────┬────────┘  └───────────────────────┘  └─────────────────┘
         │
         ├─── MLC API Client
         ├─── Distribution Partner APIs  
         ├─── SoundExchange MDX
         └─── MusicMark Bulk Upload
```

### 4.2 Registration Priority Logic

```javascript
class RegistrationOrchestrator {
  async registerWork(workData) {
    // Phase 1: API-based registrations (fast, reliable)
    const apiTasks = [
      { service: '"'"'MLC'"'"', method: '"'"'api'"'"', priority: 1 },
      { service: '"'"'DistributionPartner'"'"', method: '"'"'api'"'"', priority: 1 },
      { service: '"'"'SoundExchange'"'"', method: '"'"'api'"'"', priority: 2 },
      { service: '"'"'PRO'"'"', method: '"'"'bulk'"'"', priority: 2 }
    ];
    
    // Phase 2: Browser automation (slower, less reliable)
    const browserTasks = [
      { service: '"'"'CopyrightOffice'"'"', method: '"'"'browser'"'"', priority: 3 },
      { service: '"'"'PRODirect'"'"', method: '"'"'browser'"'"', priority: 4 }
    ];
    
    // Execute API tasks first for quick wins
    await this.executeApiRegistrations(apiTasks, workData);
    
    // Then browser automation for comprehensive coverage
    await this.queueBrowserRegistrations(browserTasks, workData);
  }
}
```

### 4.3 Data Architecture

**API Integration Tracking**
```sql
-- Platform API Configuration
api_platforms (
  id, 
  name, 
  base_url, 
  auth_type, 
  rate_limits,
  retry_policy
);

-- API Credentials
api_credentials (
  id,
  user_id,
  platform_id,
  api_key_encrypted,
  api_secret_encrypted,
  refresh_token,
  expires_at
);

-- API Call Logging
api_calls (
  id,
  platform_id,
  endpoint,
  method,
  request_body,
  response_code,
  response_body,
  duration_ms,
  created_at
);
```

---

## 5. Revised Implementation Timeline

### 5.1 Phase 1: API Platform MVP (Months 1-3)

**Month 1: Foundation + MLC**
- Week 1-2: Infrastructure setup, API framework
- Week 3-4: MLC API integration complete

**Month 2: Distribution + SoundExchange**
- Week 1-2: Distribution partner API integration
- Week 3-4: SoundExchange MDX integration

**Month 3: PRO Bulk + Dashboard**
- Week 1-2: MusicMark CWR bulk upload
- Week 3-4: Dashboard, testing, MVP launch

**Deliverable:** Working platform that handles 60% of registrations via APIs

### 5.2 Phase 2: Browser Automation (Months 4-6)

**Month 4: Framework + Copyright**
- Week 1-2: Browser automation framework
- Week 3-4: Copyright Office agent

**Month 5: PRO Direct**
- Week 1-2: ASCAP/BMI portal agents
- Week 3-4: SESAC, error handling

**Month 6: Distribution Portals**
- Week 1-2: DistroKid, TuneCore agents
- Week 3-4: CD Baby, optimization

**Deliverable:** Comprehensive platform covering 95% of registration needs

### 5.3 Phase 3: Scale & Optimize (Months 7-9)

- International platform support
- Advanced analytics
- White-label offering
- Enterprise features

---

## 6. Success Metrics (Revised)

### 6.1 Phase 1 Metrics (API-Based)
- API registration success rate > 99%
- Average API registration time < 30 seconds
- Zero human intervention for API platforms
- API uptime > 99.9%

### 6.2 Phase 2 Metrics (Browser Automation)
- Browser registration success rate > 90%
- Human intervention rate < 10%
- Platform change adaptation < 48 hours
- Cost per browser registration < $0.50

### 6.3 Overall Business Metrics
- Customer satisfaction > 4.5/5
- MRR growth > 20% month-over-month
- Churn rate < 5% monthly
- CAC:LTV ratio > 1:3

---

## 7. Risk Mitigation (Revised)

### 7.1 API-Specific Risks

**Risk:** API rate limiting
- **Mitigation:** Implement intelligent queuing, backoff algorithms, multiple API keys

**Risk:** API deprecation/changes
- **Mitigation:** Version detection, automatic fallback to browser automation

**Risk:** Limited API functionality
- **Mitigation:** Hybrid approach - API for core features, browser for advanced

### 7.2 Progressive Enhancement Strategy

Start with highest-reliability integrations:
1. Direct APIs (99% reliability)
2. Bulk upload APIs (95% reliability)
3. Partner APIs (90% reliability)
4. Browser automation (85% reliability)
5. Human fallback (100% reliability)

---

## 8. MVP Definition (Revised)

### 8.1 True MVP (Month 1)
Launch with just MLC API integration:
- Single platform that works perfectly
- Prove the value proposition
- Generate early revenue
- Build user trust

### 8.2 Expanded MVP (Month 3)
Add remaining API platforms:
- Distribution partner integration
- SoundExchange (if approved)
- PRO bulk upload
- Basic dashboard

### 8.3 Full Product (Month 6)
Complete coverage via browser automation:
- Copyright Office
- Direct PRO portals
- All distribution platforms
- International support

---

## 9. Competitive Advantages

### 9.1 Technical Advantages
- **Reliability First:** API integrations before browser automation
- **Progressive Enhancement:** Always have a working solution
- **Intelligent Routing:** Use the best method available per platform
- **Graceful Degradation:** Fallback options at every level

### 9.2 Business Advantages
- **Faster Time to Market:** Launch with APIs in 1 month vs 3
- **Lower Initial Costs:** No browser infrastructure needed at start
- **Higher Reliability:** 99% success rate builds trust
- **Easier Partnerships:** "We use your official APIs"

---

## 10. Key Decisions

### 10.1 Decided
- API-first approach for faster, more reliable MVP
- MLC as first integration (best API, critical functionality)
- Progressive enhancement strategy
- Browser automation in Phase 2

### 10.2 Open Questions
1. Which distribution partner API to integrate first?
2. Should we apply for SoundExchange MDX access immediately?
3. Build vs buy browser automation framework?
4. Pricing strategy for API-only vs full platform?

---

**Document Control**
- Major Revision: API-First Approach
- Review Cycle: Bi-weekly
- Approval Required: Product, Engineering, Legal
- Next Review: August 1, 2025
===== END OF PRD ====='

# Run the command
uv run python -m app_factory.main_v2 \
    --user-prompt "$PROMPT_CONTENT" \
    --app-name "theplug" \
    --skip-questions \
    --iterative-stage-1

echo ""
echo "✅ Pipeline completed!"
echo "Check the output in: apps/theplug/"