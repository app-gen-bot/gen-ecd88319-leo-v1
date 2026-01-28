# PlanetScale AI App Factory - Frontend

This is the frontend for PlanetScale AI App Factory, built with Next.js 14, React 18, and Tailwind CSS.

## Features

- 🎨 Modern, responsive design with dark/light theme support
- ⚡ Fast page loads with Next.js App Router
- 🎯 Interactive demos and animations
- 📱 Mobile-first responsive design
- ♿ WCAG AA accessibility compliance
- 🔒 Enterprise-grade security features

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (pages)/           # Page components
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   └── (sections)/       # Page sections
├── lib/                   # Utilities and helpers
├── public/               # Static assets
└── styles/               # Global styles
```

## Key Technologies

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Heroicons + Lucide

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

This application is optimized for deployment on Vercel:

```bash
npm run build
```

## Contributing

Please read our contributing guidelines before submitting PRs.

## License

Copyright © 2024 PlanetScale AI. All rights reserved.