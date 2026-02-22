# Infrastructure Audit Scan

**Date:** {date}
**Repository:** {repo_name}
**IaC Type:** {iac_type}
**Scanner:** infra-audit-scanner

## IaC Detection

| Property | Value |
|----------|-------|
| Primary IaC | {terraform/cloudformation/cdk/pulumi/kubernetes/helm/ansible} |
| Version | {version} |
| State Backend | {backend_type} |
| Modules/Stacks | {count} |
| Entry Point | {main_file} |

## Resource Inventory

### Networking

| Resource | Type | Name/ID | Configuration | File |
|----------|------|---------|---------------|------|
| {resource} | {aws_type} | {name} | {key_config} | {file_path}:{line} |

### Compute

| Resource | Type | Name/ID | Configuration | File |
|----------|------|---------|---------------|------|
| {resource} | {aws_type} | {name} | {key_config} | {file_path}:{line} |

### Database

| Resource | Type | Name/ID | Configuration | File |
|----------|------|---------|---------------|------|
| {resource} | {aws_type} | {name} | {key_config} | {file_path}:{line} |

### Storage

| Resource | Type | Name/ID | Configuration | File |
|----------|------|---------|---------------|------|
| {resource} | {aws_type} | {name} | {key_config} | {file_path}:{line} |

### IAM

| Resource | Type | Name/ID | Configuration | File |
|----------|------|---------|---------------|------|
| {resource} | {aws_type} | {name} | {key_config} | {file_path}:{line} |

### DNS & CDN

| Resource | Type | Name/ID | Configuration | File |
|----------|------|---------|---------------|------|
| {resource} | {aws_type} | {name} | {key_config} | {file_path}:{line} |

### Monitoring

| Resource | Type | Name/ID | Configuration | File |
|----------|------|---------|---------------|------|
| {resource} | {aws_type} | {name} | {key_config} | {file_path}:{line} |

### Secrets

| Resource | Type | Name/ID | Configuration | File |
|----------|------|---------|---------------|------|
| {resource} | {aws_type} | {name} | {key_config} | {file_path}:{line} |

## Environment Strategy

| Property | Value |
|----------|-------|
| Strategy | {workspaces/directories/branches/accounts} |
| Environments | {list_of_environments} |
| Variable Files | {tfvars_files} |
| State Isolation | {shared/separate} |

## Security Posture

### Findings

| ID | Severity | Category | Description | File | Remediation |
|----|----------|----------|-------------|------|-------------|
| sec-{N} | {CRITICAL/WARNING/INFO} | {category} | {description} | {file}:{line} | {remediation} |

### Compliance Checklist

| Check | Status | Evidence |
|-------|--------|----------|
| Private subnets for compute | {pass/fail/unknown} | {file_reference} |
| Encryption at rest | {pass/fail/unknown} | {file_reference} |
| Encryption in transit | {pass/fail/unknown} | {file_reference} |
| Least-privilege IAM | {pass/fail/unknown} | {file_reference} |
| No hardcoded secrets | {pass/fail/unknown} | {file_reference} |
| Security groups restricted | {pass/fail/unknown} | {file_reference} |
| Logging enabled | {pass/fail/unknown} | {file_reference} |
| Backup configured | {pass/fail/unknown} | {file_reference} |
| VPC flow logs enabled | {pass/fail/unknown} | {file_reference} |
| CloudTrail enabled | {pass/fail/unknown} | {file_reference} |

## Module & Code Structure

| Module/Stack | Path | Purpose | Resources |
|--------------|------|---------|-----------|
| {module} | {path} | {purpose} | {resource_count} |

## Variables & Configuration

| Variable | Type | Default | Description | File |
|----------|------|---------|-------------|------|
| {var_name} | {type} | {default} | {description} | {file_path} |

## Gaps & Unclear Areas

| Gap ID | Category | Description | Impact |
|--------|----------|-------------|--------|
| gap-001 | {category} | {what_is_unclear} | {why_it_matters} |

Gap categories: environment-purpose, service-communication, external-dependencies, deployment-process, traffic-patterns, dr-strategy, cost-constraints, compliance-requirements

## Clarifications

<!-- Appended by /infra:audit-drill sessions -->
