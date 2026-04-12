variable "gcp_project" {
  description = "The GCP project ID to deploy into"
  type        = string
  default     = "promptwars-493015"
}

variable "gcp_region" {
  description = "The GCP region to deploy into (asia-south1 = Mumbai)"
  type        = string
  default     = "asia-south1"
}

variable "environment" {
  description = "The environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

variable "db_password" {
  description = "Cloud SQL database master password"
  type        = string
  sensitive   = true
}
