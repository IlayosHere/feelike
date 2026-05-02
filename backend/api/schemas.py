from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None

    @field_validator("email", mode="before")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        return v

    @field_validator("display_name")
    @classmethod
    def display_name_max_length(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 100:
            raise ValueError("display_name must not exceed 100 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    display_name: str | None
    created_at: datetime


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("new_password must be at least 8 characters")
        return v


# ---------------------------------------------------------------------------
# Entry schemas
# ---------------------------------------------------------------------------

_VALID_MOODS: frozenset[str] = frozenset({"happy", "excited", "sad", "anxious", "angry", "calm"})


class EntryCreate(BaseModel):
    content: str
    mood: str | None = None
    tags: list[str] = []

    @field_validator("content", mode="before")
    @classmethod
    def strip_content(cls, v: Any) -> str:
        if isinstance(v, str):
            v = v.strip()
        return v

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("content must not be empty")
        if len(v) > 50000:
            raise ValueError("content must not exceed 50000 characters")
        return v

    @field_validator("mood")
    @classmethod
    def mood_valid(cls, v: str | None) -> str | None:
        if v is not None and v not in _VALID_MOODS:
            raise ValueError(f"mood must be one of: {', '.join(sorted(_VALID_MOODS))}")
        return v

    @field_validator("tags")
    @classmethod
    def tags_normalized(cls, v: list[str]) -> list[str]:
        if len(v) > 20:
            raise ValueError("at most 20 tags per entry")
        normalized = [name.strip().lower() for name in v]
        if any(len(n) == 0 for n in normalized):
            raise ValueError("tag names must not be empty")
        if any(len(n) > 50 for n in normalized):
            raise ValueError("tag names must not exceed 50 characters")
        return normalized


class EntryUpdate(BaseModel):
    content: str | None = None
    mood: str | None = None
    tags: list[str] | None = None

    @field_validator("content", mode="before")
    @classmethod
    def strip_and_validate_content(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip()
        return v

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str | None) -> str | None:
        if v is not None and len(v) < 1:
            raise ValueError("content must not be empty")
        if v is not None and len(v) > 50000:
            raise ValueError("content must not exceed 50000 characters")
        return v

    @field_validator("mood")
    @classmethod
    def mood_valid(cls, v: str | None) -> str | None:
        if v is not None and v not in _VALID_MOODS:
            raise ValueError(f"mood must be one of: {', '.join(sorted(_VALID_MOODS))}")
        return v

    @field_validator("tags")
    @classmethod
    def tags_normalized(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return v
        if len(v) > 20:
            raise ValueError("at most 20 tags per entry")
        normalized = [name.strip().lower() for name in v]
        if any(len(n) == 0 for n in normalized):
            raise ValueError("tag names must not be empty")
        if any(len(n) > 50 for n in normalized):
            raise ValueError("tag names must not exceed 50 characters")
        return normalized


class EntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    content: str
    mood: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    @field_validator("tags", mode="before")
    @classmethod
    def flatten_tags(cls, v: Any) -> list[str]:
        if isinstance(v, list) and v and not isinstance(v[0], str):
            return [tag.name for tag in v]
        return v


class PaginatedEntries(BaseModel):
    items: list[EntryResponse]
    next_cursor: str | None


# ---------------------------------------------------------------------------
# Tag schemas
# ---------------------------------------------------------------------------


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    created_at: datetime
