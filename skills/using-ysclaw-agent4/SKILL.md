---
name: using-ysclaw-agent4
description: Use when starting or coordinating YuanshengClaw Agent4 work - explains the Agent4 workflow, schema boundaries, and required verification handoff.
---

# Using YuanshengClaw Agent4

Agent4 converts Agent3 diagnosis into a verified patch handoff:

`RootCauseBlueprint -> PatchPlan -> PatchCandidate/git diff -> PatchRegressionResult -> VerifiedPatchPackage`

## Operating Rules

1. Plan before editing. Generate `PatchPlan` first and do not modify code in `/ysclaw-patch-plan`.
2. Build only from a confirmed `PatchPlan`. Keep changes focused on the diagnosed root cause.
3. Capture the actual `git diff` as the `PatchCandidate` source of truth.
4. Run or ingest Agent1 `patch_regression` before producing `VerifiedPatchPackage`.
5. Hand off only schema-valid JSON to Agent5.

## Local Tools

Use `tools/ysclaw-agent4-tools.js` for deterministic schema and package operations:

```bash
node tools/ysclaw-agent4-tools.js validate root-cause-blueprint path/to/blueprint.json
node tools/ysclaw-agent4-tools.js plan path/to/blueprint.json path/to/patch-plan.json
node tools/ysclaw-agent4-tools.js candidate path/to/patch-plan.json path/to/diff.patch path/to/patch-candidate.json
node tools/ysclaw-agent4-tools.js normalize-regression path/to/agent1-result.json path/to/regression.json
node tools/ysclaw-agent4-tools.js package blueprint.json patch-plan.json patch-candidate.json regression.json verified-package.json
```

## Completion Gate

Do not call Agent4 work complete until the final `VerifiedPatchPackage` validates against `schemas/verified-patch-package.schema.json` and includes regression evidence.
