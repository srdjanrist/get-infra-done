---
name: infra:audit
description: Audit existing infrastructure-as-code — scan, identify gaps, Q&A, generate report
argument-hint: ""
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
  - Glob
  - Grep
---

<objective>
Run the complete infrastructure audit pipeline for a repository with existing IaC: scan → identify gaps → drill-down Q&A → generate report.

**Creates:**
- `.infra/AUDIT-SCAN.md` — infrastructure scan with resource inventory and gaps
- `.infra/AUDIT-REPORT.md` — comprehensive audit report with recommendations

**After this command:** Review `.infra/AUDIT-REPORT.md`, then run `/infra:audit-drill` to answer remaining gaps or `/infra:audit-report` to regenerate the report.
</objective>

<execution_context>
@~/.claude/get-infra-done/workflows/audit-infra.md
@~/.claude/get-infra-done/references/ui-brand.md
@~/.claude/get-infra-done/references/security-baseline.md
</execution_context>

<process>
Follow the workflow at `~/.claude/get-infra-done/workflows/audit-infra.md` exactly.

The workflow has 6 stages:
1. Initialize — detect IaC type, create .infra/ if needed, update STATE.md
2. Scan — spawn infra-audit-scanner
3. Identify Gaps — parse gap list from AUDIT-SCAN.md
4. Drill Down — interactive Q&A for each gap (with Skip option)
5. Generate Report — spawn infra-audit-reporter
6. Complete — present summary and next steps
</process>
