# cloud_run_url output added back after first CI/CD deploy creates the service.

output "artifact_registry_url" {
  description = "Base URL of the Artifact Registry Docker repository (append /api:<tag> for full image references)."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${local.app_name}"
}

output "workload_identity_provider" {
  description = "Full resource name of the Workload Identity Pool Provider — paste this into the GitHub Actions workflow 'workload_identity_provider' input."
  value       = google_iam_workload_identity_pool_provider.github_provider.name
}

output "github_sa_email" {
  description = "Email of the GitHub Actions service account — paste this into the GitHub Actions workflow 'service_account' input."
  value       = google_service_account.github_sa.email
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL connection name (used by Cloud SQL Auth Proxy if needed for local development)."
  value       = google_sql_database_instance.db.connection_name
}

output "cloud_sql_private_ip" {
  description = "Private IP address of the Cloud SQL instance (reachable only via VPC)."
  value       = google_sql_database_instance.db.private_ip_address
}

output "cloud_run_sa_email" {
  description = "Email of the Cloud Run API service account — used as --service-account in gcloud run deploy."
  value       = google_service_account.api_sa.email
}
