resource "google_service_account" "api_sa" {
  account_id   = "feelike-api-sa"
  display_name = "feelike API"
  description  = "Identity used by the Cloud Run feelike-api service."
}

# Cloud Run service and IAM binding are managed by the deploy-api.yml GitHub
# Actions workflow — it builds the image and deploys on every push to main.
# Add these resources back here once the first CI/CD deploy has run and the
# image exists in Artifact Registry.
