# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
PawsFlow is a veterinary practice management SaaS application with separate portals for pet owners (clients) and veterinary staff. The frontend is built with Next.js 14 App Router and follows modern React patterns.

## Development Commands

```bash
# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14.0.4 with App Router
- **UI Components**: ShadCN UI (built on Radix UI)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand for global state, SWR for server state
- **TypeScript**: Strict mode with path aliases (@/)

### Project Structure
```
app/
├── client/         # Pet owner portal (/client/*)
├── staff/          # Veterinary staff portal (/staff/*)
├── (auth)/         # Auth pages (login, signup, forgot-password)
└── (marketing)/    # Public pages (home, features, pricing)

components/
├── ui/             # ShadCN UI components (button, card, form, etc.)
└── *.tsx           # Feature-specific components

lib/
├── api-client.ts   # Centralized API client with typed methods
├── mock-data.ts    # Mock data for development/demo
└── utils.ts        # Utility functions including cn() for className merging
```

### Key Architectural Patterns

1. **Authentication Flow**
   - `AuthContext` provider wraps the app
   - `AuthCheck` component guards protected routes
   - Role-based routing (pet_owner vs staff roles)
   - Session stored in localStorage/sessionStorage

2. **API Integration**
   - All API calls go through `ApiClient` class
   - Consistent error handling with `ApiError`
   - Mock mode available for demo/development
   - RESTful patterns with typed request/response

3. **Component Patterns**
   - ShadCN UI components use composition pattern
   - Variants handled via class-variance-authority
   - Form components integrate React Hook Form
   - Consistent loading/error/empty states

4. **Route Protection**
   ```tsx
   // Protected routes use AuthCheck
   <AuthCheck requiredRole="staff">
     <Component />
   </AuthCheck>
   ```

5. **Form Handling**
   ```tsx
   // Forms use React Hook Form + Zod
   const form = useForm<FormData>({
     resolver: zodResolver(schema),
   });
   ```

### Portal-Specific Features

**Client Portal** (`/client/*`)
- Pet profiles with medical history
- Appointment scheduling (4-step wizard)
- Medical records viewing
- Prescription management
- Billing and payments
- Messaging with clinic

**Staff Portal** (`/staff/*`)
- Role-based dashboards (veterinarian, technician, receptionist)
- Schedule management with drag-and-drop
- Patient check-in workflow
- SOAP note creation
- Inventory management
- Team communications

### Testing Infrastructure
Visual testing with Puppeteer scripts:
- `browser-test.js` - Comprehensive UI testing
- `quick-visual-test.js` - Quick regression checks
- Screenshots saved to `test-screenshots/`

### Important Notes
- Demo authentication: demo@example.com / demo123
- Mock data mode enabled by default
- Dark mode supported via CSS variables
- Mobile-responsive with viewport testing
- "Powered by PlanetScale" attribution required