# Security Audit

**Date:** {date}
**Auditor:** infra-security-auditor
**Status:** {pass|fail|warnings}

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | {critical_count} |
| WARNING | {warning_count} |
| INFO | {info_count} |

## Findings

### CRITICAL

#### {finding_title}

**File:** {file_path}:{line}
**Resource:** {terraform_resource}
**Issue:** {description}
**Risk:** {risk_description}
**Remediation:**
```hcl
{remediation_code}
```

### WARNING

#### {finding_title}

**File:** {file_path}:{line}
**Resource:** {terraform_resource}
**Issue:** {description}
**Recommendation:** {recommendation}

### INFO

#### {finding_title}

**File:** {file_path}
**Note:** {description}

## Compliance Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Private subnets for compute | {pass/fail} | {notes} |
| Encryption at rest | {pass/fail} | {notes} |
| Encryption in transit | {pass/fail} | {notes} |
| Least-privilege IAM | {pass/fail} | {notes} |
| No hardcoded secrets | {pass/fail} | {notes} |
| Security groups restricted | {pass/fail} | {notes} |
| Logging enabled | {pass/fail} | {notes} |
| Backup configured | {pass/fail} | {notes} |
| VPC flow logs enabled | {pass/fail} | {notes} |
| CloudTrail enabled | {pass/fail} | {notes} |
