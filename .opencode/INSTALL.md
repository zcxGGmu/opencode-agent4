# 为 OpenCode 安装源生 Claw Agent4

在全局或项目级 `opencode.json` 的 `plugin` 数组中加入本包。

本地检出示例：

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

如果使用基于 Git 的安装，将路径替换为仓库 URL：

```json
{
  "plugin": ["ysclaw-agent4@git+https://example.com/ysclaw-agent4.git"]
}
```

更新配置后重启 OpenCode。

## 验证

让 OpenCode 列出技能，并确认以下名称存在：

- `using-ysclaw-agent4`
- `ysclaw-root-cause-blueprint-reader`
- `ysclaw-patch-plan-writer`
- `ysclaw-regression-verifier`
- `ysclaw-verified-patch-package-writer`
- `using-superpowers`
- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `writing-plans`
- `writing-skills`
- `subagent-driven-development`
- `using-git-worktrees`
- `test-driven-development`
- `systematic-debugging`
- `verification-before-completion`
- `requesting-code-review`
- `receiving-code-review`
- `finishing-a-development-branch`
- `comet`
- `comet-open`
- `comet-design`
- `comet-build`
- `comet-verify`
- `comet-archive`
- `comet-hotfix`
- `comet-tweak`
- `openspec-explore`
- `openspec-propose`
- `openspec-new-change`
- `openspec-apply-change`
- `openspec-verify-change`
- `openspec-archive-change`

Superpowers 的 OpenCode 说明见 `docs/README.superpowers.opencode.md`。本包已将这些 skills 合并到同一个 `skills/` 目录，不需要额外配置 symlink。

Comet 的 OpenCode 说明见 `docs/README.comet.opencode.md`。`/comet` 是 `opencode-agent4` 的核心工作流入口；`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是其中的结构化产物能力节点。OpenSpec CLI 和 OpenSpec skills 随本包安装；如果使用本地源码路径且 OpenCode 找不到 `openspec`，在本仓库运行 `npm install` 后重启 OpenCode。

运行本地检查：

```bash
npm test
```
