import logging
import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import NullPool

logger = logging.getLogger(__name__)

_DATABASE_URL = os.environ.get("DATABASE_URL")
if not _DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

_connect_args = {"check_same_thread": False} if _DATABASE_URL.startswith("sqlite") else {}

# SQLite (dev/test) uses NullPool — no persistent connections, thread-safe.
# Postgres (prod) uses a bounded pool sized for Cloud Run's containerConcurrency.
if _DATABASE_URL.startswith("sqlite"):
    engine = create_engine(_DATABASE_URL, connect_args=_connect_args, poolclass=NullPool)
else:
    engine = create_engine(
        _DATABASE_URL,
        connect_args=_connect_args,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
