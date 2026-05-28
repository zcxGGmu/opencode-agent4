# /ysclaw-agent4

Agent4 推荐主入口。它委托 `comet` skill，按 OpenSpec + Superpowers 编排完整的补丁研发、验证和交接生命周期。

## 契约

- 从 Agent3 `RootCauseBlueprint` 开始。
- 先建立或恢复 OpenSpec change，再进入设计、计划、构建、验证和归档。
- 在 build、verify、archive 阶段保持结构化产物链：`PatchPlan`、`PatchCandidate`、`PatchRegressionResult` 和 `VerifiedPatchPackage`。
- `/comet` 保留为同一生命周期编排能力的兼容入口。
- `/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 仍只是生命周期内的结构化产物能力节点，不能替代主流程闭环。

## 推荐提示词

```text
/ysclaw-agent4 根据这个 RootCauseBlueprint 完成 Agent4 补丁研发、验证和交接。
```
