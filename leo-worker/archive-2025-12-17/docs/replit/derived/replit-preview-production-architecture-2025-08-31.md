# Replit Preview and Production Architecture Analysis
*Date: 2025-08-31*

Based on analysis of `docs/design/replit-design.txt`, this document details the Preview and Production tech stack architectures for generated applications.

## Preview Tech Stack & Architecture

From the document analysis, the preview system uses:

### Frontend (Preview Environment)
- React 18 + TypeScript
- Vite development server with Hot Module Replacement (HMR)
- TanStack Query for state management
- Shadcn/UI components + Tailwind CSS
- Wouter for lightweight routing
- React Hook Form with Zod validation

### Backend (Preview Environment)
- Express.js + TypeScript
- In-memory storage (MemStorage) for development
- RESTful API with Zod validation
- Port 5000 for preview serving

### Development Workflow
- Live preview through embedded webview/iframe
- Real-time updates via WebSocket (Vite HMR)
- Automatic compilation and hot reloading
- Console integration showing both frontend and backend logs

### Preview Display Mechanism
- Headless browser (Chromium-based) takes screenshots
- Screenshots embedded in chat interface
- Live webview panel shows running application
- Automatic health checks and error detection

## Production/Built Tech Stack

The document describes production deployment through Replit's infrastructure:

### Production Architecture
- **Hosting**: Google Cloud Platform (GCP) data centers
- **Container**: Node.js 20 Alpine containers
- **Load Balancing**: Automatic with health checks
- **SSL**: Automatic HTTPS certificates
- **CDN**: Global distribution for static assets
- **Scaling**: Autoscale (0→∞) based on demand

### Database (Production Ready)
- PostgreSQL via Neon Database (serverless)
- Drizzle ORM for type-safe operations  
- Connection pooling and automatic scaling
- Built-in backups and point-in-time recovery

### Authentication (Ready but not activated)
- Passport.js framework
- Session-based auth with PostgreSQL storage
- Argon2 password hashing
- Enterprise security features (CSRF protection, rate limiting)

### Deployment Options
1. **Autoscale Deployment**: $1/month + usage-based pricing
2. **Static Deployment**: Free hosting + transfer costs
3. **Reserved VM**: $10-160/month for predictable workloads
4. **Scheduled Deployment**: For cron jobs and batch processing

### Production Features
- Zero-downtime deployments
- Blue-green deployment strategy
- Automatic monitoring and health checks
- Cost tracking and budget alerts
- Geographic distribution with CDN

## Key Insights

The key insight is that Replit provides a seamless transition from preview (development) to production, with the same codebase automatically optimized and deployed to enterprise-grade infrastructure.

### Preview to Production Transition
- **Development**: In-memory storage, hot reloading, development tools
- **Production**: PostgreSQL database, container orchestration, enterprise security
- **Seamless Migration**: Same codebase, automatic optimization and deployment

This architecture enables rapid development with immediate preview capabilities while maintaining production-ready scalability and enterprise-grade security features.