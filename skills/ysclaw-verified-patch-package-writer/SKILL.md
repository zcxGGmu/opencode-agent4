---
name: ysclaw-verified-patch-package-writer
description: Use when combining blueprint, plan, diff candidate, and regression evidence into VerifiedPatchPackage for Agent5.
---

# VerifiedPatchPackage Writer

Use this skill as the final Agent4 handoff step.

## Inputs

- Valid `RootCauseBlueprint`
- Valid `PatchPlan`
- Valid `PatchCandidate`
- Valid `PatchRegressionResult`

## Procedure

1. Confirm all four inputs validate against their schemas.
2. Confirm ID consistency:
   - `patchPlan.blueprintId` equals `blueprint.blueprintId`
   - `patchCandidate.patchPlanId` equals `patchPlan.patchPlanId`
   - packaged `regressionResult.patchCandidateId` equals `patchCandidate.patchCandidateId`
3. Create the package:

   ```bash
   node tools/ysclaw-agent4-tools.js package blueprint.json patch-plan.json patch-candidate.json regression.json verified-package.json
   ```

4. Validate the final package:

   ```bash
   node tools/ysclaw-agent4-tools.js validate verified-patch-package verified-package.json
   ```

5. Hand the package to Agent5 without changing patch content.

## Output

Return a `VerifiedPatchPackage` object. It must include:

- root cause summary
- patch summary
- git diff through `patchCandidate.gitDiff`
- regression command and result
- handoff instructions for Agent5
