resource "google_compute_network" "vpc" {
  name                    = "feelike-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.apis]
}

resource "google_compute_subnetwork" "subnet" {
  name          = "feelike-subnet"
  region        = var.region
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.10.0.0/24"
}

resource "google_vpc_access_connector" "connector" {
  name    = "feelike-connector"
  region  = var.region
  network = google_compute_network.vpc.name

  # Must not overlap feelike-subnet (10.10.0.0/24).
  ip_cidr_range = "10.8.0.0/28"

  min_instances = 2
  max_instances = 3
  machine_type  = "e2-micro"
}

# Required for Cloud SQL private IP — allocates a peering range in the VPC
# so the managed services network can reach Cloud SQL over private connectivity.
resource "google_compute_global_address" "private_ip_range" {
  name          = "feelike-private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}
