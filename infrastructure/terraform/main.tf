terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# ─────────────────────────────────────────────
# APIs to Enable
# ─────────────────────────────────────────────
resource "google_project_service" "vpcaccess" {
  service                    = "vpcaccess.googleapis.com"
  disable_on_destroy         = false
}

resource "google_project_service" "secretmanager" {
  service                    = "secretmanager.googleapis.com"
  disable_on_destroy         = false
}

# ─────────────────────────────────────────────
# VPC Access Connector (For Cloud Run -> VPC)
# ─────────────────────────────────────────────
resource "google_vpc_access_connector" "connector" {
  name          = "stadiumiq-connector"
  region        = var.gcp_region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.stadiumiq_vpc.name
  depends_on    = [google_project_service.vpcaccess]
}

# ─────────────────────────────────────────────
# Secret Manager — Sensitive Configuration
# ─────────────────────────────────────────────
resource "google_secret_manager_secret" "db_url" {
  secret_id = "STADIUMIQ_DATABASE_URL"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "STADIUMIQ_REDIS_URL"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager]
}

# ─────────────────────────────────────────────
# Artifact Registry — Container Image Repository
# ─────────────────────────────────────────────
resource "google_artifact_registry_repository" "stadiumiq" {
  location      = var.gcp_region
  repository_id = "stadiumiq"
  format        = "DOCKER"
  description   = "StadiumIQ container images"
}

# ─────────────────────────────────────────────
# Cloud SQL — PostgreSQL 14 (TimescaleDB via extension)
# ─────────────────────────────────────────────
resource "google_sql_database_instance" "stadiumiq_db" {
  name             = "stadiumiq-postgres-${var.environment}"
  database_version = "POSTGRES_14"
  region           = var.gcp_region

  settings {
    tier              = "db-g1-small"
    availability_type = "ZONAL"

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    ip_configuration {
      ipv4_enabled = false
      private_network = google_compute_network.stadiumiq_vpc.id
    }
  }

  deletion_protection = true

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "stadiumiq" {
  name     = "stadiumiq_${var.environment}"
  instance = google_sql_database_instance.stadiumiq_db.name
}

resource "google_sql_user" "stadiumiq" {
  name     = "stadiumiq"
  instance = google_sql_database_instance.stadiumiq_db.name
  password = var.db_password
}

# ─────────────────────────────────────────────
# Memorystore — Redis
# ─────────────────────────────────────────────
resource "google_redis_instance" "stadiumiq_redis" {
  name           = "stadiumiq-redis"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.gcp_region

  authorized_network = google_compute_network.stadiumiq_vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

# ─────────────────────────────────────────────
# VPC Network (for Cloud SQL and Redis private access)
# ─────────────────────────────────────────────
resource "google_compute_network" "stadiumiq_vpc" {
  name                    = "stadiumiq-vpc"
  auto_create_subnetworks = true
}

resource "google_compute_global_address" "private_ip_range" {
  name          = "stadiumiq-private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.stadiumiq_vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.stadiumiq_vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}

# ─────────────────────────────────────────────
# Cloud Run — Web (Next.js)
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "web" {
  name     = "stadiumiq-web"
  location = var.gcp_region

  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project}/stadiumiq/web:latest"

      ports {
        container_port = 3000
      }

      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = "https://${google_cloud_run_v2_service.core_api.uri}"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
    service_account = google_service_account.stadiumiq_runtime.email
  }
}

resource "google_cloud_run_service_iam_member" "web_public" {
  location = google_cloud_run_v2_service.web.location
  service  = google_cloud_run_v2_service.web.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─────────────────────────────────────────────
# Cloud Run — Core API (FastAPI)
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "core_api" {
  name     = "stadiumiq-core-api"
  location = var.gcp_region

  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project}/stadiumiq/core-api:latest"

      ports {
        container_port = 8000
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql+asyncpg://stadiumiq:${var.db_password}@${google_sql_database_instance.stadiumiq_db.private_ip_address}/stadiumiq_${var.environment}"
      }
      env {
        name  = "REDIS_URL"
        value = "redis://${google_redis_instance.stadiumiq_redis.host}:6379"
      }
      env {
        name  = "ENV"
        value = var.environment
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
    service_account = google_service_account.stadiumiq_runtime.email
  }
}

resource "google_cloud_run_service_iam_member" "core_api_public" {
  location = google_cloud_run_v2_service.core_api.location
  service  = google_cloud_run_v2_service.core_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─────────────────────────────────────────────
# Cloud Run — Realtime Service (FastAPI WebSocket)
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "realtime" {
  name     = "stadiumiq-realtime"
  location = var.gcp_region

  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project}/stadiumiq/realtime:latest"

      ports {
        container_port = 8001
      }

      env {
        name  = "REDIS_URL"
        value = "redis://${google_redis_instance.stadiumiq_redis.host}:6379"
      }
      env {
        name  = "DATABASE_URL"
        value = "postgresql+asyncpg://stadiumiq:${var.db_password}@${google_sql_database_instance.stadiumiq_db.private_ip_address}/stadiumiq_${var.environment}"
      }
      env {
        name  = "ENV"
        value = var.environment
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
    service_account = google_service_account.stadiumiq_runtime.email
  }
}

resource "google_cloud_run_service_iam_member" "realtime_public" {
  location = google_cloud_run_v2_service.realtime.location
  service  = google_cloud_run_v2_service.realtime.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─────────────────────────────────────────────
# Cloud Run — AI Engine (FastAPI)
# ─────────────────────────────────────────────
resource "google_cloud_run_v2_service" "ai_engine" {
  name     = "stadiumiq-ai-engine"
  location = var.gcp_region

  template {
    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project}/stadiumiq/ai-engine:latest"

      ports {
        container_port = 8002
      }

      env {
        name  = "REDIS_URL"
        value = "redis://${google_redis_instance.stadiumiq_redis.host}:6379"
      }
      env {
        name  = "ENV"
        value = var.environment
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "1Gi"
        }
      }
    }
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
    service_account = google_service_account.stadiumiq_runtime.email
  }
}

resource "google_cloud_run_service_iam_member" "ai_engine_public" {
  location = google_cloud_run_v2_service.ai_engine.location
  service  = google_cloud_run_v2_service.ai_engine.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────
output "web_url" {
  value       = google_cloud_run_v2_service.web.uri
  description = "StadiumIQ Web Application URL"
}

output "core_api_url" {
  value       = google_cloud_run_v2_service.core_api.uri
  description = "Core API URL"
}

output "realtime_url" {
  value       = google_cloud_run_v2_service.realtime.uri
  description = "Realtime WebSocket Service URL"
}

output "ai_engine_url" {
  value       = google_cloud_run_v2_service.ai_engine.uri
  description = "AI Engine Service URL"
}

output "sql_private_ip" {
  value       = google_sql_database_instance.stadiumiq_db.private_ip_address
  description = "Private IP of Cloud SQL instance"
}

output "redis_host" {
  value       = google_redis_instance.stadiumiq_redis.host
  description = "Internal IP/Host of Redis instance"
}
