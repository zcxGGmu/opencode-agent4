---
name: openspec-new-change
description: Comet 兼容入口：创建新的 OpenSpec change 结构，并生成 proposal、design、tasks。适用于 /comet-open、/comet-hotfix 和 /comet-tweak。
license: MIT
compatibility: Bundled with opencode-agent4; requires the bundled openspec CLI.
metadata:
  author: openspec-compatible
  generatedBy: opencode-agent4
---

# OpenSpec New Change

这是 `opencode-agent4` 为 Comet 提供的兼容 skill。当前 OpenSpec CLI 的 OpenCode 生成物使用 `openspec-propose`，而 Comet 阶段文档使用 `openspec-new-change`；本 skill 保持该名称可用。

## 步骤

1. 确认 change 名称和意图。名称必须是 kebab-case。
2. 若当前项目尚未初始化 OpenSpec，执行：

```bash
openspec init --tools opencode --force .
```

3. 创建 change 目录：

```bash
openspec new change "<name>"
```

4. 用 OpenSpec 指令生成 `proposal.md`、`design.md` 和 `tasks.md`：

```bash
openspec instructions proposal --change "<name>" --json
openspec instructions design --change "<name>" --json
openspec instructions tasks --change "<name>" --json
```

5. 写入对应 artifact 后检查：

```bash
openspec status --change "<name>" --json
```

## Comet 集成要求

- 不创建 `.comet.yaml`；该文件由 `comet-state.sh init <name> <workflow>` 负责。
- 不实现代码。
- hotfix/tweak 可以生成精简内容，但文件必须存在且非空。
