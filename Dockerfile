# Multi-stage Dockerfile for Batch Analyzer with Web UI
FROM oven/bun:1.2.17 AS base

# Install system dependencies for Chrome and Lighthouse
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Add Google Chrome repository and install Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Install Lighthouse globally
RUN bun install -g lighthouse

# Rust build stage
FROM rust:1.87-slim AS rust-builder

# Install system dependencies for building Rust
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Rust project files
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build the Rust application in release mode
RUN cargo build --release

# Node.js build stage for web UI
FROM base AS node-builder

# Set working directory for web UI
WORKDIR /app/web-ui

# Copy web UI package files
COPY web-ui/package.json web-ui/bun.lock* ./

# Install dependencies
RUN bun install

# Copy web UI source code
COPY web-ui ./

# Build the Next.js application
RUN bun run build

# Final stage
FROM base AS runtime

# Install additional dependencies needed at runtime
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create reports directory
RUN mkdir -p /app/reports

# Copy the compiled Rust binary
COPY --from=rust-builder /app/target/release/batch_analyzer /usr/local/bin/batch_analyzer

# Copy the built Next.js application
COPY --from=node-builder /app/web-ui/.next ./.next
COPY --from=node-builder /app/web-ui/package.json ./package.json
COPY --from=node-builder /app/web-ui/node_modules ./node_modules
COPY --from=node-builder /app/web-ui/public ./public

# Copy other necessary files
COPY urls.txt example-urls.txt ./

# Create a startup script to run both the CLI tool and web UI
RUN echo '#!/bin/bash\n\
    # Start the Next.js web UI in the background\n\
    bun start &\n\
    \n\
    # Keep the container running\n\
    echo "Batch Analyzer is ready!"\n\
    echo "Web UI is running on port 3000"\n\
    echo "CLI tool available as: batch_analyzer"\n\
    \n\
    # Wait for any process to exit\n\
    wait\n\
    ' > /app/start.sh && chmod +x /app/start.sh

# Environment variables for Railway
ENV NODE_ENV=production
ENV PORT=3000
ENV BATCH_ANALYZER_NAME="railway-analysis"
ENV BATCH_ANALYZER_REPORT_PREFIX="page"

# Expose port for the web UI
EXPOSE 3000

# Set Chrome flags for headless operation in containers
ENV CHROME_FLAGS="--headless --no-sandbox --disable-cache --disable-dev-shm-usage --disable-gpu"

# Default command
CMD ["/app/start.sh"]
