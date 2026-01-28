# Frontend Specification - Slack Clone

## Technology Stack
- Next.js 14 with App Router
- React 18
- TypeScript
- ShadCN UI Components
- Tailwind CSS
- WebSocket client

## Route Structure

### Public Routes
- `/` - Landing/redirect
- `/login` - Login form
- `/register` - Registration form
- `/auth/google/callback` - OAuth callback

### Protected Routes
- `/workspace/{id}` - Main app
- `/workspace/{id}/channel/{channelId}` - Channel view
- `/workspace/{id}/dm/{conversationId}` - DM view
- `/workspace/{id}/admin` - Admin panel
- `/create-workspace` - New workspace

## State Management

### Global State
- Current user
- Current workspace
- WebSocket connection
- Notification preferences

### Local State
- Channel list
- Message list
- Active channel/DM
- Typing indicators
- Unread counts

## Components

### Layout Components
- `AppShell` - Main container with sidebar
- `Sidebar` - Workspace/channel navigation
- `Header` - Top bar with search/user menu
- `MainContent` - Message area container

### Feature Components
- `ChannelList` - List of channels with unread indicators
- `DirectMessageList` - DM conversations
- `MessageList` - Scrollable message history
- `MessageInput` - Text input with file upload
- `Message` - Single message with reactions/actions
- `UserPresence` - Online/offline indicator
- `FileUpload` - Drag-drop file handler
- `EmojiPicker` - Reaction selector
- `SearchBar` - Global search input
- `UserProfile` - Profile dropdown

### Auth Components  
- `LoginForm` - Email/password + Google OAuth
- `RegisterForm` - User registration
- `WorkspaceSelector` - Choose/create workspace

### Admin Components
- `UserManagement` - User list with actions
- `WorkspaceStats` - Usage statistics
- `InviteForm` - Email invitation

## API Integration

### REST Endpoints
Use fetch with auth headers for all `/api/v1/*` endpoints

### WebSocket
- Connect on workspace entry
- Reconnect on disconnect
- Subscribe to current channel
- Handle real-time events

### File Upload
- Multipart form upload
- Progress tracking
- Preview generation for images

## UI Behavior

### Message List
- Load 50 messages initially
- Infinite scroll for history
- Auto-scroll on new messages
- Maintain scroll position on history load

### Typing Indicators
- Show "User is typing..." below input
- Debounce typing events (1s)
- Clear after 3s of inactivity

### Notifications
- Request browser permission
- Show for mentions and DMs
- Respect per-channel settings

### Dark Mode
- Default enabled
- Toggle in user menu
- Persist preference

## Performance

### Optimization
- Virtualize long message lists
- Lazy load images
- Debounce search input
- Cache channel/user data

### Code Splitting
- Route-based splitting
- Lazy load emoji picker
- Lazy load admin panel

## Error Handling

### API Errors
- Show toast for failures
- Retry with exponential backoff
- Offline queue for messages

### Validation
- Client-side form validation
- Show inline errors
- Prevent invalid submissions

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter to send messages
- Escape to close modals

### Screen Readers
- Proper ARIA labels
- Announce new messages
- Status updates

## Security

### Authentication
- Store JWT in httpOnly cookie
- Refresh token on expiry
- Clear on logout

### Input Sanitization
- Escape HTML in messages
- Validate file types
- Limit file sizes client-side

## Wireframe Reference
The visual design and layout will be defined in the wireframe component. This spec defines the behavior and technical implementation.