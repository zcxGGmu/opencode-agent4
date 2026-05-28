# Agent4 设计

Agent4 实现源生 Claw 一阶段工作流的中间环节。

## 流水线位置

```text
Agent3 根因诊断
  RootCauseBlueprint
      |
      v
Agent4 补丁工作流
  PatchPlan
  PatchCandidate
  PatchRegressionResult
  VerifiedPatchPackage
      |
      v
Agent5 提交流程
```

## 设计原则

1. 诊断和代码修改分离。
2. 补丁计划阶段只读。
3. 代码修改必须基于已确认的计划。
4. Git 差异是候选补丁的事实来源。
5. 回归证据是交接的一部分，不是事后补充。
6. 合法 JSON 结构约束是 Agent 之间的契约。
7. 回归命令失败关闭，并限制为 `agent1 patch_regression`。

## 主要命令

`/ysclaw-agent4`:

- 输入：`RootCauseBlueprint` 或当前 active change
- 输出：完整 Agent4 生命周期产物，最终为 `VerifiedPatchPackage`
- 行为：推荐主入口，委托 Comet / OpenSpec + Superpowers 完成设计、计划、构建、验证和交接

`/ysclaw-patch-plan`:

- 输入：`RootCauseBlueprint`
- 输出：`PatchPlan`
- 行为：只读

`/ysclaw-build-patch`:

- 输入：已确认的 `PatchPlan`
- 输出：`VerifiedPatchPackage`
- 行为：构建补丁、捕获差异、运行或导入回归结果、打包证据

## 完成标准

只有满足以下条件，Agent4 工作才算完成：

- `RootCauseBlueprint` 校验通过。
- `PatchPlan` 校验通过。
- `PatchCandidate` 包含真实 git 差异。
- `PatchRegressionResult` 反映 Agent1 回归证据。
- `VerifiedPatchPackage` 校验通过，可以交给 Agent5。
- 嵌入的根因蓝图、计划、候选补丁和回归标识一致。
