# LeoCal - AI-Powered Scheduling Platform

You are a super-advanced multi-agent coding system.

Your job is to **DESIGN AND IMPLEMENT** a next-generation scheduling platform called **LeoCal**.

Do NOT output a spec or plan. Use this document as a PRODUCT REQUIREMENTS DOCUMENT and actually build the system (backend, frontend, data, and AI wiring) that satisfies these requirements.

**USE SUBAGENTS AS NEEDED** to accomplish this comprehensive task. This is a large, multi-faceted application that will benefit from specialized agents handling different aspects (schema design, API architecture, UI components, AI integration, etc.).

====================================
1. PRODUCT VISION
====================================

LeoCal is a "Calendly on steroids":

- A scheduling and routing platform that:
  - Lets people and teams create booking links and event types.
  - Routes leads/visitors to the right person/team using forms and rules.
  - Manages complex availability, buffers, and prep time.
  - Automates reminders, follow-ups, and simple workflows.
- BUT with a key differentiator:
  - Users configure all of this primarily via **natural language**, and an AI layer turns that into scheduling policies and rules.
  - AI also helps with routing decisions, meeting prep, and post-meeting summaries.

Think of LeoCal as a **scheduling brain** for individuals, GTM teams (sales, CS, success), recruiting, support, and enterprises.

====================================
2. PRIMARY USER ROLES
====================================

Design all functionality around these roles:

1. **Individual host**
   - A solo consultant, coach, freelancer, or IC who wants people to easily book meetings with them (often paid time).

2. **Team member**
   - A salesperson, CSM, recruiter, or support engineer in a team that shares inbound leads or requests.

3. **Team/Org admin**
   - Someone who sets up routing, event types, and policies for a team or organization.

4. **Invitee / external guest**
   - A prospect, customer, candidate, or partner who just wants to pick a time and show up.

====================================
3. TOP-LEVEL GOALS
====================================

LeoCal must:

- Make it trivial for hosts to describe their ideal schedule and rules in *plain language* and have the system enforce it.
- Support:
  - 1:1, group, round-robin, and collective scheduling.
  - Basic routing forms that route leads to different event types/owners.
- Provide AI assistance for:
  - Understanding natural-language scheduling instructions.
  - Smart slot suggestions.
  - Lead/routing intelligence.
  - Meeting prep and summaries.
- Be ready to scale to teams and enterprises with:
  - Organizations, teams, roles/permissions.
  - Governance and auditability hooks.

====================================
4. CORE USER FLOWS (WHAT MUST EXIST)
====================================

Implement the following flows end-to-end:

4.1. **Host onboarding & basic setup**

- New user signs up / logs in.
- On first login, system helps them:
  - Set their working days/hours.
  - Create at least one default event type (e.g. "30-minute intro call").
  - Optionally connect external calendars later (design for this even if mocked at first).
- User lands on a **Dashboard** showing:
  - Upcoming meetings.
  - Quick links:
    - "Create event type"
    - "Configure my schedule with AI"
    - "Create routing form"

4.2. **Natural-language scheduling configuration**

- Host can go to a "My Schedule / Policies" screen.
- There is a conversational UI where they can type things like:
  - "Create 30-minute slots on weekdays between 9 and 5."
  - "Leave at least 20 minutes between meetings."
  - "Cap me at 4 hours of meetings per day."
  - "Add 15 minutes of prep before first-time sales discovery calls."
  - "No meetings after 4pm on Fridays."
- The system:
  - Parses each instruction.
  - Updates the host's scheduling policy.
  - Shows a human-readable summary of all active rules.
  - Applies these rules to all booking flows.

4.3. **Event type management**

- Hosts/teams can create, edit, and delete **event types**:
  - Fields (as examples, not exhaustive):
    - Name (e.g. "30-min Intro Call")
    - Description
    - Duration
    - Location (e.g., video call, phone, custom)
    - Host(s):
      - Single host (1:1)
      - Round-robin among team members
      - Collective (all selected hosts must be free)
  - Event types can override or extend scheduling policies (e.g., different availability windows, custom questions).

4.4. **Public booking flow (invitee experience)**

- Each event type has a **shareable booking link**:
  - Invitee opens it.
  - LeoCal detects invitee's time zone.
  - Invitee sees a calendar of available days and time slots:
    - These slots respect:
      - Host working hours
      - Meeting duration
      - Buffers between meetings
      - Meeting caps
      - Any event-specific rules
  - Invitee selects time, enters name + email (and any configured custom questions).
  - On confirm:
    - A booking is created.
    - Host and invitee see a confirmation screen.
    - A confirmation email is sent (with date/time and any meeting link or instructions).

4.5. **Team / multi-host scheduling**

- For event types owned by a **team**:
  - **Round-robin**:
    - System offers slots based on pooled availability.
    - New bookings are distributed across eligible team members.
  - **Collective**:
    - System only offers times when **all** required hosts are available.
- Team members can see their own upcoming bookings.
- Team/Org admins can view team event types and bookings.

4.6. **Routing form flow**

- Admin can create a **Routing Form**:
  - A small questionnaire for website or campaigns (e.g. name, email, company size, interest area).
- Admin defines simple routing logic (no need to specify implementation):
  - Example rules:
    - If company size >= 500 and interest = "Enterprise plan" → route to Enterprise Sales event type.
    - If interest = "Support" → route to Support event type.
    - If region = "Europe" → route to EU team event types.
- Public routing form URL:
  - Invitee fills it in.
  - On submit, system decides **where they should go** (e.g. an event type to book, or a message, or a redirect).
  - If the destination is an event type, the user is guided straight into a booking experience for that event type.

====================================
5. FEATURE AREAS & REQUIREMENTS
====================================

5.1. **Accounts, organizations, teams**

The system must support:

- Users with:
  - Profile (name, email, avatar optional).
  - Role (host, admin, etc).
- Organizations:
  - Multiple users can belong to the same organization.
  - Organization owner/admin can:
    - Invite users.
    - Create teams.
- Teams:
  - A team has a name and members.
  - Team event types are owned by teams, not individuals.
- Roles/permissions:
  - At minimum:
    - Regular user: can manage only their own event types and policies.
    - Team admin: can manage team event types and routing.
    - Org admin: can manage org-level settings.

5.2. **Scheduling policy engine (natural-language driven)**

- Every host (and optionally team/org) has a **scheduling policy** that defines:
  - Working hours by day of week.
  - Default slot duration (e.g. 30 min).
  - Buffers between meetings (e.g. 15 min).
  - Extra rules:
    - No meetings on certain days/hours.
    - Max number of meetings per day.
    - Max total meeting hours per day.
    - Prep time rules (e.g. "30 min prep before interviews").
    - Preferences (cluster meetings vs spread them out).
- The system must:
  - Accept natural-language instructions from the user.
  - Translate them into structured policy rules.
  - Merge new instructions into existing policy without losing other rules.
  - Allow user to review and reset policy if needed.
- All availability and booking logic must respect the effective policy.

5.3. **AI scheduling assistant (optional UX surfaces)**

- Beyond forms and screens, the system should have an AI scheduling assistant that can:
  - Interpret commands like:
    - "Schedule a 30-minute intro call with Alice next week in the afternoon."
    - "Find a time for a 60-minute internal review with my team before Friday."
  - Produce concrete time proposals.
- It should:
  - Respect the host's policies.
  - Respect existing bookings.
  - Use the same event types and availability logic behind the scenes.
- It can initially live as a conversational UI inside the dashboard.

5.4. **Routing forms & AI-enhanced routing**

- Routing forms:
  - Admins can:
    - Define fields (text, dropdown, etc.).
    - Arrange questions order.
  - Routing logic:
    - Define conditions on field values (e.g., company size, region, topic).
    - Map to actions:
      - "Send to Event Type X"
      - "Show a message"
      - "Redirect to URL"
- AI-assisted routing (enhancement on top of rule-based routing):
  - For open-ended text answers like "what do you want to talk about?":
    - AI should extract an intent or category (e.g., "billing", "technical support", "enterprise evaluation").
    - This intent can be used by routing rules.
  - AI can also infer a lead score (e.g., high/medium/low interest) that routing logic can use.

5.5. **AI meeting assistant (prep & summary)**

- Pre-meeting:
  - For each upcoming booking, the host can ask:
    - "Give me a quick prep summary for this meeting."
  - The system uses:
    - Event type (what kind of meeting it is).
    - Any routing form answers / context collected.
    - Bookings history with that invitee (if available).
  - AI returns:
    - Short summary of who they are and why they're meeting.
    - Suggested agenda items.
    - Key questions to ask.
- Post-meeting:
  - After a meeting, host can:
    - Provide brief notes or paste a rough transcript (optional).
  - AI generates:
    - Summary.
    - Decisions.
    - Action items (who should do what, by when).
  - System stores this on the booking for later reference.

5.6. **Workflows, notifications, and no-show handling**

- Notifications:
  - When a booking is created:
    - Host gets an email.
    - Invitee gets a confirmation email.
  - Before the meeting:
    - System sends at least one reminder (configurable time before).
- Workflows:
  - Basic capability to define:
    - "On booking creation → send email X" (this may be default).
    - "On booking cancel → send email Y".
  - Later extendable to other actions (e.g., push data to CRM).
- No-show handling:
  - Host can mark a meeting as "no-show".
  - System should keep statistics per invitee and per host.
  - Future: AI or logic can treat high no-show-risk invitees differently (this can be left as a placeholder / extension point).

5.7. **Analytics & reporting (initial version)**

The system should expose at least:

- For individuals:
  - Number of meetings booked in a period.
  - Show rate vs no-show rate.
  - Meetings by event type.
- For teams/orgs:
  - Meetings by team and by event type.
  - Basic conversion info:
    - (Optional) how many routing form submissions lead to a scheduled meeting.

Design the data so more advanced analytics can be added later.

5.8. **Security, privacy, and admin**

- Basic requirements:
  - Only authenticated users can manage their own event types, bookings, and policies.
  - Team / org admins can only access data belonging to their org.
- Admin features:
  - Simple way to:
    - See members of an organization.
    - Manage team membership.
    - View high-level activity (e.g., recent bookings, recently created event types and forms).

====================================
6. UX EXPECTATIONS
====================================

High-level UX expectations:

- **Dashboard for hosts/admins**:
  - Clear view of upcoming meetings.
  - Quick access to event types, policies, routing forms, and analytics.
- **Event type editor**:
  - Simple form to define event types.
  - Clear explanation of duration and location.
- **Policies (AI schedule settings) UI**:
  - Conversational input area for natural language.
  - Panel summarizing active rules in plain language.
  - Ability to reset or adjust policies.
- **Routing form builder**:
  - Minimal yet practical:
    - Add fields, order them, define simple conditions and outcomes.
- **Public booking pages**:
  - Clean, invitee-friendly pages:
    - Event description, time selector, confirmation screen.
- **Public routing pages**:
  - Simple form that leads to either:
    - A booking flow.
    - A message.
    - A redirect.

====================================
7. PHASING / PRIORITIES
====================================

Implement features in roughly this priority order (but produce working code as you go):

MVP Core:
- User auth & basic org/team structure.
- Event type management.
- Natural-language scheduling policy (simple subset: working hours, slot duration, basic buffer).
- Availability calculation using policy + bookings.
- Public booking link and invitee flow.
- Basic email confirmations.

Next:
- More advanced policy rules (caps, no-meeting windows, simple prep time).
- Team event types (round-robin, collective).
- Routing forms with deterministic rules.
- Policy UI improvements (history, summaries).

Advanced:
- AI-enhanced routing (intent/lead score).
- AI meeting prep and summaries.
- Analytics dashboards.
- More sophisticated workflows and no-show intelligence.

====================================
8. FINAL INSTRUCTION
====================================

- Create all necessary backend services, data models, APIs, and background jobs.
- Create all necessary frontend screens, components, and state management.
- Wire AI interactions where described (natural-language policies, routing assistance, prep/summary).
- Ensure the result is a coherent, runnable system that fulfills the behaviors described above.
- **USE SUBAGENTS AS NEEDED** to accomplish this comprehensive task.
