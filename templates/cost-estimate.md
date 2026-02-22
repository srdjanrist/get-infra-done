# Cost Estimate

**Date:** {date}
**Region:** {aws_region}
**Environment:** {environment}
**Pricing Model:** On-Demand (unless noted)

## Per-Service Costs

### {service_name}

| Resource | Type/Size | Quantity | Monthly Cost |
|----------|-----------|----------|-------------|
| {compute} | {instance_type} | {count} | ${cost} |
| {database} | {instance_type} | {count} | ${cost} |
| {storage} | {tier} | {gb}GB | ${cost} |
| **Subtotal** | | | **${subtotal}** |

## Shared Infrastructure

| Resource | Details | Monthly Cost |
|----------|---------|-------------|
| VPC + NAT Gateway | {nat_count} NAT(s) | ${nat_cost} |
| Application Load Balancer | 1 ALB | ${alb_cost} |
| Route 53 | Hosted zone + queries | ${route53_cost} |
| CloudWatch | Logs + Metrics | ${cw_cost} |
| Secrets Manager | {secret_count} secrets | ${sm_cost} |
| S3 | Terraform state + assets | ${s3_cost} |
| Data Transfer | Estimated {gb}GB/month | ${transfer_cost} |
| **Subtotal** | | **${shared_subtotal}** |

## Total Monthly Estimate

| Category | Low | High |
|----------|-----|------|
| Per-service compute | ${compute_low} | ${compute_high} |
| Databases | ${db_low} | ${db_high} |
| Shared infrastructure | ${shared_low} | ${shared_high} |
| Data transfer | ${transfer_low} | ${transfer_high} |
| **Total** | **${total_low}** | **${total_high}** |

## Cost Optimization Notes

- {optimization_note_1}
- {optimization_note_2}
- Consider Reserved Instances for {stable_workloads} (up to 40% savings)
- Consider Savings Plans for Fargate/Lambda (up to 30% savings)

## Assumptions

- Pricing based on {aws_region} region
- On-Demand pricing unless otherwise noted
- Data transfer estimates based on {traffic_assumption}
- Database storage growth estimated at {growth_rate}/month
