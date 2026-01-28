# App Generator Prompts

This directory contains comprehensive prompt files for generating complete applications using the app-factory pipeline.

---

## NaijaDomot Real Estate Marketplace

**File**: `naijadomot-real-estate-marketplace.md`

**Run Script**: `../../run-naijadomot.sh`

### Overview

A modern property marketplace for Nigeria where users can rent, buy, or sell properties. Features multiple user roles (Buyers, Agents, Landlords, Admins) with role-specific dashboards and capabilities.

### Key Features

1. **Multi-Role Authentication**
   - Buyer/Renter, Agent, Landlord, Admin roles
   - Email + password with MFA
   - Role-based access control

2. **Property Listing Management**
   - Create/edit/delete listings
   - Upload 10-20 photos per listing
   - Video upload support
   - Rich property details (bedrooms, bathrooms, amenities, etc.)
   - Geolocation with interactive map

3. **Interactive Map Integration**
   - Property pins on Google Maps/MapBox/OpenStreetMap
   - Street view integration
   - Polygon search (optional)
   - Accurate geolocation for Lagos/Abuja/Port Harcourt

4. **Analytics Dashboards**
   - Agent analytics (views, inquiries, performance)
   - Admin analytics (platform metrics, user growth, regional activity)
   - Basic traffic source tracking

5. **Property Verification Workflow**
   - Admin verification interface
   - Status management (Verified/Unverified/Pending)
   - Document uploads
   - Field verifier assignment

6. **Inquiry & Lead Management**
   - Buyer inquiry system
   - Agent inbox for leads
   - Save favorites
   - Lead tracking and status updates

7. **Mobile-Responsive, SEO-Optimized UI**
   - Next.js with SSR
   - Fast load times
   - Clean, modern design
   - Mobile-first responsive

### Development Approach

**CRITICAL: Mock-First Strategy**

The prompt emphasizes a two-phase development approach:

**Phase 1: Mock/Memory Development (PRIORITY)**
- Build ALL features with mock authentication and in-memory storage
- Validate complete functionality end-to-end
- Test all user flows and features
- Environment: `AUTH_MODE=mock`, `STORAGE_MODE=memory`

**Phase 2: Supabase Migration (AFTER Phase 1)**
- Migrate to Supabase ONLY after all features are validated
- Real authentication and PostgreSQL database
- Re-test all features with production database
- Environment: `AUTH_MODE=supabase`, `STORAGE_MODE=supabase`

**Why This Approach:**
- Faster iteration during development
- No wasted infrastructure for broken features
- Full offline testing
- Easy rollback if database issues occur

### Research Requirements

The prompt includes instructions to use the research agent for:
- Map integration best practices
- Media optimization strategies (photos/videos)
- Analytics implementation patterns
- Verification workflow approaches

### Tech Stack

**Frontend:**
- Next.js 14+ (App Router for SSR)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- Map library (Google Maps/MapBox/OpenStreetMap)

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (via Supabase in Phase 2)
- Drizzle ORM
- ts-rest API contracts
- AWS S3 / Cloudinary for media (Phase 2)

### How to Run

```bash
# Make script executable (if not already)
chmod +x run-naijadomot.sh

# Run the generator
./run-naijadomot.sh
```

The script will:
1. Generate the app with autonomous reprompter (25 iterations)
2. Disable prompt expansion (--no-expand)
3. Create app in `apps/naijadomot/app`

### After Generation

```bash
cd apps/naijadomot/app
npm install
npm run dev
```

Test with mock credentials:
- Buyer: `buyer@naijadomot.ng` / `Demo2025_`
- Agent: `agent@naijadomot.ng` / `Demo2025_`
- Landlord: `landlord@naijadomot.ng` / `Demo2025_`
- Admin: `admin@naijadomot.ng` / `Demo2025_`

---

## Creating New Prompts

### Best Practices

1. **Research First**: Include instructions to use research agent for unknown elements
2. **Mock-First Development**: Emphasize building with mock/memory before database migration
3. **Phased Approach**: Break complex apps into phases with clear deliverables
4. **Clear Requirements**: Specify all features, user roles, and technical requirements
5. **Success Criteria**: Define what "complete" looks like for each phase
6. **Tech Stack**: Specify preferred technologies and architecture

### Prompt Structure

A comprehensive prompt should include:

1. **Development Approach**: Mock-first strategy, research requirements
2. **Project Overview**: High-level description and goals
3. **Core Features**: Detailed feature specifications
4. **User Roles & Authentication**: All user types and permissions
5. **UI/UX Requirements**: Design principles, responsiveness, performance
6. **Backend Architecture**: Tech stack, API design, security
7. **Database Schema**: High-level table structure
8. **Development Phases**: Clear phase breakdown with deliverables
9. **Success Criteria**: How to know each phase is complete
10. **Final Deliverables**: What should be delivered at the end

### Example Template

```markdown
# [App Name] - Complete Specification

## CRITICAL: Development Approach
- Mock-first strategy
- Research requirements

## Project Overview
- High-level description

## Core Features (Phase 1 - Mock/Memory)
- Feature 1
- Feature 2
- ...

## User Roles & Authentication
- Role definitions
- Mock credentials

## [Additional Sections]
...

## Development Phases
### Phase 1: Mock/Memory
- Deliverables
- Testing requirements

### Phase 2: Database Migration
- Migration steps
- Validation

## Success Criteria
- Phase 1 complete when...
- Phase 2 complete when...

## Final Deliverables
- What to deliver
```

---

## Prompt Files vs Command-Line Prompts

**Use Prompt Files When:**
- Complex, multi-feature applications
- Detailed requirements and specifications
- Need to preserve exact formatting and newlines
- Want to track prompt versions in git
- Sharing prompts with team members

**Use Command-Line Prompts When:**
- Simple one-liner requests
- Quick modifications to existing apps (--resume)
- Testing or prototyping

---

## Running with Prompt Files

**New App:**
```bash
uv run python run-app-generator.py \
  --app-name my-app \
  --prompt-file docs/prompts/my-app-spec.md \
  --no-expand \
  --reprompter-mode autonomous \
  --max-iterations 25
```

**Resume Existing App:**
```bash
uv run python run-app-generator.py \
  --resume apps/my-app/app \
  --prompt-file docs/prompts/modifications.md \
  --reprompter-mode autonomous \
  --max-iterations 10
```

---

## Parameters Explained

- `--app-name`: Required for new apps, directory name
- `--prompt-file`: Path to markdown prompt file
- `--no-expand`: Disable automatic prompt expansion (use raw prompt)
- `--reprompter-mode`:
  - `interactive`: Manual prompts each iteration
  - `confirm_first`: Reprompter suggests, you confirm
  - `autonomous`: Fully automatic for N iterations
- `--max-iterations`: How many autonomous iterations (default: 10)
- `--resume`: Path to existing app to modify

---

## Tips

1. **Start Comprehensive**: Include all requirements upfront in the prompt file
2. **Research Unknown Elements**: Always include research agent instructions for unfamiliar tech
3. **Mock-First Always**: Build and validate features before database migration
4. **Test Iteratively**: Use quality_assurer agent after each major feature
5. **Visual Validation**: Take screenshots to verify UI renders correctly
6. **Document Decisions**: Track technology choices and architecture decisions in the prompt

---

**Last Updated**: 2025-11-22
