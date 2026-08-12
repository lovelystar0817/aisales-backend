# Use official Python runtime as base image (multi-arch support)
FROM python:3.12-slim

# Build arguments
ARG COMMIT_HASH=unknown
ARG BUILD_DATE
ARG VERSION=latest

# Labels for metadata
LABEL maintainer="product@hupo.co"
LABEL version="$VERSION"
LABEL commit="$COMMIT_HASH"
LABEL build-date="$BUILD_DATE"
LABEL app="livekit-agent"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with retry options and CPU-only PyTorch
RUN pip install --no-cache-dir --upgrade pip && \
    TMPDIR=/tmp pip install --no-cache-dir --retries 5 --timeout 300 \
    torch>=2.0.0 --index-url https://download.pytorch.org/whl/cpu && \
    TMPDIR=/tmp pip install --no-cache-dir --retries 5 --timeout 300 -r requirements.txt

# Copy application code and startup script
COPY livekit-agent.py .
COPY heartbeat_monitor.py .
COPY start-agent.sh .

# Note: Google credentials are now mounted as a volume at runtime
# via docker-compose, not copied during build

# Make startup script executable
RUN chmod +x start-agent.sh

# Create non-root user
RUN adduser --disabled-password --gecos '' agentuser && \
    chown -R agentuser:agentuser /app
USER agentuser

# Add build info to environment
ENV COMMIT_HASH=$COMMIT_HASH
ENV BUILD_DATE=$BUILD_DATE
ENV VERSION=$VERSION

# Health check for the agent process
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD pidof python > /dev/null || exit 1

# Use the startup script that handles download + start with proper error checking
CMD ["./start-agent.sh"]