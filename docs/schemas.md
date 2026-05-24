# Agent4 结构约束

结构约束文件位于 `schemas/`，刻意保持较小规模，方便 Agent 工作时检查。

## RootCauseBlueprint

文件：`schemas/root-cause-blueprint.schema.json`

由 Agent3 生成。包含：

- 根因蓝图标识
- 来源元数据
- 问题摘要和证据
- 根因摘要
- 候选文件
- 保持不变的约束
- 必需回归测试

## PatchPlan

文件：`schemas/patch-plan.schema.json`

由 Agent4 在编辑代码前生成。包含：

- 补丁计划标识
- 来源根因蓝图标识
- 目标
- 一个或多个计划变更
- 验证命令
- 预期差异摘要

验证命令被限制为 `agent1 patch_regression` 加简单参数令牌。命令串联、重定向、命令替换和任意命令都是非法的。

## PatchCandidate

文件：`schemas/patch-candidate.schema.json`

代码修改后生成。包含：

- 候选补丁标识
- 补丁计划标识
- 已修改文件
- 完整 git 差异
- 构建模式调用记录

## PatchRegressionResult

文件：`schemas/patch-regression-result.schema.json`

通过运行或归一化 Agent1 `patch_regression` 生成。包含：

- 回归标识
- 候选补丁标识
- 通过 / 失败 / 错误状态
- 命令
- 测试级结果
- 产物
- 摘要

## VerifiedPatchPackage

文件：`schemas/verified-patch-package.schema.json`

Agent4 给 Agent5 的最终输出。包含：

- 所有上游标识
- 根因和补丁摘要
- 嵌入的根因蓝图、计划、候选补丁和回归结果
- 验证状态
- Agent5 交接说明

补丁包结构约束要求每个嵌入的上游产物都带有预期结构版本和标识字段。补丁包编写器在输出最终 JSON 前，也会校验每个上游结构约束并强制标识一致。

## 校验

```bash
node tools/ysclaw-agent4-tools.js validate root-cause-blueprint path/to/blueprint.json
node tools/ysclaw-agent4-tools.js validate patch-plan path/to/patch-plan.json
node tools/ysclaw-agent4-tools.js validate patch-candidate path/to/patch-candidate.json
node tools/ysclaw-agent4-tools.js validate patch-regression-result path/to/regression.json
node tools/ysclaw-agent4-tools.js validate verified-patch-package path/to/package.json
```
