# Cost Rules

Per-service pricing reference for AWS cost estimation (us-east-1, on-demand).

## Compute

### ECS Fargate
- vCPU: $0.04048/hour ($29.15/month)
- Memory: $0.004445/GB-hour ($3.20/GB-month)
- Common sizes:
  - 0.25 vCPU / 0.5GB: ~$8/month per task
  - 0.5 vCPU / 1GB: ~$18/month per task
  - 1 vCPU / 2GB: ~$35/month per task
  - 2 vCPU / 4GB: ~$71/month per task

### Lambda
- Requests: $0.20 per 1M requests
- Duration: $0.0000166667 per GB-second
- Free tier: 1M requests + 400,000 GB-seconds/month
- 128MB @ 200ms avg: ~$0.21 per 1M invocations
- 512MB @ 500ms avg: ~$4.17 per 1M invocations

### EC2 (for reference)
- t3.micro: ~$8/month
- t3.small: ~$15/month
- t3.medium: ~$30/month
- t3.large: ~$60/month

## Database

### RDS
- db.t3.micro: ~$13/month (free tier eligible)
- db.t3.small: ~$25/month
- db.t3.medium: ~$50/month
- db.t3.large: ~$100/month
- db.r6g.large: ~$175/month
- Storage: $0.115/GB-month (gp3)
- Multi-AZ: 2x instance cost
- Automated backups: Free for retention up to DB storage size

### DynamoDB
- On-demand: $1.25 per million writes, $0.25 per million reads
- Provisioned: $0.00065 per WCU/hour, $0.00013 per RCU/hour
- Storage: $0.25/GB-month

### ElastiCache Redis
- cache.t3.micro: ~$12/month
- cache.t3.small: ~$24/month
- cache.t3.medium: ~$48/month
- cache.r6g.large: ~$130/month

## Networking

### NAT Gateway
- Hourly: $0.045/hour (~$32/month)
- Data processing: $0.045/GB
- **Cost trap:** NAT gateways are expensive. One per AZ = 3x cost.

### ALB
- Hourly: $0.0225/hour (~$16/month)
- LCU: $0.008/LCU-hour (varies by dimension)
- Typical: ~$20-30/month

### CloudFront
- First 10TB: $0.085/GB
- 10-50TB: $0.080/GB
- Requests: $0.0075-0.01 per 10K

### Data Transfer
- Inbound: Free
- Outbound to internet: $0.09/GB (first 10TB)
- Cross-AZ: $0.01/GB each direction
- VPC endpoint: $0.01/hour + $0.01/GB

## Storage

### S3
- Standard: $0.023/GB-month
- Requests: $0.005 per 1K PUT, $0.0004 per 1K GET

### EBS (gp3)
- Storage: $0.08/GB-month
- Baseline: 3000 IOPS, 125 MB/s included

## Other Services

### Secrets Manager
- Per secret: $0.40/month
- API calls: $0.05 per 10K calls

### CloudWatch
- Logs ingestion: $0.50/GB
- Logs storage: $0.03/GB-month
- Custom metrics: $0.30/metric-month (first 10K)
- Alarms: $0.10/alarm-month

### Route 53
- Hosted zone: $0.50/month
- Queries: $0.40 per 1M queries

## Cost Optimization Tips

1. **Fargate Spot** for non-critical workloads: up to 70% savings
2. **Reserved Instances** for stable RDS: up to 40% savings
3. **Savings Plans** for Fargate/Lambda: up to 30% savings
4. **Single NAT Gateway** instead of per-AZ: saves ~$64/month
5. **Right-size instances** after observing actual utilization
6. **S3 Lifecycle policies** for infrequent access data
7. **CloudWatch log retention** — don't keep forever
