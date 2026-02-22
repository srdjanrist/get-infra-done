<purpose>
Update existing infrastructure: re-analyze the repository, diff against previous analysis, detect drift or new requirements, and update Terraform files accordingly.
</purpose>

<required_reading>
@~/.claude/get-infra-done/references/ui-brand.md
</required_reading>

<process>

## 1. Check Current State

```bash
INIT=$(node ~/.claude/get-infra-done/bin/infra-tools.cjs init analyze)
```

Verify `.infra/` exists with existing analysis and terraform files.

If not: "No existing infrastructure found. Run /infra:new-project first."

**Save previous analysis for diffing:**
```bash
cp .infra/ANALYSIS.md .infra/ANALYSIS.md.prev 2>/dev/null
cp .infra/SERVICES.md .infra/SERVICES.md.prev 2>/dev/null
```

## 2. Re-analyze Repository

```
━━━ INFRA ► RE-ANALYZING REPOSITORY ━━━
```

**Spawn scanner and detector** (same as analyze-repo workflow step 2).

Wait for completion.

## 3. Detect Changes

Compare new analysis with previous:

Read both `.infra/ANALYSIS.md` and `.infra/ANALYSIS.md.prev`.

Identify:
- **New services** — services in new SERVICES.md not in previous
- **Removed services** — services in previous not in new
- **Changed services** — services with different framework, port, or dependencies
- **New database dependencies** — databases not previously detected
- **Changed environment variables** — new required env vars

**Display:**
```
━━━ INFRA ► CHANGES DETECTED ━━━

New services: {list}
Removed services: {list}
Changed: {list}
New dependencies: {list}

No changes: {list_of_unchanged}
```

**If no changes detected:**
"No infrastructure-relevant changes detected. Current Terraform is up to date."
Clean up .prev files and exit.

## 4. Update Decisions

For each change, ask user if DECISIONS.md needs updating:
- New services need new decisions
- Removed services need cleanup
- Changed services may need re-evaluation

Update DECISIONS.md accordingly.

## 5. Regenerate Affected Terraform

Spawn terraform-gen to update affected files only.

Note which files are being regenerated vs. kept.

## 6. Re-validate

Spawn validator and security auditor on updated terraform.

## 7. Clean Up & Present

```bash
rm .infra/ANALYSIS.md.prev .infra/SERVICES.md.prev 2>/dev/null
```

**Display:**
```
━━━ INFRA ► UPDATE COMPLETE ━━━

Changes applied:
  {list_of_changes}

Updated files:
  {list_of_updated_tf_files}

Next: /infra:validate or /infra:plan
```

**Commit:** `infra: update infrastructure for repository changes`

</process>

<success_criteria>
- [ ] Repository re-analyzed
- [ ] Changes detected and presented
- [ ] Decisions updated for changes
- [ ] Terraform regenerated for affected services
- [ ] Validation passed
- [ ] Previous analysis cleaned up
- [ ] Changes committed
</success_criteria>
