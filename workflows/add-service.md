<purpose>
Add a new service to existing infrastructure: re-scan for the new service, generate per-service recommendations, discuss decisions, generate service-specific Terraform module, and update shared resources.
</purpose>

<required_reading>
@~/.claude/get-infra-done/references/ui-brand.md
</required_reading>

<process>

## 1. Verify Existing Infrastructure

Verify `.infra/` exists with ANALYSIS.md, SERVICES.md, and DECISIONS.md.

If not: "Run /infra:new-project first to set up base infrastructure."

## 2. Re-scan for New Service

```
━━━ INFRA ► SCANNING FOR NEW SERVICE ━━━
```

Ask user: "What service are you adding? Provide path or description."

**Spawn scanner focused on the new service path:**
```
Task(prompt="Scan {service_path} for deployment-relevant information. Append findings to .infra/ANALYSIS.md.", subagent_type="infra-scanner", model="{scanner_model}", description="Scan new service")
```

**Update SERVICES.md** with new service entry:
```bash
node ~/.claude/get-infra-done/bin/infra-tools.cjs service add {name} --type {type} --language {lang} --framework {fw} --port {port} --path {path}
```

## 3. Generate Service Recommendations

```
━━━ INFRA ► RECOMMENDING RESOURCES FOR {SERVICE_NAME} ━━━
```

Spawn recommender focused on the new service only.

Present recommendations to user.

## 4. Discuss & Lock Decisions

Interactive Q&A for the new service's compute, database, and other resources.

Append new decisions to existing DECISIONS.md.

## 5. Generate Service Terraform

Spawn terraform-gen to create service-specific .tf files:
- `{service_name}.tf` — service-specific resources
- Update `security_groups.tf` — add service SG
- Update `iam.tf` — add service role
- Update `outputs.tf` — add service outputs

## 6. Re-validate

Spawn validator and security auditor on updated terraform directory.

## 7. Present Results

```
━━━ INFRA ► SERVICE ADDED ━━━

Added: {service_name} ({type})
New files: {new_tf_files}
Updated: security_groups.tf, iam.tf, outputs.tf

Next: /infra:validate or /infra:plan
```

**Commit:** `infra: add {service_name} service`

</process>

<success_criteria>
- [ ] New service detected and added to SERVICES.md
- [ ] Service-specific recommendations generated
- [ ] Decisions locked for new service
- [ ] Terraform files generated for new service
- [ ] Shared resources updated (SG, IAM, outputs)
- [ ] Validation passed
- [ ] All changes committed
</success_criteria>
