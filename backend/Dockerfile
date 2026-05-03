FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN adduser --uid 1000 --disabled-password --gecos "" appuser

COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8080

# Run migrations then start the server
CMD ["sh", "-c", "alembic upgrade head && uvicorn api.main:app --host 0.0.0.0 --port 8080 --workers 1"]
