---
name: readme-generator
description: >
  Generate app-specific README.md files with setup instructions, database rehydration,
  and deployment guidance. Use after app generation is complete.
category: documentation
priority: P1
---

# README Generator

## When to Use

**Use this skill when**:
- App generation is complete
- User requests documentation
- Generating deployment-ready apps

**AUTO-INVOKE** after: schema, contracts, routes, and pages are generated.

---

## README Structure

Generate a README.md with these sections:

### 1. App Title & Description
- App name from project
- Brief description of what the app does

### 2. Tech Stack
```markdown
## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
```

### 3. Quick Start
```markdown
## Quick Start

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev
```

App runs at http://localhost:5000
```

### 4. Database Setup (CRITICAL)

**Include this section for database rehydration:**

```markdown
## Database Setup

### Option 1: Fresh Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy credentials to `.env`:
   ```bash
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   DATABASE_URL=postgresql://...@db.xxx.supabase.co:5432/postgres
   DATABASE_URL_POOLING=postgresql://...@pooler.supabase.com:6543/postgres
   ```
3. Apply schema and seed data:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Demo Users

After seeding, these accounts are available:

| Email | Password | Role |
|-------|----------|------|
| john@app.com | Demo2025_ | user |
| admin@app.com | Demo2025_ | admin |

### Option 2: Local Development (No Database)

For local testing without Supabase:
```bash
AUTH_MODE=mock
STORAGE_MODE=memory
npm run dev
```
```

### 5. Environment Variables
```markdown
## Environment Variables

Create a `.env` file:

```bash
# Supabase (Production)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database
DATABASE_URL=postgresql://...          # Direct (port 5432) - migrations
DATABASE_URL_POOLING=postgresql://...  # Pooled (port 6543) - runtime

# App Config
AUTH_MODE=supabase    # or 'mock' for local dev
STORAGE_MODE=database # or 'memory' for local dev
PORT=5000
```
```

### 6. Available Scripts
```markdown
## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (frontend + backend) |
| `npm run build` | Build for production |
| `npm run db:push` | Apply schema to database |
| `npm run db:seed` | Seed demo users |
| `npm run db:migrate` | Run migrations |
```

### 7. Deployment (Fly.io)

```markdown
## Deployment

### Fly.io

1. Install Fly CLI: `brew install flyctl`
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Set secrets:
   ```bash
   fly secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=... DATABASE_URL_POOLING=...
   ```
5. Deploy: `fly deploy`

**Database Rehydration**: Migrations run automatically on deploy via:
```toml
[deploy]
  release_command = "npm run db:push && npm run db:seed"
```
```

### 8. Project Structure (Customize per app)
```markdown
## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── lib/            # API client, utilities
│   │   └── pages/          # Page components
├── server/                 # Express backend
│   ├── lib/                # Auth, storage, database
│   ├── middleware/         # Auth middleware
│   └── routes/             # API routes
├── shared/                 # Shared types and contracts
│   ├── contracts/          # ts-rest API contracts
│   └── schema.ts           # Drizzle schema
└── drizzle/                # Database migrations
```
```

---

## Customization Rules

When generating README:

1. **App Name**: Extract from package.json or directory name
2. **Description**: Summarize from PRD or infer from schema entities
3. **Tables**: List actual tables from schema.ts
4. **Seed Users**: Use actual credentials from seed.ts (default: john@app.com, admin@app.com)
5. **Pages**: List actual pages from client/src/pages/
6. **API Endpoints**: List from shared/contracts/

---

## Template

```markdown
# {App Name}

{Brief description of the app}

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui

## Quick Start

```bash
npm install
npm run dev
```

App runs at http://localhost:5000

## Database Setup

### Fresh Database

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Copy credentials to `.env` (see Environment Variables below)
3. Apply schema and seed:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Demo Users

| Email | Password | Role |
|-------|----------|------|
| john@app.com | Demo2025_ | user |
| admin@app.com | Demo2025_ | admin |

### Local Development (No Database)

```bash
AUTH_MODE=mock STORAGE_MODE=memory npm run dev
```

## Environment Variables

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database
DATABASE_URL=postgresql://...@db.xxx.supabase.co:5432/postgres
DATABASE_URL_POOLING=postgresql://...@pooler.supabase.com:6543/postgres

# App
AUTH_MODE=supabase
STORAGE_MODE=database
PORT=5000
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Apply schema to database |
| `npm run db:seed` | Seed demo users |

## Deployment (Fly.io)

```bash
fly launch
fly secrets set SUPABASE_URL=... DATABASE_URL_POOLING=...
fly deploy
```

Migrations run automatically on deploy.

## Project Structure

```
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared contracts & schema
└── drizzle/          # Database migrations
```
```

---

## Checklist

Before completing README generation:

- [ ] App name is correct (not placeholder)
- [ ] Description matches actual app functionality
- [ ] Demo user credentials match seed.ts
- [ ] Environment variables list is complete
- [ ] Scripts match package.json
- [ ] Database rehydration section is included
