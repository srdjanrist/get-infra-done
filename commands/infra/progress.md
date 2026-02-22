---
name: infra:progress
description: Show infrastructure pipeline status and next steps
argument-hint: ""
allowed-tools:
  - Read
  - Bash
---

<objective>
Display the current state of the infrastructure generation pipeline, showing which stages are complete and what to do next.
</objective>

<execution_context>
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
1. Load pipeline state:
   ```bash
   PROGRESS=$(node ~/.claude/get-infra-done/bin/infra-tools.cjs init progress)
   ```

2. Display pipeline status:
   ```
   ━━━ INFRA ► PIPELINE STATUS ━━━

   Region:      {aws_region}
   Environment: {environment}
   Stage:       {current_stage}

   Pipeline:
     {status_symbol} scan      — {description}
     {status_symbol} recommend — {description}
     {status_symbol} discuss   — {description}
     {status_symbol} generate  — {description}
     {status_symbol} validate  — {description}
     {status_symbol} complete  — {description}

   Artifacts:
     config.json:        {exists ? "✓" : "○"}
     ANALYSIS.md:        {exists ? "✓" : "○"}
     SERVICES.md:        {exists ? "✓" : "○"}
     RECOMMENDATIONS.md: {exists ? "✓" : "○"}
     DECISIONS.md:       {exists ? "✓" : "○"}
     ARCHITECTURE.md:    {exists ? "✓" : "○"}
     terraform/:         {exists ? "✓ ({count} files)" : "○"}
     SECURITY-AUDIT.md:  {exists ? "✓" : "○"}
     COST-ESTIMATE.md:   {exists ? "✓" : "○"}
   ```

3. Suggest next action based on current stage:
   - `not_started` → "Run `/infra:new-project` to start"
   - `scan` → "Run `/infra:recommend` to generate recommendations"
   - `recommend` → "Run `/infra:discuss` to lock decisions"
   - `discuss` → "Run `/infra:generate` to produce Terraform"
   - `generate` → "Run `/infra:validate` to check infrastructure"
   - `validate` → "Run `/infra:plan` to preview changes"
   - `complete` → "Infrastructure is ready. Run `terraform -chdir=.infra/terraform apply`"
</process>
