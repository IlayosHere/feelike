# feelike

Your home for thoughts, feelings, and ideas. A mobile-first journaling app designed for zero-friction capture — open it any moment, write whatever's on your mind, categorize later (or never).

## Status

**Phases 0–1 complete.** Project environment, docs, Claude Code setup, and theme system are locked. App scaffold (Phase 2) is the next step. See [CLAUDE.md](CLAUDE.md) for the full project map.

## Quick links

- [CLAUDE.md](CLAUDE.md) — project map, conventions, agents
- [docs/prd.md](docs/prd.md) — problem, users, scope
- [docs/ux-spec.md](docs/ux-spec.md) — screens and design principles
- [docs/coding-standards.md](docs/coding-standards.md) — read before writing code
- [docs/adr/](docs/adr/) — architecture decision records
- [docs/themes/theme-system.html](docs/themes/theme-system.html) — locked Phase 1 theme system reference

## Stack (planned)

- **Mobile:** React Native + Expo + TypeScript
- **Backend:** FastAPI + PostgreSQL (Cloud SQL)
- **Auth:** JWT + bcrypt
- **Hosting:** Google Cloud (Cloud Run, Artifact Registry, Secret Manager)
- **CI/CD:** GitHub Actions + Workload Identity Federation

## Local development

Coming in Phase 2.
