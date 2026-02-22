# Terraform Common Boilerplate

Use this template for `main.tf` and `variables.tf` foundation.

## Provider & Backend (`main.tf`)

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "{project}-{env}-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "{aws_region}"
    dynamodb_table = "{project}-{env}-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

## Core Variables (`variables.tf`)

```hcl
variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment (production, staging, development)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "us-east-1"
}
```

## Outputs (`outputs.tf`)

```hcl
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}
```

## Naming Convention

All resources follow: `{project}-{env}-{service}-{resource}`

Example: `myapp-prod-api-ecs-service`

## Tags

Every resource MUST include at minimum:
- `Project` — from `var.project_name`
- `Environment` — from `var.environment`
- `ManagedBy` — always `terraform`
- `Service` — which service this resource belongs to (per-service resources only)
