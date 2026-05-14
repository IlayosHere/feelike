terraform {
  required_version = ">= 1.7"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.32"
    }
  }

  # ── Remote state bootstrap (do this BEFORE first terraform apply) ──────────
  # 1. Create the GCS bucket manually (Terraform cannot create its own state bucket):
  #      gsutil mb -p feelike-prod -l europe-west1 gs://feelike-prod-tfstate
  #      gsutil versioning set on gs://feelike-prod-tfstate
  # 2. Uncomment the backend block below.
  # 3. Run: terraform init  (migrates local state to GCS)
  # 4. Commit the uncommented block — all subsequent applies use remote state.
  #
  # WARNING: Running terraform apply WITHOUT uncommenting this block writes state
  # locally. A second apply from any other machine will attempt to recreate ALL
  # resources including the Cloud SQL instance. Do not skip step 2.
  #
  backend "gcs" {
    bucket = "feelike-prod-tfstate"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  project_id = var.project_id
  region     = var.region
  app_name   = "feelike"
  image_url  = "${var.region}-docker.pkg.dev/${var.project_id}/${local.app_name}/api:${var.image_tag}"
}
