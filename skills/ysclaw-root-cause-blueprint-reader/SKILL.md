---
name: ysclaw-root-cause-blueprint-reader
description: Use when reading or validating an Agent3 RootCauseBlueprint before Agent4 planning.
---

# RootCauseBlueprint Reader

Use this skill before patch planning.

## Inputs

- A JSON object or file path for `RootCauseBlueprint`.
- Schema: `schemas/root-cause-blueprint.schema.json`.

## Procedure

1. Validate the JSON:

   ```bash
   node tools/ysclaw-agent4-tools.js validate root-cause-blueprint path/to/blueprint.json
   ```

2. Extract:
   - `blueprintId`
   - problem summary and evidence
   - root cause summary
   - candidate files
   - risk level and preservation constraints
   - required tests and Agent1 regression command

3. Reject or ask for clarification if the blueprint lacks candidate files, root cause evidence, or validation requirements.

## Output

Provide a concise normalized reading:

```json
{
  "blueprintId": "bp-example",
  "candidateFiles": ["src/example.c"],
  "rootCauseSummary": "Loop invariant work is repeated in a hot path.",
  "riskLevel": "medium",
  "requiredTests": ["case-1"],
  "regressionCommand": "agent1 patch_regression --case case-1"
}
```
