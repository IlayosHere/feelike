FROM python:3.12-slim

WORKDIR /app

# Install dependencies first — separate layer for cache efficiency
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user
RUN adduser --uid 1000 --disabled-password --gecos "" appuser

# Copy the rest of the backend source and fix ownership
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8080

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
