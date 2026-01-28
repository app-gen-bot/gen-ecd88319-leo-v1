# ============================================
# IMPORTANT: PLAYWRIGHT E2E TESTING SUPPORT NEEDED
# ============================================
# TODO: Playwright is needed in PRODUCTION for testing generated apps
# Currently removed from package.json due to Alpine Linux incompatibility.
#
# PROBLEM: Playwright's postinstall script downloads browser binaries that
# require system libraries not available in Alpine, causing npm ci to hang
# for 9+ minutes and fail.
#
# SOLUTION OPTIONS:
#   1. Switch base image from node:20-alpine to node:20-slim (Debian-based)
#      - Playwright officially supports Debian/Ubuntu
#      - Use: mcr.microsoft.com/playwright:v1.56.1-noble (includes browsers)
#      - OR: node:20-slim + RUN npx playwright install --with-deps
#
#   2. Install Alpine packages (harder, not officially supported)
#      - RUN apk add chromium firefox webkit2gtk
#      - Set PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
#      - Configure Playwright to use system browsers
#
#   3. Use separate sidecar container for E2E testing
#      - Keep this container lightweight (Alpine)
#      - Run mcr.microsoft.com/playwright container separately
#
# CURRENT STATE: Playwright removed from package.json to fix builds.
# When re-adding, ALSO update this Dockerfile's base image.
#
# See: https://playwright.dev/docs/docker
# ============================================

# ============================================
# Build Stage - Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Accept build arguments for frontend (Vite bakes these into the JavaScript bundle at build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL=""

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY client ./client
COPY shared ./shared

# Build frontend (Vite will use VITE_* build args)
RUN npm run build

# ============================================
# Build Stage - Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev for TypeScript)
RUN npm ci

# Copy source code
COPY server ./server
COPY shared ./shared

# TypeScript is already compiled during npm run build in package.json
# But we need the server code available for runtime

# ============================================
# Production Stage
# ============================================
FROM node:20-alpine AS production

# Build arguments for version tracking
ARG GIT_COMMIT=unknown
ARG BUILD_TIME=unknown
ARG APP_VERSION=dev
ARG BUILD_MANIFEST="{}"

WORKDIR /app

# Write build manifest for provenance tracking (baked into image, immutable)
RUN echo "$BUILD_MANIFEST" > /app/version.json

# Install git (required for GitHub repository creation)
RUN apk add --no-cache git curl

# Configure git for automated commits
RUN git config --global user.email "bot@app-gen-saas.com" && \
    git config --global user.name "App Gen SaaS Bot"

# Install Fly.io CLI (flyctl) for automated deployments
RUN curl -L https://fly.io/install.sh | sh
ENV FLYCTL_INSTALL="/root/.fly"
ENV PATH="$FLYCTL_INSTALL/bin:$PATH"

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend from frontend-builder (Vite outputs to client/dist due to root config)
COPY --from=frontend-builder /app/dist ./dist

# Copy backend source (we'll use tsx for runtime)
COPY --from=backend-builder /app/server ./server
COPY --from=backend-builder /app/shared ./shared
COPY tsconfig.json ./

# Install tsx for running TypeScript in production
RUN npm install tsx

# Create directory for generated apps (local mode)
RUN mkdir -p /tmp/generations

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5013
ENV GIT_COMMIT=${GIT_COMMIT}
ENV BUILD_TIME=${BUILD_TIME}
ENV APP_VERSION=${APP_VERSION}

# Expose port
EXPOSE 5013

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5013/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
# Serve both frontend and backend
CMD ["npm", "run", "start:prod"]
