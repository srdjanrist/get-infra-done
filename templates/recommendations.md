# AWS Infrastructure Recommendations

**Date:** {date}
**Region:** {aws_region}
**Environment:** {environment}

## Summary

{summary_paragraph}

## Per-Service Recommendations

### {service_name}

**Compute:** {compute_recommendation}
- Service: {aws_service} (e.g., ECS Fargate, Lambda, EC2)
- Sizing: {sizing_details}
- Rationale: {why_this_choice}

**Database:** {database_recommendation}
- Service: {aws_service} (e.g., RDS PostgreSQL, DynamoDB, ElastiCache)
- Sizing: {instance_type_or_capacity}
- Rationale: {why_this_choice}

**Storage:** {storage_recommendation}
- Service: {aws_service} (e.g., S3, EFS, EBS)
- Rationale: {why_this_choice}

**Caching:** {cache_recommendation}
- Service: {aws_service} (e.g., ElastiCache Redis, DAX)
- Rationale: {why_this_choice}

## Shared Infrastructure

| Component | AWS Service | Purpose |
|-----------|------------|---------|
| Networking | VPC + Subnets | Isolated network |
| Load Balancing | ALB | Traffic distribution |
| DNS | Route 53 | Domain management |
| CDN | CloudFront | Static asset delivery |
| Secrets | Secrets Manager | Credential storage |
| Monitoring | CloudWatch | Logs and metrics |
| CI/CD | CodePipeline or GitHub Actions | Deployment automation |

## Architecture Pattern

**Selected Pattern:** {pattern_name}
**Rationale:** {pattern_rationale}

## Cost Estimate Range

**Monthly Low:** ${low_estimate}
**Monthly High:** ${high_estimate}
**Primary Cost Driver:** {primary_cost_driver}
