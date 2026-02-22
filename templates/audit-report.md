# Infrastructure Audit Report

**Date:** {date}
**Repository:** {repo_name}
**IaC Type:** {iac_type}
**Reporter:** infra-audit-reporter

## Executive Summary

**Overall Assessment:** {GREEN/YELLOW/RED}

{1-3 sentence summary of the infrastructure state}

| Metric | Value |
|--------|-------|
| Total Resources | {count} |
| Security Findings (Critical) | {count} |
| Security Findings (Warning) | {count} |
| Security Findings (Info) | {count} |
| Compliance Score | {X}/{total} |
| Gaps Resolved | {resolved}/{total} |
| Environments | {count} |

## Architecture Overview

```
{ASCII architecture diagram showing resource relationships}
```

## Resource Inventory

### Networking

| Resource | Type | Assessment | Notes |
|----------|------|------------|-------|
| {resource} | {type} | {good/concern/issue} | {notes} |

### Compute

| Resource | Type | Assessment | Notes |
|----------|------|------------|-------|
| {resource} | {type} | {good/concern/issue} | {notes} |

### Database

| Resource | Type | Assessment | Notes |
|----------|------|------------|-------|
| {resource} | {type} | {good/concern/issue} | {notes} |

### Storage

| Resource | Type | Assessment | Notes |
|----------|------|------------|-------|
| {resource} | {type} | {good/concern/issue} | {notes} |

### IAM

| Resource | Type | Assessment | Notes |
|----------|------|------------|-------|
| {resource} | {type} | {good/concern/issue} | {notes} |

### DNS & CDN

| Resource | Type | Assessment | Notes |
|----------|------|------------|-------|
| {resource} | {type} | {good/concern/issue} | {notes} |

### Monitoring

| Resource | Type | Assessment | Notes |
|----------|------|------------|-------|
| {resource} | {type} | {good/concern/issue} | {notes} |

## Security Assessment

### Findings by Severity

#### CRITICAL

| ID | Description | File | Remediation |
|----|-------------|------|-------------|
| sec-{N} | {description} | {file}:{line} | {remediation} |

#### WARNING

| ID | Description | File | Remediation |
|----|-------------|------|-------------|
| sec-{N} | {description} | {file}:{line} | {remediation} |

#### INFO

| ID | Description | File | Recommendation |
|----|-------------|------|----------------|
| sec-{N} | {description} | {file} | {recommendation} |

### Compliance Matrix

| Check | Status | Evidence | Remediation |
|-------|--------|----------|-------------|
| Private subnets for compute | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| Encryption at rest | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| Encryption in transit | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| Least-privilege IAM | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| No hardcoded secrets | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| Security groups restricted | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| Logging enabled | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| Backup configured | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| VPC flow logs enabled | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |
| CloudTrail enabled | {pass/fail/unknown} | {evidence} | {remediation_if_needed} |

## Best Practices Assessment

| Practice | Status | Details |
|----------|--------|---------|
| State management | {good/needs-work/missing} | {details} |
| Module usage | {good/needs-work/missing} | {details} |
| Variable organization | {good/needs-work/missing} | {details} |
| Output definitions | {good/needs-work/missing} | {details} |
| Resource naming | {good/needs-work/missing} | {details} |
| Tagging strategy | {good/needs-work/missing} | {details} |
| DRY principle | {good/needs-work/missing} | {details} |
| Documentation | {good/needs-work/missing} | {details} |

## Environment Analysis

| Environment | Strategy | State Isolation | Config Differences |
|-------------|----------|-----------------|-------------------|
| {env_name} | {workspace/directory/account} | {shared/separate} | {key_differences} |

## User Clarifications Incorporated

| Gap ID | Question | Answer | Impact on Assessment |
|--------|----------|--------|---------------------|
| gap-{N} | {original_question} | {user_answer} | {how_it_changed_assessment} |

## Remaining Gaps

| Gap ID | Category | Description | Recommended Action |
|--------|----------|-------------|--------------------|
| gap-{N} | {category} | {description} | {what_to_do} |

## Prioritized Recommendations

### P1 — Critical (Address Immediately)

| # | Recommendation | Category | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | {recommendation} | {security/reliability/cost/operations} | {low/medium/high} | {description} |

### P2 — Important (Address Soon)

| # | Recommendation | Category | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | {recommendation} | {security/reliability/cost/operations} | {low/medium/high} | {description} |

### P3 — Nice to Have (Address When Possible)

| # | Recommendation | Category | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | {recommendation} | {security/reliability/cost/operations} | {low/medium/high} | {description} |
