terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "stadiumiq_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "StadiumIQ-VPC"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "stadiumiq_cluster" {
  name = "stadiumiq-production-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "stadiumiq_redis" {
  cluster_id           = "stadiumiq-redis"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
}

# Note: Further detailed configurations for RDS, ALB, and ECS Task Definitions 
# would be expanded here for a full enterprise deployment.
