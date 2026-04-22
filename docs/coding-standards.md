# Coding Standards — feelike

**Read this before writing any code.** These rules exist to keep the codebase clean as it grows.

---

## Universal

- **No comments by default.** Code and names explain the *what*. Write a comment only when the *why* is non-obvious (hidden constraint, workaround, surprising behavior). Never narrate the current task or who added what.
- **No backwards-compat shims or dead code.** If something is unused, delete it. Don't leave `// old version` comments or re-export removed symbols.
- **No defensive programming at internal boundaries.** Validate at system edges (user input, HTTP boundary, file I/O). Inside the app, trust your own types.
- **No premature abstractions.** Three similar lines is fine. Abstract on the fourth copy, not the second.
- **No speculative features.** Build what the current spec requires. YAGNI.
- **Small units.** Aim for functions < 40 lines, files < 300 lines, classes with one clear responsibility. Split when something grows beyond that — don't wait until it's a nightmare.

---

## TypeScript (app/, shared/)

- **Strict mode on.** `strict: true` in tsconfig, no `any` without justification (prefer `unknown` + narrow).
- **Prefer `type` over `interface`** except when you need declaration merging.
- **No enums.** Use `as const` object literals or union types — TS enums generate runtime code and are confusing.
- **Named exports over default exports.** Helps with refactoring and IDE jumps.
- **No barrel (`index.ts`) files** unless the package is meant for external import. They slow TS compilation and hide dependencies.
- **Path aliases** via `tsconfig.json` `paths` → use `@/screens/...` not `../../../screens/...`.
- **Zod for runtime validation** at API boundaries (parse responses, form inputs). Don't trust server types without parsing.

### React / React Native specifics

- **Function components only.** No class components.
- **Hooks at the top, early returns in the middle, JSX at the bottom.** Consistent shape.
- **Prefer custom hooks** for reusable logic (`useCurrentUser`, `useEntries`) over prop drilling or context sprawl.
- **Avoid `useEffect` for data fetching.** Use React Query.
- **Keep components small.** If a component's JSX is > 80 lines, split it.
- **Styles via NativeWind classnames**, not inline StyleSheet, unless a style genuinely needs computed values.
- **No raw hex colors** in `app/src/components/**` or `app/src/screens/**`. Use semantic class names (`bg-bg`, `text-text-primary`, `border-border`) that resolve via NativeWind's `dark:` variant. Only `app/src/theme/tokens.ts` may contain hex values. Lint rule enforces this in Phase 2.

---

## Python (backend/)

- **Python 3.12+**, type hints on every function signature (`def foo(x: int) -> str:`).
- **Use `Annotated[Type, Depends(...)]`** for FastAPI dependency injection (modern style).
- **Pydantic v2** for schemas, SQLAlchemy 2.x `Mapped[]` syntax for ORM.
- **No `print()` in committed code.** Use `logging`.
- **Don't catch bare `Exception`.** Catch specific types. If you must catch broad, re-raise with context.
- **Line length 100.** Format with `ruff format`.

### FastAPI structure

- `api/main.py` — app setup only (CORS, lifespan, router mounting). ≤ 80 lines.
- `api/routes/<resource>.py` — one router per resource.
- `api/schemas.py` or `api/schemas_<resource>.py` — Pydantic models.
- `api/models.py` — SQLAlchemy ORM.
- `api/services/<domain>.py` — business logic that doesn't belong in a route.
- **Keep route handlers thin.** Parse → call service → return. If the handler has > 20 lines of logic, extract a service function.

---

## Database

- **Every table has `id` (UUID), `created_at`, `updated_at`.**
- **Every user-owned table has `user_id`** with a foreign key + index.
- **Query by user_id always.** No endpoint returns data without scoping by the current user.
- **Migrations are forward-only.** Never edit a committed migration; add a new one.
- **Never `DROP` columns in prod** without a two-step deprecation (stop writing → verify → drop in next release).

---

## Git

- One concern per commit. Message = imperative present tense (`add capture screen`, not `added` or `adding`).
- Subject line ≤ 72 chars. Body wraps at 72 if present.
- Never commit `.env`, credentials, or large binaries.
- Branch names: `phase-N/short-kebab`, `feat/short-kebab`, `fix/short-kebab`, `docs/short-kebab`.

---

## Tests

- **Backend:** pytest. One test file per route/service file. Integration tests hit a real (test) DB — no mocking DB calls.
- **Mobile:** Jest + React Native Testing Library for component tests; Detox or Playwright for E2E (Phase 4+).
- **Test the behavior, not the implementation.** Assert on what the user sees / what the API returns, not internal call counts.

---

## When in doubt

Read the neighboring code. If there's a pattern already, follow it. If the pattern is wrong, fix it in a separate commit — don't mix refactoring with feature work.
