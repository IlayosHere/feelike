# GCP Architecture — feelike

Independent from `forex-dashboard`, but mirrors its proven patterns.

---

## Project topology

**Decision pending** — pick one before Phase 3:

**Option 1: New GCP project** (`feelike-prod`)
- Fully independent billing, IAM, and service namespace.
- Cleanest, recommended for production apps.
- Adds ~30 min of setup (project creation, billing link, APIs enable).

**Option 2: Reuse existing forex-dashboard GCP project**
- Add `feelike-api`, `feelike-db` as new services/instances in the same project.
- Shared billing. IAM stays clean if using separate service accounts.
- Faster setup, but coupled fate.

**Leaning Option 1** for clean separation and because a personal-data journaling app deserves its own project-level permissions envelope.

---

## Services

| Service | Purpose | Notes |
|---------|---------|-------|
| Cloud Run — `feelike-api` | FastAPI backend | `europe-west1`, min=0, max=5, concurrency=80 |
| Cloud SQL — `feelike-db` | Postgres 16 | Private IP only, via Serverless VPC Connector |
| Artifact Registry — `feelike` | Docker images | `europe-west1-docker.pkg.dev/<project>/feelike/` |
| Secret Manager | JWT secret, DB password, DB URL | Cloud Run reads secrets as env vars |
| VPC + Serverless VPC Connector | Cloud Run ↔ Cloud SQL private traffic | Mirrors forex-dashboard `*-connector` pattern |
| Workload Identity Federation | GitHub Actions → GCP auth | No JSON keys. Bind to specific repo+branch |
| Cloud Logging | All service logs | Default retention |
| Cloud Monitoring | Uptime checks + alerts | Phase 4 |

Region: `europe-west1` (matches forex-dashboard; user is in EU-adjacent time zone).

---

## Secrets (Secret Manager)

| Name | Purpose |
|------|---------|
| `feelike_jwt_secret` | JWT signing key (HS256) |
| `feelike_db_password` | Cloud SQL postgres user password |
| `feelike_database_url` | Full materialized `postgresql://...` connection string. Materialized because Cloud Run env vars can't interpolate secrets into strings. |

Only the Cloud Run service account has `secretmanager.secretAccessor` on these.

---

## Environment variables (Cloud Run `feelike-api`)

| Var | Source | Example |
|-----|--------|---------|
| `DATABASE_URL` | Secret Manager (`feelike_database_url`) | `postgresql://feelike:<pw>@10.x.x.x:5432/feelike` |
| `JWT_SECRET` | Secret Manager (`feelike_jwt_secret`) | (random 64-byte hex) |
| `TOKEN_EXPIRE_HOURS` | plain env | `168` (7 days) |
| `CORS_ORIGINS` | plain env | `https://feelike.app,https://staging.feelike.app` (tightened prod) |
| `LOG_LEVEL` | plain env | `INFO` |

No `AUTH_USERS` env var (forex-dashboard pattern) — feelike has open signup, so users live in the DB from the start.

---

## Mobile app — backend URL

- **Dev:** `http://<your-lan-ip>:8000` (local FastAPI running via `uvicorn --host 0.0.0.0`)
- **Staging:** `https://feelike-api-staging-<hash>-ew.a.run.app`
- **Prod:** `https://api.feelike.app` (custom domain via Cloud Run domain mapping — TBD)

Expo's `EXPO_PUBLIC_API_URL` env var picks which one, set at build time.

---

## CI/CD (GitHub Actions)

Mirror forex-dashboard:

### `.github/workflows/ci.yml` (Phase 0)
- Trigger: PR + push to main
- Steps: lint (ruff + prettier), type-check (mypy + tsc), unit tests (pytest + jest)
- No deploy.

### `.github/workflows/deploy-api.yml` (Phase 3)
- Trigger: push to main, paths `backend/**`
- Auth via WIF (no JSON keys)
- Build Docker image, push to Artifact Registry, deploy to Cloud Run
- Smoke test `GET /docs → 200`

### `.github/workflows/terraform.yml` (Phase 3)
- Trigger: push to `infra/terraform/**` (plan) or manual dispatch (apply)
- Human approval before apply (protect Cloud SQL)

### Mobile deploy (Phase 4)
- Expo EAS Build + Submit workflow, triggered manually for first few releases.

---

## Cost envelope (rough)

Cloud Run scale-to-zero + small Cloud SQL instance (db-f1-micro or db-g1-small) = **$15–40/month** for personal use. Increases with usage; re-evaluate if MAU > 100.

---

## What we're intentionally NOT doing in v1

- No CDN (Cloud Run serves JSON; mobile bundles ship via Expo/EAS)
- No Redis (FastAPI in-memory cache is fine for this scale)
- No Cloud Tasks / Pub-Sub (no async jobs yet; AI summaries land in v3)
- No dedicated staging DB (use a `staging` schema or named DB in same Cloud SQL instance)
- No BigQuery / analytics pipeline (v3+)

---

## Terraform module sketch (Phase 3)

```
infra/terraform/
├── main.tf              # provider, locals, project config
├── variables.tf
├── network.tf           # VPC + connector
├── cloud_sql.tf         # Postgres instance, user, db
├── secrets.tf           # Secret Manager shells + materialized DATABASE_URL
├── cloud_run_api.tf     # Cloud Run service, SA, IAM bindings
├── artifact_registry.tf
├── github_oidc.tf       # Workload Identity Pool + provider, binding to IlayosHere/feelike
└── outputs.tf
```

One-to-one with forex-dashboard's structure for familiarity.
