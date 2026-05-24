---
name: ysclaw-patch-plan-writer
description: Use when creating a PatchPlan from a validated RootCauseBlueprint; this skill must not edit code.
---

# PatchPlan Writer

Create a schema-valid `PatchPlan` without modifying repository code.

## Inputs

- Valid `RootCauseBlueprint`.
- Optional historical optimization notes from the shared experience center.

## Procedure

1. Confirm the blueprint is valid.
2. Create a plan with one focused change item per candidate file.
3. State the smallest intended change, the risk, and the exact validation commands.
   Validation commands must use the whitelisted `agent1 patch_regression` form only.
4. Validate the output:

   ```bash
   node tools/ysclaw-agent4-tools.js validate patch-plan path/to/patch-plan.json
   ```

## Output Contract

Return a JSON object matching `schemas/patch-plan.schema.json`.

Do not include implementation diff in the plan. The diff belongs to `PatchCandidate`.

Do not invent fallback files such as `UNKNOWN`; if the blueprint is incomplete, reject it and ask for a corrected Agent3 output.
