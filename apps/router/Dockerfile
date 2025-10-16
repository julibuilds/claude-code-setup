# Multi-stage Dockerfile for Claude Code Router
# Stage 1: Dependencies and build
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy root package files
COPY package.json bun.lock ./
COPY turbo.json ./

# Copy workspace package files
COPY packages/core/package.json ./packages/core/package.json
COPY apps/router/package.json ./apps/router/package.json

# Install all dependencies (including dev dependencies for build)
RUN bun install

# Copy source code
COPY packages/core ./packages/core
COPY apps/router ./apps/router

# Build core library first
WORKDIR /app/packages/core
RUN bun run build

# Build router service
WORKDIR /app/apps/router
RUN bun run build

# Stage 2: Production runtime
FROM oven/bun:1-slim AS runtime

WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/packages/core/package.json ./packages/core/package.json
COPY --from=builder /app/apps/router/package.json ./apps/router/package.json

# Install only production dependencies
RUN bun install --production

# Copy built artifacts
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/apps/router/dist ./apps/router/dist

# Copy example configuration
COPY --from=builder /app/apps/router/config.example.json ./apps/router/config.example.json

# Create directory for user configuration
RUN mkdir -p /app/config

# Set working directory to router app
WORKDIR /app/apps/router

# Environment variables with defaults
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3456

# Expose the default port
EXPOSE 3456

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3456/').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run the application
CMD ["bun", "dist/index.js"]
