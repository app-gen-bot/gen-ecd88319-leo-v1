# FizzCard Frontend

> Vibrant, mobile-first contact sharing platform with crypto rewards

## Overview

FizzCard is a modern React application built with TypeScript, Vite, and Tailwind CSS. It features a dark-mode-first design system with glass-morphism effects, vibrant colors, and smooth animations.

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom design tokens
- **Routing:** Wouter (lightweight React router)
- **State Management:** React Context + React Query
- **API Client:** ts-rest for type-safe API calls
- **QR Code:** react-qr-code (generation), @yudiel/react-qr-scanner (scanning)
- **Icons:** Lucide React
- **Validation:** Zod schemas (shared with backend)

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── auth/          # Auth-related components (ProtectedRoute)
│   │   ├── fizzcard/      # QR code display/scanner
│   │   ├── layout/        # AppLayout, Header, BottomNav
│   │   └── ui/            # Shared UI components
│   ├── contexts/          # React contexts (AuthContext)
│   ├── lib/               # Utilities (api-client, auth-helpers, geolocation)
│   ├── pages/             # Page components
│   ├── styles/            # Design tokens and global styles
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Key Features Implemented

### 1. Authentication System
- **AuthContext**: Manages user authentication state
- **Login/Signup Pages**: Full authentication flow
- **ProtectedRoute**: Guards authenticated routes
- **Token Management**: Persists auth in localStorage

### 2. Core UI Components
- **GlassCard**: Glass-morphism card with backdrop blur
- **Button**: Multiple variants (primary, secondary, ghost, fizzCoin)
- **Avatar**: User avatars with fallback initials
- **Badge**: Status and category badges with glow effects
- **Modal**: Full-screen modal with animations
- **Input**: Form inputs with labels and validation
- **Skeleton**: Loading placeholders with shimmer

### 3. Layout Components
- **AppLayout**: Main layout wrapper
- **Header**: Desktop navigation with user menu
- **BottomNav**: Mobile navigation (sticky bottom)
- **Responsive**: Adapts to mobile/tablet/desktop

### 4. FizzCard Features
- **QRCodeDisplay**: Generate QR codes from FizzCard ID
- **QRScanner**: Full-screen QR scanner with GPS capture
- **FizzCoinDisplay**: Gold-styled FizzCoin amounts

### 5. Pages
- **HomePage**: Landing page with hero and features
- **LoginPage/SignupPage**: Authentication forms
- **DashboardPage**: Main dashboard with stats and quick actions
- **MyFizzCardPage**: Display user's FizzCard with QR code
- **ScannerPage**: QR code scanner with contact preview
- **ProfilePage**: User profile with stats and badges

## Design System

### Colors
- **Primary**: Vibrant cyan (#00D9FF)
- **Accent**: Neon purple (#B744FF)
- **FizzCoin**: Gold (#FFD700)
- **Background**: Deep dark (#0A0A0F, #1A1A24, #2A2A3A)
- **Text**: White (#FFFFFF), gray shades

### Typography
- **Sans**: Inter (body text)
- **Display**: DM Sans (headings)
- **Mono**: JetBrains Mono (FizzCoin amounts)

### Animations
- Fade in, slide up/down, scale in
- Shimmer (loading states)
- Glow pulse (QR codes, FizzCoin)
- Scan line (QR scanner)

### Responsive Breakpoints
- Mobile: < 768px (bottom navigation)
- Tablet: 768px - 1023px
- Desktop: 1024px+ (header navigation)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend server running on http://localhost:5013

### Installation

```bash
cd client
npm install
```

### Environment Variables

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:5013
```

### Development

```bash
npm run dev
```

App will be available at http://localhost:5014

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## API Integration

### API Client Setup

The app uses `@ts-rest/core` for type-safe API calls:

```typescript
import { apiClient } from '@/lib/api-client';

// Example API call
const response = await apiClient.auth.login({
  body: { email, password },
});
```

### Authentication Flow

1. User logs in via `/login`
2. Token stored in localStorage
3. `AuthContext` manages auth state
4. API client includes token in headers via getter property
5. Protected routes check auth status

### Geolocation

- Captures GPS coordinates during QR scanning
- Uses browser Geolocation API
- Handles permission requests and errors
- Optional reverse geocoding (TODO)

## Design Patterns

### Component Patterns
- **Functional components** with hooks
- **React.forwardRef** for inputs
- **Custom hooks** for reusable logic
- **Compound components** for complex UI

### State Management
- **React Context** for global state (auth)
- **React Query** for server state (cached API calls)
- **Local state** for component-specific state

### API Calls
- Always use `apiClient` (never fetch directly)
- React Query for caching and loading states
- Error handling with try/catch
- Loading states with skeletons

### Styling
- **Tailwind CSS** utility classes
- **Design tokens** for consistency
- **cn()** utility for class merging
- **Responsive classes** (md:, lg:, etc.)

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators (ring-2 ring-primary-500)
- Screen reader friendly
- Reduced motion support (@prefers-reduced-motion)

## Performance Optimizations

- Lazy loading (future: React.lazy for routes)
- Image optimization (future: responsive images)
- Virtual scrolling (future: for long lists)
- Debounced search inputs
- React Query caching

## Future Enhancements

### Pending Implementation
- **ConnectionsPage**: Full connections list with filters
- **WalletPage**: FizzCoin wallet with transaction history
- **LeaderboardPage**: Top users ranked by FizzCoin
- **EventsPage**: Networking events list
- **SettingsPage**: User preferences and privacy

### Advanced Features
- **Real-time notifications**: WebSocket integration
- **Offline support**: Service worker, PWA
- **Advanced animations**: Framer Motion
- **Dark/light mode toggle**: Theme switcher
- **Internationalization**: i18n support

## Troubleshooting

### Common Issues

**Import errors for design tokens:**
```typescript
// Use relative imports if path alias fails
import { colors } from '../styles/design-tokens';
```

**QR scanner not working:**
- Ensure HTTPS in production (required for camera access)
- Check browser compatibility
- Allow camera permissions

**API calls failing:**
- Verify backend is running on port 5013
- Check VITE_API_URL in .env
- Inspect browser console for errors

**Type errors:**
```bash
# Run type checking to see all errors
npm run type-check
```

## Contributing

1. Follow the existing code style
2. Use TypeScript strict mode
3. Add JSDoc comments for complex functions
4. Test on mobile and desktop
5. Ensure accessibility

## License

MIT

---

**Built with Claude Code** - Production-ready frontend implementation
