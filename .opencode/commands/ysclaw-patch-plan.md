# /ysclaw-patch-plan

Generate a `PatchPlan` from a validated Agent3 `RootCauseBlueprint`.

## Contract

- Read-only.
- Validate `RootCauseBlueprint`.
- Use `ysclaw-root-cause-blueprint-reader`.
- Use `ysclaw-patch-plan-writer`.
- Output JSON matching `schemas/patch-plan.schema.json`.
- Do not edit code and do not produce a git diff.

## Suggested Prompt

```text
Read this RootCauseBlueprint, validate it, and produce a schema-valid PatchPlan. Do not edit code.
```
