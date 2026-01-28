# TeamSync - Where Conversations Become Action

TeamSync is a unified collaboration platform that seamlessly integrates real-time messaging with comprehensive project management. It eliminates context switching by bringing conversations and tasks together in a single interface.

## Features Implemented

### ✅ Complete Frontend Application
- **Landing Page**: Marketing page with features, pricing, and call-to-actions
- **Authentication**: Login and registration with form validation
- **Main Application Layout**: 
  - Collapsible sidebar with channels, projects, and direct messages
  - Header with global search, create menu, and notifications
  - Responsive design for mobile and desktop

### ✅ Channel Features
- Channel view with real-time message display
- Message composer with rich text formatting toolbar
- Context menu for messages (reply, create task, edit, delete)
- Emoji reactions and thread indicators
- Channel header with member count and settings

### ✅ UI Components
- Complete ShadCN UI component library integration
- Dark mode by default (#1a1d21 background)
- Toast notifications for user feedback
- Modal dialogs for creating tasks, projects, and channels
- Global search with tabbed results
- Notification dropdown with filtering

### ✅ State Management
- Authentication context with session persistence
- Workspace store using Zustand
- API client with mock data
- Error handling and loading states

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Components**: ShadCN UI (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Context
- **Data Fetching**: SWR
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

- Email: `demo@teamsync.com`
- Password: `password123`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── app/               # Main application
│   │   ├── channel/       # Channel views
│   │   └── layout.tsx     # App layout with sidebar
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── layout/           # Layout components
│   ├── channel/          # Channel-specific components
│   └── modals/           # Modal components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API client
├── stores/               # Zustand stores
└── types/                # TypeScript types
```

## Key Features

### Unified Workspace
- Seamlessly blend chat and tasks
- Turn any conversation into actionable work with a single click
- Real-time messaging with markdown support

### Smart Channels
- Projects automatically create linked channels
- Keep discussions and work connected
- Channel-project bidirectional linking

### Contextual Task Creation
- Right-click any message to create a task
- Pre-filled with message content and context
- Automatic assignment to message author

### Real-time Collaboration
- Presence indicators showing online/away/offline status
- Typing indicators (planned)
- WebSocket support (planned)

### Notification Intelligence
- Smart notification filtering
- Customizable notification preferences
- Unread counts and badges

## Implementation Notes

- All API calls currently use mock data from `lib/api-client.ts`
- WebSocket functionality is planned but not implemented
- File uploads are stubbed with toast notifications
- Some advanced features show "coming soon" messages

## Next Steps

1. Connect to real backend API
2. Implement WebSocket for real-time updates
3. Add file upload functionality
4. Implement thread replies
5. Add project management views (Board, List, Timeline)
6. Complete user profile and settings pages

## License

This is a demo application created with the AI App Factory.