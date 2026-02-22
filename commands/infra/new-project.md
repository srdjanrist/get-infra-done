---
name: infra:new-project
description: Full infrastructure pipeline — scan, recommend, discuss, generate Terraform
argument-hint: ""
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
---

<objective>
Run the complete infrastructure generation pipeline for a repository: scan → detect services → recommend AWS resources → discuss decisions → generate architecture → generate Terraform → validate → security audit → cost estimate.

**Creates:**
- `.infra/config.json` — infrastructure configuration
- `.infra/STATE.md` — pipeline state tracking
- `.infra/ANALYSIS.md` — repository analysis
- `.infra/SERVICES.md` — detected services
- `.infra/RECOMMENDATIONS.md` — AWS recommendations
- `.infra/DECISIONS.md` — locked infrastructure decisions
- `.infra/ARCHITECTURE.md` — AWS architecture design
- `.infra/terraform/*.tf` — production-ready Terraform files
- `.infra/SECURITY-AUDIT.md` — security findings
- `.infra/COST-ESTIMATE.md` — monthly cost estimates

**After this command:** Review `.infra/terraform/`, then run `/infra:plan` or `terraform -chdir=.infra/terraform apply`.
</objective>

<execution_context>
@~/.claude/get-infra-done/workflows/new-project.md
@~/.claude/get-infra-done/references/ui-brand.md
@~/.claude/get-infra-done/references/aws-patterns.md
</execution_context>

<process>
Follow the workflow at `~/.claude/get-infra-done/workflows/new-project.md` exactly.

The workflow has 8 stages:
1. Initialize — create .infra/, config, STATE.md
2. Scan — spawn infra-scanner + infra-service-detector
3. Recommend — spawn infra-recommender
4. Discuss — interactive Q&A to lock decisions
5. Architecture — spawn infra-architect
6. Generate — spawn infra-terraform-gen + infra-cicd-gen
7. Validate — spawn infra-validator + infra-security-auditor + infra-cost-estimator
8. Complete — present summary and next steps
</process>
