---
name: infra:recommend
description: Generate AWS resource recommendations from analysis
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Task
---

<objective>
Read ANALYSIS.md and SERVICES.md, apply AWS decision trees, and generate specific resource recommendations.

**Requires:** `.infra/ANALYSIS.md` and `.infra/SERVICES.md` (run `/infra:analyze` first)

**Creates:**
- `.infra/RECOMMENDATIONS.md` — per-service AWS mapping with compute, database, cache, and rationale

**After this command:** Run `/infra:discuss` to review and lock decisions.
</objective>

<execution_context>
@~/.claude/get-infra-done/references/compute-selection.md
@~/.claude/get-infra-done/references/database-selection.md
@~/.claude/get-infra-done/references/aws-patterns.md
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
1. Verify ANALYSIS.md and SERVICES.md exist
2. Spawn infra-recommender agent
3. Wait for RECOMMENDATIONS.md
4. Present summary to user
5. Commit: `infra: generate AWS recommendations`
</process>
