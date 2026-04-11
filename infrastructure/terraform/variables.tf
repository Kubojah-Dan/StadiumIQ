variable "aws_region" {
  description = "The AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "The environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}
