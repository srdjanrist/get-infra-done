# RDS Terraform Template

RDS PostgreSQL/MySQL with security group, parameter group, and automated backups.

## RDS Configuration

```hcl
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet"
  }
}

resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-db-params"
  family = "{engine_family}"  # e.g., "postgres16", "mysql8.0"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-db-params"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  engine         = "{engine}"          # "postgres" or "mysql"
  engine_version = "{engine_version}"  # e.g., "16.1", "8.0.35"
  instance_class = "{instance_class}"  # e.g., "db.t3.medium"

  allocated_storage     = {storage_gb}
  max_allocated_storage = {max_storage_gb}
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  multi_az               = {multi_az}  # true for production
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = {backup_days}  # 7 for production
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  deletion_protection       = {deletion_protection}  # true for production
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-final"

  performance_insights_enabled = true

  tags = {
    Name = "${var.project_name}-${var.environment}-db"
  }
}

# ─── Security Group ──────────────────────────────────────────────────────────

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Database access from ECS tasks"
    from_port       = {db_port}  # 5432 for PostgreSQL, 3306 for MySQL
    to_port         = {db_port}
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_{service_name}.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }
}

# ─── Variables ───────────────────────────────────────────────────────────────

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}
```

## Notes

- Storage encryption enabled by default (uses AWS-managed KMS key).
- Performance Insights enabled for query analysis.
- gp3 storage type for better price/performance.
- Multi-AZ recommended for production, optional for staging.
- Database credentials should be stored in Secrets Manager and injected via ECS task secrets.
- Automated backups with configurable retention.
