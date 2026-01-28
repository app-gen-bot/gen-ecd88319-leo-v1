# ============================================
# Leo Container - Multi-Stage Dockerfile
# ============================================
# Production-ready containerization for the Leo remote CLI container
# Runs real Leo only (no mock mode)

# ============================================
# Stage 1: Dependencies
# ============================================
FROM python:3.12-slim AS dependencies

WORKDIR /factory

# Copy requirements first for Docker layer caching
COPY requirements.txt .

# Install dependencies without cache to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# ============================================
# Stage 2: Runtime
# ============================================
FROM python:3.12-slim AS runtime

WORKDIR /factory

# Install Node.js, Claude Code CLI, Chromium, Xvfb
RUN apt-get update && \
    apt-get install -y curl git chromium xvfb && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g @anthropic-ai/claude-code chrome-devtools-mcp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Supabase CLI (via .deb from GitHub releases)
# Note: Using specific version for reproducibility
RUN ARCH=$(dpkg --print-architecture) && \
    curl -fsSL "https://github.com/supabase/cli/releases/download/v2.70.5/supabase_2.70.5_linux_${ARCH}.deb" -o /tmp/supabase.deb && \
    dpkg -i /tmp/supabase.deb && \
    rm /tmp/supabase.deb

# Install Fly.io CLI
RUN curl -L https://fly.io/install.sh | FLYCTL_INSTALL=/usr/local sh

# Install uv (Python package manager - required for MCP tools)
# Install to /usr/local, then move binaries to /usr/local/bin for PATH access
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/usr/local sh && \
    mv /usr/local/uv /usr/local/bin/uv && \
    mv /usr/local/uvx /usr/local/bin/uvx

# Set Chrome path for puppeteer/playwright and npm global bin path
ENV CHROME_BIN=/usr/bin/chromium \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PATH="/usr/local/lib/node_modules/.bin:$PATH"

# Install only runtime dependencies (copy from dependencies stage)
COPY --from=dependencies /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# ============================================
# Copy source code
# ============================================

# Copy all Python source code (cc_agent, cc_tools, leo, runtime)
# All packages under /factory/ - no pip install -e needed, just PYTHONPATH
# Resources (config, prompts) are inside leo/resources/
# Skills are in .claude/skills/ (copied separately to ~/.claude/skills/)
COPY src/ ./

# Copy .env file if present (optional - for local dev Claude token)
# In production: All values come from environment variables passed by Leo SaaS
# IMPORTANT: .env should NOT contain Supabase credentials - agent creates projects
COPY .env* ./

# Copy Claude Code configuration and skills
# settings.json configures MCP servers (Supabase, Chrome DevTools)
# skills/ enables Claude Code's automatic skill discovery
COPY .claude/settings.json /home/leo-user/.claude/settings.json
COPY .claude/skills/ /home/leo-user/.claude/skills/

# Create workspace directory for generated apps
RUN mkdir -p /workspace/app /workspace/leo-artifacts

# Create non-root user for security
RUN useradd -m -u 1000 leo-user && \
    mkdir -p /workspace /output && \
    chown -R leo-user:leo-user /factory /workspace /output /home/leo-user

# Build manifest for version tracking (ARG declared last to maximize cache hits)
ARG BUILD_MANIFEST="{}"
RUN echo "$BUILD_MANIFEST" > /build-manifest.json

# Switch to non-root user
USER leo-user

# Expose port (if needed in future for health checks)
# EXPOSE 8080

# Health check - verify Python can run
# This can be enhanced to check WebSocket connection when needed
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import sys; sys.exit(0)"

# Set environment variables (can be overridden at runtime)
# PYTHONPATH=/factory enables imports: cc_agent, cc_tools, leo, runtime
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LOG_LEVEL=INFO \
    GENERATOR_MODE=real \
    PYTHONPATH=/factory \
    APP_FACTORY_ROOT=/factory

# Entry point - run the main application
CMD ["python", "/factory/main.py"]
