# AWS Architecture

**Date:** {date}
**Region:** {aws_region}
**Environment:** {environment}
**Pattern:** {architecture_pattern}

## VPC Design

**CIDR:** {vpc_cidr}
**Availability Zones:** {az_count}

| Subnet | Type | AZ | CIDR | Purpose |
|--------|------|----|------|---------|
| {subnet_name} | public/private | {az} | {cidr} | {purpose} |

**NAT Gateway:** {nat_strategy} (single/per-AZ)
**VPC Flow Logs:** enabled → CloudWatch Logs

## Network Topology

```
Internet
  │
  ├── Route 53 (DNS)
  │
  ├── CloudFront (CDN) ──→ S3 (static assets)
  │
  └── ALB (public subnets)
       │
       ├── ECS Service A (private subnets)
       │    └──→ RDS (private subnets)
       │
       └── ECS Service B (private subnets)
            └──→ ElastiCache (private subnets)
```

## Compute Resources

| Service | AWS Resource | vCPU | Memory | Scaling |
|---------|-------------|------|--------|---------|
| {service} | {resource} | {vcpu} | {memory} | {scaling_policy} |

## Data Stores

| Store | AWS Resource | Engine | Instance | Storage | Backups |
|-------|-------------|--------|----------|---------|---------|
| {store} | {resource} | {engine} | {instance_type} | {storage_gb}GB | {backup_retention} |

## IAM Structure

| Role | Purpose | Policies |
|------|---------|----------|
| {role_name} | {purpose} | {policy_list} |

## Security Groups

| SG Name | Inbound | Outbound | Attached To |
|---------|---------|----------|-------------|
| {sg_name} | {inbound_rules} | {outbound_rules} | {resources} |

## Monitoring & Alerting

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Utilization | > 80% | Scale up |
| Memory Utilization | > 80% | Scale up |
| 5xx Error Rate | > 5% | SNS Alert |
| Response Time | > 2s p99 | SNS Alert |
| Disk Usage | > 80% | SNS Alert |

## Tags Strategy

All resources tagged with:
- `Project`: {project_name}
- `Environment`: {environment}
- `ManagedBy`: terraform
- `Service`: {service_name} (per-service resources)
