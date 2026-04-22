---
description: Scaffold a new FastAPI route (router + schemas + test)
---

Add a new API route to the feelike backend. Args: `$ARGUMENTS` = resource name (e.g. `entries`, `tags`, `reminders`).

## Steps

1. **Verify we're in Phase 3+** — the `backend/` folder must exist. If not, stop.
2. **Read `docs/data-model.md`** to align with the schema.
3. **Read `docs/coding-standards.md`** for API conventions.
4. **Create the router** at `backend/api/routes/<resource>.py`:
   - `router = APIRouter(prefix="/api/<resource>", tags=["<resource>"])`
   - Include `Depends(get_current_user)` on every non-public endpoint
   - Every query scoped by `user_id`
5. **Create schemas** at `backend/api/schemas_<resource>.py`:
   - `<Resource>Create`, `<Resource>Update`, `<Resource>Response` Pydantic models
   - Use `ConfigDict(from_attributes=True)` on response models
6. **Mount the router** in `backend/api/main.py`: `app.include_router(<resource>.router)`.
7. **Add ORM models** to `backend/api/models.py` if the resource is persisted.
8. **Create a migration** in `backend/migrations/NNN_<short-desc>.sql` if new tables/columns are added.
9. **Write tests** at `backend/tests/test_<resource>.py`:
   - Happy path (create, read, update, delete)
   - 401 without auth
   - 404 for other users' rows
10. **Update `docs/data-model.md`** with the new endpoints.
11. **Report** — endpoints added, schema changes, any migration to run.

## Rules

- Route handlers ≤ 20 lines. Extract to `backend/api/services/<resource>.py` if longer.
- Never return another user's data — assert `user_id` scoping in every query.
- No `print()`. Use `logger`.
