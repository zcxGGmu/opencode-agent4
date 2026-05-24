# /ysclaw-build-patch

Build a patch candidate from a confirmed `PatchPlan`, run or ingest Agent1 regression evidence, and produce `VerifiedPatchPackage`.

## Contract

- Confirm the `PatchPlan` first.
- Modify code only for the planned root-cause fix.
- Capture `git diff` into `PatchCandidate`.
- Run or ingest Agent1 `patch_regression`.
- Normalize regression output to `PatchRegressionResult`.
- Output JSON matching `schemas/verified-patch-package.schema.json`.

## Suggested Prompt

```text
Use this confirmed PatchPlan to build the minimal patch, capture the diff, run Agent1 patch_regression, and produce VerifiedPatchPackage for Agent5.
```
