---
name: infra:help
description: Show available infrastructure commands and usage guide
argument-hint: ""
allowed-tools:
  - Read
---

<objective>
Display the complete list of infrastructure commands with descriptions and typical workflow.
</objective>

<process>
Display the following:

```
━━━ INFRA ► COMMAND REFERENCE ━━━

Full Pipeline:
  /infra:new-project    Full pipeline: scan → recommend → discuss → generate

Individual Stages:
  /infra:analyze        Deep repository analysis (scan + detect services)
  /infra:recommend      Generate AWS resource recommendations
  /infra:discuss        Interactive Q&A to lock infrastructure decisions
  /infra:generate       Generate Terraform from locked decisions

Validation & Planning:
  /infra:validate       Run terraform validate + security audit
  /infra:plan           Run terraform plan, show changes + cost

Modification:
  /infra:add-service    Add new service to existing infrastructure
  /infra:update         Re-analyze, detect drift, update Terraform

Audit:
  /infra:audit          Full audit pipeline: scan → Q&A → report
  /infra:audit-drill    Resume gap-filling Q&A from previous audit
  /infra:audit-report   Generate/regenerate audit report

Status:
  /infra:progress       Show pipeline status and next steps
  /infra:help           This help message

━━━ TYPICAL WORKFLOW ━━━

  1. /infra:new-project     ← Start here (runs everything)
     OR run stages individually:
     /infra:analyze → /infra:recommend → /infra:discuss → /infra:generate

  2. /infra:validate        ← Check for issues
  3. /infra:plan            ← Preview terraform changes
  4. terraform apply        ← Deploy (manual step)

  Audit existing IaC:
     /infra:audit → /infra:audit-drill → /infra:audit-report

━━━ FILES ━━━

  .infra/
  ├── config.json          Configuration
  ├── STATE.md             Pipeline state
  ├── ANALYSIS.md          Repository analysis
  ├── SERVICES.md          Detected services
  ├── RECOMMENDATIONS.md   AWS recommendations
  ├── DECISIONS.md         Locked decisions
  ├── ARCHITECTURE.md      Architecture design
  ├── SECURITY-AUDIT.md    Security findings
  ├── COST-ESTIMATE.md     Cost estimates
  ├── AUDIT-SCAN.md        Infrastructure audit scan
  ├── AUDIT-REPORT.md      Infrastructure audit report
  └── terraform/
      ├── main.tf          Provider + backend
      ├── variables.tf     Input variables
      ├── vpc.tf           Network infrastructure
      ├── ecs.tf           Compute (ECS/Lambda)
      ├── rds.tf           Database
      ├── iam.tf           IAM roles + policies
      ├── security_groups.tf  Security groups
      ├── monitoring.tf    CloudWatch + alerts
      └── outputs.tf       Useful outputs
```
</process>
