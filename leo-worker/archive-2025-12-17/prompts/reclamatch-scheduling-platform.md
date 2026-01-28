# ReclaMatch - Intelligent Team Scheduling Platform

You are tasked with building ReclaMatch - an intelligent team scheduling platform for Reclaim Protocol's sales team. This is similar to Calendly but with smart routing based on business areas rather than individual calendars.

## CORE REQUIREMENTS

### User-Facing Booking Flow
1. **Area Selection**: Users first select their area of interest from:
   - Loyalty Programs
   - Ecommerce
   - Lending
   - DeFi
   - Academic & Employment Credentials
   - Web3 zkTLS
   - Other/General

2. **Information Display**: Show relevant Reclaim Protocol resources/content for the selected area while they book

3. **Booking Form**: Collect:
   - Full Name (required)
   - Organization (required)
   - Email (required)
   - Purpose of Meeting (required, textarea)
   - Meeting Duration: 15 min or 30 min (radio select)

4. **Calendar Display**: Show merged availability from 1-2 assigned POCs for that area
   - Display next 14 days of availability
   - Show available time slots in user's timezone
   - Clear indication of which POC(s) they'll meet with

5. **Confirmation**: Send immediate email confirmation with:
   - Meeting details
   - Calendar invite (.ics file)
   - Link to cancel/reschedule
   - Brief intro about their assigned POC

### Automated Reminders
- Send email reminder 24 hours before meeting
- Send email reminder 30 minutes before meeting
- Include meeting link and cancel/reschedule options in both

### User Self-Service
- Unique reschedule link for each booking
- Unique cancellation link (with confirmation step)
- Show available alternative slots when rescheduling

### Admin Dashboard
Must include comprehensive controls:

1. **Category Management**:
   - Add/edit/remove business areas
   - Customize description and resources for each area
   - Reorder categories

2. **Team Management**:
   - Invite team members via email
   - Assign POCs to specific categories (1-2 per category)
   - Set POC priority/weighting within category
   - View POC profiles and stats

3. **Calendar Integration**:
   - OAuth connection to Google Calendar for each POC
   - Set working hours per POC
   - Set buffer times between meetings
   - Block specific dates/times
   - Sync automatically every 5 minutes

4. **Form Customization**:
   - Add/remove/reorder form fields
   - Make fields required/optional
   - Add custom questions per category
   - Customize confirmation email templates
   - Customize reminder email templates

5. **Resource Management**:
   - Upload/link resources per category
   - Add intro text/value proposition per category
   - Embed videos or documents

6. **Analytics Dashboard**:
   - Bookings by category
   - Bookings by POC
   - Conversion rates (views to bookings)
   - Cancellation/no-show rates
   - Average meeting duration selection
   - Popular time slots

7. **Settings**:
   - Company branding (logo, colors)
   - Timezone settings
   - Meeting buffer preferences
   - Notification preferences
   - Video conferencing integration (Zoom/Google Meet)

## TECHNICAL APPROACH

### Use Research & Subagents Liberally
- **CRITICAL**: If you encounter ANY technology, API, or implementation pattern you're not 100% certain about, IMMEDIATELY use a research agent to investigate current best practices
- **CRITICAL**: Create specialized subagents for complex subsystems to protect your context window

### Create Subagents For:
- Calendar integration logic (Google Calendar API OAuth flow, sync patterns, availability merging)
- Email system (transactional emails, calendar invites, reminder scheduling)
- Authentication and authorization system
- Database schema design (especially for calendar/booking systems)
- Timezone handling logic and conversion
- Frontend component architecture
- API endpoint design

### Key Implementation Challenges to Research
Before implementing these features, use the research agent to understand best practices:

1. **Calendar Availability Merging**: How to efficiently merge availability from multiple POCs and handle overlapping slots
2. **Timezone Handling**: Converting between user timezone, POC timezones, and database storage (UTC)
3. **Conflict Prevention**: Handling race conditions when multiple users try to book the same slot simultaneously
4. **OAuth Token Refresh**: Keeping Google Calendar OAuth tokens fresh and handling token expiration
5. **Email Deliverability**: Ensuring transactional emails don't hit spam folders (SPF, DKIM, DMARC)
6. **Calendar Sync Patterns**: Best practices for syncing external calendars (polling frequency, webhook options)
7. **Reminder Scheduling**: Using cron jobs, scheduled functions, or queue systems for time-based reminders
8. **.ics File Generation**: Creating valid calendar invite files that work across all email clients
9. **Buffer Time Logic**: Implementing buffer times between meetings to prevent back-to-back scheduling
10. **Working Hours**: Handling different working hours per POC across timezones

### Database Schema Considerations
Create a specialized subagent to design the complete database schema. Key entities should include:
- Users (admins, POCs with roles and permissions)
- Categories (business areas with metadata)
- CategoryPOCs (junction table linking POCs to categories with priority)
- Bookings (with status: confirmed, cancelled, rescheduled, completed)
- CalendarConnections (OAuth tokens, refresh tokens, expiry)
- Availability rules (working hours, blocked times)
- Custom form fields (dynamic per category)
- Email templates (customizable)
- Resources (content per category)
- Reminders (scheduled notifications)
- Audit logs (for admin actions)

### Development Phases

**Phase 1: Research and Architecture** (Use research agent heavily!)
- Research OAuth 2.0 flow for Google Calendar
- Research calendar availability algorithms
- Research timezone handling libraries and patterns
- Research transactional email services and best practices
- Design complete database schema (use dedicated subagent)
- Create system architecture diagram
- Set up development environment

**Phase 2: Authentication & Admin Foundation** (Use subagent)
- Implement authentication system
- Create admin user roles and permissions
- Build basic admin dashboard layout
- Implement category CRUD operations

**Phase 3: Calendar Integration** (Use dedicated subagent!)
- Implement Google Calendar OAuth flow
- Build token refresh mechanism
- Create availability fetching logic
- Implement slot merging algorithm for multiple POCs
- Handle timezone conversions
- Test conflict prevention

**Phase 4: Booking Flow**
- Build user-facing category selection
- Create dynamic booking form
- Implement real-time availability display
- Build booking creation and validation
- Implement double-booking prevention

**Phase 5: Email & Notifications** (Use dedicated subagent)
- Set up transactional email service
- Create confirmation email with .ics attachment
- Build reminder scheduling system (24hr and 30min)
- Implement cancellation/reschedule email flows
- Test email deliverability

**Phase 6: Admin Dashboard Features**
- POC management and calendar connection UI
- Form customization interface
- Resource management per category
- Working hours and buffer time settings
- Email template editor

**Phase 7: Analytics & Reporting**
- Build analytics dashboard
- Implement booking metrics
- Create POC performance views
- Add data export functionality

**Phase 8: Polish & Production**
- Mobile responsive design
- Loading and error states
- Comprehensive error handling
- Security audit
- Performance optimization
- End-to-end testing
- Deployment preparation

## CRITICAL IMPLEMENTATION REMINDERS

1. **ALWAYS Use Research Agent**: Before implementing ANY feature you're not 100% confident about, use the research agent to learn current best practices. Don't guess or hallucinate APIs.

2. **Create Subagents Liberally**: Protect your context window by delegating complex subsystems to specialized subagents. Each subagent should have a clear, focused responsibility.

3. **Don't Hallucinate**: If you're unsure about an API's methods, authentication flow, or behavior, STOP and research it first.

4. **Security First**: Research and implement proper authentication, authorization, and data protection patterns. Never store sensitive data unencrypted.

5. **Timezone Hell is Real**: This is notoriously tricky. Research thoroughly, always store in UTC, and test extensively with different timezones.

6. **Race Conditions**: Research optimistic locking or database constraints to prevent double-booking.

7. **Email Deliverability**: Research SPF/DKIM/DMARC setup. Test emails across different providers (Gmail, Outlook, etc.).

8. **OAuth Token Management**: Research token refresh flows. Implement proper error handling for expired tokens.

9. **Calendar Sync Performance**: Research efficient sync patterns. Don't hammer the Google Calendar API.

10. **User Experience**: Research modern scheduling UX patterns. The booking flow should be intuitive and fast.

## DELIVERABLES

1. Fully functional web application with user-facing booking system
2. Comprehensive admin dashboard with all specified features
3. Working Google Calendar integration with OAuth
4. Automated email confirmation and reminder system
5. Cancellation and rescheduling functionality
6. Analytics and reporting dashboard
7. Complete documentation including:
   - Setup and deployment instructions
   - API documentation
   - Admin user guide
   - Architecture overview
   - Database schema documentation
8. README with environment setup, configuration, and maintenance instructions

## GETTING STARTED

Begin by:
1. Creating a detailed project plan with milestones
2. Identifying all areas that need research (calendar APIs, OAuth, timezone handling, etc.)
3. Creating specialized subagents for complex subsystems
4. Asking clarifying questions if ANY requirements are unclear
5. Proposing the technology choices and architecture before building

Remember: Research first, build second. Use subagents to keep your context clean. Ask questions when in doubt.
