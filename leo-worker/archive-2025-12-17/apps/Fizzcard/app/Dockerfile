# Build stage for frontend
FROM node:20-alpine AS frontend-builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ py3-pip

WORKDIR /app

# Copy root package files (includes workspace configuration)
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace package.json files (shared doesn't have one)
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install ALL dependencies at the root level (this respects workspaces)
RUN npm ci --prefer-offline --no-audit

# Fix rollup optional dependency issue on Alpine Linux (detect architecture)
RUN if [ "$(uname -m)" = "x86_64" ]; then \
        npm install --no-save @rollup/rollup-linux-x64-musl; \
    elif [ "$(uname -m)" = "aarch64" ]; then \
        npm install --no-save @rollup/rollup-linux-arm64-musl; \
    fi

# Install Sharp with correct Alpine Linux binaries (musl libc)
# This ensures Sharp works in Alpine Linux container
# Detect architecture and install appropriate Sharp binaries
RUN if [ "$(uname -m)" = "x86_64" ]; then \
        npm install --os=linux --libc=musl --cpu=x64 sharp --workspace=server; \
    elif [ "$(uname -m)" = "aarch64" ]; then \
        npm install --os=linux --libc=musl --cpu=arm64 sharp --workspace=server; \
    fi

# Now copy the actual source files
COPY shared ./shared
COPY client/tsconfig*.json ./client/
COPY client/vite.config.ts ./client/
COPY client/tailwind.config.js ./client/
COPY client/postcss.config.js ./client/
COPY client/.eslintrc.cjs ./client/
COPY client/index.html ./client/
COPY client/public ./client/public
COPY client/src ./client/src

# Build frontend
WORKDIR /app/client
RUN npm run build
WORKDIR /app

# Build stage for backend
FROM node:20-alpine AS backend-builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ py3-pip

WORKDIR /app

# Copy root package files (includes workspace configuration)
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace package.json files (shared doesn't have one)
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install ALL dependencies at the root level (this respects workspaces)
RUN npm ci --prefer-offline --no-audit

# Install Sharp with correct Alpine Linux binaries (musl libc)
# This ensures Sharp works in Alpine Linux container for backend
# Detect architecture and install appropriate Sharp binaries
RUN if [ "$(uname -m)" = "x86_64" ]; then \
        npm install --os=linux --libc=musl --cpu=x64 sharp --workspace=server; \
    elif [ "$(uname -m)" = "aarch64" ]; then \
        npm install --os=linux --libc=musl --cpu=arm64 sharp --workspace=server; \
    fi

# Now copy the actual source files
COPY shared ./shared
COPY server/tsconfig.json ./server/
COPY server ./server

# Build backend
WORKDIR /app/server
RUN npm run build
WORKDIR /app

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy shared workspace (needed for runtime)
COPY shared ./shared

# Copy built backend from builder
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/package*.json ./server/

# Copy built frontend from builder
COPY --from=frontend-builder /app/client/dist ./client/dist

# Install only production dependencies for server
WORKDIR /app/server
RUN npm ci --only=production --prefer-offline --no-audit

# Install Sharp with correct Alpine Linux binaries for production
# Critical for image processing in upload routes
# Detect architecture and install appropriate Sharp binaries
RUN if [ "$(uname -m)" = "x86_64" ]; then \
        npm install --os=linux --libc=musl --cpu=x64 sharp; \
    elif [ "$(uname -m)" = "aarch64" ]; then \
        npm install --os=linux --libc=musl --cpu=arm64 sharp; \
    fi

# Set environment to production
ENV NODE_ENV=production

# Set port for the server (it reads from PORT env var)
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "dist/server/index.js"]
