---
name: infra:update
description: Re-analyze repository, detect drift, and update Terraform
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Task
  - Bash
---

<objective>
Re-analyze the repository to detect changes since the last analysis, identify drift or new requirements, and update Terraform files accordingly.

**Requires:** Existing `.infra/` with previous analysis and Terraform files.

**Updates:**
- `.infra/ANALYSIS.md` — refreshed analysis
- `.infra/SERVICES.md` — updated service list
- `.infra/DECISIONS.md` — updated decisions (if needed)
- `.infra/terraform/` — updated .tf files

**After this command:** Run `/infra:validate` then `/infra:plan`.
</objective>

<execution_context>
@~/.claude/get-infra-done/workflows/update-infra.md
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
Follow the workflow at `~/.claude/get-infra-done/workflows/update-infra.md`.

1. Check current state and save previous analysis
2. Re-analyze repository
3. Detect changes (new/removed/changed services, new dependencies)
4. Update decisions if needed
5. Regenerate affected Terraform
6. Re-validate
7. Present changes and commit
</process>
