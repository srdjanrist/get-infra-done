<purpose>
Standalone Terraform generation: requires DECISIONS.md to exist. Generates architecture, Terraform files, and optionally runs validation, security audit, and cost estimation.
</purpose>

<required_reading>
@~/.claude/get-infra-done/references/ui-brand.md
@~/.claude/get-infra-done/references/terraform-conventions.md
</required_reading>

<process>

## 1. Check Prerequisites

```bash
INIT=$(node ~/.claude/get-infra-done/bin/infra-tools.cjs init generate)
```

Parse JSON result. Check `prerequisites_met`.

**If prerequisites NOT met:**
```
┌─────────────────────────────────────────────┐
│ ✗ INFRA ERROR                               │
│                                             │
│ Missing prerequisites:                      │
│   Analysis: {analysis_exists ? "✓" : "✗"}   │
│   Decisions: {decisions_exists ? "✓" : "✗"} │
│                                             │
│ Run /infra:analyze then /infra:discuss first│
└─────────────────────────────────────────────┘
```
Stop execution.

## 2. Generate Architecture (if not exists)

**If `.infra/ARCHITECTURE.md` does not exist:**

```
━━━ INFRA ► GENERATING ARCHITECTURE ━━━
```

```
Task(prompt="Design full AWS architecture from .infra/DECISIONS.md. Write .infra/ARCHITECTURE.md.", subagent_type="infra-architect", model="{architect_model}", description="Design architecture")
```

Wait and verify output.

**Commit:** `infra: define AWS architecture`

## 3. Generate Terraform

```
━━━ INFRA ► GENERATING TERRAFORM ━━━
```

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage generate`

```
Task(prompt="Generate production Terraform files from .infra/ARCHITECTURE.md. Write to .infra/terraform/.", subagent_type="infra-terraform-gen", model="{terraform_gen_model}", description="Generate Terraform")
```

**If `generate_cicd` is true:**
```
Task(prompt="Generate CI/CD pipeline for .infra/terraform/.", subagent_type="infra-cicd-gen", model="{cicd_gen_model}", description="Generate CI/CD")
```

Wait and verify `.infra/terraform/main.tf` exists.

**Commit:** `infra: generate Terraform files`

## 4. Validate + Audit + Estimate

```
━━━ INFRA ► VALIDATING INFRASTRUCTURE ━━━
```

Spawn validation agents in parallel (same as new-project step 7).

**Commit:** `infra: validate and audit infrastructure`

## 5. Present Results

```
━━━ INFRA ► TERRAFORM GENERATED ━━━

Files: {count} .tf files in .infra/terraform/
Security: {critical_count} critical, {warning_count} warnings
Cost: ${total_low} - ${total_high}/month

Next:
  /infra:validate  — re-run validation
  /infra:plan      — run terraform plan
  terraform -chdir=.infra/terraform apply
```

</process>

<output>
- `.infra/ARCHITECTURE.md`
- `.infra/terraform/*.tf`
- `.infra/SECURITY-AUDIT.md` (if enabled)
- `.infra/COST-ESTIMATE.md` (if enabled)
- `.github/workflows/deploy.yml` (if CI/CD enabled)
</output>

<success_criteria>
- [ ] Prerequisites verified (ANALYSIS.md + DECISIONS.md exist)
- [ ] Architecture designed
- [ ] Terraform files generated
- [ ] Validation passed
- [ ] Security audit completed (if enabled)
- [ ] Cost estimate produced (if enabled)
- [ ] All artifacts committed
</success_criteria>
