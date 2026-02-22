---
name: infra:audit-report
description: Generate or regenerate the infrastructure audit report
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Task
  - Bash
---

<objective>
Generate (or regenerate) the comprehensive infrastructure audit report from scan results and accumulated clarifications.

**Requires:** `.infra/AUDIT-SCAN.md` (run `/infra:audit` first)

**Creates:**
- `.infra/AUDIT-REPORT.md` — comprehensive audit report with recommendations

**After this command:** Review the report. Run `/infra:audit-drill` to answer more gaps, then re-run `/infra:audit-report` to update.
</objective>

<execution_context>
@~/.claude/get-infra-done/references/ui-brand.md
@~/.claude/get-infra-done/references/security-baseline.md
</execution_context>

<process>
1. Load audit context:
   ```bash
   INIT=$(node ~/.claude/get-infra-done/bin/infra-tools.cjs init audit)
   ```
   Parse JSON for model assignments and state.

2. Verify AUDIT-SCAN.md exists:
   - If not, inform the user: "No audit scan found. Run `/infra:audit` first."

3. Display:
   ```
   ━━━ INFRA ► GENERATING AUDIT REPORT ━━━
   ```

4. Spawn reporter:
   ```
   Task(prompt="Read .infra/AUDIT-SCAN.md (including all clarifications) and ~/.claude/get-infra-done/references/security-baseline.md. Generate a comprehensive audit report. Write .infra/AUDIT-REPORT.md.", subagent_type="infra-audit-reporter", model="{reporter_model}", description="Generate audit report")
   ```

5. Wait for completion. Verify `.infra/AUDIT-REPORT.md` exists.

6. Read the executive summary from the report and display:
   ```
   ━━━ INFRA ► AUDIT REPORT GENERATED ━━━

   Assessment: {GREEN/YELLOW/RED}
   Resources:  {total_count}
   Critical:   {critical_count}
   Warnings:   {warning_count}

   Report: .infra/AUDIT-REPORT.md

   Next Steps:
     /infra:audit-drill   — answer remaining gaps
     /infra:audit-report  — regenerate after new clarifications
   ```

7. Commit: `infra: generate infrastructure audit report`
</process>
