# Agent4 Design

Agent4 implements the middle stage of the YuanshengClaw first-phase workflow.

## Position In The Pipeline

```text
Agent3 diagnosis
  RootCauseBlueprint
      |
      v
Agent4 patch workflow
  PatchPlan
  PatchCandidate
  PatchRegressionResult
  VerifiedPatchPackage
      |
      v
Agent5 submission workflow
```

## Design Principles

1. Diagnosis and code modification are separated.
2. Patch planning is read-only.
3. Code changes require a confirmed plan.
4. Git diff is the patch candidate source of truth.
5. Regression evidence is part of the handoff, not an afterthought.
6. Schema-valid JSON is the contract between agents.
7. Regression commands are fail-closed and limited to `agent1 patch_regression`.

## Main Commands

`/ysclaw-patch-plan`:

- input: `RootCauseBlueprint`
- output: `PatchPlan`
- behavior: read-only

`/ysclaw-build-patch`:

- input: confirmed `PatchPlan`
- output: `VerifiedPatchPackage`
- behavior: build patch, capture diff, run or ingest regression, package evidence

## Completion Criteria

Agent4 work is complete only when:

- `RootCauseBlueprint` validates.
- `PatchPlan` validates.
- `PatchCandidate` contains the actual git diff.
- `PatchRegressionResult` reflects Agent1 regression evidence.
- `VerifiedPatchPackage` validates and is ready for Agent5.
- embedded blueprint, plan, candidate, and regression ids are consistent.
