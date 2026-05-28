# 面向 OpenCode 的源生 Claw Agent4

本包参考 `superpowers` 的当前 OpenCode 插件模式：

- `package.json` 通过 `main` 指向 `.opencode/plugins/ysclaw-agent4.js`。
- 插件通过 `config.skills.paths` 注册顶层 `skills/` 目录。
- 插件将缓存后的 Agent4、Comet 与 Superpowers 启动指引注入第一条用户消息。
- 如果宿主配置尚未定义，插件会补齐 Agent4 智能体和命令默认配置。
- 插件通过 `shell.env` 把本包的 `node_modules/.bin` 注入 OpenCode shell PATH，使随包安装的 `openspec` CLI 可直接调用。
- Superpowers 方法论 skills 已合并到顶层 `skills/`，不需要额外 symlink。

## 安装

本地检出：

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

基于 Git 的安装：

```json
{
  "plugin": ["ysclaw-agent4@git+https://example.com/ysclaw-agent4.git"]
}
```

修改 `opencode.json` 后重启 OpenCode。

OpenSpec CLI 由本包的 `@fission-ai/openspec` 运行时依赖提供。使用本地源码路径时，如果 OpenCode 找不到 `openspec`，在插件仓库运行：

```bash
npm install
```

然后重启 OpenCode。OpenSpec CLI 要求 Node `>=20.19.0`。

## 技能

OpenCode 应能发现这些技能：

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

完整 Superpowers OpenCode 说明见 `docs/README.superpowers.opencode.md`。

## Agent4 主入口

`/ysclaw-agent4` 是 `opencode-agent4` 的推荐主工作流入口。它委托 `comet` skill 驱动 Agent4 的完整研发生命周期。`/comet` 保留为同一生命周期编排能力的兼容入口。`/ysclaw-patch-plan` 和 `/ysclaw-build-patch` 是其中的结构化产物能力节点，用于约束 `PatchPlan`、`PatchCandidate`、`PatchRegressionResult` 和 `VerifiedPatchPackage`。

## 命令

插件会注册以下命令模板：

- `ysclaw-agent4`：推荐主入口，委托 `comet` skill 编排 Agent4 完整生命周期。
- `comet`：兼容入口，负责按 OpenSpec + Superpowers 编排 Agent4 完整研发生命周期。
- `comet-open`、`comet-design`、`comet-build`、`comet-verify`、`comet-archive`：Comet 阶段命令。
- `comet-hotfix`、`comet-tweak`：Comet 预设路径。
- `ysclaw-patch-plan`：校验 RootCauseBlueprint，在不修改代码的前提下生成 PatchPlan。
- `ysclaw-build-patch`：根据已确认的 PatchPlan 构建补丁，收集回归证据，并生成 VerifiedPatchPackage。

Markdown 形式的命令说明也保存在 `.opencode/commands/`。

## 智能体配置

默认智能体 id 是 `ysclaw-agent4-patch`。它被配置为带受限权限的主智能体：

- 允许读取、列出、搜索和通配匹配。
- 编辑需要询问。
- 允许 `git` 和 `node`。
- `npm`、`agent1`、任务委派和外部目录访问需要询问。
- 默认禁止网页获取和搜索。

## 排障

如果技能缺失：

1. 确认 `opencode.json` 中的插件路径。
2. 重启 OpenCode。
3. 在本仓库运行 `npm test`。
4. 检查 OpenCode 日志中的插件加载错误。
