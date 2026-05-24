# Agent1 Patch Regression Integration

Agent4 expects Agent1 regression evidence before handoff to Agent5.

## Expected Command

The preferred command comes from `patchPlan.validationPlan.commands`.
Agent4 only accepts commands beginning with `agent1 patch_regression` followed by simple argument tokens.

Example:

```bash
agent1 patch_regression --case matmul-1024
```

## Expected Result Shape

Agent4 accepts a raw Agent1 result that can be normalized into:

```json
{
  "schemaVersion": "ysclaw.patch_regression_result.v1",
  "regressionId": "reg-example",
  "patchCandidateId": "pc-example",
  "status": "pass",
  "command": "agent1 patch_regression --case matmul-1024",
  "tests": [
    {
      "name": "matmul-1024",
      "status": "pass",
      "durationMs": 1240,
      "output": "runtime improved by 12%"
    }
  ],
  "artifacts": ["reports/matmul-1024.json"],
  "summary": "Regression passed and target testcase improved."
}
```

## Normalize

```bash
node tools/ysclaw-agent4-tools.js normalize-regression agent1-result.json patch-regression-result.json
```

Commands containing shell metacharacters such as `;`, `&&`, `|`, `>`, `$()`, or backticks are rejected before packaging.

## Verification Semantics

- `status: pass` produces `verification.status: verified`.
- `status: fail` or `status: error` produces `verification.status: failed`.
- Failed packages may still be useful for debugging, but Agent5 should not submit them as verified fixes.
