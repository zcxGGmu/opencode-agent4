# Agent4 Schemas

Schemas live in `schemas/` and are intentionally small enough to inspect during agent work.

## RootCauseBlueprint

File: `schemas/root-cause-blueprint.schema.json`

Produced by Agent3. Contains:

- blueprint id
- source metadata
- problem summary and evidence
- root cause summary
- candidate files
- preservation constraints
- required regression tests

## PatchPlan

File: `schemas/patch-plan.schema.json`

Produced by Agent4 before editing code. Contains:

- patch plan id
- source blueprint id
- objective
- one or more planned changes
- validation commands
- expected diff summary

Validation commands are constrained to `agent1 patch_regression` plus simple argument tokens. Shell chaining, redirects, command substitutions, and arbitrary commands are invalid.

## PatchCandidate

File: `schemas/patch-candidate.schema.json`

Produced after code changes. Contains:

- patch candidate id
- patch plan id
- changed files
- full git diff
- build-mode invocation notes

## PatchRegressionResult

File: `schemas/patch-regression-result.schema.json`

Produced by running or normalizing Agent1 `patch_regression`. Contains:

- regression id
- patch candidate id
- pass/fail/error status
- command
- test-level results
- artifacts
- summary

## VerifiedPatchPackage

File: `schemas/verified-patch-package.schema.json`

Final Agent4 output for Agent5. Contains:

- all upstream ids
- root cause and patch summaries
- embedded blueprint, plan, candidate, and regression result
- verification status
- Agent5 handoff instructions

The package schema requires each embedded upstream artifact to carry its expected schema marker and id fields. The package writer also validates each upstream schema and enforces id consistency before emitting the final JSON.

## Validate

```bash
node tools/ysclaw-agent4-tools.js validate root-cause-blueprint path/to/blueprint.json
node tools/ysclaw-agent4-tools.js validate patch-plan path/to/patch-plan.json
node tools/ysclaw-agent4-tools.js validate patch-candidate path/to/patch-candidate.json
node tools/ysclaw-agent4-tools.js validate patch-regression-result path/to/regression.json
node tools/ysclaw-agent4-tools.js validate verified-patch-package path/to/package.json
```
