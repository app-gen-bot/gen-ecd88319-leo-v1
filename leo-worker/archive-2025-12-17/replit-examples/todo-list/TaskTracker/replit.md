# Overview

This is a full-stack TodoList application built with React frontend and Express backend. The application provides a clean, modern interface for task management with features like task creation, editing, completion tracking, and filtering. It follows a monorepo structure with shared TypeScript schemas between client and server, ensuring type safety across the entire application.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Routing**: Uses `wouter` for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Express.js**: RESTful API server with TypeScript
- **Storage Layer**: Abstracted storage interface with in-memory implementation (ready for database integration)
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot module replacement and error handling for development workflow

## Data Architecture
- **Schema-First Design**: Shared TypeScript schemas using Drizzle ORM table definitions
- **Type Safety**: End-to-end type safety from database to frontend using Zod validation
- **Database Ready**: Configured for PostgreSQL with Drizzle ORM (currently using in-memory storage)

## API Design
- **RESTful Endpoints**: Standard HTTP methods for CRUD operations
- **Resource Structure**: `/api/tasks` with support for filtering and bulk operations
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Request Logging**: Comprehensive logging of API requests with performance metrics

## Component Architecture
- **Modular Design**: Separated UI components for forms, lists, filters, and individual items
- **Reusable Components**: Extensive library of UI primitives from Shadcn/ui
- **Responsive Design**: Mobile-first approach with Tailwind CSS utilities
- **Accessibility**: Built-in accessibility features from Radix UI components

# External Dependencies

## Frontend Dependencies
- **UI Framework**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens
- **Icons**: Font Awesome for iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono)
- **State Management**: TanStack Query for server state and caching
- **Form Validation**: React Hook Form with Hookform Resolvers for Zod integration

## Backend Dependencies
- **Runtime**: Node.js with TypeScript execution via tsx
- **Database**: Neon Database (PostgreSQL) configured via DATABASE_URL environment variable
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Validation**: Zod for schema validation and type inference

## Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development**: Replit-specific plugins for error handling and code cartography
- **Database Management**: Drizzle Kit for migrations and schema management
- **Code Quality**: TypeScript strict mode with comprehensive type checking

## Database Configuration
- **Provider**: Neon Database serverless PostgreSQL
- **Connection**: Environment-based configuration via DATABASE_URL
- **Migrations**: Drizzle Kit migration system with version control
- **Schema Location**: Centralized schema definitions in `/shared/schema.ts`