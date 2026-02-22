---
name: infra:audit-drill
description: Resume iterative Q&A to fill gaps in infrastructure audit
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - AskUserQuestion
---

<objective>
Resume the gap-filling Q&A process from a previous audit scan. Reads AUDIT-SCAN.md, finds unresolved gaps, and asks questions via interactive Q&A.

**Requires:** `.infra/AUDIT-SCAN.md` (run `/infra:audit` first)

**Creates/Updates:**
- `.infra/AUDIT-SCAN.md` — appends clarifications to the "Clarifications" section

**After this command:** Run `/infra:audit-report` to regenerate the report with new clarifications.
</objective>

<execution_context>
@~/.claude/get-infra-done/references/ui-brand.md
</execution_context>

<process>
1. Read `.infra/AUDIT-SCAN.md`
   - If it does not exist, inform the user: "No audit scan found. Run `/infra:audit` first."

2. Parse the "Gaps & Unclear Areas" table to get all gap IDs and descriptions

3. Parse the "Clarifications" section to find which gaps already have answers

4. For each unresolved gap, ask via AskUserQuestion:
   ```
   AskUserQuestion({
     questions: [{
       question: "{gap_description}",
       header: "{gap_category}",
       options: [
         { label: "Provide answer", description: "I can clarify this" },
         { label: "Skip", description: "I don't know or this isn't relevant" },
         { label: "Not applicable", description: "This doesn't apply to our setup" }
       ],
       multiSelect: false
     }]
   })
   ```

   If user selects "Provide answer", they will type their response.
   If user selects "Skip" or "Not applicable", record that and move on.

5. Append each answer to the "Clarifications" section in AUDIT-SCAN.md:
   ```
   ### gap-{N}: {category}
   **Question:** {gap_description}
   **Answer:** {user_response}
   ```

6. Display summary:
   ```
   ━━━ INFRA ► AUDIT DRILL-DOWN COMPLETE ━━━

   Gaps resolved: {count}
   Gaps skipped:  {count}
   Gaps remaining: {count}

   Next: Run /infra:audit-report to regenerate the report with new clarifications.
   ```
</process>
