---
name: ysclaw-patch-plan-writer
description: 从已校验的 RootCauseBlueprint 创建 PatchPlan 时使用；此技能不得修改代码。
---

# PatchPlan 编写器

在不修改仓库代码的前提下创建符合结构约束的 `PatchPlan`。

## 输入

- 合法的 `RootCauseBlueprint`。
- 可选的共享经验中心历史优化记录。

## 流程

1. 确认根因蓝图合法。
2. 为每个候选文件创建一个聚焦的变更项。
3. 说明最小预期修改、风险和精确验证命令。
   验证命令只能使用白名单形式 `agent1 patch_regression`。
4. 校验输出：

   ```bash
   node tools/ysclaw-agent4-tools.js validate patch-plan path/to/patch-plan.json
   ```

## 输出契约

返回匹配 `schemas/patch-plan.schema.json` 的 JSON 对象。

不要在计划中包含实现差异。差异属于 `PatchCandidate`。

不要虚构 `UNKNOWN` 等兜底文件；如果根因蓝图不完整，应拒绝并要求修正 Agent3 输出。
