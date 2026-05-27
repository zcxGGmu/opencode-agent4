---
name: openspec-explore
description: OpenSpec 探索模式。用于在创建 change 前澄清想法、调查问题和收敛需求；只读探索，不实现代码。
license: MIT
compatibility: Bundled with opencode-agent4; uses the bundled openspec CLI when project status is needed.
metadata:
  author: openspec-compatible
  generatedBy: opencode-agent4
---

# OpenSpec Explore

进入探索模式，帮助用户澄清要解决的问题、当前代码事实、可选方案和风险。探索阶段可以读文件、搜索代码、画简单结构图或列出取舍，但不得修改代码。

## 规则

1. 如项目尚未初始化 OpenSpec，提示运行：

```bash
openspec init --tools opencode --force .
```

2. 如需要查看已有 change 或 spec，使用：

```bash
openspec list --json
openspec list --specs --json
```

3. 输出应收敛到可创建 change 的信息：问题、目标、范围、非目标、已知风险和建议的 change 名。
4. 用户准备进入创建阶段时，转入 `openspec-new-change` 或 `openspec-propose`。
