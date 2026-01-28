# Frontend Specification - Slack Clone v1.0

**Version**: 1.0  
**Generated**: 2025-06-29  
**Source**: Implemented wireframe components and features

## Technology Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- Lucide React Icons
- React Hook Form
- Zod (validation)
- Tanstack Query (data fetching)
- WebSocket client

## Route Structure

### Public Routes
- `/` - Home page (redirects to default channel)
- `/login` - Login/registration form with Google OAuth

### Protected Routes
- `/channel/{id}` - Channel view with messages
- `/dm/{userId}` - Direct message conversation
- `/admin` - Admin dashboard (admin role required)

### Dynamic Routing
All routes use Next.js App Router with RSC support and are workspace-scoped implicitly.

## Project Structure
```
app/
├── layout.tsx              # Root layout with dark mode
├── page.tsx               # Home redirect
├── login/
│   └── page.tsx          # Auth page
├── channel/
│   └── [id]/
│       └── page.tsx      # Channel view
├── dm/
│   └── [userId]/
│       └── page.tsx      # DM view
└── admin/
    └── page.tsx          # Admin panel

components/
├── workspace-layout.tsx   # Main app layout
├── sidebar.tsx           # Navigation sidebar
├── header.tsx            # Top header bar
├── message-area.tsx      # Channel messages
├── dm-message-area.tsx   # DM messages
├── message-input.tsx     # Message composer
├── search-modal.tsx      # Global search
├── notifications-dropdown.tsx # Notifications
├── user-profile-popover.tsx  # User profiles
└── ui/                   # ShadCN components
```

## Implemented Components (30+)

### Layout Components
1. **WorkspaceLayout** - Main application wrapper with sidebar/header structure
2. **Sidebar** - Left navigation with channels, DMs, and workspace info
3. **Header** - Top bar with search, notifications, and channel details

### Message Components
4. **MessageArea** - Channel message display with virtual scrolling
5. **DMMessageArea** - Direct message display with user status
6. **MessageInput** - Rich text composer with formatting toolbar
7. **Message** - Individual message with reactions and thread info
8. **MessageReaction** - Emoji reaction component

### Interactive Components
9. **SearchModal** - Full-featured search with tabs and filters
10. **NotificationsDropdown** - Notification center with unread badges
11. **UserProfilePopover** - User details popup on avatar click
12. **ChannelMembersList** - List of channel participants
13. **CreateChannelModal** - New channel creation dialog
14. **InviteUserModal** - User invitation form
15. **TypingIndicator** - Shows who's typing

### Form Components
16. **LoginForm** - Email/password authentication
17. **RegisterForm** - New user registration
18. **GoogleOAuthButton** - OAuth integration
19. **ChannelSettingsForm** - Channel configuration
20. **UserProfileForm** - Profile editing

### UI Components (ShadCN)
21. **Avatar** - User/channel avatars
22. **Badge** - Unread counts and status
23. **Button** - All button variants
24. **Card** - Content containers
25. **Dialog** - Modal dialogs
26. **DropdownMenu** - Context menus
27. **Form** - Form handling with RHF
28. **Input/Textarea** - Form inputs
29. **Popover** - Floating content
30. **ScrollArea** - Scrollable containers
31. **Select** - Dropdown selects
32. **Sheet** - Slide-out panels
33. **Skeleton** - Loading states
34. **Tabs** - Tabbed interfaces
35. **Toast** - Notifications

## State Management

### Global State (React Context)
```typescript
// Workspace Context
interface WorkspaceContextValue {
  workspace: Workspace;
  channels: Channel[];
  users: User[];
  currentUser: User;
  switchWorkspace: (id: string) => Promise<void>;
}

// WebSocket Context
interface WebSocketContextValue {
  socket: WebSocket | null;
  connected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
}

// UI Context
interface UIContextValue {
  sidebarOpen: boolean;
  searchOpen: boolean;
  notificationsOpen: boolean;
  toggleSidebar: () => void;
  openSearch: () => void;
}
```

### Local State Patterns
```typescript
// Message drafts persisted to localStorage
const [draft, setDraft] = useLocalStorage(`draft-${channelId}`, '');

// Optimistic updates for reactions
const addReaction = useMutation({
  mutationFn: (emoji: string) => api.addReaction(messageId, emoji),
  onMutate: async (emoji) => {
    // Optimistically update UI
    await queryClient.cancelQueries(['messages', channelId]);
    const previous = queryClient.getQueryData(['messages', channelId]);
    queryClient.setQueryData(['messages', channelId], (old) => {
      // Update reaction count
    });
    return { previous };
  },
  onError: (err, emoji, context) => {
    // Rollback on error
    queryClient.setQueryData(['messages', channelId], context.previous);
  }
});
```

## Data Fetching Architecture

### API Client Configuration
```typescript
// lib/api-client.ts
class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;
  private token: string | null = null;

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.json());
    }

    return response.json();
  }
}
```

### Data Hooks
```typescript
// hooks/use-channel-messages.ts
export function useChannelMessages(channelId: string) {
  return useInfiniteQuery({
    queryKey: ['messages', channelId],
    queryFn: ({ pageParam = null }) => 
      api.getMessages(channelId, { before: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.oldestTimestamp : undefined,
    refetchInterval: false, // Use WebSocket for updates
    staleTime: Infinity
  });
}

// hooks/use-notifications.ts
export function useNotifications() {
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications({ unreadOnly: true }),
    refetchInterval: 30000 // Poll every 30s as backup
  });

  // Real-time updates via WebSocket
  useWebSocketEvent('notification.new', () => {
    refetch();
  });

  return data;
}
```

## Real-time Features

### WebSocket Integration
```typescript
// services/websocket.ts
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private handlers = new Map<string, Set<Function>>();

  connect(token: string) {
    this.socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
    );

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      this.emit(type, data);
    };

    this.socket.onclose = () => {
      this.reconnect();
    };
  }

  on(event: string, handler: Function) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  emit(event: string, data: any) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  send(type: string, data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    }
  }
}
```

### Real-time Event Handlers
```typescript
// Message updates
useWebSocketEvent('message.new', (message) => {
  queryClient.setQueryData(['messages', message.channelId], (old) => {
    return {
      ...old,
      pages: old.pages.map((page, index) => 
        index === 0 ? { ...page, messages: [message, ...page.messages] } : page
      )
    };
  });
});

// Typing indicators
useWebSocketEvent('typing.user', ({ channelId, user, isTyping }) => {
  setTypingUsers(prev => {
    if (isTyping) {
      return { ...prev, [channelId]: [...(prev[channelId] || []), user] };
    } else {
      return { 
        ...prev, 
        [channelId]: (prev[channelId] || []).filter(u => u.id !== user.id) 
      };
    }
  });
});

// Presence updates
useWebSocketEvent('presence.changed', ({ userId, status }) => {
  queryClient.setQueryData(['users'], (old) => {
    return old.map(user => 
      user.id === userId ? { ...user, status } : user
    );
  });
});
```

## UI/UX Implementation Details

### Dark Mode Theme
```typescript
// Tailwind config
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#1a1d21',
        foreground: '#d1d2d3',
        sidebar: '#0e1013',
        border: '#27292d',
        accent: '#1264a3',
        'accent-hover': '#0f5a94',
        online: '#2ea664',
        away: '#f9a325',
        offline: '#565856'
      }
    }
  }
}
```

### Responsive Behavior
```typescript
// Breakpoints
const breakpoints = {
  mobile: '640px',   // sm
  tablet: '768px',   // md
  desktop: '1024px', // lg
  wide: '1280px'     // xl
};

// Responsive sidebar
const Sidebar = () => {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.tablet})`);
  
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }
  
  return <SidebarContent />;
};
```

### Animations & Transitions
```css
/* Message animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-enter {
  animation: slideIn 0.2s ease-out;
}

/* Smooth scrolling */
.scroll-area {
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}
```

### Accessibility Features
```typescript
// Keyboard navigation
const SearchModal = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input on open
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <input
          ref={inputRef}
          aria-label="Search messages, channels, and people"
          role="searchbox"
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        <div id="search-results" role="listbox">
          {/* Results */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

## Performance Optimizations

### Code Splitting
```typescript
// Lazy load heavy components
const EmojiPicker = lazy(() => import('./emoji-picker'));
const FileUploader = lazy(() => import('./file-uploader'));
const AdminDashboard = lazy(() => import('@/app/admin/dashboard'));

// Route-based splitting (automatic with Next.js App Router)
```

### Virtualization
```typescript
// Virtual scrolling for message lists
import { VirtualList } from '@tanstack/react-virtual';

const MessageList = ({ messages }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated message height
    overscan: 5
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <Message message={messages[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Image Optimization
```typescript
// Next.js Image with blur placeholder
import Image from 'next/image';

const UserAvatar = ({ user }) => {
  return (
    <Image
      src={user.avatar_url || '/default-avatar.png'}
      alt={user.name}
      width={36}
      height={36}
      className="rounded-full"
      placeholder="blur"
      blurDataURL={user.avatar_blur || DEFAULT_BLUR}
      loading="lazy"
    />
  );
};
```

### Caching Strategy
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3
    }
  }
});

// Persistent cache for user preferences
const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    theme: 'dark',
    compactMode: false,
    soundEnabled: true,
    enterToSend: true
  });
  
  return { preferences, setPreferences };
};
```

## Error Handling & Recovery

### Global Error Boundary
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={reset}>Try again</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### API Error Handling
```typescript
// Custom error toast messages
const mutation = useMutation({
  mutationFn: sendMessage,
  onError: (error) => {
    if (error.code === 'RATE_LIMITED') {
      toast.error('Slow down! You\'re sending messages too quickly.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Connection lost. Your message will be sent when you\'re back online.');
      // Queue for retry
      queueMessage(message);
    } else {
      toast.error('Failed to send message. Please try again.');
    }
  }
});
```

### Offline Support
```typescript
// Service worker for offline caching
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('v1').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      }).catch(() => {
        // Return offline page
        return caches.match('/offline.html');
      })
    );
  }
});
```

## Testing Implementation

### Component Tests
```typescript
// __tests__/components/message-input.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageInput } from '@/components/message-input';

describe('MessageInput', () => {
  it('sends message on Enter key', async () => {
    const onSend = jest.fn();
    render(<MessageInput onSend={onSend} />);
    
    const input = screen.getByPlaceholderText('Message #general');
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(onSend).toHaveBeenCalledWith({
        content: 'Hello world',
        mentions: []
      });
    });
  });
  
  it('shows formatting toolbar on text selection', () => {
    render(<MessageInput />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    // Simulate text selection
    fireEvent.select(input);
    
    expect(screen.getByRole('toolbar')).toBeVisible();
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/message-flow.test.tsx
import { renderWithProviders, mockWebSocket } from '@/test-utils';

test('complete message flow', async () => {
  const { user } = renderWithProviders(<App />);
  
  // Navigate to channel
  await user.click(screen.getByText('#general'));
  
  // Type message
  const input = screen.getByPlaceholderText('Message #general');
  await user.type(input, 'Test message');
  
  // Send message
  await user.keyboard('{Enter}');
  
  // Verify optimistic update
  expect(screen.getByText('Test message')).toBeInTheDocument();
  
  // Simulate WebSocket confirmation
  mockWebSocket.emit('message.new', {
    id: '123',
    content: 'Test message',
    user: { name: 'Test User' }
  });
  
  // Verify final state
  expect(screen.getByTestId('message-123')).toBeInTheDocument();
});
```

## Security Implementation

### XSS Prevention
```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

const sanitizeHtml = (dirty: string) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre'],
    ALLOWED_ATTR: []
  });
};

// Safe rendering
const Message = ({ content }) => {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizeHtml(content) 
      }} 
    />
  );
};
```

### Authentication Security
```typescript
// Secure token storage
class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  
  setTokens(access: string, refresh: string) {
    // Store in httpOnly cookie via API
    api.post('/auth/store-tokens', { access, refresh });
    
    // Schedule refresh
    this.scheduleRefresh();
  }
  
  private scheduleRefresh() {
    // Refresh 5 minutes before expiry
    const expiresIn = this.getTokenExpiry() - Date.now() - 5 * 60 * 1000;
    
    this.refreshTimer = setTimeout(() => {
      this.refreshTokens();
    }, expiresIn);
  }
}
```

## Deployment Configuration

### Next.js Configuration
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  images: {
    domains: ['avatars.slack-clone.com'],
    formats: ['image/avif', 'image/webp']
  },
  
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options', 
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        }
      ]
    }
  ]
};
```

### Environment Variables
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.slack-clone.com
NEXT_PUBLIC_WS_URL=wss://ws.slack-clone.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_SENTRY_DSN=...
```

## Performance Metrics

### Target Metrics
- First Contentful Paint: < 1.2s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms
- Bundle size: < 250KB (initial)

### Monitoring
```typescript
// Web Vitals reporting
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```