---
name: openspec-verify-change
description: Comet 兼容入口：验证 OpenSpec change 的 artifacts、tasks 和 delta specs。用于 /comet-verify 的完整验证路径。
license: MIT
compatibility: Bundled with opencode-agent4; requires the bundled openspec CLI.
metadata:
  author: openspec-compatible
  generatedBy: opencode-agent4
---

# OpenSpec Verify Change

验证当前 change 是否满足 OpenSpec 产物和规格要求。这个 skill 是 Comet 对 `openspec-verify-change` 名称的兼容入口。

## 步骤

1. 确认 change 名称。
2. 查看 artifact 完成状态：

```bash
openspec status --change "<name>" --json
```

3. 严格校验 change：

```bash
openspec validate "<name>" --type change --strict --json --no-interactive
```

4. 检查 `tasks.md` 是否全部完成。
5. 如存在 delta spec，确认它们与 `proposal.md`、`design.md` 和实现一致。
6. 将验证结果反馈给 `comet-verify`；不直接归档。

## 不通过时

列出缺失 artifact、未完成任务、spec 校验错误或设计漂移。Comet 应记录失败并回到 `/comet-build` 修复。
