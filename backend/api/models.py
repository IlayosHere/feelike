from uuid import uuid4

import sqlalchemy as sa
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.db import Base

MOOD_VALUES: frozenset[str] = frozenset({"happy", "excited", "sad", "anxious", "angry", "calm"})

entry_tags = sa.Table(
    "entry_tags",
    Base.metadata,
    sa.Column(
        "entry_id",
        String(36),
        ForeignKey("entries.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    sa.Column(
        "tag_id",
        String(36),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Index("ix_entry_tags_entry_id", "entry_id"),
    Index("ix_entry_tags_tag_id", "tag_id"),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[sa.DateTime] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )

    entries: Mapped[list["Entry"]] = relationship("Entry", back_populates="user", cascade="all, delete-orphan")
    tags: Mapped[list["Tag"]] = relationship("Tag", back_populates="user", cascade="all, delete-orphan")


class Entry(Base):
    __tablename__ = "entries"
    __table_args__ = (
        CheckConstraint("length(trim(content)) > 0", name="ck_entries_content_not_empty"),
        Index("ix_entries_user_created", "user_id", sa.text("created_at DESC")),
        Index("ix_entries_user_mood", "user_id", "mood"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content: Mapped[str] = mapped_column(String, nullable=False)
    mood: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[sa.DateTime] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False, index=True
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="entries")
    tags: Mapped[list["Tag"]] = relationship("Tag", secondary=entry_tags, back_populates="entries")


class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_tags_user_name"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[sa.DateTime] = mapped_column(
        DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="tags")
    entries: Mapped[list["Entry"]] = relationship("Entry", secondary=entry_tags, back_populates="tags")
