import base64
import logging
from datetime import datetime
from typing import Annotated

import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from api.auth import get_current_user
from api.db import get_db
from api.models import Entry, Tag, User
from api.schemas import EntryCreate, EntryResponse, EntryUpdate, PaginatedEntries

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/entries", tags=["entries"])


# ---------------------------------------------------------------------------
# Cursor helpers
# ---------------------------------------------------------------------------


def _encode_cursor(created_at: datetime, entry_id: str) -> str:
    # Normalize to second precision ("YYYY-MM-DD HH:MM:SS") — matches SQLite's
    # server_default=func.now() storage format and is accepted by Postgres as a
    # timestamp literal without timezone.
    ts = created_at.strftime("%Y-%m-%d %H:%M:%S")
    raw = f"{ts},{entry_id}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def _decode_cursor(cursor: str) -> tuple[str, str]:
    """Return (timestamp_str, entry_id). timestamp_str is "YYYY-MM-DD HH:MM:SS" (no microseconds)."""
    try:
        raw = base64.urlsafe_b64decode(cursor.encode()).decode()
        ts_part, entry_id = raw.rsplit(",", 1)
        # Validate format, then return as a plain string so SQLAlchemy sends it
        # as a bind parameter without microsecond padding.
        datetime.strptime(ts_part, "%Y-%m-%d %H:%M:%S")
        return ts_part, entry_id
    except (ValueError, UnicodeDecodeError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor") from exc


# ---------------------------------------------------------------------------
# Tag helper
# ---------------------------------------------------------------------------


def _get_or_create_tags(db: Session, user_id: str, names: list[str]) -> list[Tag]:
    if not names:
        return []
    existing = db.query(Tag).filter(Tag.user_id == user_id, Tag.name.in_(names)).all()
    existing_map = {tag.name: tag for tag in existing}
    result: list[Tag] = []
    for name in names:
        if name in existing_map:
            result.append(existing_map[name])
        else:
            tag = Tag(user_id=user_id, name=name)
            db.add(tag)
            try:
                with db.begin_nested():
                    db.flush()
                existing_map[name] = tag
            except IntegrityError:
                # Concurrent request already created this tag — re-fetch it.
                tag = db.query(Tag).filter(Tag.user_id == user_id, Tag.name == name).one()
                existing_map[name] = tag
            result.append(tag)
    return result


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("/", response_model=EntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(
    body: EntryCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> EntryResponse:
    entry = Entry(user_id=current_user.id, content=body.content, mood=body.mood)
    db.add(entry)
    db.flush()
    entry.tags = _get_or_create_tags(db, current_user.id, body.tags)
    db.commit()
    db.refresh(entry)
    return EntryResponse.model_validate(entry)


@router.get("/", response_model=PaginatedEntries)
def list_entries(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    cursor: Annotated[str | None, Query()] = None,
) -> PaginatedEntries:
    query = (
        db.query(Entry)
        .options(joinedload(Entry.tags))
        .filter(Entry.user_id == current_user.id)
        .order_by(Entry.created_at.desc(), Entry.id.desc())
    )

    if cursor is not None:
        cursor_ts, cursor_id = _decode_cursor(cursor)
        # Use a plain string literal so it is sent without microsecond padding.
        # SQLite compares timestamps as text; Postgres implicitly casts the string.
        ts_lit = sa.literal(cursor_ts)
        query = query.filter(
            or_(
                Entry.created_at < ts_lit,
                and_(Entry.created_at == ts_lit, Entry.id < cursor_id),
            )
        )

    rows = query.limit(limit + 1).all()

    next_cursor: str | None = None
    if len(rows) > limit:
        rows = rows[:limit]
        last = rows[-1]
        next_cursor = _encode_cursor(last.created_at, last.id)  # type: ignore[arg-type]

    return PaginatedEntries(
        items=[EntryResponse.model_validate(e) for e in rows],
        next_cursor=next_cursor,
    )


@router.get("/{entry_id}", response_model=EntryResponse)
def get_entry(
    entry_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> EntryResponse:
    entry = (
        db.query(Entry)
        .options(joinedload(Entry.tags))
        .filter(Entry.id == entry_id, Entry.user_id == current_user.id)
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return EntryResponse.model_validate(entry)


@router.patch("/{entry_id}", response_model=EntryResponse)
def update_entry(
    entry_id: str,
    body: EntryUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> EntryResponse:
    entry = (
        db.query(Entry)
        .options(joinedload(Entry.tags))
        .filter(Entry.id == entry_id, Entry.user_id == current_user.id)
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    fields = body.model_fields_set
    if "content" in fields and body.content is not None:
        entry.content = body.content
    if "mood" in fields:
        entry.mood = body.mood
    if "tags" in fields:
        entry.tags = _get_or_create_tags(db, current_user.id, body.tags or [])

    db.commit()
    db.refresh(entry)
    return EntryResponse.model_validate(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    entry = (
        db.query(Entry)
        .filter(Entry.id == entry_id, Entry.user_id == current_user.id)
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
