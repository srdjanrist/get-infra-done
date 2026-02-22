<purpose>
Full infrastructure generation pipeline: scan repository → detect services → recommend AWS resources → discuss decisions with user → generate architecture → generate Terraform → validate → security audit → cost estimate.
</purpose>

<required_reading>
@~/.claude/get-infra-done/references/ui-brand.md
@~/.claude/get-infra-done/references/aws-patterns.md
</required_reading>

<process>

## 1. Initialize

```bash
INIT=$(node ~/.claude/get-infra-done/bin/infra-tools.cjs init new-project)
```

Parse JSON result for: models, config, detection results, existing state.

**If `.infra/` already exists with STATE.md:**
Ask user: "Infrastructure files already exist. Start fresh or continue from current stage?"
- Fresh: delete `.infra/` and restart
- Continue: read STATE.md and jump to current stage

**If `.infra/` does not exist:**
```bash
mkdir -p .infra
node ~/.claude/get-infra-done/bin/infra-tools.cjs config-ensure-section
```

**Initialize STATE.md:**
Read template from `~/.claude/get-infra-done/templates/state.md`.
Write `.infra/STATE.md` with today's date and detected region/environment.

**Display stage banner:**
```
━━━ INFRA ► INITIALIZING ━━━

Project: {cwd}
Region:  {aws_region}
Env:     {environment}
Docker:  {has_dockerfile ? "✓" : "✗"}
Languages: {detected_languages.join(", ")}
```

**Commit:** `git add .infra/ && git commit -m "infra: initialize .infra/ directory"`

## 2. Scan Repository

**Display:**
```
━━━ INFRA ► SCANNING REPOSITORY ━━━
```

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage scan`

**Spawn agents in parallel:**
```
Task(prompt="Scan the repository at {cwd} for deployment-relevant information. Write .infra/ANALYSIS.md.", subagent_type="infra-scanner", model="{scanner_model}", description="Scan repo")

Task(prompt="Detect deployable services in the repository at {cwd}. Read .infra/ANALYSIS.md first, then write .infra/SERVICES.md.", subagent_type="infra-service-detector", model="{detector_model}", description="Detect services")
```

**Wait for both agents to complete.**

**Verify outputs exist:**
- `.infra/ANALYSIS.md` must exist
- `.infra/SERVICES.md` must exist

If either is missing, re-spawn the failed agent.

**Display detected services:**
```
✓ Scan complete

Detected Services:
| Service | Type | Language | Port |
|---------|------|----------|------|
[from SERVICES.md]
```

**Commit:** `infra: scan repository and detect services`

## 3. Generate Recommendations

**Display:**
```
━━━ INFRA ► GENERATING RECOMMENDATIONS ━━━
```

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage recommend`

**Spawn recommender:**
```
Task(prompt="Read .infra/ANALYSIS.md and .infra/SERVICES.md. Generate AWS resource recommendations. Write .infra/RECOMMENDATIONS.md.", subagent_type="infra-recommender", model="{recommender_model}", description="Generate recommendations")
```

**Wait for completion. Verify `.infra/RECOMMENDATIONS.md` exists.**

**Present recommendations to user** — read and display RECOMMENDATIONS.md summary.

**Commit:** `infra: generate AWS recommendations`

## 4. Discussion Phase

**Display:**
```
━━━ INFRA ► DISCUSSING DECISIONS ━━━
```

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage discuss`

**If `auto_approve_recommendations` is true in config:**
Copy RECOMMENDATIONS.md decisions directly to DECISIONS.md and skip to step 5.

**Interactive Q&A:**
For each service recommendation, ask the user:

```
AskUserQuestion({
  questions: [{
    question: "For service '{service_name}', approve recommended compute: {recommendation}?",
    header: "Compute",
    options: [
      { label: "Approve (Recommended)", description: "{recommendation_details}" },
      { label: "Change to Lambda", description: "Serverless, pay-per-use" },
      { label: "Change to EC2", description: "Self-managed instances" }
    ],
    multiSelect: false
  }]
})
```

Repeat for database, caching, and other significant decisions.

**Write DECISIONS.md:**
Read template from `~/.claude/get-infra-done/templates/decisions.md`.
Fill with locked decisions from user responses.
Set status to "locked".

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state patch --"Decisions Locked" yes`

**Commit:** `infra: lock infrastructure decisions`

## 5. Generate Architecture

**Display:**
```
━━━ INFRA ► GENERATING ARCHITECTURE ━━━
```

**Spawn architect:**
```
Task(prompt="Design full AWS architecture from .infra/DECISIONS.md. Write .infra/ARCHITECTURE.md.", subagent_type="infra-architect", model="{architect_model}", description="Design architecture")
```

**Wait for completion. Verify `.infra/ARCHITECTURE.md` exists.**

**Present architecture to user** — display network topology diagram and resource summary.

**Ask for approval:**
```
AskUserQuestion({
  questions: [{
    question: "Approve this architecture? Review .infra/ARCHITECTURE.md for full details.",
    header: "Architecture",
    options: [
      { label: "Approve", description: "Proceed to Terraform generation" },
      { label: "Request changes", description: "Describe what to change" }
    ],
    multiSelect: false
  }]
})
```

If changes requested, discuss and re-generate.

**Commit:** `infra: define AWS architecture`

## 6. Generate Terraform + CI/CD

**Display:**
```
━━━ INFRA ► GENERATING TERRAFORM ━━━
```

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage generate`

**Spawn generators in parallel:**
```
Task(prompt="Generate production Terraform files from .infra/ARCHITECTURE.md. Write to .infra/terraform/.", subagent_type="infra-terraform-gen", model="{terraform_gen_model}", description="Generate Terraform")

Task(prompt="Generate CI/CD pipeline for deploying .infra/terraform/. Detect existing CI system.", subagent_type="infra-cicd-gen", model="{cicd_gen_model}", description="Generate CI/CD")
```

(Only spawn cicd-gen if `generate_cicd` is true in config.)

**Wait for both. Verify `.infra/terraform/main.tf` exists.**

**Commit:** `infra: generate Terraform and CI/CD configuration`

## 7. Validate + Audit + Estimate

**Display:**
```
━━━ INFRA ► VALIDATING INFRASTRUCTURE ━━━
```

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage validate`

**Spawn validators in parallel:**
```
Task(prompt="Validate .infra/terraform/ files for correctness.", subagent_type="infra-validator", model="{validator_model}", description="Validate Terraform")

Task(prompt="Audit .infra/terraform/ for security compliance.", subagent_type="infra-security-auditor", model="{security_auditor_model}", description="Security audit")

Task(prompt="Estimate monthly costs for .infra/terraform/ resources.", subagent_type="infra-cost-estimator", model="{cost_estimator_model}", description="Cost estimate")
```

(Only spawn security-auditor if `run_security_audit` is true.)
(Only spawn cost-estimator if `run_cost_estimate` is true.)

**Wait for all. Present results.**

**Display security audit summary:**
```
┌─────────────────────────────────────────────┐
│ INFRA ► Security Audit Results              │
│ CRITICAL: {count}  WARNING: {count}  INFO: {count}  │
└─────────────────────────────────────────────┘
```

**Display cost estimate:**
```
┌─────────────────────────────────────────────┐
│ INFRA ► Monthly Cost Estimate               │
│ Low:  ${total_low}                          │
│ High: ${total_high}                         │
└─────────────────────────────────────────────┘
```

**Commit:** `infra: add validation, security audit, and cost estimate`

## 8. Complete

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage complete`

**Count terraform files:**
```bash
ls .infra/terraform/*.tf | wc -l
```

**Display completion:**
```
━━━ INFRA ► COMPLETE ━━━

Generated:
  ✓ .infra/ANALYSIS.md — repository analysis
  ✓ .infra/SERVICES.md — detected services
  ✓ .infra/RECOMMENDATIONS.md — AWS recommendations
  ✓ .infra/DECISIONS.md — locked decisions
  ✓ .infra/ARCHITECTURE.md — AWS architecture
  ✓ .infra/terraform/ — {count} Terraform files
  ✓ .infra/SECURITY-AUDIT.md — security findings
  ✓ .infra/COST-ESTIMATE.md — cost estimates

Next Steps:
  /infra:validate  — re-run validation
  /infra:plan      — run terraform plan
  Review .infra/terraform/*.tf before applying

  To deploy:
    cd .infra/terraform
    terraform init
    terraform plan
    terraform apply
```

</process>

<output>
- `.infra/config.json`
- `.infra/STATE.md`
- `.infra/ANALYSIS.md`
- `.infra/SERVICES.md`
- `.infra/RECOMMENDATIONS.md`
- `.infra/DECISIONS.md`
- `.infra/ARCHITECTURE.md`
- `.infra/terraform/*.tf`
- `.infra/SECURITY-AUDIT.md`
- `.infra/COST-ESTIMATE.md`
- `.github/workflows/deploy.yml` (if CI/CD enabled)
</output>

<success_criteria>
- [ ] `.infra/` directory initialized with config and state
- [ ] Repository scanned and ANALYSIS.md written
- [ ] Services detected and SERVICES.md written
- [ ] Recommendations generated and reviewed
- [ ] Decisions locked with user approval
- [ ] Architecture designed and approved
- [ ] Terraform files generated
- [ ] Validation passed
- [ ] Security audit completed (if enabled)
- [ ] Cost estimate produced (if enabled)
- [ ] All artifacts committed to git

**Atomic commits at each stage:**
1. `infra: initialize .infra/ directory`
2. `infra: scan repository and detect services`
3. `infra: generate AWS recommendations`
4. `infra: lock infrastructure decisions`
5. `infra: define AWS architecture`
6. `infra: generate Terraform and CI/CD configuration`
7. `infra: add validation, security audit, and cost estimate`
</success_criteria>
