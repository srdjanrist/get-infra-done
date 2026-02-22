# Infrastructure Decisions

**Status:** {locked|draft}
**Locked Date:** {date}
**Approved By:** {user}

## Locked Decisions

| # | Category | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Compute | {decision} | {rationale} |
| 2 | Database | {decision} | {rationale} |
| 3 | Networking | {decision} | {rationale} |
| 4 | Security | {decision} | {rationale} |
| 5 | CI/CD | {decision} | {rationale} |

## Agent Discretion Areas

These areas are left to agent judgment during Terraform generation:

- **Resource naming:** Follow `{project}-{env}-{service}-{resource}` convention
- **Tag values:** Auto-populated from project metadata
- **Security group CIDR ranges:** Use VPC CIDR for internal, 0.0.0.0/0 for public ALB only
- **CloudWatch log retention:** 30 days for production, 7 days for staging
- **Backup retention:** 7 days for production, 1 day for staging

## Deferred Items

Items explicitly deferred to post-initial deployment:

| Item | Reason | Revisit When |
|------|--------|-------------|
| {item} | {reason} | {trigger} |
