---
name: ysclaw-regression-verifier
description: Use after a PatchCandidate exists to run or normalize Agent1 patch_regression evidence.
---

# Regression Verifier

Use this skill after code has changed and a `PatchCandidate` exists.

## Inputs

- `PatchPlan`
- `PatchCandidate`
- Agent1 `patch_regression` command or raw result

## Procedure

1. Prefer running the exact command in `patchPlan.validationPlan.commands`.
   The command must match the Agent4 whitelist: `agent1 patch_regression` followed only by simple argument tokens.
2. If Agent1 is unavailable, ingest a saved Agent1 result and record that source explicitly in the summary.
3. Normalize the result:

   ```bash
   node tools/ysclaw-agent4-tools.js normalize-regression agent1-result.json patch-regression-result.json
   ```

4. Validate:

   ```bash
   node tools/ysclaw-agent4-tools.js validate patch-regression-result patch-regression-result.json
   ```

## Output

Return a `PatchRegressionResult` object. A failed or errored regression must not be hidden; Agent4 can still package it, but verification status will be `failed`.

Reject shell metacharacters, command chaining, redirects, command substitutions, or any command that does not start with `agent1 patch_regression`.
