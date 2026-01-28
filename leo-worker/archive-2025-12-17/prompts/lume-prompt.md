# Lume - Longevity Knowledge & Protocol Generator

**App Name**: Lume

## Mission

Create a consumer web app that centralizes longevity and health optimization knowledge from reputable experts (Andrew Huberman, Peter Attia, David Sinclair, Rhonda Patrick, etc.), digests it into trustworthy, browsable content, and generates personalized, safety-aware protocol drafts based on user health history and goals.

**Critical**: This app does NOT provide medical advice. All protocol drafts include clear disclaimers, sources, and encourage clinician review.

## Generation Instructions

**IMPORTANT**: This is a complex application with multiple interconnected systems. Use subagents liberally throughout the generation process to:
- Research and plan complex features (content management, protocol generation logic, search implementation)
- Design and validate the data model for relationships between experts, content, topics, and protocols
- Implement safety and validation logic (red-flag detection, contraindication checking)
- Create comprehensive UI components with proper accessibility
- Validate API contracts and ensure proper error handling
- Generate thorough test coverage for critical safety features

Break down complex tasks into smaller, manageable pieces and delegate to specialized subagents when appropriate.

## Core Features

### 1. Content Management System
- **Expert Directory**: Track longevity/health experts with profiles, credentials, and content sources
- **Content Ingestion**: Store and manage content metadata from videos, podcasts, articles, and social posts
- figure out how we can download youtube transcripts, even if we have to run ngrok or whatever proxy service. We need that data for sure
  - Source URL, title, publish date, expert, content type
  - Transcript/summary text
  - Topics and tags
- **Topic Taxonomy**: Predefined health topics (sleep, fasting, creatine, Zone 2 cardio, photobiomodulation, supplements, exercise protocols, nutrition, etc.)
- **Manual Content Entry**: Admin interface to add/edit expert content with metadata

### 2. Knowledge Base & Search
- **Browse by Topic**: View all content organized by health topics
- **Browse by Expert**: Filter content by specific expert
- **Search**: Full-text search across content titles, summaries, and transcripts
- **Content Filters**: Filter by content type (video, podcast, article), date range, expert, topic
- **Content Detail View**: Display content with:
  - Source information and link
  - Full transcript/summary
  - Tagged topics
  - Key claims/takeaways (extracted snippets)
  - Referenced studies/citations (if available)

### 3. Topic Pages (Explainers)
- **Auto-generated Topic Summaries**: For each major topic, display:
  - Overview and key takeaways
  - Common protocol ranges (informational only)
  - Evidence snapshot (types of studies mentioned)
  - Known risks and contraindications
  - Embedded citations with links to source content
- **Compare View**: Side-by-side comparison of different experts' perspectives on the same topic

### 4. User Profile & Goals
- **User Onboarding**: Collect user information:
  - Health goals (improve sleep, increase VO2max, blood glucose control, muscle gain, stress management, etc.)
  - Current health status (optional): medications, conditions, allergies
  - Preferences: dietary restrictions, supplement tolerance, budget constraints
- **Profile Management**: Users can update their goals and health information
- **Privacy Controls**: Users can export or delete their data

### 5. Personalized Protocol Drafts
- **Protocol Generator**: Based on user profile, generate a structured protocol draft including:
  - Sleep optimization strategies
  - Exercise recommendations
  - Nutritional guidance
  - Supplement suggestions with dosage ranges
  - Lifestyle interventions (light exposure, sauna, cold exposure, etc.)
- **Each Protocol Item Includes**:
  - Purpose and expected benefit
  - Suggested ranges/tiers (NOT prescriptive)
  - Timing and frequency
  - Interactions and contraindications
  - Links to source content with evidence level
  - Alternative options
- **Safety Features**:
  - Red-flag detection (pregnancy, anticoagulants, renal/hepatic issues, drug interactions)
  - Automatic suppression or warning for risky suggestions
  - Prominent disclaimers throughout
  - Guidance to consult healthcare provider
- **Export Options**:
  - PDF download of protocol
  - Shareable clinician handout with sources

### 6. Trust & Safety Layer
- **Citations Everywhere**: Every claim links back to:
  - Expert name
  - Content source with timestamp (if video/podcast)
  - Transcript snippet
  - External study references (when available)
- **Evidence Grading**: Simple quality indicators (A-D or High/Medium/Low)
- **Disclaimers**: Prominent throughout the app:
  - "Educational use only - not medical advice"
  - "Consult your healthcare provider before starting any protocol"
  - User consent on signup
- **Content Quality**: Mark content by evidence level (expert opinion, human trial, animal study, mechanistic, etc.)

### 7. Admin Features
- **Content Management**: CRUD operations for experts, content, topics
- **User Management**: View user statistics (anonymized)
- **Content Moderation**: Flag or remove low-quality content
- **Ingestion Queue**: View/manage pending content for review

## User Flows

### First-Time User
1. Landing page explains the app purpose with clear disclaimer
2. Sign up with email/password
3. Consent to terms and privacy policy
4. Onboarding wizard:
   - Select health goals (multi-select)
   - Add medications/conditions (optional)
   - Set preferences
5. Guided tour of key features
6. Personalized dashboard with relevant topics

### Browsing Content
1. User navigates to Browse or Search
2. Apply filters (topic, expert, content type)
3. Click content card to view details
4. Read transcript, view citations, explore related topics
5. Bookmark or share content

### Generating a Protocol
1. User goes to "My Protocol" or "Generate Protocol"
2. Review/update profile and goals
3. Click "Generate Protocol Draft"
4. Review structured protocol with categories:
   - Sleep, Exercise, Nutrition, Supplements, Lifestyle
5. Expand each item to see details, risks, sources
6. See warnings if red flags detected
7. Export as PDF or share with clinician

### Topic Exploration
1. Browse Topic Pages
2. Select a topic (e.g., "Creatine Supplementation")
3. View auto-generated explainer with:
   - Summary
   - Expert perspectives
   - Protocol ranges
   - Studies and evidence
   - Risks
4. Compare views from different experts
5. See related topics

## Technical Requirements

### Data Model
- **Users**: id, email, password_hash, created_at, profile (JSON: goals, medications, conditions, preferences)
- **Experts**: id, name, bio, credentials, website, social_links, specialty
- **Content**: id, expert_id, source_url, title, content_type, publish_date, transcript, summary, topics (array), evidence_level, created_at
- **Topics**: id, name, slug, description, category
- **Claims**: id, content_id, claim_text, timestamp, evidence_level, topics (array)
- **Protocols**: id, user_id, generated_at, protocol_data (JSON), goals, warnings
- **Studies**: id, title, authors, journal, year, pmid, doi, url, abstract

### Authentication & Privacy
- Email/password authentication
- Encrypted sensitive user data at rest
- User data export capability
- User data deletion capability
- Session management with secure tokens

### UI/UX Requirements
- Modern, clean design with excellent readability
- Mobile-responsive (mobile-first approach)
- Accessible (WCAG AA standards)
- Fast search with instant results
- Clear visual hierarchy
- Prominent disclaimers (not hidden)
- Easy navigation between content, topics, and protocols

### Safety & Compliance
- Disclaimer on every page footer
- Explicit "not medical advice" warnings on protocol pages
- Red-flag rules for common dangerous interactions
- Content quality indicators visible
- Required user consent on signup
- Privacy policy and terms of service pages

## Phase 1 Scope (MVP)

### Must-Have Features
1. User authentication and profile management
2. Admin interface to manage 4-6 flagship experts
3. Manual content entry for ~20-30 pieces of content per expert
4. Topic pages for top 20 topics (sleep, exercise, creatine, Zone 2, sauna, cold, protein, fasting, etc.)
5. Search and filter interface
6. Content detail pages with citations
7. Protocol generator for 5 common goals (sleep, metabolic health, muscle, cardio, stress)
8. Safety warnings and disclaimers
9. PDF export of protocols
10. User data export and deletion

### Nice-to-Have (Future Phases)
- Automatic content ingestion via APIs
- Study database with PubMed integration
- Contradiction detection across expert opinions
- Wearable integration (Apple Health, Oura)
- Clinician portal for protocol review
- Community features (comments, ratings)
- Multi-language support

## Acceptance Criteria

1. **Content Browsing**: User can search for "creatine" and find relevant content from multiple experts with working filters
2. **Traceability**: Every claim on a topic page links to its source content with transcript location
3. **Protocol Generation**: User completes profile and generates a multi-category protocol draft with citations
4. **Safety**: When user enters "on warfarin" in profile, protocol flags or removes supplements with bleeding risk
5. **Export**: User can download protocol as PDF and export personal data from settings
6. **Disclaimers**: Every protocol page shows clear "not medical advice" disclaimer
7. **Privacy**: User can delete account and all associated data

## Design Guidance

- Use calming, professional color palette (blues, greens, neutrals)
- Emphasize trustworthiness with clear typography and generous whitespace
- Make citations and sources highly visible (not buried)
- Use card-based layouts for content browsing
- Implement tag clouds or topic visualization
- Show evidence levels with clear visual indicators (badges or icons)
- Protocol drafts should look like professional documents, not casual recommendations

## Tech Stack Preferences

- Modern React frontend with TypeScript
- RESTful API backend
- PostgreSQL database
- Full-text search capability
- PDF generation library
- Secure authentication system
- Data encryption at rest

## Key Reminders

- **No medical advice**: This is educational content aggregation and protocol ideation, NOT diagnosis or treatment
- **Safety first**: When in doubt, warn the user and prompt to consult a clinician
- **Transparency**: Every claim must be traceable to its source
- **Privacy**: User health data is sensitive - encrypt, minimize, and allow deletion
- **Accessibility**: Health information should be available to everyone, regardless of ability

## App Name

**Lume** - Illuminating the path to longevity and optimal health through aggregated expert knowledge and personalized protocol generation.
