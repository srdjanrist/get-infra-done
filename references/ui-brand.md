# INFRA UI Brand Guide

Visual patterns for user-facing infrastructure command output.

## Stage Banners

Use at the start of each pipeline stage:

```
━━━ INFRA ► SCANNING REPOSITORY ━━━
━━━ INFRA ► GENERATING RECOMMENDATIONS ━━━
━━━ INFRA ► DISCUSSING DECISIONS ━━━
━━━ INFRA ► GENERATING TERRAFORM ━━━
━━━ INFRA ► VALIDATING INFRASTRUCTURE ━━━
━━━ INFRA ► COMPLETE ━━━
```

## Status Symbols

| Symbol | Meaning |
|--------|---------|
| `✓` | Complete / Pass |
| `✗` | Failed / Error |
| `◆` | In Progress |
| `○` | Pending |
| `⚡` | Auto-detected |
| `⚠` | Warning |
| `🔒` | Security requirement |
| `💰` | Cost-related |

## Progress Display

```
Pipeline: ████████░░░░░░░░░░░░ 40% (discuss)

✓ scan      — 3 services detected
✓ recommend — AWS resources mapped
◆ discuss   — awaiting decisions
○ generate  — pending
○ validate  — pending
○ complete  — pending
```

## Service Detection Table

```
┌─────────────────────────────────────────────┐
│ INFRA ► Detected Services                   │
├──────────┬──────────┬───────────┬───────────┤
│ Service  │ Type     │ Language  │ Port      │
├──────────┼──────────┼───────────┼───────────┤
│ api      │ web      │ Node.js   │ 3000      │
│ worker   │ worker   │ Python    │ -         │
│ frontend │ static   │ React     │ -         │
└──────────┴──────────┴───────────┴───────────┘
```

## Cost Estimate Display

```
┌─────────────────────────────────────────────┐
│ INFRA ► Monthly Cost Estimate               │
├───────────────────────┬──────────┬──────────┤
│ Component             │ Low      │ High     │
├───────────────────────┼──────────┼──────────┤
│ ECS Fargate (api)     │ $35      │ $71      │
│ RDS PostgreSQL        │ $50      │ $100     │
│ ElastiCache Redis     │ $12      │ $24      │
│ ALB + NAT             │ $48      │ $48      │
│ CloudWatch + Misc     │ $10      │ $25      │
├───────────────────────┼──────────┼──────────┤
│ TOTAL                 │ $155     │ $268     │
└───────────────────────┴──────────┴──────────┘
```

## Security Audit Display

```
┌─────────────────────────────────────────────┐
│ INFRA ► Security Audit Results              │
├─────────────┬───────────────────────────────┤
│ CRITICAL: 0 │ All critical checks passed    │
│ WARNING:  2 │ Review recommended            │
│ INFO:     5 │ Informational notes           │
└─────────────┴───────────────────────────────┘
```

## Spawning Indicators

```
⚡ Spawning infra-scanner...
⚡ Spawning infra-service-detector...
  → Running in parallel

✓ infra-scanner complete — wrote ANALYSIS.md
✓ infra-service-detector complete — wrote SERVICES.md
```

## Decision Discussion Format

```
━━━ INFRA ► DECISION REQUIRED ━━━

For service "api":
  Recommended compute: ECS Fargate (1 vCPU / 2GB)
  Rationale: Long-running HTTP service with predictable traffic

  Options:
  1. ECS Fargate (recommended) — $35/month
  2. Lambda + API Gateway — $5-50/month (variable)
  3. EC2 t3.medium — $30/month (self-managed)

  Do you approve this recommendation?
```

## Next Steps Block

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFRA ► Next Steps

  Generated: .infra/terraform/ (8 files)

  To review:     Review .infra/terraform/*.tf
  To validate:   /infra:validate
  To plan:       /infra:plan
  To deploy:     terraform -chdir=.infra/terraform apply

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Error Display

```
┌─────────────────────────────────────────────┐
│ ✗ INFRA ERROR                               │
│                                             │
│ DECISIONS.md not found.                     │
│ Run /infra:discuss first to lock decisions. │
└─────────────────────────────────────────────┘
```

## Anti-Patterns

- Do NOT use emoji in stage banners (symbols only)
- Do NOT wrap long file paths — let terminal handle wrapping
- Do NOT use color codes — terminal compatibility varies
- Do NOT show internal agent names to users
- Do NOT display raw JSON — always format for readability
