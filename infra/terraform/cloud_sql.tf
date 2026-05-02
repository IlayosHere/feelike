resource "google_sql_database_instance" "db" {
  name             = "feelike-db"
  database_version = "POSTGRES_16"
  region           = var.region

  # Prevent accidental destruction of the production database.
  deletion_protection = true

  settings {
    tier              = var.db_tier
    availability_type = "ZONAL"
    disk_size         = 10
    disk_autoresize   = true

    ip_configuration {
      # Private IP only — Cloud Run reaches the DB through the VPC connector.
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 7
      }
    }
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "feelike" {
  name     = "feelike"
  instance = google_sql_database_instance.db.name
}

resource "google_sql_user" "feelike" {
  name     = "feelike"
  instance = google_sql_database_instance.db.name
  password = var.db_password
}

locals {
  database_url = "postgresql://feelike:${var.db_password}@${google_sql_database_instance.db.private_ip_address}:5432/feelike"
}
