import logging
import os

from dotenv import load_dotenv

load_dotenv()

from pythonjsonlogger.json import JsonFormatter  # noqa: E402 — must follow load_dotenv

from fastapi import FastAPI, Response  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from slowapi import _rate_limit_exceeded_handler  # noqa: E402
from slowapi.errors import RateLimitExceeded  # noqa: E402
from sqlalchemy import text  # noqa: E402

from api.db import SessionLocal  # noqa: E402
from api.limiter import limiter  # noqa: E402
from api.routes.auth import router as auth_router  # noqa: E402
from api.routes.entries import router as entries_router  # noqa: E402
from api.routes.tags import router as tags_router  # noqa: E402

_handler = logging.StreamHandler()
_handler.setFormatter(
    JsonFormatter(fmt="%(timestamp)s %(level)s %(name)s %(message)s", rename_fields={"levelname": "level", "asctime": "timestamp"})
)
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO").upper(),
    handlers=[_handler],
)

logger = logging.getLogger(__name__)

_raw_origins = os.environ.get("CORS_ORIGINS", "")
if not _raw_origins.strip():
    raise RuntimeError("CORS_ORIGINS environment variable is not set")
_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app = FastAPI(title="feelike API", version="0.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(entries_router)
app.include_router(tags_router)


@app.get("/healthz", tags=["ops"])
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/readyz", tags=["ops"])
def readyz(response: Response) -> dict[str, str]:
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception:
        logger.exception("readyz: database unreachable")
        response.status_code = 503
        return {"status": "unavailable"}
