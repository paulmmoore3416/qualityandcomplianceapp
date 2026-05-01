# Multi-stage build for optimized image size
FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.11-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy application code
COPY *.py ./

# Create necessary directories
RUN mkdir -p /app/chroma_db /app/compliance-reports /app/logs

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV REPO_PATH=/repo
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV CHROMA_DB_PATH=/app/chroma_db
ENV REPORTS_DIR=/app/compliance-reports

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import sys; sys.exit(0)"

# Run as non-root user
RUN useradd -m -u 1000 compliance && \
    chown -R compliance:compliance /app
USER compliance

# Run the application
CMD ["python", "main.py"]
