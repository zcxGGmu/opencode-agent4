# /ysclaw-agent4

Agent4 推荐主入口。它委托 `comet` skill，按 OpenSpec + Superpowers 编排完整的补丁研发、验证和交接生命周期。

## 契约

- 必须使用 `comet` 工作流；如果 native skill 列表没有显示 `comet`，不要直接回答“当前环境中没有 comet skill”后停止。
- 先确认插件是否已启用并重启过 OpenCode；然后检查当前项目或插件安装目录是否存在 `skills/comet/SKILL.md`。存在时读取该文件并继续执行 Comet 决策核心。
- 只有插件未启用、重启后仍未注册 `skills/`，并且找不到 `skills/comet/SKILL.md` 时，才报告安装不完整。
- 从 Agent3 `RootCauseBlueprint` 开始。
- 先建立或恢复 OpenSpec change，再进入设计、计划、构建、验证和归档。
- 在 build、verify、archive 阶段保持结构化产物链：`PatchPlan`、`PatchCandidate`、`PatchRegressionResult` 和 `VerifiedPatchPackage`。
- `/comet` 保留为同一生命周期编排能力的兼容入口。
- `/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 仍只是生命周期内的结构化产物能力节点，不能替代主流程闭环。

## 推荐提示词

```text
/ysclaw-agent4 根据这个 RootCauseBlueprint 完成 Agent4 补丁研发、验证和交接。
```
