# CLAUDE.md — feelike

> Home for thoughts, feelings, and ideas. A mobile-first journaling app built for zero-friction capture.

This file is the entry point for any agent (human or AI) working on this repo. Read it first.

---

## Response Style

Match response length to task complexity. No preamble on simple tasks — just do the thing.

- Trivial task ("rename this var") → do it, one line of output
- Small task ("add a screen stub") → brief plan + execute + short confirmation
- Non-trivial task ("design the sync layer") → discuss tradeoffs first, align, then execute

Never write multi-paragraph docstrings or narrate internal deliberation. State results, not thought processes.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Mobile | React Native + Expo (SDK latest) | TypeScript strict, Expo Router for navigation |
| State | React Query + Zustand | Server state via React Query; UI state via Zustand |
| Styling | NativeWind (Tailwind for RN) | Semantic token classes (`bg-bg`, `text-text-primary`); `dark:` variant for theme switching |
| Backend | Python 3.12 + FastAPI | Mirrors forex-dashboard patterns, own codebase |
| DB | PostgreSQL 16 (Cloud SQL) / SQLite (local dev) | Single `DATABASE_URL` switch |
| ORM | SQLAlchemy 2.x (Mapped[] style) | Alembic migrations (see ADR 006) |
| Auth | JWT + bcrypt | Custom, matches forex-dashboard pattern |
| Hosting | Cloud Run (api), separate Artifact Registry repo | NEW GCP project or same project with namespaced services |
| CI/CD | GitHub Actions + Workload Identity Federation | No JSON keys |
| IaC | Terraform | One module tree, mirrors forex-dashboard infra/ |

---

## Project Structure

```
feelike/
├── CLAUDE.md                 # this file
├── README.md
├── docs/
│   ├── prd.md                # problem, personas, user stories, scope
│   ├── coding-standards.md   # MANDATORY read before writing code
│   ├── ux-spec.md            # screens, tokens, interaction rules
│   ├── data-model.md         # Entry/Mood/Tag schema
│   ├── gcp-architecture.md   # cloud plan
│   ├── adr/                  # architecture decision records
│   │   ├── 001-mobile-framework.md
│   │   ├── 002-separate-backend.md
│   │   ├── 003-auth-pattern.md
│   │   ├── 004-data-model.md
│   │   ├── 005-theming-and-dark-mode.md
│   │   └── 006-migration-tool.md
│   └── themes/
│       └── theme-system.html # locked visual reference (light + dark toggle)
├── app/                      # React Native (Expo) — Phase 2
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/         # API client, auth, storage
│   │   ├── stores/           # Zustand stores
│   │   ├── types/
│   │   └── utils/
│   ├── app.json
│   └── package.json
├── backend/                  # FastAPI — Phase 3
│   ├── api/
│   │   ├── main.py
│   │   ├── auth.py
│   │   ├── db.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes/
│   ├── migrations/
│   ├── tests/
│   └── requirements.txt
├── shared/                   # shared types (TS + Python mirrored)
├── infra/                    # Terraform — Phase 3
│   └── terraform/
├── .claude/
│   ├── settings.json         # permission allowlist
│   ├── agents/               # specialized subagents
│   └── commands/             # slash commands
├── .github/workflows/        # CI/CD
├── .mcp.json                 # MCP servers (Playwright, Context7)
├── .env.example
└── .gitignore
```

Folders marked Phase 2/3 don't exist yet — they'll be scaffolded after Phase 0 docs are approved and a theme is picked.

---

## Core Design Decisions (don't re-open without strong reason)

1. **Separate project from forex-dashboard.** Mirror patterns, not code. See `docs/adr/002-separate-backend.md`.
2. **Unified capture, optional categorization after.** The home screen is a text box — never force a type/tag/mood pick before writing. See `docs/ux-spec.md`.
3. **React Native + Expo, not native, not Flutter.** See `docs/adr/001-mobile-framework.md`.
4. **Custom JWT + bcrypt auth, not Firebase.** See `docs/adr/003-auth-pattern.md`.
5. **Multi-user from day one.** Every entry belongs to a user; all queries scoped by user_id.
6. **Offline-capable (v2).** v1 requires network; v2 adds local persistence + sync. Don't pre-build v2 abstractions in v1.
7. **No AI features in v1.** Punt to v3. v1 proves the capture + timeline loop works.

---

## Existing Code — Do Not Rewrite

Nothing yet (fresh repo). Once code lands, list anything here that's been battle-tested and should not be refactored casually.

---

## Design Documents

| Doc | Purpose | Read when |
|-----|---------|-----------|
| `docs/coding-standards.md` | File/function sizes, naming, TS/Python rules | **Before any code change** |
| `docs/prd.md` | Problem, user stories, v1/v2/v3 scope | Scope or priority discussions |
| `docs/ux-spec.md` | Screens, design tokens, interactions | Any UI work |
| `docs/data-model.md` | Entry/Mood/Tag/User schema | DB or API work |
| `docs/gcp-architecture.md` | Cloud services, deploy topology | Infra or deploy work |
| `docs/adr/*.md` | One decision per file | Revisiting a past decision |

---

## Build Phases

- **Phase 0 — Environment setup** ✅ done — CLAUDE.md, docs, `.claude/` setup.
- **Phase 1 — Theme system** ✅ done — Vibrant (light) + dark mode companion, two-layer token architecture. Reference: `docs/themes/theme-system.html`. Spec: `docs/ux-spec.md`. Decision: `docs/adr/005-theming-and-dark-mode.md`.
- **Phase 2 — App scaffold** — Expo app, theme provider, auth screen, capture screen, timeline, mock backend.
- **Phase 3 — Backend + infra** — FastAPI, Postgres, Cloud Run, Terraform, CI/CD.
- **Phase 4 — v1 polish + real usage** — dogfood, fix friction, ship to TestFlight/internal.

Current status: **Phase 0 + 1 complete. Phase 2 ready to start on user go-ahead.**

---

## Phase 2 kickoff decisions (tracked gaps)

These are known unresolved questions that should be answered in the first Phase 2 session, before scaffolding code. They're documented here so the next agent addresses them instead of silently inventing answers.

### ADRs still to write

- **ADR 007 — state management.** React Query for server state + Zustand for UI state is asserted in the tech stack table but not justified vs Redux Toolkit / Jotai / TanStack alone. Write before wiring any screens.
- **ADR 008 — styling library.** NativeWind is the current choice but wasn't formally compared against Tamagui / Restyle / plain StyleSheet. Write before first screen commit.
- **ADR 009 — GCP project topology.** `docs/gcp-architecture.md` currently says "leaning Option 1" (new GCP project). Resolve before Phase 3 Terraform.

### Implementation questions to answer early

- **Multi-tenancy enforcement mechanism.** `docs/data-model.md` invariant "every query scoped by `user_id`" is currently trust-based. Decide: `scoped_query(user)` helper, SQLAlchemy event listener, or Postgres RLS — and commit a pytest that verifies every authenticated route rejects cross-user access with 404.
- **Pagination cursor format.** `docs/data-model.md` mentions `cursor=...` with no spec. Encode as opaque base64 of `(created_at, id)` tuple with `(created_at DESC, id DESC)` tiebreaker.
- **Rate limit middleware.** ADR 003 mentions "e.g. 5/min/IP" for login. Pick `slowapi` (FastAPI-native) over Cloud Armor for v1. Implement in the auth module.
- **Cloud SQL tier.** `gcp-architecture.md` says `db-f1-micro`; that tier isn't available for Postgres 16. Minimum is `db-g1-small`. Update the cost envelope.
- **Health endpoints.** `/healthz` and `/readyz` must exist from the first commit of `api/main.py` for Cloud Run probes.
- **Structured logging.** JSON-formatted log output keyed for Cloud Logging (trace, severity, request_id). Decide on `python-json-logger` or `structlog` in Phase 3 kickoff.
- **Test DB fixture pattern.** Document in `backend/tests/conftest.py` how tests get a clean DB (nested transaction rollback vs per-test SQLite file). Needed before the first pytest runs.
- **Component-level `no-raw-hex` lint rule.** ADR 005 calls for it but no ESLint config enforces it. Add an `eslint-plugin-no-restricted-syntax` rule in Phase 2 that bans `/#[0-9a-f]{3,8}/i` in `app/src/components/**` and `app/src/screens/**` (exempting `app/src/theme/tokens.ts`).

### UX gaps to address in Phase 2 screen work

- **Missing screen states** — loading, error, empty, offline, saving, save-failed, pull-to-refresh — for every screen in `docs/ux-spec.md`.
- **Mood taxonomy** — 6 moods is a v1 starting point. Consider adding `tired`, `grateful`, `neutral`. Don't lock until Phase 2 dogfooding begins.
- **Tag UX details** — creation gesture (comma/enter?), delete gesture, autosuggest trigger length, new-tag color assignment rule.
- **Settings screen** — add the `auto / light / dark` theme mode picker row (architecture is done, screen spec doesn't list it yet).
- **Screen transitions** — push/pop animation curve, list-item enter/exit animation for new/deleted entries.

### CI / workflow additions to make in Phase 2

- Add `.github/pull_request_template.md` (Summary / Test plan / ADR link).
- Add `.github/dependabot.yml` (pip, npm, github-actions, terraform, weekly).
- Add branch-name check step in `ci-guard` (regex `^(phase-\d+|feat|fix|docs|chore)/[a-z0-9-]+$` on `${{ github.head_ref }}`).

---

## Model Routing

- **Opus** for planning, architecture, design reviews, cross-cutting refactors, ADR drafts.
- **Sonnet** for execution: implementing a spec, writing tests, small fixes, file-level edits.
- Default to Opus when in doubt — planning cost is small vs cost of re-doing misguided work.

---

## Agents Available

Defined in `.claude/agents/`:

- **mobile-engineer** — React Native / Expo / TypeScript implementer
- **backend-engineer** — FastAPI / SQLAlchemy / Postgres implementer
- **ux-designer** — screens, tokens, component styling, theme alignment
- **qa-tester** — Jest / Playwright / pytest test author
- **architect** — ADR drafts, cross-cutting technical decisions

Plus built-in general-purpose, Explore, and Plan agents.

**When to delegate:** any multi-file investigation, any task where a narrow specialist would be faster, or when you want to protect the main context from large tool output.

---

## UI/UX Problem Protocol

Before implementing any non-trivial UI, consult `ux-designer` agent or produce a visual prototype (HTML mock or Expo Snack). Do not code blind when the visual outcome is uncertain. Match existing design tokens in `docs/ux-spec.md` — don't introduce new colors/spacing/fonts without an ADR.

---

## Git Workflow

- Work on feature branches. Never commit to `main` directly.
- Branch naming: `phase-N/short-description`, `feat/short-description`, `fix/short-description`, `docs/short-description`.
- Atomic commits with clear messages. No "wip" or "stuff".
- **Do not commit unless the user explicitly asks.**
- **Do not push to remote unless the user explicitly asks.**
- No force-push, no `--no-verify`, no amending published commits.
- PRs get a title, summary, and test plan — created only on user request.

---

## Permissions & Tooling

`.claude/settings.json` allowlists the tools we use constantly (`npx expo`, `npm`, read-only `git`, `ls`, etc.) so we don't get prompted mid-flow. If you need a new tool repeatedly, add it there rather than approving one-offs.
