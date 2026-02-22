---
name: infra:generate
description: Generate Terraform files from locked decisions
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Task
  - Bash
---

<objective>
Generate production-ready Terraform files from locked DECISIONS.md. Includes architecture design, Terraform generation, validation, security audit, and cost estimation.

**Requires:** `.infra/DECISIONS.md` with locked status (run `/infra:discuss` first)

**Creates:**
- `.infra/ARCHITECTURE.md` — AWS architecture design
- `.infra/terraform/*.tf` — production Terraform files
- `.infra/SECURITY-AUDIT.md` — security findings
- `.infra/COST-ESTIMATE.md` — monthly cost estimates
- `.github/workflows/deploy.yml` — CI/CD pipeline (if enabled)

**After this command:** Run `/infra:validate` or `/infra:plan`.
</objective>

<execution_context>
@~/.claude/get-infra-done/workflows/generate-terraform.md
@~/.claude/get-infra-done/references/terraform-conventions.md
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
Follow the workflow at `~/.claude/get-infra-done/workflows/generate-terraform.md`.

1. Check prerequisites (ANALYSIS.md + DECISIONS.md)
2. Generate architecture if not exists (spawn infra-architect)
3. Generate Terraform (spawn infra-terraform-gen + infra-cicd-gen)
4. Validate + audit + estimate (spawn validators in parallel)
5. Present results with file count, security summary, and cost range
</process>
