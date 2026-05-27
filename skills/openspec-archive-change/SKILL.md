---
name: openspec-archive-change
description: 归档已完成的 OpenSpec change。Agent4 生产路径优先使用 /comet-archive。
license: MIT
compatibility: Bundled with opencode-agent4; requires the bundled openspec CLI.
metadata:
  author: openspec-compatible
  generatedBy: opencode-agent4
---

# OpenSpec Archive Change

归档 OpenSpec change，并在存在 delta specs 时让 OpenSpec CLI 负责安全合并。对于 `opencode-agent4` 生产路径，优先使用 `/comet-archive`，因为它还会生成 `VerifiedPatchPackage`。

## 步骤

1. 确认 change 名称。
2. 检查状态和严格校验：

```bash
openspec status --change "<name>" --json
openspec validate "<name>" --type change --strict --json --no-interactive
```

3. 执行归档：

```bash
openspec archive "<name>" --yes
```

4. 确认 change 已移动到 `openspec/changes/archive/`。

## Agent4 约束

在 `/comet` 生命周期中，不得用本 skill 替代 `/comet-archive` 的 Agent4 交接步骤；必须先生成并校验 `VerifiedPatchPackage`。
