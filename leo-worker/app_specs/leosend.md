# LeoSend - DocSend-style Document Sharing Platform

## Overview
LeoSend is a multi-tenant SaaS web app that helps startup founders send fundraising documents (pitch decks, data rooms) via trackable links, with strong access control and deep engagement analytics.

## Primary Users
- **Founders and teams**: Upload documents, create trackable links, view analytics
- **Investors (viewers)**: Access documents via links without needing an account

## Core Features

### Document Management
- Upload documents (pitch decks, financials, etc.)
- Version management for documents
- Content library with filters and tags
- Categories: Pitch Deck, Financials, Product, Legal

### Trackable Links
- Create unique links per investor/VC firm
- Internal labels for organization (e.g., "Sequoia - Partner A - Round 1")
- Auto-generated public slugs
- Option to always point to latest version

### Security & Access Control
- **Email gating**: No email / Required / Required + verification
- **Allowlist/Blocklist**: Restrict by email or domain
- **Password protection**: Optional link-level password
- **NDA/Agreement gating**: Require acceptance before viewing
- **Expiration dates**: Auto-disable links after date
- **Download control**: Allow/disallow file download
- **Watermarking**: Dynamic watermarks with viewer info
- **Kill switch**: Instantly disable any link

### Spaces (Data Rooms)
- Group multiple documents into virtual data rooms
- Custom branding (logo, colors, hero text)
- Section-based organization
- Separate trackable links for Spaces

### Analytics
- Per-link, per-document, per-page metrics
- View who accessed, when, and for how long
- Page-level engagement (time spent, drop-off points)
- Account/firm-level aggregated analytics
- Visitor list with engagement history

### Team Collaboration
- Workspace-based multi-tenancy
- Roles: Owner, Admin, Member
- Invite team members via email
- Configurable content visibility

### Notifications
- Real-time visit notifications
- Unauthorized access alerts
- Agreement signed notifications
- Daily/weekly digest options
- In-app activity feed

### Contacts & Accounts
- Track investors and VC firms
- Link contacts to accounts (firms)
- View engagement per account/contact

## Tech Stack
- Frontend: React + TypeScript, Vite, Tailwind CSS
- Backend: Supabase (Postgres, Auth with Google login, Storage)
- Email: Resend API
- Deployment: Single container on fly.io

## Database Entities
1. User, Workspace, WorkspaceMembership
2. Account (VC firm), Contact (individual)
3. Document, DocumentVersion
4. Link (document link with security settings)
5. Space, SpaceItem, SpaceLink
6. Visit, PageView
7. Agreement, AgreementAcceptance
8. NotificationPreference, AuditLog

## Key User Flows

### Founder Flows
1. Sign up and create workspace
2. Upload documents and manage versions
3. Create trackable links with security settings
4. Create Spaces (data rooms)
5. View document and space analytics
6. Manage team members and roles
7. Configure branding and agreements

### Viewer Flows
1. Access link and pass gating (email, password, NDA)
2. View document with page-level tracking
3. Browse data room and access documents

## UI Requirements
- Clean, modern B2B SaaS design
- Dark mode support
- Responsive for desktop and tablet
- Document viewer with thumbnails sidebar
- Analytics dashboards with charts

## Security Requirements
- All data scoped by workspace
- Strict gating enforcement
- Audit logging for sensitive actions
- No cross-workspace data leakage
