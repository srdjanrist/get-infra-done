# Terraform Conventions

Best practices for generated Terraform code.

## File Organization

| File | Contents |
|------|----------|
| `main.tf` | Provider, backend, core data sources |
| `variables.tf` | All input variables |
| `outputs.tf` | All outputs |
| `vpc.tf` | VPC, subnets, route tables, NAT, IGW |
| `ecs.tf` | ECS cluster, task definitions, services |
| `rds.tf` | RDS instances, subnet groups, parameter groups |
| `iam.tf` | IAM roles, policies, instance profiles |
| `security_groups.tf` | All security groups |
| `monitoring.tf` | CloudWatch alarms, dashboards, log groups |
| `s3.tf` | S3 buckets |
| `lambda.tf` | Lambda functions, API Gateway |
| `secrets.tf` | Secrets Manager resources |

## Resource Naming

Pattern: `{project}-{env}-{service}-{resource}`

Examples:
- VPC: `myapp-prod-vpc`
- ECS Cluster: `myapp-prod-cluster`
- ECS Service: `myapp-prod-api`
- RDS: `myapp-prod-db`
- Security Group: `myapp-prod-api-sg`
- IAM Role: `myapp-prod-api-ecs-task-role`
- CloudWatch Log Group: `/ecs/myapp-prod/api`

## Terraform Resource Names

Use snake_case for Terraform resource identifiers:
```hcl
# Good
resource "aws_ecs_service" "api_service" { ... }
resource "aws_security_group" "ecs_api" { ... }

# Bad
resource "aws_ecs_service" "ApiService" { ... }
resource "aws_security_group" "ecs-api" { ... }
```

## Variable Conventions

```hcl
# Required variables have no default
variable "project_name" {
  description = "Project name used in resource naming"
  type        = string
}

# Optional variables always have a default
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

# Sensitive variables marked explicitly
variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
```

## State Management

- Backend: S3 + DynamoDB for state locking
- State bucket naming: `{project}-{env}-terraform-state`
- Lock table naming: `{project}-{env}-terraform-locks`
- Enable encryption on state bucket
- Enable versioning on state bucket

## Module Structure

For multi-service projects, organize as modules:

```
.infra/terraform/
  main.tf
  variables.tf
  outputs.tf
  modules/
    vpc/
      main.tf
      variables.tf
      outputs.tf
    ecs-service/
      main.tf
      variables.tf
      outputs.tf
```

## Tagging Strategy

Every resource MUST have these tags:

```hcl
tags = {
  Project     = var.project_name
  Environment = var.environment
  ManagedBy   = "terraform"
  Service     = "api"  # per-service resources only
}
```

Use provider `default_tags` for Project, Environment, ManagedBy. Add Service tag per resource.

## Anti-Patterns

- **No `terraform.tfvars` in generated code** — use variable defaults or document required vars
- **No hardcoded ARNs** — use data sources or variables
- **No hardcoded regions** — always use `var.aws_region`
- **No `count` for complex conditionals** — prefer `for_each`
- **No `depends_on` unless truly necessary** — Terraform handles most dependencies automatically
- **No wildcards in IAM** — specific resources and actions only
