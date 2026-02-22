# Security Baseline

Non-negotiable security requirements for all generated infrastructure.

## Network Security

1. **Private subnets for compute:** All ECS tasks, Lambda functions (when VPC-attached), and databases MUST run in private subnets.
2. **Public subnets only for:** ALB, NAT Gateway, bastion hosts (if any).
3. **VPC Flow Logs:** MUST be enabled on every VPC. Ship to CloudWatch Logs with 30-day retention.
4. **Security groups:** Default deny. Only allow specific ports from specific sources.
5. **No 0.0.0.0/0 ingress** except on ALB ports 80/443.

## IAM

1. **Least-privilege policies:** Never use `*` resources or `*` actions in production IAM policies.
2. **Service-specific roles:** Each ECS service and Lambda function gets its own IAM role.
3. **No inline policies:** Use managed policies attached to roles.
4. **No hardcoded credentials:** All secrets via Secrets Manager or SSM Parameter Store.

## Encryption

1. **Encryption at rest:** All RDS instances, S3 buckets, EBS volumes, and DynamoDB tables MUST have encryption enabled.
2. **Encryption in transit:** All ALB listeners MUST use HTTPS. All database connections should use SSL.
3. **KMS:** Use AWS-managed keys by default. Customer-managed keys for compliance requirements.

## Secrets Management

1. **Secrets Manager** for database passwords, API keys, and tokens.
2. **Never store secrets** in Terraform state as plaintext — use `sensitive = true`.
3. **Never store secrets** in environment variables directly — reference from Secrets Manager.
4. **Rotate secrets** via Secrets Manager automatic rotation where supported.

## Logging & Monitoring

1. **CloudTrail:** MUST be enabled for API audit logging.
2. **CloudWatch Logs:** All compute resources must ship logs to CloudWatch.
3. **Log retention:** Minimum 30 days for production, 7 days for non-production.
4. **Alerting:** CPU/memory > 80%, 5xx rate > 5%, and disk > 80% must trigger alerts.

## Data Protection

1. **S3 buckets:** Block public access by default. Enable versioning for critical data.
2. **RDS:** Enable automated backups with minimum 7-day retention for production.
3. **DynamoDB:** Enable point-in-time recovery for production tables.
4. **Deletion protection:** Enable on production RDS instances and DynamoDB tables.

## Compliance Checks

Every generated Terraform MUST pass these checks:

- [ ] No security group allows 0.0.0.0/0 to non-ALB resources
- [ ] All RDS instances have `storage_encrypted = true`
- [ ] All S3 buckets have `block_public_access` enabled
- [ ] All IAM policies use specific resource ARNs
- [ ] All secrets referenced from Secrets Manager, not environment variables
- [ ] VPC Flow Logs enabled
- [ ] CloudWatch log groups have retention configured
- [ ] All ECS tasks run in private subnets
- [ ] HTTPS enforced on all ALB listeners
- [ ] Database credentials marked as `sensitive`
