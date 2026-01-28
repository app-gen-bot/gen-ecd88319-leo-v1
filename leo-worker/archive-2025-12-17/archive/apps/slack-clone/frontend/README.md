# Slack Clone Frontend

A fully-featured Slack clone built with Next.js 14, React 18, TypeScript, and ShadCN UI components.

## Features

### ✅ Authentication
- Login/Register with email and password
- Forgot password flow
- Session management with JWT tokens
- Protected routes

### ✅ Workspace Management
- Workspace switcher
- Create new workspaces
- Admin dashboard for workspace owners
- User role management (admin/member)

### ✅ Channels
- Public and private channels
- Create, join, and leave channels
- Channel settings and management
- Browse all public channels
- Unread message indicators
- Channel member count

### ✅ Direct Messages
- One-on-one conversations
- User presence indicators (online/away/offline)
- User profile popovers
- Start new conversations

### ✅ Messaging
- Real-time message display (mocked)
- Rich text formatting toolbar
- Message editing (within 5 minutes)
- Message deletion
- Emoji reactions
- Thread replies
- Typing indicators
- File upload UI (mocked)
- @mentions

### ✅ Search
- Global search (Cmd/Ctrl+K)
- Search messages, channels, files, and people
- Recent searches
- Tabbed search results

### ✅ Notifications
- Notification center
- Badge counts
- Mark as read functionality
- Different notification types (@mentions, DMs, channel activity)

### ✅ User Experience
- Dark mode by default
- Responsive design (mobile/tablet/desktop)
- Keyboard shortcuts
- Loading states
- Error handling
- Empty states
- Accessibility features

### ✅ Settings
- Profile management
- Avatar upload (UI only)
- Password change
- Notification preferences
- Sound settings
- Language and timezone

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **State Management**: React Context + SWR
- **Type Safety**: TypeScript
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Demo Credentials

- Email: `demo@example.com`
- Password: `password`

## Project Structure

```
frontend/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Authentication pages
│   ├── (workspace)/       # Main app pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── channel/          # Channel-related components
│   ├── dm/               # Direct message components
│   ├── ui/               # ShadCN UI components
│   ├── user/             # User-related components
│   └── workspace/        # Workspace components
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── lib/                  # Utilities and helpers
│   ├── api-client.ts    # Mock API client
│   ├── api-error.ts     # Error handling
│   └── utils.ts         # General utilities
└── types/               # TypeScript types
    └── api.ts           # API response types
```

## Mock Data

The application uses mock data for development. All API calls are simulated with realistic delays and responses. In production, replace the mock implementations in `lib/api-client.ts` with real API calls.

## Key Features Implementation

### Authentication Flow
- Tokens stored in localStorage
- Automatic session restoration
- Protected routes using AuthCheck component
- Logout clears all session data

### Real-time Updates
- Messages poll every 5 seconds (mock)
- Optimistic updates for better UX
- WebSocket connection points ready

### Error Handling
- Global error handler with toast notifications
- Network error retry logic
- Form validation
- Permission checks

## Future Enhancements

- Real backend integration
- WebSocket for real-time updates
- File uploads
- Voice/video calls
- Screen sharing
- Custom emoji
- Slash commands
- App integrations
- Message search
- Notification preferences per channel
- Do not disturb mode
- Workspace analytics

## Development

The application is built with developer experience in mind:
- Hot reload with Next.js
- TypeScript for type safety
- ESLint for code quality
- Component-based architecture
- Modular file structure

## License

This is a demo application for educational purposes.