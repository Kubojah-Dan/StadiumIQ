# ─────────────────────────────────────────────
# Runtime Service Account for Cloud Run
# ─────────────────────────────────────────────
resource "google_service_account" "stadiumiq_runtime" {
  account_id   = "stadiumiq-runtime"
  display_name = "StadiumIQ Cloud Run Runtime SA"
}

# ─────────────────────────────────────────────
# IAM Roles for Runtime SA
# ─────────────────────────────────────────────

# Allow SA to access Secret Manager secrets
resource "google_project_iam_member" "secret_accessor" {
  project = var.gcp_project
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.stadiumiq_runtime.email}"
}

# Allow SA to use the VPC Access Connector
resource "google_project_iam_member" "vpc_user" {
  project = var.gcp_project
  role    = "roles/vpcaccess.user"
  member  = "serviceAccount:${google_service_account.stadiumiq_runtime.email}"
}

# Allow SA to connect to Cloud SQL
resource "google_project_iam_member" "cloudsql_client" {
  project = var.gcp_project
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.stadiumiq_runtime.email}"
}

# ─────────────────────────────────────────────
# Allow Deployer SA to act as Runtime SA
# ─────────────────────────────────────────────
resource "google_service_account_iam_member" "deployer_acts_as_runtime" {
  service_account_id = google_service_account.stadiumiq_runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:stadiumiq-deployer@${var.gcp_project}.iam.gserviceaccount.com"
}
