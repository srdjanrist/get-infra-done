---
name: infra:validate
description: Run terraform validate and security lint on generated infrastructure
argument-hint: ""
allowed-tools:
  - Read
  - Bash
  - Task
---

<objective>
Validate generated Terraform files for correctness and security compliance.

**Requires:** `.infra/terraform/` directory with .tf files

**Updates:**
- `.infra/SECURITY-AUDIT.md` — refreshed security findings

**After this command:** Fix any issues, then run `/infra:plan`.
</objective>

<execution_context>
@~/.claude/get-infra-done/references/security-baseline.md
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
1. Verify .infra/terraform/ exists with .tf files
2. Check terraform binary availability:
   ```bash
   node ~/.claude/get-infra-done/bin/infra-tools.cjs terraform check-binary
   ```
3. If available, run:
   ```bash
   cd .infra/terraform && terraform fmt -check -recursive
   cd .infra/terraform && terraform init -backend=false && terraform validate
   ```
4. Spawn infra-validator for custom checks (tags, naming, security patterns)
5. Spawn infra-security-auditor for compliance audit
6. Present consolidated results:
   ```
   ━━━ INFRA ► VALIDATION RESULTS ━━━

   terraform fmt:   {PASS/FAIL}
   terraform validate: {PASS/FAIL}
   Custom checks:   {count} issues
   Security audit:  {CRITICAL} critical, {WARNING} warnings
   ```
</process>
