---
name: openspec-apply-change
description: 根据 OpenSpec change 的 tasks 执行实现。通常由通用 OpenSpec 流程使用；Agent4 生产路径优先使用 /comet-build。
license: MIT
compatibility: Bundled with opencode-agent4; requires the bundled openspec CLI.
metadata:
  author: openspec-compatible
  generatedBy: opencode-agent4
---

# OpenSpec Apply Change

根据 OpenSpec change 的任务清单执行实现。对于 `opencode-agent4` 的生产路径，优先让 `/comet-build` 统筹 Agent4 产物链；本 skill 主要用于 OpenSpec 原生工作流兼容。

## 步骤

1. 确认 change 名称。没有名称且有多个 active change 时，询问用户。
2. 获取实现指令：

```bash
openspec status --change "<name>" --json
openspec instructions apply --change "<name>" --json
```

3. 读取 CLI 返回的 `contextFiles`。
4. 按 pending tasks 逐项实现、验证并把对应 `- [ ]` 勾选为 `- [x]`。
5. 实现中如发现规格或设计问题，停止并回到 proposal/design/spec 更新，不要硬推。

## Agent4 约束

在 `/comet` 生命周期内使用时，不得绕过 `PatchPlan -> PatchCandidate -> PatchRegressionResult -> VerifiedPatchPackage` 产物链。
