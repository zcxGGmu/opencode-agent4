# /ysclaw-patch-plan

根据已校验的 Agent3 `RootCauseBlueprint` 生成 `PatchPlan`。

这是 `/comet` 生命周期内的结构化产物能力节点。单独调用只用于开发/诊断 `PatchPlan` 能力，不代表 Agent4 生命周期已完成。

## 契约

- 只读。
- 校验 `RootCauseBlueprint`。
- 使用 `ysclaw-root-cause-blueprint-reader`。
- 使用 `ysclaw-patch-plan-writer`。
- 输出匹配 `schemas/patch-plan.schema.json` 的 JSON。
- 不修改代码，也不生成 git 差异。

## 推荐提示词

```text
读取这个 RootCauseBlueprint，校验它，并生成符合结构约束的 PatchPlan。不要修改代码。
```
