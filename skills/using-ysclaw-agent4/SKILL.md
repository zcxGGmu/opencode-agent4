---
name: using-ysclaw-agent4
description: 在启动或协调源生 Claw Agent4 工作时使用，说明 Agent4 工作流、结构约束边界和必需的验证交接。
---

# 使用源生 Claw Agent4

Agent4 将 Agent3 的诊断结果转换为已验证的补丁交付物：

`RootCauseBlueprint -> PatchPlan -> PatchCandidate / git 差异 -> PatchRegressionResult -> VerifiedPatchPackage`

## 操作规则

1. 先计划，后编辑。先生成 `PatchPlan`，并且在 `/ysclaw-patch-plan` 中不得修改代码。
2. 只能基于已确认的 `PatchPlan` 构建补丁。修改必须聚焦已诊断的根因。
3. 将真实 Git 差异（`git diff` 输出）作为 `PatchCandidate` 的事实来源。
4. 生成 `VerifiedPatchPackage` 前，必须运行或导入 Agent1 `patch_regression`。
5. 只能把符合结构约束的 JSON 交给 Agent5。

## 本地工具

使用 `tools/ysclaw-agent4-tools.js` 执行确定性的结构约束和补丁包操作：

```bash
node tools/ysclaw-agent4-tools.js validate root-cause-blueprint path/to/blueprint.json
node tools/ysclaw-agent4-tools.js plan path/to/blueprint.json path/to/patch-plan.json
node tools/ysclaw-agent4-tools.js candidate path/to/patch-plan.json path/to/diff.patch path/to/patch-candidate.json
node tools/ysclaw-agent4-tools.js normalize-regression path/to/agent1-result.json path/to/regression.json
node tools/ysclaw-agent4-tools.js package blueprint.json patch-plan.json patch-candidate.json regression.json verified-package.json
```

## 完成门禁

只有最终 `VerifiedPatchPackage` 通过 `schemas/verified-patch-package.schema.json` 校验并包含回归证据后，才能声明 Agent4 工作完成。
