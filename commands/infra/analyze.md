---
name: infra:analyze
description: Deep repository analysis for deployment-relevant information
argument-hint: ""
allowed-tools:
  - Read
  - Bash
  - Write
  - Task
  - Glob
  - Grep
---

<objective>
Scan the repository and detect deployable services without proceeding to recommendations or Terraform generation.

**Creates:**
- `.infra/ANALYSIS.md` — languages, frameworks, databases, ports, env vars, Docker config
- `.infra/SERVICES.md` — detected deployable services with metadata

**After this command:** Run `/infra:recommend` to generate AWS recommendations.
</objective>

<execution_context>
@~/.claude/get-infra-done/workflows/analyze-repo.md
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
Follow the workflow at `~/.claude/get-infra-done/workflows/analyze-repo.md`.

1. Initialize — ensure .infra/ exists, check for existing analysis
2. Scan — spawn infra-scanner and infra-service-detector in parallel
3. Present — display detected services table and commit
</process>
