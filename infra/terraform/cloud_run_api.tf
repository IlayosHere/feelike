resource "google_service_account" "api_sa" {
  account_id   = "feelike-api-sa"
  display_name = "feelike API"
  description  = "Identity used by the Cloud Run feelike-api service."
}

resource "google_cloud_run_v2_service" "api" {
  name     = "feelike-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.api_sa.email

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }

    max_instance_request_concurrency = 80
    timeout                          = "60s"

    containers {
      image = local.image_url

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      ports {
        container_port = 8080
      }

      # ── Plain environment variables ──────────────────────────────────────

      env {
        name  = "TOKEN_EXPIRE_HOURS"
        value = "168"
      }

      env {
        name  = "LOG_LEVEL"
        value = "INFO"
      }

      env {
        name  = "CORS_ORIGINS"
        value = var.cors_origins
      }

      # ── Secret-backed environment variables ──────────────────────────────

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }

      # ── Health probes ────────────────────────────────────────────────────

      liveness_probe {
        http_get {
          path = "/healthz"
        }
        initial_delay_seconds = 10
        period_seconds        = 30
      }

      startup_probe {
        http_get {
          path = "/readyz"
        }
        initial_delay_seconds = 10
        period_seconds        = 10
        failure_threshold     = 6
      }
    }
  }

  depends_on = [
    google_secret_manager_secret_version.jwt_secret,
    google_secret_manager_secret_version.database_url,
    google_secret_manager_secret_iam_member.api_sa_jwt_secret,
    google_secret_manager_secret_iam_member.api_sa_database_url,
  ]
}

# Allow unauthenticated invocations — the API is public; auth is handled
# inside the application via JWT validation.
resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  name     = google_cloud_run_v2_service.api.name
  location = google_cloud_run_v2_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
