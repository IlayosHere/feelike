variable "project_id" {
  description = "GCP project ID where all feelike resources are created."
  type        = string
}

variable "region" {
  description = "GCP region for all regional resources (Cloud Run, Cloud SQL, Artifact Registry, VPC connector)."
  type        = string
  default     = "europe-west1"
}

variable "github_repo" {
  description = "GitHub repository in 'owner/repo' format used to scope the Workload Identity Federation binding."
  type        = string
  # example: "IlayosHere/feelike"
}

variable "db_tier" {
  description = "Cloud SQL machine tier. db-f1-micro is NOT available for Postgres 16; minimum is db-g1-small."
  type        = string
  default     = "db-g1-small"
}

variable "db_password" {
  description = "Password for the Cloud SQL 'feelike' database user. Supply via TF_VAR_db_password — never commit a real value."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing key (HS256). Supply via TF_VAR_jwt_secret — never commit a real value."
  type        = string
  sensitive   = true
}

variable "image_tag" {
  description = "Docker image tag to deploy to Cloud Run."
  type        = string
  default     = "latest"
}

variable "cors_origins" {
  description = "Comma-separated list of allowed CORS origins passed to the API container."
  type        = string
  default     = "https://feelike.app"
}
