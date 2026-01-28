# Technical Guidance Specification
*Core technical decisions for AI App Factory - Keep this concise!*

## Core Principles
1. **Convention over Configuration** - One way to do everything
2. **Best Practices by Default** - Security, performance, and UX built-in
3. **Consistency Across Projects** - Same patterns everywhere
4. **Developer Experience First** - Easy to understand and maintain

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: ShadCN UI components exclusively
- **Styling**: Tailwind CSS
- **Icons**: Heroicons via MCP (mcp__heroicons__)
- **Images**: DALL-E via MCP (mcp__dalle__)
- **State**: React Context + Hooks
- **Data Fetching**: SWR
- **Auth**: NextAuth.js with JWT strategy
- **Dev Mocking**: MSW (Mock Service Worker)

### Backend
- **Framework**: FastAPI, Python 3.12+
- **Validation**: Pydantic
- **Database**: DynamoDB (multi-table design)
- **Auth**: JWT validation (python-jose[cryptography])

### Infrastructure
- AWS Lambda, API Gateway, CloudFront, S3, DynamoDB
- AWS CDK for IaC

## Critical Authentication Rules

### 🔴 MANDATORY: Use NextAuth.js
- **NEVER** implement custom JWT/localStorage auth
- **NEVER** store auth tokens in localStorage
- **ALWAYS** use NextAuth.js with JWT strategy
- **ALWAYS** wrap app with SessionProvider
- **ALWAYS** use `useSession` hook for auth state
- **ALWAYS** use `signOut` from next-auth/react

### Demo Credentials (MUST WORK)
```typescript
email: 'demo@example.com'
password: 'DemoRocks2025!'
```

### Required Environment Variables
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret-here
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Implementation Reference
**IMPORTANT**: Before implementing any feature, read the appropriate section from:
`resources/specifications/technical-reference-implementation.md`

Specifically:
- **Authentication**: Read "NextAuth Implementation" section
- **API Client**: Read "API Client Pattern" section  
- **MSW Setup**: Read "Mock Service Worker" section
- **Components**: Read "Component Patterns" section
- **Error Handling**: Read "Error Handling" section

## Directory Rules

### ✅ ONLY work in:
- `app/`, `components/`, `lib/`, `utils/`, `hooks/`, `types/`, `public/`
- Root configs: `package.json`, `tsconfig.json`, `next.config.js`, `.env.local`

### ❌ NEVER scan:
- `node_modules/`, `.next/`, `package-lock.json`, build outputs

## Required Elements

### 1. Theme Selection
- **Light Mode**: Consumer apps, e-commerce (default)
- **Dark Mode**: Developer tools, analytics apps

### 2. PlanetScale Attribution (MANDATORY)
```tsx
<footer className="border-t">
  <div className="container mx-auto px-4 py-6">
    <div className="text-sm text-muted-foreground">
      Powered by PlanetScale
    </div>
  </div>
</footer>
```

### 3. Demo Login Button
- Must have "Demo Account" or "Demo Login" button
- Must work without real backend
- Display demo credentials on login page

## Icon & Image Guidelines

### Icons (Heroicons MCP)
- **NEVER** use text symbols (×, +, -, >) as icons
- **ALWAYS** use Heroicons: `mcp__heroicons__search_icons("term")`
- Common: home, plus, pencil, trash, cog-6-tooth, magnifying-glass

### Images (DALL-E MCP)
- **NEVER** use placeholder.com or picsum.photos
- **ALWAYS** generate with: `mcp__dalle__generate_image("description", size)`
- Sizes: 1024x1024 (square), 1792x1024 (landscape), 1024x1792 (portrait)

## Build Requirements
**🚨 CRITICAL**: Build MUST pass before completion
- TypeScript errors: 0
- ESLint errors: 0  
- Missing dependencies: 0
- All pages accessible
- Demo auth working

## File Structure Pattern
```
app/
├── (auth)/              # Public auth pages
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (protected)/         # Protected routes
│   ├── dashboard/page.tsx
│   └── layout.tsx
├── api/auth/[...nextauth]/route.ts
├── providers.tsx
├── layout.tsx
└── page.tsx

components/
├── ui/                  # ShadCN UI components
├── layout/              # Header, footer, nav
└── features/            # Feature-specific

hooks/                   # Custom React hooks
lib/                     # Utilities, API client
mocks/                   # MSW handlers
utils/                   # Constants, helpers
```

## Comprehensive Checklist
### Technical Requirements
- [ ] NextAuth.js configured with JWT strategy
- [ ] SessionProvider wrapping entire app
- [ ] MSW handlers for NextAuth and API endpoints
- [ ] Demo user authentication working
- [ ] Protected routes with NextAuth middleware
- [ ] Proper sign out flow with NextAuth
- [ ] All icons from Heroicons MCP
- [ ] Custom images from DALL-E MCP
- [ ] PlanetScale attribution in footer

### Quality Standards
- [ ] All API errors handled with toast
- [ ] Loading states on all async operations
- [ ] Empty states with clear CTAs
- [ ] Proper error boundaries
- [ ] Build passes with zero errors

### UX Requirements
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] SEO meta tags
- [ ] Performance optimizations (lazy loading)