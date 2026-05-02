resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Workload Identity Pool for GitHub Actions — feelike repo only."

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Actions Provider"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Restrict token exchange to pushes on the main branch of the feelike repo only.
  attribute_condition = "assertion.repository == '${var.github_repo}' && assertion.ref == 'refs/heads/main'"
}

resource "google_service_account" "github_sa" {
  account_id   = "feelike-github-sa"
  display_name = "feelike GitHub Actions"
  description  = "Identity assumed by GitHub Actions via Workload Identity Federation."
}

# Allow GitHub Actions to deploy new Cloud Run revisions.
resource "google_project_iam_member" "github_sa_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.github_sa.email}"
}

# Scope iam.serviceAccountUser to only the Cloud Run SA — not the entire project.
# This allows GitHub Actions to pass the api SA to gcloud run deploy, without
# being able to impersonate any other SA in the project.
resource "google_service_account_iam_member" "github_sa_act_as_api_sa" {
  service_account_id = google_service_account.api_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_sa.email}"
}

# Bind the Workload Identity Pool to the GitHub Actions SA so that tokens from
# the specific repository can be exchanged for short-lived GCP credentials.
resource "google_service_account_iam_member" "github_pool_sa_binding" {
  service_account_id = google_service_account.github_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repo}"
}
