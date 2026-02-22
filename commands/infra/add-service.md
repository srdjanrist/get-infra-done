---
name: infra:add-service
description: Add a new service to existing infrastructure
argument-hint: "[service-path]"
allowed-tools:
  - Read
  - Write
  - Task
  - AskUserQuestion
---

<objective>
Add a new service to existing infrastructure: scan the new service, generate recommendations, discuss decisions, and create service-specific Terraform resources.

**Requires:** Existing `.infra/` with ANALYSIS.md, SERVICES.md, and DECISIONS.md.

**Creates/Updates:**
- `.infra/ANALYSIS.md` — updated with new service findings
- `.infra/SERVICES.md` — new service entry added
- `.infra/DECISIONS.md` — new service decisions appended
- `.infra/terraform/` — new service .tf files + updated shared resources

**After this command:** Run `/infra:validate` then `/infra:plan`.
</objective>

<execution_context>
@~/.claude/get-infra-done/workflows/add-service.md
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
Follow the workflow at `~/.claude/get-infra-done/workflows/add-service.md`.

1. Verify existing infrastructure
2. Ask user about the new service (path, description)
3. Scan the new service
4. Generate service-specific recommendations
5. Discuss and lock decisions for the new service
6. Generate service Terraform + update shared resources
7. Re-validate
8. Present results and commit
</process>
