---
description: Run the FastAPI backend tests (pytest), fix failures if small
---

Run the backend test suite for feelike.

## Steps

1. **Verify `backend/` exists.** If not, tell the user the backend isn't scaffolded yet.
2. **Run `pytest backend/tests -v`** (from repo root).
3. **If failures are minor** (obvious fix), patch and re-run.
4. **If failures are substantial**, stop and report:
   - Which tests failed and why
   - Whether the production code or the test is wrong
   - Proposed fix (don't implement without user sign-off)
5. **If all green**, report pass count and time.

## Rules

- Integration tests should hit a real (SQLite or throwaway Postgres) DB. Don't mock DB calls.
- Never skip, disable, or `pytest.mark.skip` a failing test to clear the board.
- If a test is flaky, report it with a reproduction approach — don't mark it xfail and move on.
- Run from repo root so `pytest.ini` / `pyproject.toml` config is picked up.
