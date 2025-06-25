# Alternative multi-stage Dockerfile with better optimization
FROM node:22-alpine AS dependencies

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Generate package-lock.json if missing and install all dependencies
RUN if [ ! -f package-lock.json ]; then \
        npm install --package-lock-only --no-audit; \
    fi && \
    npm ci --no-audit

# Production stage
FROM node:22-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY package*.json ./

# Generate lock file if missing and install production dependencies
RUN if [ ! -f package-lock.json ]; then \
        npm install --package-lock-only --no-audit; \
    fi && \
    npm ci --omit=dev --no-audit && \
    npm cache clean --force

# Copy application source with proper ownership
COPY --chown=appuser:nodejs . .

# Create directories
RUN mkdir -p logs public && \
    chown -R appuser:nodejs /app

# Clean up
RUN rm -rf .env* README.md .git* *.md

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "const http = require('http'); \
    const req = http.request({host:'localhost',port:8001,path:'/whoami',timeout:5000}, \
    (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
