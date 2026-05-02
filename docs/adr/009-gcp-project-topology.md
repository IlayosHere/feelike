# ADR 009 — GCP Project Topology

**Status:** Accepted  
**Date:** 2026-04-23

---

## Decision

feelike runs in its own dedicated GCP project (`feelike-prod`), fully separate from `forex-dashboard`.

---

## Context

Two options were considered:

1. **New project** — independent billing, IAM, service namespace, and audit trail.
2. **Reuse `forex-dashboard` project** — shared billing, faster setup, but coupled fate.

The `forex-dashboard` project is the reference for patterns (Terraform structure, WIF, Cloud Run deploy workflow) but must not become a host for feelike's services. feelike stores personal journal data; it deserves its own permissions envelope and its own billing isolation.

---

## Consequences

- Terraform lives in `feelike/infra/terraform/` with its own provider config pointing at `feelike-prod`.
- GitHub Actions WIF binding is scoped to `IlayosHere/feelike` (not the forex-dashboard repo).
- Cloud SQL, Cloud Run, Artifact Registry, Secret Manager are all created fresh — no shared instances.
- Patterns (module structure, naming, WIF setup) are copied from `forex-dashboard` as a starting point, not reused via modules or references.
- ~30 min of GCP console setup: create project, link billing, enable APIs (Cloud Run, Cloud SQL, Artifact Registry, Secret Manager, VPC).
