# GCP Setup Checklist — feelike-prod

One-time manual setup before the first Terraform apply and CI deploy.
Follow these steps in order. Each step has a verification command.

---

## Prerequisites

Install these locally if you don't have them:
- [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) — `gcloud version`
- [`terraform` >= 1.7](https://developer.hashicorp.com/terraform/install) — `terraform version`

Log in:
```sh
gcloud auth login
gcloud auth application-default login
```

---

## Step 1 — Create the GCP project

```sh
gcloud projects create feelike-prod --name="feelike"
gcloud config set project feelike-prod
```

Link billing (required before any API can be enabled):
- Go to https://console.cloud.google.com/billing
- Click **My projects** tab → find `feelike-prod` → **Change billing** → pick your billing account

**Verify:**
```sh
gcloud projects describe feelike-prod --format="value(lifecycleState)"
# Expected: ACTIVE
```

---

## Step 2 — Enable required APIs

```sh
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  compute.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project=feelike-prod
```

This takes ~2 minutes.

**Verify:**
```sh
gcloud services list --project=feelike-prod --filter="name:(run.googleapis.com OR sqladmin.googleapis.com)" --format="value(name)"
# Expected: both listed
```

---

## Step 3 — Create Terraform state bucket

Terraform needs a GCS bucket to store remote state before it can manage anything else. Create it manually first.

```sh
gsutil mb -p feelike-prod -l europe-west1 gs://feelike-prod-tfstate
gsutil versioning set on gs://feelike-prod-tfstate
```

Then uncomment the backend block in `infra/terraform/main.tf`:

```hcl
backend "gcs" {
  bucket = "feelike-prod-tfstate"
  prefix = "terraform/state"
}
```

**Verify:**
```sh
gsutil ls gs://feelike-prod-tfstate
# Expected: no error (bucket exists and is accessible)
```

---

## Step 4 — Generate secrets

Generate strong random values for the two secrets:

```sh
# DB password (save this — you'll need it in Step 5)
openssl rand -hex 32

# JWT secret (save this — you'll need it in Step 5)
openssl rand -hex 64
```

Write them down somewhere safe (password manager). You'll never commit them to git.

---

## Step 5 — Run Terraform init + apply

Set the sensitive variables as environment variables (never put them in `terraform.tfvars`):

```sh
export TF_VAR_db_password="<output of first openssl command>"
export TF_VAR_jwt_secret="<output of second openssl command>"
```

Create your `terraform.tfvars` (not committed — already in `.gitignore`):

```sh
cat > infra/terraform/terraform.tfvars <<EOF
project_id   = "feelike-prod"
region       = "europe-west1"
github_repo  = "IlayosHere/feelike"
db_tier      = "db-g1-small"
cors_origins = "https://feelike.app"
EOF
```

Run Terraform:

```sh
cd infra/terraform
terraform init
terraform plan      # review — should show ~20 resources to create
terraform apply     # type 'yes' when prompted
```

Cloud SQL creation takes ~5 minutes.

**Verify:**
```sh
terraform output cloud_run_url
# Expected: https://feelike-api-<hash>-ew.a.run.app

terraform output workload_identity_provider
# Expected: projects/<number>/locations/global/workloadIdentityPools/github-pool/providers/github-provider

terraform output github_sa_email
# Expected: feelike-github-sa@feelike-prod.iam.gserviceaccount.com
```

---

## Step 6 — Run database migrations

Before the first deploy, run Alembic migrations against Cloud SQL. The easiest way is via Cloud SQL Auth Proxy.

Install the proxy:
```sh
# macOS
brew install cloud-sql-proxy

# Linux
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.15.0/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy
```

Get the connection name:
```sh
terraform output cloud_sql_connection_name
# e.g. feelike-prod:europe-west1:feelike-db
```

In one terminal, start the proxy:
```sh
cloud-sql-proxy feelike-prod:europe-west1:feelike-db --port=5433
```

In another terminal, run migrations:
```sh
cd backend
DATABASE_URL="postgresql://feelike:<db_password>@127.0.0.1:5433/feelike" alembic upgrade head
```

**Verify:**
```sh
DATABASE_URL="postgresql://feelike:<db_password>@127.0.0.1:5433/feelike" python -c "
from sqlalchemy import create_engine, text
import os
e = create_engine(os.environ['DATABASE_URL'])
tables = e.execute(text(\"SELECT tablename FROM pg_tables WHERE schemaname='public'\")).fetchall()
print([t[0] for t in tables])
"
# Expected: ['users', 'entries', 'tags', 'entry_tags', 'alembic_version']
```

---

## Step 7 — Set GitHub Actions secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add each of these:

| Secret name | Value |
|-------------|-------|
| `WIF_PROVIDER` | `terraform output workload_identity_provider` |
| `GCP_SA_EMAIL` | `terraform output github_sa_email` |
| `ARTIFACT_REGISTRY_URL` | `terraform output artifact_registry_url` |
| `ARTIFACT_REGISTRY_REGION` | `europe-west1` |
| `GCP_REGION` | `europe-west1` |
| `GCP_PROJECT_ID` | `feelike-prod` |
| `CLOUD_RUN_SA_EMAIL` | `terraform output cloud_run_sa_email` |

Run this to get all Terraform outputs at once:
```sh
cd infra/terraform && terraform output
```

---

## Step 8 — First deploy

Push any change to `backend/` on `main` to trigger the deploy workflow, or trigger it manually:

```sh
git push origin main
```

Watch the **Actions** tab in GitHub. The `Deploy API` workflow will:
1. Build the Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run
4. Smoke test `GET /healthz`

**Verify end-to-end:**
```sh
CLOUD_RUN_URL=$(cd infra/terraform && terraform output -raw cloud_run_url)
curl "$CLOUD_RUN_URL/healthz"
# Expected: {"status":"ok"}

curl "$CLOUD_RUN_URL/readyz"
# Expected: {"status":"ok"}
```

---

## Step 9 — Point the mobile app at the real backend

Create `app/.env.local`:
```sh
echo "EXPO_PUBLIC_API_URL=$CLOUD_RUN_URL" > app/.env.local
```

Start the app:
```sh
cd app && npx expo start
```

MSW will be skipped automatically because the URL doesn't contain `localhost`. The app now talks directly to Cloud Run.

---

## Done

Infrastructure is live. Future backend deploys happen automatically on every push to `main` that touches `backend/`. Terraform changes require a manual `workflow_dispatch` with `action=apply`.
