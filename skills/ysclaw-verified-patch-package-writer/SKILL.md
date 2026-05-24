---
name: ysclaw-verified-patch-package-writer
description: 将根因蓝图、计划、候选补丁差异和回归证据组合为 Agent5 使用的 VerifiedPatchPackage 时使用。
---

# VerifiedPatchPackage 编写器

将此 skill 作为 Agent4 最终交接步骤使用。

## 输入

- 合法的 `RootCauseBlueprint`
- 合法的 `PatchPlan`
- 合法的 `PatchCandidate`
- 合法的 `PatchRegressionResult`

## 流程

1. 确认四个输入都通过各自结构约束校验。
2. 确认 ID 一致性：
   - `patchPlan.blueprintId` 等于 `blueprint.blueprintId`
   - `patchCandidate.patchPlanId` 等于 `patchPlan.patchPlanId`
   - 打包后的 `regressionResult.patchCandidateId` 等于 `patchCandidate.patchCandidateId`
3. 创建补丁包：

   ```bash
   node tools/ysclaw-agent4-tools.js package blueprint.json patch-plan.json patch-candidate.json regression.json verified-package.json
   ```

4. 校验最终补丁包：

   ```bash
   node tools/ysclaw-agent4-tools.js validate verified-patch-package verified-package.json
   ```

5. 在不修改补丁内容的前提下，将补丁包交给 Agent5。

## 输出

返回 `VerifiedPatchPackage` 对象。它必须包含：

- 根因摘要
- 补丁摘要
- 通过 `patchCandidate.gitDiff` 保存的 git 差异
- 回归命令和结果
- 给 Agent5 的交接说明
