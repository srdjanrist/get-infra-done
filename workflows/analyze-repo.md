<purpose>
Standalone repository analysis: scan the repository and detect services without proceeding to recommendations or Terraform generation. Useful for initial exploration or re-analysis after code changes.
</purpose>

<required_reading>
@~/.claude/get-infra-done/references/ui-brand.md
</required_reading>

<process>

## 1. Initialize

```bash
INIT=$(node ~/.claude/get-infra-done/bin/infra-tools.cjs init analyze)
```

Parse JSON result for: models, existing analysis state.

**If analysis already exists:**
```
Previous analysis found (date: {previous_analysis_date}).
Recent infra-relevant changes detected: {has_recent_changes}
```

Ask user: "Re-analyze the repository? This will overwrite existing ANALYSIS.md and SERVICES.md."

**Ensure .infra/ exists:**
```bash
node ~/.claude/get-infra-done/bin/infra-tools.cjs config-ensure-section
```

## 2. Scan

**Display:**
```
━━━ INFRA ► SCANNING REPOSITORY ━━━
```

**Spawn agents in parallel:**
```
Task(prompt="Scan the repository for deployment-relevant information. Write .infra/ANALYSIS.md.", subagent_type="infra-scanner", model="{scanner_model}", description="Scan repo")

Task(prompt="Detect deployable services. Read .infra/ANALYSIS.md first, then write .infra/SERVICES.md.", subagent_type="infra-service-detector", model="{detector_model}", description="Detect services")
```

**Wait for both agents.**

## 3. Present Results

**Verify outputs exist.**

**Display:**
```
━━━ INFRA ► ANALYSIS COMPLETE ━━━

Detected Services:
| Service | Type | Language | Framework | Port |
|---------|------|----------|-----------|------|
[from SERVICES.md]

Full analysis: .infra/ANALYSIS.md
Service details: .infra/SERVICES.md

Next: /infra:recommend to generate AWS recommendations
```

**Commit:** `infra: analyze repository`

**Update state:** `node ~/.claude/get-infra-done/bin/infra-tools.cjs state update-stage scan`

</process>

<output>
- `.infra/ANALYSIS.md`
- `.infra/SERVICES.md`
</output>

<success_criteria>
- [ ] `.infra/ANALYSIS.md` exists and is complete
- [ ] `.infra/SERVICES.md` exists with all detected services
- [ ] Results committed to git
</success_criteria>
