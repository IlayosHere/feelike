resource "google_artifact_registry_repository" "feelike" {
  repository_id = local.app_name
  format        = "DOCKER"
  location      = var.region
  description   = "Docker images for the feelike API service"

  depends_on = [google_project_service.apis]

  cleanup_policies {
    id     = "keep-last-10"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }

  cleanup_policy_dry_run = false
}

# GitHub Actions SA pushes new images during CI/CD.
resource "google_artifact_registry_repository_iam_member" "github_sa_writer" {
  location   = google_artifact_registry_repository.feelike.location
  repository = google_artifact_registry_repository.feelike.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.github_sa.email}"
}

# Cloud Run SA pulls images at deploy time.
resource "google_artifact_registry_repository_iam_member" "api_sa_reader" {
  location   = google_artifact_registry_repository.feelike.location
  repository = google_artifact_registry_repository.feelike.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.api_sa.email}"
}
