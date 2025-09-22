# Multi-stage Dockerfile for Tourist Safety Backend
# This Dockerfile is placed in the repository root for Dokploy deployment

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code from builder stage
COPY --from=builder --chown=backend:nodejs /app .

# Create logs directory
RUN mkdir -p logs && chown backend:nodejs logs

# Switch to non-root user
USER backend

# Expose port
EXPOSE 7001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["npm", "start"]