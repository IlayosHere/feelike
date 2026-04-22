# Data Model — feelike

Central schema reference. Every DB or API change should update this file.

---

## Entities

### User

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| email | citext | unique, normalized to lowercase at app layer; `CITEXT` type enforces case-insensitive uniqueness at the DB level |
| password_hash | text | bcrypt |
| display_name | text | optional |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now(), updated via SQLAlchemy `onupdate=func.now()` (and mirrored by a Postgres `BEFORE UPDATE` trigger so direct SQL writes still update it) |

### Entry

The core unit. One row per thought/feeling/idea/note.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users.id **ON DELETE CASCADE**, indexed, not null |
| content | text | the actual thought; not null; CHECK (length(trim(content)) > 0) |
| mood | text (nullable) | one of `MOOD_VALUES` below, or NULL if not set |
| created_at | timestamptz | default now(), indexed (for timeline order) |
| updated_at | timestamptz | default now(), updated via SQLAlchemy `onupdate=func.now()` (and mirrored by a Postgres `BEFORE UPDATE` trigger so direct SQL writes still update it) |

### Tag

User-defined, free-form. A user's tag vocabulary grows over time.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users.id **ON DELETE CASCADE**, indexed |
| name | text | lowercase, e.g. `dating`, `trading`, `todo` |
| created_at | timestamptz | default now() |
| Unique | (user_id, name) | prevent duplicates per user |

### EntryTag (join)

| Field | Type | Notes |
|-------|------|-------|
| entry_id | UUID | FK → entries.id **ON DELETE CASCADE** |
| tag_id | UUID | FK → tags.id **ON DELETE CASCADE** |
| PK | (entry_id, tag_id) | composite |
| Index | (entry_id) | for "tags on this entry" lookups |
| Index | (tag_id) | for "entries with this tag" lookups |

---

## Enumerations

### MOOD_VALUES (v1)

Start simple — 6 values. Can expand later without migration (it's just text + a client-side emoji map).

| Value | Emoji | Meaning |
|-------|-------|---------|
| `happy` | 😊 | Light, good, going well |
| `excited` | 🔥 | Hyped, big win, energized |
| `sad` | 😔 | Down, disappointed, heavy |
| `anxious` | 😰 | Worried, uncertain |
| `angry` | 😤 | Frustrated, upset |
| `calm` | 🧘 | Neutral, grounded, processing |

Values are stored as lowercase strings; emoji is a client-side concern. This lets us rename or restyle without a migration.

---

## Indexes (v1)

- `users(email)` unique
- `entries(user_id, created_at DESC)` — timeline queries
- `entries(user_id, mood)` — mood filtering (v2 search)
- `tags(user_id, name)` unique
- `entry_tags(tag_id)` — tag filter queries

---

## API shape (v1)

Reference — full OpenAPI will live in `backend/` once written.

### Auth
- `POST /api/auth/signup` → `{ access_token }`
- `POST /api/auth/login` → `{ access_token }`
- `GET /api/auth/me` → `{ id, email, display_name }`
- `POST /api/auth/password` → 204 — change password while authenticated
- `DELETE /api/auth/me` → 204 — hard-delete user + cascade to entries/tags (GDPR)

(No `POST /api/auth/refresh` in v1. Token TTL is 30 days; re-login after expiry. Refresh endpoint lands in v2 when TTL tightens.)

### Entries
- `POST /api/entries` body `{ content, mood?, tags?: string[] }` → `Entry`
- `GET /api/entries?limit=50&cursor=...` → `{ items: Entry[], next_cursor }`
- `GET /api/entries/{id}` → `Entry`
- `PATCH /api/entries/{id}` body `{ content?, mood?, tags? }` → `Entry`
- `DELETE /api/entries/{id}` → 204

### Tags
- `GET /api/tags` → `Tag[]` (user's tag vocabulary, for autosuggest)
- (v1 doesn't need explicit tag CRUD — tags are created implicitly when an entry is saved with a new tag name)

---

## Response shape — `Entry`

```json
{
  "id": "uuid",
  "content": "string",
  "mood": "happy" | null,
  "tags": ["dating", "good-day"],
  "created_at": "2026-04-21T18:30:00Z",
  "updated_at": "2026-04-21T18:30:00Z"
}
```

Tags are returned as an array of names (not objects) — the client rarely needs tag IDs.

---

## Invariants

1. **No entry without a user.** `user_id` is not null.
2. **Soft ownership.** API only returns entries where `entry.user_id == current_user.id`. No admin bypass in v1.
3. **Tag uniqueness is per-user.** Two users can each have a `#work` tag; they're separate rows.
4. **Mood is optional.** An entry with no mood is valid and common.
5. **Content is not empty.** `len(content.strip()) > 0` enforced in Pydantic schema.

---

## Growth directions (not in v1)

- **Attachments** (v2): `attachments` table with `entry_id`, `storage_key`, `mime_type`, `created_at`.
- **Full-text search** (v2): add `content_tsv` generated column + GIN index, or move to a dedicated search service.
- **Soft delete** (TBD): add `deleted_at` if we ever need undo. v1 hard-deletes.
- **AI annotations** (v3): `entry_ai_summary` table referencing entries, populated async.
