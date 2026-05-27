---
name: openspec-propose
description: 创建一个 OpenSpec change，并按当前 schema 生成 proposal、design、tasks 等 apply-ready 产物。
license: MIT
compatibility: Bundled with opencode-agent4; requires the bundled openspec CLI.
metadata:
  author: openspec-compatible
  generatedBy: opencode-agent4
---

# OpenSpec Propose

根据用户描述创建 OpenSpec change，并生成进入实现前需要的规格产物。

## 步骤

1. 确认 change 名称。没有名称时，从用户描述生成 kebab-case 名称；仍不清楚时先询问。
2. 初始化 OpenSpec 项目（如果还没有 `openspec/config.yaml`）：

```bash
openspec init --tools opencode --force .
```

3. 创建 change：

```bash
openspec new change "<name>"
```

4. 读取 artifact 状态和写作指令：

```bash
openspec status --change "<name>" --json
openspec instructions proposal --change "<name>" --json
openspec instructions design --change "<name>" --json
openspec instructions tasks --change "<name>" --json
```

5. 按 CLI 返回的 `outputPath`、`template`、`rules` 和已完成依赖生成文件。不要把 CLI 的内部规则原样复制进产物。
6. 反复运行状态检查，直到 `applyRequires` 中的 artifact 都为 `done`：

```bash
openspec status --change "<name>" --json
```

## 完成标准

- `openspec/changes/<name>/.openspec.yaml` 存在。
- `proposal.md`、`design.md`、`tasks.md` 已生成且内容非空。
- `openspec status --change "<name>" --json` 显示实现前必需 artifact 已完成。
