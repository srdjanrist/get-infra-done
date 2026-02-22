<purpose>
Infrastructure audit pipeline: scan existing IaC → inventory resources → evaluate security posture → identify gaps → drill-down Q&A with user → generate comprehensive audit report.
</purpose>

<required_reading>
@~/.claude/get-infra-done/references/ui-brand.md
@~/.claude/get-infra-done/references/security-baseline.md
</required_reading>

<process>

## 1. Initialize

```bash
INIT=$(node ~/.claude/get-infra-done/bin/infra-tools.cjs init audit)
```

Parse JSON result for: models, config, IaC detection, previous audit state, existing infra state.

**If `.infra/` already exists with AUDIT-SCAN.md:**
Ask user: "Previous audit scan found ({previous_date}). Start fresh or continue?"
- Fresh: remove AUDIT-SCAN.md and AUDIT-REPORT.md, restart
- Continue: skip to stage 3 (Identify Gaps) or stage 5 (Generate Report)

**If `.infra/` does not exist:**
```bash
mkdir -p .infra
node ~/.claude/get-infra-done/bin/infra-tools.cjs config-ensure-section
```

**Display stage banner:**
```
━━━ INFRA ► INITIALIZING AUDIT ━━━

Project:  {cwd}
IaC Type: {detected_iac_type}
Region:   {aws_region}
Env:      {environment}
```

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage audit-scan`

**Commit:** `git add .infra/ && git commit -m "infra: initialize audit"`

## 2. Scan Existing Infrastructure

**Display:**
```
━━━ INFRA ► SCANNING EXISTING INFRASTRUCTURE ━━━
```

**Spawn scanner:**
```
Task(prompt="Scan the existing infrastructure-as-code in this repository. Inventory all resources, evaluate security posture against ~/.claude/get-infra-done/references/security-baseline.md, identify gaps that need human clarification. Write .infra/AUDIT-SCAN.md.", subagent_type="infra-audit-scanner", model="{scanner_model}", description="Audit scan IaC")
```

**Wait for completion.**

**Verify `.infra/AUDIT-SCAN.md` exists.** If missing, re-spawn the agent.

**Display scan summary:**
```
✓ Scan complete

IaC Type: {type}
Resources Found: {count}
Security Findings: {critical} critical, {warning} warnings, {info} info
Gaps Identified: {gap_count}
```

**Commit:** `infra: audit scan of existing IaC`

## 3. Identify Gaps

**Read `.infra/AUDIT-SCAN.md`** and parse the "Gaps & Unclear Areas" table.

Extract all gap entries: gap ID, category, description, impact.

If no gaps found, skip to stage 5 (Generate Report).

**Display:**
```
━━━ INFRA ► GAPS IDENTIFIED ━━━

Found {count} areas that need clarification:
{list gap IDs and descriptions}
```

## 4. Drill Down — Interactive Q&A

**Display:**
```
━━━ INFRA ► CLARIFYING GAPS ━━━
```

For each gap, ask the user:

```
AskUserQuestion({
  questions: [{
    question: "{gap_description} (Impact: {gap_impact})",
    header: "{gap_id}",
    options: [
      { label: "Provide answer", description: "I can clarify this" },
      { label: "Skip", description: "I'll answer this later via /infra:audit-drill" },
      { label: "Not applicable", description: "This doesn't apply to our setup" }
    ],
    multiSelect: false
  }]
})
```

If user selects "Provide answer", they will type their response in the "Other" field.
If user selects "Skip", record as skipped and move to next gap.
If user selects "Not applicable", record as N/A.

**Append each answer to AUDIT-SCAN.md "Clarifications" section:**
```markdown
### gap-{N}: {category}
**Question:** {gap_description}
**Answer:** {user_response_or_skipped_or_na}
```

**Display progress after each answer:**
```
Gap {current}/{total}: {resolved/skipped/na}
```

**Commit:** `infra: clarify audit gaps`

## 5. Generate Report

**Display:**
```
━━━ INFRA ► GENERATING AUDIT REPORT ━━━
```

**Spawn reporter:**
```
Task(prompt="Read .infra/AUDIT-SCAN.md (including all clarifications) and ~/.claude/get-infra-done/references/security-baseline.md. Generate a comprehensive audit report with executive summary, architecture diagram, security assessment, best practices evaluation, and prioritized recommendations. Write .infra/AUDIT-REPORT.md.", subagent_type="infra-audit-reporter", model="{reporter_model}", description="Generate audit report")
```

**Wait for completion. Verify `.infra/AUDIT-REPORT.md` exists.**

**Read the executive summary and display key metrics.**

**Commit:** `infra: generate infrastructure audit report`

## 6. Complete

**Display completion:**
```
━━━ INFRA ► AUDIT COMPLETE ━━━

Generated:
  ✓ .infra/AUDIT-SCAN.md  — resource inventory + security posture + gaps
  ✓ .infra/AUDIT-REPORT.md — comprehensive audit report

Assessment: {GREEN/YELLOW/RED}
Resources:  {total_count}
Critical:   {critical_count} findings
Warnings:   {warning_count} findings
Gaps:       {resolved}/{total} resolved

Next Steps:
  /infra:audit-drill   — answer remaining gaps
  /infra:audit-report  — regenerate report after new clarifications
  Review .infra/AUDIT-REPORT.md for full details
```

</process>

<output>
- `.infra/AUDIT-SCAN.md`
- `.infra/AUDIT-REPORT.md`
</output>

<success_criteria>
- [ ] IaC type detected correctly
- [ ] `.infra/AUDIT-SCAN.md` written with complete resource inventory
- [ ] Security posture evaluated against security baseline
- [ ] Gaps identified and presented to user
- [ ] User clarifications appended to AUDIT-SCAN.md
- [ ] `.infra/AUDIT-REPORT.md` written with executive summary and recommendations
- [ ] All artifacts committed to git

**Atomic commits at each stage:**
1. `infra: initialize audit`
2. `infra: audit scan of existing IaC`
3. `infra: clarify audit gaps`
4. `infra: generate infrastructure audit report`
</success_criteria>
