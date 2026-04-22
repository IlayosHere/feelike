# ADR 002 — Separate Backend from forex-dashboard

**Status:** Accepted
**Date:** 2026-04-21

## Context

The author has an existing production project (`forex-dashboard`) with FastAPI, Postgres, Cloud Run, JWT auth, and a mature Claude Code workflow. feelike could either:

- **Option A:** Add journaling routes + tables to the existing forex-dashboard API and share its DB/auth.
- **Option B:** Build feelike as a fully independent project, mirroring forex-dashboard patterns but with its own codebase, DB, and deploy pipeline.

## Decision

**Option B — separate project.**

## Rationale

- **Cohesion.** Forex-dashboard is trading infrastructure (signals, trades, accounts). feelike is personal journaling. Mixing them muddies both domains.
- **Blast radius.** A bug or schema change in feelike shouldn't affect the trading API. Separate services = separate deploys = smaller blast radius.
- **Product evolution.** feelike might grow differently (AI features, widgets, public launch). Coupled fate would become a drag.
- **User's explicit call** — "this should be a completely different project. we can copy concepts from the other one, not build on top of it."

## Consequences

- **More infra upfront** — a second Cloud Run service, potentially a second DB instance (or a separate DB in the same Cloud SQL instance to save cost).
- **No auth reuse** — feelike needs its own user table. Users can't log in with the same credentials as forex-dashboard (not a real use case anyway — different audiences).
- **Pattern duplication** — we'll copy the FastAPI layout, auth module, JWT helpers, etc. That's fine; copying is cheaper than a shared-package dependency.
- **CI/CD, Terraform, and GitHub Actions are duplicated but simpler** — each project's workflow stays small and readable.

## Mirrored patterns (from forex-dashboard)

- FastAPI project layout (`api/main.py`, `api/routes/`, `api/auth.py`, etc.)
- JWT + bcrypt auth pattern
- `DATABASE_URL` env switches SQLite (dev) ↔ Postgres (prod)
- Secret Manager for JWT secret + materialized DB URL
- Workload Identity Federation for GitHub Actions → GCP
- Cloud Run + private Cloud SQL via VPC Connector
- `europe-west1` region

## What's NOT shared

- Source code (fresh repo)
- Users (fresh user table)
- DB instance (can be same Cloud SQL instance with a separate DB, or fully separate — decide in Phase 3)
- GCP project (leaning separate, see `docs/gcp-architecture.md`)

## Revisit when

- Both projects need the same user accounts (unlikely)
- Both need a shared service (e.g. a billing or subscription module)
- Operational overhead of two projects becomes painful (it won't at this scale)
