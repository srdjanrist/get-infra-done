---
name: infra:discuss
description: Interactive Q&A to review recommendations and lock infrastructure decisions
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
---

<objective>
Walk through AWS recommendations with the user, discussing each major decision (compute, database, caching per service), and lock the approved decisions into DECISIONS.md.

**Requires:** `.infra/RECOMMENDATIONS.md` (run `/infra:recommend` first)

**Creates:**
- `.infra/DECISIONS.md` — locked decisions table with rationale

**After this command:** Run `/infra:generate` to produce Terraform files.
</objective>

<execution_context>
@~/.claude/get-infra-done/references/ui-brand.md
@~/.claude/get-infra-done/templates/decisions.md
</execution_context>

<process>
1. Read RECOMMENDATIONS.md
2. For each service, present the recommended compute and ask for approval:
   - Show recommendation with rationale and cost
   - Offer alternatives (Lambda, EC2, etc.)
   - Record decision
3. For each database dependency, present the recommended engine and size
4. For shared infrastructure (VPC, ALB, NAT), present defaults and ask for overrides
5. Write DECISIONS.md with all locked decisions
6. Update STATE.md: `Decisions Locked: yes`
7. Commit: `infra: lock infrastructure decisions`

**Display format for each decision:**
```
━━━ INFRA ► DECISION REQUIRED ━━━

Service: {name}
Recommended: {recommendation}
Cost: ${low} - ${high}/month
Rationale: {why}
```
</process>
