---
name: ysclaw-regression-verifier
description: 在 PatchCandidate 已存在后，用于运行或归一化 Agent1 patch_regression 证据。
---

# 回归验证器

在代码已变更且 `PatchCandidate` 已存在后使用此 skill。

## 输入

- `PatchPlan`
- `PatchCandidate`
- Agent1 `patch_regression` 命令或原始结果

## 流程

1. 优先运行 `patchPlan.validationPlan.commands` 中的精确命令。
   命令必须匹配 Agent4 白名单：`agent1 patch_regression` 后只能跟简单参数令牌。
2. 如果 Agent1 不可用，则导入已保存的 Agent1 结果，并在摘要中明确记录来源。
3. 归一化结果：

   ```bash
   node tools/ysclaw-agent4-tools.js normalize-regression agent1-result.json patch-regression-result.json
   ```

4. 校验：

   ```bash
   node tools/ysclaw-agent4-tools.js validate patch-regression-result patch-regression-result.json
   ```

## 输出

返回 `PatchRegressionResult` 对象。失败或错误的回归结果不能被隐藏；Agent4 仍可打包它，但验证状态必须是失败。

拒绝命令行元字符、命令串联、重定向、命令替换，以及任何不是以 `agent1 patch_regression` 开头的命令。
