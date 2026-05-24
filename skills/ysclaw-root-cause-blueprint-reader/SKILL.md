---
name: ysclaw-root-cause-blueprint-reader
description: 在 Agent4 规划前读取或校验 Agent3 RootCauseBlueprint 时使用。
---

# RootCauseBlueprint 读取器

在补丁规划前使用此 skill。

## 输入

- `RootCauseBlueprint` JSON 对象或文件路径。
- 结构约束：`schemas/root-cause-blueprint.schema.json`。

## 流程

1. 校验 JSON：

   ```bash
   node tools/ysclaw-agent4-tools.js validate root-cause-blueprint path/to/blueprint.json
   ```

2. 提取：
   - `blueprintId`
   - 问题摘要和证据
   - 根因摘要
   - 候选文件
   - 风险等级和保持不变的约束
   - 必需测试和 Agent1 回归命令

3. 如果根因蓝图缺少候选文件、根因证据或验证要求，则拒绝处理或要求补充说明。

## 输出

提供简洁的归一化解读：

```json
{
  "blueprintId": "bp-example",
  "candidateFiles": ["src/example.c"],
  "rootCauseSummary": "热点路径中重复执行循环不变量工作。",
  "riskLevel": "medium",
  "requiredTests": ["case-1"],
  "regressionCommand": "agent1 patch_regression --case case-1"
}
```
