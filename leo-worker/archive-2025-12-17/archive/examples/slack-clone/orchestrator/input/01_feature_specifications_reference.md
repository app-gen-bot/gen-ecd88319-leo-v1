# Slack Clone - Feature Specifications Reference

This document contains detailed implementation specifications that AppFactory infers from user requests but doesn't
explicitly ask about. These serve as defaults for the "prompt to URL" approach.

## User Scale & Performance

### Expected Usage

- **Company Size**: 50-200 employees (typical mid-size tech company)
- **Active Users**: 75-150 concurrent users during peak hours
- **Message Volume**: 5,000-10,000 messages per day
- **File Upload**: Average 50-100 files per day

### Performance Requirements

- Real-time message delivery (<100ms latency)
- Search results within 1 second
- Support 150 concurrent WebSocket connections
- Handle burst traffic during all-hands meetings

## Feature Specifications

### Channels

- **Public Channels**: Any user can create and join
- **Private Channels**: Role-restricted creation, invite-only
- **Channel Limits**:
    - Max 100 channels per workspace initially
    - Max 500 members per channel
- **Default Channels**: #general (auto-join), #random

### Direct Messages

- **1-on-1 DMs**: Unlimited between any users
- **Group DMs**: Up to 8 participants
- **History**: Persistent and searchable
- **Typing Indicators**: Show when someone is typing

### File Sharing

- **Size Limit**: 50MB per file
- **Supported Types**: All file types accepted
- **Preview Support**:
    - Images: JPG, PNG, GIF (inline preview)
    - Documents: PDF (download only initially)
    - Code: Syntax highlighting for common languages
- **Storage**: S3 with pre-signed URLs for security

### Search Functionality

- **Scope**: Messages, files, users, channels
- **Filters**: Date range, sender, channel, file type
- **Indexing**: Real-time for messages, async for files
- **Results**: Paginated, 20 results per page

### Authentication & Security

- **Primary**: Google OAuth (for Google Workspace companies)
- **Fallback**: Local accounts with email/password
- **Session**: JWT tokens, 7-day expiry
- **Permissions**: Role-based (Admin, Member, Guest)

### Admin Panel Features

- **User Management**:
    - Activate/deactivate accounts
    - Reset passwords
    - Assign roles
    - View last active times
- **Channel Management**:
    - Delete inappropriate channels
    - Archive old channels
    - View channel statistics
- **Analytics Dashboard**:
    - Daily active users
    - Message volume trends
    - Storage usage
    - Popular channels
- **System Settings**:
    - Workspace name/logo
    - Default permissions
    - Integration toggles

### UI/UX Specifications

- **Theme**: Light and dark modes (dark as default for developers)
- **Layout**: Three-column (sidebar, main, details)
- **Customization**:
    - Primary color (default: Slack purple #4A154B)
    - Logo upload
    - Workspace name
- **Responsive**: Desktop-first, mobile-friendly later

### Notifications

- **Desktop**: Browser notifications via Web API
- **Sound**: Optional notification sounds
- **Email**:
    - @mentions when offline for >30 minutes
    - Daily digest option
    - DM notifications
- **Preferences**: Per-channel mute options

## Technical Architecture (Hidden from Users)

### Frontend

- Next.js 14 with App Router
- Real-time via Socket.io or native WebSockets
- State management with Zustand
- Optimistic UI updates

### Backend

- FastAPI with WebSocket support
- PostgreSQL for persistent data
- Redis for real-time features
- S3 for file storage

### Deployment

- Containerized with Docker
- AWS ECS Fargate for compute
- RDS for database
- CloudFront for CDN
- Route53 for DNS

## Future Enhancements (Phase 2+)

### Phase 2

- Threaded conversations in channels
- Advanced search with filters
- Email notification preferences
- Channel analytics for admins
- Slack import tool

### Phase 3

- Mobile apps (React Native)
- Voice/video calls (WebRTC)
- Custom emoji and reactions
- Third-party integrations
- Export tools for compliance

## Default Decisions

These are automatically decided without user input:

- Message retention: Unlimited
- File retention: 1 year
- Search history: All time
- Timezone: UTC with local display
- Language: English (i18n ready)
- Accessibility: WCAG 2.1 AA compliant