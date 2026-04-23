# ADR 003 — Authentication Pattern

**Status:** Accepted
**Date:** 2026-04-21

## Context

feelike is multi-user and professional-grade. We need:
- Signup + login
- Password hashing
- Session/token management on mobile
- Multi-user data scoping on the backend

## Options considered

1. **Firebase Auth / Identity Platform** — turnkey, social logins included, but adds SDK bloat, ties us to Firebase, and diverges from forex-dashboard.
2. **Auth0 / Clerk / Supabase Auth** — polished, but another vendor to manage and a monthly cost.
3. **Custom JWT + bcrypt** — matches forex-dashboard, full control, no vendor lock.

## Decision

**Custom JWT + bcrypt.** Same pattern as forex-dashboard, trimmed for v1 scope:
- `users(id, email, password_hash, ...)` table
- `POST /api/auth/signup` — bcrypt hash, insert user, return JWT
- `POST /api/auth/login` — verify password, return JWT
- `GET /api/auth/me` — JWT required, returns current user
- `DELETE /api/auth/me` — JWT required, hard-deletes the user + cascades to their entries/tags (GDPR baseline)
- HS256 algorithm, secret from Secret Manager
- Token TTL: **30 days (720h)** — long enough to avoid weekly logouts for a daily-habit app without a refresh flow.
- **No refresh endpoint in v1.** Added in v2 when TTL tightens.

Mobile side:
- Token stored in `expo-secure-store` (encrypted, not AsyncStorage)
- `authFetch` wrapper auto-adds `Authorization: Bearer <token>`
- On 401: clear token, redirect to login screen

## Rationale

- **Consistency with forex-dashboard** — user already knows this pattern; no new mental model.
- **Full control** — no vendor dependency for the most sensitive part of the product.
- **Cheap** — no per-MAU cost.
- **Simple surface** — five endpoints, well-understood failure modes.

## Consequences

- **We own the security surface.** Have to get bcrypt params right (cost ≥ 12), JWT claims right (sub = user_id, exp set), and rate-limit the login endpoint.
- **No "sign in with Google/Apple" in v1.** Can add as a second auth path later without breaking the JWT flow.
- **No password reset flow in v1.** Requires email delivery setup. Deferred to v2 — for now, password changes happen via `POST /api/auth/password` while authenticated. A typo'd signup email = account unrecoverable without a DB edit; for a single-user dogfooder this is acceptable. Documented runbook: manually update the row in Cloud SQL.
- **No refresh token endpoint in v1.** 30-day TTL + manual re-login is acceptable for the current audience. When TTL tightens (v2+), add `POST /api/auth/refresh` + rotating refresh tokens.
- **Account deletion is hard-delete + cascade.** `DELETE /api/auth/me` removes the user, entries, tags, entry_tags. No "recover deleted account" flow in v1.
- **Mobile secure storage** — `expo-secure-store` uses Keychain (iOS) / Keystore (Android). Fine for personal journaling scope.

## Hardening checklist (Phase 3)

- bcrypt cost ≥ 12
- JWT secret ≥ 256 bits, from Secret Manager
- Login endpoint rate limited (e.g. 5 attempts / minute / IP) — Phase 2 kickoff in CLAUDE.md tracks the decision to use `slowapi` (FastAPI-native) for this
- Email normalized to lowercase before lookup
- Constant-time password compare (bcrypt does this)
- No password in any log line
- HTTPS enforced (Cloud Run is TLS by default; never allow `http://` in prod CORS)

## Revisit when

- We want social login (add Google OAuth alongside email/password)
- We need SSO (SAML) — unlikely for a personal app
- Token theft becomes a real concern (add refresh-token rotation + device fingerprinting)
