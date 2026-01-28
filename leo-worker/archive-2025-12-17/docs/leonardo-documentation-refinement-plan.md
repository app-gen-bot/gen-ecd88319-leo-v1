# Leonardo Documentation Refinement Plan

## Core Principle
Remove ALL content that isn't directly consumable by code generation agents. This includes business metrics, marketing copy, aspirational targets, and redundant sections.

## Changes to Make

### 1. **plan.md** Refinements
- **REMOVE**: Success Metrics section entirely
- **REMOVE**: "Outcomes" from Application Overview (business goals)
- **CONSOLIDATE**: Keep only Step 3 Feature List format, remove Step 2 (redundant)
- **SIMPLIFY**: Application Overview to just technical facts
- **REMOVE**: Specific database choice (MongoDB) - let the pipeline decide

### 2. **experience_rails.md** Refinements
- **REMOVE**: Performance target numbers (can't be enforced by generated code)
- **SIMPLIFY**: Loading messages to just placeholder text patterns
- **REMOVE**: Marketing copy from empty state messages
- **FOCUS**: Keep only UI behavior specifications

### 3. **user_journeys.md** Refinements
- **REMOVE**: Duration estimates and success rate targets
- **REMOVE**: Business metrics (percentages, dollar amounts)
- **REMOVE**: "Key Decision Points" and "Critical Success Factors" sections
- **KEEP**: Only the step-by-step flows for interaction mapping

### 4. **features.json** Refinements
- **REMOVE**: "complexity" ratings (subjective, not actionable)
- **REMOVE**: Performance metrics that can't be code-enforced
- **SIMPLIFY**: Keep only feature names, dependencies, and data requirements

### 5. **Page Brief** Refinements (HomePage.md, etc.)
- **REMOVE**: "Purpose" marketing descriptions
- **REMOVE**: SEO Requirements section
- **REMOVE**: Analytics Events section (unless agents generate tracking code)
- **REMOVE**: Performance Requirements that can't be enforced

## Refined Structure Example

**plan.md (simplified):**
```markdown
# Plan: Timeless Wedding Chapel

## Application
- **Type**: Wedding booking and streaming platform
- **Tech Stack**: Fullstack JavaScript (React + Express.js)
- **Core Function**: Book weddings, stream ceremonies, manage guests

## Features

### Now (MVP)
- [ ] Booking flow with calendar and time selection
- [ ] Package selection and customization
- [ ] Payment processing (deposit and full)
- [ ] Guest management and invitations
- [ ] Livestream broadcasting
- [ ] Content gallery for photos/videos
- [ ] Vendor marketplace
- [ ] Role-based dashboards (couple, vendor, venue_staff)

### Later
- [ ] Analytics dashboard
- [ ] Mobile applications
- [ ] Social media integration
- [ ] Multi-venue support
```

**user_journeys.md (simplified):**
```markdown
# User Journeys

## Couple Books Wedding
1. Land on homepage
2. Click "Get Started"
3. Select date and time
4. Create account
5. Select package
6. Customize theme
7. Add vendors (optional)
8. Add guests
9. Review booking
10. Enter payment
11. Receive confirmation
12. Access dashboard
```

## Benefits of Refinement
1. **Smaller documents** - Less tokens for agents to process
2. **No ambiguity** - Only actionable specifications
3. **No conflicts** - Removes business logic that might confuse generation
4. **Faster generation** - Agents don't parse irrelevant content
5. **Clearer intent** - Every line directly maps to generated code

## Implementation Order
1. Clean up plan.md first (highest impact)
2. Simplify user_journeys.md (removes business logic)
3. Refine features.json (remove subjective ratings)
4. Update experience_rails.md (focus on UI patterns only)
5. Streamline page briefs (remove SEO/analytics)