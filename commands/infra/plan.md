---
name: infra:plan
description: Run terraform plan and show resource changes and cost estimate
argument-hint: ""
allowed-tools:
  - Read
  - Bash
---

<objective>
Run `terraform plan` on the generated infrastructure to preview what will be created, modified, or destroyed.

**Requires:** `.infra/terraform/` with valid .tf files and terraform CLI installed.

**After this command:** Review the plan output, then run `terraform -chdir=.infra/terraform apply`.
</objective>

<execution_context>
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
1. Check terraform binary:
   ```bash
   terraform version
   ```
   If not available: "Terraform CLI not found. Install from https://terraform.io/downloads"

2. Initialize terraform:
   ```bash
   cd .infra/terraform && terraform init
   ```

   If backend not configured, use local backend:
   ```bash
   cd .infra/terraform && terraform init -backend=false
   ```

3. Run plan:
   ```bash
   cd .infra/terraform && terraform plan -no-color
   ```

4. Present results:
   ```
   ━━━ INFRA ► TERRAFORM PLAN ━━━

   Resources to create: {count}
   Resources to change: {count}
   Resources to destroy: {count}

   Review the full plan above.

   To apply: terraform -chdir=.infra/terraform apply
   ```

5. If COST-ESTIMATE.md exists, display estimated monthly cost alongside the plan.
</process>
